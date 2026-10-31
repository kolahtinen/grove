// Home as a map of everything (G-09 FR-901, the picked sketch's version C; RQ-463, question-pages/94): three
// bands, each a card with a heading and one line — Learn (Discover, Review, Mix), Your texts (Your library,
// Common library) and How you're doing (Progress). Every tile is a row with its icon, its name, a line
// saying what is in it and, at its right, a live count from /api/overview (Progress a small chart of this
// week's minutes). The Learn rows open in place below their row with the explanation, Start and Options…
// (FR-903; research R7's disclosure: focus to the panel's title, Esc / ✕ / the row again / the phone's Back
// closes it and focus returns to the row); Your library, Common library and Progress open their pages at
// once. While a session with a plan is going, Resume sits at the very top (FR-904). From 900 px the bands
// sit side by side. A new account goes to the starting level once, after the welcome (G-06 FR-605); until
// a level is chosen, Progress offers it. Everything is set with textContent.
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
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const LEARN = [
  { id: 'discover', name: 'Discover', short: 'New texts, words, grammar.', line: 'New texts, words and grammar at your level.' },
  { id: 'review', name: 'Review', short: 'Your words, when due.', line: 'The words you are learning, when they are due; harder questions for the ones you know well.' },
  { id: 'mix', name: 'Mix', short: 'Review, then new things.', line: 'Review first, then new things, in one session.' },
];

let counts = null;
let going = null;
let stages = null;
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

function offerBox(label, text, buttons) {
  const box = el('div', 'no-texts-offer');
  box.setAttribute('role', 'group');
  box.setAttribute('aria-label', label);
  const row = el('div', 'row');
  row.append(...buttons);
  box.append(el('p', '', text), row);
  $('tile-way').querySelector('.no-texts-offer')?.remove();
  return box;
}

function shortReview(body, message, text) {
  const fill = button('Fill the time', 'main');
  fill.addEventListener('click', () => start({ ...body, fill: true }, message));
  const shorter = button('Start shorter');
  shorter.addEventListener('click', () => start({ ...body, asIs: true }, message));
  showMessage(message, '');
  message.before(offerBox('This session would be short', text, [fill, shorter]));
  fill.focus();
}

// FR-905 (B-30): a Review with nothing at all to practise offers Discover and Add a text.
function nothingToReview(message, text) {
  const discover = button('Go to Discover', 'main');
  discover.addEventListener('click', () => open('discover'));
  showMessage(message, '');
  message.before(offerBox('Nothing to review', text, [discover, link('/add', 'Add a text')]));
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

function close({ focus = true } = {}) {
  const panel = $('tile-panel');
  if (!panel || !openId) return;
  const row = $(`tile-${openId}`);
  row.setAttribute('aria-expanded', 'false');
  panel.hidden = true;
  openId = null;
  const r = release;
  release = null;
  r?.(!focus);
  if (focus) row.focus();
}

function open(id) {
  const row = $(`tile-${id}`);
  const panel = $('tile-panel');
  close({ focus: false });
  row.after(panel);
  const def = LEARN.find((t) => t.id === id);
  $('tile-title').textContent = def.name;
  $('tile-line').textContent = def.line;
  $('tile-way').replaceChildren(...sessionBody(id));
  panel.hidden = false;
  row.setAttribute('aria-expanded', 'true');
  openId = id;
  // FR-922: the phone's Back closes the open row first.
  release = backCloses(() => { release = null; close(); });
  $('tile-title').focus();
}

// A row: icon, name (its accessible name), a line and, at its right, a count.
function row({ id, iconName, name, line, count, href }) {
  const node = href ? el('a', 'row-tile') : button('', 'row-tile');
  node.id = `tile-${id}`;
  if (href) node.href = href;
  else {
    node.setAttribute('aria-expanded', 'false');
    node.setAttribute('aria-controls', 'tile-panel');
    node.addEventListener('click', () => (openId === id ? close() : open(id)));
  }
  const ico = el('span', 'ico');
  ico.append(icon(iconName));
  const text = el('span', 'row-text');
  const nm = el('span', 'nm', name);
  nm.id = `tile-${id}-name`;
  const ln = el('span', 'ln', line);
  ln.id = `tile-${id}-line`;
  text.append(nm, ln);
  const cnt = el('span', 'cnt');
  cnt.id = `tile-${id}-count`;
  if (count instanceof Node) cnt.append(count); else if (count) cnt.textContent = count;
  node.setAttribute('aria-labelledby', nm.id);
  node.setAttribute('aria-describedby', `${ln.id} ${cnt.id}`);
  node.append(ico, text, cnt);
  return node;
}

function band(id, cls, title, line, rows, extra = []) {
  const section = el('section', `band ${cls}`);
  section.setAttribute('aria-labelledby', `band-${id}`);
  const head = el('div', 'band-head');
  const h = el('h2', '', title);
  h.id = `band-${id}`;
  head.append(h, el('p', '', line));
  const list = el('div', 'rows');
  list.append(...rows);
  section.append(head, list, ...extra);
  return section;
}

// This week's minutes as seven small bars (Monday to Sunday).
function miniWeek(week) {
  const box = el('span', 'mini-week');
  box.setAttribute('role', 'img');
  box.setAttribute('aria-label', `Minutes this week: ${week.map((m, i) => `${DAYS[i]} ${m}`).join(', ')}`);
  const max = Math.max(20, ...week);
  for (const m of week) {
    const bar = el('i', m ? '' : 'none');
    bar.style.height = `${Math.max(8, Math.round((m / max) * 100))}%`;
    box.append(bar);
  }
  return box;
}

// FR-904: Resume at the very top, in the session's skill colour.
function resumeBar() {
  const a = link('/session', '', `resume-bar s-${going.skill === 'mix' ? 'mix' : going.skill}`);
  a.id = 'resume';
  a.append(icon('resume'), el('span', '', `Resume: ${going.label}${going.total ? ` · ${Math.min(going.index + 1, going.total)} of ${going.total}` : ''}`));
  return a;
}

function render() {
  const c = counts;
  const fresh = !!c?.brandNew;
  const has = (n) => c && typeof n === 'number';
  const learnRows = LEARN.map((t) => {
    let count = '';
    if (t.id === 'discover') count = fresh ? 'Start here' : has(c?.newTexts) ? `${c.newTexts} new` : '';
    if (t.id === 'review') count = !c ? '' : c.leaves === 0 ? 'none yet' : `${c.due} due`;
    if (t.id === 'mix') count = c ? '10 min' : '';
    return row({ id: t.id, iconName: t.id, name: t.name, line: t.id === 'discover' && fresh ? 'Start here: a first text, words and a pattern.' : t.short, count });
  });
  const yours = row({
    id: 'yours', iconName: 'yours', name: 'Your library', href: '/texts',
    line: c && c.yourTexts === 0 ? 'Nothing here yet. Add a text, or take one from grove’s.' : 'Texts you have added, your dictionary, your leaves.',
    count: has(c?.yourTexts) ? `${c.yourTexts} text${c.yourTexts === 1 ? '' : 's'}` : '',
  });
  const common = row({
    id: 'common', iconName: 'common', name: 'Common library', href: '/library',
    line: 'grove’s texts for every level, and the dictionary.',
    count: has(c?.commonTexts) ? `${c.commonTexts} texts` : '',
  });
  const nothingYet = c && !c.level && !c.weekMinutes;
  const progress = row({
    id: 'progress', iconName: 'progress', name: 'Progress', href: '/progress',
    line: !c ? 'Your level, your minutes and your words.'
      : nothingYet ? 'No level yet. It appears after your first texts.'
        : `${c.level ?? 'No level yet'} · ${c.todayMinutes} min today · ${c.weekMinutes} min this week`,
    count: c && !nothingYet ? miniWeek(c.week) : '',
  });
  // G-06 FR-605: until a level is chosen, Progress offers the starting level.
  const startLink = c?.startOpen ? [(() => { const p = el('p', 'band-link small'); p.append(link('/start', 'Pick or assess your level now', '')); return p; })()] : [];
  const map = el('div', 'map');
  map.append(
    band('learn', 'learn', 'Learn', 'Practise for a few minutes. grove plans it.', learnRows),
    band('texts', 'lib', 'Your texts', 'What you read and listen to.', [yours, common]),
    band('progress', 'prog', 'How you’re doing', 'Your level and your week.', [progress], startLink),
  );
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
  map.append(panel);
  const box = $('tiles');
  const parts = [];
  $('resume-slot').replaceChildren(...(going ? [resumeBar()] : []));
  if (!c) {
    const err = el('div', 'message bad');
    err.setAttribute('role', 'alert');
    err.append(document.createTextNode('grove couldn’t load your numbers. The rows still work. '));
    const again = button('Try again', 'link-button');
    again.addEventListener('click', loadCounts);
    err.append(again);
    parts.push(err);
  }
  parts.push(map);
  box.replaceChildren(...parts);
}

async function loadCounts() {
  const res = await fetch('/api/overview', { credentials: 'same-origin' }).catch(() => null);
  counts = res?.ok ? await res.json() : null;
  const wasOpen = openId;
  render();
  if (wasOpen) open(wasOpen);
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && openId && !document.getElementById('help')) close();
});

await showAccount();
await getMe();
// G-04 FR-416 and G-06 FR-605: the welcome card; a new account goes to the starting level once, after
// the welcome is closed (the starting level page marks it offered, so its ‹ Home stays Home).
async function loadStages() {
  const res = await fetch('/api/stages', { credentials: 'same-origin' });
  if (!res.ok) return null;
  stages = await res.json();
  $('welcome').hidden = !stages.welcome;
  if (stages.needsStart && !stages.welcome) { window.location.assign('/start'); return 'start'; }
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
// FR-904: only a going session with a plan gives Resume (an unanswered offer is never kept).
if (!going || going.status !== 'going' || !going.total) going = null;
await loadCounts();
// "Go to Discover" from another page opens the Discover row (FR-905, B-30).
const openFirst = new URLSearchParams(window.location.search).get('open');
if (openFirst === 'discover' && away !== 'start') open('discover');

// G-08 FR-802: once after agreeing to the terms, the leaves-and-ground scene in a card at the top of
// Home (kept until Home is reached, so a learner sent to the starting level first still sees it).
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
