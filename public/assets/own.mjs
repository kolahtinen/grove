// My own texts (G-03 FR-318, FR-321; addendum 003): the paste form and the learner's own texts, waiting
// for their AI round or ready. A saved text opens on the reading page for its AI round. All text via textContent.
import { getMe, post, showMessage } from './api.mjs';
import { showAccount } from './page.mjs';

const $ = (id) => document.getElementById(id);
const STATES = { waiting: 'waiting for your AI', new: 'new', read: 'read' };

await showAccount();
await getMe();

const res = await fetch('/api/own-texts', { credentials: 'same-origin' });
const { texts } = res.ok ? await res.json() : { texts: [] };
$('own-none').hidden = texts.length > 0;
for (const t of texts) {
  const li = document.createElement('li');
  const a = document.createElement('a');
  a.href = `/text?id=${t.id}`;
  const title = document.createElement('span');
  title.className = 'text-title';
  title.textContent = t.title;
  const state = document.createElement('span');
  state.className = `text-state ${t.state}`;
  state.textContent = STATES[t.state];
  a.append(title, state);
  li.append(a);
  $('own-list').append(li);
}

$('own-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.target;
  const title = form.elements.title.value.trim();
  const text = form.elements.text.value.trim();
  if (!title || !text) return;
  const result = await post('/api/own-text', { title, text });
  if (!result.ok) { showMessage($('own-message'), result.message); return; }
  form.reset();
  window.location.assign(`/text?id=${result.data.id}`);
});
