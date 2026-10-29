import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readingGrove, signedIn, addPart, textId, tokensOf } from './helpers.mjs';

let t;
let learner;
before(async () => {
  ({ t, learner } = await readingGrove());
  const c = await signedIn(t);
  const { res } = await addPart(c);
  assert.equal(res.result, 'accepted', JSON.stringify(res));
});
after(() => t.close());

async function reading(title, email) {
  const c = await signedIn(t, email);
  return c.get(`/api/reading?id=${textId(t, learner.id, title)}`);
}

const find = (r, word) => tokensOf(r).find((x) => x.t === word);

test('FR-305 FR-306 RQ-18: the reading payload carries each word\'s status, dictionary forms, meaning here and phrases', async () => {
  const r = (await reading('En bra dag')).body;
  const kopparna = find(r, 'kopparna');
  assert.equal(kopparna.status, 'leaf');
  assert.deepEqual(kopparna.lemmas, ['kopp']);
  assert.equal(kopparna.meaning, 'the cups', 'the meaning given for this text');
  const sager = find(r, 'säger');
  assert.equal(sager.status, 'ground');
  assert.deepEqual(sager.lemmas, ['säga']);
  assert.equal(find(r, 'Elsa').status, 'name');
  const first = (await reading('En kall morgon')).body;
  const mar = find(first, 'mår');
  assert.deepEqual(mar.phrases, ['hur mår du']);
  assert.ok(tokensOf(r).some((x) => x.word === undefined && x.t === ' '), 'spaces are tokens without a word');
});

test('FR-302 RQ-55 RQ-76: each sentence has its new count and the text its word count, new words and share', async () => {
  const r = (await reading('En bra dag')).body;
  const sentence = r.lines.flatMap((l) => l.sentences).find((s) => s.sv === 'Maja tvättar kopparna.');
  assert.equal(sentence.newCount, 1);
  assert.equal(r.stats.newWords >= 5, true);
  assert.ok(r.stats.words > 100);
  assert.ok(r.stats.share > 90 && r.stats.share < 100);
});

test('FR-301 RQ-10 RQ-411: each line carries its English for Show translation; the translations setting is withdrawn', async () => {
  const c = await signedIn(t);
  const id = textId(t, learner.id, 'En bra dag');
  const r = (await c.get(`/api/reading?id=${id}`)).body;
  assert.equal('showTranslations' in r, false);
  assert.equal(r.lines[0].en, 'In the evening the café is empty.');
  assert.equal((await c.post('/api/settings', { showTranslations: false })).status, 400);
});

test('FR-305 RQ-18: a tap always speaks, so there is no Speak words setting to read or change (question-pages/86)', async () => {
  const c = await signedIn(t);
  const id = textId(t, learner.id, 'En bra dag');
  assert.equal('speakWords' in (await c.get(`/api/reading?id=${id}`)).body, false);
  assert.equal((await c.post('/api/settings', { speakWords: false })).status, 400);
});

test('FR-306 RQ-413 RQ-396: a form of more than one dictionary word lists each with its meaning; every word token has a meaning', async () => {
  const words = new Set(t.grove.db.prepare("SELECT lemma FROM words WHERE account_id = ? AND kind = 'word'").all(learner.id).map((w) => w.lemma));
  for (const w of ['var', 'vara']) if (!words.has(w)) t.grove.db.prepare("INSERT INTO words (account_id, lemma, kind, state, added_at) VALUES (?, ?, 'word', 'ground', 1)").run(learner.id, w);
  const r = (await reading('En bra dag')).body;
  const several = tokensOf(r).filter((x) => x.lemmas?.length > 1);
  assert.ok(several.length > 0, 'the sample has a form of more than one word (var: vara, var)');
  for (const x of several) {
    assert.deepEqual(x.senses.map((s) => s.lemma), x.lemmas, x.t);
    assert.ok(x.senses.every((s) => s.en), `${x.t}: each with its meaning`);
  }
  assert.ok(tokensOf(r).filter((x) => x.word && x.status !== 'name').every((x) => x.meaning), 'never "meaning missing"');
});

test('FR-303 RQ-56: the answer\'s names are stored and never count as new', async () => {
  const names = t.grove.db.prepare('SELECT name FROM names WHERE account_id = ? ORDER BY name').all(learner.id).map((r) => r.name);
  for (const n of ['Elsa', 'Maja', 'Olle']) assert.ok(names.includes(n), n);
  const r = (await reading('Olles väska')).body;
  assert.ok(!tokensOf(r).some((x) => ['Olle', 'Elsa', 'Maja'].includes(x.t) && x.status === 'new'));
});

test('FR-319 RQ-155: another account gets 404 for the text and the settings change only its own', async () => {
  const other = await reading('En bra dag', 'other@example.test');
  assert.equal(other.status, 404);
  const c = await signedIn(t, 'other@example.test');
  const mine = (await (await signedIn(t)).get('/api/settings')).body.speechRate;
  await c.post('/api/settings', { speechRate: 0.7 });
  assert.equal((await (await signedIn(t)).get('/api/settings')).body.speechRate, mine);
});

test('FR-910 RQ-427: Settings reads the speech speed the learner saved, and only theirs', async () => {
  const c = await signedIn(t);
  const other = await signedIn(t, 'other@example.test');
  const others = (await other.get('/api/settings')).body;
  await c.post('/api/settings', { speechRate: 0.8 });
  assert.deepEqual((await c.get('/api/settings')).body, { speechRate: 0.8 });
  assert.deepEqual((await other.get('/api/settings')).body, others, 'another learner\'s settings are untouched');
  await c.post('/api/settings', { speechRate: 1 });
});
