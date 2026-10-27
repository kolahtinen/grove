import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { drillGrove, word, DAY } from './helpers.mjs';

let t;
let learner;
let c;
let clock;
let texts;
before(async () => {
  ({ t, learner, c, clock, texts } = await drillGrove());
  const db = t.grove.db;
  // Drilled leaves To remember of different ages: kopp fading, räkna and tolv due, mörk not due.
  const set = db.prepare('UPDATE words SET drilled = 1, to_remember = 1, gap_days = ?, last_review_at = ? WHERE account_id = ? AND lemma = ?');
  set.run(1, clock.now - 3 * DAY, learner.id, 'kopp');
  set.run(1, clock.now - 1.2 * DAY, learner.id, 'räkna');
  set.run(2.5, clock.now - DAY, learner.id, 'mörk');
  set.run(1, clock.now - 1.5 * DAY, learner.id, 'tolv');
});
after(() => t.close());

test('FR-404 FR-406 RQ-80 RQ-32 RQ-07 RQ-415: Review lists fading leaves first, then due ones, each shown in a sentence the learner read', async () => {
  const res = await c.get('/api/review?mode=review');
  assert.equal(res.status, 200);
  const lemmas = res.body.items.map((i) => i.lemma);
  assert.equal(lemmas[0], 'kopp', 'the fading leaf comes first');
  assert.ok(lemmas.includes('räkna') && lemmas.includes('tolv'));
  assert.ok(!lemmas.includes('mörk'), 'not due yet');
  const kopp = res.body.items[0];
  assert.equal(kopp.mode, 'remember');
  assert.match(kopp.sentence, /kopp/i);
  assert.equal(kopp.options[kopp.right], 'the cups');
  assert.ok(kopp.options.length >= 3 && kopp.options.length <= 4);
  assert.ok(!kopp.options.some((o, i) => i !== kopp.right && o === 'cup'), 'never the item\'s own other meaning as a wrong option');
  assert.ok(res.body.items.every((i) => i.mode === 'remember' && i.sentence), 'every leaf in a sentence, To remember (no To read)');
});

test('FR-406 RQ-32: an item without a sentence is a recall card', async () => {
  await c.post('/api/leaves', { text: 'kanelbulle' });
  t.grove.db.prepare('UPDATE words SET last_review_at = ? WHERE account_id = ? AND lemma = ?').run(clock.now - 2 * DAY, learner.id, 'kanelbulle');
  const item = (await c.get('/api/review?mode=review')).body.items.find((i) => i.lemma === 'kanelbulle');
  assert.equal(item.mode, 'recall');
});

test('FR-405 RQ-60 RQ-200: answers update the gap, and the third right answer on schedule falls', async () => {
  let r = await c.post('/api/review', { lemma: 'räkna', mode: 'remember', right: true });
  assert.deepEqual(r.body, { gap: 2.5, fell: false });
  clock.now += 2.5 * DAY;
  r = await c.post('/api/review', { lemma: 'räkna', mode: 'remember', right: true });
  assert.deepEqual(r.body, { gap: 6.25, fell: false });
  clock.now += 6.25 * DAY;
  r = await c.post('/api/review', { lemma: 'räkna', mode: 'remember', right: true });
  assert.equal(r.body.fell, true);
  assert.equal(word(t, learner.id, 'räkna').state, 'ground');
  r = await c.post('/api/review', { lemma: 'kopp', mode: 'remember', right: false });
  assert.deepEqual(r.body, { gap: 0.5, fell: false });
  assert.ok(t.grove.db.prepare('SELECT COUNT(*) AS n FROM review_answers WHERE account_id = ?').get(learner.id).n >= 4);
});

test('FR-407 RQ-06: Master lists drilled leaves with gaps of 2+ days, gapped, with the English meaning and Swedish options; it updates the schedule', async () => {
  const res = await c.get('/api/review?mode=master');
  const lemmas = res.body.items.map((i) => i.lemma);
  assert.ok(lemmas.includes('mörk'));
  assert.ok(!lemmas.includes('kopp'), 'gap below 2 days');
  const m = res.body.items.find((i) => i.lemma === 'mörk');
  assert.equal(m.mode, 'master');
  assert.match(m.sentence, /_{3,}/);
  assert.doesNotMatch(m.sentence, /mörkt/);
  assert.equal(m.meaning, 'dark');
  assert.equal(m.options[m.right], 'mörkt');
  assert.ok(m.options.length >= 3);
  const before = word(t, learner.id, 'mörk').gap_days;
  await c.post('/api/review', { lemma: 'mörk', mode: 'master', right: true });
  assert.equal(word(t, learner.id, 'mörk').gap_days, before * 2.5);
});

test('FR-408 RQ-201 RQ-356: a new text raises an item\'s times met but leaves its schedule unchanged', async () => {
  const kopp = word(t, learner.id, 'kopp');
  const p = await c.post('/api/prompt', { action: 'next' });
  const a = JSON.parse((await import('./helpers.mjs')).ANSWER.replaceAll('TEST-1', p.body.code));
  a.texts = a.texts.slice(2); a.texts[0].title = 'Igen';
  await c.post('/api/answer', { exchangeId: p.body.exchangeId, answer: JSON.stringify(a) });
  const after = word(t, learner.id, 'kopp');
  assert.equal(after.gap_days, kopp.gap_days);
  assert.equal(after.last_review_at, kopp.last_review_at);
  const met = (await c.get(`/api/reading?id=${texts['En bra dag']}`)).body.lines.flatMap((l) => l.sentences).flatMap((s) => s.tokens).find((x) => x.t === 'Maja');
  assert.ok(met);
  const kaffe = (await c.get(`/api/reading?id=${texts['En kall morgon']}`)).body.lines.flatMap((l) => l.sentences).flatMap((s) => s.tokens).find((x) => x.t === 'kaffe');
  assert.ok(kaffe.met >= 2, `kaffe met ${kaffe.met} times`);
});

test('FR-419 RQ-155: review answers for another account\'s items are refused', async () => {
  clock.now = Date.now(); // earlier tests moved the clock; a fresh sign-in token must not look expired
  const other = t.client();
  await other.signInAgreed('other@example.test');
  assert.equal((await other.post('/api/review', { lemma: 'kopp', mode: 'remember', right: true })).status, 404);
  assert.deepEqual((await other.get('/api/review?mode=review')).body.items, []);
});
