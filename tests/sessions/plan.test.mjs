import { test } from 'node:test';
import assert from 'node:assert/strict';
import { plan, fits } from '../../server/sessions/plan.mjs';
import { DURATIONS, durationsFor, textSeconds } from '../../server/sessions/durations.mjs';

let nextId = 1;
const leaf = (over = {}) => ({ id: nextId++, lemma: `ord${nextId}`, kind: 'word', strength: 0.4, due: true, fading: false, gap: 1, masterReady: false, textIds: [], ...over });
const text = (over = {}) => ({ id: nextId++, kind: 'reading', topic: 'café', read: false, words: 200, patternPlaces: 0, ...over });
const inventory = (over = {}) => ({ leaves: [], texts: [], recent: { reading: 0, listening: 0 }, targetShare: 95, ...over });
const time = (minutes, inv, voice = true) => plan({ kind: 'time', params: { minutes, voice }, inventory: inv });

test('FR-905 RQ-421: durations are reading 100 words a minute from B1 and 70 below (PD-02), listening 80, Review 20 s, Master 25 s, and a marking step 30 s after a first reading', () => {
  assert.deepEqual(DURATIONS, { readingWordsPerMinute: 100, readingWordsPerMinuteBelowB1: 70, listeningWordsPerMinute: 80, review: 20, master: 25, marking: 30 });
  assert.equal(textSeconds({ kind: 'reading', words: 140, read: true }, durationsFor(true)), 120);
  assert.equal(textSeconds({ kind: 'listening', words: 160, read: true }, durationsFor(true)), 120);
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

test('FR-906 RQ-423: each skill comes Short 5, Medium 10 or Long 20 minutes; Words and phrases fills with Review and Master, phrases included; no text longer than the session', () => {
  const phrase = leaf({ kind: 'phrase', strength: 0.2 });
  const words = Array.from({ length: 20 }, () => leaf());
  const masters = Array.from({ length: 40 }, (_, i) => leaf({ due: false, masterReady: true, gap: 3 + i }));
  const short = text({ words: 150 });
  const huge = text({ words: 3000 });
  const inv = inventory({ leaves: [phrase, ...words, ...masters], texts: [short, huge] });
  for (const [form, minutes] of [['short', 5], ['medium', 10], ['long', 20]]) {
    for (const skill of ['reading', 'listening', 'words', 'grammar']) {
      const p = plan({ kind: 'skill', params: { skill, form, voice: true }, inventory: inv });
      assert.equal(p.length, minutes * 60, `${skill} ${form}`);
      assert.ok(p.exercises.every((e) => e.seconds <= minutes * 60), `${skill} ${form}: no exercise longer than the session`);
      assert.ok(!p.exercises.some((e) => e.textId === huge.id), `${skill} ${form}: the 3,000-word text never planned`);
    }
  }
  const w = plan({ kind: 'skill', params: { skill: 'words', form: 'medium', voice: true }, inventory: inv });
  const modes = new Set(w.exercises.map((e) => e.mode));
  assert.ok(modes.has('review') && modes.has('master'), 'Review and Master');
  assert.ok(w.exercises.some((e) => e.mode === 'review' && e.kind === 'phrase'), 'phrases are reviewed too');
  assert.ok(fits(w.seconds, 600), `${w.seconds} s planned`);
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

test('FR-905 RQ-421: after Master, practice reviews of leaves not yet due fill the plan while it is under 80% of the length, weakest first, each once (PD-28)', () => {
  const notDue = Array.from({ length: 40 }, (_, i) => leaf({ due: false, strength: 0.9 - i / 100 }));
  const p = time(5, inventory({ leaves: notDue }));
  const practice = p.exercises.filter((e) => e.practice);
  assert.ok(practice.length > 0);
  assert.ok(practice.every((e) => e.mode === 'review' && e.type === 'review'));
  assert.equal(new Set(practice.map((e) => e.lemma)).size, practice.length, 'each leaf at most once');
  assert.equal(practice[0].lemma, notDue.at(-1).lemma, 'the weakest (soonest due) first');
  assert.ok(p.seconds >= 0.8 * 300 && p.seconds <= 300, `planned ${p.seconds} s`);
  assert.ok(fits(p.seconds, 300));
  // A leaf already planned as due or Master isn't planned again as practice.
  const both = time(5, inventory({ leaves: [leaf({ due: true }), leaf({ due: false, masterReady: true, gap: 3 })] }));
  assert.equal(both.exercises.filter((e) => e.practice).length, 0);
});

test('FR-905 RQ-421: below B1 a reading text is planned at 70 words a minute; from B1 at 100 (PD-02)', () => {
  const t1 = text({ words: 140, read: true });
  const below = plan({ kind: 'time', params: { minutes: 5, voice: true }, inventory: inventory({ texts: [{ ...t1, read: false }], belowB1: true }) });
  const from = plan({ kind: 'time', params: { minutes: 5, voice: true }, inventory: inventory({ texts: [{ ...t1, read: false }], belowB1: false }) });
  assert.equal(below.exercises.find((e) => e.type === 'text').seconds, 120 + 30);
  assert.equal(from.exercises.find((e) => e.type === 'text').seconds, 84 + 30);
});

test('FR-906 RQ-423: Short takes a text with 90–94% known words, Long 98% or more, Medium nearest the target; the nearest when none is in the band, and the plan says so (PD-04)', () => {
  const texts = [text({ knownShare: 80 }), text({ knownShare: 92 }), text({ knownShare: 97 }), text({ knownShare: 99.5 })];
  const run = (form, list = texts) => plan({ kind: 'skill', params: { skill: 'reading', form, voice: true }, inventory: inventory({ texts: list }) });
  assert.equal(run('short').exercises.find((e) => e.type === 'text').textId, texts[1].id);
  assert.equal(run('short').note, null);
  assert.equal(run('long').exercises.find((e) => e.type === 'text').textId, texts[3].id);
  assert.equal(run('medium').exercises.find((e) => e.type === 'text').textId, texts[2].id);
  const outside = run('long', [texts[0], texts[2]]);
  assert.equal(outside.exercises.find((e) => e.type === 'text').textId, texts[2].id, 'the nearest to the band');
  assert.equal(outside.note, 'out_of_band');
});
