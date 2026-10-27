import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { drillGrove } from './helpers.mjs';

let t;
let c;
let texts;
before(async () => {
  ({ t, c, texts } = await drillGrove());
  await c.post('/api/marks', { lemma: 'räkna', remember: true });
  await c.post('/api/marks', { lemma: 'gärna', remember: true });
  await c.post('/api/let-it-fall', { lemma: 'gärna', right: true });
  // A word that fell while marked To read before addendum 003 keeps that mark.
  t.grove.db.prepare("UPDATE words SET state = 'ground', drilled = 0, fell_marks = 'read' WHERE lemma = 'mörk'").run();
});
after(() => t.close());

test('FR-413 RQ-294 RQ-413 RQ-415: tokens carry the To remember mark and the marks a word had when it fell', async () => {
  const r = (await c.get(`/api/reading?id=${texts['En bra dag']}`)).body;
  const tok = (w) => r.lines.flatMap((l) => l.sentences).flatMap((s) => s.tokens).find((x) => x.t === w);
  assert.deepEqual(tok('räknar').marks, { remember: true });
  assert.deepEqual(tok('kopparna').marks, { remember: false });
  assert.equal(tok('gärna').fell, 'remember');
  assert.equal(tok('gärna').status, 'ground');
  assert.equal(tok('mörkt').fell, 'read');
});
