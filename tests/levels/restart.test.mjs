import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startTestGrove } from '../fakes/harness.mjs';

let t;
let learner;
let c;
before(async () => {
  t = await startTestGrove({ levels: true });
  learner = t.seedAccount({ email: 'learner@example.test' });
  t.seedAccount({ email: 'reviewer@example.test', role: 'reviewer' });
  c = t.client();
  await c.signInAgreed('learner@example.test');
});
after(() => t.close());

const state = (lemma) => t.grove.db.prepare('SELECT state FROM words WHERE account_id = ? AND lemma = ?').get(learner.id, lemma)?.state;
const a2Words = () => t.grove.db.prepare("SELECT lemma FROM level_words WHERE level = 'A2' AND kind = 'word' ORDER BY wpm DESC").all().map((r) => r.lemma);

test('FR-606 RQ-252: a higher level adds words; a lower one removes only untouched starting words', async () => {
  const [untouched, met, drilled, fallen] = a2Words().slice(40, 44);
  const sample = (await c.get('/api/start/sample?level=A2')).body.words.map((w) => w.lemma);
  const ticked = sample.find((l) => ![untouched, met, drilled, fallen].includes(l));
  await c.post('/api/start', { level: 'A2', unknown: [ticked] });
  const db = t.grove.db;
  db.prepare('UPDATE words SET uses = 2 WHERE account_id = ? AND lemma = ?').run(learner.id, met);
  await c.post('/api/pick-up', { lemma: drilled });
  await c.post('/api/marks', { lemma: fallen, read: true, remember: false });
  await c.post('/api/let-it-fall', { lemma: fallen, confirmed: true });
  db.prepare("INSERT INTO words (account_id, lemma, kind, state, added_at) VALUES (?, 'kanelbulle', 'word', 'ground', 1)").run(learner.id);

  await c.post('/api/start', { level: 'B1', unknown: [] });
  const b1 = t.grove.db.prepare("SELECT lemma FROM level_words WHERE level = 'B1' AND kind = 'word' LIMIT 1").get().lemma;
  assert.equal(state(b1), 'ground', 'B1 words added');

  await c.post('/api/start', { level: 'A1', unknown: [] });
  assert.equal(state(untouched), undefined, 'an untouched A2 starting word is removed');
  assert.equal(state(met), 'ground', 'a starting word met in a text stays');
  assert.equal(state(drilled), 'leaf', 'a picked-up word stays');
  assert.equal(state(fallen), 'ground', 'a word that fell from a leaf stays');
  assert.equal(state('kanelbulle'), 'ground', 'words learned elsewhere stay');
  assert.equal(state(ticked), undefined, 'an untouched ticked leaf from the first check is replaced too');
  assert.equal(state(b1), undefined, 'untouched B1 starting words are gone at A1');
});

test('FR-606 RQ-252: the reviewer can\'t restart', async () => {
  const r = t.client();
  await r.signInAgreed('reviewer@example.test');
  assert.equal((await r.get('/api/stages')).body.canRestart, false);
});
