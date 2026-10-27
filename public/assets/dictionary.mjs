// The dictionary (FR-316, FR-317; research R9): four tabs, 100 entries at a time with More, a search
// on the server 0.3 s after typing stops (an older search's answer is dropped), and Pick up on ground
// words (G-04 FR-411). All text via textContent.
import { getMe, post, showMessage } from './api.mjs';
import { showAccount } from './page.mjs';

const $ = (id) => document.getElementById(id);
const PAUSE = 300;
const tabs = [...document.querySelectorAll('#dict-tabs [role="tab"]')];
const list = $('dict-list');
const more = $('more');
const message = $('dict-message');
const number = (n) => n.toLocaleString('en');

let tab = 'words';
let q = '';
let shown = 0;
let asked = 0;
let timer = null;

await showAccount();
await getMe();

function entry(item) {
  const li = document.createElement('li');
  const head = document.createElement('p');
  const lemma = document.createElement('strong');
  lemma.textContent = item.lemma;
  head.append(lemma);
  if (tab !== 'names') {
    const state = document.createElement('span');
    state.className = `text-state ${item.state}`;
    state.textContent = item.state;
    head.append(document.createTextNode(` — ${item.en || 'meaning missing'} `), state);
    if (item.state === 'ground') {
      const pick = document.createElement('button');
      pick.type = 'button';
      pick.className = 'bar-button';
      pick.textContent = 'Pick up';
      pick.addEventListener('click', async () => {
        pick.disabled = true;
        const r = await post('/api/pick-up', { lemma: item.lemma, kind: item.kind });
        if (!r.ok) { pick.disabled = false; showMessage(message, r.message); return; }
        state.className = 'text-state leaf';
        state.textContent = 'leaf';
        pick.remove();
      });
      head.append(document.createTextNode(' '), pick);
    }
  }
  li.append(head);
  if (item.example) {
    const ex = document.createElement('p');
    ex.className = 'small muted example';
    ex.textContent = item.example;
    li.append(ex);
  }
  return li;
}

// Loads a page: offset 0 replaces the list, a later offset adds to it.
async function load(offset = 0) {
  asked += 1;
  const mine = asked;
  const params = new URLSearchParams({ tab, q, offset: String(offset) });
  let data;
  try {
    const res = await fetch(`/api/dictionary?${params}`, { credentials: 'same-origin' });
    data = res.ok ? await res.json() : null;
  } catch {
    data = null;
  }
  if (mine !== asked) return; // a newer search was sent
  if (!data) { showMessage(message, 'The dictionary can’t be loaded right now. Please try again.'); return; }
  showMessage(message, '');
  if (offset === 0) { list.replaceChildren(); shown = 0; }
  list.append(...data.items.map(entry));
  shown += data.items.length;
  $('count').textContent = `${number(shown)} of ${number(data.total)}`;
  more.hidden = shown >= data.total;
  for (const t of tabs) t.querySelector('.tag').textContent = number(data.counts[t.dataset.tab]);
}

for (const t of tabs) {
  t.addEventListener('click', () => {
    tab = t.dataset.tab;
    for (const other of tabs) other.setAttribute('aria-selected', String(other === t));
    $('dict-panel').setAttribute('aria-labelledby', t.id);
    $('names-note').hidden = tab !== 'names';
    load();
  });
}
more.addEventListener('click', () => load(shown));
$('search').addEventListener('input', (e) => {
  clearTimeout(timer);
  timer = setTimeout(() => { q = e.target.value.trim().slice(0, 80); load(); }, PAUSE);
});

load();
