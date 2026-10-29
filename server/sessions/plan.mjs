// The session planner (G-09 FR-905…FR-907, addendum 006, B-25, B-26; research R2): a pure function from
// what the learner has (an inventory) to an ordered list of exercises with their planned seconds, for a
// Learning tile (Discover, Review, Mix), the ticked skills and a length. Review is the due and fading
// leaves, then harder questions (Master's, for well-known words); Discover is the ticked skills sharing the
// time equally, in turns (new reading and listening texts, Words and phrase exercises, Grammar exercises);
// Mix is Review (at most 40%) then the same for the rest. A ticked skill with too little gives its time to
// the others; new texts count as plenty until the short-session offer is answered: a Mix or Discover whose
// new texts cover under 80% of their target says what is missing per kind (`offer`, FR-920); filled
// (`fill`), the texts' missing time goes to the other ticked skills, then to the mix of fillMix below.
// Ties are broken by id, so the same inventory always gives the same plan.
import { DURATIONS, durationsFor, textSeconds } from './durations.mjs';

export const TILES = ['discover', 'review', 'mix'];
export const SKILLS = ['mix', 'reading', 'listening', 'words', 'grammar'];
export const TICKS = ['reading', 'listening', 'words', 'grammar'];
export const LENGTHS = [5, 10, 20, 30];
export const WORDS_PER_EXERCISE = 4;
const MAX_EXERCISES = 80;
const TEXT_SKILLS = ['reading', 'listening'];

// Whether the planned seconds are close enough to the length: within 20% or 2 minutes (FR-905).
export function fits(seconds, length) {
  return Math.abs(seconds - length) <= Math.max(0.2 * length, 120);
}

// The ticked skills (FR-903, B-25): `skills` as ticked ([] = all four), else an old single skill (Mix =
// all); without a voice no Listening; a topic session takes its texts only (FR-907).
export function tickedSkills({ skills, skill, voice = true, kind } = {}) {
  let ticked = Array.isArray(skills) ? TICKS.filter((s) => skills.includes(s)) : (!skill || skill === 'mix' ? [] : [skill]);
  if (!ticked.length) ticked = [...TICKS];
  if (kind === 'topic') ticked = [...TEXT_SKILLS];
  return voice ? ticked : ticked.filter((s) => s !== 'listening');
}
const isAll = (ticked, voice) => ticked.length === (voice ? 4 : 3);

const byStrength = (a, b) => (b.fading - a.fading) || (a.strength - b.strength) || (a.id - b.id);
const byGap = (a, b) => (b.gap - a.gap) || (a.id - b.id);

function reviewExercise(leaf, extra = {}) {
  return { mode: 'review', type: 'review', lemma: leaf.lemma, kind: leaf.kind, seconds: DURATIONS.review, ...extra };
}
// A harder question is part of Review (addendum 006, RQ-441): shown with a Review banner.
function harderExercise(leaf) {
  return { mode: 'review', type: 'master', lemma: leaf.lemma, kind: leaf.kind, seconds: DURATIONS.master };
}
function textExercise(text, durations) {
  return { mode: 'discover', type: 'text', textId: text.id, seconds: textSeconds(text, durations) };
}

// The leaves the ticked skills review, in the order they review them (FR-906): only Words ticked, words
// and phrases only; Grammar ticked (not all), pattern leaves first.
function skillLeaves(leaves, ticked, voice) {
  const all = isAll(ticked, voice);
  const own = ticked.every((s) => s === 'words') ? leaves.filter((l) => l.kind === 'word' || l.kind === 'phrase') : leaves;
  const first = !all && ticked.includes('grammar') ? (a, b) => (b.kind === 'pattern') - (a.kind === 'pattern') : () => 0;
  return { own, first };
}

// Review within `budget` seconds: the due and fading leaves (fading first), then harder questions, at
// most a third of the length while due or fading leaves are left out (R-33). `hardOnly`: harder only.
function planReview({ leaves, ticked, voice, budget, length, hardOnly, spoken, preferred = () => 0 }) {
  const { own, first } = skillLeaves(leaves, ticked, voice);
  const exercises = [];
  const planned = new Set();
  let used = 0;
  let hardBudget = budget;
  if (!hardOnly) {
    const due = own.filter((l) => l.due).sort((a, b) => preferred(a, b) || first(a, b) || byStrength(a, b));
    for (const leaf of due) {
      if (used + DURATIONS.review > budget || exercises.length >= MAX_EXERCISES) break;
      exercises.push(reviewExercise(leaf, spoken ? { spoken: true } : {}));
      planned.add(leaf.id);
      used += DURATIONS.review;
    }
    if (own.some((l) => l.due && !planned.has(l.id))) hardBudget = Math.min(budget, used + length / 3);
  }
  for (const leaf of own.filter((l) => l.masterReady && !planned.has(l.id)).sort((a, b) => preferred(a, b) || byGap(a, b))) {
    if (used + DURATIONS.master > hardBudget || exercises.length >= MAX_EXERCISES) break;
    exercises.push(harderExercise(leaf));
    planned.add(leaf.id);
    used += DURATIONS.master;
  }
  return { exercises, seconds: used, planned };
}

// New texts of a kind (FR-906): unfinished first is the inventory's order; then the one nearest the
// learner's target share of known words.
function textQueue(texts, kind, target, durations) {
  const off = (t) => Math.abs((t.knownShare ?? 100) - target);
  return texts.filter((t) => !t.read && t.kind === kind).sort((a, b) => (off(a) - off(b)) || (a.id - b.id)).map((t) => textExercise(t, durations));
}

// Words (FR-928): a Words exercise of up to 4 next words and a phrase spotlight, alternately; Grammar
// (FR-929): the pattern of the day, Learn then Spot it, then Spot it of earlier patterns.
function wordsQueue(learning, durations) {
  const sets = [];
  for (let i = 0; i < (learning?.words ?? []).length; i += WORDS_PER_EXERCISE) {
    const items = learning.words.slice(i, i + WORDS_PER_EXERCISE);
    sets.push({ mode: 'discover', type: 'words', items, seconds: items.length * durations.word });
  }
  const phrases = (learning?.phrases ?? []).map((item) => ({ mode: 'discover', type: 'phrase', item, seconds: durations.phrase }));
  const out = [];
  for (let i = 0; i < Math.max(sets.length, phrases.length); i += 1) {
    if (sets[i]) out.push(sets[i]);
    if (phrases[i]) out.push(phrases[i]);
  }
  return out;
}
function grammarQueue(learning, durations) {
  const p = learning?.patterns ?? {};
  return [
    ...(p.day ? [{ mode: 'discover', type: 'grammar', item: p.day, learn: true, seconds: durations.pattern }] : []),
    ...(p.earlier ?? []).map((item) => ({ mode: 'discover', type: 'grammar', item, learn: false, seconds: durations.spot })),
  ];
}

// Equal shares of `room` for the ticked skills, a skill with less than its share (its `cap`) giving the
// rest to the others (question-pages/89).
function shareOut(room, ticked, caps) {
  const shares = {};
  let left = room;
  let open = [...ticked];
  for (;;) {
    const share = open.length ? left / open.length : 0;
    const small = open.filter((s) => caps[s] < share);
    if (!small.length) { for (const s of open) shares[s] = share; return shares; }
    for (const s of small) { shares[s] = caps[s]; left -= caps[s]; }
    open = open.filter((s) => !small.includes(s));
  }
}

// The ticked skills' exercises: first each skill while under its share (the skill with the longest next
// exercise first, so a long one still fits), then any that still fit the time left (a short share's time
// goes to the others); then put in turns, one of each ticked skill a round, in the ticked order.
function takeInTurns({ ticked, queues, shares, room }) {
  const q = Object.fromEntries(ticked.map((s) => [s, [...queues[s]]]));
  const used = Object.fromEntries(ticked.map((s) => [s, 0]));
  const picked = Object.fromEntries(ticked.map((s) => [s, []]));
  let total = 0;
  let count = 0;
  const take = (s) => {
    const i = q[s].findIndex((ex) => ex.seconds <= room - total);
    if (i < 0 || count >= MAX_EXERCISES) return false;
    const [ex] = q[s].splice(i, 1);
    picked[s].push(ex);
    used[s] += ex.seconds;
    total += ex.seconds;
    count += 1;
    return true;
  };
  const nextSize = (s) => q[s].find((ex) => ex.seconds <= room - total)?.seconds ?? 0;
  for (let progress = true; progress;) {
    progress = false;
    const order = ticked.filter((s) => used[s] < shares[s] - 1).sort((a, b) => nextSize(b) - nextSize(a));
    for (const s of order) if (used[s] < shares[s] - 1 && take(s)) progress = true;
  }
  for (let progress = true; progress;) {
    progress = false;
    for (const s of ticked) if (take(s)) progress = true;
  }
  const exercises = [];
  for (let round = 0; exercises.length < count; round += 1) for (const s of ticked) if (picked[s][round]) exercises.push(picked[s][round]);
  return { exercises, seconds: total, used };
}

function planNew({ ticked, queues, room, plentyOfTexts }) {
  const sum = (list) => list.reduce((n, ex) => n + ex.seconds, 0);
  const caps = Object.fromEntries(ticked.map((s) => [s, TEXT_SKILLS.includes(s) && plentyOfTexts ? Infinity : Math.min(room, sum(queues[s]))]));
  const shares = shareOut(room, ticked, caps);
  return { ...takeInTurns({ ticked, queues, shares, room }), shares };
}

// FR-905 (question-pages/78, 3): a plan is filled, when the learner asks, with a mix taken in turn from
// practice reviews (leaves not yet due, the soonest due first; their answers never change a schedule),
// re-reading read reading texts and listening again to read listening texts (the longest ago first),
// each item at most once, while the plan is under 80%. Discover fills with texts again only.
function fillMix(base, { length, leaves, texts, voice, kinds, reviews = true, spoken = false, durations }) {
  const exercises = [...base.exercises];
  let used = base.seconds;
  const byOldest = (a, b) => ((a.readAt ?? 0) - (b.readAt ?? 0)) || (a.id - b.id);
  const queues = [
    reviews ? leaves.filter((l) => !l.due && !base.planned.has(l.id)).sort((a, b) => (a.strength - b.strength) || (a.id - b.id))
      .map((leaf) => reviewExercise(leaf, { practice: true, ...(spoken ? { spoken: true } : {}) })) : [],
    kinds.includes('reading') ? texts.filter((t) => t.read && t.kind === 'reading').sort(byOldest).map((t) => ({ ...textExercise(t, durations), again: 'reread' })) : [],
    voice && kinds.includes('listening') ? texts.filter((t) => t.read && t.kind === 'listening').sort(byOldest).map((t) => ({ ...textExercise(t, durations), again: 'listen' })) : [],
  ];
  for (let turn = 0; used < 0.8 * length && queues.some((q) => q.length) && exercises.length < MAX_EXERCISES; turn += 1) {
    const queue = queues[turn % queues.length];
    // Skip an item that would run past the length; the others of its kind may still fit.
    while (queue.length && used + queue[0].seconds > length) queue.shift();
    const next = queue.shift();
    if (!next) continue;
    exercises.push(next);
    used += next.seconds;
  }
  return { exercises, seconds: used };
}

// params: { kind: time | topic, tile, skills | skill, minutes, hardOnly, topic, voice, fill }.
export function plan({ params, inventory, durations: rates = DURATIONS }) {
  const durations = durationsFor(inventory.belowB1 ?? false, rates);
  const { tile, hardOnly = false, fill = false } = params;
  const voice = params.voice !== false;
  const length = params.minutes * 60;
  const ticked = tickedSkills({ ...params, voice });
  const kinds = ticked.filter((s) => TEXT_SKILLS.includes(s));
  let texts = inventory.texts.filter((t) => voice || t.kind !== 'listening');
  const leaves = inventory.leaves;
  let preferred = () => 0;
  if (params.kind === 'topic') {
    // FR-907: the topic's texts; the leaves met in them first, then any due ones.
    texts = texts.filter((t) => t.topic === params.topic);
    const ids = new Set(texts.map((t) => t.id));
    const inTopic = (l) => (l.textIds || []).some((id) => ids.has(id));
    preferred = (a, b) => inTopic(b) - inTopic(a);
  }
  const spoken = ticked.length === 1 && ticked[0] === 'listening';

  let review = { exercises: [], seconds: 0, planned: new Set() };
  if (tile === 'review' || tile === 'mix') {
    review = planReview({ leaves, ticked, voice, budget: tile === 'review' ? length : 0.4 * length, length, hardOnly: tile === 'review' && hardOnly, spoken, preferred });
  }
  let base = review;
  let offer = null;
  let wouldBeShort;
  if (tile === 'review') {
    wouldBeShort = review.seconds < 0.8 * length;
  } else {
    const room = length - review.seconds;
    const target = inventory.targetShare ?? 95;
    const queues = {
      reading: textQueue(texts, 'reading', target, durations),
      listening: textQueue(texts, 'listening', target, durations),
      words: wordsQueue(inventory.learning, durations),
      grammar: grammarQueue(inventory.learning, durations),
    };
    // New texts count as plenty while the offer decides; filled, they are what there is.
    let news = planNew({ ticked, queues, room, plentyOfTexts: true });
    const textTarget = kinds.reduce((n, k) => n + news.shares[k], 0);
    const textUsed = kinds.reduce((n, k) => n + news.used[k], 0);
    // Without Reading or Listening ticked there is no text target: a plan under 80% says so, as Review's.
    wouldBeShort = kinds.length > 0 ? textUsed < 0.8 * textTarget : review.seconds + news.seconds < 0.8 * length;
    if (wouldBeShort && kinds.length) {
      offer = { missing: Object.fromEntries(kinds.filter((k) => news.used[k] < news.shares[k]).map((k) => [k, Math.round(news.shares[k] - news.used[k])])) };
      if (fill) news = planNew({ ticked, queues, room, plentyOfTexts: false });
    }
    let exercises = [...review.exercises, ...news.exercises];
    let seconds = review.seconds + news.seconds;
    if (tile === 'mix' && !wouldBeShort) {
      // What is left of a Mix after its new things: more harder questions, while they fit.
      const more = planReview({ leaves: leaves.filter((l) => !review.planned.has(l.id)), ticked, voice, budget: length - seconds, length, hardOnly: true, spoken, preferred });
      exercises = [...exercises, ...more.exercises];
      seconds += more.seconds;
      for (const id of more.planned) review.planned.add(id);
    }
    base = { exercises, seconds, planned: review.planned };
  }

  const reviews = tile !== 'discover' && !(tile === 'review' && hardOnly);
  let result = { exercises: base.exercises, seconds: base.seconds };
  if (wouldBeShort && fill) {
    result = hardOnly && tile === 'review' ? result : fillMix(base, { length, leaves: skillLeaves(leaves, ticked, voice).own, texts, voice, kinds, reviews, spoken, durations });
  } else if (wouldBeShort && offer) {
    // Short of new texts and not filled: nothing is planned until the learner answers the offer.
    result = { exercises: [], seconds: 0 };
  }
  const short = result.seconds < length - Math.max(0.2 * length, 120);
  return {
    ...result,
    length,
    short,
    wouldBeShort,
    offer: wouldBeShort && !fill ? offer : null,
    reason: result.exercises.length ? (short ? 'not_enough' : null) : 'nothing_to_do',
  };
}
