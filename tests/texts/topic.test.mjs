import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { startTestGrove, seedGround } from '../fakes/harness.mjs';

const known = readFileSync(new URL('../../docs/middle/ai-test/known.txt', import.meta.url), 'utf8').split(/\s+/).filter(Boolean);
const good = readFileSync(new URL('./answers/good.json', import.meta.url), 'utf8');

let t;
let learner;
before(async () => {
  t = await startTestGrove();
  learner = t.seedAccount({ email: 'learner@example.test' });
  seedGround(t.grove.db, learner.id, known);
});
after(() => t.close());

async function client() {
  const c = t.client();
  await c.signInAgreed('learner@example.test');
  return c;
}

test('FR-219 RQ-19: without a topic the prompt uses "everyday life"; a set topic shows on Home and in the next prompt', async () => {
  const c = await client();
  assert.equal((await c.get('/api/home')).body.topic, 'everyday life');
  const first = await c.post('/api/prompt', { action: 'next' });
  assert.match(first.body.prompt, /on this topic: everyday life/);
  const set = await c.post('/api/topic', { topic: 'a small café in Stockholm' });
  assert.deepEqual(set.body, { topic: 'a small café in Stockholm' });
  assert.equal((await c.get('/api/home')).body.topic, 'a small café in Stockholm');
  const fresh = await c.post('/api/prompt', { action: 'new_package' });
  assert.match(fresh.body.prompt, /on this topic: a small café in Stockholm/);
  assert.equal((await c.post('/api/topic', { topic: '   ' })).status, 400);
});

test('FR-211 RQ-165 RQ-175: a new topic asks for 10–15 starter words; they become leaves; a used topic does not ask again', async () => {
  const c = await client();
  const p = await c.post('/api/prompt', { action: 'next' });
  assert.match(p.body.prompt, /10–15 useful starter words/);
  const res = await c.post('/api/answer', { exchangeId: p.body.exchangeId, answer: good.replaceAll('TEST-1', p.body.code) });
  assert.equal(res.body.result, 'accepted', JSON.stringify(res.body));
  const servitor = t.grove.db.prepare("SELECT state, en FROM words WHERE account_id = ? AND lemma = 'servitör'").get(learner.id);
  assert.deepEqual({ ...servitor }, { state: 'leaf', en: 'waiter' });
  const next = await c.post('/api/prompt', { action: 'next' });
  assert.doesNotMatch(next.body.prompt, /starter words/);
});

test('FR-219 RQ-19: changing the topic in the middle of a package makes the remaining parts use the new topic', async () => {
  const c = await client();
  const waiting = (await c.get('/api/home')).body.waiting;
  t.grove.db.prepare("UPDATE exchanges SET status = 'replaced' WHERE id = ?").run(waiting.exchangeId);
  await c.post('/api/topic', { topic: 'a trip to the sea' });
  const next = await c.post('/api/prompt', { action: 'next' });
  assert.equal(next.body.part, 2);
  assert.match(next.body.prompt, /on this topic: a trip to the sea/);
});
