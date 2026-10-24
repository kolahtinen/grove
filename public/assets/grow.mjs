// The leaves-and-ground scene (G-08 FR-801, FR-803; question-pages/56): drawn like the logo, stepped
// through five classes; grove.css does the motion. With reduced motion, four still frames instead.

const SVG = 'http://www.w3.org/2000/svg';
const STEPS = [
  { at: 0, caption: '' },
  { at: 1600, caption: 'Every word you save is a leaf.' },
  { at: 3600, caption: 'When you know it, it falls to the ground.' },
  { at: 6200, caption: 'Your ground feeds everything you read next.' },
  { at: 8400, caption: 'grove · grow from what you know' },
];
export const LENGTH = 10400;
export const CAPTIONS = STEPS.slice(1).map((s) => s.caption);

function node(tag, attrs = {}, parent) {
  const n = document.createElementNS(SVG, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  parent?.append(n);
  return n;
}

// A leaf hanging from the crown's edge at (x, y); side -1 hangs it to the left, with its word on the left.
function leaf(parent, x, y, word, name, side = 1) {
  const at = node('g', { transform: `translate(${x} ${y})${side < 0 ? ' scale(-1 1)' : ''}` }, parent);
  const g = node('g', { class: `g-leaf leaf-${name}` }, at);
  node('path', { d: 'M0 0q7-7 14 0q-7 7-14 0z' }, g);
  node('path', { d: 'M0 0h14', class: 'vein' }, g);
  const label = node('text', side < 0 ? { x: -18, y: 3.5, transform: 'scale(-1 1)', 'text-anchor': 'end' } : { x: 18, y: 3.5 }, g);
  label.textContent = word;
}

function scene() {
  const svg = node('svg', { viewBox: '0 0 200 140', class: 'grow-svg', fill: 'none', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true' });
  const world = node('g', { class: 'g-scene' }, svg);
  node('path', { class: 'g-soil', d: 'M24 125h152' }, world);
  node('path', { class: 'g-ground', d: 'M20 120h160' }, world);
  const tree = node('g', { class: 'g-tree' }, world);
  node('path', { d: 'M100 120V78M74 78l26-52 26 52z' }, tree);
  leaf(world, 82, 62, 'hej', 'hej', -1);
  leaf(world, 110, 46, 'läsa', 'lasa');
  leaf(world, 122, 70, 'bok', 'bok');
  const logo = node('g', { class: 'g-logo', transform: 'translate(68 40) scale(2)' }, svg);
  node('path', { d: 'M3 27h26' }, logo);
  node('path', { d: 'M9 27V19M5 19l4-9 4 9z' }, logo);
  node('path', { d: 'M17 27V15M12 15l5-11 5 11z' }, logo);
  node('path', { d: 'M25 27v-6M22 21l3-7 3 7z' }, logo);
  return svg;
}

function el(tag, className, text) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  if (text !== undefined) n.textContent = text;
  return n;
}

export const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// Plays the scene in host. Returns { skip }. onend runs once, when it ends or is skipped.
export function playGrow(host, { onend, skipLabel = 'Skip' } = {}) {
  host.replaceChildren();
  let ended = false;
  const timers = [];
  const finish = () => {
    if (ended) return;
    ended = true;
    timers.forEach(clearTimeout);
    onend?.();
  };

  if (reducedMotion()) {
    const frames = el('div', 'grow-frames');
    STEPS.slice(1).forEach((step, i) => {
      const figure = el('figure', 'grow grow-still');
      for (let k = 1; k <= i + 2; k += 1) figure.classList.add(`s${k}`);
      figure.append(scene(), el('figcaption', 'grow-caption', step.caption));
      frames.append(figure);
    });
    const done = el('button', 'grow-skip', 'Done');
    done.type = 'button';
    done.addEventListener('click', finish);
    host.append(frames, done);
    return { skip: finish };
  }

  const box = el('div', 'grow');
  box.dataset.step = '0';
  const caption = el('p', 'grow-caption');
  caption.setAttribute('aria-live', 'polite');
  const skip = el('button', 'grow-skip', skipLabel);
  skip.type = 'button';
  skip.addEventListener('click', finish);
  box.append(scene(), caption);
  host.append(box, skip);
  STEPS.forEach((step, i) => {
    timers.push(setTimeout(() => {
      box.classList.add(`s${i + 1}`);
      box.dataset.step = String(i + 1);
      caption.textContent = step.caption;
    }, step.at + 30));
  });
  timers.push(setTimeout(finish, LENGTH));
  return { skip: finish };
}
