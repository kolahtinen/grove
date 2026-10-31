// Your own text (G-03 FR-318, FR-321; the picked sketch's version A, RQ-462, question-pages/92): three
// steps on one page, "Step i of 3" with a bar. 1 Paste (title and text, Save); 2 at once the word check
// with the learner's AI (copy the request, paste the answer; "Meanings added for n new words", or for
// missing words "Your AI's answer left n words without a meaning." with the follow-up to copy); 3 Ready:
// its share of known words, the copyright view and Read. Under it the learner's own texts, a waiting one
// saying "Finish the word check" and opening its step 2 (`/own?id=N`). Copy prompt says "Copied to
// clipboard"; only when copying fails is the prompt shown, selected (G-02 FR-201). All text via textContent.
import { getMe, post, showMessage } from './api.mjs';
import { showAccount } from './page.mjs';
import { kindsStillNeeded } from './way.mjs';

const $ = (id) => document.getElementById(id);
const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; };
const STATES = { waiting: 'waiting for your AI’s word check', new: 'new', read: 'read' };

let textId = Number(new URLSearchParams(window.location.search).get('id')) || null;
let exchangeId = null;
let added = 0;

function step(i) {
  $('own-count').textContent = `Step ${i + 1} of 3`;
  $('own-steps').querySelectorAll('i').forEach((b, k) => { b.className = k < i ? 'done' : k === i ? 'now' : ''; });
  $('own-paste').hidden = i !== 0;
  $('own-check').hidden = i !== 1;
  $('own-ready').hidden = i !== 2;
  $('own-list-card').hidden = i !== 0;
}

async function listTexts() {
  const res = await fetch('/api/own-texts', { credentials: 'same-origin' });
  const { texts } = res.ok ? await res.json() : { texts: [] };
  $('own-none').hidden = texts.length > 0;
  $('own-list').replaceChildren(...texts.map((t) => {
    const li = el('li');
    const a = el('a');
    a.href = t.ready ? `/text?id=${t.id}` : `/own?id=${t.id}`;
    a.append(el('span', 'text-title', t.title), el('span', `text-state ${t.state}`, t.ready ? STATES[t.state] : 'Finish the word check'));
    li.append(a);
    return li;
  }));
}

// Step 2: the waiting piece's word check.
async function showCheck() {
  const r = await fetch(`/api/own-text?id=${textId}`, { credentials: 'same-origin' });
  if (!r.ok) { showMessage($('own-message'), 'This text was not found.'); step(0); return; }
  const own = await r.json();
  if (own.ready) { await showReady(); return; }
  step(1);
  document.title = `${own.title} · grove`;
  $('own-check-label').textContent = `Word check for “${own.title}”`;
  $('own-piece').textContent = own.of > 1 ? `Piece ${own.piece} of ${own.of}` : '';
  $('own-prompt').value = own.prompt;
  $('own-prompt').hidden = true;
  $('own-copied').hidden = true;
  exchangeId = own.exchangeId;
}

// Step 3: ready, with its share of known words and the AI's copyright view.
async function showReady() {
  step(2);
  const r = await fetch(`/api/reading?id=${textId}`, { credentials: 'same-origin' });
  const data = r.ok ? await r.json() : null;
  if (added) showMessage($('own-message'), `Meanings added for ${added} new word${added === 1 ? '' : 's'}.`, 'ok');
  if (!data) return;
  const harder = data.knownShare !== null && data.knownShare < data.targetShare;
  $('own-known').textContent = data.knownShare !== null ? `${data.knownShare}% known${harder ? ': harder than your usual texts' : ''}.` : '';
  $('own-copyright').textContent = data.copyright
    ? (data.copyright.view === 'free' ? 'Your AI thinks it is free to use.' : `Your AI thinks this ${data.copyright.view === 'copyrighted' ? 'is' : 'may be'} copyrighted${data.copyright.note ? `: ${data.copyright.note}` : '.'}`)
    : '';
  $('own-read').textContent = `Read “${data.title}”`;
  $('own-read').href = `/text?id=${textId}`;
}

await showAccount();
await getMe();
{
  // FR-920: from a session's offer needing only listening, say an own text won't fill that bar.
  const kinds = kindsStillNeeded();
  if (kinds && kinds.length === 1 && kinds[0] === 'listening') $('own-paste').append(el('p', 'small own-note', 'Your own text is a reading text, so it won’t fill the Listening bar.'));
}
await listTexts();
if (textId) await showCheck(); else step(0);

$('own-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.target;
  const title = form.elements.title.value.trim();
  const text = form.elements.text.value.trim();
  if (!title || !text) return;
  const result = await post('/api/own-text', { title, text });
  if (!result.ok) { showMessage($('own-message'), result.message); return; }
  form.reset();
  textId = result.data.id;
  history.replaceState(null, '', `/own?id=${textId}`);
  await showCheck();
  showMessage($('own-message'), 'Your text is saved. Now its word check with your AI.', 'ok');
});

$('own-copy').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText($('own-prompt').value);
    $('own-copied').textContent = 'Copied to clipboard';
    showMessage($('own-message'), 'Copied. Paste it into any AI chat and wait for the answer.', 'ok');
  } catch {
    $('own-prompt').hidden = false;
    $('own-prompt').focus();
    $('own-prompt').select();
    $('own-copied').textContent = 'Copying was blocked: the prompt is selected below, copy it by hand.';
  }
  $('own-copied').hidden = false;
});

$('own-add').addEventListener('click', async () => {
  const answer = $('own-answer').value.trim();
  if (!answer) { showMessage($('own-message'), 'Paste your AI’s answer first.'); return; }
  showMessage($('own-message'), 'Reading your AI’s answer… Checking that every new word has a meaning.', 'ok');
  const r = await post('/api/answer', { exchangeId, answer });
  if (!r.ok) { showMessage($('own-message'), r.message); return; }
  $('own-answer').value = '';
  const problems = $('own-problems');
  problems.replaceChildren(...(r.data.problems || []).map((p) => el('li', '', p)));
  problems.hidden = !(r.data.problems || []).length;
  if (r.data.result === 'needs_fix') {
    const missing = (r.data.problems || []).join(' ').match(/No meaning for: (.*)\./);
    const n = missing ? missing[1].split(', ').length : 0;
    showMessage($('own-message'), n ? `Your AI's answer left ${n} word${n === 1 ? '' : 's'} without a meaning. Copy the follow-up into the same chat and paste its answer.` : 'grove couldn’t use that answer. Copy the follow-up into the same chat and paste its answer.');
    await showCheck();
    return;
  }
  added += (answer.match(/"form"\s*:/g) || []).length;
  if (r.data.ready) { await showReady(); await listTexts(); return; }
  showMessage($('own-message'), `Piece ${r.data.piece} added. Now the next piece.`, 'ok');
  await showCheck();
});
