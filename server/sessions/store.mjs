// Sessions on the server (G-09 FR-904, FR-914; research R1, R5): one going session per account, its
// planned exercises and how far the learner has got. Starting a session replaces the going one; an
// exercise's question is built when it is shown, so a word answered elsewhere since planning still works.
import { HttpError } from '../web/http.mjs';
import { transaction } from '../store/db.mjs';
import { createQuestions } from '../drill/questions.mjs';
import { plan as planSession, FORMS } from './plan.mjs';
import { readInventory } from './inventory.mjs';
import { summarise } from './summary.mjs';

const LABELS = { discover: 'Discover', review: 'Review', master: 'Master' };

export function createSessions({ db, now = () => Date.now() }) {
  const questions = createQuestions(db);
  const going = (accountId) => db.prepare("SELECT * FROM practice_sessions WHERE account_id = ? AND status = 'going'").get(accountId);

  function exerciseView(accountId, ex) {
    const view = { mode: ex.mode, type: ex.type, minutes: Math.max(1, Math.round(ex.seconds / 60)) };
    if (ex.textId) {
      view.textId = ex.textId;
      view.title = db.prepare('SELECT title FROM texts WHERE id = ? AND account_id = ?').get(ex.textId, accountId)?.title ?? null;
    } else {
      const item = db.prepare('SELECT * FROM words WHERE account_id = ? AND lemma = ? AND kind = ?').get(accountId, ex.lemma, ex.kind);
      if (item) view.question = ex.type === 'master' ? questions.masterQuestion(accountId, item) : questions.meaningQuestion(accountId, item);
      if (ex.spoken) view.spoken = true;
      if (ex.practice) view.practice = true;
    }
    return view;
  }

  function view(accountId, row) {
    if (!row) return null;
    const exercises = JSON.parse(row.plan);
    const left = exercises.slice(row.at_index).reduce((s, e) => s + e.seconds, 0);
    const params = JSON.parse(row.params);
    const label = row.kind === 'mode' ? LABELS[params.mode] : `${row.minutes}-minute session`;
    return {
      id: row.id,
      kind: row.kind,
      minutes: row.minutes,
      label,
      index: row.at_index,
      total: exercises.length,
      minutesLeft: Math.round(left / 60),
      short: !!params.short,
      note: params.note ?? null,
      status: row.status,
      exercise: row.status === 'going' && row.at_index < exercises.length ? exerciseView(accountId, exercises[row.at_index]) : null,
      summary: row.status === 'finished' ? summarise(db, accountId, row) : null,
    };
  }

  return {
    start(accountId, body) {
      const { kind, voice } = body;
      const minutes = kind === 'skill' ? FORMS[body.form] : kind === 'mode' ? null : body.minutes;
      const params = { voice, ...(kind === 'topic' ? { topic: body.topic } : {}), ...(kind === 'skill' ? { skill: body.skill, form: body.form } : {}), ...(kind === 'mode' ? { mode: body.mode } : {}) };
      if (kind === 'skill' && body.skill === 'listening' && voice === false) {
        throw new HttpError(409, 'no_voice', 'This device has no Swedish voice, so grove can’t plan listening.');
      }
      const inventory = readInventory(db, accountId, { now: now(), knownShares: kind === 'skill' });
      const planned = planSession({ kind, params: { ...params, minutes }, inventory });
      if (!planned.exercises.length) throw new HttpError(409, 'nothing_to_do', 'There is nothing to practise right now. Get some new texts first.');
      const id = transaction(db, () => {
        db.prepare("UPDATE practice_sessions SET status = 'replaced', finished_at = ? WHERE account_id = ? AND status = 'going'").run(now(), accountId);
        return Number(db.prepare(`INSERT INTO practice_sessions (account_id, kind, minutes, params, plan, at_index, status, started_at)
          VALUES (?, ?, ?, ?, ?, 0, 'going', ?)`).run(accountId, kind, minutes, JSON.stringify({ ...params, short: planned.short, note: planned.note ?? null }), JSON.stringify(planned.exercises), now()).lastInsertRowid);
      });
      return view(accountId, db.prepare('SELECT * FROM practice_sessions WHERE id = ?').get(id));
    },
    // The going session (Home's Resume tile); a finished one's summary comes with its last `next`.
    current(accountId) {
      return view(accountId, going(accountId));
    },
    // One of the learner's sessions by id (the session page after a text that ended it shows its summary).
    byId(accountId, id) {
      const row = db.prepare('SELECT * FROM practice_sessions WHERE id = ? AND account_id = ?').get(id, accountId);
      if (!row) throw new HttpError(404, 'not_found', 'There is no such session.');
      return view(accountId, row);
    },
    next(accountId, { sessionId, index }) {
      const row = db.prepare('SELECT * FROM practice_sessions WHERE id = ? AND account_id = ?').get(sessionId, accountId);
      if (!row) throw new HttpError(404, 'not_found', 'There is no such session.');
      if (index === row.at_index - 1 || row.status !== 'going') return view(accountId, row);
      if (index !== row.at_index) throw new HttpError(409, 'stale', 'This exercise is already done.');
      const exercises = JSON.parse(row.plan);
      exercises[index].done = true;
      const finished = index + 1 >= exercises.length;
      db.prepare('UPDATE practice_sessions SET plan = ?, at_index = ?, status = ?, finished_at = ? WHERE id = ?')
        .run(JSON.stringify(exercises), index + 1, finished ? 'finished' : 'going', finished ? now() : null, row.id);
      return view(accountId, db.prepare('SELECT * FROM practice_sessions WHERE id = ?').get(row.id));
    },
  };
}
