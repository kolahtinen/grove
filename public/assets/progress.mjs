// Progress (FR-414, FR-415): level, minutes per day for 14 days, ground and drilled counts.
import { getMe } from './api.mjs';
import { showAccount } from './page.mjs';

const $ = (id) => document.getElementById(id);
await showAccount();
await getMe();
const res = await fetch('/api/progress', { credentials: 'same-origin' });
const p = res.ok ? await res.json() : { level: null, days: [], ground: 0, drilled: 0 };
$('progress-level').textContent = p.level === null ? 'Set your starting level to see your level.' : `Your level: ${p.level}`;
const max = Math.max(10, ...p.days.map((d) => d.minutes));
for (const d of p.days) {
  const bar = document.createElement('div');
  bar.className = 'bar';
  const fill = document.createElement('span');
  fill.className = 'bar-fill';
  fill.style.setProperty('--h', `${Math.round((d.minutes / max) * 100)}%`);
  const label = document.createElement('span');
  label.className = 'bar-label';
  label.textContent = d.day.slice(8);
  bar.title = `${d.day}: ${d.minutes} min`;
  bar.setAttribute('aria-label', `${d.day}: ${d.minutes} minutes`);
  bar.append(fill, label);
  $('bars').append(bar);
}
$('progress-counts').textContent = `${p.ground} words in your ground · ${p.drilled} leaves being drilled`;
