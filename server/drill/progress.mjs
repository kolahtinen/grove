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

// The learner's level for planning and display (G-06 FR-605, addendum 005): the ground's level (FR-414)
// once it gives one, else the level picked or checked at the start, else what the ground says.
export function levelFor(db, accountId) {
  const computed = computeLevel(db, accountId);
  if (computed && computed !== 'below A1') return computed;
  const picked = db.prepare('SELECT start_level FROM learner_settings WHERE account_id = ?').get(accountId)?.start_level;
  return LEVELS.includes(picked) ? picked : computed;
}

// Below B1 (A1, A2, below A1 or no level yet): reading planned at 70 words a minute and the voice
// starting at 0.9× (G-09 FR-905, FR-921; PD-02, PD-03).
export const isBelowB1 = (level) => !['B1', 'B2', 'C1', 'C2'].includes(level);

// The speech speed the learner hears: their own once they set it, else 0.9× below B1 and 1× from B1.
export function speechRateFor(db, accountId) {
  const s = db.prepare('SELECT speech_rate, speech_rate_set FROM learner_settings WHERE account_id = ?').get(accountId);
  if (s?.speech_rate_set) return s.speech_rate;
  return isBelowB1(levelFor(db, accountId)) ? 0.9 : 1;
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
      return { level: levelFor(db, accountId), days, ground, drilled };
    },
  };
}
