// Review and Master (FR-404…FR-407): a sentence shown with Play (addendum 003), or a
// gapped sentence with the English meaning (Master), or a recall card. All text via textContent.
import { getMe, post } from './api.mjs';
import { showAccount } from './page.mjs';
import { startHeartbeat } from './heartbeat.mjs';
import { speak, setRate } from './speech.mjs';

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

async function send(item, right) {
  const r = await post('/api/review', { lemma: item.lemma, kind: item.kind, mode: item.mode, right });
  return r.ok ? r.data : null;
}

function nextButton() {
  const b = el('button', 'main', 'Next');
  b.type = 'button';
  b.addEventListener('click', () => { i += 1; show(); });
  return b;
}

function show() {
  if (i >= data.items.length) { finish(); return; }
  const item = data.items[i];
  $('review-progress').textContent = `${i + 1} of ${data.items.length}`;
  box.replaceChildren();
  if (item.mode === 'recall') {
    box.append(el('p', 'big-word', item.lemma), el('p', '', 'Do you remember what it means?'));
    const reveal = el('button', 'main', 'Show');
    reveal.type = 'button';
    reveal.addEventListener('click', () => {
      reveal.remove();
      box.append(el('p', 'passage', item.meaning || 'meaning missing'));
      const row = el('div', 'row');
      for (const [label, right] of [['I knew it', true], ['I didn’t', false]]) {
        const b = el('button', right ? 'main' : '', label);
        b.type = 'button';
        b.addEventListener('click', async () => { await send(item, right); i += 1; show(); });
        row.append(b);
      }
      box.append(row);
    });
    box.append(reveal);
    return;
  }
  // The sentence is shown, with Play to hear it (FR-406; addendum 003, question-pages/73, 2).
  const sentence = el('p', 'passage review-sentence', item.sentence);
  box.append(sentence);
  if (item.mode !== 'master') {
    const play = el('button', 'bar-button', 'Play');
    play.type = 'button';
    play.addEventListener('click', () => speak(item.sentence));
    box.append(play);
  }
  const fieldset = el('fieldset');
  fieldset.append(el('legend', '', item.mode === 'master' ? `Which word means “${item.meaning}” here?` : `What does “${item.word}” mean here?`));
  const feedback = el('p', 'feedback');
  item.options.forEach((option, index) => {
    const b = el('button', 'option', option);
    b.type = 'button';
    b.addEventListener('click', async () => {
      fieldset.querySelectorAll('button.option').forEach((x, k) => { x.disabled = true; x.classList.toggle('right', k === item.right); x.classList.toggle('wrong', k === index && index !== item.right); });
      sentence.hidden = false;
      const result = await send(item, index === item.right);
      feedback.textContent = (index === item.right ? 'Right!' : 'Not quite — the right answer is marked.') + (result?.fell ? ' It fell to your ground.' : '');
      box.append(nextButton());
    });
    fieldset.append(b);
  });
  fieldset.append(feedback);
  box.append(fieldset);
}

show();
