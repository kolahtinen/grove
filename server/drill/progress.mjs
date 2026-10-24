// Level, input minutes and progress (FR-414, FR-415; research R4, R5).
import { HttpError } from '../web/http.mjs';

export const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const DAY = 24 * 60 * 60 * 1000;
const MAX_DAY = 57600;

export function computeLevel(db, accountId) {
  const lists = db.prepare('SELECT level, COUNT(*) AS n FROM level_words GROUP BY level').all();
  if (!lists.length) return null;
  let reached = 'below A1';
  for (const level of LEVELS) {
    const total = lists.find((l) => l.level === level)?.n ?? 0;
    if (!total) break;
    const have = db.prepare(`SELECT COUNT(*) AS n FROM level_words l JOIN words w ON w.lemma = l.lemma AND w.account_id = ? AND w.state = 'ground'
      WHERE l.level = ?`).get(accountId, level).n;
    if (have / total < 0.9) break;
    reached = level;
  }
  return reached;
}

const iso = (ms) => new Date(ms).toISOString().slice(0, 10);

export function createProgress({ db, now = () => Date.now() }) {
  const minutes = (accountId, day) => Math.floor((db.prepare('SELECT seconds FROM input_days WHERE account_id = ? AND day = ?').get(accountId, day)?.seconds ?? 0) / 60);
  return {
    today: () => iso(now()),
    minutes,
    addInput(accountId, { seconds, day }) {
      const t = now();
      if (![iso(t - DAY), iso(t), iso(t + DAY)].includes(day)) throw new HttpError(400, 'bad_request', 'That date is too far from today.');
      db.prepare(`INSERT INTO input_days (account_id, day, seconds) VALUES (?, ?, MIN(?, ${MAX_DAY}))
        ON CONFLICT (account_id, day) DO UPDATE SET seconds = MIN(${MAX_DAY}, seconds + excluded.seconds)`).run(accountId, day, seconds);
      return { todayMinutes: minutes(accountId, day) };
    },
    progress(accountId) {
      const t = now();
      const days = Array.from({ length: 14 }, (_, i) => iso(t - (13 - i) * DAY)).map((day) => ({ day, minutes: minutes(accountId, day) }));
      const ground = db.prepare("SELECT COUNT(*) AS n FROM words WHERE account_id = ? AND state = 'ground'").get(accountId).n;
      const drilled = db.prepare('SELECT COUNT(*) AS n FROM words WHERE account_id = ? AND drilled = 1').get(accountId).n;
      return { level: computeLevel(db, accountId), days, ground, drilled };
    },
  };
}
