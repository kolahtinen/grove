// The dictionaries' one-sided button (G-09 FR-926, the picked sketch's version B; FR-927; G-04 FR-410,
// FR-411): a leaf shows ↓ Let it fall, a word in the ground or not yet the learner's ↑ Pick up. Pick up
// saves at once; Let it fall asks the meaning in a sheet (Keep it or Let it fall anyway after a wrong
// answer). Then a message at the bottom says what happened, with Undo for 8 seconds. All text via
// textContent.
import { post } from './api.mjs';
import { backCloses } from './way.mjs';

const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; };
const LABELS = { leaf: 'leaf', ground: 'ground', new: 'new' };

// The row's state label (leaf, ground, new).
export function stateLabel(state) {
  const s = LABELS[state] ? state : 'new';
  return el('span', `text-state ${s}`, LABELS[s]);
}

let toastTimer = null;
export function toast(text, undo) {
  document.querySelector('.toast')?.remove();
  clearTimeout(toastTimer);
  const box = el('div', 'toast');
  box.setAttribute('role', 'status');
  box.append(el('span', '', text));
  if (undo) {
    const b = el('button', 'bar-button', 'Undo');
    b.type = 'button';
    b.addEventListener('click', async () => {
      b.disabled = true;
      const ok = await undo();
      box.querySelector('span').textContent = ok ? 'Undone.' : 'That can’t be undone any more.';
      b.remove();
    });
    box.append(b);
  }
  document.body.append(box);
  toastTimer = setTimeout(() => box.remove(), 8000);
}

// G-04 FR-410: the meaning check in a sheet; resolves true when the leaf fell.
function fallCheck(item) {
  return new Promise((resolve) => {
    const backdrop = el('div', 'sheet-backdrop');
    const sheet = el('section', 'sheet fall-sheet');
    sheet.setAttribute('role', 'dialog');
    sheet.setAttribute('aria-modal', 'true');
    sheet.setAttribute('aria-label', `Let ${item.lemma} fall`);
    const head = el('div', 'sheet-head');
    const close = el('button', 'bar-button', 'Close');
    close.type = 'button';
    head.append(el('h3', '', item.lemma), close);
    const body = el('div', 'fall-body');
    sheet.append(head, body);
    let release = null;
    const finish = (fell) => { backdrop.remove(); sheet.remove(); const r = release; release = null; r?.(); resolve(fell); };
    close.addEventListener('click', () => finish(false));
    backdrop.addEventListener('click', () => finish(false));
    document.body.append(backdrop, sheet);
    release = backCloses(() => { release = null; backdrop.remove(); sheet.remove(); resolve(false); });
    const send = async (payload) => (await post('/api/let-it-fall', { lemma: item.lemma, kind: item.kind, ...payload })).data?.fell === true;
    const button = (text, cls, onClick) => { const b = el('button', cls, text); b.type = 'button'; b.addEventListener('click', onClick); return b; };
    const anyway = () => {
      body.append(el('p', 'message bad', `Not quite. Keep ${item.lemma} as a leaf, or let it fall anyway if you know it.`));
      const row = el('div', 'row');
      row.append(button('Keep it', '', () => finish(false)), button('Let it fall anyway', 'main', async () => finish(await send({ confirmed: true }))));
      body.append(row);
      row.querySelector('button').focus();
    };
    fetch(`/api/fall-check?lemma=${encodeURIComponent(item.lemma)}&kind=${item.kind}`, { credentials: 'same-origin' })
      .then((r) => (r.ok ? r.json() : { question: null }))
      .then(({ question }) => {
        if (!question) {
          body.append(el('p', '', `Let ${item.lemma} fall? It joins your ground.`));
          body.append(button('Yes, let it fall', 'main', async () => finish(await send({ confirmed: true }))));
          body.querySelector('button').focus();
          return;
        }
        body.append(el('p', '', `Before it falls, one check: what does “${question.word}” mean here?`), el('p', 'passage', question.sentence));
        question.options.forEach((option, index) => {
          body.append(button(option, 'option', async (e) => {
            for (const b of body.querySelectorAll('button.option')) b.disabled = true;
            const right = index === question.right;
            e.target.classList.add(right ? 'right' : 'wrong');
            if (right) finish(await send({ right: true }));
            else { await send({ right: false }); anyway(); }
          }));
        });
        body.querySelector('button.option')?.focus();
      });
  });
}

// One row's button. `item` is { lemma, kind, state } with state leaf, ground or anything else (new);
// `onChange(state)` is told the new state so the row can update its label.
export function wordButton(item, onChange = () => {}) {
  const b = el('button', 'flip');
  b.type = 'button';
  const draw = () => {
    const leaf = item.state === 'leaf';
    b.className = `flip ${leaf ? 'to-fall' : 'to-up'}`;
    b.textContent = leaf ? '↓ Let it fall' : '↑ Pick up';
    b.setAttribute('aria-label', leaf ? `Let ${item.lemma} fall` : `Pick up ${item.lemma}`);
  };
  const set = (state) => { item.state = state; draw(); b.classList.add('turned'); onChange(state); };
  const undo = (back) => async () => {
    const r = await post('/api/undo', { lemma: item.lemma, kind: item.kind });
    if (r.ok) set(back);
    return r.ok;
  };
  b.addEventListener('click', async () => {
    const was = item.state;
    if (was === 'leaf') {
      if (await fallCheck(item)) { set('ground'); toast(`${item.lemma} fell to your ground. Well done.`, undo('leaf')); }
      b.focus();
      return;
    }
    b.disabled = true;
    b.textContent = 'Saving';
    const r = await post('/api/pick-up', { lemma: item.lemma, kind: item.kind });
    b.disabled = false;
    if (!r.ok) {
      draw();
      const row = b.closest('li');
      row?.querySelector('.rowmsg')?.remove();
      const msg = el('p', 'rowmsg message bad', 'Couldn’t pick it up just now. ');
      const again = el('button', 'bar-button', 'Try again');
      again.type = 'button';
      again.addEventListener('click', () => { msg.remove(); b.click(); });
      msg.append(again);
      row?.append(msg);
      return;
    }
    set('leaf');
    toast(was === 'ground' ? `${item.lemma} is a leaf again: due now in Review.` : `${item.lemma} is a new leaf: due now in Review.`, undo(was === 'ground' ? 'ground' : 'new'));
  });
  draw();
  return b;
}
