// grove's small icons (G-09 FR-912), drawn inline with DOM calls in the logo's stroke style, so no
// file or font is fetched (G-01 FR-024): Discover a sprout, Review a circle arrow, Master a mountain.
const PATHS = {
  discover: ['M12 21V11', 'M12 13c0-4 3-6 7-6 0 4-3 6-7 6z', 'M12 15c0-3-2-5-6-5 0 3 2 5 6 5z'],
  review: ['M20 12a8 8 0 1 1-2.3-5.6', 'M20 4v5h-5'],
  master: ['M3 20l6-10 4 6 3-4 5 8z'],
};
const NS = 'http://www.w3.org/2000/svg';

export function icon(name) {
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');
  svg.classList.add('icon');
  for (const d of PATHS[name] ?? []) {
    const path = document.createElementNS(NS, 'path');
    path.setAttribute('d', d);
    svg.append(path);
  }
  return svg;
}
