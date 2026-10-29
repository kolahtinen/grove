// The starting level (G-06 FR-603…FR-607, addendum 006; question-pages/82): first Pick my level or Assess
// my level. Pick lists the levels (each with a line) and beginner; a tap highlights one, Choose applies it,
// Not sure, assess checks the highlighted level. Assess asks for a guess, then the 30-word check at that
// level: tick unknown words and confirm. Each step has ‹ Back to the one before (G-09 FR-922); the top
// link goes to Settings, or Home before a level is chosen.
import { getMe, post, showMessage } from './api.mjs';
import { showAccount } from './page.mjs';
import { showWay } from './way.mjs';

const $ = (id) => document.getElementById(id);
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const STEPS = ['way', 'pick', 'guess', 'sample-card'];
let highlighted = null;
let level = null;
let previous = 'way';

await showAccount();
await getMe();
const stagesRes = await fetch('/api/stages', { credentials: 'same-origin' });
if (stagesRes.ok && (await stagesRes.json()).needsStart) await showWay(['/', 'Home']);

function step(id) {
  for (const s of STEPS) $(s).hidden = s !== id;
  $(id).querySelector('h2')?.setAttribute('tabindex', '-1');
  $(id).querySelector('h2')?.focus();
}

async function showSample(chosen, from) {
  level = chosen;
  previous = from;
  const res = await fetch(`/api/start/sample?level=${chosen}`, { credentials: 'same-origin' });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) { showMessage($('start-unavailable'), body.message || 'The starting level isn’t available right now.'); step('way'); return; }
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
  $('lower').hidden = true;
  $('to-home').hidden = true;
  $('confirm').hidden = false;
  showMessage($('start-message'), '');
  step('sample-card');
}

$('way-pick').addEventListener('click', () => step('pick'));
$('way-assess').addEventListener('click', () => { previous = 'way'; step('guess'); });
$('pick-back').addEventListener('click', () => step('way'));
$('guess-back').addEventListener('click', () => step(previous === 'pick' ? 'pick' : 'way'));
$('sample-back').addEventListener('click', () => step(previous));

// Pick: a tap highlights a level, not applying it.
for (const b of $('levels').querySelectorAll('button')) {
  b.addEventListener('click', () => {
    highlighted = b.dataset.level;
    for (const other of $('levels').querySelectorAll('button')) other.setAttribute('aria-pressed', String(other === b));
    $('choose').disabled = false;
    showMessage($('use-message'), '');
  });
}
$('choose').addEventListener('click', async () => {
  const r = await post('/api/start', { level: highlighted, unknown: [] });
  if (!r.ok) { showMessage($('use-message'), r.message); return; }
  if (highlighted !== 'beginner') showMessage($('use-message'), `Done: your level is ${highlighted}; ${r.data.ground} words joined your ground.`, 'ok');
  window.location.assign('/');
});
$('not-sure').addEventListener('click', () => {
  if (highlighted && highlighted !== 'beginner') { showSample(highlighted, 'pick'); return; }
  previous = 'pick';
  step('guess');
});

// Assess: one tap on the guessed level starts the check.
for (const b of $('guess-levels').querySelectorAll('button')) {
  b.addEventListener('click', () => showSample(b.dataset.level, 'guess'));
}

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
    $('lower').onclick = () => showSample(below, previous);
  }
});
