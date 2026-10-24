import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readingGrove, signedIn, addPart } from './helpers.mjs';

let t;
let c;
before(async () => {
  ({ t } = await readingGrove());
  c = await signedIn(t);
  const { res } = await addPart(c);
  assert.equal(res.result, 'accepted', JSON.stringify(res));
});
after(() => t.close());

test('FR-316 RQ-53 RQ-205 RQ-357: the dictionary lists every word, phrase and pattern met, with translation, state and an example sentence', async () => {
  const d = (await c.get('/api/dictionary')).body;
  const kopp = d.items.find((i) => i.lemma === 'kopp' && i.kind === 'word');
  assert.equal(kopp.en, 'cup');
  assert.equal(kopp.state, 'leaf');
  assert.match(kopp.example, /kopp/i);
  assert.ok(d.items.some((i) => i.kind === 'phrase' && i.lemma === 'hur mår du'));
  assert.ok(d.items.some((i) => i.kind === 'pattern' && i.lemma === 'har + supine'));
  const ground = d.items.find((i) => i.lemma === 'kaffe');
  assert.equal(ground.state, 'ground');
  assert.match(ground.example, /kaffe/i, 'a ground word met in a text shows where');
  const unseen = d.items.find((i) => i.lemma === 'hundra');
  assert.equal(unseen.example, null, 'a ground word never met in a text has no example');
});

test('FR-317 RQ-56: names are listed apart and not among the items', async () => {
  const d = (await c.get('/api/dictionary')).body;
  assert.ok(d.names.includes('Elsa'));
  assert.ok(!d.items.some((i) => i.lemma === 'elsa'));
});

test('FR-319 RQ-155: the dictionary lists only the learner\'s own words', async () => {
  const other = await signedIn(t, 'other@example.test');
  const d = (await other.get('/api/dictionary')).body;
  assert.ok(!d.items.some((i) => i.lemma === 'kopp'));
  assert.deepEqual(d.names, []);
});
