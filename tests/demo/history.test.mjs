import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startTestGrove } from '../fakes/harness.mjs';
import { createAccount } from '../../server/owner/setup.mjs';

let t;
let reviewer;
let other;
let ms;
before(async () => {
  t = await startTestGrove({ levels: true });
  other = t.seedAccount({ email: 'other@example.test' });
  const started = Date.now();
  reviewer = await createAccount({ db: t.grove.db, seclog: t.grove.seclog, firebase: t.grove.firebase, role: 'reviewer', email: 'reviewer@example.test', password: 'Forest-walk-42' });
  ms = Date.now() - started;
});
after(() => t.close());

const q = (sql, ...a) => t.grove.db.prepare(sql).all(...a);

test('FR-704 FR-701 RQ-362 RQ-360: reviewer:setup puts in the demo history: ground, texts in a finished package, ratings, answers, drilled leaves, minutes', () => {
  assert.ok(ms < 2000, `setup took ${ms} ms`);
  const id = reviewer.id;
  const ground = q("SELECT COUNT(*) AS n FROM words WHERE account_id = ? AND state = 'ground'", id)[0].n;
  assert.ok(ground > 390 && ground < 420, `${ground} ground words`);
  const texts = q('SELECT title, package_id FROM texts WHERE account_id = ? ORDER BY position', id);
  assert.equal(texts.length, 4);
  assert.equal(new Set(texts.map((x) => x.package_id)).size, 1);
  assert.equal(q('SELECT status FROM packages WHERE account_id = ?', id)[0].status, 'finished');
  assert.deepEqual(q('SELECT value FROM ratings WHERE account_id = ? ORDER BY value', id).map((r) => r.value), ['a_little', 'most']);
  assert.ok(q('SELECT COUNT(*) AS n FROM question_answers WHERE account_id = ?', id)[0].n >= 2);
  const drilled = q('SELECT lemma, to_read, to_remember, gap_days FROM words WHERE account_id = ? AND drilled = 1', id);
  assert.equal(drilled.length, 6);
  assert.ok(drilled.some((d) => d.to_remember) && drilled.some((d) => d.to_read));
  assert.ok(drilled.some((d) => d.gap_days === 2.5));
  const days = q('SELECT day FROM input_days WHERE account_id = ?', id);
  assert.equal(days.length, 3);
  assert.equal(q('SELECT welcome_dismissed FROM learner_settings WHERE account_id = ?', id)[0].welcome_dismissed, 0);
});

test('FR-705 FR-704 RQ-363 RQ-362: the reviewer skips the starting check, has no restart, and Review, Master and the next prompt have something to show', async () => {
  const c = t.client();
  await c.signInAgreed('reviewer@example.test', 'Forest-walk-42');
  const s = (await c.get('/api/stages')).body;
  assert.equal(s.needsStart, false);
  assert.equal(s.canRestart, false);
  assert.equal(s.review.fading, 1);
  assert.equal(s.review.due, 3);
  assert.ok(s.master >= 1);
  const review = (await c.get('/api/review?mode=review')).body;
  assert.equal(review.items[0].lemma, 'glömma', 'the fading leaf first');
  const p = (await c.post('/api/prompt', { action: 'next' })).body;
  assert.equal(p.part, 1);
  assert.equal(p.carriesSummary, true);
  // The summary is in the setup since G-02 FR-203 changed (2026-10-26).
  assert.match(p.steps[0], /"En kall morgon": understood most/);
  assert.match(p.steps[0], /"Lördag på torget": understood a little/);
  const days = (await c.get('/api/progress')).body.days.filter((d) => d.minutes > 0);
  assert.equal(days.length, 3);
});

test('FR-704 RQ-362: another account is untouched by the demo', () => {
  assert.equal(q('SELECT COUNT(*) AS n FROM texts WHERE account_id = ?', other.id)[0].n, 0);
  assert.equal(q('SELECT COUNT(*) AS n FROM words WHERE account_id = ?', other.id)[0].n, 0);
});

test('FR-704 FR-702 RQ-399 RQ-361: the demo ground words have their checked meanings and Swedish explanations, and the dialogue is a listening text', () => {
  const id = reviewer.id;
  const lacking = q("SELECT COUNT(*) AS n FROM words WHERE account_id = ? AND state = 'ground' AND (en IS NULL OR explain_sv IS NULL)", id)[0].n;
  assert.equal(lacking, 0);
  assert.deepEqual(q("SELECT en, en_source FROM words WHERE account_id = ? AND lemma = 'efter'", id).map((r) => ({ ...r })), [{ en: 'after', en_source: 'ai' }]);
  assert.deepEqual(q('SELECT title, kind FROM texts WHERE account_id = ? ORDER BY position', id).map((r) => r.kind), ['reading', 'reading', 'listening', 'reading']);
  assert.equal(q("SELECT COUNT(*) AS n FROM words WHERE account_id = ? AND en IS NULL AND kind = 'word'", id)[0].n, 0, 'no demo word without a meaning');
});

test('FR-224 RQ-406: the demo\'s prepared texts carry no beta badge', async () => {
  const c = t.client();
  await c.signInAgreed('reviewer@example.test', 'Forest-walk-42');
  const texts = (await c.get('/api/home')).body.texts;
  assert.equal(texts.length, 4);
  assert.ok(texts.every((x) => x.beta === false));
  assert.equal((await c.get(`/api/reading?id=${texts[0].id}`)).body.beta, false);
});
