// The session planner (G-09 FR-905…FR-908; research R2): a pure function from what the learner has
// (an inventory) to an ordered list of exercises with their planned seconds. Review of fading then due
// leaves first (at most 40% of the length), one Discover text that fits, then Master; a plan under 80%
// says so (`wouldBeShort`) and, when asked (`fill`), is filled with a mix (fillMix below).
// Ties are broken by id, so the same inventory always gives the same plan.
import { DURATIONS, durationsFor, textSeconds } from './durations.mjs';

export const FORMS = { short: 5, medium: 10, long: 20 };
export const SKILLS = ['reading', 'listening', 'words', 'grammar'];
export const MODE_BATCH = 10;
const MAX_EXERCISES = 80;

// Whether the planned seconds are close enough to the length: within 20% or 2 minutes (FR-905).
export function fits(seconds, length) {
  return Math.abs(seconds - length) <= Math.max(0.2 * length, 120);
}

const byStrength = (a, b) => (b.fading - a.fading) || (a.strength - b.strength) || (a.id - b.id);
const byGap = (a, b) => (b.gap - a.gap) || (a.id - b.id);

function reviewExercise(leaf, extra = {}) {
  return { mode: 'review', type: 'review', lemma: leaf.lemma, kind: leaf.kind, seconds: DURATIONS.review, ...extra };
}
function masterExercise(leaf) {
  return { mode: 'master', type: 'master', lemma: leaf.lemma, kind: leaf.kind, seconds: DURATIONS.master };
}
function textExercise(text, durations) {
  return { mode: 'discover', type: 'text', textId: text.id, seconds: textSeconds(text, durations) };
}

// The kind (reading or listening) the learner did less of in the last 7 days; reading on a tie.
function lessDone(inventory) {
  const r = inventory.recent?.reading ?? 0;
  const l = inventory.recent?.listening ?? 0;
  return l < r ? 'listening' : 'reading';
}

// Fills a length: Review (≤ 40%), one text, Master. `pickText(room)` chooses the Discover text.
function fill({ length, leaves, pickText, reviewFirst = () => 0, spoken = false, durations }) {
  const exercises = [];
  let used = 0;
  const planned = new Set();
  const due = leaves.filter((l) => l.due).sort((a, b) => reviewFirst(a, b) || byStrength(a, b));
  for (const leaf of due) {
    if (used + durations.review > 0.4 * length || exercises.length >= MAX_EXERCISES) break;
    exercises.push(reviewExercise(leaf, spoken ? { spoken: true } : {}));
    planned.add(leaf.id);
    used += durations.review;
  }
  const text = pickText(length - used);
  if (text) {
    const ex = textExercise(text, durations);
    exercises.push(ex);
    used += ex.seconds;
  }
  for (const leaf of leaves.filter((l) => l.masterReady && !planned.has(l.id)).sort(byGap)) {
    if (used + durations.master > length || exercises.length >= MAX_EXERCISES) break;
    exercises.push(masterExercise(leaf));
    used += durations.master;
    planned.add(leaf.id);
  }
  return { exercises, seconds: used, planned };
}

// FR-905 (question-pages/78, 3): a plan under 80% of its length is filled, when the learner asks, with a
// mix taken in turn from practice reviews (leaves not yet due, the soonest due first; their answers never
// change a schedule), re-reading read reading texts and listening again to read listening texts (the
// longest ago first), each item at most once, while the plan is under 80%.
function fillMix(base, { length, leaves, texts, voice, spoken = false, durations }) {
  const exercises = [...base.exercises];
  let used = base.seconds;
  const byOldest = (a, b) => ((a.readAt ?? 0) - (b.readAt ?? 0)) || (a.id - b.id);
  const queues = [
    leaves.filter((l) => !l.due && !base.planned.has(l.id)).sort((a, b) => (a.strength - b.strength) || (a.id - b.id))
      .map((leaf) => reviewExercise(leaf, { practice: true, ...(spoken ? { spoken: true } : {}) })),
    texts.filter((t) => t.read && t.kind === 'reading').sort(byOldest).map((t) => ({ ...textExercise(t, durations), again: 'reread' })),
    voice ? texts.filter((t) => t.read && t.kind === 'listening').sort(byOldest).map((t) => ({ ...textExercise(t, durations), again: 'listen' })) : [],
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

// The first unread text (by id) of the wanted kind that fits the room, else of the other kind.
function firstFitting(texts, room, prefer, durations) {
  const fitting = texts.filter((t) => !t.read && textSeconds(t, durations) <= room).sort((a, b) => a.id - b.id);
  return fitting.find((t) => t.kind === prefer) ?? fitting[0] ?? null;
}

// The base plan, and, when it is under 80% of the length: `wouldBeShort`, and the mix if asked (`fill`).
function result(base, length, mix) {
  const wouldBeShort = base.seconds < 0.8 * length;
  const plan = wouldBeShort && mix.fill ? fillMix(base, { ...mix, length }) : { exercises: base.exercises, seconds: base.seconds };
  const short = length !== null && plan.seconds < length - Math.max(0.2 * length, 120);
  return { ...plan, length, short, wouldBeShort, reason: short ? (plan.exercises.length ? 'not_enough' : 'nothing_to_do') : null };
}

// kind: time | topic | skill | mode. params: { minutes, topic, skill, form, mode, voice }.
export function plan({ kind, params, inventory, durations: base = DURATIONS }) {
  const durations = durationsFor(inventory.belowB1 ?? false, base);
  const voice = params.voice !== false;
  const texts = inventory.texts.filter((t) => voice || t.kind !== 'listening');
  const leaves = inventory.leaves;

  if (kind === 'mode') {
    let exercises = [];
    if (params.mode === 'review') exercises = leaves.filter((l) => l.due).sort(byStrength).slice(0, MODE_BATCH).map((l) => reviewExercise(l));
    else if (params.mode === 'master') exercises = leaves.filter((l) => l.masterReady).sort(byGap).slice(0, MODE_BATCH).map(masterExercise);
    else {
      const next = texts.filter((t) => !t.read).sort((a, b) => a.id - b.id)[0];
      if (next) exercises = [textExercise(next, durations)];
    }
    const seconds = exercises.reduce((s, e) => s + e.seconds, 0);
    return { exercises, seconds, length: null, short: false, reason: exercises.length ? null : 'nothing_to_do' };
  }

  if (kind === 'topic') {
    const own = texts.filter((t) => t.topic === params.topic);
    const ids = new Set(own.map((t) => t.id));
    const length = params.minutes * 60;
    const topicLeaves = leaves.filter((l) => (l.textIds || []).some((id) => ids.has(id)));
    return result(fill({ length, leaves: topicLeaves, durations, pickText: (room) => firstFitting(own, room, lessDone(inventory), durations) }), length, { leaves: topicLeaves, texts: own, voice, durations, fill: !!params.fill });
  }

  if (kind === 'skill') {
    const length = FORMS[params.form] * 60;
    const target = inventory.targetShare ?? 95;
    const ofSkill = {
      reading: (t) => t.kind === 'reading',
      listening: (t) => t.kind === 'listening',
      words: () => true,
      grammar: (t) => (t.patternPlaces ?? 0) > 0,
    }[params.skill];
    const pickText = (room) => {
      const candidates = texts.filter((t) => !t.read && ofSkill(t) && textSeconds(t, durations) <= room);
      if (!candidates.length) return null;
      if (params.skill === 'words') return [...candidates].sort((a, b) => (a.words - b.words) || (a.id - b.id))[0];
      if (params.skill === 'grammar') return [...candidates].sort((a, b) => (b.patternPlaces - a.patternPlaces) || (a.id - b.id))[0];
      // PD-04: Short 90–94%, Medium nearest the target, Long 98%+; the nearest when none is in the band.
      const share = (t) => t.knownShare ?? 100;
      const band = { short: [90, 94], medium: [target, target], long: [98, 100] }[params.form];
      const distance = (t) => Math.max(0, band[0] - share(t), share(t) - band[1]);
      const pick = [...candidates].sort((a, b) => (distance(a) - distance(b)) || (a.id - b.id))[0];
      if (distance(pick) > 0 && params.form !== 'medium') outOfBand = true;
      return pick;
    };
    let outOfBand = false;
    const reviewFirst = params.skill === 'grammar' ? (a, b) => (b.kind === 'pattern') - (a.kind === 'pattern') : () => 0;
    const lean = params.skill === 'words'
      ? fill({ length, leaves, durations, pickText: () => null })
      : fill({ length, leaves, durations, pickText, reviewFirst, spoken: params.skill === 'listening' });
    if (params.skill === 'words') {
      const text = pickText(length - lean.seconds);
      if (text) { const ex = textExercise(text, durations); lean.exercises.push(ex); lean.seconds += ex.seconds; }
    }
    return { ...result(lean, length, { leaves, texts, voice, durations, fill: !!params.fill, spoken: params.skill === 'listening' }), note: outOfBand ? 'out_of_band' : null };
  }

  const length = params.minutes * 60;
  return result(fill({ length, leaves, durations, pickText: (room) => firstFitting(texts, room, lessDone(inventory), durations) }), length, { leaves, texts, voice, durations, fill: !!params.fill });
}
