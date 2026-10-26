import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readingGrove, signedIn, tokensOf } from './helpers.mjs';

let t;
let learner;
let c;
let id;
before(async () => {
  ({ t, learner } = await readingGrove());
  c = await signedIn(t);
});
after(() => t.close());

const OWN = 'Idag är det sol i Stockholm.\nJag dricker kaffe och äter en kanelbulle på ett kafé. Det är gott!';

test('FR-318 RQ-74: an own text is saved without English, split into lines and sentences, and listed as own', async () => {
  const res = await c.post('/api/own-text', { title: 'Min dag', text: OWN });
  assert.equal(res.status, 200);
  id = res.body.id;
  const row = t.grove.db.prepare('SELECT own, exchange_id FROM texts WHERE id = ?').get(id);
  assert.deepEqual({ ...row }, { own: 1, exchange_id: null });
  const lines = t.grove.db.prepare('SELECT sv, en FROM text_lines WHERE text_id = ? ORDER BY position').all(id);
  assert.equal(lines.length, 2);
  assert.ok(lines.every((l) => l.en === ''));
  assert.equal(t.grove.db.prepare('SELECT COUNT(*) AS n FROM sentences WHERE text_id = ?').get(id).n, 3);
  const home = (await c.get('/api/home')).body;
  assert.equal(home.texts.find((x) => x.id === id).own, true);
  const r = (await c.get(`/api/reading?id=${id}`)).body;
  assert.equal(r.own, true);
  assert.equal(tokensOf(r).find((x) => x.t === 'kanelbulle').status, 'new');
  assert.equal(tokensOf(r).find((x) => x.t === 'Stockholm').status, 'name');
  assert.equal((await c.post('/api/own-text', { title: 'Lång', text: 'a'.repeat(20001) })).status, 400);
});

test('FR-318 RQ-74: Save as leaf adds a new word without a meaning; Get meanings makes a meanings prompt, or says nothing is missing', async () => {
  assert.deepEqual((await c.post('/api/leaf', { textId: id, form: 'Kanelbulle' })).body, { result: 'saved' });
  const leaf = t.grove.db.prepare("SELECT state, en, source_text_id FROM words WHERE account_id = ? AND lemma = 'kanelbulle'").get(learner.id);
  assert.deepEqual({ ...leaf }, { state: 'leaf', en: null, source_text_id: id });
  const m = await c.post('/api/meanings-prompt', {});
  assert.equal(m.status, 200);
  assert.match(m.body.prompt, /kanelbulle/);
  const ex = t.grove.db.prepare('SELECT package_id, kind FROM exchanges WHERE id = ?').get(m.body.exchangeId);
  assert.deepEqual({ ...ex }, { package_id: null, kind: 'meanings' });
  const filled = await c.post('/api/answer', { exchangeId: m.body.exchangeId, answer: JSON.stringify({ meanings: [{ form: 'kanelbulle', lemma: 'kanelbulle', en: 'cinnamon bun', explain_sv: 'En söt bulle.' }] }) });
  assert.equal(filled.body.result, 'meanings_added');
  assert.equal((await c.post('/api/meanings-prompt', {})).status, 409);
});

test('FR-318 FR-207 RQ-74 RQ-379: Get meanings stores the forms it asks about with its exchange', async () => {
  assert.deepEqual((await c.post('/api/leaf', { textId: id, form: 'Semla' })).body, { result: 'saved' });
  const m = await c.post('/api/meanings-prompt', {});
  assert.equal(m.status, 200);
  const asked = JSON.parse(t.grove.db.prepare('SELECT asked_forms FROM exchanges WHERE id = ?').get(m.body.exchangeId).asked_forms);
  assert.deepEqual(asked, ['semla']);
  const filled = await c.post('/api/answer', { exchangeId: m.body.exchangeId, answer: JSON.stringify({ meanings: [{ form: 'semla', lemma: 'semla', en: 'cream bun', explain_sv: 'En bulle med grädde.' }] }) });
  assert.equal(filled.body.result, 'meanings_added');
});

test('FR-319 RQ-155: another account cannot read the own text or save leaves from it', async () => {
  const other = await signedIn(t, 'other@example.test');
  assert.equal((await other.get(`/api/reading?id=${id}`)).status, 404);
  assert.equal((await other.post('/api/leaf', { textId: id, form: 'kanelbulle' })).status, 404);
});

test('FR-318 FR-207 RQ-74 RQ-379: the answer to a Get meanings prompt fills the leaf it asked about', async () => {
  assert.deepEqual((await c.post('/api/leaf', { textId: id, form: 'Prinsesstårta' })).body, { result: 'saved' });
  const m = await c.post('/api/meanings-prompt', {});
  assert.equal(m.status, 200);
  const filled = await c.post('/api/answer', { exchangeId: m.body.exchangeId, answer: JSON.stringify({ meanings: [{ form: 'prinsesstårta', lemma: 'prinsesstårta', en: 'princess cake', explain_sv: 'En grön tårta.' }] }) });
  assert.equal(filled.body.result, 'meanings_added');
  assert.equal(filled.body.filled, 1);
  assert.equal(filled.body.missing, 0);
  const leaf = t.grove.db.prepare("SELECT en, explain_sv FROM words WHERE account_id = ? AND lemma = 'prinsesstårta'").get(learner.id);
  assert.deepEqual({ ...leaf }, { en: 'princess cake', explain_sv: 'En grön tårta.' });
});
