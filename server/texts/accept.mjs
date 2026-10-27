// Stores an answer's passing texts (FR-216, FR-217, FR-206): texts with their kind, lines, questions
// and sentences; new words and phrases as leaves with a meaning (the AI's, else the word list's,
// FR-207); plausible inflections; uses of known words. The caller runs it inside its transaction.
import { transaction } from '../store/db.mjs';
import { tokenize } from '../words/tokens.mjs';
import { applyExplanations, applyFixes } from '../reading/flags.mjs';
import { meaning as dictionaryMeaning } from '../lexicon/lexicon.mjs';
import { fillExamples } from '../words/examples.mjs';

// The new words of one checked text that have neither the AI's meaning nor a dictionary one (RQ-397).
export function missingMeanings(answer, checkedText) {
  const ai = new Set(answer.new_words.flatMap((w) => [w.form.toLowerCase(), w.lemma.toLowerCase()]));
  return checkedText.newItems
    .filter((i) => i.kind === 'word' && !ai.has(i.text) && !dictionaryMeaning(i.text))
    .map((i) => i.text);
}

// `indexes`: which of the answer's texts to store (default all). Returns the stored texts and the
// lemmas added as leaves.
export function acceptAnswer({ db, words, accountId, exchange, answer, check, topic, now, counter, indexes }) {
  const keep = indexes ?? answer.texts.map((_, i) => i);
  return transaction(db, () => {
    const at = now();
    const lastSentence = db.prepare('SELECT COALESCE(MAX(id), 0) AS id FROM sentences').get().id;
    const stored = [];
    const idOfIndex = new Map();
    const ground = new Set(words.groundLemmas(accountId).map((r) => r.lemma));
    const lemmaOfForm = new Map(answer.new_words.map((w) => [w.form.toLowerCase(), w]));
    const firstTextOf = new Map();
    const usedKnown = [];
    const inKept = new Set();
    let keptText = '';

    for (const ti of keep) {
      const text = answer.texts[ti];
      const partNo = text.part ?? exchange.part_no;
      const position = db.prepare('SELECT COUNT(*) AS n FROM texts WHERE account_id = ? AND package_id IS ? AND part_no IS ?')
        .get(accountId, exchange.package_id, partNo).n + 1;
      const info = db.prepare(`INSERT INTO texts (account_id, exchange_id, package_id, part_no, position, title, topic, created_at, kind)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(accountId, exchange.id, exchange.package_id, partNo, position, text.title, topic, at, text.kind);
      const textId = Number(info.lastInsertRowid);
      stored.push({ id: textId, title: text.title, kind: text.kind, part: partNo });
      idOfIndex.set(ti, textId);
      text.lines.forEach((line, li) => {
        db.prepare('INSERT INTO text_lines (account_id, text_id, position, sv, en) VALUES (?, ?, ?, ?, ?)').run(accountId, textId, li, line.sv, line.en);
      });
      text.questions.forEach((q, qi) => {
        db.prepare('INSERT INTO questions (account_id, text_id, position, q, options, answer) VALUES (?, ?, ?, ?, ?, ?)')
          .run(accountId, textId, qi, q.q, JSON.stringify(q.options), q.answer);
      });
      for (const s of check.texts[ti].sentences) {
        const items = s.items.map((i) => (i.kind === 'word' ? (lemmaOfForm.get(i.text)?.lemma.toLowerCase() || i.text) : i.text));
        db.prepare('INSERT INTO sentences (account_id, text_id, line_position, position, sv, new_items) VALUES (?, ?, ?, ?, ?, ?)')
          .run(accountId, textId, s.line, s.position, s.sv, JSON.stringify(items));
        for (const item of s.items) { inKept.add(item.text); if (!firstTextOf.has(item.text)) firstTextOf.set(item.text, textId); }
        keptText += ` ${s.sv.toLowerCase()} `;
        for (const token of tokenize(s.sv)) { inKept.add(token.word); if (ground.has(token.word)) usedKnown.push(token.word); }
      }
    }
    const firstId = stored[0]?.id ?? null;

    // New words the AI listed (only those in the stored texts), then those grove found itself
    // (FR-207), then phrases and starter words.
    const added = [];
    const listed = answer.new_words.filter((w) => inKept.has(w.form.toLowerCase()) || inKept.has(w.lemma.toLowerCase()));
    for (const w of listed) {
      words.addLeaf({ accountId, lemma: w.lemma, en: w.en, explainSv: w.explain_sv ?? null, sourceTextId: firstTextOf.get(w.form.toLowerCase()) ?? firstId });
      added.push(w.lemma.toLowerCase());
    }
    for (const ti of keep) {
      for (const item of check.texts[ti].newItems) {
        if (item.kind !== 'word' || lemmaOfForm.has(item.text)) continue;
        words.addLeaf({ accountId, lemma: item.text, sourceTextId: firstTextOf.get(item.text) ?? firstId });
        added.push(item.text);
      }
    }
    for (const p of answer.new_phrases) {
      if (!keptText.includes(p.sv.toLowerCase())) continue;
      words.addLeaf({ accountId, lemma: p.sv, kind: 'phrase', en: p.en, explainSv: p.explain_sv ?? null, sourceTextId: firstTextOf.get(p.sv.toLowerCase()) ?? firstId });
    }
    for (const w of answer.starter_words) {
      words.addLeaf({ accountId, lemma: w.lemma, en: w.en, explainSv: w.explain_sv ?? null, sourceTextId: firstId });
    }
    for (const inf of answer.inflections) words.learnForm(accountId, inf.form, inf.lemma);
    words.addUses(accountId, usedKnown);

    // G-03: each new word's meaning in its text, its listed form, the names, patterns, explanations, fixes.
    for (const w of listed) {
      const word = words.find(accountId, w.lemma);
      const textOf = firstTextOf.get(w.form.toLowerCase()) ?? firstId;
      if (word && textOf) db.prepare('INSERT OR IGNORE INTO word_meanings (account_id, word_id, text_id, en) VALUES (?, ?, ?, ?)').run(accountId, word.id, textOf, w.en);
      if (w.form.toLowerCase() !== w.lemma.toLowerCase()) words.learnForm(accountId, w.form, w.lemma);
    }
    if (firstId) {
      for (const name of answer.names) {
        db.prepare('INSERT OR IGNORE INTO names (account_id, name, lower, text_id) VALUES (?, ?, ?, ?)').run(accountId, name, name.toLowerCase(), firstId);
      }
    }
    for (const p of answer.patterns || []) {
      const places = p.places.filter((place) => idOfIndex.has(place.text - 1));
      if (!places.length) continue;
      words.addLeaf({ accountId, lemma: p.name, kind: 'pattern', en: p.explain_en, sourceTextId: firstId });
      const pattern = words.find(accountId, p.name, 'pattern');
      for (const place of places) {
        db.prepare('INSERT INTO pattern_places (account_id, word_id, text_id, line_position, words) VALUES (?, ?, ?, ?, ?)')
          .run(accountId, pattern.id, idOfIndex.get(place.text - 1), place.line - 1, place.words);
      }
    }
    applyExplanations(db, accountId, answer.explanations || [], at);
    if (counter) applyFixes(db, accountId, answer.fixes || [], counter, at);
    // G-03 FR-316: the learner's words without an example take theirs from the sentences stored here.
    const newSentences = db.prepare('SELECT id FROM sentences WHERE account_id = ? AND id > ?').all(accountId, lastSentence).map((r) => r.id);
    fillExamples(db, accountId, { sentenceIds: newSentences });

    return { texts: stored, added: [...new Set(added)] };
  });
}
