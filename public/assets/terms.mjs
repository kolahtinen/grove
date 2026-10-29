// The terms page. Signed out (or with ?whole=1) it is the whole terms on one page (FR-025). A new sign-in
// that hasn't agreed reads them one section per screen (G-09 FR-911; research R10): Next is enabled after
// 3 seconds, Back goes to the screen before, and the last screen's one Agree, "I am 13 or over and agree
// to the terms", records both (constitution 3.1). The sections are taken from the whole terms below, so
// there is one source.
import { post, showMessage } from './api.mjs';
import { showAccount } from './page.mjs';

const WAIT_MS = 3000;
const $ = (id) => document.getElementById(id);
const me = await showAccount();
const whole = new URLSearchParams(window.location.search).has('whole');

// Each h2 after the title starts a section; the section holds everything up to the next h2.
function sections() {
  const list = [];
  for (const node of [...$('whole-terms').children].slice(1)) {
    if (node.tagName === 'H2') list.push({ title: node.textContent, nodes: [] });
    else if (list.length) list.at(-1).nodes.push(node);
  }
  return list;
}

if (me && !me.termsAgreed && !whole) {
  const steps = sections();
  const section = $('agreement');
  $('whole-terms').hidden = true;
  section.hidden = false;
  let at = 0;
  let timer = null;
  const show = (i) => {
    at = i;
    const last = i === steps.length - 1;
    $('step-count').textContent = `Terms, ${i + 1} of ${steps.length}`;
    $('step-title').textContent = steps[i].title;
    $('step-body').replaceChildren(...steps[i].nodes.map((n) => n.cloneNode(true)));
    $('step-back').hidden = i === 0;
    $('step-next').hidden = last;
    $('step-agree').hidden = !last;
    $('step-whole').hidden = !last;
    $('step-next').disabled = true;
    clearTimeout(timer);
    if (!last) timer = setTimeout(() => { $('step-next').disabled = false; }, WAIT_MS);
    $('step-title').focus();
  };
  $('step-next').addEventListener('click', () => show(at + 1));
  $('step-back').addEventListener('click', () => show(at - 1));
  $('step-agree').addEventListener('click', async () => {
    const result = await post('/api/agree', { agreeTerms: true, confirmAge13: true });
    if (result.ok) {
      // G-08 FR-802: Home plays the leaves-and-ground scene once after agreeing.
      try { sessionStorage.setItem('grove-grow-due', '1'); } catch { /* then it doesn't play */ }
      window.location.assign('/');
    }
    else showMessage(section.querySelector('.message'), result.message);
  });
  show(0);
}
