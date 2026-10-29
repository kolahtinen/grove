// Your library (G-09 FR-915, FR-907): the learner's texts by topic (unread first, own texts under "My
// own texts"), each topic with Practise this topic; Add a text, your dictionary and your leaves. Everything is set with textContent.
import { getMe, post, showMessage } from './api.mjs';
import { showAccount } from './page.mjs';
import { hasSwedish } from './speech.mjs';

const $ = (id) => document.getElementById(id);

function textItem(t) {
  const li = document.createElement('li');
  const a = document.createElement('a');
  a.href = `/text?id=${t.id}`;
  const title = document.createElement('span');
  title.className = 'text-title';
  title.textContent = t.title;
  const state = document.createElement('span');
  state.className = `text-state ${t.state}`;
  state.textContent = t.own ? `own · ${t.ready ? t.state : 'waiting for your AI'}` : `${t.kind} · ${t.state}`;
  a.append(title, state);
  // G-09 FR-916: a text from the common library is marked "grove text" (never Beta).
  if (t.grove) {
    const mark = document.createElement('span');
    mark.className = 'grove-mark';
    mark.textContent = 'grove text';
    a.append(mark);
  }
  if (t.beta) {
    const badge = document.createElement('span');
    badge.className = 'beta';
    badge.textContent = 'Beta';
    a.append(badge);
  }
  li.append(a);
  return li;
}

// G-09 FR-915, FR-907 (addendum 006): each topic has Practise this topic, a 10-minute Mix on it; a
// session short of new texts opens with its offer.
function startRow(topic, label) {
  const row = document.createElement('div');
  row.className = 'row topic-start';
  const go = document.createElement('button');
  go.type = 'button';
  go.className = 'bar-button';
  go.textContent = 'Practise this topic';
  go.setAttribute('aria-label', `Practise ${label}`);
  const message = document.createElement('p');
  message.className = 'message';
  message.setAttribute('role', 'status');
  message.hidden = true;
  go.addEventListener('click', async () => {
    const result = await post('/api/sessions', { kind: 'topic', tile: 'mix', skill: 'mix', minutes: 10, topic, voice: hasSwedish() });
    if (!result.ok) { showMessage(message, result.message); return; }
    window.location.assign('/session');
  });
  row.append(go);
  return [row, message];
}

function renderTopics(texts) {
  const box = $('texts');
  box.replaceChildren();
  $('no-texts').hidden = texts.length > 0;
  const byId = new Map(texts.map((t) => [t.id, t]));
  const placed = new Set();
  for (const group of topics) {
    const items = group.texts.map((x) => byId.get(x.id)).filter(Boolean);
    if (!items.length) continue;
    const section = document.createElement('section');
    section.className = 'topic-group';
    const h = document.createElement('h3');
    h.textContent = group.label;
    section.append(h);
    if (group.topic) section.append(...startRow(group.topic, group.label));
    const ul = document.createElement('ul');
    ul.className = 'text-list';
    for (const t of items) { ul.append(textItem(t)); placed.add(t.id); }
    section.append(ul);
    box.append(section);
  }
  const rest = texts.filter((t) => !placed.has(t.id));
  if (rest.length) {
    const ul = document.createElement('ul');
    ul.className = 'text-list';
    for (const t of rest) ul.append(textItem(t));
    box.append(ul);
  }
}

let topics = [];

async function load() {
  const topicsRes = await fetch('/api/topics', { credentials: 'same-origin' });
  if (topicsRes.ok) topics = (await topicsRes.json()).topics;
  const res = await fetch('/api/home', { credentials: 'same-origin' });
  if (!res.ok) return;
  const home = await res.json();
  // After a finished package, suggest a text of the learner's own (G-03 FR-321; addendum 003).
  const pkg = home.package;
  $('own-suggest').hidden = !(pkg && pkg.partsAccepted >= pkg.of);
  renderTopics(home.texts);
}

await showAccount();
await getMe();
await load();
