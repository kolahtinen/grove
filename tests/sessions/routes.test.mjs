import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startTestGrove } from '../fakes/harness.mjs';
import { applyDemo } from '../../server/demo/apply.mjs';
import { readInventory } from '../../server/sessions/inventory.mjs';
import { plan, fits } from '../../server/sessions/plan.mjs';

// A learner with the demo history (G-07): 4 texts, 2 unread; 6 drilled leaves.
let t;
let learner;
let c;
before(async () => {
  t = await startTestGrove();
  learner = t.seedAccount({ email: 'learner@example.test' });
  applyDemo({ db: t.grove.db, accountId: learner.id });
  t.seedAccount({ email: 'other@example.test' });
  t.seedAccount({ email: 'empty@example.test' });
  c = t.client();
  await c.signInAgreed('learner@example.test');
});
after(() => t.close());

const start = (body, client = c) => client.post('/api/sessions', { voice: true, ...body });

test('FR-903 FR-904 RQ-421: Practise for X min takes 3–60 minutes and starts a session shown one exercise at a time with its label, place and minutes left', async () => {
  for (const minutes of [2, 61]) assert.equal((await start({ kind: 'time', minutes })).status, 400, `${minutes} minutes`);
  assert.equal((await start({ kind: 'time', minutes: 10, topic: 'x' })).status, 400, 'a field the kind doesn\'t take');
  assert.equal((await start({ kind: 'time' })).status, 400, 'a field the kind needs');
  const r = await start({ kind: 'time', minutes: 10 });
  assert.equal(r.status, 200, JSON.stringify(r.body));
  const s = r.body.session;
  assert.equal(s.label, '10-minute session');
  assert.equal(s.index, 0);
  assert.ok(s.total >= 2);
  assert.ok(s.minutesLeft >= 1);
  assert.equal(s.exercise.mode, 'review', 'Review comes first');
  assert.ok(s.exercise.question?.sentence || s.exercise.question?.mode === 'recall', 'the question is built when shown');
  assert.deepEqual((await c.get('/api/session')).body.session.id, s.id);
});

test('FR-904 RQ-421: Next moves on once per exercise; a repeated index answers the same state; an older one is stale; the last one finishes with a summary', async () => {
  let s = (await c.get('/api/session')).body.session;
  const first = await c.post('/api/session/next', { sessionId: s.id, index: 0 });
  assert.equal(first.body.session.index, 1);
  assert.equal((await c.post('/api/session/next', { sessionId: s.id, index: 0 })).body.session.index, 1, 'a double tap doesn\'t skip one');
  s = first.body.session;
  for (let i = s.index; i < s.total; i += 1) {
    const r = await c.post('/api/session/next', { sessionId: s.id, index: i });
    assert.equal(r.status, 200);
    s = r.body.session;
  }
  assert.equal(s.status, 'finished');
  assert.equal(s.exercise, null);
  for (const key of ['minutes', 'textsRead', 'wordsReviewed', 'wordsFell']) assert.equal(typeof s.summary[key], 'number', key);
  assert.equal((await c.get('/api/session')).body.session, null, 'no Resume once finished');
  assert.equal((await c.get(`/api/session?id=${s.id}`)).body.session.summary.minutes, s.summary.minutes, 'by id it still shows its summary');
  assert.equal((await c.post('/api/session/next', { sessionId: s.id, index: 5000 })).status, 400);
});

test('FR-904 RQ-421: starting another session replaces the going one (the shared account\'s last started wins)', async () => {
  const a = (await start({ kind: 'time', minutes: 5 })).body.session;
  const b = (await start({ kind: 'mode', mode: 'master' })).body.session;
  assert.equal(b.label, 'Master');
  assert.equal(t.grove.db.prepare('SELECT status FROM practice_sessions WHERE id = ?').get(a.id).status, 'replaced');
  assert.equal((await c.get('/api/session')).body.session.id, b.id);
  assert.equal((await c.post('/api/session/next', { sessionId: a.id, index: 0 })).body.session.status, 'replaced');
});

test('FR-906 FR-908 RQ-423 RQ-424 RQ-20: By skill and Just one mode start; Listening without a voice is refused; nothing to do is said', async () => {
  const skill = await start({ kind: 'skill', skill: 'reading', form: 'short' });
  assert.equal(skill.body.session.minutes, 5);
  assert.equal((await start({ kind: 'skill', skill: 'listening', form: 'short', voice: false })).body.error, 'no_voice');
  const review = (await start({ kind: 'mode', mode: 'review' })).body.session;
  assert.equal(review.label, 'Review');
  assert.ok(review.total <= 10);
  const empty = t.client();
  await empty.signInAgreed('empty@example.test');
  const none = await start({ kind: 'time', minutes: 5 }, empty);
  assert.equal(none.status, 409);
  assert.equal(none.body.error, 'nothing_to_do');
});

test('FR-907 FR-909 RQ-422: Texts lists topics with their texts, unread first; a topic session draws from that topic', async () => {
  const { topics } = (await c.get('/api/topics')).body;
  assert.equal(topics.length, 1);
  const [topic] = topics;
  assert.equal(topic.texts.length, 4);
  assert.deepEqual(topic.texts.map((x) => x.read), [...topic.texts.map((x) => x.read)].sort((a, b) => a - b), 'unread first');
  const s = (await start({ kind: 'topic', minutes: 5, topic: topic.topic })).body.session;
  assert.equal(s.label, '5-minute session');
});

test('FR-914 RQ-155: another account can\'t see, move or list this learner\'s session or texts', async () => {
  const mine = (await start({ kind: 'time', minutes: 5 })).body.session;
  const other = t.client();
  await other.signInAgreed('other@example.test');
  assert.equal((await other.get('/api/session')).body.session, null);
  assert.equal((await other.post('/api/session/next', { sessionId: mine.id, index: 0 })).status, 404);
  assert.equal((await other.get(`/api/session?id=${mine.id}`)).status, 404);
  assert.deepEqual((await other.get('/api/topics')).body.topics, []);
});

test('FR-905 SC-001 RQ-421 R-24: on the demo learner, sessions of 3, 5, 10 and 20 minutes are planned within 20% or 2 minutes', { todo: 'FR-905 as written fills 4.3 min on the demo: PD-28 (question-pages/76, 1) decides how a session fills its time' }, () => {
  const inventory = readInventory(t.grove.db, learner.id);
  for (const minutes of [3, 5, 10, 20]) {
    const p = plan({ kind: 'time', params: { minutes, voice: true }, inventory });
    assert.ok(fits(p.seconds, minutes * 60), `${minutes} min planned ${(p.seconds / 60).toFixed(1)}`);
  }
});
