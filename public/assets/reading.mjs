// The reading page (FR-301…FR-321): sentences of tappable words (textview.mjs), one Show translation,
// pattern marks, the word menu sheet (wordmenu.mjs, FR-305 version A) with Explain and Report, Practise and
// Play. An own text waiting for its word check opens its step 2 on My own texts (FR-318, RQ-462). All text
// via textContent.
import { getMe, post, showMessage } from './api.mjs';
import { showAccount } from './page.mjs';
import { startHeartbeat } from './heartbeat.mjs';
import { speak as say, cancel, hasSwedish, setRate, getRate, onVoices } from './speech.mjs';
import { renderLines } from './textview.mjs';
import { createWordMenu } from './wordmenu.mjs';
import { createSentences } from './sentences.mjs';

const speak = (text, onend) => say(text, { onend });

const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(window.location.search);
const id = Number(params.get('id'));
// Old links from a session (`&session=S`) open the session: its texts are inside it now (G-09 FR-933).
if (params.has('session')) window.location.replace(`/session?id=${encodeURIComponent(params.get('session'))}`);
let data = null;
let playing = false;

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

// The word menu (FR-305, version A), shared with a session's texts.
const menu = createWordMenu({ textId: id, getData: () => data, onChange: () => renderLines($('lines'), data, { onWord: (t, s, l, b) => menu.open(t, s, l, b) }) });
const draw = (list, opts = {}) => renderLines(list, data, { onWord: (t, s, l, b) => menu.open(t, s, l, b), ...opts });

// One Show translation button under a text, showing the whole text's English below it (FR-301).
function translationBlock() {
  const wrap = el('div', 'translation');
  const button = el('button', 'bar-button', 'Show translation');
  button.type = 'button';
  button.setAttribute('aria-expanded', 'false');
  const english = el('div', 'translation-text');
  english.hidden = true;
  for (const line of data.lines) if (line.en) english.append(el('p', 'en', line.en));
  button.addEventListener('click', () => {
    english.hidden = !english.hidden;
    button.textContent = english.hidden ? 'Show translation' : 'Hide translation';
    button.setAttribute('aria-expanded', String(!english.hidden));
  });
  wrap.append(button, english);
  return wrap;
}

function renderQuestions(container) {
  container.replaceChildren();
  for (const q of data.questions) {
    const fieldset = el('fieldset', q.reported ? 'reported' : '');
    fieldset.append(el('legend', '', q.q));
    const feedback = el('p', 'feedback');
    const previous = data.answered.find((a) => a.position === q.position);
    q.options.forEach((option, index) => {
      const b = el('button', 'option', option);
      b.type = 'button';
      b.addEventListener('click', async () => {
        const result = await post('/api/question', { textId: id, position: q.position, option: index });
        if (!result.ok) return;
        fieldset.querySelectorAll('button.option').forEach((x, i) => {
          x.classList.toggle('right', i === result.data.rightOption);
          x.classList.toggle('wrong', i === index && !result.data.right);
        });
        feedback.textContent = result.data.right ? 'Right!' : 'Not quite — the right answer is marked.';
      });
      fieldset.append(b);
    });
    if (q.reported) feedback.textContent = 'Reported — this question doesn’t count.';
    else if (previous) feedback.textContent = previous.right ? 'You answered this right.' : 'You answered this before.';
    fieldset.append(feedback);
    const report = el('button', 'bar-button report', q.reported ? 'Reported' : 'Report');
    report.type = 'button';
    report.disabled = q.reported;
    report.addEventListener('click', () => menu.openReport({ questionPosition: q.position }, `Question ${q.position + 1}: ${q.q}`, () => {
      q.reported = true;
      renderQuestions($('questions'));
    }));
    fieldset.append(report);
    container.append(fieldset);
  }
}

// Practise (FR-310…FR-312): word questions, then the passage questions, then the full text with Play.
async function practise() {
  const res = await fetch(`/api/practice?id=${id}`, { credentials: 'same-origin' });
  if (!res.ok) return;
  const { questions } = await res.json();
  $('reading-card').hidden = true;
  $('questions-card').hidden = true;
  $('practice-card').hidden = false;
  const box = $('practice');
  let i = 0;

  function wordQuestion() {
    if (i >= questions.length) { passage(); return; }
    const q = questions[i];
    box.replaceChildren();
    $('practice-heading').textContent = `Practise — word ${i + 1} of ${questions.length}`;
    box.append(el('p', 'passage practice-sentence', q.sentence));
    const fieldset = el('fieldset');
    fieldset.append(el('legend', '', `What does “${q.word}” mean here?`));
    const feedback = el('p', 'feedback');
    const line = data.lines.find((l) => l.sentences.some((s) => s.sv === q.sentence));
    q.options.forEach((option, index) => {
      const b = el('button', 'option', option);
      b.type = 'button';
      b.addEventListener('click', () => {
        fieldset.querySelectorAll('button.option').forEach((x, k) => { x.disabled = true; x.classList.toggle('right', k === q.right); x.classList.toggle('wrong', k === index && index !== q.right); });
        feedback.textContent = index === q.right ? 'Right!' : 'Not quite — the right answer is marked.';
        if (line?.en) box.append(el('p', 'en practice-en', line.en));
        const next = el('button', 'main', 'Next');
        next.type = 'button';
        next.addEventListener('click', () => { i += 1; wordQuestion(); });
        box.append(next);
      });
      fieldset.append(b);
    });
    fieldset.append(feedback);
    box.append(fieldset);
  }

  function passage() {
    box.replaceChildren();
    $('practice-heading').textContent = 'Practise — questions about the text';
    const qs = el('div', 'practice-questions');
    renderQuestions(qs);
    box.append(qs);
    const next = el('button', 'main', 'Show the whole text');
    next.type = 'button';
    next.addEventListener('click', full);
    box.append(next);
  }

  function full() {
    box.replaceChildren();
    $('practice-heading').textContent = 'The whole text';
    const play = el('button', 'main', 'Play');
    play.type = 'button';
    play.id = 'play';
    const stop = el('button', '', 'Stop');
    stop.type = 'button';
    stop.id = 'stop';
    const tools = el('div', 'row');
    tools.append(play, stop);
    const list = el('ol', 'lines');
    list.id = 'practice-lines';
    box.append(tools, list);
    draw(list, { tappable: false });
    box.append(translationBlock());
    play.addEventListener('click', () => {
      const spans = [...list.querySelectorAll('.sentence')];
      if (!hasSwedish()) { play.textContent = 'No Swedish voice on this device'; return; }
      playing = true;
      let k = 0;
      const step = () => {
        spans.forEach((s) => s.classList.remove('speaking'));
        if (!playing || k >= spans.length) { playing = false; return; }
        spans[k].classList.add('speaking');
        const sentence = data.lines.flatMap((l) => l.sentences).find((s) => String(s.id) === spans[k].dataset.sentence);
        k += 1;
        speak(sentence.sv, step);
      };
      step();
    });
    stop.addEventListener('click', () => {
      playing = false;
      cancel();
      list.querySelectorAll('.speaking').forEach((s) => s.classList.remove('speaking'));
    });
    const back = el('a', '', 'Back to the text');
    back.href = `/text?id=${id}`;
    box.append(el('p'), back);
  }

  wordQuestion();
}

await showAccount();
await getMe();
const res = await fetch(`/api/reading?id=${id}`, { credentials: 'same-origin' });
if (res.status === 409) {
  // G-03 FR-318 (RQ-462): an own text waits for its word check, step 2 on its own page.
  window.location.replace(`/own?id=${id}`);
} else if (!res.ok) {
  $('title').textContent = 'This text was not found.';
} else {
  data = await res.json();
  setRate(data.speechRate);
  $('title').textContent = data.title;
  document.title = `${data.title} · grove`;
  // G-02 FR-224: texts from the learner's AI and own texts are beta.
  $('beta').hidden = !data.beta;
  $('beta-note').hidden = !data.beta;
  // G-03 FR-302 (B-31): no count of new words; a learner who doesn't know a word marks it.
  $('stats').textContent = `${data.stats.words} words · ${data.stats.share}% known${data.own ? ' · your own text' : ''}${data.kind === 'listening' ? ' · a listening text' : ''}`;
  // G-03 FR-318: an own text shows how hard it is for this learner and the AI's copyright view.
  if (data.own && data.knownShare !== null && data.knownShare < data.targetShare) $('stats').textContent += ` · ${data.knownShare}% known: harder than your usual texts`;
  if (data.copyright && data.copyright.view !== 'free') {
    $('copyright').hidden = false;
    $('copyright').textContent = `Your AI thinks this ${data.copyright.view === 'copyrighted' ? 'is' : 'may be'} copyrighted${data.copyright.note ? `: ${data.copyright.note}` : '.'}`;
  }
  draw($('lines'));
  $('translation').replaceChildren(translationBlock());
  $('questions-card').hidden = data.questions.length === 0;
  renderQuestions($('questions'));

  for (const b of $('ratings').querySelectorAll('button')) {
    b.classList.toggle('chosen', b.dataset.value === data.rating);
    b.addEventListener('click', async () => {
      const r = await post('/api/rating', { textId: id, value: b.dataset.value });
      if (!r.ok) { showMessage($('rating-message'), r.message); return; }
      for (const x of $('ratings').querySelectorAll('button')) x.classList.toggle('chosen', x === b);
      showMessage($('rating-message'), 'Thanks! Your next texts will take this into account.', 'ok');
    });
  }

  $('practise').addEventListener('click', practise);
}

// G-04: the marking step after a rating (FR-401).
async function offerMarking() {
  const r = await fetch(`/api/marking?textId=${id}`, { credentials: 'same-origin' });
  if (!r.ok) return;
  const { words } = await r.json();
  if (!words.length) { $('marking-card').hidden = true; return; }
  const list = $('marking-list');
  list.replaceChildren();
  for (const w of words) {
    const li = el('li');
    li.dataset.lemma = w.lemma;
    li.dataset.kind = w.kind;
    const label = el('span', 'mark-word');
    label.append(el('strong', '', w.lemma), document.createTextNode(` — ${w.en || 'meaning missing'}`));
    li.append(label);
    const b = el('button', 'switch bar-button', 'To remember');
    b.type = 'button';
    b.dataset.mark = 'remember';
    b.setAttribute('aria-pressed', 'false');
    b.addEventListener('click', () => b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true')));
    li.append(b);
    list.append(li);
  }
  $('marking-card').hidden = false;
  showMessage($('marking-message'), '');
  $('marking-card').scrollIntoView({ block: 'nearest' });
}
$('marking-done').addEventListener('click', async () => {
  const marks = [...$('marking-list').querySelectorAll('li')].map((li) => ({
    lemma: li.dataset.lemma,
    kind: li.dataset.kind,
    remember: li.querySelector('[data-mark="remember"]').getAttribute('aria-pressed') === 'true',
  }));
  const r = await post('/api/marking', { textId: id, marks });
  if (!r.ok) { showMessage($('marking-message'), r.message); return; }
  showMessage($('marking-message'), `${r.data.drilled} to drill, ${r.data.fell} to your ground.`, 'ok');
  $('marking-list').replaceChildren();
  $('marking-done').hidden = true;
  $('marking-later').hidden = true;
});
$('marking-later').addEventListener('click', () => { $('marking-card').hidden = true; });
document.getElementById('ratings').addEventListener('click', (event) => {
  if (event.target.closest('button')) setTimeout(offerMarking, 300);
});
if (data?.rating && data?.marking > 0) offerMarking();
// G-09 FR-925: listening while listening mode is open, reading otherwise.
startHeartbeat(() => ($('listening-card') && !$('listening-card').hidden ? 'listening' : 'reading'));

// G-05: listening mode (FR-501…FR-508): blurred text, Play with highlighting, the Sentences sheet with
// replay, count and loop (FR-506, FR-507: sentences.mjs, version A), speed, the one-time voice help, then
// the questions.
let listenIndex = 0;
let listening = false;
const allSentences = () => data.lines.flatMap((l) => l.sentences);

function showVoiceHelp(save) {
  $('voice-help').hidden = false;
  if (save && !data.voiceHelpShown) { data.voiceHelpShown = true; post('/api/settings', { voiceHelpShown: true }); }
}

function highlight(i) {
  document.querySelectorAll('#lines .sentence').forEach((span) => span.classList.toggle('speaking', i !== null && span.dataset.sentence === String(allSentences()[i]?.id)));
}

const sentencesUi = data ? createSentences({
  sentences: allSentences,
  highlight,
  onUser: () => { listening = false; },
  onNoVoice: () => showVoiceHelp(true),
}) : null;
if (sentencesUi) {
  $('listen-pause').after(sentencesUi.button);
  document.querySelector('#listening-card .listen-tools').after(sentencesUi.strip, sentencesUi.note);
}

function stopListening() {
  listening = false;
  sentencesUi?.stop();
}

function reveal() {
  $('lines').classList.remove('blurred');
  $('listen-show').hidden = true;
  $('translation').hidden = false;
  $('questions-card').hidden = data.questions.length === 0;
}

function playFrom(i) {
  if (!listening) return;
  if (i >= allSentences().length) { listening = false; listenIndex = 0; reveal(); return; }
  listenIndex = i;
  sentencesUi.play(i, () => playFrom(i + 1));
}

$('listen').addEventListener('click', () => {
  $('listening-card').hidden = false;
  $('lines').classList.add('blurred');
  $('listen-show').hidden = false;
  $('translation').hidden = true;
  $('questions-card').hidden = true;
  $('speed').value = String(getRate());
  $('speed-value').textContent = `${getRate().toFixed(1)}×`;
  sentencesUi.update();
  if (!hasSwedish() && !data.voiceHelpShown) showVoiceHelp(true);
  $('listening-card').scrollIntoView({ block: 'nearest' });
});
$('listen-play').addEventListener('click', () => {
  if (!hasSwedish()) { showVoiceHelp(true); return; }
  stopListening();
  listening = true;
  playFrom(listenIndex);
});
$('listen-pause').addEventListener('click', stopListening);
$('listen-show').addEventListener('click', reveal);
$('lines').addEventListener('click', (event) => {
  if ($('lines').classList.contains('blurred')) { event.stopPropagation(); event.preventDefault(); reveal(); }
}, true);
$('speed').addEventListener('change', async () => {
  const r = Math.round(Number($('speed').value) * 10) / 10;
  setRate(r);
  $('speed-value').textContent = `${r.toFixed(1)}×`;
  await post('/api/settings', { speechRate: r });
});
$('speed').addEventListener('input', () => { $('speed-value').textContent = `${Number($('speed').value).toFixed(1)}×`; });
$('voice-help-link').addEventListener('click', () => showVoiceHelp(false));
onVoices((has) => { if (has) $('voice-help').hidden = true; });

// G-05 FR-509: a listening text opens in listening mode.
// Listen works once its handler is attached, after the text has loaded (it starts disabled).
$('listen').disabled = !data;
// G-05 FR-504, FR-509 (B-32): only a listening text has Listen; a reading text is for reading.
$('listen').hidden = !data || data.kind !== 'listening';
if (data && data.kind === 'listening') $('listen').click();

