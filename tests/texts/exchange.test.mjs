import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { startTestGrove, seedGround } from '../fakes/harness.mjs';

const known = readFileSync(new URL('../../docs/middle/ai-test/known.txt', import.meta.url), 'utf8').split(/\s+/).filter(Boolean);
const answer = (name) => readFileSync(new URL(`./answers/${name}`, import.meta.url), 'utf8');
const withCode = (text, code) => text.replaceAll('TEST-1', code);

let t;
let reviewer;
before(async () => {
  t = await startTestGrove();
  reviewer = t.seedAccount({ email: 'reviewer@example.test', role: 'reviewer' });
  seedGround(t.grove.db, reviewer.id, known);
  const other = t.seedAccount({ email: 'other@example.test' });
  seedGround(t.grove.db, other.id, known);
});
after(() => t.close());

async function reviewerClient() {
  const c = t.client();
  await c.signInAgreed('reviewer@example.test');
  return c;
}

test('FR-201 RQ-182 RQ-40: asking for texts gives a part prompt, and asking again gives the same waiting prompt', async () => {
  const c = await reviewerClient();
  const first = await c.post('/api/prompt', { action: 'next' });
  assert.equal(first.status, 200);
  assert.equal(first.body.kind, 'part');
  assert.equal(first.body.part, 1);
  assert.equal(first.body.of, 3);
  assert.match(first.body.code, /^[A-Z]{4}-1$/);
  assert.ok(first.body.prompt.includes(first.body.code));
  const again = await c.post('/api/prompt', { action: 'next' });
  assert.equal(again.body.exchangeId, first.body.exchangeId);
});

test('FR-205 FR-215 RQ-41: pasting an answer wrapped in prose accepts it, within 2 s, and Home lists 3 texts', async () => {
  const c = await reviewerClient();
  const p = await c.post('/api/prompt', { action: 'next' });
  const started = Date.now();
  const res = await c.post('/api/answer', { exchangeId: p.body.exchangeId, answer: withCode(answer('good-in-prose.txt'), p.body.code) });
  const ms = Date.now() - started;
  assert.equal(res.status, 200, JSON.stringify(res.body));
  assert.equal(res.body.result, 'accepted', JSON.stringify(res.body));
  assert.equal(res.body.texts.length, 3);
  assert.ok(ms < 2000, `${ms} ms`);
  const home = await c.get('/api/home');
  assert.equal(home.body.texts.length, 3);
  assert.deepEqual(home.body.texts.map((x) => x.state), ['new', 'new', 'new']);
});

test('FR-217 FR-216 RQ-17 RQ-54 RQ-65 RQ-64: each text keeps its sentences with their position for exercises; new words become leaves with meaning and source, plausible inflections are learned, uses grow', () => {
  const db = t.grove.db;
  const id = reviewer.id;
  const sentences = db.prepare('SELECT * FROM sentences WHERE account_id = ? ORDER BY text_id, line_position, position').all(id);
  assert.ok(sentences.length >= 45);
  assert.ok(sentences.some((s) => s.sv === '”Hej, Elsa!” säger hon.'));
  const kopp = db.prepare("SELECT * FROM words WHERE account_id = ? AND lemma = 'kopp'").get(id);
  assert.equal(kopp.state, 'leaf');
  assert.equal(kopp.en, 'cup');
  assert.ok(kopp.source_text_id > 0);
  assert.equal(db.prepare("SELECT state FROM words WHERE account_id = ? AND lemma = 'hur mår du' AND kind = 'phrase'").get(id).state, 'leaf');
  const forms = db.prepare('SELECT f.form, w.lemma FROM word_forms f JOIN words w ON w.id = f.word_id WHERE f.account_id = ?').all(id);
  assert.ok(forms.some((f) => f.form === 'kaféet' && f.lemma === 'kafé'));
  assert.ok(db.prepare("SELECT uses FROM words WHERE account_id = ? AND lemma = 'kaffe'").get(id).uses > 0);
});

test('FR-216 RQ-64: implausible listed inflections are not learned (X-03: "Elsas → Elsa (namn)", a swapped le/ler)', async () => {
  const c = await reviewerClient();
  const p = await c.post('/api/prompt', { action: 'next' });
  const good = JSON.parse(answer('good.json'));
  good.part = p.body.code;
  good.texts = good.texts.slice(0, 1);
  good.texts[0].title = 'Andra försöket';
  good.inflections = [{ form: 'Elsas', lemma: 'Elsa (namn)' }, { form: 'le', lemma: 'ler' }, { form: 'xyz', lemma: 'kaffe' }];
  const res = await c.post('/api/answer', { exchangeId: p.body.exchangeId, answer: JSON.stringify(good) });
  assert.equal(res.body.result, 'accepted', JSON.stringify(res.body));
  const forms = t.grove.db.prepare('SELECT form FROM word_forms WHERE account_id = ?').all(reviewer.id).map((r) => r.form);
  for (const bad of ['elsas', 'le', 'xyz']) assert.ok(!forms.includes(bad), bad);
});

test('FR-205 RQ-41: the same answer again gives 409 duplicate, another part code gives 409 wrong_part, and nothing doubles', async () => {
  const c = await reviewerClient();
  const p = await c.post('/api/prompt', { action: 'next' });
  const textsBefore = (await c.get('/api/home')).body.texts.length;
  const firstAnswer = withCode(answer('good-in-prose.txt'), 'ZZZZ-9');
  const wrong = await c.post('/api/answer', { exchangeId: p.body.exchangeId, answer: firstAnswer });
  assert.equal(wrong.status, 409);
  assert.equal(wrong.body.error, 'wrong_part');
  const accepted = t.grove.db.prepare("SELECT id, code FROM exchanges WHERE account_id = ? AND status = 'accepted' ORDER BY id LIMIT 1").get(reviewer.id);
  const dup = await c.post('/api/answer', { exchangeId: p.body.exchangeId, answer: withCode(answer('good-in-prose.txt'), accepted.code) });
  assert.equal(dup.status, 409);
  assert.equal(dup.body.error, 'duplicate');
  assert.equal((await c.get('/api/home')).body.texts.length, textsBefore);
});

test('FR-205 RQ-231: an answer over 80,000 characters is refused with a plain message', async () => {
  const c = await reviewerClient();
  const p = await c.post('/api/prompt', { action: 'next' });
  const res = await c.post('/api/answer', { exchangeId: p.body.exchangeId, answer: 'a'.repeat(80001) });
  assert.equal(res.status, 400);
  assert.equal(res.body.error, 'bad_request');
});

test('FR-220 RQ-54 RQ-155: another account cannot answer, read or list this account\'s exchanges or texts', async () => {
  const c = await reviewerClient();
  const p = await c.post('/api/prompt', { action: 'next' });
  const textId = t.grove.db.prepare('SELECT id FROM texts WHERE account_id = ? LIMIT 1').get(reviewer.id).id;
  const other = t.client();
  await other.signInAgreed('other@example.test');
  const res = await other.post('/api/answer', { exchangeId: p.body.exchangeId, answer: withCode(answer('good.json'), p.body.code) });
  assert.equal(res.status, 404);
  assert.equal((await other.get(`/api/text?id=${textId}`)).status, 404);
  assert.equal((await other.get('/api/home')).body.texts.length, 0);
});
