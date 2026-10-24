import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { startTestGrove, seedGround } from '../fakes/harness.mjs';
import { applyRating, UNDERSTOOD } from '../../server/texts/ratings.mjs';

const known = readFileSync(new URL('../../docs/middle/ai-test/known.txt', import.meta.url), 'utf8').split(/\s+/).filter(Boolean);
const good = readFileSync(new URL('./answers/good.json', import.meta.url), 'utf8');

test('FR-218 RQ-167 RQ-168 RQ-193 RQ-195: the target share starts at 95 and moves with the ratings within 93–98', () => {
  const s = { target_share: 95, shorter: 0, high_streak: 0 };
  assert.deepEqual(applyRating(s, 'almost_nothing'), { target_share: 97, shorter: 1, high_streak: 0 });
  assert.deepEqual(applyRating(s, 'a_little'), { target_share: 96, shorter: 1, high_streak: 0 });
  assert.deepEqual(applyRating(s, 'about_half'), { target_share: 95, shorter: 0, high_streak: 0 });
  let x = s;
  for (const v of ['most', 'everything']) x = applyRating(x, v);
  assert.equal(x.target_share, 95, 'two in a row change nothing yet');
  x = applyRating(x, 'most');
  assert.deepEqual(x, { target_share: 94, shorter: 0, high_streak: 0 }, 'the third in a row lowers the share by 1');
  assert.equal(applyRating({ ...s, high_streak: 2 }, 'a_little').high_streak, 0, 'a lower rating resets the streak');
  let top = s;
  for (let i = 0; i < 5; i += 1) top = applyRating(top, 'almost_nothing');
  assert.equal(top.target_share, 98);
  let bottom = s;
  for (let i = 0; i < 30; i += 1) bottom = applyRating(bottom, 'everything');
  assert.equal(bottom.target_share, 93);
});

test('FR-218 RQ-355: "most" and "everything" count as understood', () => {
  assert.deepEqual([...UNDERSTOOD].sort(), ['everything', 'most']);
});

let t;
let ids;
before(async () => {
  t = await startTestGrove();
  const learner = t.seedAccount({ email: 'learner@example.test' });
  seedGround(t.grove.db, learner.id, known);
  t.seedAccount({ email: 'other@example.test' });
  const c = t.client();
  await c.signInAgreed('learner@example.test');
  const p = await c.post('/api/prompt', { action: 'next' });
  const res = await c.post('/api/answer', { exchangeId: p.body.exchangeId, answer: good.replaceAll('TEST-1', p.body.code) });
  ids = res.body.texts.map((x) => x.id);
});
after(() => t.close());

async function learnerClient() {
  const c = t.client();
  await c.signInAgreed('learner@example.test');
  return c;
}

test('FR-218 RQ-36 RQ-46: a text shows its lines with English and its questions; opening it marks it read', async () => {
  const c = await learnerClient();
  const res = await c.get(`/api/text?id=${ids[0]}`);
  assert.equal(res.status, 200);
  assert.equal(res.body.title, 'En kall morgon');
  assert.equal(res.body.lines[0].sv, 'Det är en kall morgon i Stockholm.');
  assert.equal(res.body.lines[0].en, 'It is a cold morning in Stockholm.');
  assert.equal(res.body.questions[0].q, 'Vad heter kaféet?');
  assert.equal(res.body.questions[0].answer, undefined, 'the right option is not sent before answering');
  assert.equal((await c.get('/api/home')).body.texts.find((x) => x.id === ids[0]).state, 'read');
});

test('FR-218 RQ-46: answering a question says right or wrong and the right option; only the first answer counts', async () => {
  const c = await learnerClient();
  const wrong = await c.post('/api/question', { textId: ids[0], position: 0, option: 2 });
  assert.deepEqual(wrong.body, { right: false, rightOption: 0 });
  await c.post('/api/question', { textId: ids[0], position: 0, option: 0 });
  const stored = t.grove.db.prepare('SELECT right FROM question_answers WHERE text_id = ? AND position = 0').get(ids[0]);
  assert.equal(stored.right, 0);
  assert.equal((await c.post('/api/question', { textId: ids[0], position: 9, option: 0 })).status, 400);
});

test('FR-218 RQ-11 RQ-193: a rating is saved, a new one replaces it, and a low rating raises the share and asks for shorter sentences in the next prompt only', async () => {
  const c = await learnerClient();
  const res = await c.post('/api/rating', { textId: ids[0], value: 'a_little' });
  assert.deepEqual(res.body, { result: 'rated', targetShare: 96 });
  await c.post('/api/rating', { textId: ids[0], value: 'most' });
  assert.equal(t.grove.db.prepare('SELECT COUNT(*) AS n FROM ratings WHERE text_id = ?').get(ids[0]).n, 1);
  assert.equal(t.grove.db.prepare('SELECT value FROM ratings WHERE text_id = ?').get(ids[0]).value, 'most');
  await c.post('/api/rating', { textId: ids[1], value: 'almost_nothing' });
  const next = await c.post('/api/prompt', { action: 'next' });
  assert.match(next.body.prompt, /shorter, simpler sentences/);
  assert.match(next.body.prompt, /About 98% of the words/);
  assert.equal(t.grove.db.prepare('SELECT shorter FROM learner_settings').get().shorter, 0, 'asked once');
});

test('FR-212 RQ-378: after an answer with too few new words, the next prompt asks more firmly for new words', async () => {
  const c = await learnerClient();
  t.grove.db.prepare('UPDATE learner_settings SET firm_new = 1').run();
  const waiting = await c.get('/api/home');
  if (waiting.body.waiting) t.grove.db.prepare("UPDATE exchanges SET status = 'replaced' WHERE id = ?").run(waiting.body.waiting.exchangeId);
  const next = await c.post('/api/prompt', { action: 'next' });
  assert.match(next.body.prompt, /too few new words/);
});

test('FR-220 RQ-155: another account cannot read, answer or rate this account\'s texts', async () => {
  const other = t.client();
  await other.signInAgreed('other@example.test');
  assert.equal((await other.get(`/api/text?id=${ids[0]}`)).status, 404);
  assert.equal((await other.post('/api/question', { textId: ids[0], position: 0, option: 0 })).status, 404);
  assert.equal((await other.post('/api/rating', { textId: ids[0], value: 'most' })).status, 404);
  assert.equal((await other.get('/api/text?id=abc')).status, 404);
});
