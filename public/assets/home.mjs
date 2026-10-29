// Home (G-09 FR-901, addendum 005, 006): square tiles with an icon and a one-word label, in three headed
// groups, Learning (Discover, Review, Mix), Library and Progress; tapping one opens it in place below its
// row, with its title, a one-line explanation and its way in (research R7: a disclosure button per tile,
// one panel moved after the row, focus to the panel's title, Esc / ✕ / the tile again / the phone's Back
// closes it and focus returns to the tile). A Learning tile offers Start (10 minutes, all skills) and
// Options…, which opens the tile's Options page (FR-903, B-24: options.mjs); the last options used there
// are named in the panel but not applied by Start. While a session is going, a Resume bar sits above the
// Learning tiles (FR-904). The welcome card (G-04 FR-416) shows above the groups until closed.
// Everything is set with textContent.
import { getMe, post, showMessage } from './api.mjs';
import { showAccount } from './page.mjs';
import { playGrow } from './grow.mjs';
import { hasSwedish } from './speech.mjs';
import { icon } from './icons.mjs';
import { backCloses } from './way.mjs';

const $ = (id) => document.getElementById(id);
const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; };
const link = (href, text, cls = 'button-link') => { const a = el('a', cls, text); a.href = href; return a; };
const button = (text, cls = '') => { const b = el('button', cls, text); b.type = 'button'; return b; };

const SKILLS = [['reading', 'Reading'], ['listening', 'Listening'], ['words', 'Words'], ['grammar', 'Grammar']];

const TILES = [
  { id: 'discover', group: 'learning', label: 'Discover', name: 'Discover', line: 'New texts to read and hear, at your level.', body: () => sessionBody('discover') },
  { id: 'review', group: 'learning', label: 'Review', name: 'Review', line: 'The words you are learning, when they are due; harder questions for the ones you know well.', body: () => sessionBody('review') },
  { id: 'mix', group: 'learning', label: 'Mix', name: 'Mix', line: 'Review first, then new texts, in one session.', body: () => sessionBody('mix') },
  { id: 'common', group: 'library', label: 'Common library', name: 'Common library', line: 'grove’s shared texts by topic, and the dictionary of every Swedish word.', body: () => [link('/library', 'Open the common library', 'button-link main')] },
  { id: 'yours', group: 'library', label: 'Your library', name: 'Your library', line: 'Your texts by topic, Add a text, your dictionary and your leaves.', body: yoursBody },
  { id: 'progress', group: 'progress', label: 'Progress', name: 'Progress', line: 'What you’ve read and heard, your words, and your level since you started.', body: () => [link('/progress', 'Open Progress', 'button-link main')] },
];
const GROUPS = [['learning', 'Learning'], ['library', 'Library'], ['progress', 'Progress']];

let going = null;
let openId = null;
let release = null;

// The options last used on a tile's Options page (named in the panel; Start always uses 10 minutes, all
// skills). An old saved single skill counts as that one ticked.
function lastOptions(tile) {
  let o = null;
  try { o = JSON.parse(localStorage.getItem(`grove-options-${tile}`)); } catch { o = null; }
  if (!o?.minutes) return null;
  const skills = Array.isArray(o.skills) ? o.skills : (o.skill && o.skill !== 'mix' ? [o.skill] : []);
  const names = SKILLS.filter(([k]) => skills.includes(k)).map(([, n]) => n);
  return `${names.length ? `${names.join(' + ')}${names.length > 1 ? ', in turns' : ''}` : 'All skills, in turns'} · ${o.minutes} min`;
}

// Starts a session and opens it; a session short of new texts opens with its offer (FR-920). A Review
// that would run short first offers Fill the time or Start shorter (FR-905).
async function start(body, message) {
  const result = await post('/api/sessions', { kind: 'time', voice: hasSwedish(), ...body });
  if (!result.ok && result.data.error === 'short') { shortReview(body, message, result.message); return; }
  if (!result.ok && result.data.error === 'nothing_to_do' && body.tile === 'review') { nothingToReview(message, result.message); return; }
  if (!result.ok) { showMessage(message, result.message); return; }
  window.location.assign('/session');
}

function shortReview(body, message, text) {
  const box = el('div', 'no-texts-offer');
  box.setAttribute('role', 'group');
  box.setAttribute('aria-label', 'This session would be short');
  const fill = button('Fill the time', 'main');
  fill.addEventListener('click', () => start({ ...body, fill: true }, message));
  const shorter = button('Start shorter');
  shorter.addEventListener('click', () => start({ ...body, asIs: true }, message));
  const row = el('div', 'row');
  row.append(fill, shorter);
  box.append(el('p', '', text), row);
  $('tile-way').querySelector('.no-texts-offer')?.remove();
  showMessage(message, '');
  message.before(box);
  fill.focus();
}

// FR-905 (B-30): a Review with nothing at all to practise offers Discover and Add a text.
function nothingToReview(message, text) {
  const box = el('div', 'no-texts-offer');
  box.setAttribute('role', 'group');
  box.setAttribute('aria-label', 'Nothing to review');
  const discover = button('Go to Discover', 'main');
  discover.addEventListener('click', () => open($('tile-discover')));
  const row = el('div', 'row');
  row.append(discover, link('/add', 'Add a text'));
  box.append(el('p', '', text), row);
  $('tile-way').querySelector('.no-texts-offer')?.remove();
  showMessage(message, '');
  message.before(box);
  discover.focus();
}

function sessionBody(tile) {
  const message = el('p', 'message');
  message.setAttribute('role', 'status');
  message.hidden = true;
  const go = button('', 'main');
  go.append(document.createTextNode('Start'), el('span', 'start-detail', ' · 10 min, all skills'));
  go.addEventListener('click', () => start({ tile, skills: [], minutes: 10 }, message));
  // FR-903 (B-24): Options… opens the tile's own page.
  const more = link(`/options?tile=${tile}`, 'Options…');
  const row = el('div', 'row');
  row.append(go, more);
  const last = lastOptions(tile);
  return [row, ...(last ? [el('p', 'small muted', `Last time in Options: ${last}`)] : []), message];
}

function yoursBody() {
  const more = el('p', 'links small');
  more.append(link('/add', 'Add a text', ''), link('/dictionary', 'Your dictionary', ''), link('/leaves', 'Your leaves', ''));
  return [link('/texts', 'Open your library', 'button-link main'), more];
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
  const r = release;
  release = null;
  r?.(!focus);
  if (focus) tile.focus();
}

function open(tile) {
  const grid = tile.closest('.tiles');
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
  // FR-922: the phone's Back closes the open tile first.
  release = backCloses(() => { release = null; close(); });
  $('tile-title').focus();
}

// FR-904: while a session is going, a Resume bar above the Learning tiles.
function resumeBar() {
  const a = link('/session', '', 'resume-bar');
  a.append(icon('resume'), el('span', '', `Resume: ${going.label}${going.total ? ` · ${going.index + 1} of ${going.total}` : ''}`));
  return a;
}

function renderTiles() {
  const box = $('tiles');
  box.replaceChildren();
  for (const [group, heading] of GROUPS) {
    const section = el('section', 'tile-group');
    section.setAttribute('aria-labelledby', `group-${group}`);
    const h = el('h2', 'group-title', heading);
    h.id = `group-${group}`;
    const grid = el('div', 'tiles');
    if (group === 'learning' && going) section.append(resumeBar());
    for (const def of TILES.filter((t) => t.group === group)) {
      const tile = button('', `tile tile-is-${def.id}`);
      tile.id = `tile-${def.id}`;
      tile.setAttribute('aria-expanded', 'false');
      tile.setAttribute('aria-controls', 'tile-panel');
      tile.append(icon(def.id), el('span', 'tile-label', def.label));
      tile.addEventListener('click', () => (openId === def.id ? close() : open(tile)));
      grid.append(tile);
    }
    section.prepend(h);
    section.append(grid);
    box.append(section);
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
  panel.hidden = true;
  box.append(panel);
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && openId && !document.getElementById('help')) close();
});

await showAccount();
await getMe();
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

const sessionRes = await fetch('/api/session', { credentials: 'same-origin' });
if (sessionRes.ok) going = (await sessionRes.json()).session;
if (going && going.status !== 'going') going = null;
renderTiles();
// "Go to Discover" from another page opens the Discover tile (FR-905, B-30).
const openFirst = new URLSearchParams(window.location.search).get('open');
if (openFirst === 'discover' && away !== 'start') open($('tile-discover'));

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
