// Reading a text (FR-218): Swedish lines with English on tap, the questions, and the five ratings.
import { getMe, post, showMessage } from './api.mjs';
import { showAccount } from './page.mjs';

const $ = (id) => document.getElementById(id);
const id = Number(new URLSearchParams(window.location.search).get('id'));

await showAccount();
await getMe();
const res = await fetch(`/api/text?id=${id}`, { credentials: 'same-origin' });
if (!res.ok) {
  $('title').textContent = 'This text was not found.';
} else {
  const text = await res.json();
  $('title').textContent = text.title;
  document.title = `${text.title} · grove`;

  for (const line of text.lines) {
    const li = document.createElement('li');
    const sv = document.createElement('span');
    sv.className = 'sv passage';
    sv.textContent = line.sv;
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'bar-button en-toggle';
    toggle.textContent = 'English';
    const en = document.createElement('span');
    en.className = 'en';
    en.textContent = line.en;
    en.hidden = true;
    toggle.addEventListener('click', () => { en.hidden = !en.hidden; });
    li.append(sv, toggle, en);
    $('lines').append(li);
  }

  $('questions-card').hidden = text.questions.length === 0;
  text.questions.forEach((q, position) => {
    const fieldset = document.createElement('fieldset');
    const legend = document.createElement('legend');
    legend.textContent = q.q;
    const feedback = document.createElement('p');
    feedback.className = 'feedback';
    fieldset.append(legend);
    const previous = text.answered.find((a) => a.position === position);
    q.options.forEach((option, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'option';
      button.textContent = option;
      button.addEventListener('click', async () => {
        const result = await post('/api/question', { textId: id, position, option: index });
        if (!result.ok) return;
        const buttons = fieldset.querySelectorAll('button.option');
        buttons.forEach((b, i) => {
          b.classList.toggle('right', i === result.data.rightOption);
          b.classList.toggle('wrong', i === index && !result.data.right);
        });
        feedback.textContent = result.data.right ? 'Right!' : 'Not quite — the right answer is marked.';
      });
      fieldset.append(button);
    });
    if (previous) feedback.textContent = previous.right ? 'You answered this right.' : 'You answered this before.';
    fieldset.append(feedback);
    $('questions').append(fieldset);
  });

  for (const button of $('ratings').querySelectorAll('button')) {
    button.classList.toggle('chosen', button.dataset.value === text.rating);
    button.addEventListener('click', async () => {
      const result = await post('/api/rating', { textId: id, value: button.dataset.value });
      if (!result.ok) {
        showMessage($('rating-message'), result.message);
        return;
      }
      for (const b of $('ratings').querySelectorAll('button')) b.classList.toggle('chosen', b === button);
      showMessage($('rating-message'), 'Thanks! Your next texts will take this into account.', 'ok');
    });
  }
}
