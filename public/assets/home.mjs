// Home (G-09 FR-901): a grid of square icon tiles; tapping one opens it in place below its row, with its
// title, a one-line explanation and its way in (research R7: a disclosure button per tile, one panel
// moved after the row, focus to the panel's title, Esc / ✕ / the tile again closes it and focus returns
// to the tile). Resume shows first while a session is going (FR-904). The welcome card (G-04 FR-416)
// shows above the grid until closed. Everything is set with textContent.
import { getMe, post, showMessage } from './api.mjs';
import { showAccount } from './page.mjs';
import { playGrow } from './grow.mjs';
import { hasSwedish } from './speech.mjs';
import { icon } from './icons.mjs';

const $ = (id) => document.getElementById(id);
const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; };
const link = (href, text, cls = 'button-link') => { const a = el('a', cls, text); a.href = href; return a; };
const button = (text, cls = '') => { const b = el('button', cls, text); b.type = 'button'; return b; };

const MINUTES = [3, 5, 10, 20, 30];
const SKILLS = [['reading', 'Reading'], ['listening', 'Listening'], ['words', 'Words and phrases'], ['grammar', 'Grammar']];
const FORMS = [['short', 'Short', 5], ['medium', 'Medium', 10], ['long', 'Long', 20]];

const TILES = [
  { id: 'resume', name: 'Resume', line: 'Carry on with your session where you left off.', body: resumeBody },
  { id: 'practise', name: 'Practise for X min', line: 'grove plans Discover, Review and Master for the time you have.', body: practiseBody },
  { id: 'texts', name: 'Texts', line: 'Your texts by topic, new texts from your AI, and texts of your own.', body: () => [link('/texts', 'Open Texts', 'button-link main')] },
  { id: 'skill', name: 'By skill', line: 'Practise one skill: reading, listening, words and phrases, or grammar.', body: skillBody },
  { id: 'dictionary', name: 'Dictionary', line: 'Every word you have met, with its meaning; and your leaves.', body: () => [link('/dictionary', 'Open the Dictionary', 'button-link main'), link('/leaves', 'Your leaves', 'small leaves-link')] },
  { id: 'mode', name: 'Just one mode', line: 'Only Discover, only Review or only Master, one exercise at a time.', body: modeBody },
  { id: 'progress', name: 'Progress', line: 'Your level, today’s minutes and the last 14 days.', body: () => [link('/progress', 'Open Progress', 'button-link main')] },
];

let going = null;
let openId = null;

// Starts a session and opens it; a refusal (nothing to do, no voice) is shown in the panel.
async function start(body, message) {
  const result = await post('/api/sessions', { ...body, voice: hasSwedish() });
  if (!result.ok) { showMessage(message, result.message); return; }
  window.location.assign('/session');
}

function resumeBody() {
  return [el('p', 'small muted', going ? going.label : ''), link('/session', 'Resume', 'button-link main')];
}

function practiseBody() {
  const message = el('p', 'message');
  message.setAttribute('role', 'status');
  message.hidden = true;
  const group = el('div', 'minute-choices');
  group.setAttribute('role', 'radiogroup');
  group.setAttribute('aria-label', 'Minutes');
  let chosen = 10;
  const typed = el('input', 'minutes-typed');
  typed.type = 'number';
  typed.min = '3';
  typed.max = '60';
  typed.inputMode = 'numeric';
  typed.placeholder = '3–60';
  typed.setAttribute('aria-label', 'Other length in minutes');
  const choices = MINUTES.map((m) => {
    const b = button(`${m} min`, 'chip-choice');
    b.setAttribute('role', 'radio');
    b.setAttribute('aria-checked', String(m === chosen));
    b.addEventListener('click', () => {
      chosen = m;
      typed.value = '';
      for (const c of choices) c.setAttribute('aria-checked', String(c === b));
    });
    return b;
  });
  typed.addEventListener('input', () => { for (const c of choices) c.setAttribute('aria-checked', 'false'); });
  group.append(...choices, typed);
  const go = button('Start', 'main');
  go.addEventListener('click', () => {
    const minutes = typed.value === '' ? chosen : Number(typed.value);
    if (!Number.isInteger(minutes) || minutes < 3 || minutes > 60) { showMessage(message, 'Choose a length from 3 to 60 minutes.'); return; }
    start({ kind: 'time', minutes }, message);
  });
  return [group, go, message];
}

function skillBody() {
  const message = el('p', 'message');
  message.setAttribute('role', 'status');
  message.hidden = true;
  const rows = SKILLS.map(([skill, name]) => {
    const row = el('div', 'skill-row');
    row.append(el('span', 'skill-name', name));
    for (const [form, label, minutes] of FORMS) {
      const b = button(label, 'chip-choice');
      b.setAttribute('aria-label', `${name}, ${label.toLowerCase()} (${minutes} min)`);
      b.addEventListener('click', () => start({ kind: 'skill', skill, form }, message));
      row.append(b);
    }
    return row;
  });
  return [...rows, message];
}

function modeBody() {
  const message = el('p', 'message');
  message.setAttribute('role', 'status');
  message.hidden = true;
  const row = el('div', 'row');
  for (const [mode, name] of [['discover', 'Discover'], ['review', 'Review'], ['master', 'Master']]) {
    const b = button(name, `mode-choice ${mode}`);
    b.prepend(icon(mode));
    b.addEventListener('click', () => start({ kind: 'mode', mode }, message));
    row.append(b);
  }
  return [row, message];
}

function columns(grid) {
  return getComputedStyle(grid).gridTemplateColumns.split(' ').filter(Boolean).length || 3;
}

function close({ focus = true } = {}) {
  const panel = $('tile-panel');
  if (!panel || !openId) return;
  const tile = $(`tile-${openId}`);
  tile.setAttribute('aria-expanded', 'false');
  panel.hidden = true;
  openId = null;
  if (focus) tile.focus();
}

function open(tile) {
  const grid = $('tiles');
  const panel = $('tile-panel');
  close({ focus: false });
  const tiles = [...grid.querySelectorAll('.tile')];
  const i = tiles.indexOf(tile);
  const n = columns(grid);
  const rowEnd = tiles[Math.min(Math.ceil((i + 1) / n) * n, tiles.length) - 1];
  rowEnd.after(panel);
  const def = TILES.find((t) => `tile-${t.id}` === tile.id);
  $('tile-title').textContent = def.name;
  $('tile-line').textContent = def.line;
  $('tile-way').replaceChildren(...def.body());
  panel.hidden = false;
  tile.setAttribute('aria-expanded', 'true');
  openId = def.id;
  $('tile-title').focus();
}

function renderTiles() {
  const grid = $('tiles');
  grid.replaceChildren();
  for (const def of TILES) {
    if (def.id === 'resume' && !going) continue;
    const tile = button('', `tile tile-is-${def.id}`);
    tile.id = `tile-${def.id}`;
    tile.setAttribute('aria-label', def.name);
    tile.setAttribute('aria-expanded', 'false');
    tile.setAttribute('aria-controls', 'tile-panel');
    tile.append(icon(def.id));
    tile.addEventListener('click', () => (openId === def.id ? close() : open(tile)));
    grid.append(tile);
  }
  const panel = el('section', 'card tile-panel');
  panel.id = 'tile-panel';
  panel.hidden = true;
  panel.setAttribute('aria-labelledby', 'tile-title');
  const head = el('div', 'tile-head');
  const title = el('h2', '', '');
  title.id = 'tile-title';
  title.tabIndex = -1;
  const x = button('', 'bar-button tile-close');
  x.setAttribute('aria-label', 'Close');
  x.append(icon('close'));
  x.addEventListener('click', () => close());
  head.append(title, x);
  const line = el('p', 'muted', '');
  line.id = 'tile-line';
  const way = el('div', 'tile-way');
  way.id = 'tile-way';
  panel.append(head, line, way);
  grid.append(panel);
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && openId && !document.getElementById('help')) close();
});

await showAccount();
await getMe();
const sessionRes = await fetch('/api/session', { credentials: 'same-origin' });
if (sessionRes.ok) going = (await sessionRes.json()).session;
if (going && going.status !== 'going') going = null;
renderTiles();

// G-04 FR-416 and G-06 FR-605: the welcome card; a new account goes to the starting check once the
// welcome is closed.
async function loadStages() {
  const res = await fetch('/api/stages', { credentials: 'same-origin' });
  if (!res.ok) return null;
  const s = await res.json();
  $('welcome').hidden = !s.welcome;
  if (s.needsStart && !s.welcome) { window.location.assign('/start'); return 'start'; }
  return null;
}
const away = await loadStages();
$('welcome-close').addEventListener('click', async () => {
  await post('/api/welcome', {});
  $('welcome').hidden = true;
  await loadStages();
});

// G-08 FR-802: once after agreeing to the terms, the leaves-and-ground scene in a card at the top of
// Home (kept until Home is reached, so a learner sent to the starting check first still sees it).
function growDue() {
  try { return sessionStorage.getItem('grove-grow-due') === '1'; } catch { return false; }
}
if (away !== 'start' && growDue()) {
  try { sessionStorage.removeItem('grove-grow-due'); } catch { /* nothing kept */ }
  const card = document.createElement('section');
  card.className = 'card grow-card';
  card.id = 'grow-card';
  document.querySelector('main').prepend(card);
  playGrow(card, { onend: () => card.remove() });
}
