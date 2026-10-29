// Texts from your AI (G-09 FR-919; G-02 FR-201, FR-203, FR-206, FR-223): a wizard with a step list
// always at the top (done ✓, now ●, next ○) and one step on screen at a time, with one main button and
// Back; every action ends in a confirmation. The steps follow G-02's prompting state, so leaving and
// coming back shows where the learner is. grove chooses the tactic from the learner's AI; another is
// offered only after failed answers. Everything is set with textContent.
import { getMe, post, showMessage } from './api.mjs';
import { showAccount } from './page.mjs';

const MAX_ANSWER = 80000;
const $ = (id) => document.getElementById(id);
const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; };

const TACTIC_NAMES = { steps: 'Step by step', long: 'One long prompt', whole: 'Whole package' };
const TACTIC_LINES = {
  steps: 'grove sends your AI a short setup once, then asks for one part at a time.',
  long: 'grove puts everything your AI needs into each prompt, one part at a time.',
  whole: 'grove sends your AI a setup once, then asks for all three parts in one go.',
};
const HEADINGS = { part: 'Prompt', package: 'Prompt for the whole package', redo: 'Ask again for one text', fix: 'Fix-it prompt', meanings_fix: 'Meanings prompt' };

let home = null;
let at = 'ai';
let lastAdded = [];

function steps() {
  const list = ['ai'];
  if (home?.waiting?.steps?.length || at === 'setup') list.push('setup');
  list.push('request', 'paste', 'added');
  return list;
}

function stepLabel(step) {
  const plan = home?.plan;
  if (step === 'ai') {
    const family = plan?.families?.find((f) => f.id === plan.family);
    const product = family?.products?.find((p) => p.id === plan.product);
    return family ? `Your AI: ${family.name}${product ? ` (${product.name})` : ''}` : 'Your AI';
  }
  return { setup: 'Send the setup', request: 'Copy the request', paste: 'Paste the answer', added: 'Texts added' }[step];
}

function renderStepList() {
  const list = steps();
  const now = list.indexOf(at);
  const ol = $('ai-steps');
  ol.replaceChildren();
  list.forEach((step, i) => {
    const state = i < now ? 'done' : i === now ? 'now' : 'next';
    const li = el('li', `step ${state}`);
    li.dataset.step = step;
    if (state === 'now') li.setAttribute('aria-current', 'step');
    const mark = el('span', 'step-mark', state === 'done' ? '✓' : state === 'now' ? '●' : '○');
    mark.setAttribute('aria-hidden', 'true');
    li.append(mark, el('span', 'step-name', stepLabel(step)), el('span', 'visually-hidden', state === 'done' ? ' (done)' : state === 'now' ? ' (now)' : ''));
    ol.append(li);
  });
}

function go(step) {
  at = step;
  for (const s of document.querySelectorAll('.ai-step')) s.hidden = s.dataset.step !== step;
  $('ai-back').hidden = steps().indexOf(step) <= 0;
  renderStepList();
  document.querySelector(`.ai-step[data-step="${step}"] h3`)?.focus?.();
}

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

function renderPlan(plan) {
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
  // FR-919: the tactic is grove's choice, shown as one line.
  $('tactic-line').textContent = plan.family ? `${TACTIC_LINES[plan.tactic]}${plan.reason && plan.tactic === plan.recommended ? ` ${plan.reason}` : ''}` : '';
}

async function savePlan(tactic) {
  const body = { family: $('plan-family').value, product: $('plan-product').value };
  if (tactic) body.tactic = tactic;
  const result = await post('/api/plan', body);
  if (!result.ok) { showMessage($('plan-message'), result.message); return; }
  showMessage($('plan-message'), `Saved. grove will ask your AI: ${TACTIC_NAMES[result.data.tactic].toLowerCase()}${result.data.tactic === 'whole' ? ', from your next package on' : ''}.`, 'ok');
  await load();
}

// Copy prompt: "Copied to clipboard"; only when copying fails is the prompt shown, selected (FR-201).
async function copyStep(text, item, after) {
  const note = item.querySelector('.copied');
  const box = item.querySelector('textarea');
  try {
    await navigator.clipboard.writeText(text);
    box.hidden = true;
    note.textContent = 'Copied to clipboard';
    item.classList.add('done');
    after?.(true);
  } catch {
    box.hidden = false;
    box.focus();
    box.select();
    note.textContent = 'Copying was blocked: the prompt is selected below, copy it by hand.';
    after?.(false);
  }
  note.hidden = false;
}

function stepItem(label, text, after) {
  const li = el('li', 'prompt-step');
  const button = el('button', 'copy', 'Copy prompt');
  button.type = 'button';
  const note = el('span', 'copied');
  note.setAttribute('role', 'status');
  note.hidden = true;
  const box = el('textarea');
  box.readOnly = true;
  box.rows = 6;
  box.value = text;
  box.hidden = true;
  box.setAttribute('aria-label', label);
  button.addEventListener('click', () => copyStep(text, li, after));
  li.append(el('span', 'step-label', label), button, note, box);
  return li;
}

function renderPrompts(w) {
  $('setup-steps').replaceChildren(...w.steps.map((step, i) => stepItem(`Setup ${i + 1} of ${w.steps.length} (your AI replies "OK")`, step)));
  const heading = HEADINGS[w.kind] ?? 'Prompt';
  $('prompt-heading').textContent = w.kind === 'package' || !w.part ? heading : `${heading} (part ${w.part} of ${w.of})`;
  $('prompt-steps').replaceChildren(stepItem(w.steps.length ? 'The request, in the same chat' : 'The request', w.prompt, (copied) => {
    $('request-done').hidden = copied;
    if (copied) {
      showMessage($('package-message'), 'Copied. Now paste it into your AI chat and wait for its answer.', 'ok');
      go('paste');
    }
  }));
  $('new-chat-note').hidden = !w.newChatSuggested;
  $('new-chat-note').textContent = 'Your AI may have lost track of the setup. If so, go to Paste the answer and tap “I\'m in a new chat”.';
}

function renderAdded() {
  const list = $('added-list');
  list.replaceChildren();
  for (const t of lastAdded) {
    const li = el('li');
    const a = el('a');
    a.href = `/text?id=${t.id}`;
    a.append(el('span', 'text-title', t.title), el('span', 'text-state new', `${t.kind} · new`));
    li.append(a);
    list.append(li);
  }
  const pkg = home.package;
  const more = pkg && pkg.partsAccepted < pkg.of;
  $('next-part').textContent = more ? 'Next part' : 'Get more texts';
  $('new-package').hidden = !more;
}

function render() {
  $('topic-text').textContent = home.topic;
  const pkg = home.package;
  $('progress').textContent = pkg ? `Package: ${pkg.partsAccepted} of ${pkg.of} parts in` : '';
  if (home.waiting) renderPrompts(home.waiting);
  renderPlan(home.plan);
  const offer = home.offer && home.offer !== home.plan.tactic ? home.offer : null;
  $('offer').hidden = !offer;
  if (offer) {
    $('offer').replaceChildren(document.createTextNode(`Texts keep failing. ${offer === 'long' ? 'Your AI may keep to your words better with everything in one long prompt.' : 'Your AI may do better with the setup sent once, step by step.'} `));
    const b = el('button', 'bar-button', `Try ${TACTIC_NAMES[offer].toLowerCase()}`);
    b.type = 'button';
    b.addEventListener('click', () => savePlan(offer));
    $('offer').append(b);
  }
  renderAdded();
  renderStepList();
}

async function load() {
  const res = await fetch('/api/home', { credentials: 'same-origin' });
  if (!res.ok) return;
  home = await res.json();
  render();
}

// Where a learner coming to the page is: their AI first; a waiting prompt; else their texts so far.
function startingStep() {
  if (!home.plan.family) return 'ai';
  if (home.waiting) return home.waiting.steps.length ? 'setup' : 'request';
  return 'ai';
}

function showProblems(problems) {
  const ul = $('problems');
  ul.replaceChildren(...(problems || []).map((p) => el('li', '', p)));
  ul.hidden = !problems || problems.length === 0;
}

async function requestPrompt(action) {
  showProblems([]);
  const result = await post('/api/prompt', { action });
  if (!result.ok) { showMessage($('package-message'), result.message); return; }
  await load();
  const w = home.waiting;
  showMessage($('package-message'), w?.steps.length ? 'Your prompts are ready. Start with the setup.' : 'Your prompt is ready.', 'ok');
  go(w?.steps.length ? 'setup' : 'request');
}

await showAccount();
await getMe();
await load();
go(startingStep());

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
    showMessage($('plan-message'), `Topic saved: ${topic}.`, 'ok');
    await load();
  }
});

$('get-texts').addEventListener('click', () => {
  // FR-223: grove asks for the learner's AI before the first texts.
  if (!home.plan.family) {
    showMessage($('plan-message'), 'First choose your AI and its version, so grove can ask it the best way.');
    $('plan-family').focus();
    return;
  }
  if (home.waiting) { go(home.waiting.steps.length ? 'setup' : 'request'); return; }
  requestPrompt('next');
});
$('plan-family').addEventListener('change', () => {
  const family = home.plan.families.find((f) => f.id === $('plan-family').value);
  fillProducts(family);
  if (family) savePlan();
});
$('plan-product').addEventListener('change', () => savePlan());
$('setup-done').addEventListener('click', () => {
  showMessage($('package-message'), 'Setup sent. Now copy the request into the same chat.', 'ok');
  go('request');
});
$('request-done').addEventListener('click', () => go('paste'));
$('next-part').addEventListener('click', () => requestPrompt('next'));
$('new-package').addEventListener('click', () => requestPrompt('new_package'));
$('new-chat').addEventListener('click', () => requestPrompt('new_chat'));
$('ai-back').addEventListener('click', () => {
  const list = steps();
  go(list[Math.max(0, list.indexOf(at) - 1)]);
});

$('answer').addEventListener('input', () => {
  const n = $('answer').value.length;
  $('answer-size').textContent = n > MAX_ANSWER ? `This paste is ${n.toLocaleString()} characters; grove takes at most 80,000. Paste only the answer.` : '';
});

$('add-texts').addEventListener('click', async () => {
  const answer = $('answer').value.trim();
  if (!answer || !home.waiting || answer.length > MAX_ANSWER) return;
  const button = $('add-texts');
  button.disabled = true;
  showMessage($('package-message'), 'Reading the answer…', 'ok');
  const result = await post('/api/answer', { exchangeId: home.waiting.exchangeId, answer });
  button.disabled = false;
  if (!result.ok) { showMessage($('package-message'), result.message); return; }
  $('answer').value = '';
  const r = result.data;
  lastAdded = r.texts;
  const added = `${r.texts.length} ${r.texts.length === 1 ? 'text' : 'texts'} added${r.texts.length ? ':' : '.'}`;
  await load();
  if (r.result === 'accepted') {
    showProblems([]);
    showMessage($('package-message'), added, 'ok');
    go('added');
  } else if (r.result === 'partly_accepted') {
    showProblems(r.problems);
    showMessage($('package-message'), `${added} Copy the next request into the same chat for the rest.`, 'ok');
    go('request');
  } else if (r.result === 'needs_fix') {
    showProblems(r.problems);
    showMessage($('package-message'), 'grove couldn\'t use that answer. Copy the fix-it request into the same chat and paste the new answer.');
    go('request');
  }
  if (home.waiting && r.newChatSuggested) $('new-chat-note').hidden = false;
});
