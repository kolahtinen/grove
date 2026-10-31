// The Common library (G-09 FR-916, FR-917, FR-920, FR-926; addendum 006; RQ-460): grove texts by topic, each
// with its level, kind and minutes, a filter that shows every level up to the chosen one (the learner's
// level first, "Your level is <L>, so texts up to <L> show first."), + Add on each row (added without
// leaving the list; a line under it says it was added, with Read now) and the title opening a preview sheet
// over the list (title, level, topic, kind, minutes, the first lines, + Add or Added ✓, Read now; ✕, Esc or
// Back close it and the list is where it was); each topic has Practise this topic. Sent by a session's offer (`?from=session`), the list shows only the
// kinds the session still needs (no Show all, B-23) and its topic, and the fill bars sit at the bottom.
// The common dictionary searches grove's whole word list as the learner types (from 2 letters, after a
// 0.3 s pause, older answers dropped), with each word's meaning and level, and adds a word as a leaf.
// All text via textContent.
import { getMe, post, showMessage } from './api.mjs';
import { showAccount } from './page.mjs';
import { hasSwedish } from './speech.mjs';
import { offer, kindsStillNeeded, refresh, session, onOfferChange } from './way.mjs';
import { wordButton, stateLabel } from './wordbutton.mjs';
import { icon } from './icons.mjs';
import { backCloses } from './way.mjs';

const $ = (id) => document.getElementById(id);
const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; };

await showAccount();
await getMe();

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const KIND_NAMES = { reading: '📖 reading', listening: '🎧 listening' };
let library = { level: 'A1', texts: [] };
let justAdded = null;

async function practiseTopic(topic, button) {
  button.disabled = true;
  const r = await post('/api/sessions', { kind: 'topic', tile: 'mix', skill: 'mix', minutes: 10, topic, voice: hasSwedish() });
  button.disabled = false;
  if (!r.ok) { showMessage($('library-status'), r.message); return; }
  window.location.assign('/session');
}

// Adds a grove text without leaving the list (FR-916).
async function add(x, button) {
  button.disabled = true;
  const r = await post('/api/library/add', { id: x.id });
  if (!r.ok) { button.disabled = false; button.textContent = 'Try again'; showMessage($('library-status'), r.message); return false; }
  x.added = r.data.textId;
  justAdded = x.id;
  await refresh();
  renderLibrary();
  $('library-status').textContent = `“${x.title}” is in your library.`;
  return true;
}

const readHref = (x) => (x.added ? `/text?id=${x.added}` : `/library/text?id=${encodeURIComponent(x.id)}${offer() ? '&from=session' : ''}`);

function row(x) {
  const li = el('li', 'library-item');
  const title = el('button', 'text-title tt', x.title);
  title.type = 'button';
  title.setAttribute('aria-haspopup', 'dialog');
  title.addEventListener('click', () => preview(x, title));
  li.append(el('span', 'level-badge', x.level), title, el('span', 'text-state', `${KIND_NAMES[x.kind]} · ${x.minutes} min`));
  if (x.added) {
    li.append(el('span', 'text-state added', 'Added ✓'));
    // After + Add, a line under it says so, with Read now (question-pages/92, 1).
    if (justAdded === x.id) {
      const line = el('p', 'added-line small');
      const read = el('a', '', 'Read now');
      read.href = readHref(x);
      line.append(document.createTextNode('Added to your library. '), read);
      li.append(line);
    }
    return li;
  }
  const addButton = el('button', 'bar-button', '+ Add');
  addButton.type = 'button';
  addButton.setAttribute('aria-label', `Add ${x.title} to your library`);
  addButton.addEventListener('click', () => add(x, addButton));
  li.append(addButton);
  return li;
}

// FR-916 (RQ-460): the preview sheet over the list.
let closePreview = null;
async function preview(x, trigger) {
  closePreview?.();
  const backdrop = el('div', 'sheet-backdrop');
  const sheet = el('section', 'sheet preview-sheet');
  sheet.setAttribute('role', 'dialog');
  sheet.setAttribute('aria-modal', 'true');
  sheet.setAttribute('aria-labelledby', 'pv-title');
  const head = el('div', 'sheet-head plain');
  const titles = el('div');
  titles.append(el('p', 'counter', x.topic));
  const h = el('h2', '', x.title);
  h.id = 'pv-title';
  titles.append(h);
  const close = el('button', 'ico');
  close.type = 'button';
  close.setAttribute('aria-label', 'Close');
  close.append(icon('close'));
  head.append(titles, close);
  const facts = el('p', 'small pv-facts', `${x.level} · ${x.kind} · about ${x.minutes} min`);
  const first = el('p', 'first-lines', '…');
  const actions = el('div', 'stack');
  const message = el('p', 'message');
  message.hidden = true;
  sheet.append(head, facts, first, message, actions);
  document.body.append(backdrop, sheet);
  let release = null;
  const done = (keep = false) => { backdrop.remove(); sheet.remove(); document.removeEventListener('keydown', onKey); const r = release; release = null; r?.(keep); closePreview = null; trigger?.focus(); };
  const onKey = (e) => { if (e.key === 'Escape') done(); };
  document.addEventListener('keydown', onKey);
  close.addEventListener('click', () => done());
  backdrop.addEventListener('click', () => done());
  release = backCloses(() => { release = null; done(true); });
  closePreview = () => done();
  function drawActions() {
    const read = el('a', `button-link${x.added ? ' main' : ''}`, 'Read now');
    read.href = readHref(x);
    // Leaving for the text closes the sheet, so the list is clear when the learner comes back.
    read.addEventListener('click', () => done(true));
    if (x.added) {
      actions.replaceChildren(el('p', 'text-state added', 'Added ✓'), read);
      showMessage(message, `“${x.title}” is in your library.`, 'ok');
    } else {
      const addButton = el('button', 'main', '+ Add to your library');
      addButton.type = 'button';
      addButton.addEventListener('click', async () => { if (await add(x, addButton)) drawActions(); });
      actions.replaceChildren(addButton, read, el('p', 'small muted', 'You stay here; close the preview to keep picking.'));
    }
  }
  drawActions();
  close.focus();
  const res = await fetch(`/api/library/text?id=${encodeURIComponent(x.id)}`, { credentials: 'same-origin' });
  if (res.ok) {
    const full = await res.json();
    first.textContent = `${full.lines.slice(0, 3).map((l) => l.sv).join(' ')} …`;
  }
}

function renderLibrary() {
  const upTo = LEVELS.indexOf($('level-filter').value);
  const kinds = kindsStillNeeded();
  const topic = offer() ? session.topic : null;
  const shown = library.texts.filter((x) => LEVELS.indexOf(x.level) <= upTo && (!kinds || kinds.includes(x.kind)) && (!topic || x.topic === topic));
  $('library-kinds').hidden = !kinds;
  if (kinds) $('library-kinds').textContent = `Showing ${kinds.join(' and ')} texts: what your session still needs.`;
  const box = $('library-texts');
  box.replaceChildren();
  const left = shown.filter((x) => !x.added).length;
  $('library-none').hidden = shown.length > 0 && !(kinds && left === 0);
  $('library-none').textContent = kinds && shown.length ? 'You have added every text of this kind up to this level. Get more from your AI on Add a text.' : 'No texts up to this level yet.';
  for (const name of [...new Set(shown.map((x) => x.topic))]) {
    const section = el('section', 'topic-group');
    const head = el('div', 'topic-head');
    head.append(el('h3', '', name));
    if (!kinds) {
      const practise = el('button', 'bar-button', 'Practise this topic');
      practise.type = 'button';
      practise.setAttribute('aria-label', `Practise ${name}`);
      practise.addEventListener('click', () => practiseTopic(name, practise));
      head.append(practise);
    }
    const ul = el('ul', 'text-list');
    for (const x of shown.filter((y) => y.topic === name)) ul.append(row(x));
    section.append(head, ul);
    box.append(section);
  }
}

const libraryRes = await fetch('/api/library', { credentials: 'same-origin' });
if (libraryRes.ok) library = await libraryRes.json();
$('level-filter').value = library.level;
$('level-line').textContent = `Your level is ${library.level}, so texts up to ${library.level} show first.`;
$('level-filter').addEventListener('change', renderLibrary);
onOfferChange(() => renderLibrary());
renderLibrary();

let asked = 0;
let timer = null;

function show(results, q) {
  const list = $('lexicon-results');
  list.replaceChildren();
  $('lexicon-status').textContent = results.length ? `${results.length === 50 ? 'The first 50' : results.length} for “${q}”` : `No word in the list matches “${q}”.`;
  for (const r of results) {
    // G-09 FR-926: the state label and the one-sided Pick up / Let it fall button at the row's right.
    const li = el('li', 'lexicon-item');
    const row = el('div', 'drow');
    const main = el('div', 'dmain');
    const meta = el('span', 'lexicon-meta');
    if (r.level) meta.append(el('span', 'level-badge', r.level));
    let label = stateLabel(r.state);
    meta.append(label);
    main.append(el('span', 'text-title', r.lemma), el('span', 'lexicon-en', r.en), meta);
    const item = { lemma: r.lemma, kind: 'word', state: r.state === 'leaf' || r.state === 'ground' ? r.state : 'new' };
    const act = el('div', 'dact');
    act.append(wordButton(item, (state) => { const next = stateLabel(state); label.replaceWith(next); label = next; }));
    row.append(main, act);
    li.append(row);
    list.append(li);
  }
}

$('lexicon-search').addEventListener('input', () => {
  clearTimeout(timer);
  const q = $('lexicon-search').value.trim();
  if (q.length < 2) { $('lexicon-results').replaceChildren(); $('lexicon-status').textContent = ''; return; }
  timer = setTimeout(async () => {
    const mine = ++asked;
    const res = await fetch(`/api/common-dictionary?q=${encodeURIComponent(q)}`, { credentials: 'same-origin' });
    if (mine !== asked || !res.ok) return;
    show((await res.json()).results, q);
  }, 300);
});
