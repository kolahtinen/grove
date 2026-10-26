import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { startTestGrove, seedGround } from '../fakes/harness.mjs';

const known = readFileSync(new URL('../../docs/middle/ai-test/known.txt', import.meta.url), 'utf8').split(/\s+/).filter(Boolean);
const good = JSON.parse(readFileSync(new URL('./answers/good.json', import.meta.url), 'utf8'));

let t;
let learner;
before(async () => {
  t = await startTestGrove();
  learner = t.seedAccount({ email: 'learner@example.test' });
  seedGround(t.grove.db, learner.id, known);
});
after(() => t.close());

async function client() {
  const c = t.client();
  await c.signInAgreed('learner@example.test');
  return c;
}

// A distinct valid answer for a part (titles differ so answers never repeat).
function answerFor(code, n) {
  const a = structuredClone(good);
  a.part = code;
  a.texts.forEach((x, i) => { x.title = `${x.title} ${n}.${i}`; });
  return JSON.stringify(a);
}

async function acceptPart(c, n) {
  const p = await c.post('/api/prompt', { action: 'next' });
  const res = await c.post('/api/answer', { exchangeId: p.body.exchangeId, answer: answerFor(p.body.code, n) });
  assert.equal(res.body.result, 'accepted', JSON.stringify(res.body));
  return { prompt: p.body, texts: res.body.texts };
}

test('FR-203 RQ-01 RQ-02 RQ-186 RQ-188 RQ-390: part 1 of the first package comes after the setup (known words, no summary yet); parts 2 and 3 are short requests in the same chat', async () => {
  const c = await client();
  const one = await acceptPart(c, 1);
  assert.equal(one.prompt.part, 1);
  assert.equal(one.prompt.carriesSummary, false, 'nothing done yet, so nothing to summarise');
  assert.ok(one.prompt.steps.length >= 2, 'rules and format, then the known words');
  assert.match(one.prompt.steps[0], /new chat|Until I ask for texts/);
  assert.match(one.prompt.steps.slice(1).join(' '), /My known words/);
  assert.match(one.prompt.prompt, /"[A-Z]{4}-1"/);
  const two = await acceptPart(c, 2);
  assert.equal(two.prompt.part, 2);
  assert.deepEqual(two.prompt.steps, [], 'no setup in the same chat');
  assert.equal(two.prompt.carriesSummary, false);
  assert.match(two.prompt.prompt, /continue the story and characters/i);
  assert.doesNotMatch(two.prompt.prompt, /My known words/);
  assert.match(two.prompt.prompt, /"[A-Z]{4}-2"/);
  const three = await acceptPart(c, 3);
  assert.equal(three.prompt.part, 3);
});

test('FR-203 RQ-188: with all 3 parts in but texts unrated, the next request says to rate them or start a new package', async () => {
  const c = await client();
  const res = await c.post('/api/prompt', { action: 'next' });
  assert.equal(res.status, 409);
  assert.equal(res.body.error, 'package_waiting');
});

test('FR-203 RQ-01 RQ-02 RQ-11: when the package is finished, part 1 of the next carries a summary of exactly the texts done since the last summary', async () => {
  const c = await client();
  const texts = t.grove.db.prepare('SELECT id, title FROM texts WHERE account_id = ? ORDER BY id').all(learner.id);
  assert.equal(texts.length, 9);
  await c.post('/api/question', { textId: texts[0].id, position: 0, option: 0 });
  await c.post('/api/question', { textId: texts[0].id, position: 1, option: 0 });
  for (const x of texts) await c.post('/api/rating', { textId: x.id, value: 'most' });
  const next = await c.post('/api/prompt', { action: 'next' });
  assert.equal(next.status, 200);
  assert.equal(next.body.part, 1);
  assert.equal(next.body.carriesSummary, true);
  const setup = next.body.steps[0];
  assert.match(setup, /What I did since my last package:/);
  assert.match(setup, new RegExp(`"${texts[0].title}": understood most; questions right 1 of 2`));
  for (const x of texts) assert.ok(setup.includes(`"${x.title}"`), x.title);
  assert.doesNotMatch(next.body.steps.join('\n') + next.body.prompt, /reviewer@|learner@|password/i, 'only what changed, no learner data');
});

test('FR-203 RQ-01: a new package asked for early closes the open one, and its summary lists only what changed since', async () => {
  const c = await client();
  const open = t.grove.db.prepare("SELECT id FROM packages WHERE account_id = ? AND status = 'open'").get(learner.id);
  const first = t.grove.db.prepare('SELECT id, title FROM texts WHERE account_id = ? ORDER BY id LIMIT 1').get(learner.id);
  await c.post('/api/rating', { textId: first.id, value: 'about_half' });
  const res = await c.post('/api/prompt', { action: 'new_package' });
  assert.equal(res.body.part, 1);
  assert.equal(t.grove.db.prepare('SELECT status FROM packages WHERE id = ?').get(open.id).status, 'closed');
  assert.equal(res.body.carriesSummary, true);
  assert.match(res.body.steps[0], new RegExp(`"${first.title}": understood about half`));
  const summaryLines = res.body.steps[0].split('What I did since my last package:\n')[1].split('\n\n')[0].split('\n');
  assert.equal(summaryLines.length, 1, 'only the text rated since the last summary');
});

test('FR-203 RQ-188: two requests at once open one package only', async () => {
  const c = await client();
  await Promise.all([c.post('/api/prompt', { action: 'next' }), c.post('/api/prompt', { action: 'next' })]);
  assert.equal(t.grove.db.prepare("SELECT COUNT(*) AS n FROM packages WHERE account_id = ? AND status = 'open'").get(learner.id).n, 1);
});

test('FR-203 RQ-391: I\'m in a new chat gives the setup again, with the summary already sent, before the same request; without a waiting request it says so', async () => {
  const c = await client();
  const p = (await c.post('/api/prompt', { action: 'next' })).body;
  const again = await c.post('/api/prompt', { action: 'new_chat' });
  assert.equal(again.status, 200);
  assert.equal(again.body.exchangeId, p.exchangeId);
  assert.equal(again.body.prompt, p.prompt);
  assert.ok(again.body.steps.length >= 2);
  assert.equal(again.body.steps[0], p.steps[0], 'the same setup, with the summary already sent');
  const home = await c.get('/api/home');
  assert.deepEqual(home.body.waiting.steps, again.body.steps);

  const other = t.seedAccount({ email: 'nothing-waiting@example.test' });
  seedGround(t.grove.db, other.id, known);
  const o = t.client();
  await o.signInAgreed('nothing-waiting@example.test');
  const none = await o.post('/api/prompt', { action: 'new_chat' });
  assert.equal(none.status, 409);
  assert.equal(none.body.error, 'nothing_waiting');
});

test('FR-203 FR-202 FR-223 RQ-394 RQ-393 RQ-404: with the whole-package tactic, one request after the setup asks for all 3 parts; its answer fills the package', async () => {
  const whole = t.seedAccount({ email: 'whole@example.test' });
  seedGround(t.grove.db, whole.id, known);
  const c = t.client();
  await c.signInAgreed('whole@example.test');
  const plan = await c.post('/api/plan', { family: 'chatgpt', product: 'plus' });
  assert.deepEqual(plan.body, { family: 'chatgpt', product: 'plus', tactic: 'whole', recommended: 'whole' });
  assert.equal((await c.get('/api/home')).body.plan.tactic, 'whole');
  const p = (await c.post('/api/prompt', { action: 'next' })).body;
  assert.equal(p.kind, 'package');
  assert.match(p.code, /^[A-Z]{4}$/);
  assert.ok(p.steps.length >= 2);
  assert.match(p.prompt, /all 3 parts/);
  const a = structuredClone(good);
  a.part = p.code;
  a.texts = [1, 2, 3].flatMap((part) => good.texts.map((x, i) => ({ ...structuredClone(x), part, title: `${x.title} ${part}.${i}` })));
  const res = await c.post('/api/answer', { exchangeId: p.exchangeId, answer: JSON.stringify(a) });
  assert.equal(res.body.result, 'accepted', JSON.stringify(res.body));
  assert.equal(res.body.texts.length, 9);
  const pkg = t.grove.db.prepare("SELECT parts_accepted FROM packages WHERE account_id = ? AND status = 'open'").get(whole.id);
  assert.equal(pkg.parts_accepted, 3);
  const kinds = t.grove.db.prepare('SELECT part_no, kind, COUNT(*) AS n FROM texts WHERE account_id = ? GROUP BY part_no, kind ORDER BY part_no, kind').all(whole.id).map((r) => `${r.part_no}${r.kind[0]}${r.n}`);
  assert.deepEqual(kinds, ['1l1', '1r2', '2l1', '2r2', '3l1', '3r2']);
});

test('FR-203 FR-223 RQ-404: with one long prompt, every request carries the rules, the format and the known words itself, with no setup steps; the first also the summary', async () => {
  const long = t.seedAccount({ email: 'long@example.test' });
  seedGround(t.grove.db, long.id, known);
  const c = t.client();
  await c.signInAgreed('long@example.test');
  assert.deepEqual((await c.post('/api/plan', { family: 'lechat', product: 'free' })).body, { family: 'lechat', product: 'free', tactic: 'long', recommended: 'long' });
  const one = (await c.post('/api/prompt', { action: 'next' })).body;
  assert.deepEqual(one.steps, []);
  assert.match(one.prompt, /at most ONE new word/);
  assert.match(one.prompt, /"meaning_checks"/, 'the answer format is in the request');
  assert.ok(one.prompt.includes(known[0]) && one.prompt.includes(known.at(-1)), 'the known words are in the request');
  assert.doesNotMatch(one.prompt, /reply only with "OK"/i);
  const res = await c.post('/api/answer', { exchangeId: one.exchangeId, answer: answerFor(one.code, 40) });
  assert.equal(res.body.result, 'accepted', JSON.stringify(res.body));
  const two = (await c.post('/api/prompt', { action: 'next' })).body;
  assert.equal(two.part, 2);
  assert.deepEqual(two.steps, []);
  assert.ok(two.prompt.includes(known[0]), 'a later request carries the known words too');
  assert.deepEqual((await c.post('/api/prompt', { action: 'new_chat' })).body.steps, [], 'nothing to resend');
});

test('FR-223 RQ-403: a chosen tactic other than the recommended one is kept; a product of another AI is refused; Home lists the menus', async () => {
  const pick = t.seedAccount({ email: 'pick@example.test' });
  seedGround(t.grove.db, pick.id, known);
  const c = t.client();
  await c.signInAgreed('pick@example.test');
  const home = (await c.get('/api/home')).body;
  assert.deepEqual([home.plan.family, home.plan.product, home.plan.tactic], [null, null, 'steps']);
  assert.ok(home.plan.families.find((f) => f.id === 'gemini').products.length >= 2);
  assert.deepEqual((await c.post('/api/plan', { family: 'gemini', product: 'free', tactic: 'steps' })).body, { family: 'gemini', product: 'free', tactic: 'steps', recommended: 'long' });
  assert.equal((await c.post('/api/plan', { family: 'gemini', product: 'plus' })).status, 400);
  assert.equal((await c.get('/api/home')).body.plan.tactic, 'steps');
});


test('FR-224 RQ-406: texts from the learner\'s own AI are marked beta on Home and on the reading page', async () => {
  const c = await client();
  const home = (await c.get('/api/home')).body;
  assert.ok(home.texts.length > 0);
  assert.ok(home.texts.every((x) => x.beta === true));
  assert.equal((await c.get(`/api/reading?id=${home.texts[0].id}`)).body.beta, true);
});

test('FR-223 RQ-405: switching to one long prompt takes effect in the open package; switching back gives the setup first', async () => {
  const sw = t.seedAccount({ email: 'switch@example.test' });
  seedGround(t.grove.db, sw.id, known);
  const c = t.client();
  await c.signInAgreed('switch@example.test');
  await c.post('/api/plan', { family: 'lechat', product: 'free', tactic: 'long' });
  const one = (await c.post('/api/prompt', { action: 'next' })).body;
  assert.equal((await c.post('/api/answer', { exchangeId: one.exchangeId, answer: answerFor(one.code, 50) })).body.result, 'accepted');
  await c.post('/api/plan', { family: 'lechat', product: 'free', tactic: 'steps' });
  const two = (await c.post('/api/prompt', { action: 'next' })).body;
  assert.ok(two.steps.length >= 2, 'step by step starts with the setup this chat never had');
  assert.equal((await c.post('/api/answer', { exchangeId: two.exchangeId, answer: answerFor(two.code, 51) })).body.result, 'accepted');
  await c.post('/api/plan', { family: 'lechat', product: 'free', tactic: 'long' });
  const three = (await c.post('/api/prompt', { action: 'next' })).body;
  assert.deepEqual(three.steps, []);
  assert.ok(three.prompt.includes(known[0]), 'one long prompt again, in the same package');
});
