// The reading payload (FR-301…FR-308; research R2): sentences and tokens with everything the word
// menu needs, so a tap opens it with no request.
import { HttpError } from '../web/http.mjs';
import { tokenize } from '../words/tokens.mjs';
import { createResolver } from '../words/resolve.mjs';
import { createWordStore } from '../words/store.mjs';
import { unmarkedOf } from '../drill/marking.mjs';
import { speechRateFor } from '../drill/progress.mjs';
import { meaning as dictionaryMeaning } from '../lexicon/lexicon.mjs';

const WORD = /\p{L}+(?:[-’']\p{L}+)*/gu;

// Splits a sentence into word and non-word tokens, keeping every character.
export function splitTokens(sentence) {
  const out = [];
  let last = 0;
  for (const m of sentence.matchAll(WORD)) {
    if (m.index > last) out.push({ t: sentence.slice(last, m.index) });
    out.push({ t: m[0], word: m[0].toLowerCase(), index: out.filter((x) => x.word).length });
    last = m.index + m[0].length;
  }
  if (last < sentence.length) out.push({ t: sentence.slice(last) });
  return out;
}

export function ownText(db, accountId, raw) {
  const id = Number(raw);
  if (!Number.isSafeInteger(id) || id < 1) throw new HttpError(404, 'not_found', 'There is no such text.');
  const text = db.prepare('SELECT * FROM texts WHERE id = ? AND account_id = ?').get(id, accountId);
  if (!text) throw new HttpError(404, 'not_found', 'There is no such text.');
  return text;
}

export function reportedQuestions(db, textId) {
  return new Set(db.prepare('SELECT question_position FROM reports WHERE text_id = ? AND question_position IS NOT NULL').all(textId).map((r) => r.question_position));
}

export function buildReading(db, accountId, textId) {
  const text = ownText(db, accountId, textId);
  if (!text.ready) throw new HttpError(409, 'not_ready', 'Paste your AI\'s answer for this text first.');
  const settings = db.prepare('SELECT speak_words, speech_rate, voice_help_shown, target_share FROM learner_settings WHERE account_id = ?').get(accountId);
  const resolver = createResolver(db, accountId);
  const words = createWordStore({ db });
  const names = db.prepare('SELECT name FROM names WHERE account_id = ?').all(accountId).map((r) => r.name);
  const leafPhrases = db.prepare("SELECT lemma FROM words WHERE account_id = ? AND kind = 'phrase' AND state = 'leaf'").all(accountId).map((r) => r.lemma);
  const allPhrases = db.prepare("SELECT lemma FROM words WHERE account_id = ? AND kind = 'phrase'").all(accountId).map((r) => r.lemma.split(/\s+/));
  const counter = words.counterFor(accountId, { names, phrases: leafPhrases });

  const meaningHere = new Map(db.prepare(`SELECT w.lemma, m.en FROM word_meanings m JOIN words w ON w.id = m.word_id
    WHERE m.text_id = ?`).all(text.id).map((r) => [r.lemma, r.en]));
  const itemRows = db.prepare("SELECT lemma, to_read, to_remember, drilled, fell_marks, state, uses FROM words WHERE account_id = ? AND kind = 'word'").all(accountId);
  const itemOf = new Map(itemRows.map((r) => [r.lemma, r]));
  const meaningOf = new Map(db.prepare("SELECT lemma, en FROM words WHERE account_id = ? AND en IS NOT NULL AND kind = 'word'").all(accountId).map((r) => [r.lemma, r.en]));
  const formMeaning = new Map();
  for (const r of db.prepare(`SELECT f.form, m.en FROM word_forms f JOIN word_meanings m ON m.word_id = f.word_id
      WHERE f.account_id = ? AND m.text_id = ?`).all(accountId, text.id)) formMeaning.set(r.form, r.en);
  // An own text's AI meanings, word by word (FR-318).
  const textMeaning = new Map(db.prepare('SELECT form, en FROM text_meanings WHERE text_id = ?').all(text.id).map((r) => [r.form, r.en]));
  const explanations = db.prepare('SELECT form, lemma, explain_en FROM explanations WHERE account_id = ? ORDER BY id').all(accountId);
  const patterns = db.prepare(`SELECT DISTINCT w.id, w.lemma AS name, w.en AS explain, w.state, w.drilled FROM pattern_places p JOIN words w ON w.id = p.word_id
    WHERE p.text_id = ? ORDER BY w.id`).all(text.id);
  const places = db.prepare('SELECT word_id, line_position, words FROM pattern_places WHERE text_id = ?').all(text.id);
  const reported = reportedQuestions(db, text.id);
  const reportedLines = new Set(db.prepare("SELECT line_position FROM reports WHERE text_id = ? AND line_position IS NOT NULL AND status = 'open'").all(text.id).map((r) => r.line_position));

  let totalWords = 0;
  let knownWords = 0;
  const newItems = new Set();
  const lines = db.prepare('SELECT position, sv, en FROM text_lines WHERE text_id = ? ORDER BY position').all(text.id).map((line) => {
    const sentences = db.prepare('SELECT id, sv FROM sentences WHERE text_id = ? AND line_position = ? ORDER BY position').all(text.id, line.position).map((s) => {
      const count = counter.countSentence(s.sv);
      totalWords += count.total;
      knownWords += count.known;
      for (const i of count.items) newItems.add(i.text);
      const tokens = splitTokens(s.sv);
      const wordTokens = tokens.filter((x) => x.word);
      const raw = tokenize(s.sv);
      wordTokens.forEach((tok, i) => {
        const r = resolver.resolve(tok.word, { capitalisedMidSentence: i > 0 && raw[i]?.capitalised });
        tok.status = r.status;
        tok.lemmas = r.lemmas;
        if (r.status !== 'name') {
          tok.meaning = formMeaning.get(tok.word) ?? r.lemmas.map((l) => meaningHere.get(l)).find(Boolean)
            ?? meaningHere.get(tok.word) ?? textMeaning.get(tok.word) ?? r.lemmas.map((l) => meaningOf.get(l)).find(Boolean)
            ?? dictionaryMeaning(tok.word)?.en ?? r.lemmas.map((l) => dictionaryMeaning(l)?.en).find(Boolean) ?? null;
          // A form of more than one dictionary word lists each with its meaning (FR-306; addendum 003).
          if (r.lemmas.length > 1) {
            tok.senses = r.lemmas.map((l) => ({ lemma: l, en: meaningHere.get(l) ?? meaningOf.get(l) ?? dictionaryMeaning(l)?.en ?? tok.meaning }));
          }
          const ex = explanations.filter((e) => e.form === tok.word || (e.lemma && r.lemmas.includes(e.lemma)) || r.lemmas.includes(e.form)).at(-1);
          if (ex) tok.explanation = ex.explain_en;
        }
        // G-04: marks, the marks it had when it fell, times met (FR-408, FR-413).
        const item = r.lemmas.map((l) => itemOf.get(l)).find(Boolean);
        if (item) {
          tok.marks = { remember: !!(item.drilled && item.to_remember) };
          tok.fell = item.state === 'ground' ? item.fell_marks : null;
          tok.met = item.uses;
        }
        tok.phrases = [];
        tok.patterns = [];
        delete tok.index;
      });
      // Phrases: any phrase of the learner whose words appear in a row.
      for (const phrase of allPhrases) {
        for (let i = 0; i + phrase.length <= wordTokens.length; i += 1) {
          if (phrase.every((w, k) => wordTokens[i + k].word === w)) for (let k = 0; k < phrase.length; k += 1) wordTokens[i + k].phrases.push(phrase.join(' '));
        }
      }
      return { id: s.id, sv: s.sv, newCount: count.items.length, tokens };
    });
    // Pattern places: the given words, in a row, inside this line's sentences.
    for (const place of places.filter((p) => p.line_position === line.position)) {
      const target = place.words.toLowerCase().match(WORD) || [];
      if (!target.length) continue;
      for (const s of sentences) {
        const wt = s.tokens.filter((x) => x.word);
        for (let i = 0; i + target.length <= wt.length; i += 1) {
          if (target.every((w, k) => wt[i + k].word === w)) {
            for (let k = 0; k < target.length; k += 1) if (!wt[i + k].patterns.includes(place.word_id)) wt[i + k].patterns.push(place.word_id);
          }
        }
      }
    }
    return { position: line.position, en: line.en, sentences, reported: reportedLines.has(line.position) };
  });

  const questions = db.prepare('SELECT position, q, options FROM questions WHERE text_id = ? ORDER BY position').all(text.id)
    .map((q) => ({ position: q.position, q: q.q, options: JSON.parse(q.options), reported: reported.has(q.position) }));
  const answered = db.prepare('SELECT position, option, right FROM question_answers WHERE text_id = ? ORDER BY position').all(text.id)
    .filter((a) => !reported.has(a.position)).map((a) => ({ position: a.position, option: a.option, right: !!a.right }));
  const rating = db.prepare('SELECT value FROM ratings WHERE text_id = ?').get(text.id)?.value ?? null;
  if (!text.read_at) db.prepare('UPDATE texts SET read_at = ? WHERE id = ?').run(Date.now(), text.id);

  return {
    id: text.id,
    title: text.title,
    own: !!text.own,
    kind: text.kind,
    // FR-224: own texts and texts from the learner's AI are beta; the demo's prepared texts aren't.
    beta: !!text.own || !/^DEMO-/.test(db.prepare('SELECT code FROM exchanges WHERE id = ?').get(text.exchange_id)?.code ?? ''),
    knownShare: text.own ? text.known_share : null,
    targetShare: settings?.target_share ?? 95,
    copyright: text.own && text.copyright_view ? { view: text.copyright_view, note: text.copyright_note } : null,
    speakWords: settings ? !!settings.speak_words : true,
    speechRate: speechRateFor(db, accountId),
    voiceHelpShown: !!settings?.voice_help_shown,
    stats: { words: totalWords, newWords: newItems.size, share: totalWords ? Math.round((knownWords / totalWords) * 1000) / 10 : 100 },
    lines,
    patterns,
    marking: unmarkedOf(db, accountId, text.id).length,
    questions,
    answered,
    rating,
  };
}
