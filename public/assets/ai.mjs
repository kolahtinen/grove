// Texts from your AI (G-09 FR-919, the picked sketch's version A; RQ-461, question-pages/92; G-02 FR-201,
// FR-203, FR-206, FR-223): one step per screen. At the top "Step i of 5" and a bar; under it Done so far
// with what happened in each finished step; then the current step alone, with its one main button and
// Back. The five steps are always the same five. After every action a green line says what happened and
// what to do next; a copy never moves on by itself. The ways of asking sit folded under How grove asks,
// the recommended one chosen (after two failed answers the recommendation moves and a line says so). An
// answer grove can't use says what went wrong in one line with the fix-it request to copy, never staying on
// "Reading…"; the next paste is read as the answer to that fix-it (the server routes it). Leaving and coming
// back opens the step the learner was on (aisteps.mjs). Copy prompt says "Copied to clipboard"; only when
// copying fails is the prompt shown, selected (FR-201). Everything is set with textContent.
import { getMe, post, showMessage } from './api.mjs';
import { showAccount } from './page.mjs';
import { fromSession } from './way.mjs';
import { AI_STEPS, aiStep, progressOf, remember } from './aisteps.mjs';

const MAX_ANSWER = 80000;
const $ = (id) => document.getElementById(id);
const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; };

const STEP_IDS = ['ai', 'setup', 'request', 'paste', 'added'];
const TACTIC_NAMES = { steps: 'Step by step', long: 'One long prompt', whole: 'Whole package' };
const TACTIC_LINES = {
  steps: 'grove sends your AI a short setup once, then asks for one part at a time.',
  long: 'grove puts everything your AI needs into each prompt, one part at a time.',
  whole: 'grove sends your AI a setup once, then asks for all three parts in one go.',
};
const HEADINGS = { part: 'Copy the request', package: 'Copy the request for the whole package', redo: 'Ask again for one text', fix: 'Fix-it request', meanings_fix: 'Meanings request' };

let home = null;
let at = 0;
let lastAdded = [];
let lastRead = 0;

const aiName = () => {
  const plan = home?.plan;
  return plan?.families?.find((f) => f.id === plan.family)?.name ?? 'your AI';
};
const productName = () => {
  const plan = home?.plan;
  const family = plan?.families?.find((f) => f.id === plan.family);
  return family?.products?.find((p) => p.id === plan.product)?.name ?? '';
};

// What happened in each finished step (Done so far).
function doneLine(i) {
  const w = home?.waiting;
  switch (i) {
    case 0: return `You chose ${aiName()}${productName() ? ` (${productName()})` : ''}. grove will ask it ${TACTIC_NAMES[home?.plan?.tactic ?? 'steps'].toLowerCase()}.`;
    case 1: return w && !w.steps?.length ? 'No setup needed for this way of asking.' : `${aiName()} said OK to the setup messages.`;
    case 2: return w?.part ? `You copied the request for part ${w.part}.` : 'You copied the request.';
    case 3: return `Answer read: ${lastRead} text${lastRead === 1 ? '' : 's'} added.`;
    default: return '';
  }
}

function renderProgress() {
  $('step-count').textContent = `Step ${at + 1} of ${AI_STEPS.length}`;
  const bar = $('mini-steps');
  bar.replaceChildren(...AI_STEPS.map((_, i) => el('i', i < at ? 'done' : i === at ? 'now' : '')));
  const done = $('done-so-far');
  done.hidden = at === 0;
  $('done-summary').textContent = `Done so far (${at})`;
  $('done-list').replaceChildren(...AI_STEPS.slice(0, at).map((name, i) => {
    const li = el('li', 'step done');
    const mark = el('span', 'step-mark', '✓');
    mark.setAttribute('aria-hidden', 'true');
    const text = el('span', '');
    text.append(document.createTextNode(name), el('span', 'step-done', doneLine(i)));
    li.append(mark, text);
    return li;
  }));
}

function go(step) {
  at = step;
  for (const s of document.querySelectorAll('.ai-step')) s.hidden = s.dataset.step !== STEP_IDS[step];
  $('ai-back').hidden = step === 0 || step === 4;
  renderProgress();
  renderTexts();
}

// The lines that name the learner's AI.
function renderTexts() {
  const name = aiName();
  const w = home?.waiting;
  $('setup-intro').textContent = `Open a new chat in ${name}. Send these messages one at a time; ${name} answers "OK" to each.`;
  $('setup-done').textContent = `${name} said OK to ${w?.steps?.length === 2 ? 'both' : w?.steps?.length > 2 ? 'all of them' : 'it'}`;
  $('request-intro').textContent = w?.steps?.length || (home?.plan?.tactic ?? 'steps') !== 'long' ? `In the same chat, send this request.` : `In ${name}, send this request. It carries everything ${name} needs.`;
  $('request-done').textContent = `${name} has answered`;
  $('paste-intro').textContent = `Copy ${name}'s whole answer (the copy button under it) and paste it here.`;
  $('get-texts').textContent = w ? 'Next: carry on' : (home?.plan?.tactic ?? 'steps') === 'long' ? 'Next: copy the request' : 'Next: start a new chat';
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
  // G-02 FR-223: all three tactics, the recommended one labelled, the one in use selected. After two
  // failed answers in this package, the other main tactic to the one grove's table recommends.
  const failed = home.package?.oneText && plan.recommended ? (plan.recommended === 'steps' ? 'long' : 'steps') : null;
  const recommended = failed ?? plan.recommended;
  $('tactics').hidden = !plan.family;
  $('tactics-summary').textContent = `How grove asks ${aiName()}: ${TACTIC_NAMES[plan.tactic ?? 'steps'].toLowerCase()}`;
  if (failed) $('tactics').open = true;
  const box = $('tactic-options');
  box.replaceChildren();
  for (const t of ['steps', 'long', 'whole']) {
    const label = el('label', 'tactic-option');
    const input = el('input');
    input.type = 'radio';
    input.name = 'tactic';
    input.value = t;
    input.checked = t === plan.tactic;
    input.addEventListener('change', () => savePlan(t));
    const text = el('span', 'tactic-text');
    text.append(el('strong', '', TACTIC_NAMES[t]));
    if (t === recommended) text.append(el('span', 'tag', 'Recommended'));
    if (t === plan.tactic) text.append(el('span', 'tag', 'In use'));
    text.append(el('span', 'small muted tactic-line', TACTIC_LINES[t]));
    label.append(input, text);
    box.append(label);
  }
  $('tactic-note').hidden = !failed && !(plan.reason && plan.tactic === plan.recommended);
  $('tactic-note').textContent = failed ? `After the failed answers, grove now recommends ${TACTIC_NAMES[failed].toLowerCase()}.` : plan.reason ?? '';
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
  const li = el('li', 'prompt-step prompt-box');
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
  const name = aiName();
  let copied = 0;
  $('setup-steps').replaceChildren(...w.steps.map((step, i) => stepItem(`Setup message ${i + 1} of ${w.steps.length} (${name} replies "OK")`, step, () => {
    copied += 1;
    if (copied >= w.steps.length) showMessage($('package-message'), `Copied. Paste each into the new chat and send it; then tap “${$('setup-done').textContent}”.`, 'ok');
  })));
  const heading = HEADINGS[w.kind] ?? 'Copy the request';
  $('prompt-heading').textContent = w.kind === 'package' || !w.part ? heading : `${heading} (part ${w.part} of ${w.of})`;
  $('request-done').disabled = !progressOf(w.exchangeId).copied;
  $('prompt-steps').replaceChildren(stepItem(w.steps.length ? 'The request, in the same chat' : 'The request', w.prompt, (ok) => {
    // A copy never moves on by itself (question-pages/92, 2): it says what to do next.
    remember(w.exchangeId, { copied: true });
    $('request-done').disabled = false;
    if (ok) showMessage($('package-message'), `Copied. Now paste it into ${name} and wait for its answer. It takes about a minute.`, 'ok');
  }));
  $('new-chat-note').hidden = !w.newChatSuggested;
  $('new-chat-note').textContent = `${name} may have lost track of the setup. If so, go on to Paste the answer and tap “I'm in a new chat”.`;
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
  const first = lastAdded[0];
  $('read-first').hidden = !first;
  if (first) { $('read-first').textContent = `Read “${first.title}”`; $('read-first').href = `/text?id=${first.id}`; }
  const pkg = home.package;
  const more = pkg && pkg.partsAccepted < pkg.of;
  $('added-more').textContent = pkg ? (more ? `That was part ${pkg.partsAccepted} of ${pkg.of}. Parts ${Array.from({ length: pkg.of - pkg.partsAccepted }, (_, k) => pkg.partsAccepted + k + 1).join(' and ')} come from the same chat, when you want them.` : `That was the last part of ${pkg.of}.`) : '';
  $('next-part').textContent = more ? `Ask ${aiName()} for part ${pkg.partsAccepted + 1} of ${pkg.of}` : 'Get more texts';
  $('new-package').hidden = !more;
}

function render() {
  $('topic-text').textContent = home.topic;
  if (home.waiting) renderPrompts(home.waiting);
  renderPlan(home.plan);
  renderAdded();
  renderTexts();
  renderProgress();
}

async function load() {
  const res = await fetch('/api/home', { credentials: 'same-origin' });
  if (!res.ok) return;
  home = await res.json();
  render();
}

function showProblems(problems) {
  const ul = $('problems');
  ul.replaceChildren(...(problems || []).map((p) => el('li', '', p)));
  ul.hidden = !problems || problems.length === 0;
}

async function requestPrompt(action) {
  showProblems([]);
  // B-23: sent by a session's offer, a new package asks only for the kind the session needs (G-02 FR-202).
  const result = await post('/api/prompt', { action, ...(fromSession() ? { forSession: true } : {}) });
  if (!result.ok) { showMessage($('package-message'), result.message); return; }
  await load();
  const w = home.waiting;
  if (action === 'new_chat') {
    remember(w.exchangeId, { setup: false, copied: false });
    showMessage($('package-message'), `Start a new chat in ${aiName()} and send the setup again, then the request.`, 'ok');
  } else showMessage($('package-message'), w?.steps.length ? `Your setup is ready. Open a new chat in ${aiName()} and copy each message into it.` : 'Your request is ready. Copy it into your chat.', 'ok');
  go(w?.steps.length ? 1 : 2);
}

// FR-919: an answer grove can't use says what went wrong and gives the fix-it request to copy.
function showFix(problems, fix) {
  const box = $('fix-box');
  box.replaceChildren();
  const msg = el('div', 'message bad');
  msg.setAttribute('role', 'alert');
  msg.append(el('b', '', `grove couldn't use this answer: ${problems?.[0] ?? 'it is not in grove’s format'}`),
    el('span', 'next', ' Nothing was added. Copy the fix-it request into the same chat, then paste its new answer here.'));
  const list = el('ol', 'prompt-steps');
  list.append(stepItem('Fix-it request', fix.prompt, (ok) => { if (ok) showMessage($('package-message'), `Copied. Paste it into ${aiName()}, then paste its new answer below.`, 'ok'); }));
  box.append(msg, list);
  box.hidden = false;
}

await showAccount();
await getMe();
await load();
const first = aiStep(home);
go(first);
if (home.waiting) showMessage($('package-message'), 'Picking up where you left off.', 'ok');

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
  if (home.waiting) { go(Math.max(1, aiStep(home))); return; }
  requestPrompt('next');
});
$('plan-family').addEventListener('change', () => {
  const family = home.plan.families.find((f) => f.id === $('plan-family').value);
  fillProducts(family);
  if (family) savePlan();
});
$('plan-product').addEventListener('change', () => savePlan());
$('setup-done').addEventListener('click', () => {
  if (home.waiting) remember(home.waiting.exchangeId, { setup: true });
  showMessage($('package-message'), `Setup sent. Now copy the request into the same chat.`, 'ok');
  go(2);
});
$('request-done').addEventListener('click', () => {
  showMessage($('package-message'), `Now paste ${aiName()}'s whole answer below.`, 'ok');
  go(3);
});
$('next-part').addEventListener('click', () => requestPrompt('next'));
$('new-package').addEventListener('click', () => requestPrompt('new_package'));
$('new-chat').addEventListener('click', () => requestPrompt('new_chat'));
$('ai-back').addEventListener('click', () => {
  // Back to the step before; a tactic without a setup has its Setup done, so Back skips it.
  let to = Math.max(0, at - 1);
  if (to === 1 && !home.waiting?.steps?.length) to = 0;
  go(to);
});

$('answer').addEventListener('input', () => {
  const n = $('answer').value.length;
  $('answer-size').textContent = n > MAX_ANSWER ? `This paste is ${n.toLocaleString()} characters; grove takes at most 80,000. Paste only the answer.` : '';
});

$('add-texts').addEventListener('click', async () => {
  const answer = $('answer').value.trim();
  if (!answer) { showMessage($('package-message'), 'Paste the answer first.'); return; }
  if (answer.length > MAX_ANSWER) return;
  if (!home.waiting) { showMessage($('package-message'), 'There is no request waiting. Go back and ask for texts first.'); return; }
  const button = $('add-texts');
  button.disabled = true;
  const n = (answer.match(/"title"\s*:/g) || []).length;
  showMessage($('package-message'), `Reading ${aiName()}'s answer… Checking ${n ? `${n} text${n === 1 ? '' : 's'}` : 'it'}: the format, then the new words in each.`, 'ok');
  let result;
  try {
    result = await post('/api/answer', { exchangeId: home.waiting.exchangeId, answer });
  } finally {
    button.disabled = false;
  }
  // Never left on "Reading…" (RQ-461): every answer says what happened.
  if (!result.ok) { showMessage($('package-message'), result.message); return; }
  $('answer').value = '';
  const r = result.data;
  lastAdded = r.texts ?? [];
  lastRead = lastAdded.length;
  const added = `${lastAdded.length} ${lastAdded.length === 1 ? 'text' : 'texts'} added${lastAdded.length ? ':' : '.'}`;
  await load();
  if (r.result === 'accepted') {
    showProblems([]);
    $('fix-box').hidden = true;
    showMessage($('package-message'), `${added} ${lastAdded.map((t) => t.title).join(', ')}`, 'ok');
    go(4);
  } else if (r.result === 'partly_accepted') {
    showProblems(r.problems);
    $('fix-box').hidden = true;
    showMessage($('package-message'), `${added} Copy the next request into the same chat for the rest.`, 'ok');
    go(2);
  } else if (r.result === 'needs_fix') {
    showProblems(r.problems);
    showFix(r.problems, r.fix);
    showMessage($('package-message'), `grove couldn't use that answer. Copy the fix-it request into the same chat and paste the new answer.`);
    go(3);
  } else {
    showMessage($('package-message'), 'grove read the answer but found nothing to add. Ask your AI again with the request.');
  }
  if (home.waiting && r.newChatSuggested) $('new-chat-note').hidden = false;
});
