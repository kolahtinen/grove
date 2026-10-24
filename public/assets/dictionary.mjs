// The dictionary (FR-316, FR-317): words, phrases and patterns met, with meaning, status and an
// example; names apart; a search box. All text via textContent.
import { getMe } from './api.mjs';
import { showAccount } from './page.mjs';

const $ = (id) => document.getElementById(id);
const STATE = { leaf: 'leaf', ground: 'ground' };

await showAccount();
await getMe();
const res = await fetch('/api/dictionary', { credentials: 'same-origin' });
const data = res.ok ? await res.json() : { items: [], names: [] };

function render(filter = '') {
  const f = filter.trim().toLowerCase();
  const lists = { word: $('dict-words'), phrase: $('dict-phrases'), pattern: $('dict-patterns') };
  for (const ul of Object.values(lists)) ul.replaceChildren();
  let shown = 0;
  for (const item of data.items) {
    if (f && !item.lemma.includes(f) && !(item.en || '').toLowerCase().includes(f)) continue;
    shown += 1;
    const li = document.createElement('li');
    const head = document.createElement('p');
    const lemma = document.createElement('strong');
    lemma.textContent = item.lemma;
    const state = document.createElement('span');
    state.className = `text-state ${item.state}`;
    state.textContent = STATE[item.state];
    head.append(lemma, document.createTextNode(` — ${item.en || 'meaning missing'} `), state);
    li.append(head);
    if (item.example) {
      const ex = document.createElement('p');
      ex.className = 'small muted example';
      ex.textContent = item.example;
      li.append(ex);
    }
    lists[item.kind].append(li);
  }
  $('count').textContent = `${shown} of ${data.items.length}`;
  $('names').replaceChildren(...data.names.map((n) => { const li = document.createElement('li'); li.textContent = n; return li; }));
}

render();
$('search').addEventListener('input', (e) => render(e.target.value));
