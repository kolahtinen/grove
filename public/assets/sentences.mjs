// A listening text's sentences (G-05 FR-506, FR-507; RQ-467, B-33, the picked sketch's version A): one
// Sentences button next to Play opens grove's bottom sheet (the word menu's look; ✕, Esc, Back or the
// backdrop close it). Each row is "N · first words…" (the number, then up to its first three words), how
// many times it was played in this listening session, Replay and Loop; the sheet stays open while
// replaying and lights the sentence playing. A looping sentence shows as a strip "Looping N · …" with Stop,
// also after the sheet is closed. Shared by the reading page's listening card and a session's listening
// exercise (G-09 FR-933). Play-all on those pages goes through `play` too, so its sentences count. All text
// via textContent.
import { speak, cancel, hasSwedish } from './speech.mjs';
import { icon } from './icons.mjs';
import { backCloses } from './way.mjs';

const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; };
const btn = (cls, text, onClick) => { const b = el('button', cls, text); b.type = 'button'; if (onClick) b.addEventListener('click', onClick); return b; };

// "N · first three words…": the number, then up to the sentence's first three words, "…" when it has more.
export function sentenceLabel(sv, i) {
  const words = String(sv ?? '').trim().split(/\s+/).filter(Boolean);
  const label = el('span', 'sent-label');
  label.append(el('span', 'sent-n', String(i + 1)), document.createTextNode(' · '), el('span', 'sent-w', `${words.slice(0, 3).join(' ')}${words.length > 3 ? '…' : ''}`));
  return label;
}

// `sentences()` the text's sentences ({ sv }); `highlight(i | null)` lights a sentence in the text;
// `onUser()` runs before a Replay or Loop from the sheet (the page stops its own play-all);
// `onNoVoice()` when nothing can be spoken; `compact` shows the button as a list icon and the count.
export function createSentences({ sentences, highlight = () => {}, onUser = () => {}, onNoVoice = () => {}, compact = false }) {
  const counts = new Map();
  let loopId = null;
  let playingId = null;
  let seq = 0;
  let release = null;

  // The button next to Play.
  const button = btn(`sentences-button${compact ? ' compact' : ''}`, '', () => open());
  button.setAttribute('aria-haspopup', 'dialog');
  button.setAttribute('aria-expanded', 'false');
  const buttonText = el('span', '', 'Sentences');
  button.append(icon('list'), buttonText);
  if (compact) button.setAttribute('aria-label', 'Sentences');
  const note = el('p', 'small muted sentences-note', 'One sentence: Play plays it again.');

  // The loop strip in the card.
  const strip = el('div', 'loop-strip');
  strip.setAttribute('role', 'status');
  strip.hidden = true;
  const stripText = el('span', 'loop-what');
  strip.append(icon('loop'), stripText, btn('bar-button', 'Stop', () => stop()));

  // The sheet.
  const backdrop = el('div', 'sheet-backdrop');
  backdrop.id = 'sentences-backdrop';
  backdrop.hidden = true;
  const sheet = el('section', 'sheet sentences-sheet');
  sheet.id = 'sentences';
  sheet.hidden = true;
  sheet.setAttribute('role', 'dialog');
  sheet.setAttribute('aria-modal', 'true');
  sheet.setAttribute('aria-labelledby', 'sentences-title');
  const head = el('div', 'sheet-head');
  const title = el('h3', '', 'Sentences');
  title.id = 'sentences-title';
  const close = btn('ico', '', () => hide());
  close.setAttribute('aria-label', 'Close');
  close.append(icon('close'));
  head.append(title, close);
  const noVoice = el('p', 'small bad-text sentences-novoice', 'No Swedish voice on this device, so nothing plays.');
  noVoice.hidden = true;
  const hint = el('p', 'small muted sentences-hint', 'Replay plays one sentence. Loop repeats it until you stop it or play another.');
  const list = el('ul', 'sentences-list');
  sheet.append(head, noVoice, hint, list);
  document.body.append(backdrop, sheet);

  const countText = (i) => (counts.get(i) ? `played ${counts.get(i)}×` : '');

  function renderRows() {
    list.replaceChildren();
    sentences().forEach((s, i) => {
      const li = el('li', 'listen-row');
      li.dataset.index = String(i);
      li.classList.toggle('speaking', playingId === i);
      const replay = btn('bar-button', 'Replay', () => { onUser(); stop(); play(i); });
      const loop = btn('bar-button switch', 'Loop', () => {
        const on = loopId !== i;
        onUser();
        stop();
        if (on) { loopId = i; showLoop(); play(i); }
      });
      loop.setAttribute('aria-pressed', String(loopId === i));
      li.append(sentenceLabel(s.sv, i), el('span', 'small muted play-count', countText(i)), replay, loop);
      list.append(li);
    });
  }

  function showLoop() {
    list.querySelectorAll('.listen-row').forEach((row) => row.querySelector('.switch')?.setAttribute('aria-pressed', String(row.dataset.index === String(loopId))));
    if (loopId === null) { strip.hidden = true; return; }
    stripText.replaceChildren(document.createTextNode('Looping '), sentenceLabel(sentences()[loopId]?.sv, loopId));
    strip.hidden = false;
  }

  function light(i) {
    playingId = i;
    list.querySelectorAll('.listen-row').forEach((row) => row.classList.toggle('speaking', row.dataset.index === String(i)));
    highlight(i);
  }

  // Plays one sentence and counts it; a looping sentence starts again when it ends. `onend` runs when it
  // ends without being replaced by another.
  function play(i, onend) {
    const s = sentences()[i];
    if (!s) return;
    if (!hasSwedish()) { noVoice.hidden = false; onNoVoice(); return; }
    counts.set(i, (counts.get(i) || 0) + 1);
    // Only the count changes, so the row's buttons stay put while a sentence loops.
    const count = list.querySelector(`.listen-row[data-index="${i}"] .play-count`);
    if (count) count.textContent = countText(i);
    light(i);
    const mine = ++seq;
    speak(s.sv, {
      onend: () => {
        if (mine !== seq) return;
        // The card was taken away (a session moved on): the loop ends with it.
        if (loopId === i && strip.isConnected) { play(i); return; }
        if (loopId === i) { loopId = null; showLoop(); }
        light(null);
        onend?.();
      },
    });
  }

  // Ends whatever plays from here: the loop and the sentence speaking.
  function stop() {
    const was = loopId !== null || playingId !== null;
    loopId = null;
    showLoop();
    seq += 1;
    if (was) cancel();
    light(null);
  }

  function open() {
    renderRows();
    noVoice.hidden = hasSwedish();
    sheet.hidden = false;
    backdrop.hidden = false;
    button.setAttribute('aria-expanded', 'true');
    // FR-922: the phone's Back closes the sheet first.
    if (!release) release = backCloses(() => { release = null; shut(); });
    close.focus();
  }
  function shut() {
    sheet.hidden = true;
    backdrop.hidden = true;
    button.setAttribute('aria-expanded', 'false');
    if (button.isConnected) button.focus();
  }
  function hide() {
    if (sheet.hidden) return;
    const r = release;
    release = null;
    r?.();
    shut();
  }
  backdrop.addEventListener('click', hide);
  const onKey = (event) => { if (event.key === 'Escape' && !sheet.hidden) { event.preventDefault(); hide(); } };
  document.addEventListener('keydown', onKey);

  // Shows the button only when there is more than one sentence to choose from.
  function update() {
    const n = sentences().length;
    button.hidden = n < 2;
    note.hidden = n !== 1;
    if (compact) buttonText.textContent = String(n);
    if (!sheet.hidden) renderRows();
  }

  function destroy() {
    hide();
    stop();
    document.removeEventListener('keydown', onKey);
    backdrop.remove();
    sheet.remove();
  }

  update();
  return { button, strip, note, play, stop, update, close: hide, destroy, looping: () => loopId !== null };
}
