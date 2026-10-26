import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { drillGrove, word } from './helpers.mjs';

let t;
let learner;
let c;
let texts;
before(async () => { ({ t, learner, c, texts } = await drillGrove()); });
after(() => t.close());

test('FR-401 RQ-52 RQ-203 RQ-204: the marking step lists the text\'s unmarked leaves; marked ones are drilled, the rest fall', async () => {
  const id = texts['En bra dag'];
  const list = await c.get(`/api/marking?textId=${id}`);
  assert.equal(list.status, 200);
  const lemmas = list.body.words.map((w) => w.lemma).sort();
  for (const l of ['kopp', 'räkna', 'mörk', 'gärna', 'släcka', 'chef']) assert.ok(lemmas.includes(l), l);
  assert.equal(list.body.words.find((w) => w.lemma === 'räkna').en, 'counts');
  const marks = list.body.words.map((w) => ({ lemma: w.lemma, kind: w.kind, read: ['kopp', 'räkna'].includes(w.lemma), remember: w.lemma === 'räkna' }));
  marks.push({ lemma: 'tolv', read: true, remember: false });
  const res = await c.post('/api/marking', { textId: id, marks });
  assert.deepEqual(res.body, { drilled: 2, fell: list.body.words.length - 2 });
  const kopp = word(t, learner.id, 'kopp');
  assert.deepEqual([kopp.state, kopp.drilled, kopp.to_read, kopp.to_remember, kopp.gap_days], ['leaf', 1, 1, 0, 1]);
  const rakna = word(t, learner.id, 'räkna');
  assert.deepEqual([rakna.to_read, rakna.to_remember], [1, 1]);
  assert.equal(word(t, learner.id, 'gärna').state, 'ground');
  assert.equal(word(t, learner.id, 'tolv').drilled, 0, 'a word not among this text\'s unmarked leaves is ignored');
  assert.deepEqual((await c.get(`/api/marking?textId=${id}`)).body.words, []);
});

test('FR-402 RQ-34 RQ-204: fallen words count as known in the next prompt and the reading counts; unmarked leaves still count as new', async () => {
  // The known words travel in the setup since G-02 FR-203 changed (2026-10-26): ask for it again.
  await c.post('/api/prompt', { action: 'next' });
  const p = await c.post('/api/prompt', { action: 'new_chat' });
  const knownLine = p.body.steps.slice(1).map((step) => step.split('\n\n').at(-1)).join(', ');
  assert.ok(knownLine.includes('gärna'), 'a fallen word is known');
  assert.ok(!/\bkopp\b/.test(knownLine), 'a drilled leaf is not known');
  assert.ok(!/\btolv\b/.test(knownLine), 'an unmarked leaf is not known');
  const r = (await c.get(`/api/reading?id=${texts['En bra dag']}`)).body;
  const gärna = r.lines.flatMap((l) => l.sentences).find((s) => s.sv.includes('gärna'));
  assert.equal(gärna.newCount, 0);
  assert.equal(r.marking, 0);
  assert.ok((await c.get(`/api/reading?id=${texts['Olles väska']}`)).body.marking > 0);
});

test('FR-419 RQ-155: another account cannot see or mark this account\'s text', async () => {
  const other = t.client();
  await other.signInAgreed('other@example.test');
  assert.equal((await other.get(`/api/marking?textId=${texts['Olles väska']}`)).status, 404);
  assert.equal((await other.post('/api/marking', { textId: texts['Olles väska'], marks: [] })).status, 404);
});
