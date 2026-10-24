// Leaves (FR-412): drilled leaves by mark with play, meaning and delete; unmarked leaves with switches; add.
import { getMe, post, showMessage } from './api.mjs';
import { showAccount } from './page.mjs';
import { speak, setRate } from './speech.mjs';

const $ = (id) => document.getElementById(id);
const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; };

async function load() {
  const res = await fetch('/api/leaves', { credentials: 'same-origin' });
  const data = res.ok ? await res.json() : { remember: [], read: [], unmarked: [] };
  for (const [key, list] of [['remember', $('leaves-remember')], ['read', $('leaves-read')], ['unmarked', $('leaves-unmarked')]]) {
    list.replaceChildren();
    for (const item of data[key]) {
      const li = el('li', 'leaf-row');
      const head = el('p');
      head.append(el('strong', '', item.lemma), document.createTextNode(` — ${item.en || 'meaning missing'}`));
      const row = el('div', 'row small-row');
      const play = el('button', 'bar-button', 'Play');
      play.type = 'button';
      play.addEventListener('click', () => speak(item.lemma));
      row.append(play);
      if (key === 'unmarked') {
        for (const [label, marks] of [['To read', { read: true, remember: false }], ['To remember', { read: false, remember: true }]]) {
          const b = el('button', 'bar-button', label);
          b.type = 'button';
          b.addEventListener('click', async () => { await post('/api/marks', { lemma: item.lemma, kind: item.kind, ...marks }); await load(); });
          row.append(b);
        }
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
  const text = event.target.elements.text.value.trim();
  if (!text) return;
  const r = await post('/api/leaves', { text, kind: text.includes(' ') ? 'phrase' : 'word' });
  if (!r.ok) { showMessage($('leaves-message'), r.message); return; }
  event.target.reset();
  showMessage($('leaves-message'), 'Added. Use “Get meanings” on Home for its meaning.', 'ok');
  await load();
});
