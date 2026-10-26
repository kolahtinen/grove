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
  seedGround(t.grove.db, t.seedAccount({ email: 'reworded@example.test' }).id, known);
});
after(() => t.close());

async function start(email = 'learner@example.test') {
  const c = t.client();
  await c.signInAgreed(email);
  const p = await c.post('/api/prompt', { action: 'next' });
  return { c, p: p.body };
}

const textCount = () => t.grove.db.prepare('SELECT COUNT(*) AS n FROM texts WHERE account_id = ?').get(learner.id).n;

test('FR-206 FR-214 RQ-185 RQ-63 RQ-395: a text with too many new words is asked for again on its own, quoting the sentence and its words; the other texts are kept', async () => {
  const { c, p } = await start();
  const res = await c.post('/api/answer', { exchangeId: p.exchangeId, answer: answer('too-many-new.json').replaceAll('TEST-1', p.code) });
  assert.equal(res.body.result, 'partly_accepted', JSON.stringify(res.body));
  assert.equal(res.body.texts.length, 2, 'the two passing texts are kept');
  assert.ok(res.body.problems.some((x) => x.includes('Hon säljer stora bullar med kanel.')), JSON.stringify(res.body.problems));
  assert.equal(res.body.next.kind, 'redo');
  assert.match(res.body.next.prompt, /Hon säljer stora bullar med kanel\./);
  assert.match(res.body.next.prompt, /säljer, bullar, kanel/);
  assert.match(res.body.next.prompt, /one new reading text/);
  assert.equal(textCount(), 2);

  // The redo answer is one text of the failed kind, under the redo's code.
  const redo = await c.get('/api/home');
  assert.equal(redo.body.waiting.kind, 'redo');
  const one = JSON.parse(answer('good.json'));
  one.part = redo.body.waiting.code;
  one.texts = [one.texts[0]];
  const fixed = await c.post('/api/answer', { exchangeId: res.body.next.exchangeId, answer: JSON.stringify(one) });
  assert.equal(fixed.body.result, 'accepted', JSON.stringify(fixed.body));
  assert.equal(textCount(), 3);
  const pkg = t.grove.db.prepare("SELECT parts_accepted FROM packages WHERE account_id = ? AND status = 'open'").get(learner.id);
  assert.equal(pkg.parts_accepted, 1, 'the part is complete with all its texts');
  const again = await c.post('/api/answer', { exchangeId: res.body.next.exchangeId, answer: JSON.stringify(one) });
  assert.equal(again.status, 409);
  assert.equal(textCount(), 3);
});

test('FR-206 RQ-395: after two answers in a row with a failed text, every later request in the package asks for one text; a new package starts at the normal size', async () => {
  const db = t.grove.db;
  const two = t.seedAccount({ email: 'two-fails@example.test' });
  seedGround(db, two.id, known);
  const { c, p } = await start('two-fails@example.test');
  const first = await c.post('/api/answer', { exchangeId: p.exchangeId, answer: answer('too-many-new.json').replaceAll('TEST-1', p.code) });
  assert.equal(first.body.result, 'partly_accepted');
  const bad = JSON.parse(answer('too-many-new.json'));
  bad.part = (await c.get('/api/home')).body.waiting.code;
  bad.texts = [bad.texts[0]];
  const second = await c.post('/api/answer', { exchangeId: first.body.next.exchangeId, answer: JSON.stringify(bad) });
  assert.equal(second.body.result, 'partly_accepted', JSON.stringify(second.body));
  assert.equal(db.prepare("SELECT one_text FROM packages WHERE account_id = ? AND status = 'open'").get(two.id).one_text, 1);
  const redo = (await c.get('/api/home')).body.waiting;
  assert.match(redo.prompt, /one new reading text/);
  const ok = JSON.parse(answer('good.json'));
  ok.part = redo.code;
  ok.texts = [ok.texts[0]];
  assert.equal((await c.post('/api/answer', { exchangeId: redo.exchangeId, answer: JSON.stringify(ok) })).body.result, 'accepted');
  const next = (await c.post('/api/prompt', { action: 'next' })).body;
  assert.equal(next.part, 2);
  assert.match(next.prompt, /1 reading text, about/);
  assert.doesNotMatch(next.prompt, /and 1 listening text/);
  const fresh = (await c.post('/api/prompt', { action: 'new_package' })).body;
  assert.match(fresh.prompt, /2 reading texts and 1 listening text/);
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

test('FR-207 RQ-379 RQ-396: unlisted new words found in grove\'s word list are accepted at once with the dictionary meaning, marked as such', async () => {
  const { c, p } = await start('fresh@example.test');
  const res = await c.post('/api/answer', { exchangeId: p.exchangeId, answer: answer('unlisted-new.json').replaceAll('TEST-1', p.code) });
  assert.equal(res.body.result, 'accepted', JSON.stringify(res.body));
  assert.equal(res.body.next, null, 'no prompt for meanings');
  const db = t.grove.db;
  const word = (lemma) => ({ ...db.prepare('SELECT en, en_source FROM words WHERE account_id = ? AND lemma = ?').get(fresh.id, lemma) });
  assert.deepEqual(word('tolv'), { en: 'twelve', en_source: 'dictionary' });
  assert.equal(word('paraply').en_source, 'dictionary');
  assert.equal(word('kopp').en_source, 'ai');
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM words WHERE account_id = ? AND state = 'leaf' AND en IS NULL").get(fresh.id).n, 0, 'no leaf without a meaning');
});

test('FR-207 RQ-397 RQ-379: a new word in neither the answer nor the word list holds its text back; a fix-it asks for just that meaning, and its answer releases the text', async () => {
  const db = t.grove.db;
  const held = t.seedAccount({ email: 'held@example.test' });
  seedGround(db, held.id, known);
  const { c, p } = await start('held@example.test');
  const pasted = answer('unlisted-new.json').replaceAll('TEST-1', p.code).replace('ett paraply', 'ett snurrpelleplu');
  const res = await c.post('/api/answer', { exchangeId: p.exchangeId, answer: pasted });
  assert.equal(res.body.result, 'partly_accepted', JSON.stringify(res.body));
  assert.equal(res.body.texts.length, 2, 'the text with the unknown word waits');
  assert.equal(res.body.next.kind, 'meanings_fix');
  assert.match(res.body.next.prompt, /snurrpelleplu/);
  assert.doesNotMatch(res.body.next.prompt, /\btolv\b/, 'words with a dictionary meaning are not asked about');
  assert.deepEqual(JSON.parse(db.prepare('SELECT asked_forms FROM exchanges WHERE id = ?').get(res.body.next.exchangeId).asked_forms), ['snurrpelleplu']);
  const meanings = { meanings: [
    { form: 'snurrpelleplu', lemma: 'snurrpelleplu', en: 'a spinning umbrella', explain_sv: 'Ett paraply som snurrar.' },
    { form: 'banan', lemma: 'okänd', en: 'not asked', explain_sv: 'x' },
  ] };
  const filled = await c.post('/api/answer', { exchangeId: res.body.next.exchangeId, answer: `\`\`\`json\n${JSON.stringify(meanings)}\n\`\`\`` });
  assert.equal(filled.body.result, 'accepted', JSON.stringify(filled.body));
  assert.equal(filled.body.texts.length, 1);
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM texts WHERE account_id = ?').get(held.id).n, 3);
  assert.deepEqual({ ...db.prepare("SELECT en, en_source FROM words WHERE account_id = ? AND lemma = 'snurrpelleplu'").get(held.id) }, { en: 'a spinning umbrella', en_source: 'ai' });
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM words WHERE account_id = ? AND lemma = 'okänd'").get(held.id).n, 0);
  assert.equal(db.prepare("SELECT parts_accepted FROM packages WHERE account_id = ? AND status = 'open'").get(held.id).parts_accepted, 1);
});

test('FR-207 RQ-398: the next request asks the AI to check dictionary meanings in their sentences; its checks replace them, and checks for words it didn\'t ask about are ignored', async () => {
  const db = t.grove.db;
  const checks = t.seedAccount({ email: 'checks@example.test' });
  seedGround(db, checks.id, known);
  const { c, p } = await start('checks@example.test');
  assert.equal((await c.post('/api/answer', { exchangeId: p.exchangeId, answer: answer('unlisted-new.json').replaceAll('TEST-1', p.code) })).body.result, 'accepted');
  const next = (await c.post('/api/prompt', { action: 'next' })).body;
  assert.match(next.prompt, /tolv — "Klockan är tolv\." — dictionary: twelve/);
  const asked = JSON.parse(db.prepare('SELECT asked_forms FROM exchanges WHERE id = ?').get(next.exchangeId).asked_forms);
  assert.ok(asked.includes('tolv') && asked.includes('paraply'));
  const a = JSON.parse(answer('good.json'));
  a.part = next.code;
  a.texts.forEach((x, i) => { x.title = `Andra ${i}`; });
  // Leave tolv and paraply to the checks alone: this answer gives no meaning of its own for them.
  a.new_words = a.new_words.filter((w) => !['tolv', 'paraply'].includes(w.lemma));
  a.meaning_checks = [
    { form: 'tolv', lemma: 'tolv', en: 'twelve (o\'clock)', explain_sv: 'Talet efter elva.' },
    { form: 'kaffe', lemma: 'kaffe', en: 'not asked', explain_sv: 'x' },
  ];
  assert.equal((await c.post('/api/answer', { exchangeId: next.exchangeId, answer: JSON.stringify(a) })).body.result, 'accepted');
  const word = (lemma) => ({ ...db.prepare('SELECT en, explain_sv, en_source FROM words WHERE account_id = ? AND lemma = ?').get(checks.id, lemma) });
  assert.deepEqual(word('tolv'), { en: "twelve (o'clock)", explain_sv: 'Talet efter elva.', en_source: 'ai' });
  assert.equal(word('paraply').en_source, 'dictionary', 'not checked in this answer, so still the dictionary\'s');
  assert.notEqual(word('kaffe').en, 'not asked');
});
