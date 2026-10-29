// Add a text (G-09 FR-918): the three ways side by side, each with its explainer. Sent by a session's
// offer, the fill bars and the way back come from way.mjs; Your own text says when it can't help (FR-920).
import { showAccount } from './page.mjs';
import { kindsStillNeeded, onOfferChange } from './way.mjs';

// FR-920: from a session's offer, a Listening-only need isn't filled by an own text (always reading).
function ownNote(box) {
  const kinds = kindsStillNeeded();
  const only = kinds && kinds.length === 1 && kinds[0] === 'listening';
  box.querySelector('.own-note')?.remove();
  if (!only) return;
  const p = document.createElement('p');
  p.className = 'small own-note';
  p.textContent = 'Your own text is a reading text, so it won’t fill the Listening bar.';
  box.append(p);
}

await showAccount();
const own = document.querySelector('a[href^="/own"]').closest('.add-way');
ownNote(own);
onOfferChange(() => ownNote(own));
