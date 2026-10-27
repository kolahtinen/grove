// Each word's example sentence (G-03 FR-316; research R9): the first of the learner's sentences it
// appears in, stored once so the dictionary needn't search. A word matches by its dictionary form or a
// stored form among the sentence's word tokens, or by the sentence's listed new items; a phrase by its
// words in a row; a pattern takes the first sentence of its first place's line.
import { tokenize } from './tokens.mjs';

// Fills the examples still missing, for the given words (default: all the learner's words) from the
// given sentences (default: all the learner's sentences), in sentence id order.
export function fillExamples(db, accountId, { sentenceIds, wordIds } = {}) {
  const wanted = wordIds ? new Set(wordIds.map(Number)) : null;
  const open = db.prepare('SELECT id, lemma, kind FROM words WHERE account_id = ? AND example_sentence_id IS NULL').all(accountId)
    .filter((w) => !wanted || wanted.has(w.id));
  if (!open.length) return 0;

  const byForm = new Map();
  const add = (form, id) => byForm.set(form, [...(byForm.get(form) || []), id]);
  const phrases = [];
  const patterns = new Map();
  for (const w of open) {
    if (w.kind === 'word') add(w.lemma, w.id);
    else if (w.kind === 'phrase') phrases.push({ id: w.id, lemma: w.lemma, words: tokenize(w.lemma).map((t) => t.word) });
    else patterns.set(w.id, null);
  }
  const ids = new Set(open.map((w) => w.id));
  for (const r of db.prepare('SELECT form, word_id FROM word_forms WHERE account_id = ?').all(accountId)) {
    if (ids.has(r.word_id)) add(r.form, r.word_id);
  }
  if (patterns.size) {
    for (const r of db.prepare('SELECT word_id, text_id, line_position FROM pattern_places WHERE account_id = ? ORDER BY rowid').all(accountId)) {
      if (patterns.has(r.word_id) && !patterns.get(r.word_id)) patterns.set(r.word_id, `${r.text_id}:${r.line_position}`);
    }
  }

  const sentences = sentenceIds
    ? sentenceIds.length
      ? db.prepare(`SELECT id, text_id, line_position, sv, new_items FROM sentences WHERE account_id = ? AND id IN (${sentenceIds.map(() => '?').join(', ')}) ORDER BY id`)
        .all(accountId, ...sentenceIds.map(Number))
      : []
    : db.prepare('SELECT id, text_id, line_position, sv, new_items FROM sentences WHERE account_id = ? ORDER BY id').all(accountId);

  const found = new Map();
  const take = (id, sentenceId) => { if (!found.has(id)) found.set(id, sentenceId); };
  for (const s of sentences) {
    const words = tokenize(s.sv).map((t) => t.word);
    for (const w of [...words, ...JSON.parse(s.new_items).map((x) => String(x).toLowerCase())]) {
      for (const id of byForm.get(w) || []) take(id, s.id);
    }
    if (phrases.length) {
      const joined = ` ${words.join(' ')} `;
      for (const p of phrases) if (p.words.length && joined.includes(` ${p.words.join(' ')} `)) take(p.id, s.id);
    }
    for (const [id, line] of patterns) if (line === `${s.text_id}:${s.line_position}`) take(id, s.id);
  }

  const set = db.prepare('UPDATE words SET example_sentence_id = ? WHERE id = ? AND example_sentence_id IS NULL');
  for (const [id, sentenceId] of found) set.run(sentenceId, id);
  return found.size;
}
