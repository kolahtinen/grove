// A session, one exercise at a time (G-09 FR-904, FR-912): "N-minute session · i of n · about m min
// left" and a bar; each exercise in a card with its mode banner. Review and Master questions are answered
// here; a text opens on the reading page, which comes back when the text is done. The learner can only go
// on or leave. All text via textContent.
import { getMe, post, showMessage } from './api.mjs';
import { showAccount } from './page.mjs';
import { startHeartbeat } from './heartbeat.mjs';
import { setRate } from './speech.mjs';
import { renderQuestion } from './questions.mjs';
import { icon } from './icons.mjs';

const $ = (id) => document.getElementById(id);
const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; };
const NAMES = { discover: 'Discover', review: 'Review', master: 'Master' };

await showAccount();
await getMe();
startHeartbeat();
const stagesRes = await fetch('/api/stages', { credentials: 'same-origin' });
if (stagesRes.ok) setRate((await stagesRes.json()).speechRate);

function chip(mode, text, withIcon) {
  const c = el('span', `chip ${mode}`);
  if (withIcon) c.append(icon(mode));
  c.append(document.createTextNode(text));
  return c;
}

function showEnd(session) {
  $('exercise').hidden = true;
  $('session-end').hidden = false;
  const s = session.summary;
  $('summary').replaceChildren(
    el('li', '', `${s.minutes} min of practice`),
    el('li', '', `${s.textsRead} text${s.textsRead === 1 ? '' : 's'} read`),
    el('li', '', `${s.wordsReviewed} word${s.wordsReviewed === 1 ? '' : 's'} reviewed`),
    el('li', '', `${s.wordsFell} word${s.wordsFell === 1 ? '' : 's'} fell to your ground`),
    el('li', '', `You’ve practised ${s.daysThisWeek} day${s.daysThisWeek === 1 ? '' : 's'} this week`),
  );
  $('session-line').textContent = `${session.label} · done`;
  $('session-bar').value = 1;
}

async function next(session) {
  const r = await post('/api/session/next', { sessionId: session.id, index: session.index });
  if (!r.ok) { showMessage($('session-message'), r.message); return; }
  show(r.data.session);
}

function show(session) {
  if (!session) {
    $('session-line').textContent = 'No session going.';
    showMessage($('session-message'), 'Start one from Home.', 'ok');
    return;
  }
  if (session.status === 'finished') { showEnd(session); return; }
  if (session.status !== 'going') { show(null); return; }
  $('session-line').textContent = `${session.label} · ${session.index + 1} of ${session.total} · about ${session.minutesLeft} min left`;
  // FR-905, FR-906: a plan that is shorter than asked, or a text outside the form's range, says so.
  const notes = [session.short && 'There isn’t enough to fill the whole time, so this session is shorter.', session.note === 'out_of_band' && 'No text is in this form’s range of known words, so grove took the nearest.'].filter(Boolean);
  $('session-note').hidden = !notes.length;
  $('session-note').textContent = notes.join(' ');
  $('session-bar').value = session.index / session.total;
  const ex = session.exercise;
  $('exercise').hidden = false;
  $('exercise-banner').replaceChildren(chip(ex.mode, NAMES[ex.mode], true), chip(ex.mode, `${ex.minutes} min`, false));
  const box = $('exercise-box');
  if (ex.textId) {
    box.replaceChildren(el('p', '', ex.title ?? 'A text'), el('p', 'small muted', 'Read it, answer its questions and rate it; grove brings you back here.'));
    const open = el('a', 'button-link main', 'Open the text');
    open.href = `/text?id=${ex.textId}&session=${session.id}&index=${session.index}`;
    box.append(open);
    return;
  }
  if (!ex.question) {
    // The word left the learner's leaves since planning: nothing to ask, go on.
    box.replaceChildren(el('p', 'small muted', 'This word is no longer a leaf.'));
    const b = el('button', 'main', 'Next');
    b.type = 'button';
    b.addEventListener('click', () => next(session));
    box.append(b);
    return;
  }
  renderQuestion(box, { ...ex.question, practice: !!ex.practice }, { spoken: !!ex.spoken, onDone: () => next(session) });
}

// After a text, the page names its session, so one the text finished still shows its summary.
const asked = new URLSearchParams(window.location.search).get('id');
const res = await fetch(asked ? `/api/session?id=${encodeURIComponent(asked)}` : '/api/session', { credentials: 'same-origin' });
show(res.ok ? (await res.json()).session : null);
