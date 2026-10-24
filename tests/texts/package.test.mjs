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

test('FR-203 RQ-01 RQ-02 RQ-186 RQ-188: part 1 of the first package carries no summary yet; parts 2 and 3 are self-contained, with a continue hint and no summary', async () => {
  const c = await client();
  const one = await acceptPart(c, 1);
  assert.equal(one.prompt.part, 1);
  assert.equal(one.prompt.carriesSummary, false, 'nothing done yet, so nothing to summarise');
  const two = await acceptPart(c, 2);
  assert.equal(two.prompt.part, 2);
  assert.equal(two.prompt.carriesSummary, false);
  assert.match(two.prompt.prompt, /continue their story and characters/);
  assert.match(two.prompt.prompt, /Use my known words/);
  assert.match(two.prompt.prompt, /"part": "[A-Z]{4}-2"/);
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
  assert.match(next.body.prompt, /What I did since my last package:/);
  assert.match(next.body.prompt, new RegExp(`"${texts[0].title}": understood most; questions right 1 of 2`));
  for (const x of texts) assert.ok(next.body.prompt.includes(`"${x.title}"`), x.title);
  assert.doesNotMatch(next.body.prompt, /reviewer@|learner@|password/i, 'only what changed, no learner data');
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
  assert.match(res.body.prompt, new RegExp(`"${first.title}": understood about half`));
  const summaryLines = res.body.prompt.split('What I did since my last package:\n')[1].split('\n\n')[0].split('\n');
  assert.equal(summaryLines.length, 1, 'only the text rated since the last summary');
});

test('FR-203 RQ-188: two requests at once open one package only', async () => {
  const c = await client();
  await Promise.all([c.post('/api/prompt', { action: 'next' }), c.post('/api/prompt', { action: 'next' })]);
  assert.equal(t.grove.db.prepare("SELECT COUNT(*) AS n FROM packages WHERE account_id = ? AND status = 'open'").get(learner.id).n, 1);
});
