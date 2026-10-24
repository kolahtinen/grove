// Stores an accepted answer in one transaction (FR-216, FR-217): texts, lines, questions and
// sentences; new words and phrases as leaves; plausible inflections; uses of known words.
import { transaction } from '../store/db.mjs';
import { tokenize } from '../words/tokens.mjs';

export function acceptAnswer({ db, words, accountId, exchange, answer, check, topic, now }) {
  return transaction(db, () => {
    const at = now();
    const textIds = [];
    const ground = new Set(words.groundLemmas(accountId).map((r) => r.lemma));
    const lemmaOfForm = new Map(answer.new_words.map((w) => [w.form.toLowerCase(), w]));
    const firstTextOf = new Map();
    const usedKnown = [];

    answer.texts.forEach((text, ti) => {
      const info = db.prepare(`INSERT INTO texts (account_id, exchange_id, package_id, part_no, position, title, topic, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(accountId, exchange.id, exchange.package_id, exchange.part_no, ti + 1, text.title, topic, at);
      const textId = Number(info.lastInsertRowid);
      textIds.push({ id: textId, title: text.title });
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
        for (const item of s.items) if (!firstTextOf.has(item.text)) firstTextOf.set(item.text, textId);
        for (const token of tokenize(s.sv)) if (ground.has(token.word)) usedKnown.push(token.word);
      }
    });

    // New words the AI listed, then those grove found itself (FR-207), then phrases and starter words.
    const added = [];
    for (const w of answer.new_words) {
      words.addLeaf({ accountId, lemma: w.lemma, en: w.en, explainSv: w.explain_sv ?? null, sourceTextId: firstTextOf.get(w.form.toLowerCase()) ?? textIds[0].id });
      added.push(w.lemma.toLowerCase());
    }
    for (const item of check.newItems) {
      if (item.kind !== 'word' || lemmaOfForm.has(item.text)) continue;
      words.addLeaf({ accountId, lemma: item.text, sourceTextId: firstTextOf.get(item.text) ?? textIds[0].id });
      added.push(item.text);
    }
    for (const p of answer.new_phrases) {
      words.addLeaf({ accountId, lemma: p.sv, kind: 'phrase', en: p.en, explainSv: p.explain_sv ?? null, sourceTextId: firstTextOf.get(p.sv.toLowerCase()) ?? textIds[0].id });
    }
    for (const w of answer.starter_words) {
      words.addLeaf({ accountId, lemma: w.lemma, en: w.en, explainSv: w.explain_sv ?? null, sourceTextId: textIds[0].id });
    }
    for (const inf of answer.inflections) words.learnForm(accountId, inf.form, inf.lemma);
    words.addUses(accountId, usedKnown);

    return { texts: textIds, added: [...new Set(added)] };
  });
}
