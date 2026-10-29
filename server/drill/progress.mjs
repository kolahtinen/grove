// Level, input minutes and progress (FR-414, FR-415; research R4, R5).
import { HttpError } from '../web/http.mjs';
import { tokenize } from '../words/tokens.mjs';

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
const COLUMNS = { reading: 'read_seconds', listening: 'listen_seconds' };

// Progress (G-09 FR-924, FR-925; B-27): input minutes per day and per kind, the words of texts read or
// heard (each text once, when first finished), the leaves and the ground (words and phrases apart from
// grammar patterns), and the level started at against the level now.
export function createProgress({ db, now = () => Date.now() }) {
  const day = (accountId, d) => db.prepare('SELECT seconds, read_seconds, listen_seconds FROM input_days WHERE account_id = ? AND day = ?').get(accountId, d);
  const minutes = (accountId, d) => Math.floor((day(accountId, d)?.seconds ?? 0) / 60);
  const textWords = (accountId) => {
    const counts = new Map();
    for (const s of db.prepare('SELECT text_id, sv FROM sentences WHERE account_id = ?').all(accountId)) counts.set(s.text_id, (counts.get(s.text_id) ?? 0) + tokenize(s.sv).length);
    return db.prepare('SELECT id, kind, read_at FROM texts WHERE account_id = ? AND read_at IS NOT NULL').all(accountId)
      .map((t) => ({ kind: t.kind, day: iso(t.read_at), words: counts.get(t.id) ?? 0 }));
  };
  const split = (rows, pred) => ({ words: rows.filter((r) => r.kind !== 'pattern' && pred(r)).length, patterns: rows.filter((r) => r.kind === 'pattern' && pred(r)).length });
  const recent = (rows, at) => rows.filter((r) => r[at]).sort((a, b) => b[at] - a[at] || b.id - a.id).slice(0, 10).map((r) => ({ lemma: r.lemma, en: r.en ?? null, kind: r.kind, at: r[at] }));

  return {
    today: () => iso(now()),
    minutes,
    addInput(accountId, { seconds, day: d, kind = 'other' }) {
      const t = now();
      if (![iso(t - DAY), iso(t), iso(t + DAY)].includes(d)) throw new HttpError(400, 'bad_request', 'That date is too far from today.');
      const col = COLUMNS[kind];
      db.prepare(`INSERT INTO input_days (account_id, day, seconds${col ? `, ${col}` : ''}) VALUES (?, ?, MIN(?, ${MAX_DAY})${col ? `, MIN(?, ${MAX_DAY})` : ''})
        ON CONFLICT (account_id, day) DO UPDATE SET seconds = MIN(${MAX_DAY}, seconds + excluded.seconds)${col ? `, ${col} = MIN(${MAX_DAY}, ${col} + excluded.${col})` : ''}`)
        .run(...(col ? [accountId, d, seconds, seconds] : [accountId, d, seconds]));
      return { todayMinutes: minutes(accountId, d) };
    },
    progress(accountId) {
      const t = now();
      const since7 = t - 7 * DAY;
      const texts = textWords(accountId);
      const week = Array.from({ length: 7 }, (_, i) => iso(t - (6 - i) * DAY)).map((d) => {
        const row = day(accountId, d);
        const of = (kind) => texts.filter((x) => x.day === d && x.kind === kind).reduce((n, x) => n + x.words, 0);
        return { day: d, read: Math.floor((row?.read_seconds ?? 0) / 60), listen: Math.floor((row?.listen_seconds ?? 0) / 60), readWords: of('reading'), listenWords: of('listening') };
      });
      const sumOf = (key) => week.reduce((n, x) => n + x[key], 0);
      const totals = db.prepare('SELECT COALESCE(SUM(read_seconds), 0) AS r, COALESCE(SUM(listen_seconds), 0) AS l, MIN(day) AS first FROM input_days WHERE account_id = ?').get(accountId);
      const words = db.prepare('SELECT id, lemma, kind, en, state, drilled, origin, fell_marks, fallen_at, picked_at, added_at FROM words WHERE account_id = ?').all(accountId);
      const leaves = words.filter((w) => w.drilled === 1);
      const ever = words.filter((w) => w.picked_at !== null);
      const ground = words.filter((w) => w.state === 'ground');
      const settings = db.prepare('SELECT start_level, start_at FROM learner_settings WHERE account_id = ?').get(accountId);
      const lists = db.prepare('SELECT level, COUNT(*) AS n FROM level_words GROUP BY level').all();
      const coverage = LEVELS.filter((l) => lists.some((x) => x.level === l)).map((l) => {
        const total = lists.find((x) => x.level === l).n;
        const have = db.prepare("SELECT COUNT(*) AS n FROM level_words lw JOIN words w ON w.lemma = lw.lemma AND w.account_id = ? AND w.state = 'ground' WHERE lw.level = ?").get(accountId, l).n;
        return [l, Math.round((have / total) * 100)];
      });
      const firstText = texts.length ? texts.map((x) => x.day).sort()[0] : null;
      return {
        today: { minutes: minutes(accountId, iso(t)) },
        level: { start: settings?.start_level ?? null, startAt: settings?.start_at ?? null, now: computeLevel(db, accountId), coverage },
        week,
        last7: { read: sumOf('read'), listen: sumOf('listen'), readWords: sumOf('readWords'), listenWords: sumOf('listenWords') },
        leaves: {
          ...split(leaves, () => true),
          weekWords: split(leaves, (w) => w.picked_at >= since7).words, weekPatterns: split(leaves, (w) => w.picked_at >= since7).patterns,
          everWords: split(ever, () => true).words, everPatterns: split(ever, () => true).patterns,
          recent: recent(leaves, 'picked_at'),
        },
        ground: {
          ...split(ground, () => true),
          weekWords: split(ground, (w) => w.fallen_at >= since7).words, weekPatterns: split(ground, (w) => w.fallen_at >= since7).patterns,
          fromStart: ground.filter((w) => w.origin === 'start').length,
          fell: ground.filter((w) => w.origin !== 'start' && w.fell_marks !== null).length,
          fromReading: ground.filter((w) => w.origin !== 'start' && w.fell_marks === null).length,
          recent: recent(ground.filter((w) => w.fallen_at), 'fallen_at'),
        },
        ever: {
          read: Math.floor(totals.r / 60), listen: Math.floor(totals.l / 60),
          readWords: texts.filter((x) => x.kind === 'reading').reduce((n, x) => n + x.words, 0),
          listenWords: texts.filter((x) => x.kind === 'listening').reduce((n, x) => n + x.words, 0),
          since: [totals.first, firstText, settings?.start_at ? iso(settings.start_at) : null].filter(Boolean).sort()[0] ?? null,
        },
      };
    },
  };
}
