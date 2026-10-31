// Discover's Words and Grammar in the shared frame (G-09 FR-928, FR-929, FR-931, FR-932; B-26; the picked
// sketches of question-pages/89 and 93): next words one per card (I know it / + Pick up, each with a hint),
// a phrase spotlight with "What does it mean?" (one more try after a wrong pick), and the pattern of the day
// in two steps in order, Learn then Spot it (a tap on any word of a place marks the whole place; Check shows
// the places missed, outlined around their words only). Each card has Report. Looked at again (RQ-459), each
// shows as it was left. All text is set with textContent.
import { post, showMessage } from './api.mjs';
import { hasSwedish, speak } from './speech.mjs';
import { icon } from './icons.mjs';
import { choiceGroup } from './questions.mjs';

const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; };
const btn = (cls, text, onClick) => { const b = el('button', cls, text); b.type = 'button'; if (onClick) b.addEventListener('click', onClick); return b; };
const WORD = /\p{L}+(?:[-’']\p{L}+)*/gu;
const REASONS = [['wrong_meaning', 'Wrong meaning'], ['bad_translation', 'Bad translation'], ['unnatural', 'Unnatural sentence'], ['wrong_mark', 'Wrong mark'], ['audio', 'Audio'], ['other', 'Other']];
const POS = { 'noun-en': 'en-word', 'noun-ett': 'ett-word', 'noun-plural': 'plural noun', verb: 'verb', adjective: 'adjective', adverb: 'adverb', numeral: 'number' };

function playButton(text) {
  if (!hasSwedish()) return null;
  const b = btn('play', '', () => speak(text));
  b.append(icon('play'), document.createTextNode('Play'));
  return b;
}
function playRow(text) {
  const row = el('div', 'play-row');
  const play = playButton(text);
  if (play) row.append(play);
  return row;
}

// A sentence with one part marked.
function marked(sv, mark, cls) {
  const p = el('span');
  const i = mark ? sv.toLowerCase().indexOf(mark.toLowerCase()) : -1;
  if (i < 0) { p.textContent = sv; return p; }
  p.append(document.createTextNode(sv.slice(0, i)), el('mark', cls, sv.slice(i, i + mark.length)), document.createTextNode(sv.slice(i + mark.length)));
  return p;
}
function example(sv, en, mark, cls) {
  const p = el('p', 'example');
  p.append(marked(sv, mark, cls));
  if (en) p.append(el('span', 'en', en));
  return p;
}

// FR-931: Report on an item, with a reason and an optional note.
function reportLink(item, message) {
  const wrap = el('div', 'item-report');
  const open = btn('link-button small', 'Report');
  open.setAttribute('aria-expanded', 'false');
  open.addEventListener('click', () => {
    if (wrap.querySelector('form')) return;
    open.setAttribute('aria-expanded', 'true');
    const form = el('form', 'item-report-form');
    const select = el('select');
    select.setAttribute('aria-label', 'What is wrong');
    for (const [value, text] of REASONS) { const o = el('option', '', text); o.value = value; select.append(o); }
    const note = el('input');
    note.type = 'text';
    note.maxLength = 200;
    note.placeholder = 'A note (optional)';
    note.setAttribute('aria-label', 'Note');
    const send = btn('', 'Send report');
    send.type = 'submit';
    form.append(select, note, send);
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const r = await post('/api/learning/report', { item, reason: select.value, ...(note.value.trim() ? { note: note.value.trim() } : {}) });
      if (!r.ok) { showMessage(message, r.message); return; }
      form.remove();
      open.setAttribute('aria-expanded', 'false');
      showMessage(message, 'Thanks — your report goes to grove’s owner.', 'ok');
    });
    wrap.append(form);
    select.focus();
  });
  wrap.prepend(open);
  return wrap;
}

function messageLine() {
  const m = el('p', 'message');
  m.setAttribute('role', 'status');
  m.hidden = true;
  return m;
}

// FR-928: the next words, one per card.
export function renderWords(frame, ex) {
  const { box, locked, answer } = frame;
  const cards = ex.words ?? [];
  const message = messageLine();
  const choices = locked ? [...(answer?.cards ?? [])] : [];
  if (!cards.length) {
    frame.task('Do you know this word?');
    box.replaceChildren(el('p', 'small muted', 'No new words are left at your level. grove gives this time to the other exercises.'));
    frame.action({ label: 'Next', onClick: () => frame.next() });
    return;
  }
  const dots = (i) => {
    const d = el('div', 'card-dots');
    d.setAttribute('aria-label', `Word ${Math.min(i + 1, cards.length)} of ${cards.length}`);
    cards.forEach((_, n) => d.append(el('i', n <= i ? 'on' : '')));
    return d;
  };
  function summary() {
    frame.task(`${cards.length} new word${cards.length === 1 ? '' : 's'} seen`);
    const list = el('ul', 'ex-list');
    cards.forEach((w, n) => {
      const li = el('li');
      const picked = choices[n] === 'pick';
      li.append(el('b', '', w.lemma), document.createTextNode(` · ${w.en} `), el('span', `small ${picked ? 'ok-text' : 'muted'}`, picked ? '· picked up ✓' : '· you know it'));
      list.append(li);
    });
    box.replaceChildren(list, message);
    const p = choices.filter((c) => c === 'pick').length;
    frame.feedback('ok', `${p} picked up.`, p ? `grove brings ${p === 1 ? 'it' : 'them'} back in Review.` : 'You know them all.');
    frame.action({ label: 'Next', onClick: () => frame.next() });
  }
  function draw(i) {
    if (i >= cards.length) { summary(); return; }
    const w = cards[i];
    frame.task('Do you know this word?', `Word ${i + 1} of ${cards.length}`);
    const answerCard = async (action, b) => {
      b.disabled = true;
      const r = await post('/api/learning/answer', { item: w.id, action });
      b.disabled = false;
      if (!r.ok) { showMessage(message, r.message); return; }
      choices.push(action);
      frame.record({ cards: [...choices] });
      draw(i + 1);
      box.querySelector('button')?.focus();
    };
    const know = btn('pair-know', '');
    know.append(document.createTextNode('I know it'), el('small', '', 'add it to your ground'));
    know.addEventListener('click', () => answerCard('know', know));
    const pick = btn('main pair-pick', '');
    pick.append(document.createTextNode('+ Pick up'), el('small', '', 'learn it in Review'));
    pick.addEventListener('click', () => answerCard('pick', pick));
    const pair = el('div', 'pair');
    pair.append(know, pick);
    box.replaceChildren(
      dots(i),
      el('p', 'big-word', w.lemma),
      el('p', 'word-pos', `${POS[w.pos] ?? w.pos ?? ''}${w.pos ? ' · ' : ''}${w.en}`),
      example(w.example.sv, w.example.en, w.example.mark, 'new-word'),
      playRow(w.example.sv), pair, message, reportLink(w.id, message),
    );
    frame.action({ label: 'Next', disabled: true, wait: 'Choose for each word' });
  }
  if (locked) { summary(); return; }
  draw(0);
}

// FR-928: a phrase spotlight with its meaning check (one more try, FR-932).
export function renderPhrase(frame, ex) {
  const { box, locked, answer } = frame;
  const ph = ex.phrase;
  const message = messageLine();
  frame.task('What does this phrase mean?', 'Guess from the example, then see how it’s used.');
  if (!ph) {
    box.replaceChildren(el('p', 'small muted', 'This phrase is no longer in grove’s content.'));
    frame.action({ label: 'Next', onClick: () => frame.next() });
    return;
  }
  const after = el('div');
  const showAfter = (picked) => {
    const pick = btn(picked ? 'wide picked' : 'wide', picked ? '✓ Picked up: you’ll see it in Review' : '+ Pick up this phrase');
    pick.disabled = !!picked || locked;
    pick.addEventListener('click', async () => {
      pick.disabled = true;
      const r = await post('/api/learning/answer', { item: ph.id, action: 'pick' });
      if (!r.ok) { pick.disabled = false; showMessage(message, r.message); return; }
      pick.textContent = '✓ Picked up: you’ll see it in Review';
      pick.classList.add('picked');
      frame.record({ picked: true });
    });
    const note = el('div', 'note-box');
    note.append(el('b', '', ph.phrase), document.createTextNode(` = ${ph.en}.${ph.note ? ` ${ph.note}` : ''}`));
    after.replaceChildren(note, example(ph.examples[1].sv, ph.examples[1].en, ph.phrase, 'new-word'), pick);
  };
  const group = choiceGroup({
    options: ph.choices,
    right: ph.right,
    label: 'What does it mean?',
    frame,
    locked,
    picks: answer?.picks ?? [],
    itemName: ph.phrase,
    meaning: ph.en,
    onAnswered: (_, picks) => {
      showAfter(locked && answer?.picked);
      if (locked) return;
      frame.record({ picks });
      frame.action({ label: 'Next', onClick: async () => { await post('/api/learning/seen', { item: ph.id }); frame.next(); } });
    },
  });
  box.replaceChildren(el('p', 'big-word phrase', ph.phrase), example(ph.examples[0].sv, null, ph.phrase, 'new-word'), playRow(ph.examples[0].sv), group, after, message, reportLink(ph.id, message));
  if (!locked) frame.action({ label: 'Next', disabled: true, wait: 'Pick a meaning' });
}

// Each word of the pattern's text, with the place (spot mark) it belongs to, if any; a word keeps the
// punctuation right after it in its button ("sex.", never "sex .", FR-929).
function spotModel(pattern) {
  let index = 0;
  return pattern.text.lines.map((line, li) => {
    const parts = [];
    let last = 0;
    const gapBefore = (gap) => {
      const stuck = gap.match(/^\S+/);
      const prev = parts.at(-1);
      if (stuck && prev?.w) {
        prev.t += stuck[0];
        if (gap.length > stuck[0].length) parts.push({ t: gap.slice(stuck[0].length) });
      } else parts.push({ t: gap });
    };
    for (const m of line.sv.matchAll(WORD)) {
      if (m.index > last) gapBefore(line.sv.slice(last, m.index));
      parts.push({ t: m[0], w: m[0].toLowerCase(), index: index++ });
      last = m.index + m[0].length;
    }
    if (last < line.sv.length) gapBefore(line.sv.slice(last));
    const words = parts.filter((p) => p.w);
    let from = 0;
    pattern.spot.forEach((s, si) => {
      if (s.line !== li) return;
      const target = s.mark.toLowerCase().match(WORD) || [];
      for (let i = from; i + target.length <= words.length; i += 1) {
        if (target.every((w, k) => words[i + k].w === w)) {
          for (let k = 0; k < target.length; k += 1) words[i + k].place = si;
          from = i + target.length;
          return;
        }
      }
    });
    return parts;
  });
}

// FR-929: Spot it — a tap on any word of a place marks the whole place; Check shows found and missed.
function renderSpot(frame, pattern, { intro, onChecked, step = '' }) {
  const { box, locked, answer } = frame;
  const model = spotModel(pattern);
  const all = model.flat().filter((p) => p.w);
  const keyOf = (p) => (p.place !== undefined ? `p${p.place}` : `w${p.index}`);
  const tapped = new Set();
  let checked = false;
  const text = el('div', 'spot');
  function update() {
    if (checked) return;
    frame.action({ label: 'Check', onClick: () => check(), disabled: tapped.size === 0, wait: 'Tap at least one place' });
  }
  function draw() {
    text.replaceChildren();
    model.forEach((parts, li) => {
      if (li) text.append(document.createTextNode(' '));
      let group = null;
      parts.forEach((p, k) => {
        if (!p.w) {
          // A space stays inside a place only between two of its words, so the outline never runs on.
          const next = parts.slice(k + 1).find((x) => x.w);
          const prev = parts.slice(0, k).reverse().find((x) => x.w);
          if (group && next && prev && next.place !== undefined && next.place === prev.place) group.append(document.createTextNode(p.t));
          else { group = null; text.append(document.createTextNode(p.t)); }
          return;
        }
        const key = keyOf(p);
        const b = btn('w', p.t, () => { if (tapped.has(key)) tapped.delete(key); else tapped.add(key); draw(); update(); });
        b.disabled = checked;
        if (p.place !== undefined) {
          if (!group || group.dataset.place !== String(p.place)) {
            group = el('span', checked ? (tapped.has(key) ? 'found' : 'missed') : (tapped.has(key) ? 'tapped' : ''));
            group.dataset.place = String(p.place);
            text.append(group);
          }
          group.append(b);
        } else {
          group = null;
          if (tapped.has(key)) b.classList.add(checked ? 'off' : 'tapped');
          text.append(b);
        }
      });
    });
  }
  const result = el('div');
  function check(replay = false) {
    checked = true;
    draw();
    const found = pattern.spot.filter((_, si) => tapped.has(`p${si}`)).length;
    const off = [...tapped].filter((k) => k.startsWith('w')).length;
    const missed = pattern.spot.length - found;
    const legend = el('div', 'spot-legend');
    legend.append(el('span', 'k-found', 'found'), el('span', 'k-missed', 'missed'), el('span', 'k-off', 'not the pattern'));
    result.replaceChildren(legend);
    frame.feedback(missed ? 'plain' : 'ok', `You found ${found} of ${pattern.spot.length}.`,
      `${missed ? 'The ones you missed have a dashed line.' : 'All of them.'}${off ? ` ${off} tap${off > 1 ? 's were' : ' was'} not the pattern.` : ''}`);
    if (replay) return;
    frame.record({ taps: all.filter((p) => tapped.has(keyOf(p))).map((p) => p.index) });
    onChecked();
    frame.action({ label: 'Next', onClick: () => frame.next() });
  }
  frame.task('Tap every place you see the pattern.', `${step}Look for ${String(pattern.howToSpot).replace(/\.$/, '')}. One tap marks the whole place.`);
  box.replaceChildren(...intro, el('h3', 'spot-title', pattern.text.title), text, result);
  if (locked) {
    for (const i of answer?.taps ?? []) { const p = all.find((x) => x.index === i); if (p) tapped.add(keyOf(p)); }
    check(true);
    return;
  }
  draw();
  update();
}

// FR-929: the pattern of the day in two steps in order (Learn, then Spot it), or Spot it of an earlier one.
export function renderGrammar(frame, ex) {
  const { box } = frame;
  const p = ex.pattern;
  const message = messageLine();
  if (!p) {
    frame.task('Learn the pattern.');
    box.replaceChildren(el('p', 'small muted', 'This pattern is no longer in grove’s content.'));
    frame.action({ label: 'Next', onClick: () => frame.next() });
    return;
  }
  const met = () => post('/api/learning/seen', { item: p.id });
  if (!ex.learn) {
    const intro = el('p', 'small muted');
    intro.append(document.createTextNode('From an earlier day: '), el('strong', '', p.name));
    renderSpot(frame, p, { intro: [intro], onChecked: met });
    box.append(message, reportLink(p.id, message));
    return;
  }
  const spot = () => {
    renderSpot(frame, p, { intro: [], onChecked: met, step: 'Step 2 of 2. ' });
    box.closest('.card')?.scrollIntoView({ block: 'start' });
  };
  if (frame.locked) { spot(); return; }
  frame.task('Learn the pattern.', 'Step 1 of 2. Then you spot it in a short text.');
  const list = el('ul', 'examples');
  for (const e of p.examples) { const li = el('li'); li.append(example(e.sv, e.en, e.mark, 'pattern-part')); list.append(li); }
  box.replaceChildren(el('p', 'big-word phrase', p.name), el('p', '', p.explain), list, message, reportLink(p.id, message));
  frame.action({ label: 'Now spot it in a text', onClick: spot });
}
