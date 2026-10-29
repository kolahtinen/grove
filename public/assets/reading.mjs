// The reading page (FR-301…FR-321): sentences of tappable words, one Show translation, pattern
// marks, the word menu sheet, Explain and Report, Practise and Play. All text via textContent.
import { getMe, post, showMessage } from './api.mjs';
import { showAccount } from './page.mjs';
import { startHeartbeat } from './heartbeat.mjs';
import { speak as say, cancel, hasSwedish, setRate, getRate, onVoices } from './speech.mjs';

const speak = (text, onend) => say(text, { onend });

const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(window.location.search);
const id = Number(params.get('id'));
// Opened from a session (G-09 FR-904): the session's id and the exercise's index.
const session = params.has('session') ? { id: Number(params.get('session')), index: Number(params.get('index')) } : null;
const STATUS = { new: 'New word', leaf: 'Leaf — a word you are learning', ground: 'In your ground — you know it', name: 'Name — never counts as new' };
let data = null;
let current = null; // { token, sentence, line }
let playing = false;

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

// Colour classes (FR-413): To remember, and the marks a word had when it fell (To read and both only
// for words that fell before addendum 003). No mark for a form of more than one word (FR-306).
function markClass(tok) {
  if (tok.marks?.remember) return ' m-remember';
  if (tok.fell) return ` f-${tok.fell}`;
  return '';
}

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

// Renders lines into a list; with `practice`, words aren't buttons and sentences can be highlighted.
function renderLines(list, { tappable = true } = {}) {
  list.replaceChildren();
  for (const line of data.lines) {
    const li = el('li', line.reported ? 'reported' : '');
    const sv = el('p', 'sv passage');
    for (const s of line.sentences) {
      const span = el('span', 'sentence');
      span.dataset.sentence = s.id;
      // A word keeps the punctuation right before and after it on its line (FR-320): opening marks
      // without a space after them and closing marks without a space before them go in one unbreakable group.
      let group = null;
      let lead = '';
      s.tokens.forEach((tok, k) => {
        if (!tok.word) {
          const next = s.tokens[k + 1];
          if (group && !/^\s/.test(tok.t)) {
            const [stuck, rest] = splitTrailing(tok.t);
            group.append(document.createTextNode(stuck));
            if (rest) { span.append(document.createTextNode(rest)); group = null; }
          } else if (next?.word && !/\s$/.test(tok.t)) {
            const m = tok.t.match(/^(.*\s)?(\S*)$/s);
            if (m[1]) span.append(document.createTextNode(m[1]));
            lead = m[2];
            group = null;
          } else {
            span.append(document.createTextNode(tok.t));
            group = null;
          }
          return;
        }
        const w = el(tappable ? 'button' : 'span', `w ${tok.status}${tok.patterns?.length ? ' pattern' : ''}${markClass(tok)}`, tok.t);
        if (tappable) {
          w.type = 'button';
          w.addEventListener('click', () => openMenu(tok, s, line));
        }
        group = el('span', 'nb');
        if (lead) { group.append(document.createTextNode(lead)); lead = ''; }
        group.append(w);
        span.append(group);
      });
      if (s.newCount > 0) span.append(el('span', 'new-count', `${s.newCount} new`));
      sv.append(span, document.createTextNode(' '));
    }
    li.append(sv);
    list.append(li);
  }
}

// Punctuation stuck to the word before it, up to the first space; the rest.
function splitTrailing(text) {
  const at = text.search(/\s/);
  return at === -1 ? [text, ''] : [text.slice(0, at), text.slice(at)];
}

function openMenu(token, sentence, line) {
  current = { token, sentence, line };
  // FR-305 (question-pages/86): a tap always says the word; ▶ says it again, only with a Swedish voice.
  speak(token.t);
  $('menu-say').hidden = !hasSwedish();
  $('menu-say').setAttribute('aria-label', `Say ${token.t} again`);
  $('menu-word').textContent = token.t;
  $('menu-status').textContent = STATUS[token.status] || '';
  $('menu-status').className = `menu-status ${token.status}`;
  // A form of more than one dictionary word lists each with its meaning (FR-306).
  $('menu-lemma').textContent = token.lemmas?.length ? token.lemmas.join(' / ') : token.status === 'name' ? '—' : token.word;
  if (token.senses?.length > 1) {
    $('menu-meaning').replaceChildren(...token.senses.map((x) => el('span', 'sense', `${x.lemma}: ${x.en}`)));
  } else {
    $('menu-meaning').textContent = token.status === 'name' ? '—' : token.meaning || '';
  }
  $('menu-explanation').hidden = !token.explanation;
  $('menu-explanation').textContent = token.explanation || '';
  const phrases = token.phrases || [];
  $('menu-phrases').hidden = phrases.length === 0;
  $('menu-phrase-list').replaceChildren(...phrases.map((p) => el('li', '', p)));
  const pats = (token.patterns || []).map((pid) => data.patterns.find((p) => p.id === pid)).filter(Boolean);
  $('menu-patterns').hidden = pats.length === 0;
  $('menu-pattern-list').replaceChildren(...pats.map((p) => {
    const li = el('li');
    li.append(el('strong', '', p.name), document.createTextNode(` — ${p.explain || ''} `));
    // Pick up a pattern of the sentence too (FR-411; addendum 003, O-16).
    if (!p.drilled) {
      const pick = el('button', 'bar-button', 'Pick up');
      pick.type = 'button';
      pick.addEventListener('click', async () => {
        const r = p.state === 'ground'
          ? await post('/api/pick-up', { lemma: p.name, kind: 'pattern' })
          : await post('/api/marks', { lemma: p.name, kind: 'pattern', remember: true });
        if (!r.ok) { showMessage($('menu-message'), r.message); return; }
        p.state = 'leaf';
        p.drilled = 1;
        pick.remove();
        showMessage($('menu-message'), `Picked up “${p.name}” — it is due for review now.`, 'ok');
      });
      li.append(pick);
    }
    return li;
  }));
  $('menu-save').hidden = !(data.own && token.status === 'new');
  // G-04: times met, the To remember switch, Let it fall, Pick up (FR-408…FR-411).
  $('menu-met').textContent = token.met ? `Met ${token.met} time${token.met === 1 ? '' : 's'}` : '';
  $('menu-marks').hidden = token.status === 'name';
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
    renderLines(list, { tappable: false });
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
  // G-03 FR-318: an own text waits for its AI round, piece by piece.
  $('reading-card').hidden = true;
  await showOwnRound();
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
  $('stats').textContent = `${data.stats.words} words · ${data.stats.newWords} new (${data.stats.share}% known)${data.own ? ' · your own text' : ''}${data.kind === 'listening' ? ' · a listening text' : ''}`;
  // G-03 FR-318: an own text shows how hard it is for this learner and the AI's copyright view.
  if (data.own && data.knownShare !== null && data.knownShare < data.targetShare) $('stats').textContent += ` · ${data.knownShare}% known: harder than your usual texts`;
  if (data.copyright && data.copyright.view !== 'free') {
    $('copyright').hidden = false;
    $('copyright').textContent = `Your AI thinks this ${data.copyright.view === 'copyrighted' ? 'is' : 'may be'} copyrighted${data.copyright.note ? `: ${data.copyright.note}` : '.'}`;
  }
  renderLines($('lines'));
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
async function toggleRemember() {
  const token = current.token;
  const result = await post('/api/marks', { ...itemOf(token), remember: !token.marks?.remember });
  if (!result.ok) { showMessage($('menu-message'), result.message); return; }
  token.marks = { remember: result.data.remember };
  token.status = result.data.state === 'ground' ? 'ground' : 'leaf';
  if (!token.lemmas?.length) token.lemmas = [itemOf(token).lemma];
  setSwitch($('menu-remember'), token.marks.remember);
  $('menu-status').textContent = STATUS[token.status];
  $('menu-fall').hidden = token.status !== 'leaf';
  $('menu-pickup').hidden = token.status !== 'ground';
  renderLines($('lines'));
}
$('menu-remember').addEventListener('click', toggleRemember);
$('menu-say').addEventListener('click', () => { if (current) speak(current.token.t); });

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
      current.token.fell = current.token.marks?.remember ? 'remember' : null;
      current.token.marks = { remember: false };
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
  current.token.marks = { remember: true };
  current.token.fell = null;
  setSwitch($('menu-remember'), true);
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
  if (session) setTimeout(backToSession, 800);
});
// G-09 FR-904: a text in a session ends with Done, or with the marking step; then back to the session.
async function backToSession() {
  const r = await post('/api/session/next', { sessionId: session.id, index: session.index });
  if (!r.ok && r.status !== 409) { showMessage($('marking-message'), r.message); return; }
  window.location.assign(`/session?id=${session.id}`);
}
if (session) {
  const bar = el('section', 'card session-head');
  bar.append(el('p', 'session-line', 'Part of your session'));
  const done = el('button', 'main', 'Done — next exercise');
  done.type = 'button';
  done.id = 'session-done';
  done.addEventListener('click', backToSession);
  bar.append(done);
  document.querySelector('main').prepend(bar);
}
$('marking-later').addEventListener('click', () => { $('marking-card').hidden = true; });
document.getElementById('ratings').addEventListener('click', (event) => {
  if (event.target.closest('button')) setTimeout(offerMarking, 300);
});
if (data?.rating && data?.marking > 0) offerMarking();
// G-09 FR-925: listening while listening mode is open, reading otherwise.
startHeartbeat(() => ($('listening-card') && !$('listening-card').hidden ? 'listening' : 'reading'));

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
  // Only the count changes, so the row's buttons stay put while a sentence loops (FR-506, FR-507).
  const count = $('listen-list').querySelector(`.listen-row[data-index="${i}"] .play-count`);
  if (count) count.textContent = `played ${counts.get(i)}×`;
  else renderListenList();
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
  $('translation').hidden = false;
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
  $('translation').hidden = true;
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

// G-05 FR-509: a listening text opens in listening mode.
// Listen works once its handler is attached, after the text has loaded (it starts disabled).
$('listen').disabled = !data;
if (data && data.kind === 'listening') $('listen').click();

// G-03 FR-318: the own-text AI round. Copy prompt says "Copied to clipboard"; only when copying fails
// is the prompt shown, selected (G-02 FR-201).
async function showOwnRound() {
  const r = await fetch(`/api/own-text?id=${id}`, { credentials: 'same-origin' });
  if (!r.ok) { $('title').textContent = 'This text was not found.'; $('reading-card').hidden = false; return; }
  const own = await r.json();
  if (own.ready) { window.location.reload(); return; }
  $('own-round').hidden = false;
  $('own-title').textContent = own.title;
  document.title = `${own.title} · grove`;
  $('own-piece').textContent = own.of > 1 ? `Piece ${own.piece} of ${own.of}` : '';
  $('own-prompt').value = own.prompt;
  $('own-prompt').hidden = true;
  $('own-copied').hidden = true;
  $('own-round').dataset.exchange = String(own.exchangeId);
}
$('own-copy').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText($('own-prompt').value);
    $('own-copied').textContent = 'Copied to clipboard';
  } catch {
    $('own-prompt').hidden = false;
    $('own-prompt').focus();
    $('own-prompt').select();
    $('own-copied').textContent = 'Copying was blocked: the prompt is selected below, copy it by hand.';
  }
  $('own-copied').hidden = false;
});
$('own-add').addEventListener('click', async () => {
  const answer = $('own-answer').value.trim();
  if (!answer) return;
  const r = await post('/api/answer', { exchangeId: Number($('own-round').dataset.exchange), answer });
  if (!r.ok) { showMessage($('own-message'), r.message); return; }
  $('own-answer').value = '';
  const problems = $('own-problems');
  problems.replaceChildren();
  for (const p of r.data.problems || []) { const li = document.createElement('li'); li.textContent = p; problems.append(li); }
  problems.hidden = !(r.data.problems || []).length;
  if (r.data.result === 'needs_fix') showMessage($('own-message'), 'Some words have no meaning yet. Copy the new prompt into the same chat.');
  else if (r.data.ready) { window.location.reload(); return; } else showMessage($('own-message'), `Piece ${r.data.piece} added. Now the next piece.`, 'ok');
  await showOwnRound();
});
