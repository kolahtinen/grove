// Discover's Words and Grammar in a session (G-09 FR-928, FR-929, FR-931; B-26; the picked sketch, version
// B): next words one per card (I know it / + Pick up), a phrase spotlight with a quick "What does it
// mean?", and the pattern of the day learned and spotted in one exercise of two steps (a tap on any word
// of a place finds the whole place; Check shows the places missed). Each card has Report. All text is set
// with textContent.
import { post, showMessage } from './api.mjs';
import { hasSwedish, speak } from './speech.mjs';
import { icon } from './icons.mjs';

const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; };
const button = (text, cls = '') => { const b = el('button', cls, text); b.type = 'button'; return b; };
const WORD = /\p{L}+(?:[-’']\p{L}+)*/gu;
const REASONS = [['wrong_meaning', 'Wrong meaning'], ['bad_translation', 'Bad translation'], ['unnatural', 'Unnatural sentence'], ['wrong_mark', 'Wrong mark'], ['audio', 'Audio'], ['other', 'Other']];
const POS = { 'noun-en': 'en-word', 'noun-ett': 'ett-word', 'noun-plural': 'plural noun', verb: 'verb', adjective: 'adjective', adverb: 'adverb', numeral: 'number' };

function playButton(text) {
  if (!hasSwedish()) return null;
  const b = button('', 'play');
  b.append(icon('play'), document.createTextNode('Play'));
  b.addEventListener('click', () => speak(text));
  return b;
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
  const open = button('Report', 'link-button small');
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
    const send = button('Send report');
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
const nextButton = (onDone, text = 'Next') => { const b = button(text, 'main'); b.addEventListener('click', onDone); return b; };

// FR-928: the next words, one per card.
export function renderWords(box, ex, { onDone }) {
  const cards = ex.words ?? [];
  let i = 0;
  let pickedUp = 0;
  const message = messageLine();
  const dots = () => {
    const d = el('div', 'card-dots');
    d.setAttribute('aria-hidden', 'true');
    cards.forEach((_, n) => d.append(el('i', n <= i ? 'on' : '')));
    return d;
  };
  function draw() {
    if (i >= cards.length) {
      box.replaceChildren(el('h3', '', `${cards.length} new word${cards.length === 1 ? '' : 's'} seen`),
        el('p', '', `${pickedUp} picked up as leaves; grove will bring them back in Review.`), dots(), nextButton(onDone));
      return;
    }
    const w = cards[i];
    const answer = async (action, b) => {
      b.disabled = true;
      const r = await post('/api/learning/answer', { item: w.id, action });
      b.disabled = false;
      if (!r.ok) { showMessage(message, r.message); return; }
      if (action === 'pick') pickedUp += 1;
      i += 1;
      draw();
      box.querySelector('button')?.focus();
    };
    const know = button('I know it');
    know.addEventListener('click', () => answer('know', know));
    const pick = button('+ Pick up', 'main');
    pick.addEventListener('click', () => answer('pick', pick));
    const actions = el('div', 'card-actions');
    actions.append(know, pick);
    const play = playButton(w.example.sv);
    box.replaceChildren(
      el('p', 'ex-kicker', `Next words at your level · ${w.level} · ${i + 1} of ${cards.length}`),
      el('p', 'big-word', w.lemma),
      el('p', 'muted', `${POS[w.pos] ?? w.pos ?? ''}${w.pos ? ' · ' : ''}${w.en}`),
      example(w.example.sv, w.example.en, w.example.mark, 'new-word'),
      ...(play ? [el('div', 'card-actions')] : []),
      actions, dots(), message, reportLink(w.id, message),
    );
    if (play) box.querySelector('.card-actions').append(play);
  }
  if (!cards.length) { box.replaceChildren(el('p', 'small muted', 'These words are no longer in grove’s content.'), nextButton(onDone)); return; }
  draw();
}

// FR-928: a phrase spotlight with its quick meaning check.
export function renderPhrase(box, ex, { onDone }) {
  const ph = ex.phrase;
  const message = messageLine();
  if (!ph) { box.replaceChildren(el('p', 'small muted', 'This phrase is no longer in grove’s content.'), nextButton(onDone)); return; }
  const after = el('div');
  const choices = el('div', 'choices');
  choices.setAttribute('role', 'group');
  choices.setAttribute('aria-label', 'What does it mean?');
  const buttons = ph.choices.map((text, n) => {
    const b = button(text);
    b.addEventListener('click', () => {
      for (const c of buttons) c.disabled = true;
      buttons[ph.right].classList.add('right');
      if (n !== ph.right) b.classList.add('wrong');
      const pick = button('+ Pick up');
      pick.addEventListener('click', async () => {
        pick.disabled = true;
        const r = await post('/api/learning/answer', { item: ph.id, action: 'pick' });
        if (!r.ok) { pick.disabled = false; showMessage(message, r.message); return; }
        pick.textContent = 'Picked up ✓';
      });
      const note = el('div', 'note');
      note.append(el('strong', '', ph.phrase), document.createTextNode(` = ${ph.en}.${ph.note ? ` ${ph.note}` : ''}`));
      const done = nextButton(async () => {
        await post('/api/learning/seen', { item: ph.id });
        onDone();
      });
      const actions = el('div', 'card-actions');
      actions.append(pick);
      after.replaceChildren(el('p', '', n === ph.right ? 'Right.' : 'Not quite.'), note, example(ph.examples[1].sv, ph.examples[1].en), actions, done);
      done.focus();
    });
    return b;
  });
  choices.append(...buttons);
  const play = playButton(ph.examples[0].sv);
  box.replaceChildren(
    el('p', 'ex-kicker', `Phrase spotlight · ${ph.level}`),
    el('p', 'big-word phrase', ph.phrase),
    example(ph.examples[0].sv),
    ...(play ? [play] : []),
    el('p', '', ''),
    el('strong', '', 'What does it mean?'),
    choices, after, message, reportLink(ph.id, message),
  );
}

// Each word of the pattern's text, with the place (spot mark) it belongs to, if any.
function spotModel(pattern) {
  return pattern.text.lines.map((line, li) => {
    const parts = [];
    let last = 0;
    for (const m of line.sv.matchAll(WORD)) {
      if (m.index > last) parts.push({ t: line.sv.slice(last, m.index) });
      parts.push({ t: m[0], w: m[0].toLowerCase() });
      last = m.index + m[0].length;
    }
    if (last < line.sv.length) parts.push({ t: line.sv.slice(last) });
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
function renderSpot(container, pattern, { intro, onChecked, onDone }) {
  const model = spotModel(pattern);
  const tapped = new Set();
  let checked = false;
  const text = el('div', 'spot');
  function draw() {
    text.replaceChildren();
    model.forEach((parts, li) => {
      if (li) text.append(document.createTextNode(' '));
      let group = null;
      let groupPlace = null;
      for (const p of parts) {
        if (!p.w) { (group && p.t.trim() === '' ? group : text).append(document.createTextNode(p.t)); if (p.t.trim() !== '') { group = null; groupPlace = null; } continue; }
        const key = p.place !== undefined ? `p${p.place}` : `w${li}-${parts.indexOf(p)}`;
        const b = button(p.t, 'w');
        b.disabled = checked;
        b.addEventListener('click', () => { if (tapped.has(key)) tapped.delete(key); else tapped.add(key); draw(); });
        if (p.place !== undefined) {
          if (groupPlace !== p.place) {
            group = el('span', checked ? (tapped.has(key) ? 'found' : 'missed') : (tapped.has(key) ? 'tapped' : ''));
            groupPlace = p.place;
            text.append(group);
          }
          group.append(b);
        } else {
          if (group) { group = null; groupPlace = null; }
          if (tapped.has(key)) b.classList.add(checked ? 'off' : 'tapped');
          text.append(b);
        }
      }
    });
  }
  const check = button('Check', 'main');
  const hint = el('p', 'small muted', 'Tap any word of a place to mark it; tap again to unmark.');
  const result = el('div');
  check.addEventListener('click', async () => {
    checked = true;
    draw();
    const found = pattern.spot.filter((_, si) => tapped.has(`p${si}`)).length;
    const off = [...tapped].filter((k) => k.startsWith('w')).length;
    const missed = pattern.spot.length - found;
    const msg = el('div', 'message ok');
    msg.setAttribute('role', 'status');
    msg.append(el('strong', '', `You found ${found} of ${pattern.spot.length}.`),
      document.createTextNode(` ${missed ? `grove shows the ${missed} you missed with a dashed line.` : 'You found them all.'}${off ? ` ${off} tap${off > 1 ? 's were' : ' was'} not the pattern.` : ''}`));
    const legend = el('div', 'spot-legend');
    legend.append(el('span', 'k-found', 'found'), el('span', 'k-missed', 'missed'), el('span', 'k-off', 'not the pattern'));
    const done = nextButton(onDone);
    result.replaceChildren(msg, legend, done);
    check.remove();
    hint.remove();
    await onChecked();
    done.focus();
  });
  draw();
  const instr = el('p');
  instr.append(document.createTextNode('Tap every place you see: '), el('strong', '', pattern.howToSpot));
  container.replaceChildren(...intro, instr, el('h3', '', pattern.text.title), text, check, hint, result);
}

// FR-929: the pattern of the day (1 · Learn, 2 · Spot it), or Spot it of an earlier pattern.
export function renderGrammar(box, ex, { onDone }) {
  const p = ex.pattern;
  const message = messageLine();
  if (!p) { box.replaceChildren(el('p', 'small muted', 'This pattern is no longer in grove’s content.'), nextButton(onDone)); return; }
  const met = () => post('/api/learning/seen', { item: p.id });
  if (!ex.learn) {
    const intro = el('p', 'small muted');
    intro.append(document.createTextNode('From an earlier day: '), el('strong', '', p.name));
    renderSpot(box, p, { intro: [intro], onChecked: met, onDone });
    box.append(message, reportLink(p.id, message));
    return;
  }
  const tabs = el('div', 'step-tabs');
  tabs.setAttribute('role', 'tablist');
  const learnTab = button('1 · Learn');
  const spotTab = button('2 · Spot it');
  for (const t of [learnTab, spotTab]) t.setAttribute('role', 'tab');
  tabs.append(learnTab, spotTab);
  const body = el('div');
  body.setAttribute('role', 'tabpanel');
  function show(step) {
    learnTab.setAttribute('aria-selected', String(step === 'learn'));
    spotTab.setAttribute('aria-selected', String(step === 'spot'));
    if (step === 'learn') {
      const list = el('ul', 'examples');
      for (const e of p.examples) { const li = el('li'); li.append(example(e.sv, e.en, e.mark, 'pattern-part')); list.append(li); }
      const go = button('Now spot it in a text', 'main');
      go.addEventListener('click', () => { show('spot'); spotTab.focus(); });
      body.replaceChildren(el('p', 'ex-kicker', `Pattern of the day · ${p.level}`), el('p', 'big-word phrase', p.name), el('p', '', p.explain), list, go, message, reportLink(p.id, message));
    } else {
      renderSpot(body, p, { intro: [], onChecked: met, onDone });
    }
  }
  learnTab.addEventListener('click', () => show('learn'));
  spotTab.addEventListener('click', () => show('spot'));
  box.replaceChildren(tabs, body);
  show('learn');
}
