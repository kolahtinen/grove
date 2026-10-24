import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { drillGrove, word } from './helpers.mjs';

let t;
let learner;
let c;
before(async () => {
  ({ t, learner, c } = await drillGrove());
  await c.post('/api/marks', { lemma: 'kopp', read: true, remember: true });
  await c.post('/api/marks', { lemma: 'räkna', read: true, remember: false });
  await c.post('/api/marks', { lemma: 'tolv', read: false, remember: true });
});
after(() => t.close());

test('FR-412 RQ-08: Leaves groups drilled leaves To remember / To read (both in both) and lists unmarked leaves apart', async () => {
  const res = await c.get('/api/leaves');
  const remember = res.body.remember.map((i) => i.lemma).sort();
  const read = res.body.read.map((i) => i.lemma).sort();
  assert.deepEqual(remember, ['kopp', 'tolv']);
  assert.deepEqual(read, ['kopp', 'räkna']);
  const kopp = res.body.read.find((i) => i.lemma === 'kopp');
  assert.equal(kopp.en, 'cup');
  assert.equal(kopp.gap, 1);
  assert.ok(kopp.strength > 0.9);
  assert.equal(kopp.due, false);
  const unmarked = res.body.unmarked.map((i) => i.lemma);
  assert.ok(unmarked.includes('servitör'), 'a starter word waits in Unmarked');
  assert.ok(!unmarked.includes('kopp'));
});

test('FR-412 RQ-35 RQ-77 RQ-207: a typed word, phrase or pattern becomes a drilled leaf To read and gets into the meanings prompt; delete removes it', async () => {
  await c.post('/api/leaves', { text: 'Kanelbulle' });
  await c.post('/api/leaves', { text: 'så klart', kind: 'phrase' });
  const k = word(t, learner.id, 'kanelbulle');
  assert.deepEqual([k.state, k.drilled, k.to_read], ['leaf', 1, 1]);
  assert.equal(word(t, learner.id, 'så klart', 'phrase').drilled, 1);
  const m = await c.post('/api/meanings-prompt', {});
  assert.match(m.body.prompt, /kanelbulle/);
  assert.deepEqual((await c.post('/api/leaf-delete', { lemma: 'kanelbulle' })).body, { result: 'deleted' });
  assert.equal(word(t, learner.id, 'kanelbulle'), undefined, 'deleted, not moved to the ground');
});
