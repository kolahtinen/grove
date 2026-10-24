// Resolves a word token against all the learner's words, ground and leaves (FR-303, FR-306;
// research R2 of specs/003-reading-word-menu): its status and the dictionary forms it may be.
import { regularLemma, isCompound } from './inflect.mjs';
import { IRREGULAR } from './irregular.mjs';

export function createResolver(db, accountId, { names = [] } = {}) {
  const state = new Map();
  for (const r of db.prepare("SELECT lemma, state FROM words WHERE account_id = ? AND kind = 'word'").all(accountId)) state.set(r.lemma, r.state);
  const forms = new Map();
  for (const r of db.prepare('SELECT f.form, w.lemma FROM word_forms f JOIN words w ON w.id = f.word_id WHERE f.account_id = ?').all(accountId)) {
    forms.set(r.form, [...(forms.get(r.form) || []), r.lemma]);
  }
  const stored = db.prepare('SELECT lower FROM names WHERE account_id = ?').all(accountId).map((r) => r.lower);
  const nameSet = new Set([...stored, ...names.map((n) => n.toLowerCase())]);
  const has = (lemma) => state.has(lemma);

  function lemmasOf(word) {
    const found = new Set();
    if (has(word)) found.add(word);
    for (const l of forms.get(word) || []) if (has(l)) found.add(l);
    for (const l of IRREGULAR.get(word) || []) if (has(l)) found.add(l);
    if (!found.size) {
      const regular = regularLemma(word, has);
      if (regular) found.add(regular);
    }
    return [...found];
  }

  return {
    resolve(word, { capitalisedMidSentence = false } = {}) {
      const w = word.toLowerCase();
      if (nameSet.has(w) || capitalisedMidSentence) return { status: 'name', lemmas: [] };
      let lemmas = lemmasOf(w);
      if (!lemmas.length && isCompound(w, (l) => state.get(l) === 'ground', (p) => lemmasOf(p).some((l) => state.get(l) === 'ground'))) {
        return { status: 'ground', lemmas: [w] };
      }
      if (!lemmas.length) return { status: 'new', lemmas: [] };
      lemmas = lemmas.sort();
      return { status: lemmas.some((l) => state.get(l) === 'ground') ? 'ground' : 'leaf', lemmas };
    },
  };
}
