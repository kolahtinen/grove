// One Review or Master question card (G-04 FR-404…FR-407; addendum 003), shared by the Review page and
// a session's exercises (G-09 FR-904): a sentence shown with Play, a gapped sentence with the English
// meaning (Master), or a recall card. Answers go to G-04's /api/review. All text via textContent.
import { post } from './api.mjs';
import { speak } from './speech.mjs';

const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; };

async function send(item, right) {
  const r = await post('/api/review', { lemma: item.lemma, kind: item.kind, mode: item.mode, right });
  return r.ok ? r.data : null;
}

// Renders `item` into `box`; `onDone` runs when the learner moves on. `spoken` plays the sentence first.
export function renderQuestion(box, item, { onDone, spoken = false } = {}) {
  box.replaceChildren();
  if (item.mode === 'recall') {
    box.append(el('p', 'big-word', item.lemma), el('p', '', 'Do you remember what it means?'));
    const reveal = el('button', 'main', 'Show');
    reveal.type = 'button';
    reveal.addEventListener('click', () => {
      reveal.remove();
      box.append(el('p', 'passage', item.meaning || ''));
      const row = el('div', 'row');
      for (const [label, right] of [['I knew it', true], ['I didn’t', false]]) {
        const b = el('button', right ? 'main' : '', label);
        b.type = 'button';
        b.addEventListener('click', async () => { await send(item, right); onDone?.(); });
        row.append(b);
      }
      box.append(row);
    });
    box.append(reveal);
    return;
  }
  // The sentence is shown, with Play to hear it (FR-406; addendum 003, question-pages/73, 2).
  const sentence = el('p', 'passage review-sentence', item.sentence);
  box.append(sentence);
  if (item.mode !== 'master') {
    const play = el('button', 'bar-button', 'Play');
    play.type = 'button';
    play.addEventListener('click', () => speak(item.sentence));
    box.append(play);
    if (spoken) speak(item.sentence);
  }
  const fieldset = el('fieldset');
  fieldset.append(el('legend', '', item.mode === 'master' ? `Which word means “${item.meaning}” here?` : `What does “${item.word}” mean here?`));
  const feedback = el('p', 'feedback');
  item.options.forEach((option, index) => {
    const b = el('button', 'option', option);
    b.type = 'button';
    b.addEventListener('click', async () => {
      fieldset.querySelectorAll('button.option').forEach((x, k) => { x.disabled = true; x.classList.toggle('right', k === item.right); x.classList.toggle('wrong', k === index && index !== item.right); });
      sentence.hidden = false;
      const result = await send(item, index === item.right);
      feedback.textContent = (index === item.right ? 'Right!' : 'Not quite — the right answer is marked.') + (result?.fell ? ' It fell to your ground.' : '');
      const next = el('button', 'main', 'Next');
      next.type = 'button';
      next.addEventListener('click', () => onDone?.());
      box.append(next);
    });
    fieldset.append(b);
  });
  fieldset.append(feedback);
  box.append(fieldset);
}
