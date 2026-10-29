// A Learning tile's Options page (G-09 FR-903; B-24, B-25; the picked sketch, version B): a sheet over
// Home with "‹ Home" and ✕, the skills as four chips ticked in any number (none = all), the length as
// one 5 · 10 · 20 · 30 control, Harder questions only on Review, and the session's minutes as a bar split
// by skill with its legend (FR-905's shares: Review first at most 40% on Mix, then equal shares in
// turns); Start plans it. The last options used on a tile are kept on this device and shown next time.
// Everything is set with textContent.
import { getMe, post, showMessage } from './api.mjs';
import { showAccount } from './page.mjs';
import { hasSwedish } from './speech.mjs';
import { icon } from './icons.mjs';

const $ = (id) => document.getElementById(id);
const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; };
const TILES = { discover: 'Discover', review: 'Review', mix: 'Mix' };
const SKILLS = [['reading', 'Reading'], ['listening', 'Listening'], ['words', 'Words'], ['grammar', 'Grammar']];
const LENGTHS = [5, 10, 20, 30];
const NAME = Object.fromEntries(SKILLS);

const tile = new URLSearchParams(window.location.search).get('tile');
if (!TILES[tile]) window.location.replace('/');

// The options last used on a tile; an old saved single skill counts as that one ticked.
export function remembered(name) {
  let o = {};
  try { o = JSON.parse(localStorage.getItem(`grove-options-${name}`)) ?? {}; } catch { o = {}; }
  const skills = Array.isArray(o.skills) ? o.skills : (o.skill && o.skill !== 'mix' ? [o.skill] : []);
  return { skills: SKILLS.map(([k]) => k).filter((k) => skills.includes(k)), minutes: LENGTHS.includes(o.minutes) ? o.minutes : 10, hardOnly: !!o.hardOnly, used: !!o.minutes };
}
function remember(name, o) {
  try { localStorage.setItem(`grove-options-${name}`, JSON.stringify({ skills: o.skills, minutes: o.minutes, hardOnly: o.hardOnly })); } catch { /* nothing kept */ }
}

// "≈2½ min": whole and half minutes.
export const halves = (m) => { const h = Math.round(m * 2) / 2; return Number.isInteger(h) ? String(h) : `${Math.floor(h) || ''}½`; };
export function skillsLine(skills) {
  if (!skills.length) return 'All skills, in turns';
  return `${skills.map((s) => NAME[s]).join(' + ')}${skills.length > 1 ? ', in turns' : ''}`;
}

const voice = hasSwedish();
const picked = remembered(tile);
if (!voice) picked.skills = picked.skills.filter((s) => s !== 'listening');

// The bar's parts (FR-905's shares as planned for these options).
function parts() {
  const L = picked.minutes;
  const ticked = picked.skills.length ? picked.skills : SKILLS.map(([k]) => k).filter((k) => voice || k !== 'listening');
  const out = [];
  let rest = L;
  if (tile === 'mix') {
    const r = Math.round(L * 0.4 * 2) / 2;
    out.push({ skill: 'review', label: 'review', min: r });
    rest -= r;
  }
  for (const s of ticked) {
    const label = tile === 'review' ? `${picked.hardOnly ? 'harder questions' : 'review'} (${NAME[s].toLowerCase()})` : NAME[s].toLowerCase();
    out.push({ skill: s, label, min: rest / ticked.length });
  }
  return out;
}

function renderSummary() {
  $('plan-line').replaceChildren(el('b', '', `Your ${picked.minutes} minutes`), el('span', 'muted', ` · ${skillsLine(picked.skills)}`));
  const p = parts();
  $('plan-bar').replaceChildren(...p.map((g) => { const s = el('span'); s.style.flex = String(g.min); s.style.background = `var(--skill-${g.skill})`; return s; }));
  $('plan-legend').replaceChildren(...p.map((g) => {
    const li = el('li');
    const swatch = el('i');
    swatch.style.background = `var(--skill-${g.skill})`;
    li.append(swatch, document.createTextNode(`≈${halves(g.min)} min ${g.label}`));
    return li;
  }));
  $('options-start').textContent = `Start · ${picked.minutes} min`;
}

function renderChips() {
  $('skill-chips').replaceChildren(...SKILLS.map(([key, name]) => {
    const on = picked.skills.includes(key);
    const b = el('button', `skill-chip s-${key}`);
    b.type = 'button';
    b.setAttribute('aria-pressed', String(on));
    const label = el('span', 'chip-name', name);
    if (key === 'listening' && !voice) { b.disabled = true; label.append(el('small', '', 'needs a voice')); }
    b.append(icon(key), label);
    if (on) { const tick = el('span', 'tick', '✓'); tick.setAttribute('aria-hidden', 'true'); b.append(tick); }
    b.addEventListener('click', () => {
      picked.skills = on ? picked.skills.filter((s) => s !== key) : SKILLS.map(([k]) => k).filter((k) => k === key || picked.skills.includes(k));
      renderChips();
      renderSummary();
      $('skill-chips').querySelector(`.s-${key}`).focus();
    });
    return b;
  }));
}

function renderMinutes() {
  $('minutes').replaceChildren(...LENGTHS.map((m) => {
    const b = el('button', '', String(m));
    b.type = 'button';
    b.setAttribute('role', 'radio');
    b.setAttribute('aria-checked', String(picked.minutes === m));
    b.setAttribute('aria-label', `${m} minutes`);
    b.addEventListener('click', () => { picked.minutes = m; renderMinutes(); renderSummary(); $('minutes').querySelector('[aria-checked="true"]').focus(); });
    return b;
  }));
}

function offerBox(label, text, buttons) {
  document.querySelector('.no-texts-offer')?.remove();
  const box = el('div', 'no-texts-offer');
  box.setAttribute('role', 'group');
  box.setAttribute('aria-label', label);
  const row = el('div', 'row');
  row.append(...buttons);
  box.append(el('p', '', text), row);
  showMessage($('options-message'), '');
  $('options-message').before(box);
  buttons[0].focus();
}
const button = (text, cls = '') => { const b = el('button', cls, text); b.type = 'button'; return b; };

// Starts the session and opens it; a session that would run short first offers Fill the time or Start
// shorter; a Review with nothing to practise offers Discover and Add a text (FR-905).
async function start(extra = {}) {
  remember(tile, picked);
  const body = { kind: 'time', tile, skills: picked.skills, minutes: picked.minutes, voice, ...(tile === 'review' && picked.hardOnly ? { hardOnly: true } : {}), ...extra };
  $('options-start').disabled = true;
  $('options-start').textContent = 'Planning…';
  const r = await post('/api/sessions', body);
  $('options-start').disabled = false;
  renderSummary();
  if (r.ok) { window.location.assign('/session'); return; }
  if (r.data?.error === 'short') {
    const fill = button('Fill the time', 'main');
    fill.addEventListener('click', () => start({ fill: true }));
    const shorter = button('Start shorter');
    shorter.addEventListener('click', () => start({ asIs: true }));
    offerBox('This session would be short', r.message, [fill, shorter]);
    return;
  }
  if (r.data?.error === 'nothing_to_do' && tile === 'review') {
    const discover = el('a', 'button-link main', 'Go to Discover');
    discover.href = '/?open=discover';
    const add = el('a', 'button-link', 'Add a text');
    add.href = '/add';
    offerBox('Nothing to review', r.message, [discover, add]);
    return;
  }
  showMessage($('options-message'), r.message);
}

await showAccount();
await getMe();
document.title = `${TILES[tile]} options · grove`;
$('options-title').textContent = `${TILES[tile]} options`;
$('options-close').append(icon('close'));
$('hard-line').hidden = tile !== 'review';
$('hard').setAttribute('aria-checked', String(picked.hardOnly));
$('hard').addEventListener('click', () => {
  picked.hardOnly = !picked.hardOnly;
  $('hard').setAttribute('aria-checked', String(picked.hardOnly));
  renderSummary();
});
$('options-start').addEventListener('click', () => start());
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !document.getElementById('help') && document.querySelector('#site-menu')?.hidden !== false) window.location.assign('/');
});
renderChips();
renderMinutes();
renderSummary();
