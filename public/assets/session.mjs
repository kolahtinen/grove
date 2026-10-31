// A session in the shared frame (G-09 FR-904, FR-912, FR-932, FR-933; the picked sketch's version B,
// question-pages/93). grove's top bar gives way to a slim session bar: ✕ (leave: back to Home, the session
// kept; one never planned isn't, FR-904), one segment per exercise in its skill's colour (done filled, the
// current outlined, a finished one tappable to look at again, RQ-459) and "i/n". The session opens on a
// start screen listing its exercises with Start (one resumed part-way skips it); each exercise is a card
// with its kicker line and one plain line of what to do, and a fixed bottom bar holds the feedback and the
// one button. A text opens inside the session (sessiontext.mjs); Words and Grammar are drawn by
// learning.mjs; Review questions by questions.mjs. The end is a summary of only the lines with something
// in them, with Back to Home and Another N minutes. A session short of new texts first shows its offer
// (FR-920). All text via textContent.
import { getMe, post, showMessage } from './api.mjs';
import { showAccount } from './page.mjs';
import { startHeartbeat } from './heartbeat.mjs';
import { setRate, hasSwedish } from './speech.mjs';
import { icon } from './icons.mjs';
import { renderQuestion } from './questions.mjs';
import { renderWords, renderPhrase, renderGrammar } from './learning.mjs';
import { renderText, listeningNow } from './sessiontext.mjs';
import { createFrame, kickerLine, whatOf, listName, timeText, minutesText, SKILL_NAMES } from './frame.mjs';

const $ = (id) => document.getElementById(id);
const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; };
const btn = (cls, text, onClick) => { const b = el('button', cls, text); b.type = 'button'; if (onClick) b.addEventListener('click', onClick); return b; };
const KINDS = { reading: 'reading', listening: 'listening' };

await showAccount();
await getMe();
startHeartbeat(() => (listeningNow() && !$('exercise').hidden ? 'listening' : 'other'));
const stagesRes = await fetch('/api/stages', { credentials: 'same-origin' });
if (stagesRes.ok) setRate((await stagesRes.json()).speechRate);

let session = null;
let started = false;

function inSession(on) {
  document.body.classList.toggle('in-session', on);
  $('session-top').hidden = !on;
}

// The slim session bar: ✕, the segments, "i/n".
function sessionBar(s, { looking = null } = {}) {
  const top = $('session-top');
  const leave = btn('leave', '', leaveSession);
  leave.id = 'session-leave';
  leave.setAttribute('aria-label', 'Leave the session');
  leave.append(icon('close'));
  const segs = el('div', 'segs');
  segs.setAttribute('role', 'list');
  segs.setAttribute('aria-label', 'Your session');
  const ended = s.status === 'finished';
  s.exercises.forEach((e, k) => {
    const done = ended || k < s.index;
    const now = !ended && k === s.index && started;
    const name = `${k + 1}: ${SKILL_NAMES[e.skill]} · ${listName(e)}${done ? ', done' : now ? ', now' : ''}`;
    const seg = done && !ended ? btn(`seg s-${e.skill} done${looking === k ? ' looking' : ''}`, '', () => lookAgain(k)) : el('span', `seg s-${e.skill}${done ? ' done' : ''}${now ? ' now' : ''}`);
    seg.setAttribute('role', 'listitem');
    seg.setAttribute('aria-label', done && !ended ? `Look again at exercise ${name}` : `Exercise ${name}`);
    segs.append(seg);
  });
  const count = el('span', 'count', `${ended ? s.total : started ? Math.min(s.index + 1, s.total) : 0}/${s.total}`);
  count.id = 'session-count';
  top.replaceChildren(...(ended ? [] : [leave]), segs, count);
}

async function leaveSession() {
  if (session) await post('/api/session/leave', { sessionId: session.id });
  window.location.assign('/');
}

function hideAll() {
  for (const id of ['offer', 'start-card', 'exercise', 'session-end', 'no-session']) $(id).hidden = true;
  $('action-bar').hidden = true;
  $('action-bar').classList.remove('ok', 'bad');
  showMessage($('session-message'), '');
}

function bottomButtons(...buttons) {
  const bar = $('action-bar');
  bar.hidden = false;
  bar.classList.remove('ok', 'bad');
  $('feedback').hidden = true;
  $('wait').hidden = true;
  $('actions').replaceChildren(...buttons);
}

// The start screen (FR-904): the plan's exercises and Start.
function showStart(s) {
  hideAll();
  inSession(true);
  sessionBar(s);
  const list = el('ul', 'plan-list');
  for (const e of s.exercises) {
    const li = el('li');
    const ic = icon(e.skill);
    ic.classList.add(`s-${e.skill}`);
    li.append(ic, el('span', '', `${SKILL_NAMES[e.skill]} · ${listName(e)}`), el('span', 'm', timeText(e.seconds)));
    list.append(li);
  }
  const card = $('start-card');
  card.replaceChildren(
    el('h2', '', s.label),
    el('p', 'small muted', `${s.total} exercise${s.total === 1 ? '' : 's'}, about ${minutesText(s.seconds)}. One at a time; you can leave and carry on later.`),
    ...(s.short ? [el('p', 'small muted', 'There isn’t enough to fill the whole time, so this session is shorter.')] : []),
    list,
  );
  card.hidden = false;
  const go = btn('main', 'Start', () => { started = true; showExercise(s); });
  go.id = 'session-start';
  bottomButtons(go);
  go.focus();
}

function render(ex, s, { locked = false, answer = null, index = s.index } = {}) {
  hideAll();
  inSession(true);
  started = true;
  sessionBar(s, { looking: locked ? index : null });
  kickerLine($('exercise-kicker'), ex.skill, whatOf(ex), ex.seconds);
  const frame = createFrame({
    card: $('exercise'), task: $('exercise-task'), hint: $('exercise-hint'), box: $('exercise-box'),
    bar: $('action-bar'), feedback: $('feedback'), wait: $('wait'), actions: $('actions'),
    locked, answer,
    back: locked ? { label: `Back to ${Math.min(s.index + 1, s.total)} of ${s.total}`, onClick: () => showExercise(session) } : null,
    onNext: (a) => next(s, a),
  });
  const learning = { words: renderWords, phrase: renderPhrase, grammar: renderGrammar }[ex.type];
  if (learning) learning(frame, ex);
  else if (ex.textId) renderText(frame, ex);
  else renderQuestion(frame, ex.question ?? null, { practice: !!ex.practice, spoken: !!ex.spoken });
  window.scrollTo(0, 0);
}

function showExercise(s) {
  if (!s.exercise) { show(s); return; }
  render(s.exercise, s);
}

// RQ-459: a finished exercise opens as it was left, answers locked, with Back to i of n.
async function lookAgain(index) {
  const res = await fetch(`/api/session/exercise?id=${session.id}&index=${index}`, { credentials: 'same-origin' });
  if (!res.ok) { showMessage($('session-message'), 'That exercise can’t be shown again.'); return; }
  const { exercise, answer } = await res.json();
  render(exercise, session, { locked: true, answer, index });
}

async function next(s, answer) {
  const r = await post('/api/session/next', { sessionId: s.id, index: s.index, ...(answer ? { answer } : {}) });
  if (!r.ok) { showMessage($('session-message'), r.message); return; }
  show(r.data.session);
}

// FR-904: Well done, the label and minutes, then only the lines with something in them.
function showEnd(s) {
  hideAll();
  inSession(true);
  sessionBar(s);
  const sum = s.summary;
  const lines = [
    ['reading', 'Texts read', sum.textsRead],
    ['listening', 'Texts heard', sum.textsHeard],
    ['review', 'Words reviewed', sum.wordsReviewed],
    ['words', 'New words and phrases picked up', sum.pickedUp],
    ['grammar', `Pattern${sum.patternsMet === 1 ? '' : 's'} met`, sum.patternsMet],
    ['fell', 'Words that fell to your ground', sum.wordsFell],
    ['progress', 'Days practised this week', sum.daysThisWeek],
  ].filter(([, , n]) => n > 0);
  const list = el('ul', 'summary');
  list.id = 'summary';
  for (const [kind, text, n] of lines) {
    const li = el('li');
    const ic = icon(kind);
    ic.classList.add(`s-${kind}`);
    li.append(ic, el('span', '', text), el('b', '', String(n)));
    list.append(li);
  }
  const end = $('session-end');
  end.replaceChildren(el('h2', '', 'Well done'), el('p', 'small muted', `${s.label} · ${minutesText(sum.minutes * 60)} of practice`), list);
  end.hidden = false;
  const home = btn('main', 'Back to Home', () => window.location.assign('/'));
  const again = btn('again', `Another ${s.minutes ?? 10} minutes`, async () => {
    again.disabled = true;
    const r = await post('/api/sessions', { kind: s.kind === 'topic' ? 'topic' : 'time', tile: s.tile, skills: s.skills, minutes: s.minutes ?? 10, voice: hasSwedish(), ...(s.kind === 'topic' ? { topic: s.topic ?? '' } : {}), ...(s.hardOnly ? { hardOnly: true } : {}), fill: true });
    if (!r.ok) { again.disabled = false; showMessage($('session-message'), r.message); return; }
    started = false;
    show(r.data.session);
  });
  bottomButtons(home, again);
}

function showOffer(s) {
  hideAll();
  inSession(false);
  const o = s.offer;
  $('offer').hidden = false;
  const parts = o.needs.map((k) => `${Math.max(0, o.missing[k] - o.added[k])} min of ${KINDS[k]}`);
  $('offer-label').textContent = s.label;
  $('offer-line').textContent = o.full
    ? 'You have added enough. Start your session.'
    : `This session needs more new texts: about ${parts.join(' and ')}.`;
  const choices = $('offer-choices');
  choices.querySelector('.start-now')?.remove();
  if (o.full) {
    const go = btn('main start-now', '▶ Start your session', () => plan(s, false));
    choices.prepend(go);
    $('offer-add').classList.remove('main');
  }
  $('offer-without').onclick = () => plan(s, true);
  $('offer-leave').onclick = leaveSession;
}

async function plan(s, fill) {
  const r = await post('/api/session/plan', { sessionId: s.id, fill });
  if (!r.ok) { showMessage($('session-message'), r.message); return; }
  show(r.data.session);
}

function show(s) {
  session = s;
  if (!s || (s.status !== 'going' && s.status !== 'finished')) {
    hideAll();
    inSession(false);
    $('no-session').hidden = false;
    return;
  }
  if (s.status === 'finished') { showEnd(s); return; }
  if (s.offer && !s.total) { showOffer(s); return; }
  // A session resumed part-way skips the start screen.
  if (!started && s.index === 0) { showStart(s); return; }
  showExercise(s);
}

// After a text that ended it, the page names its session, so it still shows its summary.
const asked = new URLSearchParams(window.location.search).get('id');
const res = await fetch(asked ? `/api/session?id=${encodeURIComponent(asked)}` : '/api/session', { credentials: 'same-origin' });
show(res.ok ? (await res.json()).session : null);
