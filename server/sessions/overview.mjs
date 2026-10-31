// Home's live counts (G-09 FR-901, RQ-463; contracts: GET /api/overview): what each row of the map says at
// its right. New texts are the learner's unread ready texts; due the due and fading drilled leaves; this
// week's minutes run Monday to Sunday (the days of input_days, as Progress counts them); the level is the
// one FR-905 uses; a brand-new learner has no texts, no drilled leaves and has never started a session.
import { createReview } from '../drill/review.mjs';
import { levelFor } from '../drill/progress.mjs';
import { createStart } from '../levels/start.mjs';

const DAY = 24 * 60 * 60 * 1000;
const iso = (ms) => new Date(ms).toISOString().slice(0, 10);

// This week's days, Monday first, by the same UTC dates input_days uses.
function weekDays(now) {
  const d = new Date(now);
  const back = (d.getUTCDay() + 6) % 7;
  const monday = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - back * DAY;
  return Array.from({ length: 7 }, (_, i) => iso(monday + i * DAY));
}

export function createOverview({ db, now = () => Date.now() }) {
  const review = createReview({ db, now });
  const start = createStart({ db, now });
  return {
    overview(accountId) {
      const count = (sql, ...args) => db.prepare(sql).get(accountId, ...args).n;
      const days = weekDays(now());
      const seconds = new Map(db.prepare(`SELECT day, seconds FROM input_days WHERE account_id = ? AND day IN (${days.map(() => '?').join(', ')})`)
        .all(accountId, ...days).map((r) => [r.day, r.seconds]));
      const week = days.map((d) => Math.round((seconds.get(d) ?? 0) / 60));
      const { review: counts } = review.counts(accountId);
      const leaves = count("SELECT COUNT(*) AS n FROM words WHERE account_id = ? AND state = 'leaf' AND drilled = 1");
      const yourTexts = count('SELECT COUNT(*) AS n FROM texts WHERE account_id = ?');
      const level = levelFor(db, accountId);
      return {
        newTexts: count('SELECT COUNT(*) AS n FROM texts WHERE account_id = ? AND ready = 1 AND read_at IS NULL'),
        due: counts.due + counts.fading,
        leaves,
        yourTexts,
        commonTexts: db.prepare('SELECT COUNT(*) AS n FROM library_texts').get().n,
        level: level && level !== 'below A1' ? level : null,
        startOpen: start.flags(accountId).startOpen,
        todayMinutes: Math.round((seconds.get(iso(now())) ?? 0) / 60),
        weekMinutes: Math.round([...seconds.values()].reduce((a, b) => a + b, 0) / 60),
        week,
        brandNew: yourTexts === 0 && leaves === 0 && count('SELECT COUNT(*) AS n FROM practice_sessions WHERE account_id = ?') === 0,
      };
    },
  };
}
