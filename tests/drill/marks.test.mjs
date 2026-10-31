import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { drillGrove, word } from './helpers.mjs';

let t;
let learner;
let c;
let clock;
before(async () => { ({ t, learner, c, clock } = await drillGrove()); });
after(() => t.close());

test('FR-409 RQ-07 RQ-415: the To remember switch marks a ground word, creates a leaf for a word grove hasn\'t got, and off unmarks; there is no To read', async () => {
  let r = await c.post('/api/marks', { lemma: 'kaffe', remember: true });
  assert.deepEqual(r.body, { state: 'leaf', drilled: true, remember: true });
  const kaffe = word(t, learner.id, 'kaffe');
  assert.deepEqual([kaffe.gap_days, kaffe.to_read, kaffe.to_remember], [1, 0, 1]);
  r = await c.post('/api/marks', { lemma: 'kanelbulle', remember: true });
  assert.equal(r.body.drilled, true);
  assert.equal(word(t, learner.id, 'kanelbulle').state, 'leaf');
  r = await c.post('/api/marks', { lemma: 'kanelbulle', remember: false });
  assert.deepEqual(r.body, { state: 'leaf', drilled: false, remember: false });
  assert.equal((await c.post('/api/marks', { lemma: 'kanelbulle', read: true, remember: false })).status, 400);
});

test('FR-410 (question-pages/56): Let it fall asks a meaning question; right falls (keeping its marks), wrong stays; a pattern just confirms', async () => {
  const q = await c.get('/api/fall-check?lemma=kopp');
  assert.ok(q.body.question);
  assert.ok(['cup', 'the cups'].includes(q.body.question.options[q.body.question.right]), 'the right option is kopp\'s meaning');
  await c.post('/api/marks', { lemma: 'kopp', remember: true });
  assert.deepEqual((await c.post('/api/let-it-fall', { lemma: 'kopp', right: false })).body, { fell: false });
  assert.equal(word(t, learner.id, 'kopp').state, 'leaf');
  assert.deepEqual((await c.post('/api/let-it-fall', { lemma: 'kopp', right: true })).body, { fell: true });
  const kopp = word(t, learner.id, 'kopp');
  assert.deepEqual([kopp.state, kopp.fell_marks, kopp.drilled], ['ground', 'remember', 0]);
  const p = await c.get(`/api/fall-check?lemma=${encodeURIComponent('har + supine')}&kind=pattern`);
  assert.equal(p.body.question, null);
  assert.deepEqual((await c.post('/api/let-it-fall', { lemma: 'har + supine', kind: 'pattern', confirmed: true })).body, { fell: true });
  assert.equal(word(t, learner.id, 'har + supine', 'pattern').state, 'ground');
});

test('FR-411 RQ-383 RQ-414 RQ-415 RQ-456: Pick up drills a ground word or pattern, an unmarked leaf or a new word To remember, due now; a drilled leaf can\'t be picked up', async () => {
  assert.deepEqual((await c.post('/api/pick-up', { lemma: 'hund' })).body, { result: 'picked_up' });
  const hund = word(t, learner.id, 'hund');
  assert.deepEqual([hund.state, hund.drilled, hund.to_read, hund.to_remember, hund.gap_days], ['leaf', 1, 0, 1, 1]);
  assert.equal(word(t, learner.id, 'har + supine', 'pattern').state, 'ground', 'the pattern fell in FR-410\'s test');
  assert.deepEqual((await c.post('/api/pick-up', { lemma: 'har + supine', kind: 'pattern' })).body, { result: 'picked_up' });
  const pattern = word(t, learner.id, 'har + supine', 'pattern');
  assert.deepEqual([pattern.state, pattern.drilled, pattern.to_remember], ['leaf', 1, 1]);
  const due = (await c.get('/api/review?mode=review')).body.items.map((i) => i.lemma);
  assert.ok(due.includes('hund'), 'due now');
  // RQ-456 (question-pages/95): the menu's one action on an unmarked leaf and on a new word is Pick up.
  const tolv = word(t, learner.id, 'tolv');
  assert.deepEqual([tolv.state, tolv.drilled], ['leaf', 0], 'tolv is an unmarked leaf of the text');
  assert.deepEqual((await c.post('/api/pick-up', { lemma: 'tolv' })).body, { result: 'picked_up' });
  assert.deepEqual([word(t, learner.id, 'tolv').drilled, word(t, learner.id, 'tolv').to_remember], [1, 1]);
  assert.equal(word(t, learner.id, 'giraff'), undefined);
  assert.deepEqual((await c.post('/api/pick-up', { lemma: 'giraff' })).body, { result: 'picked_up' });
  assert.deepEqual([word(t, learner.id, 'giraff').state, word(t, learner.id, 'giraff').drilled], ['leaf', 1]);
  assert.deepEqual((await c.post('/api/pick-up', { lemma: 'nya ord', kind: 'phrase' })).body, { result: 'picked_up' }, 'a phrase too');
  const again = await c.post('/api/pick-up', { lemma: 'tolv' });
  assert.equal(again.status, 409);
  assert.equal(again.body.error, 'already_drilled');
});

test('FR-419 RQ-155: marks, Let it fall and Pick up act only on the learner\'s own items', async () => {
  const other = t.client();
  await other.signInAgreed('other@example.test');
  await other.post('/api/marks', { lemma: 'kanelbulle', remember: true });
  assert.equal(word(t, learner.id, 'kanelbulle').to_remember, 0);
  assert.equal((await other.post('/api/let-it-fall', { lemma: 'tolv', right: true })).status, 404);
  assert.equal(word(t, learner.id, 'tolv').state, 'leaf');
});

test('FR-411 FR-926 RQ-449: Pick up in the common dictionary adds a word that is not yet the learner\'s as a drilled leaf, due now', async () => {
  assert.equal(word(t, learner.id, 'pingvin'), undefined);
  assert.deepEqual((await c.post('/api/pick-up', { lemma: 'pingvin' })).body, { result: 'picked_up' });
  const p = word(t, learner.id, 'pingvin');
  assert.deepEqual([p.state, p.drilled, p.to_remember], ['leaf', 1, 1]);
});

test('FR-410 RQ-449: after a wrong answer, Let it fall anyway lets the leaf fall; the wrong answer is kept', async () => {
  await c.post('/api/marks', { lemma: 'kaka', remember: true });
  assert.deepEqual((await c.post('/api/let-it-fall', { lemma: 'kaka', right: false })).body, { fell: false });
  assert.deepEqual((await c.post('/api/let-it-fall', { lemma: 'kaka', confirmed: true })).body, { fell: true });
  assert.equal(word(t, learner.id, 'kaka').state, 'ground');
  const id = word(t, learner.id, 'kaka').id;
  assert.equal(t.grove.db.prepare("SELECT COUNT(*) AS n FROM review_answers WHERE word_id = ? AND mode = 'fall_check' AND right = 0").get(id).n, 1);
});

test('FR-927 RQ-449: Undo puts the word back exactly as it was after Pick up or a fall, within 15 seconds and only if it has not changed since; a picked-up new word is removed', async () => {
  const cols = 'state, drilled, to_remember, to_read, gap_days, last_review_at, fallen_at, fell_marks, picked_at';
  const snap = (lemma) => ({ ...t.grove.db.prepare(`SELECT ${cols} FROM words WHERE account_id = ? AND lemma = ? AND kind = 'word'`).get(learner.id, lemma) });
  const before = snap('bord');
  await c.post('/api/pick-up', { lemma: 'bord' });
  assert.equal(snap('bord').state, 'leaf');
  assert.deepEqual((await c.post('/api/undo', { lemma: 'bord', kind: 'word' })).body, { undone: true });
  assert.deepEqual(snap('bord'), before);
  assert.equal((await c.post('/api/undo', { lemma: 'bord', kind: 'word' })).status, 409, 'nothing left to undo');
  await c.post('/api/marks', { lemma: 'stol', remember: true });
  const leaf = snap('stol');
  await c.post('/api/let-it-fall', { lemma: 'stol', confirmed: true });
  assert.equal(snap('stol').state, 'ground');
  await c.post('/api/undo', { lemma: 'stol', kind: 'word' });
  assert.deepEqual(snap('stol'), leaf);
  await c.post('/api/pick-up', { lemma: 'flamingo' });
  await c.post('/api/undo', { lemma: 'flamingo', kind: 'word' });
  assert.equal(word(t, learner.id, 'flamingo'), undefined, 'a word that was not the learner\'s is removed again');
  await c.post('/api/pick-up', { lemma: 'bord' });
  clock.now += 16000;
  assert.equal((await c.post('/api/undo', { lemma: 'bord', kind: 'word' })).status, 409, 'too late');
  await c.post('/api/let-it-fall', { lemma: 'bord', confirmed: true });
  await c.post('/api/pick-up', { lemma: 'bord' });
  await c.post('/api/marks', { lemma: 'bord', remember: false });
  assert.equal((await c.post('/api/undo', { lemma: 'bord', kind: 'word' })).status, 409, 'changed since');
  const other = t.client();
  await other.signInAgreed('other@example.test');
  await c.post('/api/pick-up', { lemma: 'soffa' });
  assert.equal((await other.post('/api/undo', { lemma: 'soffa', kind: 'word' })).status, 409, 'only the learner\'s own last action');
});

