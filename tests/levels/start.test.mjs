import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startTestGrove } from '../fakes/harness.mjs';

let t;
let learner;
let other;
before(async () => {
  t = await startTestGrove({ levels: true });
  learner = t.seedAccount({ email: 'learner@example.test' });
  other = t.seedAccount({ email: 'other@example.test' });
  t.seedAccount({ email: 'reviewer@example.test', role: 'reviewer' });
});
after(() => t.close());

async function client(email = 'learner@example.test') {
  const c = t.client();
  await c.signInAgreed(email);
  return c;
}
const levelForms = (levels) => t.grove.db.prepare(`SELECT lemma FROM level_words WHERE level IN (${levels.map(() => '?').join(',')})`).all(...levels).map((r) => r.lemma);
const groundOf = (id) => new Set(t.grove.db.prepare("SELECT lemma FROM words WHERE account_id = ? AND state = 'ground'").all(id).map((r) => r.lemma));

test('FR-605 RQ-248: a new account needs the starting check; the reviewer never does', async () => {
  assert.equal((await (await client()).get('/api/stages')).body.needsStart, true);
  const r = (await (await client('reviewer@example.test')).get('/api/stages')).body;
  assert.equal(r.needsStart, false);
  assert.equal(r.canRestart, false);
});

test('FR-604 RQ-114 RQ-249: the sample is 30 distinct words of the level, spread from most to least common', async () => {
  const c = await client();
  const res = await c.get('/api/start/sample?level=A2');
  assert.equal(res.body.words.length, 30);
  const a2 = new Set(levelForms(['A2']));
  assert.ok(res.body.words.every((w) => a2.has(w.lemma)));
  assert.equal(new Set(res.body.words.map((w) => w.lemma)).size, 30);
  const wpm = res.body.words.map((w) => t.grove.db.prepare("SELECT wpm FROM level_words WHERE lemma = ? AND level = 'A2'").get(w.lemma).wpm);
  assert.ok(wpm[0] >= wpm[29], 'from most to least common');
  assert.equal((await c.get('/api/start/sample?level=Z9')).status, 400);
});

test('FR-604 FR-608 RQ-114 RQ-03: A2 with 5 unknown grounds every A1 and A2 form but those 5, which become unmarked leaves; the level shows A2', async () => {
  const c = await client();
  const db = t.grove.db;
  db.prepare("INSERT INTO words (account_id, lemma, kind, state, added_at, drilled, to_read, gap_days, last_review_at) VALUES (?, 'kaffe', 'word', 'leaf', 1, 1, 1, 1, 1)").run(learner.id);
  const sample = (await c.get('/api/start/sample?level=A2')).body.words.map((w) => w.lemma).filter((l) => l !== 'kaffe');
  const unknown = sample.slice(0, 5);
  const started = Date.now();
  const res = await c.post('/api/start', { level: 'A2', unknown });
  assert.ok(Date.now() - started < 2000, 'applied in under 2 s');
  assert.equal(res.status, 200);
  assert.equal(res.body.suggestLower, false);
  const ground = groundOf(learner.id);
  for (const l of levelForms(['A1', 'A2'])) {
    if (unknown.includes(l) || l === 'kaffe') continue;
    assert.ok(ground.has(l), l);
  }
  for (const l of unknown) {
    const w = db.prepare('SELECT state, drilled, en, origin FROM words WHERE account_id = ? AND lemma = ?').get(learner.id, l);
    assert.deepEqual({ ...w }, { state: 'leaf', drilled: 0, en: null, origin: 'start' });
  }
  assert.equal(db.prepare("SELECT state FROM words WHERE account_id = ? AND lemma = 'kaffe'").get(learner.id).state, 'leaf', 'an existing word keeps its state');
  assert.equal(db.prepare("SELECT origin FROM words WHERE account_id = ? AND lemma = 'och'").get(learner.id).origin, 'start');
  const stages = (await c.get('/api/stages')).body;
  assert.equal(stages.level, 'A2');
  assert.equal(stages.needsStart, false);
  assert.equal(stages.canRestart, true);
});

test('FR-604 RQ-114: SC-002 — A2 with nothing ticked grounds every A1 and A2 form', async () => {
  const c = await client('other@example.test');
  await c.post('/api/start', { level: 'A2', unknown: [] });
  const ground = groundOf(other.id);
  const forms = levelForms(['A1', 'A2']);
  assert.equal(forms.filter((l) => ground.has(l)).length, forms.length);
  assert.ok(forms.length > 2600);
});

test('FR-603 RQ-113: beginner leaves the ground as it was and finishes the check', async () => {
  const id = t.seedAccount({ email: 'beginner@example.test' }).id;
  const c = await client('beginner@example.test');
  const res = await c.post('/api/start', { level: 'beginner', unknown: [] });
  assert.deepEqual(res.body, { ground: 0, leaves: 0, suggestLower: false });
  assert.equal(groundOf(id).size, 0);
  assert.equal((await c.get('/api/stages')).body.needsStart, false);
});

test('FR-607: 20 or more unknown suggests the level below (never for A1)', async () => {
  const c = await client('beginner@example.test');
  const b1 = (await c.get('/api/start/sample?level=B1')).body.words.map((w) => w.lemma);
  assert.equal((await c.post('/api/start', { level: 'B1', unknown: b1.slice(0, 20) })).body.suggestLower, true);
  const a1 = (await c.get('/api/start/sample?level=A1')).body.words.map((w) => w.lemma);
  assert.equal((await c.post('/api/start', { level: 'A1', unknown: a1.slice(0, 25) })).body.suggestLower, false);
});

test('FR-609 RQ-155: the reviewer is refused, and the check changes only the learner\'s own words', async () => {
  const levelCount = t.grove.db.prepare('SELECT COUNT(*) AS n FROM level_words').get().n;
  const refused = await (await client('reviewer@example.test')).post('/api/start', { level: 'A1', unknown: [] });
  assert.equal(refused.status, 403);
  assert.equal(refused.body.error, 'not_for_reviewer');
  const before = groundOf(other.id).size;
  await (await client()).post('/api/start', { level: 'B1', unknown: [] });
  assert.equal(groundOf(other.id).size, before);
  assert.equal(t.grove.db.prepare('SELECT COUNT(*) AS n FROM level_words').get().n, levelCount);
});
