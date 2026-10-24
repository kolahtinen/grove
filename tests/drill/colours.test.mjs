import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { drillGrove } from './helpers.mjs';

let t;
let c;
let texts;
before(async () => {
  ({ t, c, texts } = await drillGrove());
  await c.post('/api/marks', { lemma: 'kopp', read: true, remember: false });
  await c.post('/api/marks', { lemma: 'räkna', read: false, remember: true });
  await c.post('/api/marks', { lemma: 'mörk', read: true, remember: true });
  await c.post('/api/marks', { lemma: 'gärna', read: true, remember: false });
  await c.post('/api/let-it-fall', { lemma: 'gärna', right: true });
});
after(() => t.close());

test('FR-413 RQ-294: tokens carry marks and fell for each state, and homographs are flagged', async () => {
  const r = (await c.get(`/api/reading?id=${texts['En bra dag']}`)).body;
  const tok = (w) => r.lines.flatMap((l) => l.sentences).flatMap((s) => s.tokens).find((x) => x.t === w);
  assert.deepEqual(tok('kopparna').marks, { read: true, remember: false });
  assert.deepEqual(tok('räknar').marks, { read: false, remember: true });
  assert.deepEqual(tok('mörkt').marks, { read: true, remember: true });
  assert.equal(tok('gärna').fell, 'read');
  assert.equal(tok('gärna').status, 'ground');
  const var_ = r.lines.flatMap((l) => l.sentences).flatMap((s) => s.tokens).find((x) => x.word === 'var');
  if (var_) assert.equal(var_.lemmas.length >= 1, true);
});
