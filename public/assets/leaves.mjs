// Leaves (FR-412): drilled leaves (To remember) with play, meaning and delete; unmarked leaves with the
// To remember switch; add. To read is gone for Swedish (addendum 003, RQ-415).
import { getMe, post, showMessage } from './api.mjs';
import { showAccount } from './page.mjs';
import { speak, setRate } from './speech.mjs';

const $ = (id) => document.getElementById(id);
const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; };

async function load() {
  const res = await fetch('/api/leaves', { credentials: 'same-origin' });
  const data = res.ok ? await res.json() : { remember: [], unmarked: [] };
  for (const [key, list] of [['remember', $('leaves-remember')], ['unmarked', $('leaves-unmarked')]]) {
    list.replaceChildren();
    for (const item of data[key]) {
      const li = el('li', 'leaf-row');
      const head = el('p');
      head.append(el('strong', '', item.lemma), document.createTextNode(item.en ? ` — ${item.en}` : ''));
      const row = el('div', 'row small-row');
      const play = el('button', 'bar-button', 'Play');
      play.type = 'button';
      play.addEventListener('click', () => speak(item.lemma));
      row.append(play);
      if (key === 'unmarked') {
        const b = el('button', 'bar-button', 'To remember');
        b.type = 'button';
        b.addEventListener('click', async () => { await post('/api/marks', { lemma: item.lemma, kind: item.kind, remember: true }); await load(); });
        row.append(b);
      } else {
        if (item.due) head.append(el('span', 'text-state new', ' due'));
        const del = el('button', 'bar-button', 'Delete');
        del.type = 'button';
        del.addEventListener('click', async () => { await post('/api/leaf-delete', { lemma: item.lemma, kind: item.kind }); await load(); });
        row.append(del);
      }
      li.append(head, row);
      list.append(li);
    }
    if (!data[key].length) list.append(el('li', 'muted small', 'None.'));
  }
}

await showAccount();
await getMe();
const stagesRes = await fetch('/api/stages', { credentials: 'same-origin' });
if (stagesRes.ok) setRate((await stagesRes.json()).speechRate);
await load();
$('add-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.target;
  const text = form.elements.text.value.trim();
  const en = form.elements.en.value.trim();
  if (!text) return;
  // A word grove's word list doesn't have needs the learner's own meaning (FR-412, G-02 FR-207).
  const r = await post('/api/leaves', { text, kind: text.includes(' ') ? 'phrase' : 'word', ...(en ? { en } : {}) });
  if (!r.ok) {
    if (r.data.error === 'needs_meaning') { form.elements.en.hidden = false; form.elements.en.focus(); }
    showMessage($('leaves-message'), r.message);
    return;
  }
  form.reset();
  form.elements.en.hidden = true;
  showMessage($('leaves-message'), en ? 'Added with your meaning. Your AI will check it in your next texts.' : 'Added.', 'ok');
  await load();
});
