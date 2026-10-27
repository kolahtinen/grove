// Home (FR-201, FR-203, FR-206, FR-219): the topic, the package card with the prompt steps (setup
// first, each with Copy prompt), the paste box, I'm in a new chat, the whole-package choice and the
// problems, and the texts list. Everything is set with textContent.
import { getMe, post, showMessage } from './api.mjs';
import { showAccount } from './page.mjs';
import { playGrow } from './grow.mjs';

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

  const list = $('texts');
  list.replaceChildren();
  $('no-texts').hidden = home.texts.length > 0;
  for (const t of home.texts) {
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
    list.append(li);
  }
}

async function load() {
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

// G-04: the three stages, level, today's minutes and the welcome card (FR-407, FR-414…FR-416).
async function loadStages() {
  const res = await fetch('/api/stages', { credentials: 'same-origin' });
  if (!res.ok) return;
  const s = await res.json();
  $('welcome').hidden = !s.welcome;
  $('restart').hidden = !s.canRestart;
  // G-06: a new account goes to the starting check once the welcome is closed (FR-605).
  if (s.needsStart && !s.welcome) { window.location.assign('/start'); return 'start'; }
  const level = s.level === null ? 'Set your starting level' : s.level === 'below A1' ? 'Level: below A1' : `Level: ${s.level}`;
  $('level-line').textContent = `${level} · ${s.todayMinutes} min of input today`;
  const unread = document.querySelectorAll('#texts .text-state.new').length;
  $('discover-count').textContent = unread ? `${unread} new` : 'get texts';
  const due = s.review.fading + s.review.due;
  $('review-count').textContent = due ? `${due} due${s.review.fading ? ` (${s.review.fading} fading)` : ''}` : 'nothing due';
  $('master-count').textContent = s.master ? `${s.master} ready` : 'none yet';
}
const going = await loadStages();
$('welcome-close').addEventListener('click', async () => {
  await post('/api/welcome', {});
  $('welcome').hidden = true;
  await loadStages();
});

// G-08 FR-802: once after agreeing to the terms, the leaves-and-ground scene in a card at the top of
// Home (kept until Home is reached, so a learner sent to the starting check first still sees it).
function growDue() {
  try { return sessionStorage.getItem('grove-grow-due') === '1'; } catch { return false; }
}
if (going !== 'start' && growDue()) {
  try { sessionStorage.removeItem('grove-grow-due'); } catch { /* nothing kept */ }
  const card = document.createElement('section');
  card.className = 'card grow-card';
  card.id = 'grow-card';
  document.querySelector('main').prepend(card);
  playGrow(card, { onend: () => card.remove() });
}
