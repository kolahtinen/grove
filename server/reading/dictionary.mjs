// The dictionary (FR-316, FR-317): every word, phrase and pattern met, with translation, state and an
// example sentence; names apart. A word without a stored meaning shows the word list's (FR-316, G-02 FR-207).
import { meaning as dictionaryMeaning } from '../lexicon/lexicon.mjs';

export function buildDictionary(db, accountId) {
  const sentences = db.prepare('SELECT sv, new_items FROM sentences WHERE account_id = ? ORDER BY id').all(accountId)
    .map((s) => ({ sv: s.sv, lower: s.sv.toLowerCase(), items: JSON.parse(s.new_items) }));
  const forms = new Map();
  for (const r of db.prepare('SELECT f.form, f.word_id FROM word_forms f WHERE f.account_id = ?').all(accountId)) {
    forms.set(r.word_id, [...(forms.get(r.word_id) || []), r.form]);
  }
  const places = new Map(db.prepare(`SELECT p.word_id, l.sv FROM pattern_places p JOIN text_lines l ON l.text_id = p.text_id AND l.position = p.line_position
    WHERE p.account_id = ?`).all(accountId).map((r) => [r.word_id, r.sv]));

  const wordIn = (lower, w) => new RegExp(`(^|[^\\p{L}])${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^\\p{L}]|$)`, 'u').test(lower);
  const items = db.prepare('SELECT id, lemma, kind, en, state FROM words WHERE account_id = ? ORDER BY lemma').all(accountId).map((w) => {
    let example = null;
    if (w.kind === 'pattern') example = places.get(w.id) ?? null;
    else {
      const candidates = [w.lemma, ...(forms.get(w.id) || [])];
      const hit = sentences.find((s) => s.items.includes(w.lemma) || candidates.some((c) => wordIn(s.lower, c)));
      example = hit ? hit.sv : null;
    }
    const en = w.en ?? (w.kind === 'word' ? dictionaryMeaning(w.lemma)?.en ?? null : null);
    return { lemma: w.lemma, kind: w.kind, en, state: w.state, example };
  });
  const names = db.prepare('SELECT name FROM names WHERE account_id = ? ORDER BY lower').all(accountId).map((r) => r.name);
  return { items, names };
}
