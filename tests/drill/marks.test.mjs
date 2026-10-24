import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { drillGrove, word } from './helpers.mjs';

let t;
let learner;
let c;
before(async () => { ({ t, learner, c } = await drillGrove()); });
after(() => t.close());

test('FR-409 RQ-07: the menu switches mark a ground word, create a leaf for a word grove hasn\'t got, and both off unmarks', async () => {
  let r = await c.post('/api/marks', { lemma: 'kaffe', read: false, remember: true });
  assert.deepEqual(r.body, { state: 'leaf', drilled: true, read: false, remember: true });
  assert.equal(word(t, learner.id, 'kaffe').gap_days, 1);
  r = await c.post('/api/marks', { lemma: 'kanelbulle', read: true, remember: false });
  assert.equal(r.body.drilled, true);
  assert.equal(word(t, learner.id, 'kanelbulle').state, 'leaf');
  r = await c.post('/api/marks', { lemma: 'kanelbulle', read: false, remember: false });
  assert.deepEqual(r.body, { state: 'leaf', drilled: false, read: false, remember: false });
});

test('FR-410: Let it fall asks a meaning question; right falls (keeping its marks), wrong stays; a pattern just confirms', async () => {
  const q = await c.get('/api/fall-check?lemma=kopp');
  assert.ok(q.body.question);
  assert.ok(['cup', 'the cups'].includes(q.body.question.options[q.body.question.right]), 'the right option is kopp\'s meaning');
  await c.post('/api/marks', { lemma: 'kopp', read: true, remember: true });
  assert.deepEqual((await c.post('/api/let-it-fall', { lemma: 'kopp', right: false })).body, { fell: false });
  assert.equal(word(t, learner.id, 'kopp').state, 'leaf');
  assert.deepEqual((await c.post('/api/let-it-fall', { lemma: 'kopp', right: true })).body, { fell: true });
  const kopp = word(t, learner.id, 'kopp');
  assert.deepEqual([kopp.state, kopp.fell_marks, kopp.drilled], ['ground', 'both', 0]);
  const p = await c.get(`/api/fall-check?lemma=${encodeURIComponent('har + supine')}&kind=pattern`);
  assert.equal(p.body.question, null);
  assert.deepEqual((await c.post('/api/let-it-fall', { lemma: 'har + supine', kind: 'pattern', confirmed: true })).body, { fell: true });
  assert.equal(word(t, learner.id, 'har + supine', 'pattern').state, 'ground');
});

test('FR-411: Pick up drills a ground word To read, due now; a leaf can\'t be picked up', async () => {
  assert.deepEqual((await c.post('/api/pick-up', { lemma: 'hund' })).body, { result: 'picked_up' });
  const hund = word(t, learner.id, 'hund');
  assert.deepEqual([hund.state, hund.drilled, hund.to_read, hund.gap_days], ['leaf', 1, 1, 1]);
  const due = (await c.get('/api/review?mode=review')).body.items.map((i) => i.lemma);
  assert.ok(due.includes('hund'), 'due now');
  assert.equal((await c.post('/api/pick-up', { lemma: 'tolv' })).status, 409);
});

test('FR-419 RQ-155: marks, Let it fall and Pick up act only on the learner\'s own items', async () => {
  const other = t.client();
  await other.signInAgreed('other@example.test');
  await other.post('/api/marks', { lemma: 'hund', read: true, remember: false });
  assert.equal(word(t, learner.id, 'hund').to_remember, 0);
  assert.equal((await other.post('/api/let-it-fall', { lemma: 'tolv', right: true })).status, 404);
  assert.equal(word(t, learner.id, 'tolv').state, 'leaf');
});
