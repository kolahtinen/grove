// A text inside a session (G-09 FR-933, RQ-458; question-pages/93, 1–3): in the session's frame, never on
// the text page, with no links that leave the session. Its title, "<n> words", the text (a word opens the
// word menu, G-03 FR-305), then, once read or heard, its questions (locked once answered, FR-932 (4)) and
// How much did you understand?; the feedback "Text done. …" and Next. A listening text starts with Play the
// text and the text blurred, with Show the text. Read again and listen again ask nothing and end with Done
// reading / Done listening. Looked at again (RQ-459), the questions show as answered. All text via
// textContent.
import { post } from './api.mjs';
import { speak, cancel, hasSwedish, setRate } from './speech.mjs';
import { icon } from './icons.mjs';
import { renderLines, sentencesOf } from './textview.mjs';
import { createWordMenu } from './wordmenu.mjs';

const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; };
const btn = (cls, text, onClick) => { const b = el('button', cls, text); b.type = 'button'; if (onClick) b.addEventListener('click', onClick); return b; };
const RATINGS = [['almost_nothing', 'Almost nothing'], ['a_little', 'A little'], ['about_half', 'About half'], ['most', 'Most'], ['everything', 'Everything']];

const DAY = 24 * 60 * 60 * 1000;
function ago(ms) {
  if (!ms) return 'before';
  const days = Math.floor((Date.now() - ms) / DAY);
  if (days < 1) return 'earlier today';
  if (days === 1) return 'yesterday';
  return `${days} days ago`;
}

let menu = null;
let current = null;

// The kind of input this exercise is (G-09 FR-925's heartbeat): listening while a listening text shows.
export const listeningNow = () => current?.kind === 'listening';

export async function renderText(frame, ex) {
  const { box, locked } = frame;
  const listen = ex.textKind === 'listening';
  const again = !!ex.again;
  if (again) frame.task(listen ? 'Listen to it once more.' : 'Read it once more, at your own pace.');
  else if (listen) frame.task('Listen first, with the text hidden.', 'Play it as often as you like. Show the text when you want it.');
  else frame.task('Read the text, then answer and rate it.', 'Tap a word you don’t know to see its meaning.');
  frame.action({ label: again ? (listen ? 'Done listening' : 'Done reading') : 'Next', disabled: true, wait: 'Loading…' });
  const res = await fetch(`/api/reading?id=${ex.textId}`, { credentials: 'same-origin' });
  if (!res.ok) {
    box.replaceChildren(el('p', 'muted', 'This text was removed from your library since the session was planned.'));
    frame.action({ label: 'Next', onClick: () => frame.next() });
    return;
  }
  const data = await res.json();
  current = { kind: listen ? 'listening' : 'reading', data };
  setRate(data.speechRate);
  if (again) frame.task(listen ? 'Listen to it once more.' : 'Read it once more, at your own pace.', `You ${listen ? 'heard' : 'read'} this ${ago(data.readAt)}. No questions this time.`);
  menu?.close();
  if (!menu || menu.textId !== data.id) {
    document.getElementById('menu')?.remove();
    document.getElementById('sheet-backdrop')?.remove();
    menu = createWordMenu({ textId: data.id, getData: () => current.data, onChange: () => draw() });
    menu.textId = data.id;
  }
  const lines = el('ol', 'lines text-lines');
  lines.id = 'lines';
  const draw = () => renderLines(lines, current.data, { onWord: (t, s, l, b) => menu.open(t, s, l, b) });
  draw();
  const parts = [el('h3', 'text-title-h', data.title), el('p', 'small muted', `${data.stats.words} words`)];
  let heard = !listen || locked;
  const after = el('div');
  const textWrap = el('div', listen && !locked ? 'blurred' : '');
  textWrap.append(lines);
  // Listening: Play the text (large), the text blurred until Show the text.
  if (listen) {
    const show = btn('link-button', 'Show the text', () => { textWrap.classList.remove('blurred'); show.remove(); });
    if (locked) show.remove();
    let playing = false;
    const play = btn('play big', '');
    const label = el('span', '', 'Play the text');
    play.append(icon('play'), label);
    play.addEventListener('click', () => {
      if (!hasSwedish()) { label.textContent = 'No Swedish voice on this device'; return; }
      if (playing) { playing = false; cancel(); label.textContent = 'Play again'; return; }
      playing = true;
      label.textContent = 'Playing…';
      const spans = [...lines.querySelectorAll('.sentence')];
      const all = sentencesOf(current.data);
      let k = 0;
      const step = () => {
        spans.forEach((s) => s.classList.remove('speaking'));
        if (!playing || k >= all.length) {
          playing = false;
          label.textContent = 'Play again';
          if (!heard) { heard = true; showAfter(); }
          return;
        }
        spans[k]?.classList.add('speaking');
        const sv = all[k].sv;
        k += 1;
        speak(sv, { onend: step });
      };
      step();
    });
    const row = el('div', 'play-row');
    row.append(play);
    parts.push(row, textWrap);
    if (!locked) parts.push(show);
  } else parts.push(textWrap);
  parts.push(after);
  box.replaceChildren(...parts);

  // Read again / listen again: no questions, no rating (they count only as minutes).
  if (again) {
    const done = () => frame.action({ label: listen ? 'Done listening' : 'Done reading', onClick: () => frame.next() });
    if (heard) done(); else frame.action({ label: 'Done listening', disabled: true, wait: 'Play the text first' });
    showAfter = () => done();
    return;
  }

  const answered = new Map(data.answered.map((a) => [a.position, a]));
  let rating = data.rating;
  function state() {
    if (locked) return;
    const open = data.questions.filter((q) => !q.reported && !answered.has(q.position)).length;
    if (!heard) frame.action({ label: 'Next', disabled: true, wait: 'Play the text first' });
    else if (open) frame.action({ label: 'Next', disabled: true, wait: `Answer the question${open > 1 ? 's' : ''}` });
    else if (!rating) frame.action({ label: 'Next', disabled: true, wait: 'Say how much you understood' });
    else {
      frame.feedback('ok', 'Text done.', listen ? 'grove picks your next listening texts with this in mind.' : 'Your next texts take this into account.');
      frame.action({ label: 'Next', onClick: () => frame.next() });
    }
  }
  function questions() {
    const block = el('div', 'qblock');
    if (!data.questions.length) return block;
    block.append(el('h3', '', data.questions.length === 1 ? 'A question' : 'Questions'));
    for (const q of data.questions) {
      const fieldset = el('fieldset', q.reported ? 'reported' : '');
      fieldset.append(el('legend', 'q-legend', q.q));
      const feedback = el('p', 'small q-feedback');
      const buttons = q.options.map((option, index) => btn('option', option, async () => {
        const r = await post('/api/question', { textId: data.id, position: q.position, option: index });
        if (!r.ok) return;
        answered.set(q.position, { position: q.position, option: index, right: r.data.right });
        lock(r.data.rightOption, index, r.data.right);
        state();
      }));
      const lock = (rightOption, picked, right) => {
        buttons.forEach((b, i) => { b.disabled = true; b.classList.toggle('right', i === rightOption); b.classList.toggle('wrong', i === picked && !right); });
        feedback.textContent = right ? '✓ Right.' : '✗ Not quite; the right answer has a ✓.';
        feedback.className = `small q-feedback ${right ? 'ok-text' : 'bad-text'}`;
      };
      fieldset.append(...buttons, feedback);
      const had = answered.get(q.position);
      // An answered question can't be answered again (FR-933); its right option is shown from the answer.
      if (had) {
        buttons.forEach((b, i) => { b.disabled = true; b.classList.toggle('wrong', i === had.option && !had.right); b.classList.toggle('right', i === had.option && had.right); });
        feedback.textContent = had.right ? '✓ Right.' : '✗ Not quite.';
        feedback.className = `small q-feedback ${had.right ? 'ok-text' : 'bad-text'}`;
      } else if (q.reported) {
        buttons.forEach((b) => { b.disabled = true; });
        feedback.textContent = 'Reported — this question doesn’t count.';
      } else if (locked) buttons.forEach((b) => { b.disabled = true; });
      block.append(fieldset);
    }
    return block;
  }
  function ratingBlock() {
    const block = el('div', 'qblock');
    block.append(el('h3', '', 'How much did you understand?'));
    const row = el('div', 'rate');
    for (const [value, text] of RATINGS) {
      const b = btn('', text, async () => {
        const r = await post('/api/rating', { textId: data.id, value });
        if (!r.ok) return;
        rating = value;
        row.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
        state();
      });
      b.setAttribute('aria-pressed', String(rating === value));
      if (locked) b.disabled = true;
      row.append(b);
    }
    block.append(row);
    return block;
  }
  showAfter = () => { after.replaceChildren(questions(), ratingBlock()); state(); };
  if (heard) showAfter(); else state();
}
let showAfter = () => {};
