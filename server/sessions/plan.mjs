// The session planner (G-09 FR-905…FR-907, addendum 006; research R2): a pure function from what the
// learner has (an inventory) to an ordered list of exercises with their planned seconds, for a Learning
// tile (Discover, Review, Mix), a skill and a length. Review is the due and fading leaves, then harder
// questions (Master's, for well-known words); Discover is new texts of the skill's kinds; Mix is Review
// (at most 40%) then new texts. A Mix or Discover whose new texts cover under 80% of their target says
// what is missing per kind (`offer`, FR-920); filled (`fill`), a plan gets the mix of fillMix below.
// Ties are broken by id, so the same inventory always gives the same plan.
import { DURATIONS, durationsFor, textSeconds } from './durations.mjs';

export const TILES = ['discover', 'review', 'mix'];
export const SKILLS = ['mix', 'reading', 'listening', 'words', 'grammar'];
export const LENGTHS = [5, 10, 20, 30];
const MAX_EXERCISES = 80;

// Whether the planned seconds are close enough to the length: within 20% or 2 minutes (FR-905).
export function fits(seconds, length) {
  return Math.abs(seconds - length) <= Math.max(0.2 * length, 120);
}

// The text kinds a skill uses (FR-905): Reading and Listening one each, the others both; no voice, no
// listening.
export function kindsFor(skill, voice) {
  const kinds = skill === 'reading' ? ['reading'] : skill === 'listening' ? ['listening'] : ['reading', 'listening'];
  return voice ? kinds : kinds.filter((k) => k !== 'listening');
}

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

// The leaves a skill reviews, in the order it reviews them (FR-906): Words only words and phrases;
// Grammar pattern leaves first.
function skillLeaves(leaves, skill) {
  const own = skill === 'words' ? leaves.filter((l) => l.kind === 'word' || l.kind === 'phrase') : leaves;
  const first = skill === 'grammar' ? (a, b) => (b.kind === 'pattern') - (a.kind === 'pattern') : () => 0;
  return { own, first };
}

// Review within `budget` seconds: the due and fading leaves (fading first), then harder questions, at
// most a third of the length while due or fading leaves are left out (R-33). `hardOnly`: harder only.
function planReview({ leaves, skill, budget, length, hardOnly, spoken, preferred = () => 0 }) {
  const { own, first } = skillLeaves(leaves, skill);
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

// The order new texts are taken in (FR-906): Grammar the most pattern places, Words the shortest, the
// others the one nearest the learner's target share of known words.
function textOrder(skill, target) {
  if (skill === 'grammar') return (a, b) => (b.patternPlaces - a.patternPlaces) || (a.id - b.id);
  if (skill === 'words') return (a, b) => (a.words - b.words) || (a.id - b.id);
  const off = (t) => Math.abs((t.knownShare ?? 100) - target);
  return (a, b) => (off(a) - off(b)) || (a.id - b.id);
}

// New texts for a `target` of seconds, split between the kinds; taken in turn, one kind then the other,
// while that kind is under its share and the text fits in what is left of the session.
function planTexts({ texts, kinds, target, room, skill, targetShare, durations }) {
  const share = kinds.length ? target / kinds.length : 0;
  const order = textOrder(skill, targetShare);
  const queues = Object.fromEntries(kinds.map((k) => [k, texts.filter((t) => !t.read && t.kind === k).sort(order)]));
  const byKind = Object.fromEntries(kinds.map((k) => [k, 0]));
  const exercises = [];
  let used = 0;
  for (let progress = true; progress && exercises.length < MAX_EXERCISES;) {
    progress = false;
    for (const k of kinds) {
      if (byKind[k] >= share) continue;
      const i = queues[k].findIndex((t) => textSeconds(t, durations) <= room - used);
      if (i < 0) continue;
      const [text] = queues[k].splice(i, 1);
      const ex = textExercise(text, durations);
      exercises.push(ex);
      byKind[k] += ex.seconds;
      used += ex.seconds;
      progress = true;
    }
  }
  const missing = Object.fromEntries(kinds.filter((k) => byKind[k] < share).map((k) => [k, Math.round(share - byKind[k])]));
  return { exercises, seconds: used, missing };
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

// params: { kind: time | topic, tile, skill, minutes, hardOnly, topic, voice, fill }.
export function plan({ params, inventory, durations: rates = DURATIONS }) {
  const durations = durationsFor(inventory.belowB1 ?? false, rates);
  const { tile, skill = 'mix', hardOnly = false, fill = false } = params;
  const voice = params.voice !== false;
  const length = params.minutes * 60;
  const kinds = kindsFor(skill, voice);
  let texts = inventory.texts.filter((t) => voice || t.kind !== 'listening');
  let leaves = inventory.leaves;
  let preferred = () => 0;
  if (params.kind === 'topic') {
    // FR-907: the topic's texts; the leaves met in them first, then any due ones.
    texts = texts.filter((t) => t.topic === params.topic);
    const ids = new Set(texts.map((t) => t.id));
    const inTopic = (l) => (l.textIds || []).some((id) => ids.has(id));
    preferred = (a, b) => inTopic(b) - inTopic(a);
  }
  const spoken = skill === 'listening';

  let review = { exercises: [], seconds: 0, planned: new Set() };
  if (tile === 'review' || tile === 'mix') {
    review = planReview({ leaves, skill, budget: tile === 'review' ? length : 0.4 * length, length, hardOnly: tile === 'review' && hardOnly, spoken, preferred });
  }
  let base = review;
  let offer = null;
  let wouldBeShort;
  if (tile === 'review') {
    wouldBeShort = review.seconds < 0.8 * length;
  } else {
    const target = length - review.seconds;
    const news = planTexts({ texts, kinds, target, room: length - review.seconds, skill, targetShare: inventory.targetShare ?? 95, durations });
    wouldBeShort = news.seconds < 0.8 * target;
    let exercises = [...review.exercises, ...news.exercises];
    let seconds = review.seconds + news.seconds;
    if (tile === 'mix' && !wouldBeShort) {
      // What is left of a Mix after its texts: more harder questions, while they fit.
      const more = planReview({ leaves: leaves.filter((l) => !review.planned.has(l.id)), skill, budget: length - seconds, length, hardOnly: true, spoken, preferred });
      exercises = [...exercises, ...more.exercises];
      seconds += more.seconds;
      for (const id of more.planned) review.planned.add(id);
    }
    base = { exercises, seconds, planned: review.planned };
    if (wouldBeShort) offer = { missing: news.missing };
  }

  const reviews = tile !== 'discover' && !(tile === 'review' && hardOnly);
  let result = { exercises: base.exercises, seconds: base.seconds };
  if (wouldBeShort && fill) {
    result = hardOnly && tile === 'review' ? result : fillMix(base, { length, leaves: skillLeaves(leaves, skill).own, texts, voice, kinds, reviews, spoken, durations });
  } else if (wouldBeShort && tile !== 'review') {
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
