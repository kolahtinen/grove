// Progress (G-09 FR-924, the picked sketch's version B; FR-925; G-04 FR-414): the level started at against
// the level now with today's minutes; four cards (read and listened in the last 7 days, leaves, ground),
// each opening its details; the last 7 days as stacked bars, read and listened told apart by a legend and
// a pattern; and since the start. Details are views of this page, reached by #days, #leaves, #ground and
// #level, with ‹ Progress at the top. Everything is set with textContent.
import { getMe } from './api.mjs';
import { showAccount } from './page.mjs';
import { showWay } from './way.mjs';

const $ = (id) => document.getElementById(id);
const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; };
const fmt = (n) => n.toLocaleString('en-GB');
const date = (ms) => new Date(ms).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
const dayName = (iso) => new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-GB', { weekday: 'short' });

await showAccount();
await getMe();
const res = await fetch('/api/progress', { credentials: 'same-origin' });
const p = res.ok ? await res.json() : null;

function levelBoxes() {
  const box = (k, v, sub, cls) => { const d = el('div', `lv ${cls}`); d.append(el('span', 'k', k), el('span', 'v', v), el('span', 'k', sub)); return d; };
  const arrow = el('span', 'lv-arrow', '→');
  arrow.setAttribute('aria-hidden', 'true');
  $('progress-levels').replaceChildren(
    box('Started', p.level.start ?? 'Beginner', p.level.startAt ? date(p.level.startAt) : '', ''),
    arrow,
    box('Now', p.level.now ?? 'below A1', '', 'now'),
  );
  $('progress-level').textContent = p.level.now ? `Your level: ${p.level.now}${p.level.start ? ` · you started at ${p.level.start}` : ''}` : 'Set your starting level to see your level.';
}

function stat(k, v, sub, hash) {
  const a = el('a', 'stat');
  a.href = hash;
  a.append(el('span', 'k', k), el('span', 'v', v), el('span', 'w', sub), el('span', 'go', 'Details ›'));
  return a;
}

// FR-924: one bar per day, read and listened stacked; listening striped as well as coloured.
function weekChart(box) {
  const max = Math.max(10, ...p.week.map((d) => d.read + d.listen));
  const empty = p.week.every((d) => d.read + d.listen === 0);
  if (empty) {
    const e = el('p', 'muted', 'Nothing read or heard in the last 7 days yet. ');
    const a = el('a', '', 'Start from Discover ›');
    a.href = '/';
    e.append(a);
    box.replaceChildren(e);
    return;
  }
  const chart = el('div', 'week-bars');
  const readout = el('p', 'small muted week-readout');
  readout.setAttribute('role', 'status');
  for (const d of p.week) {
    const col = el('button', 'week-bar');
    col.type = 'button';
    const total = d.read + d.listen;
    const text = `${dayName(d.day)} ${d.day.slice(8)}: read ${d.read} min · ${fmt(d.readWords)} words; listened ${d.listen} min · ${fmt(d.listenWords)} words`;
    col.setAttribute('aria-label', text);
    const stack = el('span', 'stack');
    stack.style.setProperty('--h', `${Math.round((total / max) * 100)}%`);
    const listen = el('span', 'seg listen');
    listen.style.flexGrow = String(d.listen);
    const read = el('span', 'seg read');
    read.style.flexGrow = String(d.read);
    stack.append(listen, read);
    col.append(stack, el('span', 'bar-label', dayName(d.day)));
    col.addEventListener('click', () => { readout.textContent = text; });
    chart.append(col);
  }
  const legend = el('ul', 'legend');
  const item = (cls, text) => { const li = el('li'); li.append(el('span', `sw ${cls}`), document.createTextNode(text)); return li; };
  legend.append(item('read', 'Read'), item('listen', 'Listened'));
  box.replaceChildren(chart, legend, readout);
}

function since() {
  const row = (k, v, sub) => { const dd = el('dd'); dd.append(el('b', '', v)); if (sub) dd.append(el('span', 'muted small', ` · ${sub}`)); return [el('dt', '', k), dd]; };
  $('since-date').textContent = p.ever.since ? `(${date(`${p.ever.since}T12:00:00Z`)})` : '';
  const ground = row('Ground', `${fmt(p.ground.words)} words`, `${p.ground.patterns} patterns`);
  ground[1].append(el('span', 'mw small muted', `${fmt(p.ground.fromStart)} of them from your starting level`));
  $('since').replaceChildren(
    ...row('Read', `${fmt(p.ever.read)} min`, `${fmt(p.ever.readWords)} words`),
    ...row('Listened', `${fmt(p.ever.listen)} min`, `${fmt(p.ever.listenWords)} words`),
    ...row('Picked up', `${fmt(p.leaves.everWords)} words`, `${p.leaves.everPatterns} patterns`),
    ...ground,
  );
}

function days() {
  $('day-list').replaceChildren(...p.week.slice().reverse().map((d) => {
    const li = el('li');
    li.append(el('span', 'd', `${dayName(d.day)} ${d.day.slice(8)}`),
      el('span', '', d.read + d.listen === 0 ? 'nothing that day' : `Read ${d.read} min · ${fmt(d.readWords)} words; listened ${d.listen} min · ${fmt(d.listenWords)} words`));
    return li;
  }));
}

function words(which) {
  $('tab-leaves').setAttribute('aria-pressed', String(which === 'leaves'));
  $('tab-ground').setAttribute('aria-pressed', String(which === 'ground'));
  const g = which === 'ground' ? p.ground : p.leaves;
  const body = $('words-body');
  body.replaceChildren(el('h2', '', which === 'ground' ? 'In your ground' : 'Picked up for drilling'));
  const two = el('div', 'two');
  for (const [k, v, wk] of [['Words', g.words, g.weekWords], ['Grammar patterns', g.patterns, g.weekPatterns]]) {
    const b = el('div', 'box');
    b.append(el('span', 'k', k), el('span', 'v', fmt(v)), el('span', 'w', `+${wk} in the last 7 days`));
    two.append(b);
  }
  body.append(two);
  if (which === 'ground') {
    const total = g.fromStart + g.fromReading + g.fell || 1;
    const bar = el('div', 'origin-bar');
    bar.setAttribute('role', 'img');
    bar.setAttribute('aria-label', 'Where your ground\'s words came from');
    for (const [cls, n] of [['start', g.fromStart], ['known', g.fromReading], ['fell', g.fell]]) { const s = el('span', cls); s.style.flexGrow = String(n / total); bar.append(s); }
    const legend = el('ul', 'legend');
    for (const [cls, n, text] of [['start', g.fromStart, 'from your starting level'], ['known', g.fromReading, 'known when you read'], ['fell', g.fell, 'fell from your leaves']]) { const li = el('li'); li.append(el('span', `sw ${cls}`), document.createTextNode(`${fmt(n)} ${text}`)); legend.append(li); }
    body.append(el('h3', 'small muted', 'Where your words came from'), bar, legend);
  }
  const recent = g.recent ?? [];
  body.append(el('h3', 'small muted', which === 'ground' ? 'Fell lately' : 'Picked up lately'));
  if (!recent.length) body.append(el('p', 'muted', which === 'ground' ? 'No leaves have fallen yet.' : 'No leaves yet. Tap a word while you read and pick it up to drill it.'));
  else {
    const ul = el('ul', 'item-list');
    for (const r of recent) { const li = el('li'); li.append(el('span', 'sv', r.lemma), el('span', 'muted small', ` ${r.en ?? ''}`), el('span', 'when small muted', date(r.at))); ul.append(li); }
    body.append(ul);
  }
  if (which === 'leaves') { const a = el('a', '', 'All your leaves ›'); a.href = '/leaves'; body.append(a); }
}

function level() {
  const body = $('level-body');
  body.replaceChildren($('progress-levels').cloneNode(true));
  body.append(el('h3', 'small muted', 'Share of each level\'s words in your ground'));
  const ul = el('ul', 'coverage');
  for (const [lv, pct] of p.level.coverage) {
    const li = el('li');
    const bar = el('span', 'cov-bar');
    const fill = el('span', pct >= 90 ? 'cov-fill reached' : 'cov-fill');
    fill.style.width = `${pct}%`;
    bar.append(fill);
    li.append(el('span', 'cov-level', lv), bar, el('span', 'cov-pct', `${pct}%`));
    ul.append(li);
  }
  body.append(ul, el('p', 'small muted', 'You reach a level when 90% of its words, and of every level below it, are in your ground.'));
}

const VIEWS = { '': 'view-main', days: 'view-days', leaves: 'view-words', ground: 'view-words', level: 'view-level' };
function route() {
  const hash = window.location.hash.slice(1);
  const view = VIEWS[hash] ?? 'view-main';
  for (const id of new Set(Object.values(VIEWS))) $(id).hidden = id !== view;
  if (hash === 'leaves' || hash === 'ground') words(hash);
  // FR-922: a detail view belongs under Progress.
  showWay(view === 'view-main' ? undefined : ['/progress', 'Progress']);
  window.scrollTo(0, 0);
}

if (!p) {
  $('progress-level').textContent = 'Progress can’t be shown right now. Try again in a moment.';
} else {
  $('progress-today').textContent = `today ${p.today.minutes} min`;
  levelBoxes();
  $('progress-stats').replaceChildren(
    stat('Read this week', `${p.last7.read} min`, `${fmt(p.last7.readWords)} words`, '#days'),
    stat('Listened this week', `${p.last7.listen} min`, `${fmt(p.last7.listenWords)} words`, '#days'),
    stat('Leaves (drilling)', `${fmt(p.leaves.words)} words`, `${p.leaves.patterns} grammar patterns`, '#leaves'),
    stat('In your ground', `${fmt(p.ground.words)} words`, `${p.ground.patterns} grammar patterns`, '#ground'),
  );
  weekChart($('week-chart'));
  since();
  days();
  level();
  $('tab-leaves').addEventListener('click', () => { window.location.hash = 'leaves'; });
  $('tab-ground').addEventListener('click', () => { window.location.hash = 'ground'; });
  window.addEventListener('hashchange', route);
  route();
}
