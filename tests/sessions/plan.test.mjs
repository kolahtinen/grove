import { test } from 'node:test';
import assert from 'node:assert/strict';
import { plan, fits } from '../../server/sessions/plan.mjs';
import { DURATIONS, durationsFor, textSeconds } from '../../server/sessions/durations.mjs';

let nextId = 1;
const leaf = (over = {}) => ({ id: nextId++, lemma: `ord${nextId}`, kind: 'word', strength: 0.4, due: true, fading: false, gap: 1, masterReady: false, textIds: [], ...over });
const text = (over = {}) => ({ id: nextId++, kind: 'reading', topic: 'café', read: false, words: 200, patternPlaces: 0, ...over });
const inventory = (over = {}) => ({ leaves: [], texts: [], recent: { reading: 0, listening: 0 }, targetShare: 95, ...over });
const session = (over, inv) => plan({ params: { kind: 'time', tile: 'mix', skill: 'mix', minutes: 10, voice: true, ...over }, inventory: inv });
const harder = (n, from = 2) => Array.from({ length: n }, (_, i) => leaf({ due: false, masterReady: true, gap: from + i }));

test('FR-905 RQ-421 RQ-452 RQ-453: durations are reading 100 words a minute from B1 and 70 below (PD-02), listening 80, Review 20 s, Master 25 s, a marking step 30 s after a first reading, a word card 30 s, a phrase 150 s, a pattern of the day 300 s, a Spot it 150 s', () => {
  assert.deepEqual(DURATIONS, { readingWordsPerMinute: 100, readingWordsPerMinuteBelowB1: 70, listeningWordsPerMinute: 80, review: 20, master: 25, marking: 30, word: 30, phrase: 150, pattern: 300, spot: 150 });
  assert.equal(textSeconds({ kind: 'reading', words: 140, read: true }, durationsFor(true)), 120);
  assert.equal(textSeconds({ kind: 'listening', words: 160, read: true }, durationsFor(true)), 120);
  assert.equal(textSeconds({ kind: 'reading', words: 200, read: false }), 120 + 30);
  assert.equal(textSeconds({ kind: 'listening', words: 160, read: false }), 120 + 30);
  assert.equal(textSeconds({ kind: 'reading', words: 200, read: true }), 120);
});

test('FR-905 RQ-440 RQ-441: Mix plans Review first (fading, due, then harder questions; at most 40%), then new texts of both kinds for the rest, never longer than the session', () => {
  const fading = leaf({ fading: true, strength: 0.1 });
  const due = Array.from({ length: 30 }, (_, i) => leaf({ strength: 0.3 + i / 100 }));
  const reading = [text({ words: 2000 }), text({ words: 300 }), text({ words: 250 })];
  const listening = [text({ kind: 'listening', words: 200 }), text({ kind: 'listening', words: 160 })];
  const inv = inventory({ leaves: [...due, fading, ...harder(10)], texts: [...reading, ...listening] });
  const p = session({}, inv);
  assert.equal(p.exercises[0].lemma, fading.lemma, 'the fading leaf first');
  const reviews = p.exercises.filter((e) => e.mode === 'review');
  assert.ok(reviews.reduce((s, e) => s + e.seconds, 0) <= 0.4 * 600);
  assert.deepEqual(p.exercises.slice(0, reviews.length).map((e) => e.mode), reviews.map(() => 'review'), 'Review comes first');
  const texts = p.exercises.filter((e) => e.type === 'text');
  assert.ok(texts.some((e) => listening.some((x) => x.id === e.textId)) && texts.some((e) => reading.some((x) => x.id === e.textId)), 'both kinds');
  assert.ok(!texts.some((e) => e.textId === reading[0].id), 'a text longer than the session is never planned');
  assert.ok(p.seconds <= 600 && fits(p.seconds, 600), `${p.seconds} s planned`);
  assert.equal(p.offer, null);
  assert.deepEqual(session({}, inv).exercises, p.exercises, 'the same inventory gives the same plan');
});

test('FR-905 FR-912 RQ-441 R-33: a harder question is a Review exercise of a well-known word, the longest gap first, and never takes a due or fading leaf\'s place', () => {
  const due = Array.from({ length: 5 }, () => leaf());
  const well = harder(20);
  const p = session({ tile: 'review' }, inventory({ leaves: [...due, ...well] }));
  const hard = p.exercises.filter((e) => e.type === 'master');
  assert.ok(hard.length > 0);
  assert.ok(hard.every((e) => e.mode === 'review'), 'shown as Review');
  assert.equal(hard[0].lemma, well.at(-1).lemma, 'the longest gap first');
  const dueLemmas = new Set(due.map((l) => l.lemma));
  assert.ok(p.exercises.filter((e) => dueLemmas.has(e.lemma)).length === due.length, 'every due leaf is planned');
  assert.ok(p.exercises.findIndex((e) => e.type === 'master') > p.exercises.findLastIndex((e) => dueLemmas.has(e.lemma)), 'after the due ones');
  const many = Array.from({ length: 60 }, () => leaf());
  const crowded = session({ tile: 'review' }, inventory({ leaves: [...many, ...well] }));
  assert.ok(crowded.exercises.filter((e) => e.type === 'master').reduce((s, e) => s + e.seconds, 0) <= 600 / 3, 'at most a third while due leaves remain');
  assert.ok(crowded.exercises.filter((e) => e.type === 'review').length >= 600 * (2 / 3) / 20 - 1);
});

test('FR-903 FR-905 RQ-441: Review plans no texts; Harder questions only plans only harder questions of well-known words', () => {
  const inv = inventory({ leaves: [...Array.from({ length: 10 }, () => leaf()), ...harder(30)], texts: [text(), text({ kind: 'listening' })] });
  const review = session({ tile: 'review', minutes: 5 }, inv);
  assert.ok(review.exercises.every((e) => e.mode === 'review' && e.type !== 'text'));
  const hard = session({ tile: 'review', minutes: 5, hardOnly: true }, inv);
  assert.ok(hard.exercises.length > 0 && hard.exercises.every((e) => e.type === 'master'));
  assert.ok(fits(hard.seconds, 300));
});

test('FR-905 FR-920 RQ-440 RQ-444: Discover plans only new texts; short of texts, it plans nothing and says how many minutes of each kind are missing', () => {
  const r = text({ words: 300 });
  const full = session({ tile: 'discover', minutes: 5 }, inventory({ leaves: [leaf()], texts: [text({ words: 100 }), text({ words: 110 }), text({ kind: 'listening', words: 80 }), text({ kind: 'listening', words: 90 })] }));
  assert.ok(full.exercises.length && full.exercises.every((e) => e.type === 'text' && e.mode === 'discover'));
  assert.equal(full.offer, null);
  const short = session({ tile: 'discover', minutes: 10 }, inventory({ texts: [r] }));
  assert.equal(short.wouldBeShort, true);
  assert.deepEqual(short.exercises, []);
  assert.deepEqual(Object.keys(short.offer.missing).sort(), ['listening', 'reading']);
  assert.equal(short.offer.missing.reading, 300 - textSeconds(r));
  assert.equal(short.offer.missing.listening, 300);
});

test('FR-905 FR-906 RQ-440 RQ-444: the skill decides the kinds: Reading only reading, Listening only listening, the others half each; without a voice, no listening', () => {
  const texts = [text({ words: 120 }), text({ words: 130 }), text({ kind: 'listening', words: 100 }), text({ kind: 'listening', words: 110 })];
  const kinds = (skill, voice = true) => new Set(session({ tile: 'discover', skill, minutes: 5, voice, fill: true }, inventory({ texts })).exercises.map((e) => texts.find((x) => x.id === e.textId).kind));
  assert.deepEqual(kinds('reading'), new Set(['reading']));
  assert.deepEqual(kinds('listening'), new Set(['listening']));
  assert.deepEqual(kinds('mix'), new Set(['reading', 'listening']));
  assert.deepEqual(kinds('mix', false), new Set(['reading']));
  const reading = session({ tile: 'discover', skill: 'reading', minutes: 10 }, inventory({ texts: [texts[2]] }));
  assert.deepEqual(Object.keys(reading.offer.missing), ['reading'], 'a Reading session misses only reading');
  const noVoice = session({ tile: 'discover', skill: 'mix', minutes: 10, voice: false }, inventory());
  assert.deepEqual(Object.keys(noVoice.offer.missing), ['reading'], 'without a voice only reading is missing');
});

test('FR-906 RQ-440 RQ-451: new texts: the one nearest the target share first; Words and Grammar plan grove\'s own exercises, not texts; reviews lean to the ticked skills', () => {
  const texts = [text({ knownShare: 80, words: 120 }), text({ knownShare: 95.5, words: 120 }), text({ knownShare: 99, words: 120 })];
  const first = (skill, list) => session({ tile: 'discover', skill, minutes: 5, fill: true }, inventory({ texts: list })).exercises[0].textId;
  assert.equal(first('reading', texts), texts[1].id);
  const learning = { words: ['W-a', 'W-b'], phrases: ['P-A1-01'], patterns: { day: 'G-A1-01', earlier: [] } };
  const w = session({ tile: 'discover', skills: ['words'], minutes: 5 }, inventory({ texts, learning }));
  assert.ok(w.exercises.length && w.exercises.every((e) => e.type === 'words' || e.type === 'phrase'), 'Words: no texts');
  const g = session({ tile: 'discover', skills: ['grammar'], minutes: 5 }, inventory({ texts, learning }));
  assert.deepEqual(g.exercises.map((e) => e.type), ['grammar']);
  const word = leaf({ strength: 0.1, fading: true });
  const pattern = leaf({ kind: 'pattern', strength: 0.45 });
  const phrase = leaf({ kind: 'phrase', strength: 0.3 });
  const gr = session({ tile: 'review', skills: ['grammar'], minutes: 5 }, inventory({ leaves: [word, pattern, phrase] }));
  assert.equal(gr.exercises[0].lemma, pattern.lemma, 'Grammar ticked: pattern leaves first');
  assert.equal(session({ tile: 'review', skills: ['grammar', 'reading'], minutes: 5 }, inventory({ leaves: [word, pattern, phrase] })).exercises[0].lemma, pattern.lemma);
  assert.equal(session({ tile: 'review', minutes: 5 }, inventory({ leaves: [word, pattern, phrase] })).exercises[0].lemma, word.lemma, 'all skills: as G-04');
  const wr = session({ tile: 'review', skills: ['words'], minutes: 5 }, inventory({ leaves: [word, pattern, phrase] }));
  assert.deepEqual(new Set(wr.exercises.map((e) => e.kind)), new Set(['word', 'phrase']), 'only Words: words and phrases only');
  const l = session({ tile: 'review', skills: ['listening'], minutes: 5 }, inventory({ leaves: [word, phrase] }));
  assert.ok(l.exercises.every((e) => e.spoken), 'only Listening: each sentence played first');
  assert.ok(!session({ tile: 'review', skills: ['listening', 'reading'], minutes: 5 }, inventory({ leaves: [word, phrase] })).exercises.some((e) => e.spoken));
  const old = session({ tile: 'review', skill: 'grammar', minutes: 5 }, inventory({ leaves: [word, pattern, phrase] }));
  assert.equal(old.exercises[0].lemma, pattern.lemma, 'an old single skill counts as that one ticked');
});

test('FR-905 FR-906 RQ-451: the ticked skills share the time equally, taken in turns; none ticked is all four', () => {
  const texts = Array.from({ length: 12 }, (_, i) => text({ kind: i % 2 ? 'listening' : 'reading', words: 100 + i }));
  const learning = { words: Array.from({ length: 40 }, (_, i) => `W-${i}`), phrases: Array.from({ length: 10 }, (_, i) => `P-${i}`), patterns: { day: 'G-A1-03', earlier: ['G-A1-01', 'G-A1-02'] } };
  const inv = inventory({ texts, learning });
  const by = (p) => { const m = {}; for (const e of p.exercises) { const k = e.type === 'text' ? texts.find((x) => x.id === e.textId).kind : e.type === 'phrase' ? 'words' : e.type; m[k] = (m[k] ?? 0) + e.seconds; } return m; };
  const two = session({ tile: 'discover', skills: ['reading', 'grammar'], minutes: 20 }, inv);
  const m = by(two);
  assert.deepEqual(Object.keys(m).sort(), ['grammar', 'reading']);
  assert.ok(Math.abs(m.reading - m.grammar) <= 300, `about equal: ${JSON.stringify(m)}`);
  const kinds = two.exercises.map((e) => (e.type === 'text' ? 'reading' : 'grammar'));
  assert.deepEqual(kinds.slice(0, 2), ['reading', 'grammar'], 'in turns');
  assert.equal(two.exercises.find((e) => e.type === 'grammar').item, 'G-A1-03', 'the pattern of the day first');
  assert.equal(two.exercises.find((e) => e.type === 'grammar').learn, true);
  assert.ok(fits(two.seconds, 1200));
  const all = by(session({ tile: 'discover', minutes: 30 }, inv));
  assert.deepEqual(Object.keys(all).sort(), ['grammar', 'listening', 'reading', 'words'], 'none ticked: all four');
  assert.deepEqual(Object.keys(by(session({ tile: 'discover', skills: [], minutes: 30 }, inv))).sort(), ['grammar', 'listening', 'reading', 'words']);
  assert.ok(!Object.keys(by(session({ tile: 'discover', minutes: 30, voice: false }, inv))).includes('listening'), 'no voice, no Listening');
  const mix = session({ tile: 'mix', skills: ['words', 'grammar'], minutes: 10 }, inventory({ texts, learning, leaves: Array.from({ length: 30 }, () => leaf()) }));
  const reviews = mix.exercises.filter((e) => e.mode === 'review');
  assert.ok(reviews.length && reviews.reduce((n, e) => n + e.seconds, 0) <= 240, 'Mix keeps Review first, at most 40%');
  assert.deepEqual(mix.exercises.slice(0, reviews.length).map((e) => e.mode), reviews.map(() => 'review'));
  assert.equal(mix.offer, null, 'no Reading or Listening ticked: no text target, no offer');
});

test('FR-905 FR-928 FR-929 RQ-451 RQ-452 RQ-453: a ticked skill with too little gives its time to the others; Words alternates 4 words and a phrase; Grammar the day\'s pattern then earlier ones', () => {
  const texts = Array.from({ length: 10 }, () => text({ words: 150 }));
  const few = { words: [], phrases: [], patterns: { day: 'G-A1-01', earlier: [] } };
  const p = session({ tile: 'discover', skills: ['reading', 'grammar'], minutes: 20 }, inventory({ texts, learning: few }));
  const grammar = p.exercises.filter((e) => e.type === 'grammar');
  assert.equal(grammar.length, 1, 'one pattern only');
  assert.ok(fits(p.seconds, 1200), 'reading took the rest');
  const learning = { words: Array.from({ length: 9 }, (_, i) => `W-${i}`), phrases: ['P-1', 'P-2'], patterns: { day: null, earlier: ['G-A1-02', 'G-A1-01'] } };
  const w = session({ tile: 'discover', skills: ['words'], minutes: 10 }, inventory({ learning }));
  assert.deepEqual(w.exercises.map((e) => e.type), ['words', 'phrase', 'words', 'phrase', 'words']);
  assert.deepEqual(w.exercises[0].items, ['W-0', 'W-1', 'W-2', 'W-3']);
  assert.equal(w.exercises[0].seconds, 120);
  assert.equal(w.exercises.at(-1).items.length, 1);
  const g = session({ tile: 'discover', skills: ['grammar'], minutes: 5 }, inventory({ learning }));
  assert.deepEqual(g.exercises.map((e) => [e.item, e.learn, e.seconds]), [['G-A1-02', false, 150], ['G-A1-01', false, 150]], 'no new pattern: Spot it of earlier ones, the longest ago first');
  const nothing = session({ tile: 'discover', skills: ['words'], minutes: 5 }, inventory({ learning: { words: [], phrases: [], patterns: { day: null, earlier: [] } } }));
  assert.equal(nothing.reason, 'nothing_to_do');
  const shortTexts = session({ tile: 'discover', skills: ['reading', 'words'], minutes: 10 }, inventory({ texts: [text({ words: 100 })], learning }));
  assert.ok(shortTexts.offer && shortTexts.offer.missing.reading > 0, 'short of texts: the offer first');
  assert.deepEqual(shortTexts.exercises, []);
  const without = session({ tile: 'discover', skills: ['reading', 'words'], minutes: 10, fill: true }, inventory({ texts: [text({ words: 100 })], learning }));
  assert.ok(without.exercises.filter((e) => e.type !== 'text').reduce((n, e) => n + e.seconds, 0) > 300, 'Practise without: the texts\' time goes to Words');
});

test('FR-903 RQ-440: every tile and skill comes in 5, 10, 20 and 30 minutes, and no exercise is longer than the session', () => {
  const inv = inventory({ leaves: [...Array.from({ length: 20 }, () => leaf()), ...harder(40)], texts: [text({ words: 150 }), text({ words: 3000 }), text({ kind: 'listening', words: 120 })], learning: { words: ['W-a', 'W-b', 'W-c', 'W-d', 'W-e'], phrases: ['P-1'], patterns: { day: 'G-A1-01', earlier: ['G-A1-02'] } } });
  for (const tile of ['discover', 'review', 'mix']) {
    for (const skill of ['mix', 'reading', 'listening', 'words', 'grammar']) {
      for (const minutes of [5, 10, 20, 30]) {
        const p = session({ tile, skill, minutes, fill: true }, inv);
        const q = session({ tile, skills: skill === 'mix' ? [] : [skill, 'grammar'], minutes, fill: true }, inv);
        assert.ok(q.exercises.every((e) => e.seconds <= minutes * 60) && q.seconds <= minutes * 60 + 1, `${tile} ${skill}+grammar ${minutes}`);
        assert.equal(p.length, minutes * 60, `${tile} ${skill} ${minutes}`);
        assert.ok(p.exercises.every((e) => e.seconds <= minutes * 60), `${tile} ${skill} ${minutes}: no exercise longer than the session`);
        assert.ok(p.seconds <= minutes * 60 + 1, `${tile} ${skill} ${minutes}: never over`);
      }
    }
  }
});

test('FR-907 RQ-443: a topic session is a Mix from that topic\'s texts and the leaves met in them, then any due ones', () => {
  const café = text({ topic: 'café', words: 150 });
  const café2 = text({ topic: 'café', kind: 'listening', words: 120 });
  const sea = text({ topic: 'havet' });
  const inCafé = leaf({ textIds: [café.id] });
  const elsewhere = leaf({ textIds: [sea.id], strength: 0.3 });
  const p = plan({ params: { kind: 'topic', tile: 'mix', skill: 'mix', minutes: 5, topic: 'café', voice: true }, inventory: inventory({ leaves: [inCafé, elsewhere], texts: [café, café2, sea] }) });
  assert.ok(p.exercises.filter((e) => e.textId).every((e) => e.textId === café.id || e.textId === café2.id));
  assert.equal(p.exercises.filter((e) => e.mode === 'review')[0].lemma, inCafé.lemma, 'the topic\'s leaves first');
});

test('FR-905 RQ-421: filled (Practise without), a Mix mixes practice reviews, re-reading and listening again in turn, each once, until 80% (PD-28; question-pages/78, 3); Discover fills only with texts again', () => {
  const notDue = Array.from({ length: 20 }, (_, i) => leaf({ due: false, strength: 0.9 - i / 100 }));
  const readTexts = [text({ read: true, words: 100, readAt: 3 }), text({ read: true, words: 100, readAt: 1 }), text({ kind: 'listening', read: true, words: 80, readAt: 2 })];
  const inv = inventory({ leaves: notDue, texts: readTexts });
  const unfilled = session({}, inv);
  assert.equal(unfilled.wouldBeShort, true);
  assert.equal(unfilled.exercises.length, 0);
  const p = session({ fill: true }, inv);
  const kinds = p.exercises.map((e) => (e.practice ? 'practice' : e.again));
  assert.deepEqual(kinds.slice(0, 3), ['practice', 'reread', 'listen'], 'taken in turn');
  assert.equal(p.exercises.find((e) => e.again === 'reread').textId, readTexts[1].id, 'the longest ago first');
  assert.ok(p.exercises.filter((e) => e.practice).every((e) => e.mode === 'review' && e.type === 'review'));
  assert.equal(new Set(p.exercises.map((e) => e.lemma ?? `t${e.textId}`)).size, p.exercises.length, 'each at most once');
  assert.equal(p.exercises.filter((e) => e.practice)[0].lemma, notDue.at(-1).lemma, 'the soonest due first');
  assert.ok(p.seconds >= 0.8 * 600 && p.seconds <= 600, `planned ${p.seconds} s`);
  assert.ok(!session({ fill: true, voice: false }, inv).exercises.some((e) => e.again === 'listen'), 'without a voice, no listening again');
  assert.ok(session({ tile: 'discover', fill: true }, inv).exercises.every((e) => e.again), 'Discover fills with texts again only');
});

test('FR-905 RQ-441: a Review plan under 80% says so; filled it adds practice reviews; with nothing at all, nothing_to_do', () => {
  const p = session({ tile: 'review', minutes: 20 }, inventory({ leaves: [leaf()] }));
  assert.equal(p.wouldBeShort, true);
  assert.equal(p.offer, null, 'Review never sends the learner to add texts');
  assert.equal(p.exercises.length, 1, 'as is, the one due leaf');
  const filled = session({ tile: 'review', minutes: 5, fill: true }, inventory({ leaves: [leaf(), ...Array.from({ length: 20 }, () => leaf({ due: false }))] }));
  assert.ok(filled.exercises.some((e) => e.practice));
  assert.equal(session({ tile: 'review', minutes: 5, fill: true }, inventory()).reason, 'nothing_to_do');
});

test('FR-905 RQ-421: below B1 a reading text is planned at 70 words a minute; from B1 at 100 (PD-02)', () => {
  const t1 = text({ words: 140 });
  const below = session({ tile: 'discover', skill: 'reading', minutes: 5, fill: true }, inventory({ texts: [t1], belowB1: true }));
  const from = session({ tile: 'discover', skill: 'reading', minutes: 5, fill: true }, inventory({ texts: [t1], belowB1: false }));
  assert.equal(below.exercises.find((e) => e.type === 'text').seconds, 120 + 30);
  assert.equal(from.exercises.find((e) => e.type === 'text').seconds, 84 + 30);
});
