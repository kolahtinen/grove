// The learner's words: ground and leaves, learned forms and meanings (FR-207, FR-216; glossary).
// Every word gets a meaning: the one given, else grove's word list's (G-02 FR-207, FR-222).
import { createCounter } from './count.mjs';
import { meaning as dictionaryMeaning } from '../lexicon/lexicon.mjs';

export function createWordStore({ db, now = () => Date.now() }) {
  return {
    // A counter for this learner, with this answer's names, phrases and listed inflections added.
    counterFor(accountId, { names = [], phrases = [], inflections = [] } = {}) {
      const ground = new Set(db.prepare("SELECT lemma FROM words WHERE account_id = ? AND state = 'ground' AND kind = 'word'").all(accountId).map((r) => r.lemma));
      const forms = new Map();
      for (const r of db.prepare(`SELECT f.form, w.lemma FROM word_forms f JOIN words w ON w.id = f.word_id
          WHERE f.account_id = ? AND w.state = 'ground'`).all(accountId)) {
        forms.set(r.form, [...(forms.get(r.form) || []), r.lemma]);
      }
      for (const { form, lemma } of inflections) {
        const f = form.toLowerCase();
        forms.set(f, [...(forms.get(f) || []), lemma.toLowerCase()]);
      }
      const knownPhrases = db.prepare("SELECT lemma FROM words WHERE account_id = ? AND kind = 'phrase' AND state = 'ground'").all(accountId)
        .map((r) => ({ words: r.lemma.split(/\s+/), lemma: r.lemma, known: true }));
      const newPhrases = phrases.map((p) => ({ words: p.toLowerCase().split(/\s+/), lemma: p.toLowerCase(), known: false }));
      return createCounter({ ground, forms, phrases: [...knownPhrases, ...newPhrases], names: new Set(names.map((n) => n.toLowerCase())) });
    },

    groundLemmas(accountId) {
      return db.prepare("SELECT lemma, uses, fallen_at FROM words WHERE account_id = ? AND state = 'ground' AND kind = 'word'").all(accountId);
    },

    recentLeaves(accountId, limit) {
      return db.prepare("SELECT lemma FROM words WHERE account_id = ? AND state = 'leaf' ORDER BY added_at DESC, id DESC LIMIT ?").all(accountId, limit).map((r) => r.lemma);
    },

    find(accountId, lemma, kind = 'word') {
      return db.prepare('SELECT * FROM words WHERE account_id = ? AND lemma = ? AND kind = ?').get(accountId, lemma.toLowerCase(), kind);
    },

    // Adds a leaf unless the word is already known to this learner; fills a missing meaning. A word
    // without a given meaning takes the word list's (`en_source` dictionary).
    addLeaf({ accountId, lemma, kind = 'word', en = null, explainSv = null, sourceTextId = null, enSource = 'ai' }) {
      const key = lemma.toLowerCase();
      let source = en ? enSource : null;
      if (!en && kind === 'word') {
        const found = dictionaryMeaning(key);
        if (found) { en = found.en; source = 'dictionary'; }
      }
      const existing = this.find(accountId, key, kind);
      if (existing) {
        if (en && (!existing.en || (existing.en_source === 'dictionary' && source === 'ai'))) {
          db.prepare('UPDATE words SET en = ?, en_source = ?, explain_sv = COALESCE(?, explain_sv) WHERE id = ?').run(en, source, explainSv, existing.id);
        }
        return existing.id;
      }
      const info = db.prepare(`INSERT INTO words (account_id, lemma, kind, en, en_source, explain_sv, state, added_at, source_text_id)
        VALUES (?, ?, ?, ?, ?, ?, 'leaf', ?, ?)`).run(accountId, key, kind, en, source, explainSv, now(), sourceTextId);
      return Number(info.lastInsertRowid);
    },

    // The AI's meaning, e.g. from a meaning check or a meanings fix-it (FR-207).
    setMeaning(accountId, lemma, { en, explainSv = null, kind = 'word' }) {
      const word = this.find(accountId, lemma, kind);
      if (!word) return false;
      db.prepare("UPDATE words SET en = ?, explain_sv = COALESCE(?, explain_sv), en_source = 'ai' WHERE id = ?").run(en, explainSv, word.id);
      return true;
    },

    // Learns a listed inflected form only when plausible (FR-216): its dictionary form is a leaf or
    // ground word and the form starts with the same two letters.
    learnForm(accountId, form, lemma) {
      const f = form.toLowerCase();
      const l = lemma.toLowerCase();
      if (f === l || f.slice(0, 2) !== l.slice(0, 2)) return false;
      const word = this.find(accountId, l);
      if (!word) return false;
      db.prepare('INSERT OR IGNORE INTO word_forms (account_id, form, word_id) VALUES (?, ?, ?)').run(accountId, f, word.id);
      return true;
    },

    addUses(accountId, lemmas) {
      const stmt = db.prepare('UPDATE words SET uses = uses + 1 WHERE account_id = ? AND lemma = ?');
      for (const l of lemmas) stmt.run(accountId, l);
    },

  };
}
