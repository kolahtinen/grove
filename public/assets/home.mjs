// Home (FR-201, FR-206, FR-207, FR-219): the topic, the package card with the prompt, paste box and
// problems, the meanings card, and the texts list. Everything is set with textContent.
import { getMe, post, showMessage } from './api.mjs';
import { showAccount } from './page.mjs';

const MAX_ANSWER = 80000;
const $ = (id) => document.getElementById(id);
let waiting = null;
let meanings = null;

async function copyFrom(textarea) {
  try {
    await navigator.clipboard.writeText(textarea.value);
  } catch {
    textarea.select();
    document.execCommand('copy');
  }
}

function render(home) {
  $('topic-text').textContent = home.topic;
  const pkg = home.package;
  $('progress').textContent = pkg ? `Package: ${pkg.partsAccepted} of ${pkg.of} parts in` : 'No package yet.';
  waiting = home.waiting;
  $('prompt-area').hidden = !waiting;
  if (waiting) {
    $('prompt-heading').textContent = waiting.kind === 'fix' ? `Fix-it prompt (part ${waiting.part} of ${waiting.of})` : `Prompt (part ${waiting.part} of ${waiting.of})`;
    $('prompt').value = waiting.prompt;
  }
  const getButton = $('get-texts');
  getButton.hidden = !!waiting;
  getButton.textContent = pkg && pkg.partsAccepted > 0 && pkg.partsAccepted < pkg.of ? 'Next part' : 'Get texts';
  $('new-package').hidden = !pkg;
  meanings = home.meanings;
  $('meanings-card').hidden = !meanings;
  if (meanings) $('meanings-prompt').value = meanings.prompt;

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
    state.textContent = t.state;
    a.append(title, state);
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
  $('prompt').scrollIntoView({ block: 'nearest' });
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

$('get-texts').addEventListener('click', () => requestPrompt('next'));
$('new-package').addEventListener('click', () => requestPrompt('new_package'));
for (const button of document.querySelectorAll('button.copy')) {
  button.addEventListener('click', () => copyFrom(button.previousElementSibling));
}

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
  if (result.data.result === 'accepted') {
    showProblems([]);
    showMessage($('package-message'), `${result.data.texts.length} texts added.`, 'ok');
  } else if (result.data.result === 'needs_fix') {
    showProblems(result.data.problems);
    showMessage($('package-message'), 'grove found problems. Copy the fix-it prompt into the same chat and paste the new answer.');
  }
  await load();
});

$('add-meanings').addEventListener('click', async () => {
  const answer = $('meanings-answer').value.trim();
  if (!answer || !meanings) return;
  const result = await post('/api/answer', { exchangeId: meanings.exchangeId, answer });
  if (!result.ok) {
    showMessage($('meanings-message'), result.message);
    return;
  }
  $('meanings-answer').value = '';
  showMessage($('package-message'), `Meanings added for ${result.data.filled} words.`, 'ok');
  await load();
});
