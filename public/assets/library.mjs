// The Common library (G-09 FR-916, FR-917): until its shared texts exist it says they are coming; the
// common dictionary searches grove's whole word list as the learner types (from 2 letters, after a
// 0.3 s pause, older answers dropped), with each word's meaning and level, and adds a word as a leaf.
// All text via textContent.
import { getMe, post } from './api.mjs';
import { showAccount } from './page.mjs';

const $ = (id) => document.getElementById(id);
const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; };

await showAccount();
await getMe();

let asked = 0;
let timer = null;

function stateLine(r) {
  if (r.state === 'leaf') return el('span', 'text-state', 'a leaf');
  if (r.state === 'ground') return el('span', 'text-state', 'in your ground');
  const b = el('button', 'bar-button', 'Add as a leaf');
  b.type = 'button';
  b.setAttribute('aria-label', `Add ${r.lemma} as a leaf`);
  b.addEventListener('click', async () => {
    b.disabled = true;
    const result = await post('/api/leaves', { text: r.lemma, kind: 'word', en: r.en.slice(0, 200) });
    b.replaceWith(el('span', 'text-state', result.ok ? 'added as a leaf' : 'couldn’t add it'));
  });
  return b;
}

function show(results, q) {
  const list = $('lexicon-results');
  list.replaceChildren();
  $('lexicon-status').textContent = results.length ? `${results.length === 50 ? 'The first 50' : results.length} for “${q}”` : `No word in the list matches “${q}”.`;
  for (const r of results) {
    const li = el('li', 'lexicon-item');
    const word = el('span', 'text-title', r.lemma);
    const meta = el('span', 'lexicon-meta');
    if (r.level) meta.append(el('span', 'level-badge', r.level));
    meta.append(stateLine(r));
    li.append(word, el('span', 'lexicon-en', r.en), meta);
    list.append(li);
  }
}

$('lexicon-search').addEventListener('input', () => {
  clearTimeout(timer);
  const q = $('lexicon-search').value.trim();
  if (q.length < 2) { $('lexicon-results').replaceChildren(); $('lexicon-status').textContent = ''; return; }
  timer = setTimeout(async () => {
    const mine = ++asked;
    const res = await fetch(`/api/common-dictionary?q=${encodeURIComponent(q)}`, { credentials: 'same-origin' });
    if (mine !== asked || !res.ok) return;
    show((await res.json()).results, q);
  }, 300);
});
