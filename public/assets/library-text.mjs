// A grove text from the common library in full, before it is added (G-09 FR-916, addendum 006): its
// title, level, topic, kind and minutes, its Swedish lines, and + Add (or Added ✓ with Open your copy).
// ‹ Common library at the top (FR-922); sent by a session's offer, ‹ Back to your session and the fill
// bars (FR-920). All text via textContent.
import { getMe, post, showMessage } from './api.mjs';
import { showAccount } from './page.mjs';
import { refresh } from './way.mjs';

const $ = (id) => document.getElementById(id);
const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; };

await showAccount();
await getMe();

const id = new URLSearchParams(window.location.search).get('id') ?? '';
const res = await fetch(`/api/library/text?id=${encodeURIComponent(id)}`, { credentials: 'same-origin' });
const body = await res.json().catch(() => ({}));

function showAdded(textId) {
  $('lt-add').hidden = true;
  $('lt-added').hidden = false;
  $('lt-open').hidden = false;
  $('lt-open').href = `/text?id=${textId}`;
}

if (!res.ok) {
  $('lt-title').textContent = 'Text not found';
  showMessage($('lt-message'), body.message ?? 'There is no such text in the library.');
} else {
  document.title = `${body.title} · grove`;
  $('lt-title').textContent = body.title;
  $('lt-meta').textContent = `${body.level} · ${body.topic} · ${body.kind === 'listening' ? '🎧 listening' : '📖 reading'} · ${body.minutes} min`;
  $('lt-lines').replaceChildren(el('p', '', body.lines.map((l) => l.sv).join(' ')));
  if (body.added) showAdded(body.added);
  else {
    $('lt-add').hidden = false;
    $('lt-add').addEventListener('click', async () => {
      $('lt-add').disabled = true;
      const r = await post('/api/library/add', { id });
      if (!r.ok) { $('lt-add').disabled = false; showMessage($('lt-message'), r.message); return; }
      showAdded(r.data.textId);
      showMessage($('lt-message'), `“${body.title}” is in your library.`, 'ok');
      await refresh();
    });
  }
}
