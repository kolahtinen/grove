// The shared exercise frame (G-09 FR-932, FR-912; the picked sketch's version B, RQ-457): every exercise
// draws into a frame that gives it a card (the kicker line in its skill's colour, one plain line saying
// what to do, then its body) and a fixed bottom bar with the feedback (green right, red wrong, plain
// otherwise) and its one button, disabled with what is still needed until the exercise is done. In
// looking again (RQ-459) the frame is locked: the exercise shows as it was left and the button is the
// frame's own "Back to i of n". All text via textContent.
import { icon } from './icons.mjs';

const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; };

export const SKILL_NAMES = { review: 'Review', reading: 'Reading', listening: 'Listening', words: 'Words', grammar: 'Grammar' };

// FR-912: seconds under a minute ("20 s"), half minutes above ("2½ min").
export function timeText(seconds) {
  const s = Math.max(1, Math.round(seconds || 0));
  if (s < 60) return `${s} s`;
  const halves = Math.max(2, Math.round(s / 30));
  const whole = Math.floor(halves / 2);
  return `${whole}${halves % 2 ? '½' : ''} min`;
}

// FR-905: a plan's minutes are never shown as 0.
export function minutesText(seconds) {
  const m = Math.round((seconds || 0) / 60);
  return m < 1 ? 'under a minute' : `${m} minute${m === 1 ? '' : 's'}`;
}

// What an exercise is (FR-912's kicker), from what the session knows of it.
export function whatOf(ex) {
  switch (ex.type) {
    case 'review': return ex.question?.mode === 'recall' ? 'Remember the meaning' : 'Pick the meaning';
    case 'master': return ex.question?.mode === 'recall' ? 'Remember the meaning' : ex.question && ex.question.mode !== 'master' ? 'Pick the meaning' : 'Harder question';
    case 'text': return 'New text';
    case 'reread': return 'Read again';
    case 'listen': return 'Listen again';
    case 'words': return `Next words${ex.words?.[0]?.level ? ` · ${ex.words[0].level}` : ''}`;
    case 'phrase': return `Phrase spotlight${ex.phrase?.level ? ` · ${ex.phrase.level}` : ''}`;
    case 'grammar': return `${ex.learn === false ? 'Spot it' : 'Pattern of the day'}${ex.pattern?.level ? ` · ${ex.pattern.level}` : ''}`;
    default: return 'Exercise';
  }
}

// A short name for an exercise on the start screen's list.
export function listName(ex) {
  switch (ex.type) {
    case 'review': return 'pick the meaning';
    case 'master': return 'harder question';
    case 'text': return ex.title ? `new text: ${ex.title}` : 'new text';
    case 'reread': return ex.title ? `read again: ${ex.title}` : 'read again';
    case 'listen': return ex.title ? `listen again: ${ex.title}` : 'listen again';
    case 'words': return 'next words';
    case 'phrase': return 'phrase spotlight';
    case 'grammar': return 'pattern';
    default: return 'exercise';
  }
}

export function kickerLine(node, skill, what, seconds) {
  node.className = `ex-kicker-line s-${skill}`;
  node.replaceChildren(icon(skill), document.createTextNode(`${SKILL_NAMES[skill] ?? 'Review'} · ${what}`), el('span', 'min', timeText(seconds)));
}

// A frame over the session page's card and bottom bar. `onNext(answer)` moves on; `back` (looking
// again) gives the locked frame's button.
export function createFrame({ card, task, hint, box, bar, feedback, wait, actions, locked = false, answer = null, back = null, onNext }) {
  let recorded = locked ? answer : {};
  const frame = {
    box,
    locked,
    answer,
    task(text, hintText = '') {
      task.textContent = text;
      hint.textContent = hintText;
      hint.hidden = !hintText;
    },
    feedback(kind, strong = '', rest = '') {
      bar.classList.remove('ok', 'bad');
      if (!kind) { feedback.hidden = true; feedback.replaceChildren(); return; }
      if (kind === 'ok' || kind === 'bad') bar.classList.add(kind);
      feedback.hidden = false;
      feedback.replaceChildren(...(strong ? [el('b', '', strong)] : []), document.createTextNode(rest ? `${strong ? ' ' : ''}${rest}` : ''));
    },
    // The one button: { label, onClick, disabled, wait }; locked, the frame keeps its Back button.
    action({ label, onClick, disabled = false, wait: waitText = '' }) {
      if (locked) return;
      const b = el('button', 'main', label);
      b.type = 'button';
      b.id = 'action';
      b.disabled = disabled;
      if (onClick) b.addEventListener('click', onClick);
      actions.replaceChildren(b);
      wait.textContent = disabled ? waitText : '';
      wait.hidden = !disabled || !waitText;
    },
    record(part) { if (!locked) recorded = { ...recorded, ...part }; },
    next() { if (!locked) onNext?.(Object.keys(recorded ?? {}).length ? recorded : undefined); },
  };
  card.hidden = false;
  bar.hidden = false;
  bar.classList.remove('ok', 'bad');
  feedback.hidden = true;
  wait.hidden = true;
  box.replaceChildren();
  if (locked && back) {
    const b = el('button', 'main', back.label);
    b.type = 'button';
    b.id = 'action';
    b.addEventListener('click', back.onClick);
    actions.replaceChildren(b);
  }
  return frame;
}

// A frame inside one box, for a page outside a session (the old Review page).
export function boxFrame(container, onNext) {
  const task = el('h3', 'ex-task');
  const hint = el('p', 'small muted');
  const box = el('div');
  const bar = el('div', 'inline-bar');
  const feedback = el('p', 'fb');
  feedback.setAttribute('role', 'status');
  const wait = el('p', 'wait');
  const actions = el('div');
  bar.append(feedback, wait, actions);
  container.replaceChildren(task, hint, box, bar);
  return createFrame({ card: container, task, hint, box, bar, feedback, wait, actions, onNext });
}
