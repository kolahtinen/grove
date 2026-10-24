// The reading page (FR-301…FR-318): sentences of tappable words, English per the setting, pattern
// marks, the word menu sheet, Explain and Report, Practise and Play. All text via textContent.
import { getMe, post, showMessage } from './api.mjs';
import { showAccount } from './page.mjs';
import { startHeartbeat } from './heartbeat.mjs';
import { speak as say, cancel, hasSwedish, setRate, getRate, onVoices } from './speech.mjs';

const speak = (text, onend) => say(text, { onend });

const $ = (id) => document.getElementById(id);
const id = Number(new URLSearchParams(window.location.search).get('id'));
const STATUS = { new: 'New word', leaf: 'Leaf — a word you are learning', ground: 'In your ground — you know it', name: 'Name — never counts as new' };
let data = null;
let current = null; // { token, sentence, line }
let showEn = true;
let playing = false;

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

// Colour classes (FR-413): To read / To remember / both, fallen from each, another reading.
function markClass(tok) {
  let c = '';
  if (tok.marks?.read && tok.marks?.remember) c += ' m-both';
  else if (tok.marks?.remember) c += ' m-remember';
  else if (tok.marks?.read) c += ' m-read';
  else if (tok.fell) c += ` f-${tok.fell}`;
  if ((tok.lemmas?.length || 0) > 1) c += ' other-reading';
  return c;
}

// Renders lines into a list; with `practice`, words aren't buttons and sentences can be highlighted.
function renderLines(list, { tappable = true } = {}) {
  list.replaceChildren();
  for (const line of data.lines) {
    const li = el('li', line.reported ? 'reported' : '');
    const sv = el('p', 'sv passage');
    for (const s of line.sentences) {
      const span = el('span', 'sentence');
      span.dataset.sentence = s.id;
      for (const tok of s.tokens) {
        if (!tok.word) { span.append(document.createTextNode(tok.t)); continue; }
        const w = el(tappable ? 'button' : 'span', `w ${tok.status}${tok.patterns?.length ? ' pattern' : ''}${markClass(tok)}`, tok.t);
        if (tappable) {
          w.type = 'button';
          w.addEventListener('click', () => openMenu(tok, s, line));
        }
        span.append(w);
      }
      if (s.newCount > 0) span.append(el('span', 'new-count', `${s.newCount} new`));
      sv.append(span, document.createTextNode(' '));
    }
    li.append(sv);
    if (line.en) {
      const en = el('p', 'en', line.en);
      en.hidden = !showEn;
      li.append(en);
      if (!showEn) {
        const peek = el('button', 'bar-button en-toggle', 'English');
        peek.type = 'button';
        peek.addEventListener('click', () => { en.hidden = !en.hidden; });
        li.append(peek);
      }
    }
    list.append(li);
  }
}

function openMenu(token, sentence, line) {
  current = { token, sentence, line };
  speak(token.t);
  $('menu-word').textContent = token.t;
  $('menu-status').textContent = STATUS[token.status] || '';
  $('menu-status').className = `menu-status ${token.status}`;
  $('menu-lemma').textContent = token.lemmas?.length ? token.lemmas.join(' / ') : token.status === 'name' ? '—' : token.word;
  $('menu-meaning').textContent = token.status === 'name' ? '—' : token.meaning || 'meaning missing';
  $('menu-explanation').hidden = !token.explanation;
  $('menu-explanation').textContent = token.explanation || '';
  const phrases = token.phrases || [];
  $('menu-phrases').hidden = phrases.length === 0;
  $('menu-phrase-list').replaceChildren(...phrases.map((p) => el('li', '', p)));
  const pats = (token.patterns || []).map((pid) => data.patterns.find((p) => p.id === pid)).filter(Boolean);
  $('menu-patterns').hidden = pats.length === 0;
  $('menu-pattern-list').replaceChildren(...pats.map((p) => {
    const li = el('li');
    li.append(el('strong', '', p.name), document.createTextNode(` — ${p.explain || ''}`));
    return li;
  }));
  $('menu-save').hidden = !(data.own && token.status === 'new');
  // G-04: times met, the two switches, Let it fall, Pick up (FR-408…FR-411).
  $('menu-met').textContent = token.met ? `Met ${token.met} time${token.met === 1 ? '' : 's'}` : '';
  $('menu-marks').hidden = token.status === 'name';
  setSwitch($('menu-read'), !!token.marks?.read);
  setSwitch($('menu-remember'), !!token.marks?.remember);
  $('menu-fall').hidden = token.status !== 'leaf';
  $('menu-pickup').hidden = token.status !== 'ground';
  $('fall-check').hidden = true;
  $('menu-explain').hidden = token.status === 'name';
  $('explain-form').hidden = true;
  $('report-form').hidden = true;
  showMessage($('menu-message'), '');
  $('menu').hidden = false;
  $('sheet-backdrop').hidden = false;
}

function closeMenu() {
  $('menu').hidden = true;
  $('sheet-backdrop').hidden = true;
}

let reportTarget = null;
function openReport(target, what) {
  reportTarget = target;
  $('report-what').textContent = what;
  $('explain-form').hidden = true;
  $('report-form').hidden = false;
  if ($('menu').hidden) {
    $('menu-word').textContent = 'Report';
    $('menu-status').textContent = '';
    for (const id2 of ['menu-explanation', 'menu-phrases', 'menu-patterns']) $(id2).hidden = true;
    $('menu-lemma').textContent = '—';
    $('menu-meaning').textContent = '—';
    $('menu').hidden = false;
    $('sheet-backdrop').hidden = false;
  }
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
    report.addEventListener('click', () => openReport({ questionPosition: q.position }, `Question ${q.position + 1}: ${q.q}`));
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
        if (line?.en && showEn) box.append(el('p', 'en practice-en', line.en));
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
    renderLines(list, { tappable: false });
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
if (!res.ok) {
  $('title').textContent = 'This text was not found.';
} else {
  data = await res.json();
  showEn = data.showTranslations;
  setRate(data.speechRate);
  $('title').textContent = data.title;
  document.title = `${data.title} · grove`;
  $('stats').textContent = `${data.stats.words} words · ${data.stats.newWords} new (${data.stats.share}% known)${data.own ? ' · your own text' : ''}`;
  $('toggle-en').textContent = `English: ${showEn ? 'on' : 'off'}`;
  $('toggle-en').setAttribute('aria-pressed', String(showEn));
  renderLines($('lines'));
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

  $('toggle-en').addEventListener('click', async () => {
    showEn = !showEn;
    await post('/api/settings', { showTranslations: showEn });
    $('toggle-en').textContent = `English: ${showEn ? 'on' : 'off'}`;
    $('toggle-en').setAttribute('aria-pressed', String(showEn));
    renderLines($('lines'));
  });
  $('practise').addEventListener('click', practise);
}

$('menu-close').addEventListener('click', closeMenu);
$('sheet-backdrop').addEventListener('click', closeMenu);
$('menu-explain').addEventListener('click', () => { $('report-form').hidden = true; $('explain-form').hidden = false; });
$('menu-report-line').addEventListener('click', () => {
  if (!current) return;
  openReport({ linePosition: current.line.position }, `Sentence: ${current.sentence.sv}`);
});
$('explain-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.target;
  const result = await post('/api/explain', { sentenceId: current.sentence.id, form: current.token.t, reason: form.elements.reason.value, note: form.elements.note.value.trim() });
  if (result.ok) {
    form.hidden = true;
    form.reset();
    showMessage($('menu-message'), 'Asked — the next prompt will include it.', 'ok');
  } else showMessage($('menu-message'), result.message);
});
$('report-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.target;
  const result = await post('/api/report', { textId: id, ...reportTarget, reason: form.elements.reason.value, note: form.elements.note.value.trim() });
  if (result.ok) {
    form.hidden = true;
    form.reset();
    showMessage($('menu-message'), `Reported (${result.data.code}) — it won’t count, and the next prompt asks for a fix.`, 'ok');
    if (reportTarget.questionPosition !== undefined) {
      const q = data.questions.find((x) => x.position === reportTarget.questionPosition);
      if (q) q.reported = true;
      renderQuestions($('questions'));
    }
  } else showMessage($('menu-message'), result.message);
});
$('menu-save').addEventListener('click', async () => {
  const result = await post('/api/leaf', { textId: id, form: current.token.t });
  if (result.ok) {
    current.token.status = 'leaf';
    $('menu-save').hidden = true;
    $('menu-status').textContent = STATUS.leaf;
    showMessage($('menu-message'), 'Saved as a leaf.', 'ok');
  } else showMessage($('menu-message'), result.message);
});

// G-04: switches, Let it fall, Pick up in the menu (FR-409…FR-411).
function setSwitch(button, on) {
  button.setAttribute('aria-pressed', String(on));
}
const itemOf = (token) => ({ lemma: token.lemmas?.[0] || token.word, kind: 'word' });
async function toggleMark(which) {
  const token = current.token;
  const marks = { read: !!token.marks?.read, remember: !!token.marks?.remember };
  marks[which] = !marks[which];
  const result = await post('/api/marks', { ...itemOf(token), ...marks });
  if (!result.ok) { showMessage($('menu-message'), result.message); return; }
  token.marks = { read: result.data.read, remember: result.data.remember };
  token.status = result.data.state === 'ground' ? 'ground' : 'leaf';
  if (!token.lemmas?.length) token.lemmas = [itemOf(token).lemma];
  setSwitch($('menu-read'), token.marks.read);
  setSwitch($('menu-remember'), token.marks.remember);
  $('menu-status').textContent = STATUS[token.status];
  $('menu-fall').hidden = token.status !== 'leaf';
  $('menu-pickup').hidden = token.status !== 'ground';
  renderLines($('lines'));
}
$('menu-read').addEventListener('click', () => toggleMark('read'));
$('menu-remember').addEventListener('click', () => toggleMark('remember'));

$('menu-fall').addEventListener('click', async () => {
  const item = itemOf(current.token);
  const res2 = await fetch(`/api/fall-check?lemma=${encodeURIComponent(item.lemma)}&kind=${item.kind}`, { credentials: 'same-origin' });
  const { question } = res2.ok ? await res2.json() : { question: null };
  const box = $('fall-check');
  box.replaceChildren();
  box.hidden = false;
  const done = async (payload) => {
    const r = await post('/api/let-it-fall', { ...item, ...payload });
    if (r.ok && r.data.fell) {
      current.token.status = 'ground';
      current.token.fell = current.token.marks?.read && current.token.marks?.remember ? 'both' : current.token.marks?.remember ? 'remember' : current.token.marks?.read ? 'read' : null;
      current.token.marks = { read: false, remember: false };
      showMessage($('menu-message'), 'It fell to your ground.', 'ok');
      renderLines($('lines'));
    } else showMessage($('menu-message'), 'Not quite — it stays a leaf for now.');
    box.hidden = true;
    $('menu-fall').hidden = current.token.status !== 'leaf';
  };
  if (!question) {
    box.append(el('p', '', 'Are you sure you know it?'));
    const yes = el('button', 'main', 'Yes, let it fall');
    yes.type = 'button';
    yes.addEventListener('click', () => done({ confirmed: true }));
    box.append(yes);
    return;
  }
  box.append(el('p', 'passage', question.sentence), el('p', 'small', `What does “${question.word}” mean here?`));
  question.options.forEach((option, index) => {
    const b = el('button', 'option', option);
    b.type = 'button';
    b.addEventListener('click', () => done({ right: index === question.right }));
    box.append(b);
  });
});

$('menu-pickup').addEventListener('click', async () => {
  const r = await post('/api/pick-up', itemOf(current.token));
  if (!r.ok) { showMessage($('menu-message'), r.message); return; }
  current.token.status = 'leaf';
  current.token.marks = { read: true, remember: false };
  current.token.fell = null;
  setSwitch($('menu-read'), true);
  $('menu-status').textContent = STATUS.leaf;
  $('menu-pickup').hidden = true;
  showMessage($('menu-message'), 'Picked up — it is due for review now.', 'ok');
  renderLines($('lines'));
});

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
    for (const [key, text] of [['read', 'To read'], ['remember', 'To remember']]) {
      const b = el('button', 'switch bar-button', text);
      b.type = 'button';
      b.dataset.mark = key;
      b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', () => b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true')));
      li.append(b);
    }
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
    read: li.querySelector('[data-mark="read"]').getAttribute('aria-pressed') === 'true',
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
startHeartbeat();

// G-05: listening mode (FR-501…FR-508): blurred text, Play with highlighting, replay with count, loop,
// speed, the one-time voice help, then the questions.
const counts = new Map();
let loopId = null;
let listenIndex = 0;
let listening = false;
const allSentences = () => data.lines.flatMap((l) => l.sentences);

function showVoiceHelp(save) {
  $('voice-help').hidden = false;
  if (save && !data.voiceHelpShown) { data.voiceHelpShown = true; post('/api/settings', { voiceHelpShown: true }); }
}

function renderListenList() {
  const list = $('listen-list');
  list.replaceChildren();
  allSentences().forEach((s, i) => {
    const li = el('li', 'listen-row');
    li.dataset.index = String(i);
    const replay = el('button', 'bar-button', 'Replay');
    replay.type = 'button';
    replay.addEventListener('click', () => { stopListening(); playOne(i); });
    const loop = el('button', 'bar-button switch', 'Loop');
    loop.type = 'button';
    loop.setAttribute('aria-pressed', String(loopId === i));
    loop.addEventListener('click', () => {
      const on = loopId !== i;
      stopListening();
      loopId = on ? i : null;
      renderListenList();
      if (on) playOne(i);
    });
    const count = el('span', 'small muted play-count', counts.get(i) ? `played ${counts.get(i)}×` : '');
    const text = el('span', 'listen-text', `${i + 1}`);
    li.append(text, replay, loop, count);
    list.append(li);
  });
}

function highlight(i) {
  document.querySelectorAll('#lines .sentence').forEach((span) => span.classList.toggle('speaking', String(i) !== 'null' && span.dataset.sentence === String(allSentences()[i]?.id)));
  document.querySelectorAll('#listen-list .listen-row').forEach((row) => row.classList.toggle('speaking', row.dataset.index === String(i)));
}

function playOne(i, onend) {
  const s = allSentences()[i];
  if (!s) return;
  if (!hasSwedish()) { showVoiceHelp(true); return; }
  counts.set(i, (counts.get(i) || 0) + 1);
  renderListenList();
  highlight(i);
  speak(s.sv, () => {
    if (loopId === i) { playOne(i); return; }
    highlight(null);
    onend?.();
  });
}

function stopListening() {
  listening = false;
  loopId = null;
  cancel();
  highlight(null);
}

function reveal() {
  $('lines').classList.remove('blurred');
  document.querySelectorAll('#lines .en').forEach((en) => { en.hidden = !showEn; });
  $('questions-card').hidden = data.questions.length === 0;
}

function playFrom(i) {
  if (!listening) return;
  if (i >= allSentences().length) { listening = false; listenIndex = 0; reveal(); return; }
  listenIndex = i;
  playOne(i, () => playFrom(i + 1));
}

$('listen').addEventListener('click', () => {
  $('listening-card').hidden = false;
  $('lines').classList.add('blurred');
  document.querySelectorAll('#lines .en').forEach((en) => { en.hidden = true; });
  $('questions-card').hidden = true;
  $('speed').value = String(getRate());
  $('speed-value').textContent = `${getRate().toFixed(1)}×`;
  renderListenList();
  if (!hasSwedish() && !data.voiceHelpShown) showVoiceHelp(true);
  $('listening-card').scrollIntoView({ block: 'nearest' });
});
$('listen-play').addEventListener('click', () => {
  if (!hasSwedish()) { showVoiceHelp(true); return; }
  loopId = null;
  listening = true;
  playFrom(listenIndex);
});
$('listen-pause').addEventListener('click', () => { listening = false; loopId = null; cancel(); });
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
