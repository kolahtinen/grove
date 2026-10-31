// The starting check (FR-603…FR-607; research R4): a sample of 30 of a level's words; confirming
// grounds the levels' words except the ticked ones, which become unmarked leaves; a new check first
// removes untouched starting-check words.
import { HttpError } from '../web/http.mjs';
import { transaction } from '../store/db.mjs';
import { fillExamples } from '../words/examples.mjs';

export const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
export const SAMPLE = 30;

export function createStart({ db, now = () => Date.now() }) {
  const isReviewer = (accountId) => !!db.prepare('SELECT is_reviewer FROM accounts WHERE id = ?').get(accountId)?.is_reviewer;
  const haveLists = () => !!db.prepare('SELECT 1 FROM level_words LIMIT 1').get();

  return {
    isReviewer,
    // FR-605 (RQ-463): Home sends a new account to the starting level once (`needsStart`, until the page has
    // been offered); the choice stays open (`startOpen`, Home's Progress row offers it) until it is made.
    flags(accountId) {
      const reviewer = isReviewer(accountId);
      const s = db.prepare('SELECT start_done, start_offered FROM learner_settings WHERE account_id = ?').get(accountId);
      const open = !reviewer && !s?.start_done;
      return { needsStart: open && !s?.start_offered, startOpen: open, canRestart: !reviewer };
    },
    offered(accountId) {
      db.prepare('INSERT OR IGNORE INTO learner_settings (account_id) VALUES (?)').run(accountId);
      db.prepare('UPDATE learner_settings SET start_offered = 1 WHERE account_id = ?').run(accountId);
      return {};
    },
    sample(level) {
      if (!LEVELS.includes(level)) throw new HttpError(400, 'bad_request', 'That is not a level.');
      if (!haveLists()) throw new HttpError(503, 'levels_unavailable', 'The level word lists aren’t available right now.');
      const words = db.prepare('SELECT lemma, kind FROM level_words WHERE level = ? ORDER BY wpm DESC, lemma').all(level);
      if (words.length <= SAMPLE) return { level, words };
      const step = words.length / SAMPLE;
      return { level, words: Array.from({ length: SAMPLE }, (_, i) => words[Math.floor(i * step)]) };
    },
    apply(accountId, { level, unknown }) {
      if (isReviewer(accountId)) throw new HttpError(403, 'not_for_reviewer', 'The reviewer account starts with its demo history.');
      if (level !== 'beginner' && !haveLists()) throw new HttpError(503, 'levels_unavailable', 'The level word lists aren’t available right now.');
      const ticked = [...new Set(unknown.map((u) => u.trim().toLowerCase()))];
      let ground = 0;
      let leaves = 0;
      transaction(db, () => {
        db.prepare(`DELETE FROM words WHERE account_id = ? AND origin = 'start' AND drilled = 0 AND uses = 0 AND fell_marks IS NULL
          AND id NOT IN (SELECT word_id FROM review_answers WHERE account_id = ?)`).run(accountId, accountId);
        if (level !== 'beginner') {
          const upTo = LEVELS.slice(0, LEVELS.indexOf(level) + 1);
          const marks = upTo.map(() => '?').join(',');
          ground = Number(db.prepare(`INSERT OR IGNORE INTO words (account_id, lemma, kind, state, added_at, origin)
            SELECT ?, lemma, kind, 'ground', ?, 'start' FROM level_words
            WHERE level IN (${marks}) AND lemma NOT IN (SELECT value FROM json_each(?))`).run(accountId, now(), ...upTo, JSON.stringify(ticked)).changes);
          for (const lemma of ticked) {
            const kind = db.prepare('SELECT kind FROM level_words WHERE lemma = ?').get(lemma)?.kind ?? 'word';
            leaves += Number(db.prepare(`INSERT OR IGNORE INTO words (account_id, lemma, kind, state, added_at, origin)
              VALUES (?, ?, ?, 'leaf', ?, 'start')`).run(accountId, lemma, kind, now()).changes);
          }
        }
        db.prepare('INSERT OR IGNORE INTO learner_settings (account_id) VALUES (?)').run(accountId);
        db.prepare('UPDATE learner_settings SET start_level = ?, start_done = 1, start_at = ? WHERE account_id = ?').run(level, now(), accountId);
        // G-03 FR-316: the new words take the first sentence they appear in, if the learner has read any.
        fillExamples(db, accountId);
      });
      return { ground, leaves, suggestLower: level !== 'beginner' && level !== 'A1' && ticked.length >= 20 };
    },
  };
}
