// The word menu (G-03 FR-305, the picked sketch's version A; RQ-456, question-pages/95), shared by the
// reading page and a text inside a session (G-09 FR-933). A sheet, top to bottom: the word with ▶ (only
// with a Swedish voice) and ✕; its state and times met; its meaning here, large, and its dictionary form;
// one named action for the word (↑ Pick up <word> on a ground, new or unmarked word; ↓ Let it fall on a
// drilled leaf, G-04 FR-410, FR-411) with a line saying what it does, turning over in place with a message
// and Undo for 8 s (G-09 FR-926, FR-927); no To remember (G-04 FR-409); the phrases and grammar patterns the
// word is part of as folded rows, each with its own Pick up this phrase / this pattern (a pattern one short
// line with More); Explain and Report sentence as a quiet row of links with a hint each. A name shows one
// line, Report sentence and Not a name? (FR-315). Esc, ✕ and a tap outside close it and give focus back to
// the word. The same sheet holds a question's Report form. All text via textContent.
import { post, showMessage } from './api.mjs';
import { speak, hasSwedish } from './speech.mjs';
import { icon } from './icons.mjs';
import { toast } from './wordbutton.mjs';
import { backCloses } from './way.mjs';

const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; };
const button = (cls, text, onClick) => { const b = el('button', cls, text); b.type = 'button'; if (onClick) b.addEventListener('click', onClick); return b; };

const EXPLAIN_REASONS = [['why_form', 'Why this form'], ['why_here', 'Why this word is here'], ['other_meaning', 'A different meaning than I know'], ['reading', 'Reading'], ['other', 'Other']];
const REPORT_REASONS = [['wrong_answer', 'Wrong answer'], ['bad_translation', 'Bad translation'], ['unnatural', 'Unnatural sentence'], ['wrong_reading', 'Wrong reading'], ['audio', 'Audio'], ['other', 'Other']];

// The first sentence of an explanation (a pattern row's short line).
const shortLine = (text) => {
  const t = String(text ?? '').trim();
  const m = t.match(/^.+?[.!?](\s|$)/);
  return m ? m[0].trim() : t;
};

function reasonsForm(id, reasons, checked, submitLabel, lead) {
  const form = el('form', 'form-box');
  form.id = id;
  form.hidden = true;
  if (lead) form.append(lead);
  const box = el('div', 'reasons');
  for (const [value, label] of reasons) {
    const l = el('label', 'check');
    const input = el('input');
    input.type = 'radio';
    input.name = 'reason';
    input.value = value;
    input.checked = value === checked;
    l.append(input, el('span', '', label));
    box.append(l);
  }
  const note = el('label', '', 'Note (optional)');
  const noteInput = el('input');
  noteInput.type = 'text';
  noteInput.name = 'note';
  noteInput.maxLength = 200;
  note.append(noteInput);
  const submit = el('button', 'main', submitLabel);
  submit.type = 'submit';
  form.append(box, note, submit);
  return form;
}

// `textId` the text; `getData()` its reading payload; `onChange()` redraws the text after a word changed.
export function createWordMenu({ textId, getData, onChange }) {
  const backdrop = el('div', 'sheet-backdrop');
  backdrop.id = 'sheet-backdrop';
  backdrop.hidden = true;
  const sheet = el('section', 'sheet word-menu');
  sheet.id = 'menu';
  sheet.hidden = true;
  sheet.setAttribute('role', 'dialog');
  sheet.setAttribute('aria-modal', 'true');
  sheet.setAttribute('aria-labelledby', 'menu-word');
  const head = el('div', 'sheet-head');
  const word = el('h3', '', '');
  word.id = 'menu-word';
  const say = button('ico', '', () => current && speak(current.token.t));
  say.id = 'menu-say';
  say.append(icon('play'));
  const close = button('ico', '', () => hide());
  close.id = 'menu-close';
  close.setAttribute('aria-label', 'Close');
  close.append(icon('close'));
  head.append(word, say, close);
  const body = el('div', 'menu-body');
  const fallBox = el('div', 'fall-box');
  fallBox.id = 'fall-check';
  fallBox.hidden = true;
  const reportLead = el('p', 'small');
  reportLead.id = 'report-what';
  const explainLead = el('p', 'small', 'Why do you want it explained? Your AI’s answer comes with the next prompt.');
  const explainForm = reasonsForm('explain-form', EXPLAIN_REASONS, 'why_form', 'Ask for an explanation', explainLead);
  const reportForm = reasonsForm('report-form', REPORT_REASONS, 'unnatural', 'Send report', reportLead);
  const message = el('p', 'message');
  message.id = 'menu-message';
  message.setAttribute('role', 'status');
  message.hidden = true;
  const hint = el('p', 'esc-hint', 'Esc, ✕ or a tap outside closes it.');
  sheet.append(head, body, fallBox, explainForm, reportForm, message, hint);
  document.body.append(backdrop, sheet);

  let current = null; // { token, sentence, line, trigger }
  let reportTarget = null;
  let afterReport = null;
  let release = null;

  function hide() {
    if (sheet.hidden) return;
    sheet.hidden = true;
    backdrop.hidden = true;
    const r = release;
    release = null;
    r?.();
    current?.trigger?.focus?.();
  }
  backdrop.addEventListener('click', hide);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !sheet.hidden) { event.preventDefault(); hide(); }
  });

  function show() {
    fallBox.hidden = true;
    explainForm.hidden = true;
    reportForm.hidden = true;
    showMessage(message, '');
    sheet.hidden = false;
    backdrop.hidden = false;
    // FR-922: the phone's Back closes the menu first.
    if (!release) release = backCloses(() => { release = null; sheet.hidden = true; backdrop.hidden = true; });
  }

  const lemmaOf = (token) => token.lemmas?.[0] || token.word;
  const drilledLeaf = (token) => token.status === 'leaf' && !!token.marks?.remember;

  // ↑ Pick up / ↓ Let it fall for any item; `label` names it in the button, `cap` says what it does.
  function actionButton({ leaf, pickText, fallText, label, onPick, onFall, wide }) {
    if (leaf) {
      const b = button(`act out${wide ? ' wide' : ''}`, '', onFall);
      b.append(icon('down'), document.createTextNode(fallText));
      b.setAttribute('aria-label', `Let ${label} fall`);
      return b;
    }
    const b = button(`act fill${wide ? ' wide' : ''}`, '', onPick);
    b.append(icon('up'), document.createTextNode(pickText));
    b.setAttribute('aria-label', `Pick up ${label}`);
    return b;
  }

  // G-04 FR-410: grove asks the meaning once (a pattern or phrase: "Are you sure?"); resolves when fallen.
  function fallCheck({ lemma, kind }, form) {
    return new Promise((resolve) => {
      fallBox.replaceChildren();
      fallBox.hidden = false;
      const done = async (payload) => {
        const r = await post('/api/let-it-fall', { lemma, kind, ...payload });
        if (!r.ok) { showMessage(message, r.message); resolve(false); return; }
        if (r.data.fell) { fallBox.hidden = true; resolve(true); return; }
        // B-28: after a wrong answer, Keep it or Let it fall anyway.
        fallBox.replaceChildren(el('p', 'message bad', 'Not quite. Keep it as a leaf, or let it fall anyway if you know it.'));
        const row = el('div', 'row');
        row.append(button('', 'Keep it', () => { fallBox.hidden = true; resolve(false); }), button('main', 'Let it fall anyway', () => done({ confirmed: true })));
        fallBox.append(row);
      };
      const cancel = button('more-link', 'Cancel', () => { fallBox.hidden = true; resolve(false); });
      if (kind !== 'word') {
        fallBox.append(el('p', '', 'Are you sure you know it?'));
        const row = el('div', 'row');
        row.append(button('', 'Keep it', () => { fallBox.hidden = true; resolve(false); }), button('main', 'Yes, let it fall', () => done({ confirmed: true })));
        fallBox.append(row);
        return;
      }
      fetch(`/api/fall-check?lemma=${encodeURIComponent(lemma)}&kind=${kind}`, { credentials: 'same-origin' })
        .then((r) => (r.ok ? r.json() : { question: null }))
        .then(({ question }) => {
          if (!question) {
            fallBox.append(el('p', '', 'Are you sure you know it?'));
            const row = el('div', 'row');
            row.append(button('', 'Keep it', () => { fallBox.hidden = true; resolve(false); }), button('main', 'Yes, let it fall', () => done({ confirmed: true })));
            fallBox.append(row);
            return;
          }
          fallBox.append(el('p', 'passage', question.sentence), el('p', 'small', `What does “${question.word ?? form}” mean here?`));
          question.options.forEach((option, index) => fallBox.append(button('option', option, () => done({ right: index === question.right }))));
          fallBox.append(cancel);
        });
    });
  }

  async function undo(item, revert) {
    const r = await post('/api/undo', item);
    if (!r.ok) return false;
    revert();
    onChange?.();
    if (current) render();
    return true;
  }

  // The word's own action.
  async function pickWord(token) {
    const data = getData();
    const item = { lemma: lemmaOf(token), kind: 'word' };
    const before = { status: token.status, marks: token.marks, fell: token.fell, lemmas: token.lemmas };
    // An own text's new word is first saved with its AI meaning (G-03 FR-318), then picked up.
    if (data.own && token.status === 'new') {
      const saved = await post('/api/leaf', { textId, form: token.t });
      if (!saved.ok) { showMessage(message, saved.message); return; }
    }
    const r = await post('/api/pick-up', item);
    if (!r.ok) { showMessage(message, r.message); return; }
    const was = token.status;
    token.status = 'leaf';
    token.marks = { remember: true };
    token.fell = null;
    if (!token.lemmas?.length) token.lemmas = [item.lemma];
    onChange?.();
    render();
    const text = was === 'new' ? `${token.t} is a new leaf: due now in Review.` : was === 'ground' ? `${token.t} is a leaf again: due now in Review.` : `${token.t} is drilled now: due in Review.`;
    toast(text, () => undo(item, () => Object.assign(token, before)));
  }

  async function letWordFall(token) {
    const item = { lemma: lemmaOf(token), kind: 'word' };
    const before = { status: token.status, marks: token.marks, fell: token.fell };
    if (!await fallCheck(item, token.t)) { render(); return; }
    token.status = 'ground';
    token.fell = token.marks?.remember ? 'remember' : null;
    token.marks = { remember: false };
    onChange?.();
    render();
    toast(`${token.t} fell to your ground.`, () => undo(item, () => Object.assign(token, before)));
  }

  // A phrase or pattern row's Pick up / Let it fall (FR-411); a ladder pattern not among the text's own
  // is picked up by its ID, a text's pattern (with or without a level, RQ-465) by its name.
  async function pickItem(p, kind) {
    const r = p.fromLadder && kind === 'pattern'
      ? await post('/api/learning/answer', { item: p.id, action: 'pick' })
      : await post('/api/pick-up', { lemma: p.name, kind });
    if (!r.ok) { showMessage(message, r.message); return; }
    const before = { state: p.state, drilled: p.drilled };
    p.state = 'leaf';
    p.drilled = kind === 'pattern' ? 1 : true;
    render();
    toast(`${p.name} is a leaf: due now in Review.`, () => undo({ lemma: p.name.toLowerCase(), kind }, () => Object.assign(p, before)));
  }
  async function letItemFall(p, kind) {
    const before = { state: p.state, drilled: p.drilled };
    if (!await fallCheck({ lemma: p.name, kind }, p.name)) { render(); return; }
    p.state = 'ground';
    p.drilled = kind === 'pattern' ? 0 : false;
    render();
    toast(`${p.name} fell to your ground.`, () => undo({ lemma: p.name.toLowerCase(), kind }, () => Object.assign(p, before)));
  }

  const opened = new Set();
  function foldRow({ key, title, extra, bodyParts, open }) {
    const row = el('div', `prow${open ? ' open' : ''}`);
    const headButton = button('phead', '');
    headButton.setAttribute('aria-expanded', String(open));
    const name = el('span', 'pname');
    name.append(...title);
    const chev = icon('chev');
    chev.classList.add('chev');
    headButton.append(name, ...extra, chev);
    const inner = el('div', 'pbody');
    inner.hidden = !open;
    inner.append(...bodyParts);
    headButton.addEventListener('click', () => {
      if (opened.has(key)) opened.delete(key); else opened.add(key);
      const now = opened.has(key);
      inner.hidden = !now;
      row.classList.toggle('open', now);
      headButton.setAttribute('aria-expanded', String(now));
    });
    row.append(headButton, inner);
    return row;
  }

  const stateChip = (state, text) => el('span', `state-chip ${state}`, text ?? state);

  function quietLink(id, iconName, label, hintText, onClick) {
    const b = button('', '', onClick);
    if (id) b.id = id;
    const lab = el('span', 'lab');
    lab.append(icon(iconName), document.createTextNode(label));
    b.append(lab, el('small', '', hintText));
    return b;
  }

  function reportSentence() {
    openReport({ linePosition: current.line.position }, `Report this sentence: “${current.sentence.sv}”`);
  }

  function render() {
    if (!current) return;
    const { token, sentence } = current;
    const data = getData();
    word.textContent = token.t;
    say.hidden = !hasSwedish();
    say.setAttribute('aria-label', `Say ${token.t} again`);
    sheet.setAttribute('aria-label', `Word menu: ${token.t}`);
    body.replaceChildren();
    if (token.status === 'name') {
      const line = el('div', 'name-line');
      line.append(stateChip('name'), el('p', '', 'A name — grove never counts it as new.'));
      const quiet = el('div', 'quiet');
      quiet.append(
        quietLink('menu-report-line', 'flag', 'Report sentence', 'Something is wrong in it', reportSentence),
        quietLink('menu-not-name', 'help', 'Not a name?', 'Tell grove it is a word here', async () => {
          const r = await post('/api/report', { textId, linePosition: current.line.position, reason: 'not_a_name' });
          if (r.ok) showMessage(message, `Reported (${r.data.code}): the next prompt asks your AI about it.`, 'ok');
          else showMessage(message, r.message);
        }),
      );
      body.append(line, quiet);
      return;
    }
    const facts = el('div', 'menu-state');
    facts.append(stateChip(token.status), el('span', 'facts-sub', token.met ? `met ${token.met} time${token.met === 1 ? '' : 's'}` : 'first time you meet it'));
    body.append(facts);
    // Its meaning here first (FR-306): a form of more than one dictionary word lists each.
    const form = token.lemmas?.length ? token.lemmas.join(' / ') : token.word;
    if (token.senses?.length > 1) {
      const meaning = el('div', 'meaning-big');
      meaning.id = 'menu-meaning';
      meaning.append(...token.senses.map((x) => el('span', 'sense', `${x.lemma}: ${x.en}`)));
      body.append(meaning);
    } else if (token.meaning) {
      const meaning = el('p', 'meaning-big', token.meaning);
      meaning.id = 'menu-meaning';
      body.append(meaning);
    } else {
      const meaning = el('p', 'meaning-big empty', 'No meaning stored for this word yet.');
      meaning.id = 'menu-meaning';
      body.append(meaning, el('p', 'facts-sub', 'Explain asks your AI for one.'));
    }
    const formLine = el('p', 'facts-sub');
    const lemma = el('b', 'menu-lemma', form);
    lemma.id = 'menu-lemma';
    formLine.append(document.createTextNode('Dictionary form '), lemma);
    body.append(formLine);
    if (token.explanation) {
      const ex = el('p', 'sv-expl');
      ex.id = 'menu-explanation';
      ex.append(el('i', '', 'AI'), document.createTextNode(token.explanation));
      body.append(ex);
    }
    // One action for the word, named, with a line saying what it does.
    const action = el('div', 'menu-action');
    action.id = 'menu-action';
    const leaf = drilledLeaf(token);
    action.append(
      actionButton({ leaf, label: token.t, pickText: `Pick up ${token.t}`, fallText: 'Let it fall', wide: true, onPick: () => pickWord(token), onFall: () => letWordFall(token) }),
      el('p', 'act-cap', leaf ? 'Only if you know it now: grove asks its meaning once.' : 'It becomes a leaf, due in Review today.'),
    );
    body.append(action);
    // Part of a phrase.
    const phrases = (token.phrases ?? []).map((name) => (data.phrases ?? []).find((p) => p.name === name) ?? { name, en: null, state: null, drilled: false });
    if (phrases.length) {
      body.append(el('p', 'sec-title', 'Part of a phrase'));
      const list = el('div', 'menu-phrases');
      list.id = 'menu-phrase-list';
      for (const p of phrases) {
        const pleaf = p.state === 'leaf' && !!p.drilled;
        const title = [document.createTextNode(p.name)];
        if (p.en) title.push(el('span', 'pmean', ` · ${p.en}`));
        list.append(foldRow({
          key: `phrase:${p.name}`,
          title,
          extra: p.state ? [stateChip(p.state)] : [],
          open: opened.has(`phrase:${p.name}`),
          bodyParts: [
            el('p', '', p.en ? `“${p.name}” together means ${p.en}.` : `“${p.name}” is a phrase you have met.`),
            actionButton({ leaf: pleaf, label: p.name, pickText: 'Pick up this phrase', fallText: 'Let this phrase fall', onPick: () => pickItem(p, 'phrase'), onFall: () => letItemFall(p, 'phrase') }),
          ],
        }));
      }
      body.append(list);
    }
    // Grammar in this word: the text's patterns whose places include it, then grove's grammar ladder's.
    // Each shows its level where it has one: the ladder's, or a grove text's stored level (RQ-465).
    for (const p of data.ladder || []) p.fromLadder = true;
    const pats = [
      ...(token.patterns || []).map((pid) => data.patterns.find((p) => p.id === pid)).filter(Boolean),
      ...(token.ladder || []).map((pid) => (data.ladder || []).find((p) => p.id === pid)).filter(Boolean),
    ];
    if (pats.length) {
      const title = el('p', 'sec-title', 'Grammar in this word ');
      title.append(el('span', 'n', String(pats.length)));
      body.append(title);
      const list = el('div', 'menu-patterns');
      list.id = 'menu-pattern-list';
      for (const p of pats) {
        const key = `pattern:${p.fromLadder ? p.id : p.name}`;
        const pleaf = p.state === 'leaf' && !!p.drilled;
        const extra = [];
        if (p.level) extra.push(el('span', 'ladder-level', p.level));
        if (p.state === 'leaf') extra.push(stateChip('leaf'));
        const explain = el('p', 'pexplain');
        const full = String(p.explain ?? '');
        const short = shortLine(full);
        explain.append(document.createTextNode(`${short} `));
        const example = el('p', 'ex-line');
        example.hidden = true;
        const at = sentence.sv.toLowerCase().indexOf(String(token.t).toLowerCase());
        if (at >= 0) {
          const mark = el('mark', '', sentence.sv.slice(at, at + token.t.length));
          example.append(document.createTextNode(sentence.sv.slice(0, at)), mark, document.createTextNode(sentence.sv.slice(at + token.t.length)));
        } else example.textContent = sentence.sv;
        const rest = full.slice(short.length).trim();
        const restLine = el('span', 'prest', rest ? ` ${rest}` : '');
        restLine.hidden = true;
        explain.append(restLine);
        const more = button('more-link', 'More', () => { restLine.hidden = false; example.hidden = false; more.remove(); });
        explain.append(more);
        list.append(foldRow({
          key,
          title: [document.createTextNode(p.name)],
          extra,
          open: opened.has(key),
          bodyParts: [explain, example, actionButton({ leaf: pleaf, label: p.name, pickText: 'Pick up this pattern', fallText: 'Let this pattern fall', onPick: () => pickItem(p, 'pattern'), onFall: () => letItemFall(p, 'pattern') })],
        }));
      }
      body.append(list);
    }
    const quiet = el('div', 'quiet');
    quiet.append(
      quietLink('menu-explain', 'help', 'Explain', 'Ask your AI about this word', () => { reportForm.hidden = true; explainForm.hidden = false; explainForm.querySelector('input')?.focus(); }),
      quietLink('menu-report-line', 'flag', 'Report sentence', 'Something is wrong in it', reportSentence),
    );
    body.append(quiet);
  }

  explainForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const r = await post('/api/explain', { sentenceId: current.sentence.id, form: current.token.t, reason: explainForm.elements.reason.value, note: explainForm.elements.note.value.trim() });
    if (r.ok) {
      explainForm.hidden = true;
      explainForm.reset();
      showMessage(message, 'Asked — the next prompt will include it.', 'ok');
    } else showMessage(message, r.message);
  });
  reportForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const r = await post('/api/report', { textId, ...reportTarget, reason: reportForm.elements.reason.value, note: reportForm.elements.note.value.trim() });
    if (r.ok) {
      reportForm.hidden = true;
      reportForm.reset();
      showMessage(message, `Reported (${r.data.code}) — it won’t count, and the next prompt asks for a fix.`, 'ok');
      afterReport?.(reportTarget);
    } else showMessage(message, r.message);
  });

  // A question's or sentence's Report (FR-315), in the same sheet.
  function openReport(target, what, after) {
    reportTarget = target;
    afterReport = after ?? null;
    reportLead.textContent = what;
    if (sheet.hidden) {
      current = null;
      word.textContent = 'Report';
      say.hidden = true;
      body.replaceChildren();
      show();
    }
    explainForm.hidden = true;
    reportForm.hidden = false;
    showMessage(message, '');
  }

  return {
    open(token, sentence, line, trigger) {
      current = { token, sentence, line, trigger };
      opened.clear();
      // FR-305 (question-pages/86): a tap always says the word.
      speak(token.t);
      show();
      render();
    },
    openReport,
    close: hide,
  };
}
