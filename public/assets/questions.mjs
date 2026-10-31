// One Review question in the shared frame (G-04 FR-404…FR-407; G-09 FR-932, RQ-457, RQ-459): a meaning
// question in its sentence with the asked word marked and Play, a harder question (fill the gap), or a
// recall card. Right and wrong look the same everywhere: ✓ on the right choice, ✗ on a wrong pick, the
// locked choices fully readable, "Right. X = …" / "Not quite. X means “…”"; the sentence's English shows
// after answering. After a first wrong pick the learner gets one more try (question-pages/93, 4); the
// answer still counts as wrong for the schedule (F1) and is sent once to G-04's /api/review. Looked at
// again, the question shows as it was answered. All text via textContent.
import { post } from './api.mjs';
import { speak, hasSwedish } from './speech.mjs';
import { icon } from './icons.mjs';

const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; };
const button = (cls, text, onClick) => { const b = el('button', cls, text); b.type = 'button'; if (onClick) b.addEventListener('click', onClick); return b; };

async function send(item, right, practice) {
  // A practice review (G-09 FR-905) never changes the word's schedule.
  const r = await post('/api/review', { lemma: item.lemma, kind: item.kind, mode: item.mode, right, ...(practice ? { practice: true } : {}) });
  return r.ok ? r.data : null;
}

// The sentence with `part` marked (the asked word, or the gap's answer once known).
function sentenceWith(sv, part, cls = 'asked') {
  const p = el('p', 'passage review-sentence');
  const at = part ? sv.indexOf(part) : -1;
  const lower = at < 0 && part ? sv.toLowerCase().indexOf(part.toLowerCase()) : at;
  if (lower < 0) { p.textContent = sv; return p; }
  p.append(document.createTextNode(sv.slice(0, lower)), el('mark', cls, sv.slice(lower, lower + part.length)), document.createTextNode(sv.slice(lower + part.length)));
  return p;
}

function playButton(text) {
  if (!hasSwedish()) return null;
  const b = button('play', '', () => speak(text));
  b.append(icon('play'), document.createTextNode('Play'));
  return b;
}

// Choices with one more try (FR-932 (5)): `onAnswered(firstRight, picks)` once the answer shows.
export function choiceGroup({ options, right, label, frame, locked, picks = [], itemName, meaning, onAnswered, onTry }) {
  const group = el('div', 'choices');
  group.setAttribute('role', 'group');
  group.setAttribute('aria-label', label);
  const chosen = [];
  const buttons = options.map((text, n) => button('option', text, () => pick(n)));
  group.append(...buttons);
  const lock = () => {
    buttons.forEach((b, k) => {
      b.disabled = true;
      b.classList.toggle('right', k === right);
      b.classList.toggle('wrong', k !== right && chosen.includes(k));
    });
  };
  const showAnswer = () => {
    lock();
    const firstRight = chosen[0] === right;
    if (chosen.at(-1) === right) frame.feedback('ok', 'Right.', `${itemName} = ${meaning}.`);
    else frame.feedback('bad', 'Not quite.', `${itemName} means “${meaning}”; the right answer has a ✓.`);
    onAnswered?.(firstRight, [...chosen]);
  };
  function pick(n, replay = false) {
    chosen.push(n);
    if (n !== right && chosen.length === 1) {
      buttons[n].disabled = true;
      buttons[n].classList.add('wrong');
      frame.feedback('bad', 'Not quite — try once more.');
      if (!replay) onTry?.();
      return;
    }
    showAnswer();
  }
  if (locked) {
    for (const n of picks) pick(n, true);
    if (!picks.length) lock();
  }
  return group;
}

// Renders `item` into `frame`; `practice` (FR-905) never changes the schedule; `spoken` plays it first.
export function renderQuestion(frame, item, { practice = false, spoken = false } = {}) {
  const { box, locked, answer } = frame;
  box.replaceChildren();
  if (!item) {
    frame.task('Nothing to ask');
    box.append(el('p', 'muted', 'This word is no longer one of your leaves, so there is nothing to ask.'));
    frame.action({ label: 'Next', onClick: () => frame.next() });
    return;
  }
  if (item.mode === 'recall') {
    frame.task('Do you remember what it means?', 'Say it in your head or out loud, then show the meaning.');
    box.append(el('p', 'big-word', item.lemma));
    const shown = el('div');
    box.append(shown);
    const choose = (knew, replay = false) => {
      shown.querySelectorAll('.pair button').forEach((b, k) => { b.disabled = true; b.classList.toggle('picked', (k === 0) === knew); });
      if (knew) frame.feedback('ok', 'Good.', 'grove asks again in a few days.');
      else frame.feedback('plain', '', 'No problem. grove asks again soon.');
      if (replay) return;
      frame.record({ knew });
      send(item, knew, practice);
      frame.action({ label: 'Next', onClick: () => frame.next() });
    };
    const reveal = () => {
      const note = el('div', 'note-box');
      note.append(el('b', '', item.lemma), document.createTextNode(` = ${item.meaning || '—'}`));
      if (item.sentence) note.append(el('span', 'en-line', `${item.sentence}${item.sentenceEn ? ` · ${item.sentenceEn}` : ''}`));
      const pair = el('div', 'pair');
      pair.append(button('', 'I knew it', () => choose(true)), button('', 'I didn’t', () => choose(false)));
      shown.replaceChildren(note, pair);
      frame.action({ label: 'Next', disabled: true, wait: 'Did you know it?' });
    };
    if (locked) {
      reveal();
      if (answer?.knew !== undefined) choose(answer.knew, true);
      return;
    }
    frame.action({ label: 'Show the meaning', onClick: reveal });
    return;
  }
  const master = item.mode === 'master';
  if (master) frame.task(`Fill the gap: which word means “${item.meaning}”?`, 'A harder question, for a word you know well.');
  else frame.task(`What does “${item.word}” mean here?`);
  const sentence = master ? el('p', 'passage review-sentence', item.sentence) : sentenceWith(item.sentence, item.word);
  const en = el('span', 'en-line', item.sentenceEn ?? '');
  en.hidden = true;
  box.append(sentence, en);
  if (!master) {
    const play = playButton(item.sentence);
    if (play) { const row = el('div', 'play-row'); row.append(play); box.append(row); }
    if (spoken && !locked) speak(item.sentence);
  }
  const rightText = item.options[item.right];
  const answered = (firstRight, picks) => {
    if (master) {
      const filled = item.sentence.replace(/_{3,}/, '\u0000');
      const at = filled.indexOf('\u0000');
      sentence.replaceChildren(document.createTextNode(filled.slice(0, at)), el('mark', 'asked', rightText), document.createTextNode(filled.slice(at + 1)));
    }
    en.hidden = !item.sentenceEn;
    if (locked) return;
    frame.record({ picks });
    send(item, firstRight, practice);
    frame.action({ label: 'Next', onClick: () => frame.next() });
  };
  box.append(choiceGroup({
    options: item.options,
    right: item.right,
    label: master ? 'Which word?' : 'What does it mean?',
    frame,
    locked,
    picks: answer?.picks ?? [],
    itemName: master ? rightText : item.word,
    meaning: master ? item.meaning : rightText,
    onAnswered: answered,
  }));
  frame.action({ label: 'Next', disabled: true, wait: master ? 'Pick a word' : 'Pick an answer' });
}
