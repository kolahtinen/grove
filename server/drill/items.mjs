// Items by account, dictionary form and kind; marks, falling and picking up (data-model.md states).
import { HttpError } from '../web/http.mjs';
import { START_GAP } from './schedule.mjs';
import { meaning as dictionaryMeaning } from '../lexicon/lexicon.mjs';

export const KINDS = ['word', 'phrase', 'pattern'];

export function createItems({ db, now = () => Date.now() }) {
  const find = (accountId, lemma, kind = 'word') =>
    db.prepare('SELECT * FROM words WHERE account_id = ? AND lemma = ? AND kind = ?').get(accountId, String(lemma).trim().toLowerCase(), kind);

  function findOrCreate(accountId, lemma, kind = 'word', sourceTextId = null, meaning = null) {
    const existing = find(accountId, lemma, kind);
    if (existing) return existing;
    // A new item takes the word list's meaning, or the one given (G-02 FR-207, FR-412).
    const key = String(lemma).trim().toLowerCase();
    const found = meaning ? null : dictionaryMeaning(key);
    db.prepare("INSERT INTO words (account_id, lemma, kind, en, en_source, state, added_at, source_text_id) VALUES (?, ?, ?, ?, ?, 'leaf', ?, ?)")
      .run(accountId, key, kind, meaning ?? found?.en ?? null, meaning ? 'learner' : found ? 'dictionary' : null, now(), sourceTextId);
    return find(accountId, lemma, kind);
  }

  const marksOf = (item) => (item.to_read && item.to_remember ? 'both' : item.to_remember ? 'remember' : item.to_read ? 'read' : null);

  return {
    find,
    findOrCreate,
    marksOf,
    mustFind(accountId, lemma, kind = 'word') {
      const item = find(accountId, lemma, kind);
      if (!item) throw new HttpError(404, 'not_found', 'There is no such word.');
      return item;
    },
    // Marks on: a drilled leaf (due tomorrow if newly drilled); both off: an unmarked leaf again.
    setMarks(item, { read, remember }) {
      const any = read || remember;
      if (any && !item.drilled) {
        db.prepare("UPDATE words SET to_read = ?, to_remember = ?, drilled = 1, state = 'leaf', gap_days = ?, last_review_at = ?, fallen_at = NULL WHERE id = ?")
          .run(read ? 1 : 0, remember ? 1 : 0, START_GAP, now(), item.id);
      } else if (any) {
        db.prepare('UPDATE words SET to_read = ?, to_remember = ? WHERE id = ?').run(read ? 1 : 0, remember ? 1 : 0, item.id);
      } else {
        db.prepare("UPDATE words SET to_read = 0, to_remember = 0, drilled = 0, gap_days = NULL, last_review_at = NULL, state = CASE WHEN state = 'ground' THEN 'ground' ELSE 'leaf' END WHERE id = ?").run(item.id);
      }
      return db.prepare('SELECT * FROM words WHERE id = ?').get(item.id);
    },
    fall(item) {
      db.prepare("UPDATE words SET state = 'ground', drilled = 0, gap_days = NULL, fallen_at = ?, fell_marks = ? WHERE id = ?")
        .run(now(), marksOf(item), item.id);
    },
    pickUp(item) {
      if (item.state !== 'ground') throw new HttpError(409, 'not_ground', 'Only words in your ground can be picked up.');
      db.prepare("UPDATE words SET state = 'leaf', drilled = 1, to_read = 1, to_remember = 0, gap_days = ?, last_review_at = ?, fallen_at = NULL WHERE id = ?")
        .run(START_GAP, now() - START_GAP * 24 * 60 * 60 * 1000, item.id);
    },
  };
}
