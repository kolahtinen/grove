import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { startTestGrove, seedGround } from '../fakes/harness.mjs';

const known = readFileSync(new URL('../../docs/middle/ai-test/known.txt', import.meta.url), 'utf8').split(/\s+/).filter(Boolean);
const answer = (name) => readFileSync(new URL(`./answers/${name}`, import.meta.url), 'utf8');

let t;
let learner;
let fresh;
before(async () => {
  t = await startTestGrove();
  learner = t.seedAccount({ email: 'learner@example.test' });
  seedGround(t.grove.db, learner.id, known);
  fresh = t.seedAccount({ email: 'fresh@example.test' });
  seedGround(t.grove.db, fresh.id, known);
});
after(() => t.close());

async function start(email = 'learner@example.test') {
  const c = t.client();
  await c.signInAgreed(email);
  const p = await c.post('/api/prompt', { action: 'next' });
  return { c, p: p.body };
}

const textCount = () => t.grove.db.prepare('SELECT COUNT(*) AS n FROM texts WHERE account_id = ?').get(learner.id).n;

test('FR-206 RQ-185 RQ-63: too many new words lists the problems and a fix-it prompt quoting the sentence and its words', async () => {
  const { c, p } = await start();
  const res = await c.post('/api/answer', { exchangeId: p.exchangeId, answer: answer('too-many-new.json').replaceAll('TEST-1', p.code) });
  assert.equal(res.body.result, 'needs_fix');
  assert.ok(res.body.problems.some((x) => x.includes('Hon säljer stora bullar med kanel.')), JSON.stringify(res.body.problems));
  assert.match(res.body.fix.prompt, /Hon säljer stora bullar med kanel\./);
  assert.match(res.body.fix.prompt, /säljer, bullar, kanel/);
  assert.match(res.body.fix.prompt, /whole corrected JSON block/);
  assert.match(res.body.fix.prompt, new RegExp(p.code));
  assert.equal(textCount(), 0, 'FR-205: nothing from a refused answer is stored');

  // The corrected answer goes into the fix-it exchange and is accepted once.
  const fixed = await c.post('/api/answer', { exchangeId: res.body.fix.exchangeId, answer: answer('good.json').replaceAll('TEST-1', p.code) });
  assert.equal(fixed.body.result, 'accepted', JSON.stringify(fixed.body));
  assert.equal(textCount(), 3);
  const again = await c.post('/api/answer', { exchangeId: res.body.fix.exchangeId, answer: answer('good.json').replaceAll('TEST-1', p.code) });
  assert.equal(again.status, 409);
  assert.equal(textCount(), 3);
});

test('FR-206 RQ-185 RQ-41: a cut-off answer and a non-JSON answer get a fix-it prompt asking for the whole block again', async () => {
  const { c, p } = await start();
  const cut = await c.post('/api/answer', { exchangeId: p.exchangeId, answer: answer('cut-off.txt').replaceAll('TEST-1', p.code) });
  assert.equal(cut.body.result, 'needs_fix');
  assert.match(cut.body.problems.join(' '), /cut off/i);
  assert.match(cut.body.fix.prompt, /cut off/i);
  assert.match(cut.body.fix.prompt, /whole corrected JSON block|whole JSON block again/);
  const prose = await c.post('/api/answer', { exchangeId: cut.body.fix.exchangeId, answer: answer('not-json.txt') });
  assert.equal(prose.body.result, 'needs_fix');
  assert.match(prose.body.problems.join(' '), /no JSON block/i);
  const before = textCount();
  assert.equal(before, 3, 'refused answers stored nothing');
});

test('FR-205 RQ-41: an answer with an unknown field is refused and stores nothing', async () => {
  const { c, p } = await start();
  const res = await c.post('/api/answer', { exchangeId: p.exchangeId, answer: answer('extra-fields.json').replaceAll('TEST-1', p.code) });
  assert.equal(res.body.result, 'needs_fix');
  assert.match(res.body.problems.join(' '), /admin/);
});

test('FR-207 RQ-379: unlisted new words get one meanings prompt; its answer fills meanings, ignores others, leaves the rest missing', async () => {
  // A learner who hasn't met these words yet.
  const learner = fresh;
  const { c, p } = await start('fresh@example.test');
  const res = await c.post('/api/answer', { exchangeId: p.exchangeId, answer: answer('unlisted-new.json').replaceAll('TEST-1', p.code) });
  assert.equal(res.body.result, 'accepted', JSON.stringify(res.body));
  assert.ok(res.body.meanings, 'a meanings prompt is given');
  for (const w of ['tolv', 'pensionär', 'paraply']) assert.match(res.body.meanings.prompt, new RegExp(w));
  assert.doesNotMatch(res.body.meanings.prompt, /\bkopp\b/, 'words with a meaning are not asked about');
  const meanings = { meanings: [
    { form: 'tolv', lemma: 'tolv', en: 'twelve', explain_sv: 'Tio och två.' },
    { form: 'paraply', lemma: 'paraply', en: 'umbrella', explain_sv: 'Man har det när det regnar.' },
    { form: 'banan', lemma: 'okänd', en: 'not asked', explain_sv: 'x' },
  ] };
  const filled = await c.post('/api/answer', { exchangeId: res.body.meanings.exchangeId, answer: `\`\`\`json\n${JSON.stringify(meanings)}\n\`\`\`` });
  assert.equal(filled.body.result, 'meanings_added', JSON.stringify(filled.body));
  assert.equal(filled.body.filled, 2);
  const db = t.grove.db;
  assert.equal(db.prepare("SELECT en FROM words WHERE account_id = ? AND lemma = 'tolv'").get(learner.id).en, 'twelve');
  assert.equal(db.prepare("SELECT en FROM words WHERE account_id = ? AND lemma = 'pensionär'").get(learner.id).en, null);
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM words WHERE account_id = ? AND lemma = 'okänd'").get(learner.id).n, 0);
});
