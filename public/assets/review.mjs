// Review and Master (FR-404…FR-407): a sentence shown with Play (addendum 003), or a
// gapped sentence with the English meaning (Master), or a recall card, in the shared frame (G-09 FR-932)
// inside the page. All text via textContent.
import { getMe, post } from './api.mjs';
import { showAccount } from './page.mjs';
import { startHeartbeat } from './heartbeat.mjs';
import { setRate } from './speech.mjs';
import { renderQuestion } from './questions.mjs';
import { boxFrame } from './frame.mjs';

const $ = (id) => document.getElementById(id);
const mode = new URLSearchParams(window.location.search).get('mode') === 'master' ? 'master' : 'review';
const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; };

await showAccount();
await getMe();
startHeartbeat();
const stagesRes = await fetch('/api/stages', { credentials: 'same-origin' });
if (stagesRes.ok) setRate((await stagesRes.json()).speechRate);
$('review-heading').textContent = mode === 'master' ? 'Master' : 'Review';
const res = await fetch(`/api/review?mode=${mode}`, { credentials: 'same-origin' });
const data = res.ok ? await res.json() : { items: [], nextDue: null };
let i = 0;
const box = $('review-box');

function finish() {
  box.replaceChildren(el('p', 'message ok', 'All done for now.'));
  if (data.nextDue) box.append(el('p', 'small muted', `Next leaf due ${new Date(data.nextDue).toLocaleString()}.`));
  $('review-progress').textContent = '';
}

function show() {
  if (i >= data.items.length) { finish(); return; }
  $('review-progress').textContent = `${i + 1} of ${data.items.length}`;
  renderQuestion(boxFrame(box, () => { i += 1; show(); }), data.items[i]);
}

show();
