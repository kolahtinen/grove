// Settings (G-09 FR-910): speech speed with its note and the voice help (G-05 FR-502, FR-503), Speak words
// (G-03 FR-305) and Start the starting level again (G-06). Saved on the server for the learner.
import { getMe, post, showMessage } from './api.mjs';
import { showAccount } from './page.mjs';

const $ = (id) => document.getElementById(id);

await showAccount();
await getMe();
const [settings, stages] = await Promise.all([
  fetch('/api/settings', { credentials: 'same-origin' }).then((r) => (r.ok ? r.json() : { speakWords: true, speechRate: 1 })),
  fetch('/api/stages', { credentials: 'same-origin' }).then((r) => (r.ok ? r.json() : {})),
]);
const show = (rate) => { $('speed-value').textContent = `${rate.toFixed(1)}×`; };
$('speed').value = String(settings.speechRate);
show(settings.speechRate);
$('speed').addEventListener('input', () => show(Number($('speed').value)));
$('speed').addEventListener('change', async () => {
  const rate = Math.round(Number($('speed').value) * 10) / 10;
  const r = await post('/api/settings', { speechRate: rate });
  showMessage($('settings-message'), r.ok ? 'Saved.' : r.message, r.ok ? 'ok' : 'bad');
});
const speak = $('speak-words');
speak.setAttribute('aria-pressed', String(settings.speakWords));
speak.addEventListener('click', async () => {
  const on = speak.getAttribute('aria-pressed') !== 'true';
  const r = await post('/api/settings', { speakWords: on });
  if (!r.ok) { showMessage($('settings-message'), r.message); return; }
  speak.setAttribute('aria-pressed', String(on));
  showMessage($('settings-message'), 'Saved.', 'ok');
});
$('restart').hidden = !stages.canRestart;
$('no-restart').hidden = !!stages.canRestart;
