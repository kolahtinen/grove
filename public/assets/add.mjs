// Add a text (G-09 FR-918, the picked sketch's version A; RQ-460, question-pages/92): a chooser of three big
// choices, one under the other, each with its icon, name, explainer and an arrow — From the common library,
// Texts from your AI (Beta) and Your own text (Beta) — each opening its own page. A way half done (an AI
// part waiting for its answer, an own text waiting for its word check) shows "Under way: step i of n" with
// Continue, which opens it where the learner was. Sent by a session's offer, the fill bars and the way
// back come from way.mjs; Your own text says when it can't help (FR-920). All text via textContent.
import { showAccount } from './page.mjs';
import { icon } from './icons.mjs';
import { kindsStillNeeded, onOfferChange, carryFromSession, fromSession } from './way.mjs';
import { aiStep } from './aisteps.mjs';

const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; };

for (const slot of document.querySelectorAll('[data-icon]')) slot.append(icon(slot.dataset.icon));

function underWay(anchor, text, href) {
  const p = el('p', 'way-under');
  p.append(el('span', '', text));
  const go = el('a', 'button-link small-go', 'Continue');
  go.href = href;
  go.setAttribute('aria-label', `Continue: ${anchor.querySelector('b').firstChild.textContent.trim()}`);
  p.append(go);
  anchor.after(p);
}

// FR-920: from a session's offer needing only listening, an own text won't fill that bar.
function ownNote() {
  const kinds = kindsStillNeeded();
  const only = kinds && kinds.length === 1 && kinds[0] === 'listening';
  document.querySelector('.own-note')?.remove();
  if (!only) return;
  document.getElementById('way-own').after(el('p', 'small own-note', 'Your own text is a reading text, so it won’t fill the Listening bar.'));
}

// Sent by a session's offer, the library keeps the session's way back (FR-923) rather than Add a text's.
if (fromSession()) document.getElementById('way-library').href = '/library?from=session';
await showAccount();
ownNote();
onOfferChange(() => ownNote());

// Under way (question-pages/92, 5): the AI wizard's step from G-02's prompting state; an own text waiting.
const [homeRes, ownRes] = await Promise.all([
  fetch('/api/home', { credentials: 'same-origin' }).catch(() => null),
  fetch('/api/own-texts', { credentials: 'same-origin' }).catch(() => null),
]);
const home = homeRes?.ok ? await homeRes.json() : null;
if (home?.waiting) underWay(document.getElementById('way-ai'), `Under way: step ${aiStep(home) + 1} of 5`, '/add/ai');
const own = ownRes?.ok ? (await ownRes.json()).texts : [];
const waiting = own.find((t) => !t.ready);
if (waiting) underWay(document.getElementById('way-own'), `Under way: step 2 of 3, “${waiting.title}”`, `/own?id=${waiting.id}`);
carryFromSession();
