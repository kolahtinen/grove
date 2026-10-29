import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startTestGrove } from '../fakes/harness.mjs';
import { applyDemo } from '../../server/demo/apply.mjs';
import { readInventory } from '../../server/sessions/inventory.mjs';
import { plan, fits, tickedSkills } from '../../server/sessions/plan.mjs';
import { importLearningContent } from '../../server/learning/learning.mjs';
import { durationsFor, textSeconds } from '../../server/sessions/durations.mjs';

// A learner with the demo history (G-07): 4 texts, 2 unread; 6 drilled leaves.
let t;
let learner;
let c;
before(async () => {
  t = await startTestGrove();
  importLearningContent(t.grove.db);
  learner = t.seedAccount({ email: 'learner@example.test' });
  applyDemo({ db: t.grove.db, accountId: learner.id });
  t.seedAccount({ email: 'other@example.test' });
  t.seedAccount({ email: 'empty@example.test' });
  c = t.client();
  await c.signInAgreed('learner@example.test');
});
after(() => t.close());

// Sessions here fill their time (FR-905: without `fill`, a plan that would run short is answered 409 first).
const start = (body, client = c) => client.post('/api/sessions', { kind: 'time', tile: 'mix', skill: 'mix', minutes: 10, voice: true, fill: true, ...body });

test('FR-903 FR-904 RQ-440: a tile session takes a tile, a skill and 5, 10, 20 or 30 minutes, and is shown one exercise at a time with its label, place and minutes left', async () => {
  for (const minutes of [3, 15, 60]) assert.equal((await start({ minutes })).status, 400, `${minutes} minutes`);
  assert.equal((await start({ topic: 'x' })).status, 400, 'a field the kind doesn\'t take');
  assert.equal((await start({ tile: undefined })).status, 400, 'a field the kind needs');
  assert.equal((await start({ hardOnly: true })).status, 400, 'Harder questions only is Review\'s');
  assert.equal((await start({ kind: 'topic', topic: 'x', tile: 'review' })).status, 400, 'a topic session is a Mix');
  assert.equal((await start({ skill: 'speaking' })).status, 400);
  const r = await start({});
  assert.equal(r.status, 200, JSON.stringify(r.body));
  const s = r.body.session;
  assert.equal(s.label, '10-minute Mix');
  assert.deepEqual([s.tile, s.skill, s.hardOnly, s.offer], ['mix', 'mix', false, null]);
  assert.equal(s.index, 0);
  assert.ok(s.total >= 2);
  assert.ok(s.minutesLeft >= 1);
  assert.equal(s.exercise.mode, 'review', 'Review comes first');
  assert.ok(s.exercise.question?.sentence || s.exercise.question?.mode === 'recall', 'the question is built when shown');
  assert.deepEqual((await c.get('/api/session')).body.session.id, s.id);
});

test('FR-904 RQ-421: Next moves on once per exercise; a repeated index answers the same state; an older one is stale; the last one finishes with a summary', async () => {
  let s = (await c.get('/api/session')).body.session;
  const first = await c.post('/api/session/next', { sessionId: s.id, index: 0 });
  assert.equal(first.body.session.index, 1);
  assert.equal((await c.post('/api/session/next', { sessionId: s.id, index: 0 })).body.session.index, 1, 'a double tap doesn\'t skip one');
  s = first.body.session;
  for (let i = s.index; i < s.total; i += 1) {
    const r = await c.post('/api/session/next', { sessionId: s.id, index: i });
    assert.equal(r.status, 200);
    s = r.body.session;
  }
  assert.equal(s.status, 'finished');
  assert.equal(s.exercise, null);
  for (const key of ['minutes', 'textsRead', 'wordsReviewed', 'wordsFell']) assert.equal(typeof s.summary[key], 'number', key);
  assert.equal((await c.get('/api/session')).body.session, null, 'no Resume once finished');
  assert.equal((await c.get(`/api/session?id=${s.id}`)).body.session.summary.minutes, s.summary.minutes, 'by id it still shows its summary');
  assert.equal((await c.post('/api/session/next', { sessionId: s.id, index: 5000 })).status, 400);
});

test('FR-904 RQ-442: starting another session replaces the going one (the shared account\'s last started wins)', async () => {
  const a = (await start({ minutes: 5 })).body.session;
  const b = (await start({ tile: 'review', minutes: 5 })).body.session;
  assert.equal(b.label, '5-minute Review');
  assert.equal(t.grove.db.prepare('SELECT status FROM practice_sessions WHERE id = ?').get(a.id).status, 'replaced');
  assert.equal((await c.get('/api/session')).body.session.id, b.id);
  assert.equal((await c.post('/api/session/next', { sessionId: a.id, index: 0 })).body.session.status, 'replaced');
});

test('FR-903 FR-905 FR-906 RQ-440 RQ-441 RQ-20: Discover, Review and Harder questions only start; Listening without a voice is refused; nothing to do is said', async () => {
  const review = (await start({ tile: 'review', minutes: 5 })).body.session;
  assert.equal(review.label, '5-minute Review');
  assert.ok(review.exercise.mode === 'review');
  const discover = (await start({ tile: 'discover', minutes: 5, skill: 'reading' })).body.session;
  assert.equal(discover.label, '5-minute Discover');
  const noVoice = await start({ skill: 'listening', voice: false });
  assert.equal(noVoice.status, 409);
  assert.equal(noVoice.body.error, 'no_voice');
  const hard = await start({ tile: 'review', minutes: 5, hardOnly: true, fill: false, asIs: true });
  assert.ok(hard.status === 200 || hard.body.error === 'nothing_to_do', JSON.stringify(hard.body));
  if (hard.status === 200) assert.equal(hard.body.session.hardOnly, true);
  const empty = t.client();
  await empty.signInAgreed('empty@example.test');
  const none = await start({ tile: 'review', minutes: 5 }, empty);
  assert.equal(none.status, 409);
  assert.equal(none.body.error, 'nothing_to_do');
});

test('FR-907 FR-915 RQ-443: Your library lists topics with their texts, unread first; Practise this topic is a Mix drawing from that topic', async () => {
  const { topics } = (await c.get('/api/topics')).body;
  assert.equal(topics.length, 1);
  const [topic] = topics;
  assert.equal(topic.texts.length, 4);
  assert.deepEqual(topic.texts.map((x) => x.read), [...topic.texts.map((x) => x.read)].sort((a, b) => a - b), 'unread first');
  const s = (await start({ kind: 'topic', topic: topic.topic })).body.session;
  assert.equal(s.label, `10-minute Mix: ${topic.label}`);
  assert.equal(s.topic, topic.topic);
});

test('FR-914 FR-923 RQ-155 T-23: another account can\'t see, move, plan or list this learner\'s session or texts', async () => {
  const mine = (await start({ minutes: 5 })).body.session;
  const other = t.client();
  await other.signInAgreed('other@example.test');
  assert.equal((await other.get('/api/session')).body.session, null);
  assert.equal((await other.post('/api/session/next', { sessionId: mine.id, index: 0 })).status, 404);
  assert.equal((await other.post('/api/session/plan', { sessionId: mine.id, fill: true })).status, 404);
  assert.equal((await other.get(`/api/session?id=${mine.id}`)).status, 404);
  assert.deepEqual((await other.get('/api/topics')).body.topics, []);
});

// SC-001 as amended by addendum 006 and B-25: every tile, set of ticked skills and length, filled, is
// planned within 20% or 2 minutes, or uses every leaf and read text it may and says it is shorter.
test('FR-905 SC-001 RQ-440 RQ-451 R-32: on the demo learner, Mix, Discover and Review of 5, 10, 20 and 30 minutes with each skill and pairs of skills, filled, are planned within 20% or 2 minutes, or use all they may and say they are shorter', () => {
  const inventory = readInventory(t.grove.db, learner.id, { learning: true });
  assert.ok(inventory.learning.words.length && inventory.learning.patterns.day, 'grove\'s learning content');
  const sets = [[], ['reading'], ['listening'], ['words'], ['grammar'], ['reading', 'grammar'], ['listening', 'words'], ['words', 'grammar']];
  for (const tile of ['mix', 'discover', 'review']) {
    for (const skills of sets) {
      const skill = skills.join('+') || 'all';
      for (const minutes of [5, 10, 20, 30]) {
        const p = plan({ params: { kind: 'time', tile, skills, minutes, voice: true, fill: true }, inventory });
        const lemmas = new Set(p.exercises.filter((e) => e.lemma).map((e) => e.lemma));
        const texts = new Set(p.exercises.filter((e) => e.textId).map((e) => e.textId));
        const kinds = tickedSkills({ skills }).filter((k) => k === 'reading' || k === 'listening');
        const leafKinds = skill === 'words' ? ['word', 'phrase'] : null;
        const leavesUsed = tile === 'discover' || inventory.leaves.filter((l) => !leafKinds || leafKinds.includes(l.kind)).every((l) => lemmas.has(l.lemma));
        // A read text left out only because it would run past the length is not one it may use.
        const room = minutes * 60 - p.seconds;
        const textsUsed = tile === 'review' || inventory.texts.filter((x) => x.read && kinds.includes(x.kind) && textSeconds(x, durationsFor(inventory.belowB1)) <= room).every((x) => texts.has(x.id));
        assert.ok(fits(p.seconds, minutes * 60) || (p.short && leavesUsed && textsUsed), `${tile} ${skill} ${minutes} min planned ${(p.seconds / 60).toFixed(1)}`);
      }
    }
  }
});

test('FR-905 RQ-421: a practice review answered in a session never changes the leaf\'s schedule, right or wrong (question-pages/76, F1)', async () => {
  const db = t.grove.db;
  const leaf = db.prepare("SELECT * FROM words WHERE account_id = ? AND drilled = 1 AND state = 'leaf' ORDER BY id LIMIT 1").get(learner.id);
  const before = db.prepare('SELECT gap_days, last_review_at, reviews, state FROM words WHERE id = ?').get(leaf.id);
  const answers = db.prepare('SELECT COUNT(*) AS n FROM review_answers WHERE word_id = ?').get(leaf.id).n;
  for (const right of [true, false]) {
    const r = await c.post('/api/review', { lemma: leaf.lemma, kind: leaf.kind, mode: 'remember', right, practice: true });
    assert.equal(r.status, 200, JSON.stringify(r.body));
    assert.equal(r.body.fell, false);
  }
  assert.deepEqual(db.prepare('SELECT gap_days, last_review_at, reviews, state FROM words WHERE id = ?').get(leaf.id), before);
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM review_answers WHERE word_id = ?').get(leaf.id).n, answers);
});

test('FR-904 RQ-421: the summary counts practice reviews among the words reviewed and gives the days practised this week, no streak (PD-05)', async () => {
  const s = (await start({ minutes: 5 })).body.session;
  let view = s;
  for (let i = 0; i < 40 && view.status === 'going'; i += 1) view = (await c.post('/api/session/next', { sessionId: view.id, index: view.index })).body.session;
  assert.equal(view.status, 'finished');
  assert.deepEqual(Object.keys(view.summary).sort(), ['daysThisWeek', 'minutes', 'textsRead', 'wordsFell', 'wordsReviewed']);
  assert.ok(view.summary.daysThisWeek >= 0 && view.summary.daysThisWeek <= 7);
});

test('FR-905 RQ-441: a Review that would run short is answered first with how long it would be; filled or as is, it starts', async () => {
  const short = await start({ tile: 'review', minutes: 30, fill: false });
  assert.equal(short.status, 409);
  assert.equal(short.body.error, 'short');
  assert.match(short.body.message, /would only be about \d+ min/);
  assert.equal((await start({ tile: 'review', minutes: 30, fill: false, asIs: true })).status, 200);
  assert.equal((await start({ tile: 'review', minutes: 30 })).status, 200);
});

test('FR-920 FR-923 SC-006 RQ-444 R-34: a Mix short of new texts keeps a going session with its offer; the bars count texts added since, wherever; full, Start plans it at its length; Practise without fills it', async () => {
  const r = await start({ minutes: 30, fill: false });
  assert.equal(r.status, 200, JSON.stringify(r.body));
  let s = r.body.session;
  assert.equal(s.exercise, null);
  assert.equal(s.total, 0);
  assert.deepEqual(s.offer.needs.sort(), ['listening', 'reading']);
  assert.deepEqual(s.offer.added, { reading: 0, listening: 0 });
  assert.equal(s.offer.full, false);
  assert.equal((await c.get('/api/session')).body.session.offer.full, false, 'the offer is kept on the server');
  const stillShort = (await c.post('/api/session/plan', { sessionId: s.id, fill: false })).body.session;
  assert.equal(stillShort.total, 0);
  assert.deepEqual(stillShort.offer.missing, s.offer.missing, 'the missing minutes stay as at the offer');
  const library = (await c.get('/api/library')).body.texts.filter((x) => x.added === null).sort((a, b) => a.level.localeCompare(b.level) || a.id.localeCompare(b.id));
  for (const kind of ['reading', 'listening']) {
    for (const x of library.filter((y) => y.kind === kind)) {
      if ((await c.get('/api/session')).body.session.offer.added[kind] >= s.offer.missing[kind]) break;
      assert.equal((await c.post('/api/library/add', { id: x.id })).status, 200);
    }
  }
  s = (await c.get('/api/session')).body.session;
  assert.equal(s.offer.full, true, JSON.stringify(s.offer));
  const planned = (await c.post('/api/session/plan', { sessionId: s.id, fill: false })).body.session;
  assert.equal(planned.offer, null, 'the offer (and the way back) is gone once planned');
  assert.ok(planned.total > 0);
  const seconds = planned.minutesLeft * 60;
  assert.ok(seconds >= 0.8 * 30 * 60 - 120, `planned about ${planned.minutesLeft} min of 30`);
  assert.equal((await c.post('/api/session/plan', { sessionId: s.id, fill: true })).status, 409, 'no offer to answer');
  const again = (await start({ minutes: 30, fill: false, skill: 'listening' })).body.session;
  if (again.offer) {
    const filled = (await c.post('/api/session/plan', { sessionId: again.id, fill: true })).body.session;
    assert.equal(filled.offer, null);
    assert.ok(filled.total > 0);
  }
});

test('FR-903 FR-905 FR-906 RQ-450 RQ-451: a session takes the ticked skills (none = all); both skill and skills, or a skill twice, is refused; an old single skill reads as one ticked', async () => {
  assert.equal((await start({ skill: undefined, skills: ['words', 'words'] })).status, 400);
  assert.equal((await start({ skills: ['words'] })).status, 400, 'skill and skills');
  assert.equal((await start({ skill: undefined, skills: ['speaking'] })).status, 400);
  const two = await start({ tile: 'discover', skill: undefined, skills: ['grammar', 'words'], minutes: 10 });
  assert.equal(two.status, 200, JSON.stringify(two.body));
  assert.deepEqual([two.body.session.skill, two.body.session.skills], ['mix', ['words', 'grammar']]);
  const none = await start({ skill: undefined, skills: [] });
  assert.deepEqual([none.body.session.skill, none.body.session.skills], ['mix', []]);
  const one = await start({ tile: 'discover', skill: undefined, skills: ['grammar'], minutes: 5 });
  assert.equal(one.status, 200, JSON.stringify(one.body));
  assert.deepEqual([one.body.session.skill, one.body.session.skills], ['grammar', ['grammar']]);
  const old = await start({ skill: 'reading' });
  assert.deepEqual(old.body.session.skills, ['reading']);
});

test('FR-928 FR-929 RQ-452 RQ-453: a Words session shows next words one per card and phrase spotlights; a Grammar session the pattern of the day with its text and places', async () => {
  const words = (await start({ tile: 'discover', skill: undefined, skills: ['words'], minutes: 10 })).body.session;
  assert.equal(words.exercise.type, 'words');
  assert.equal(words.exercise.mode, 'discover');
  assert.ok(words.exercise.words.length >= 1 && words.exercise.words.length <= 4);
  const card = words.exercise.words[0];
  assert.ok(card.id.startsWith('W-') && card.lemma && card.en && card.example.sv && card.level);
  const moved = (await c.post('/api/session/next', { sessionId: words.id, index: 0 })).body.session;
  assert.equal(moved.exercise.type, 'phrase');
  assert.ok(moved.exercise.phrase.choices.length === 3 && moved.exercise.phrase.examples.length === 2);
  const grammar = (await start({ tile: 'discover', skill: undefined, skills: ['grammar'], minutes: 5 })).body.session;
  assert.equal(grammar.exercise.type, 'grammar');
  assert.equal(grammar.exercise.learn, true);
  const p = grammar.exercise.pattern;
  assert.ok(p.id.startsWith('G-') && p.name && p.explain && p.howToSpot && p.examples.length && p.text.lines.length && p.spot.length);
});
