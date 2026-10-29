import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { drillGrove, DAY } from './helpers.mjs';
import { computeLevel } from '../../server/drill/progress.mjs';
import { tokenize } from '../../server/words/tokens.mjs';

let t;
let learner;
let c;
let clock;
before(async () => { ({ t, learner, c, clock } = await drillGrove()); });
after(() => t.close());

const today = () => new Date(clock.now).toISOString().slice(0, 10);

test('FR-414 RQ-03 RQ-253: the level is the highest level that, with every level below, has 90% of its words in the ground', () => {
  const db = t.grove.db;
  assert.equal(computeLevel(db, learner.id), null, 'no level lists yet');
  const add = db.prepare('INSERT INTO level_words (level, lemma) VALUES (?, ?)');
  const a1 = ['jag', 'du', 'han', 'hon', 'vi', 'de', 'och', 'men', 'att', 'inte'];
  const a2 = ['kaffe', 'bröd', 'tårta', 'kafé', 'stad', 'hus', 'bil', 'buss', 'tåg', 'kanelbulle'];
  const b1 = ['förlorat', 'skämt', 'historia', 'berätta', 'bulle', 'kanel', 'sjunga', 'leka', 'nära', 'glass'];
  for (const l of a1) add.run('A1', l);
  for (const l of a2) add.run('A2', l);
  for (const l of b1) add.run('B1', l);
  assert.equal(computeLevel(db, learner.id), 'A2', 'A1 100%, A2 90%, B1 0%');
  db.prepare("DELETE FROM words WHERE account_id = ? AND lemma = 'inte'").run(learner.id);
  assert.equal(computeLevel(db, learner.id), 'A2', 'A1 at 90% still counts');
  db.prepare("DELETE FROM words WHERE account_id = ? AND lemma = 'men'").run(learner.id);
  assert.equal(computeLevel(db, learner.id), 'below A1', 'A1 at 80%: a gap below stops the climb');
  db.prepare('DELETE FROM level_words').run();
});

test('FR-415 RQ-48 RQ-71: input seconds add up per day, within limits; a day more than one day off is refused', async () => {
  for (let i = 0; i < 4; i += 1) await c.post('/api/input', { seconds: 30, day: today() });
  const r = await c.post('/api/input', { seconds: 60, day: today() });
  assert.equal(r.body.todayMinutes, 3);
  assert.equal((await c.post('/api/input', { seconds: 61, day: today() })).status, 400);
  const far = new Date(clock.now + 3 * DAY).toISOString().slice(0, 10);
  assert.equal((await c.post('/api/input', { seconds: 30, day: far })).status, 400);
  t.grove.db.prepare('UPDATE input_days SET seconds = 57590 WHERE account_id = ?').run(learner.id);
  await c.post('/api/input', { seconds: 60, day: today() });
  assert.equal(t.grove.db.prepare('SELECT seconds FROM input_days WHERE account_id = ?').get(learner.id).seconds, 57600, 'at most 16 hours a day');
  t.grove.db.prepare('UPDATE input_days SET seconds = 180 WHERE account_id = ?').run(learner.id);
});

test('FR-924 FR-925 RQ-448 SC-009: Progress gives today, the level started and now, the last 7 days read and listened, the leaves, the ground and since the start, each equal to the account\'s data', async () => {
  const db = t.grove.db;
  await c.post('/api/marks', { lemma: 'kopp', remember: true });
  await c.post('/api/input', { seconds: 30, day: today(), kind: 'listening' });
  db.prepare('UPDATE input_days SET seconds = 240, read_seconds = 120, listen_seconds = 60 WHERE account_id = ? AND day = ?').run(learner.id, today());
  const p = (await c.get('/api/progress')).body;
  assert.equal(p.today.minutes, 4);
  assert.equal(p.week.length, 7);
  assert.equal(p.week.at(-1).day, today());
  assert.deepEqual([p.week.at(-1).read, p.week.at(-1).listen], [2, 1]);
  assert.equal(p.last7.read, p.week.reduce((n, d) => n + d.read, 0));
  const words = (kind) => db.prepare(`SELECT t.id FROM texts t WHERE t.account_id = ? AND t.kind = ? AND t.read_at IS NOT NULL`).all(learner.id, kind)
    .reduce((n, row) => n + db.prepare('SELECT sv FROM sentences WHERE text_id = ?').all(row.id).reduce((m, s) => m + tokenize(s.sv).length, 0), 0);
  assert.equal(p.ever.readWords, words('reading'));
  assert.equal(p.ever.listenWords, words('listening'));
  const count = (sql) => db.prepare(sql).get(learner.id).n;
  assert.equal(p.leaves.words, count("SELECT COUNT(*) AS n FROM words WHERE account_id = ? AND drilled = 1 AND kind != 'pattern'"));
  assert.equal(p.leaves.patterns, count("SELECT COUNT(*) AS n FROM words WHERE account_id = ? AND drilled = 1 AND kind = 'pattern'"));
  assert.equal(p.ground.words, count("SELECT COUNT(*) AS n FROM words WHERE account_id = ? AND state = 'ground' AND kind != 'pattern'"));
  assert.equal(p.ground.fromStart + p.ground.fromReading + p.ground.fell, p.ground.words + p.ground.patterns);
  assert.ok(p.ground.words >= 400);
  assert.equal(p.leaves.words, 1);
  assert.equal(p.leaves.weekWords, 1, 'kopp was picked up today');
  assert.ok(p.leaves.everWords >= p.leaves.words);
  assert.equal(p.level.now, null);
  assert.ok(Array.isArray(p.level.coverage));
  const s = (await c.get('/api/stages')).body;
  assert.equal(s.todayMinutes, 4);
  assert.equal(s.level, null);
});

test('FR-419 RQ-155: minutes are per account', async () => {
  const other = t.client();
  await other.signInAgreed('other@example.test');
  assert.equal((await other.get('/api/progress')).body.today.minutes, 0);
});

test('FR-925 RQ-448: each half minute is recorded with its kind (reading, listening or other) as well as in the day\'s total; a leaf\'s picked-up time is set when it is first drilled', async () => {
  const db = t.grove.db;
  const day = today();
  const before = { ...db.prepare('SELECT seconds, read_seconds, listen_seconds FROM input_days WHERE account_id = ? AND day = ?').get(learner.id, day) };
  await c.post('/api/input', { seconds: 30, day, kind: 'reading' });
  await c.post('/api/input', { seconds: 30, day, kind: 'listening' });
  await c.post('/api/input', { seconds: 30, day });
  const after = { ...db.prepare('SELECT seconds, read_seconds, listen_seconds FROM input_days WHERE account_id = ? AND day = ?').get(learner.id, day) };
  assert.deepEqual(after, { seconds: before.seconds + 90, read_seconds: before.read_seconds + 30, listen_seconds: before.listen_seconds + 30 });
  assert.equal((await c.post('/api/input', { seconds: 30, day, kind: 'video' })).status, 400);
  const kopp = db.prepare("SELECT picked_at FROM words WHERE account_id = ? AND lemma = 'kopp'").get(learner.id);
  assert.equal(kopp.picked_at, clock.now);
});

