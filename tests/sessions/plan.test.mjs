import { test } from 'node:test';
import assert from 'node:assert/strict';
import { plan, fits } from '../../server/sessions/plan.mjs';
import { DURATIONS, textSeconds } from '../../server/sessions/durations.mjs';

let nextId = 1;
const leaf = (over = {}) => ({ id: nextId++, lemma: `ord${nextId}`, kind: 'word', strength: 0.4, due: true, fading: false, gap: 1, masterReady: false, textIds: [], ...over });
const text = (over = {}) => ({ id: nextId++, kind: 'reading', topic: 'café', read: false, words: 200, patternPlaces: 0, ...over });
const inventory = (over = {}) => ({ leaves: [], texts: [], recent: { reading: 0, listening: 0 }, targetShare: 95, ...over });
const time = (minutes, inv, voice = true) => plan({ kind: 'time', params: { minutes, voice }, inventory: inv });

test('FR-905 RQ-421: durations are reading 100 words a minute, listening 80, Review 20 s, Master 25 s, and a marking step 30 s after a first reading', () => {
  assert.deepEqual(DURATIONS, { readingWordsPerMinute: 100, listeningWordsPerMinute: 80, review: 20, master: 25, marking: 30 });
  assert.equal(textSeconds({ kind: 'reading', words: 200, read: false }), 120 + 30);
  assert.equal(textSeconds({ kind: 'listening', words: 160, read: false }), 120 + 30);
  assert.equal(textSeconds({ kind: 'reading', words: 200, read: true }), 120);
});

test('FR-905 RQ-421: Review of fading then due leaves first, at most 40% of the length; then one text that fits; then Master to fill', () => {
  const fading = leaf({ fading: true, strength: 0.1 });
  const due = Array.from({ length: 30 }, (_, i) => leaf({ strength: 0.3 + i / 100 }));
  const masters = Array.from({ length: 30 }, (_, i) => leaf({ due: false, masterReady: true, gap: 2 + i }));
  const long = text({ words: 2000 });
  const fit = text({ words: 300 });
  const p = time(10, inventory({ leaves: [...due, fading, ...masters], texts: [long, fit] }));
  const modes = p.exercises.map((e) => e.mode);
  assert.equal(p.exercises[0].lemma, fading.lemma, 'the fading leaf first');
  const reviews = p.exercises.filter((e) => e.mode === 'review');
  assert.ok(reviews.length * 20 <= 0.4 * 600);
  assert.deepEqual(modes.slice(0, reviews.length), reviews.map(() => 'review'));
  const t = p.exercises.find((e) => e.type === 'text');
  assert.equal(t.textId, fit.id, 'a text longer than what is left is never planned');
  assert.equal(modes.indexOf('discover'), reviews.length, 'the text comes after the reviews');
  assert.ok(modes.slice(reviews.length + 1).every((m) => m === 'master'));
  assert.equal(p.exercises.filter((e) => e.mode === 'master')[0].lemma, masters.at(-1).lemma, 'Master takes the longest gaps first');
  assert.ok(fits(p.seconds, 600), `${p.seconds} s planned`);
  assert.deepEqual(time(10, inventory({ leaves: [...due, fading, ...masters], texts: [long, fit] })).exercises, p.exercises, 'the same inventory gives the same plan');
});

test('FR-905 RQ-421: the text is of the kind the learner did less of in the last 7 days; without a voice, no listening', () => {
  const r = text({ kind: 'reading' });
  const l = text({ kind: 'listening', words: 160 });
  const inv = inventory({ texts: [r, l], recent: { reading: 900, listening: 100 } });
  assert.equal(time(10, inv).exercises.find((e) => e.type === 'text').textId, l.id);
  assert.equal(time(10, inv, false).exercises.find((e) => e.type === 'text').textId, r.id);
});

test('FR-905 RQ-421: with nothing that fits, the plan is shorter and says so; with nothing at all, nothing_to_do', () => {
  const p = time(20, inventory({ leaves: [leaf()], texts: [text({ words: 5000 })] }));
  assert.equal(p.exercises.length, 1);
  assert.equal(p.short, true);
  assert.equal(p.reason, 'not_enough');
  assert.equal(time(5, inventory()).reason, 'nothing_to_do');
});

test('FR-906 RQ-423: By skill picks the text by its share of known words: Short the lowest, Long the highest, Medium nearest the target', () => {
  const texts = [text({ knownShare: 91 }), text({ knownShare: 99 }), text({ knownShare: 95.5 }), text({ kind: 'listening', knownShare: 80 })];
  const pick = (form) => plan({ kind: 'skill', params: { skill: 'reading', form, voice: true }, inventory: inventory({ texts }) }).exercises.find((e) => e.type === 'text').textId;
  assert.equal(pick('short'), texts[0].id);
  assert.equal(pick('long'), texts[1].id);
  assert.equal(pick('medium'), texts[2].id);
  const listening = plan({ kind: 'skill', params: { skill: 'listening', form: 'short', voice: true }, inventory: inventory({ texts, leaves: [leaf()] }) });
  assert.equal(listening.exercises.find((e) => e.type === 'text').textId, texts[3].id);
  assert.ok(listening.exercises.filter((e) => e.mode === 'review').every((e) => e.spoken), 'Listening reviews play their sentence first');
  assert.equal(listening.length, 5 * 60, 'Short is 5 minutes');
});

test('FR-906 RQ-423: Grammar reviews pattern leaves first and picks the text with the most pattern places; Words and phrases the shortest text', () => {
  const word = leaf({ strength: 0.1, fading: true });
  const pattern = leaf({ kind: 'pattern', strength: 0.45 });
  const few = text({ patternPlaces: 1, words: 100 });
  const many = text({ patternPlaces: 4, words: 300 });
  const g = plan({ kind: 'skill', params: { skill: 'grammar', form: 'medium', voice: true }, inventory: inventory({ leaves: [word, pattern], texts: [few, many] }) });
  assert.equal(g.exercises[0].lemma, pattern.lemma);
  assert.equal(g.exercises.find((e) => e.type === 'text').textId, many.id);
  const w = plan({ kind: 'skill', params: { skill: 'words', form: 'medium', voice: true }, inventory: inventory({ leaves: [word], texts: [few, many] }) });
  assert.equal(w.exercises.find((e) => e.type === 'text').textId, few.id);
});

test('FR-907 RQ-422: a topic session takes Discover from that topic\'s texts and Review from leaves met in them', () => {
  const café = text({ topic: 'café' });
  const sea = text({ topic: 'havet' });
  const inCafé = leaf({ textIds: [café.id] });
  const elsewhere = leaf({ textIds: [sea.id], strength: 0.1, fading: true });
  const p = plan({ kind: 'topic', params: { minutes: 5, topic: 'café', voice: true }, inventory: inventory({ leaves: [inCafé, elsewhere], texts: [café, sea] }) });
  assert.ok(p.exercises.every((e) => e.textId === undefined || e.textId === café.id));
  assert.deepEqual(p.exercises.filter((e) => e.mode === 'review').map((e) => e.lemma), [inCafé.lemma]);
});

test('FR-908 RQ-424: Just one mode: Review the due leaves (at most 10), Master its 10, Discover the next unread text', () => {
  const leaves = [...Array.from({ length: 12 }, () => leaf()), ...Array.from({ length: 12 }, () => leaf({ due: false, masterReady: true }))];
  const texts = [text({ read: true }), text(), text()];
  const one = (mode) => plan({ kind: 'mode', params: { mode, voice: true }, inventory: inventory({ leaves, texts }) });
  assert.equal(one('review').exercises.length, 10);
  assert.ok(one('review').exercises.every((e) => e.mode === 'review'));
  assert.equal(one('master').exercises.length, 10);
  assert.deepEqual(one('discover').exercises.map((e) => e.textId), [texts[1].id]);
});
