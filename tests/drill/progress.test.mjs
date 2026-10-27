import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { drillGrove, DAY } from './helpers.mjs';
import { computeLevel } from '../../server/drill/progress.mjs';

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

test('FR-415 RQ-71: Progress gives 14 days of minutes, the ground size and the drilled count', async () => {
  await c.post('/api/marks', { lemma: 'kopp', remember: true });
  const p = (await c.get('/api/progress')).body;
  assert.equal(p.days.length, 14);
  assert.equal(p.days.at(-1).day, today());
  assert.equal(p.days.at(-1).minutes, 3);
  assert.ok(p.ground >= 400);
  assert.equal(p.drilled, 1);
  assert.equal(p.level, null);
  const s = (await c.get('/api/stages')).body;
  assert.equal(s.todayMinutes, 3);
  assert.equal(s.level, null);
});

test('FR-419 RQ-155: minutes are per account', async () => {
  const other = t.client();
  await other.signInAgreed('other@example.test');
  assert.equal((await other.get('/api/progress')).body.days.at(-1).minutes, 0);
});
