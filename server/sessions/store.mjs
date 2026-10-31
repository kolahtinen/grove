// Sessions on the server (G-09 FR-904, FR-914, FR-920, FR-923; addendum 006; research R1, R5): one going
// session per account, its tile, ticked skills (B-25; `params.skills`, an old row's single skill) and length, its planned exercises and how far the learner has got.
// RQ-457…RQ-459 (FR-904, FR-912, FR-932, FR-933): every exercise names its skill and seconds, and the plan's
// list goes with the session (the start screen and the session bar's segments); an exercise is frozen the
// first time it is shown and keeps the learner's answer, so a finished one can be looked at again as it was;
// a session left on its offer, never planned, isn't kept.
// Starting a session replaces the going one. A Mix or Discover short of new texts is kept as a going
// session with an empty plan and its offer (the minutes missing per kind and when), which is also the way
// back to it; answering the offer plans it. An exercise's question is built when it is shown, so a word
// answered elsewhere since planning still works.
import { HttpError } from '../web/http.mjs';
import { transaction } from '../store/db.mjs';
import { createQuestions } from '../drill/questions.mjs';
import { plan as planSession, TICKS } from './plan.mjs';
import { getItem, wordCard, phraseCard, patternCard } from '../learning/learning.mjs';
import { readInventory } from './inventory.mjs';
import { summarise } from './summary.mjs';
import { offerState } from './offer.mjs';

const publicOffer = ({ notFull, ...offer }) => offer;

const TILE_NAMES = { discover: 'Discover', review: 'Review', mix: 'Mix' };
// A frozen exercise is kept only while small (data-model.md: at most 8 KB).
const MAX_SHOWN = 8 * 1024;

// The skill an exercise belongs to (FR-912's kicker, the session bar's colours).
function skillOf(ex, textKind) {
  if (ex.type === 'words' || ex.type === 'phrase') return 'words';
  if (ex.type === 'grammar') return 'grammar';
  if (ex.textId) return textKind === 'listening' ? 'listening' : 'reading';
  return 'review';
}

// The ticked skills of a request or a row: `skills` as ticked ([] = all), else the single skill (Mix = all).
function skillsOf(skills, skill) {
  if (Array.isArray(skills)) return TICKS.filter((s) => skills.includes(s));
  return !skill || skill === 'mix' ? [] : [skill];
}

export function createSessions({ db, now = () => Date.now() }) {
  const questions = createQuestions(db);
  const going = (accountId) => db.prepare("SELECT * FROM practice_sessions WHERE account_id = ? AND status = 'going'").get(accountId);
  const mine = (accountId, id) => {
    const row = db.prepare('SELECT * FROM practice_sessions WHERE id = ? AND account_id = ?').get(id, accountId);
    if (!row) throw new HttpError(404, 'not_found', 'There is no such session.');
    return row;
  };

  const textInfo = (accountId, textId) => db.prepare('SELECT title, kind FROM texts WHERE id = ? AND account_id = ?').get(textId, accountId) ?? null;

  function exerciseView(accountId, ex) {
    // An old plan's Master item is shown as Review (FR-912, addendum 006).
    const text = ex.textId ? textInfo(accountId, ex.textId) : null;
    const view = {
      mode: ex.mode === 'master' ? 'review' : ex.mode,
      type: ex.again ?? ex.type,
      skill: skillOf(ex, text?.kind),
      minutes: Math.max(1, Math.round(ex.seconds / 60)),
      seconds: ex.seconds,
    };
    if (ex.type === 'words') {
      view.words = (ex.items ?? []).map((id) => getItem(db, id)).filter((i) => i?.type === 'word').map(wordCard);
    } else if (ex.type === 'phrase') {
      const item = getItem(db, ex.item);
      view.phrase = item?.type === 'phrase' ? phraseCard(db, item) : null;
    } else if (ex.type === 'grammar') {
      const item = getItem(db, ex.item);
      view.learn = !!ex.learn;
      view.pattern = item?.type === 'pattern' ? patternCard(item) : null;
    } else if (ex.textId) {
      view.textId = ex.textId;
      view.title = text?.title ?? null;
      view.textKind = text?.kind ?? null;
      if (ex.again) view.again = true;
    } else {
      const item = db.prepare('SELECT * FROM words WHERE account_id = ? AND lemma = ? AND kind = ?').get(accountId, ex.lemma, ex.kind);
      if (item) view.question = ex.type === 'master' ? questions.masterQuestion(accountId, item) : questions.meaningQuestion(accountId, item);
      if (ex.spoken) view.spoken = true;
      if (ex.practice) view.practice = true;
    }
    return view;
  }

  function label(row, params) {
    const name = TILE_NAMES[row.tile] ?? 'Session';
    if (!row.minutes) return name;
    const topic = row.kind === 'topic' ? `: ${params.topic || 'My own texts'}` : '';
    return `${row.minutes}-minute ${name}${topic}`;
  }

  // The exercise as first shown, stored on the plan then (FR-904: looked at again as it was).
  function shown(accountId, row, exercises, index) {
    const ex = exercises[index];
    if (ex.shown) return ex.shown;
    const v = exerciseView(accountId, ex);
    if (JSON.stringify(v).length <= MAX_SHOWN) {
      ex.shown = v;
      db.prepare('UPDATE practice_sessions SET plan = ? WHERE id = ?').run(JSON.stringify(exercises), row.id);
    }
    return v;
  }

  function view(accountId, row) {
    if (!row) return null;
    const exercises = JSON.parse(row.plan);
    const left = exercises.slice(row.at_index).reduce((s, e) => s + e.seconds, 0);
    const total = exercises.reduce((s, e) => s + e.seconds, 0);
    const texts = new Map(exercises.filter((e) => e.textId).map((e) => [e.textId, textInfo(accountId, e.textId)]));
    const params = JSON.parse(row.params);
    const offer = row.offer && row.status === 'going' ? publicOffer(offerState(db, accountId, JSON.parse(row.offer))) : null;
    return {
      id: row.id,
      kind: row.kind,
      tile: row.tile,
      skill: row.skill,
      skills: skillsOf(params.skills, row.skill),
      hardOnly: !!row.hard_only,
      topic: params.topic ?? null,
      minutes: row.minutes,
      label: label(row, params),
      index: row.at_index,
      total: exercises.length,
      minutesLeft: Math.round(left / 60),
      secondsLeft: left,
      seconds: total,
      exercises: exercises.map((e) => ({
        skill: skillOf(e, texts.get(e.textId)?.kind), type: e.again ?? e.type, seconds: e.seconds, done: !!e.done,
        ...(e.textId ? { title: texts.get(e.textId)?.title ?? '' } : {}),
      })),
      short: !!params.short,
      status: row.status,
      offer,
      exercise: row.status === 'going' && row.at_index < exercises.length ? shown(accountId, row, exercises, row.at_index) : null,
      summary: row.status === 'finished' ? summarise(db, accountId, row) : null,
    };
  }

  function planFor(accountId, row, { fill }) {
    const params = JSON.parse(row.params);
    const inventory = readInventory(db, accountId, { now: now(), knownShares: row.tile !== 'review', learning: row.tile !== 'review' });
    return planSession({ params: { kind: row.kind, tile: row.tile, skills: skillsOf(params.skills, row.skill), minutes: row.minutes, hardOnly: !!row.hard_only, topic: params.topic, voice: params.voice, fill }, inventory });
  }

  function store(rowId, planned) {
    db.prepare('UPDATE practice_sessions SET plan = ?, params = json_set(params, \'$.short\', json(?)), offer = NULL WHERE id = ?')
      .run(JSON.stringify(planned.exercises), planned.short ? 'true' : 'false', rowId);
  }

  return {
    start(accountId, body) {
      const { kind, tile, minutes, voice } = body;
      const hardOnly = !!body.hardOnly;
      const skills = skillsOf(body.skills, body.skill);
      const skill = skills.length === 1 ? skills[0] : 'mix';
      if (skills.length === 1 && skill === 'listening' && voice === false) {
        throw new HttpError(409, 'no_voice', 'This device has no Swedish voice, so grove can’t plan listening.');
      }
      const params = { voice, skills, ...(kind === 'topic' ? { topic: body.topic } : {}) };
      const inventory = readInventory(db, accountId, { now: now(), knownShares: tile !== 'review', learning: tile !== 'review' });
      const planned = planSession({ params: { kind, tile, skills, minutes, hardOnly, topic: body.topic, voice, fill: !!body.fill }, inventory });
      // FR-905: a Review, or a Mix or Discover without a text target, that would run short first says so:
      // Fill the time or Start shorter (as is).
      if (!planned.offer && planned.wouldBeShort && !body.fill && !body.asIs && planned.exercises.length) {
        throw new HttpError(409, 'short', `This session would only be about ${Math.max(1, Math.round(planned.seconds / 60))} min. Fill the time with practice, or start it shorter.`);
      }
      if (!planned.exercises.length && !planned.offer) throw new HttpError(409, 'nothing_to_do', 'There is nothing to practise right now. Add a text first.');
      const id = transaction(db, () => {
        db.prepare("UPDATE practice_sessions SET status = 'replaced', finished_at = ? WHERE account_id = ? AND status = 'going'").run(now(), accountId);
        const offer = planned.offer ? JSON.stringify({ missing: planned.offer.missing, at: now() }) : null;
        return Number(db.prepare(`INSERT INTO practice_sessions (account_id, kind, minutes, params, plan, at_index, status, started_at, tile, skill, hard_only, offer)
          VALUES (?, ?, ?, ?, ?, 0, 'going', ?, ?, ?, ?, ?)`).run(accountId, kind, minutes, JSON.stringify({ ...params, short: planned.short }), JSON.stringify(planned.exercises), now(), tile, skill, hardOnly ? 1 : 0, offer).lastInsertRowid);
      });
      return view(accountId, db.prepare('SELECT * FROM practice_sessions WHERE id = ?').get(id));
    },
    // The offer answered (FR-920): fill = Practise without; otherwise ▶ Start your session, planned with
    // the texts there are now; still short, the offer stays as it was.
    answerOffer(accountId, { sessionId, fill }) {
      const row = mine(accountId, sessionId);
      if (row.status !== 'going' || !row.offer) throw new HttpError(409, 'stale', 'This session has already been planned.');
      const planned = planFor(accountId, row, { fill });
      if (!fill && planned.wouldBeShort) return view(accountId, row);
      if (!planned.exercises.length) throw new HttpError(409, 'nothing_to_do', 'There is nothing to practise right now. Add a text first.');
      store(row.id, planned);
      return view(accountId, mine(accountId, row.id));
    },
    // The going session (Home's Resume bar, and the way back from the offer).
    current(accountId) {
      return view(accountId, going(accountId));
    },
    // One of the learner's sessions by id (the session page after a text that ended it shows its summary).
    byId(accountId, id) {
      return view(accountId, mine(accountId, id));
    },
    // FR-904 (RQ-459): a finished exercise looked at again, as first shown, with the learner's answer.
    exercise(accountId, { id, index }) {
      const row = mine(accountId, id);
      const exercises = JSON.parse(row.plan);
      if (!Number.isSafeInteger(index) || index < 0 || index >= row.at_index || index >= exercises.length || !exercises[index].done) {
        throw new HttpError(404, 'not_found', 'There is no such finished exercise.');
      }
      const ex = exercises[index];
      return { index, exercise: ex.shown ?? exerciseView(accountId, ex), answer: ex.answer ?? null };
    },
    // FR-904: ✕ on a session. One left on its offer, never planned, isn't kept (no Resume); any other is.
    leave(accountId, { sessionId }) {
      const row = mine(accountId, sessionId);
      if (row.status === 'going' && row.offer && JSON.parse(row.plan).length === 0) {
        db.prepare('DELETE FROM practice_sessions WHERE id = ? AND account_id = ?').run(row.id, accountId);
        return { kept: false };
      }
      return { kept: true };
    },
    next(accountId, { sessionId, index, answer }) {
      const row = mine(accountId, sessionId);
      if (index === row.at_index - 1 || row.status !== 'going') return view(accountId, row);
      if (index !== row.at_index) throw new HttpError(409, 'stale', 'This exercise is already done.');
      const exercises = JSON.parse(row.plan);
      if (index >= exercises.length) throw new HttpError(409, 'stale', 'This session has nothing planned yet.');
      exercises[index].done = true;
      if (answer) exercises[index].answer = answer;
      const finished = index + 1 >= exercises.length;
      db.prepare('UPDATE practice_sessions SET plan = ?, at_index = ?, status = ?, finished_at = ? WHERE id = ?')
        .run(JSON.stringify(exercises), index + 1, finished ? 'finished' : 'going', finished ? now() : null, row.id);
      return view(accountId, mine(accountId, row.id));
    },
  };
}

