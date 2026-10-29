// The Common library (G-09 FR-916, FR-917): grove texts by topic, each with its level, a filter that
// shows every level up to the chosen one (the learner's level first), and Add to your library / Open;
// the common dictionary searches grove's whole word list as the learner types (from 2 letters, after a
// 0.3 s pause, older answers dropped), with each word's meaning and level, and adds a word as a leaf.
// All text via textContent.
import { getMe, post } from './api.mjs';
import { showAccount } from './page.mjs';

const $ = (id) => document.getElementById(id);
const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; };

await showAccount();
await getMe();

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
let library = { level: 'A1', texts: [] };

function renderLibrary() {
  const upTo = LEVELS.indexOf($('level-filter').value);
  const shown = library.texts.filter((x) => LEVELS.indexOf(x.level) <= upTo);
  const box = $('library-texts');
  box.replaceChildren();
  $('library-none').hidden = shown.length > 0;
  for (const topic of [...new Set(shown.map((x) => x.topic))]) {
    const section = el('section', 'topic-group');
    section.append(el('h3', '', topic));
    const ul = el('ul', 'text-list');
    for (const x of shown.filter((y) => y.topic === topic)) {
      const li = el('li', 'library-item');
      li.append(el('span', 'level-badge', x.level), el('span', 'text-title', x.title), el('span', 'text-state', x.kind));
      if (x.added) {
        const open = el('a', 'bar-button', 'Open');
        open.href = `/text?id=${x.added}`;
        open.setAttribute('aria-label', `Open ${x.title}`);
        li.append(open);
      } else {
        const add = el('button', 'bar-button', 'Add to your library');
        add.type = 'button';
        add.setAttribute('aria-label', `Add ${x.title} to your library`);
        add.addEventListener('click', async () => {
          add.disabled = true;
          const r = await post('/api/library/add', { id: x.id });
          if (!r.ok) { add.disabled = false; add.textContent = 'Try again'; return; }
          x.added = r.data.textId;
          renderLibrary();
          $('library-status').textContent = `“${x.title}” is in your library.`;
        });
        li.append(add);
      }
      ul.append(li);
    }
    section.append(ul);
    box.append(section);
  }
}

const libraryRes = await fetch('/api/library', { credentials: 'same-origin' });
if (libraryRes.ok) library = await libraryRes.json();
$('level-filter').value = library.level;
$('level-filter').addEventListener('change', renderLibrary);
renderLibrary();

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
