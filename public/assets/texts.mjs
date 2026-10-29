// Texts (G-09 FR-909; moved unchanged from Home, research R11): the topic, the package card with the
// prompt steps (G-02 FR-201, FR-203, FR-206, FR-223: setup first, each with Copy prompt), the paste box,
// I'm in a new chat, the whole-package choice and the problems, own texts, and the texts list (FR-219).
// Everything is set with textContent.
import { getMe, post, showMessage } from './api.mjs';
import { showAccount } from './page.mjs';
import { hasSwedish } from './speech.mjs';

const MAX_ANSWER = 80000;
const $ = (id) => document.getElementById(id);
let waiting = null;
let plan = { family: null, product: null, tactic: 'steps', recommended: null, families: [] };
let shownTactic = 'steps';

// FR-223: the learner's AI and version, and the three tactics as tabs.
const TACTIC_NAMES = { steps: 'Step by step', long: 'One long prompt', whole: 'Whole package' };
const TACTIC_TEXT = {
  steps: 'grove sends the setup once, in a few messages your AI answers with "OK", then asks for one part at a time in the same chat. Short prompts, so it suits free AIs.',
  long: 'Every prompt carries the rules and your known words itself, one part at a time. Longer prompts, but your AI never has to remember the setup.',
  whole: 'grove sends the setup once, then asks for all three parts in one go. Long answers, so it suits paid versions.',
};

function fillProducts(family) {
  const select = $('plan-product');
  select.replaceChildren();
  select.disabled = !family;
  for (const p of family?.products ?? []) {
    const o = document.createElement('option');
    o.value = p.id;
    o.textContent = p.name;
    select.append(o);
  }
}

function showTab(tactic) {
  shownTactic = tactic;
  for (const tab of $('tactic-tabs').children) tab.setAttribute('aria-selected', String(tab.dataset.tactic === tactic));
  $('tactic-text').textContent = TACTIC_TEXT[tactic];
  $('tactic-reason').textContent = tactic === plan.recommended && plan.reason ? plan.reason : '';
  $('tactic-use').hidden = tactic === plan.tactic;
}

function renderPlan(p) {
  plan = { ...plan, ...p };
  const family = $('plan-family');
  if (family.options.length <= 1) {
    for (const f of plan.families) {
      const o = document.createElement('option');
      o.value = f.id;
      o.textContent = f.name;
      family.append(o);
    }
  }
  family.value = plan.family ?? '';
  fillProducts(plan.families.find((f) => f.id === plan.family));
  if (plan.product) $('plan-product').value = plan.product;
  $('tactics').hidden = !plan.family;
  const tabs = $('tactic-tabs');
  tabs.replaceChildren();
  for (const t of ['steps', 'long', 'whole']) {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('role', 'tab');
    b.dataset.tactic = t;
    b.textContent = TACTIC_NAMES[t];
    const tags = [t === plan.recommended && 'Recommended', t === plan.tactic && 'In use'].filter(Boolean);
    if (tags.length) {
      const tag = document.createElement('span');
      tag.className = 'tag';
      tag.textContent = tags.join(' · ');
      b.append(tag);
    }
    b.addEventListener('click', () => showTab(t));
    tabs.append(b);
  }
  showTab(plan.recommended ?? plan.tactic);
}

async function savePlan(tactic) {
  const body = { family: $('plan-family').value, product: $('plan-product').value };
  if (tactic) body.tactic = tactic;
  const result = await post('/api/plan', body);
  if (!result.ok) { showMessage($('plan-message'), result.message); return; }
  showMessage($('plan-message'), `grove will ask your AI: ${TACTIC_NAMES[result.data.tactic].toLowerCase()}${result.data.tactic === 'whole' ? ', from your next package on' : ''}.`, 'ok');
  await load();
}

// Copy prompt: "Copied to clipboard"; only when copying fails is the prompt shown, selected (FR-201).
async function copyStep(text, item) {
  const note = item.querySelector('.copied');
  const box = item.querySelector('textarea');
  try {
    await navigator.clipboard.writeText(text);
    box.hidden = true;
    note.textContent = 'Copied to clipboard';
  } catch {
    box.hidden = false;
    box.focus();
    box.select();
    note.textContent = 'Copying was blocked: the prompt is selected below, copy it by hand.';
  }
  note.hidden = false;
}

function stepItem(label, text) {
  const li = document.createElement('li');
  li.className = 'prompt-step';
  const head = document.createElement('span');
  head.className = 'step-label';
  head.textContent = label;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'copy';
  button.textContent = 'Copy prompt';
  const note = document.createElement('span');
  note.className = 'copied';
  note.setAttribute('role', 'status');
  note.hidden = true;
  const box = document.createElement('textarea');
  box.readOnly = true;
  box.rows = 6;
  box.value = text;
  box.hidden = true;
  box.setAttribute('aria-label', label);
  button.addEventListener('click', () => copyStep(text, li));
  li.append(head, button, note, box);
  return li;
}

const HEADINGS = { part: 'Prompt', package: 'Prompt for the whole package', redo: 'Ask again for one text', fix: 'Fix-it prompt', meanings_fix: 'Meanings prompt' };

function renderSteps(w) {
  const list = $('prompt-steps');
  list.replaceChildren();
  const total = w.steps.length + 1;
  w.steps.forEach((step, i) => list.append(stepItem(`${i + 1} of ${total}: setup (your AI replies "OK")`, step)));
  list.append(stepItem(total > 1 ? `${total} of ${total}: the request; paste its answer below` : 'Copy this into the same chat; paste its answer below', w.prompt));
  $('new-chat-note').hidden = !(w.steps.length || w.newChatSuggested);
  $('new-chat-note').textContent = w.steps.length
    ? 'Open a new chat in your AI first, then send these prompts in order.'
    : 'Your AI may have lost track of the setup. If so, tap “I\'m in a new chat”.';
}

function render(home) {
  $('topic-text').textContent = home.topic;
  const pkg = home.package;
  $('progress').textContent = pkg ? `Package: ${pkg.partsAccepted} of ${pkg.of} parts in` : 'No package yet.';
  waiting = home.waiting;
  $('prompt-area').hidden = !waiting;
  if (waiting) {
    const heading = HEADINGS[waiting.kind] ?? 'Prompt';
    $('prompt-heading').textContent = waiting.kind === 'package' ? heading : `${heading} (part ${waiting.part} of ${waiting.of})`;
    renderSteps(waiting);
  }
  renderPlan(home.plan);
  const offer = home.offer && home.offer !== home.plan.tactic ? home.offer : null;
  $('offer').hidden = !offer;
  if (offer) {
    $('offer').replaceChildren(document.createTextNode(`Texts keep failing. ${offer === 'long' ? 'Your AI may keep to your words better with everything in one long prompt.' : 'Your AI may do better with the setup sent once, step by step.'} `));
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'bar-button';
    b.textContent = `Try ${TACTIC_NAMES[offer].toLowerCase()}`;
    b.addEventListener('click', () => savePlan(offer));
    $('offer').append(b);
  }
  const getButton = $('get-texts');
  getButton.hidden = !!waiting;
  getButton.textContent = pkg && pkg.partsAccepted > 0 && pkg.partsAccepted < pkg.of ? 'Next part' : 'Get texts';
  $('new-package').hidden = !pkg;
  // After a finished package, Home suggests My own texts (G-03 FR-321; addendum 003).
  $('own-suggest').hidden = !(pkg && pkg.partsAccepted >= pkg.of);

  renderTopics(home.texts);
}

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
  if (t.beta) {
    const badge = document.createElement('span');
    badge.className = 'beta';
    badge.textContent = 'Beta';
    a.append(badge);
  }
  li.append(a);
  return li;
}

// G-09 FR-909, FR-907: the texts by topic (unread first, own texts under "My own texts"), each topic
// with Start a session for a chosen length.
function startRow(topic, label) {
  const row = document.createElement('div');
  row.className = 'row topic-start';
  const select = document.createElement('select');
  select.setAttribute('aria-label', `Session length for ${label}`);
  for (const m of [5, 10, 20]) {
    const o = document.createElement('option');
    o.value = String(m);
    o.textContent = `${m} min`;
    select.append(o);
  }
  select.value = '10';
  const go = document.createElement('button');
  go.type = 'button';
  go.textContent = 'Start a session';
  go.setAttribute('aria-label', `Start a session on ${label}`);
  const message = document.createElement('p');
  message.className = 'message';
  message.setAttribute('role', 'status');
  message.hidden = true;
  go.addEventListener('click', async () => {
    const result = await post('/api/sessions', { kind: 'topic', topic, minutes: Number(select.value), voice: hasSwedish() });
    if (!result.ok) { showMessage(message, result.message); return; }
    window.location.assign('/session');
  });
  row.append(select, go);
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
  if (res.ok) render(await res.json());
}

function showProblems(problems) {
  const ul = $('problems');
  ul.replaceChildren();
  for (const p of problems || []) {
    const li = document.createElement('li');
    li.textContent = p;
    ul.append(li);
  }
  ul.hidden = !problems || problems.length === 0;
}

async function requestPrompt(action) {
  showProblems([]);
  const result = await post('/api/prompt', { action });
  if (!result.ok) {
    showMessage($('package-message'), result.message);
    return;
  }
  showMessage($('package-message'), '');
  await load();
  $('prompt-area').scrollIntoView({ block: 'nearest' });
}

await showAccount();
await getMe();
await load();

$('topic-edit').addEventListener('click', () => {
  $('topic-form').hidden = false;
  $('topic-form').elements.topic.value = $('topic-text').textContent;
});
$('topic-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const topic = event.target.elements.topic.value.trim();
  if (!topic) return;
  const result = await post('/api/topic', { topic });
  if (result.ok) {
    event.target.hidden = true;
    await load();
  }
});

$('get-texts').addEventListener('click', () => {
  // FR-223: grove asks for the learner's AI before the first texts.
  if (!plan.family) {
    showMessage($('plan-message'), 'First choose your AI and its version, so grove can ask it the best way.');
    $('plan-family').focus();
    return;
  }
  requestPrompt('next');
});
$('new-package').addEventListener('click', () => requestPrompt('new_package'));
$('new-chat').addEventListener('click', () => requestPrompt('new_chat'));
$('plan-family').addEventListener('change', () => {
  const family = plan.families.find((f) => f.id === $('plan-family').value);
  fillProducts(family);
  if (family) savePlan();
});
$('plan-product').addEventListener('change', () => savePlan());
$('tactic-use').addEventListener('click', () => savePlan(shownTactic));

$('answer').addEventListener('input', () => {
  const n = $('answer').value.length;
  $('answer-size').textContent = n > MAX_ANSWER ? `This paste is ${n.toLocaleString()} characters; grove takes at most 80,000. Paste only the answer.` : '';
});

$('add-texts').addEventListener('click', async () => {
  const answer = $('answer').value.trim();
  if (!answer || !waiting) return;
  if (answer.length > MAX_ANSWER) return;
  const button = $('add-texts');
  button.disabled = true;
  const result = await post('/api/answer', { exchangeId: waiting.exchangeId, answer });
  button.disabled = false;
  if (!result.ok) {
    showMessage($('package-message'), result.message);
    return;
  }
  $('answer').value = '';
  const r = result.data;
  const added = `${r.texts.length} ${r.texts.length === 1 ? 'text' : 'texts'} added.`;
  if (r.result === 'accepted') {
    showProblems([]);
    showMessage($('package-message'), added, 'ok');
  } else if (r.result === 'partly_accepted') {
    showProblems(r.problems);
    showMessage($('package-message'), `${added} Copy the next prompt into the same chat for the rest.`, 'ok');
  } else if (r.result === 'needs_fix') {
    showProblems(r.problems);
    showMessage($('package-message'), 'grove couldn\'t use that answer. Copy the fix-it prompt into the same chat and paste the new answer.');
  }
  await load();
  if (waiting && r.newChatSuggested) {
    $('new-chat-note').hidden = false;
    $('new-chat-note').textContent = 'Your AI may have lost track of the setup. If so, tap “I\'m in a new chat”.';
  }
});
