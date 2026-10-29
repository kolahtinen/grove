// The dictionary (FR-316, FR-317; research R9): four tabs, 100 entries at a time with More, a search
// on the server 0.3 s after typing stops (an older search's answer is dropped), and on every row but a
// name's the one-sided Pick up / Let it fall button with the row's state (G-09 FR-926, FR-927). All text
// via textContent.
import { getMe, showMessage } from './api.mjs';
import { showAccount } from './page.mjs';
import { wordButton, stateLabel } from './wordbutton.mjs';

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
  const row = document.createElement('div');
  row.className = 'drow';
  const main = document.createElement('div');
  main.className = 'dmain';
  const head = document.createElement('p');
  const lemma = document.createElement('strong');
  lemma.textContent = item.lemma;
  head.append(lemma);
  main.append(head);
  if (item.example) {
    const ex = document.createElement('p');
    ex.className = 'small muted example';
    ex.textContent = item.example;
    main.append(ex);
  }
  row.append(main);
  if (tab !== 'names') {
    let label = stateLabel(item.state);
    head.append(document.createTextNode(` — ${item.en || 'meaning missing'} `), label);
    const b = wordButton(item, (state) => { const next = stateLabel(state); label.replaceWith(next); label = next; });
    const act = document.createElement('div');
    act.className = 'dact';
    act.append(b);
    row.append(act);
  }
  li.append(row);
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
