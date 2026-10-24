// Every page's top bar (G-08 FR-802): tapping the logo plays the leaves-and-ground scene in a pop-up.
import { playGrow } from './grow.mjs';

let open = false;

function showPopup() {
  if (open) return;
  open = true;
  const backdrop = document.createElement('div');
  backdrop.className = 'sheet-backdrop';
  const pop = document.createElement('section');
  pop.className = 'card grow-pop';
  pop.setAttribute('role', 'dialog');
  pop.setAttribute('aria-label', 'How grove grows');
  document.body.append(backdrop, pop);
  const close = () => { backdrop.remove(); pop.remove(); open = false; };
  const player = playGrow(pop, { onend: close });
  backdrop.addEventListener('click', () => player.skip());
}

document.querySelector('.brand .logo')?.addEventListener('click', (event) => {
  event.preventDefault();
  event.stopPropagation();
  showPopup();
});
