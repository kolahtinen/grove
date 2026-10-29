// grove's small icons (G-09 FR-912), drawn inline with DOM calls in the logo's stroke style, so no
// file or font is fetched (G-01 FR-024): Discover a sprout, Review a circle arrow, Master a mountain;
// and Home's tiles (FR-901).
const PATHS = {
  discover: ['M12 21V11', 'M12 13c0-4 3-6 7-6 0 4-3 6-7 6z', 'M12 15c0-3-2-5-6-5 0 3 2 5 6 5z'],
  review: ['M20 12a8 8 0 1 1-2.3-5.6', 'M20 4v5h-5'],
  master: ['M3 20l6-10 4 6 3-4 5 8z'],
  resume: ['M8 5l11 7-11 7z'],
  practise: ['M12 21a8 8 0 1 0 0-16 8 8 0 0 0 0 16z', 'M12 9v4l2.5 2', 'M10 2h4'],
  texts: ['M4 5c3-1.5 5.5-1.5 8 0v15c-2.5-1.5-5-1.5-8 0z', 'M12 5c2.5-1.5 5-1.5 8 0v15c-3-1.5-5.5-1.5-8 0'],
  skill: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z', 'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', 'M12 12h.01'],
  dictionary: ['M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z', 'M5 17a3 3 0 0 1 3-3h11', 'M9 8h6'],
  mode: ['M12 3v18', 'M5 8l7-5 7 5', 'M7 21h10'],
  progress: ['M4 20h16', 'M7 20v-6', 'M12 20V8', 'M17 20v-10'],
  close: ['M6 6l12 12', 'M18 6L6 18'],
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
