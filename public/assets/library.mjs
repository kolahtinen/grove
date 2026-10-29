// The Common library (G-09 FR-916, FR-917, FR-920; addendum 006): grove texts by topic, each with its
// level, kind and minutes, a filter that shows every level up to the chosen one (the learner's level
// first), + Add on each row (added without leaving the list) and the title opening the full text; each
// topic has Practise this topic. Sent by a session's offer (`?from=session`), the list shows only the
// kinds the session still needs (no Show all, B-23) and its topic, and the fill bars sit at the bottom.
// The common dictionary searches grove's whole word list as the learner types (from 2 letters, after a
// 0.3 s pause, older answers dropped), with each word's meaning and level, and adds a word as a leaf.
// All text via textContent.
import { getMe, post, showMessage } from './api.mjs';
import { showAccount } from './page.mjs';
import { hasSwedish } from './speech.mjs';
import { offer, kindsStillNeeded, refresh, session, onOfferChange } from './way.mjs';

const $ = (id) => document.getElementById(id);
const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; };

await showAccount();
await getMe();

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const KIND_NAMES = { reading: '📖 reading', listening: '🎧 listening' };
let library = { level: 'A1', texts: [] };

async function practiseTopic(topic, button) {
  button.disabled = true;
  const r = await post('/api/sessions', { kind: 'topic', tile: 'mix', skill: 'mix', minutes: 10, topic, voice: hasSwedish() });
  button.disabled = false;
  if (!r.ok) { showMessage($('library-status'), r.message); return; }
  window.location.assign('/session');
}

function row(x) {
  const li = el('li', 'library-item');
  const title = el('a', 'text-title', x.title);
  title.href = x.added ? `/text?id=${x.added}` : `/library/text?id=${encodeURIComponent(x.id)}${offer() ? '&from=session' : ''}`;
  li.append(el('span', 'level-badge', x.level), title, el('span', 'text-state', `${KIND_NAMES[x.kind]} · ${x.minutes} min`));
  if (x.added) {
    li.append(el('span', 'text-state added', 'Added ✓'));
    return li;
  }
  const add = el('button', 'bar-button', '+ Add');
  add.type = 'button';
  add.setAttribute('aria-label', `Add ${x.title} to your library`);
  add.addEventListener('click', async () => {
    add.disabled = true;
    const r = await post('/api/library/add', { id: x.id });
    if (!r.ok) { add.disabled = false; add.textContent = 'Try again'; return; }
    x.added = r.data.textId;
    await refresh();
    renderLibrary();
    $('library-status').textContent = `“${x.title}” is in your library.`;
  });
  li.append(add);
  return li;
}

function renderLibrary() {
  const upTo = LEVELS.indexOf($('level-filter').value);
  const kinds = kindsStillNeeded();
  const topic = offer() ? session.topic : null;
  const shown = library.texts.filter((x) => LEVELS.indexOf(x.level) <= upTo && (!kinds || kinds.includes(x.kind)) && (!topic || x.topic === topic));
  $('library-kinds').hidden = !kinds;
  if (kinds) $('library-kinds').textContent = `Showing ${kinds.join(' and ')} texts: what your session still needs.`;
  const box = $('library-texts');
  box.replaceChildren();
  const left = shown.filter((x) => !x.added).length;
  $('library-none').hidden = shown.length > 0 && !(kinds && left === 0);
  $('library-none').textContent = kinds && shown.length ? 'You have added every text of this kind up to this level. Get more from your AI on Add a text.' : 'No texts up to this level yet.';
  for (const name of [...new Set(shown.map((x) => x.topic))]) {
    const section = el('section', 'topic-group');
    const head = el('div', 'topic-head');
    head.append(el('h3', '', name));
    if (!kinds) {
      const practise = el('button', 'bar-button', 'Practise this topic');
      practise.type = 'button';
      practise.setAttribute('aria-label', `Practise ${name}`);
      practise.addEventListener('click', () => practiseTopic(name, practise));
      head.append(practise);
    }
    const ul = el('ul', 'text-list');
    for (const x of shown.filter((y) => y.topic === name)) ul.append(row(x));
    section.append(head, ul);
    box.append(section);
  }
}

const libraryRes = await fetch('/api/library', { credentials: 'same-origin' });
if (libraryRes.ok) library = await libraryRes.json();
$('level-filter').value = library.level;
$('level-filter').addEventListener('change', renderLibrary);
onOfferChange(() => renderLibrary());
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
