import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { drillGrove, word } from './helpers.mjs';

let t;
let learner;
let c;
before(async () => {
  ({ t, learner, c } = await drillGrove());
  await c.post('/api/marks', { lemma: 'kopp', remember: true });
  await c.post('/api/marks', { lemma: 'räkna', remember: true });
});
after(() => t.close());

test('FR-412 RQ-08 RQ-415: Leaves lists the drilled leaves (To remember) and the unmarked leaves apart; there is no To read list', async () => {
  const res = await c.get('/api/leaves');
  assert.deepEqual(res.body.remember.map((i) => i.lemma).sort(), ['kopp', 'räkna']);
  assert.equal(res.body.read, undefined);
  const kopp = res.body.remember.find((i) => i.lemma === 'kopp');
  assert.equal(kopp.en, 'cup');
  assert.equal(kopp.gap, 1);
  assert.ok(kopp.strength > 0.9);
  assert.equal(kopp.due, false);
  const unmarked = res.body.unmarked.map((i) => i.lemma);
  assert.ok(unmarked.includes('servitör'), 'a starter word waits in Unmarked');
  assert.ok(!unmarked.includes('kopp'));
});

test('FR-412 RQ-35 RQ-77 RQ-207 RQ-396 RQ-398 RQ-415: a typed word or phrase becomes a drilled leaf To remember with the word list\'s meaning; one the list lacks needs the learner\'s own, which the next request asks the AI to check; delete removes it', async () => {
  assert.deepEqual((await c.post('/api/leaves', { text: 'Kanelbulle' })).body, { result: 'added' });
  const k = word(t, learner.id, 'kanelbulle');
  assert.deepEqual([k.state, k.drilled, k.to_read, k.to_remember, k.en_source], ['leaf', 1, 0, 1, 'dictionary']);
  assert.ok(k.en);
  const missing = await c.post('/api/leaves', { text: 'så klart', kind: 'phrase' });
  if (missing.status === 400) {
    assert.equal(missing.body.error, 'needs_meaning');
    assert.equal((await c.post('/api/leaves', { text: 'så klart', kind: 'phrase', en: 'of course' })).body.result, 'added');
  }
  assert.equal(word(t, learner.id, 'så klart', 'phrase').drilled, 1);
  const none = await c.post('/api/leaves', { text: 'snurrpelleplu' });
  assert.equal(none.status, 400);
  assert.equal(none.body.error, 'needs_meaning');
  assert.equal(word(t, learner.id, 'snurrpelleplu'), undefined, 'nothing saved without a meaning');
  assert.deepEqual((await c.post('/api/leaves', { text: 'snurrpelleplu', en: 'a spinning umbrella' })).body, { result: 'added' });
  assert.deepEqual([word(t, learner.id, 'snurrpelleplu').en, word(t, learner.id, 'snurrpelleplu').en_source], ['a spinning umbrella', 'learner']);
  const next = await c.post('/api/prompt', { action: 'next' });
  assert.match(next.body.prompt, /snurrpelleplu — my guess: a spinning umbrella/);
  assert.equal((await c.post('/api/meanings-prompt', {})).status, 404, 'no separate meanings prompt');
  assert.deepEqual((await c.post('/api/leaf-delete', { lemma: 'kanelbulle' })).body, { result: 'deleted' });
  assert.equal(word(t, learner.id, 'kanelbulle'), undefined, 'deleted, not moved to the ground');
});
