// Review and Master sessions (FR-404…FR-407): fading first, then due; answers update the schedule.
import { HttpError } from '../web/http.mjs';
import { transaction } from '../store/db.mjs';
import { strength, isDue, answer as schedule, dueAt, MASTER_GAP } from './schedule.mjs';
import { createItems } from './items.mjs';
import { createQuestions } from './questions.mjs';

export const BATCH = 10;

export function createReview({ db, now = () => Date.now() }) {
  const items = createItems({ db, now });
  const questions = createQuestions(db);
  const drilled = (accountId) => db.prepare('SELECT * FROM words WHERE account_id = ? AND drilled = 1').all(accountId);

  return {
    counts(accountId) {
      const all = drilled(accountId);
      const t = now();
      const fading = all.filter((i) => strength(i, t) < 0.2).length;
      const due = all.filter((i) => isDue(i, t)).length - fading;
      const master = all.filter((i) => i.gap_days >= MASTER_GAP).length;
      const upcoming = all.filter((i) => !isDue(i, t)).map(dueAt).sort((a, b) => a - b);
      return { review: { fading, due }, master, nextDue: upcoming[0] ?? null };
    },
    session(accountId, mode) {
      const t = now();
      const all = drilled(accountId);
      let chosen;
      if (mode === 'master') {
        chosen = all.filter((i) => i.gap_days >= MASTER_GAP).sort((a, b) => b.gap_days - a.gap_days).slice(0, BATCH);
      } else {
        chosen = all.filter((i) => isDue(i, t)).sort((a, b) => strength(a, t) - strength(b, t)).slice(0, BATCH);
      }
      const list = chosen.map((item) => {
        if (mode === 'master') return questions.masterQuestion(accountId, item);
        // Shown in its sentence with Play (FR-406; addendum 003, RQ-415).
        return questions.meaningQuestion(accountId, item);
      });
      const upcoming = all.filter((i) => !isDue(i, t)).map(dueAt).sort((a, b) => a - b);
      return { items: list, nextDue: upcoming[0] ?? null };
    },
    answer(accountId, { lemma, kind = 'word', mode, right, practice = false }) {
      const item = items.mustFind(accountId, lemma, kind);
      if (!item.drilled) throw new HttpError(409, 'not_drilled', 'This word isn’t being drilled.');
      // A practice review (G-09 FR-905, question-pages/76 F1) never changes the schedule and isn't stored.
      if (practice) return { gap: item.gap_days, fell: false, practice: true };
      const result = schedule(item, right, now());
      transaction(db, () => {
        db.prepare('INSERT INTO review_answers (account_id, word_id, mode, right, at) VALUES (?, ?, ?, ?, ?)').run(accountId, item.id, mode, right ? 1 : 0, now());
        if (result.fell) items.fall(item);
        else db.prepare('UPDATE words SET gap_days = ?, last_review_at = ?, reviews = reviews + 1 WHERE id = ?').run(result.gap, now(), item.id);
      });
      return { gap: result.gap, fell: result.fell };
    },
  };
}
