// The starting check (FR-603…FR-607): pick a level or beginner; tick unknown words; confirm.
import { getMe, post, showMessage } from './api.mjs';
import { showAccount } from './page.mjs';

const $ = (id) => document.getElementById(id);
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
let level = null;

await showAccount();
await getMe();

async function showSample(chosen) {
  level = chosen;
  const res = await fetch(`/api/start/sample?level=${chosen}`, { credentials: 'same-origin' });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) { showMessage($('start-unavailable'), body.message || 'The starting level isn’t available right now.'); return; }
  $('sample-heading').textContent = `Words from ${chosen}`;
  const list = $('sample');
  list.replaceChildren();
  for (const w of body.words) {
    const li = document.createElement('li');
    const label = document.createElement('label');
    label.className = 'check';
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.value = w.lemma;
    const text = document.createElement('span');
    text.textContent = w.lemma;
    label.append(box, text);
    li.append(label);
    list.append(li);
  }
  $('sample-card').hidden = false;
  $('lower').hidden = true;
  $('to-home').hidden = true;
  $('confirm').hidden = false;
  showMessage($('start-message'), '');
  $('sample-card').scrollIntoView({ block: 'nearest' });
}

for (const b of $('levels').querySelectorAll('button')) b.addEventListener('click', () => showSample(b.dataset.level));

$('beginner').addEventListener('click', async () => {
  const r = await post('/api/start', { level: 'beginner', unknown: [] });
  if (r.ok) window.location.assign('/');
});

$('confirm').addEventListener('click', async () => {
  const unknown = [...$('sample').querySelectorAll('input:checked')].map((b) => b.value);
  const r = await post('/api/start', { level, unknown });
  if (!r.ok) { showMessage($('start-message'), r.message); return; }
  showMessage($('start-message'), `Done: ${r.data.ground} words joined your ground${r.data.leaves ? `, ${r.data.leaves} are leaves to learn` : ''}.`, 'ok');
  $('confirm').hidden = true;
  $('to-home').hidden = false;
  if (r.data.suggestLower) {
    const below = LEVELS[LEVELS.indexOf(level) - 1];
    $('lower').textContent = `Many words were new — try ${below} instead`;
    $('lower').hidden = false;
    $('lower').onclick = () => showSample(below);
  }
});
