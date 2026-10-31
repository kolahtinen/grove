// The word menu's To remember switch, Let it fall and Pick up (FR-409…FR-411; question-pages/56;
// addendum 003: To read is gone for Swedish, RQ-415), and the dictionaries' Undo of the last Pick up or
// fall (G-09 FR-927): the word as it was is kept in memory for 15 seconds, one action per account.
import { transaction } from '../store/db.mjs';
import { HttpError } from '../web/http.mjs';

const UNDO_MS = 15000;
const KEPT = ['state', 'drilled', 'to_remember', 'to_read', 'gap_days', 'last_review_at', 'fallen_at', 'fell_marks', 'picked_at'];
import { createItems } from './items.mjs';
import { createQuestions } from './questions.mjs';

export function createMarks({ db, now = () => Date.now() }) {
  const items = createItems({ db, now });
  const questions = createQuestions(db);
  const last = new Map();
  const row = (id) => db.prepare(`SELECT id, ${KEPT.join(', ')} FROM words WHERE id = ?`).get(id);
  const same = (a, b) => !!a && !!b && KEPT.every((k) => a[k] === b[k]);
  // Keeps what Undo needs: the word before (null when the action created it) and after.
  const remember = (accountId, item, before, created) => last.set(accountId, { id: item.id, lemma: item.lemma, kind: item.kind, before, created, after: row(item.id), at: now() });
  return {
    setMarks(accountId, { lemma, kind = 'word', remember }) {
      const item = items.findOrCreate(accountId, lemma, kind);
      const after = items.setMarks(item, { remember });
      return { state: after.state, drilled: !!after.drilled, remember: !!after.to_remember };
    },
    fallCheck(accountId, { lemma, kind = 'word' }) {
      const item = items.mustFind(accountId, lemma, kind);
      if (item.kind === 'pattern') return { question: null };
      const q = questions.meaningQuestion(accountId, item);
      return { question: q.mode === 'recall' ? null : { sentence: q.sentence, word: q.word, options: q.options, right: q.right } };
    },
    letItFall(accountId, { lemma, kind = 'word', right, confirmed }) {
      const item = items.mustFind(accountId, lemma, kind);
      const ok = right === true || confirmed === true;
      const before = row(item.id);
      transaction(db, () => {
        if (right !== undefined) db.prepare("INSERT INTO review_answers (account_id, word_id, mode, right, at) VALUES (?, ?, 'fall_check', ?, ?)").run(accountId, item.id, right ? 1 : 0, now());
        if (ok && item.state === 'leaf') items.fall(item);
      });
      if (ok && item.state === 'leaf') remember(accountId, item, before, false);
      return { fell: ok && item.state === 'leaf' };
    },
    // A pattern or phrase of the sentence, a new word of a text, or a common-dictionary word that isn't an
    // item yet is added as one (FR-411, RQ-414, RQ-449, RQ-456).
    pickUp(accountId, { lemma, kind = 'word' }) {
      const had = items.find(accountId, lemma, kind);
      const item = had ?? items.groundFor(items.findOrCreate(accountId, lemma, kind));
      const before = had ? row(had.id) : null;
      items.pickUp(item);
      remember(accountId, item, before, !had);
      return { result: 'picked_up' };
    },
    // G-09 FR-927: the account's last Pick up or fall, within 15 s, if the word hasn't changed since.
    undo(accountId, { lemma, kind = 'word' }) {
      const u = last.get(accountId);
      if (!u || u.lemma !== lemma || u.kind !== kind || now() - u.at > UNDO_MS || !same(row(u.id), u.after)) {
        throw new HttpError(409, 'cannot_undo', 'This can’t be undone any more.');
      }
      last.delete(accountId);
      if (u.created) db.prepare('DELETE FROM words WHERE id = ? AND account_id = ?').run(u.id, accountId);
      else db.prepare(`UPDATE words SET ${KEPT.map((k) => `${k} = ?`).join(', ')} WHERE id = ? AND account_id = ?`).run(...KEPT.map((k) => u.before[k]), u.id, accountId);
      return { undone: true };
    },
  };
}
