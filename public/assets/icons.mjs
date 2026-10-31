// grove's small icons (G-09 FR-912), drawn inline with DOM calls in the logo's stroke style, so no
// file or font is fetched (G-01 FR-024): Discover a sprout, Review a circle arrow, Mix the two together
// (addendum 006), Master a mountain (old plans); Home's tiles (FR-901); the four skills of the Options page
// (FR-903: an open book, headphones, a speech bubble, a branching stem) and Play.
const PATHS = {
  discover: ['M12 21V11', 'M12 13c0-4 3-6 7-6 0 4-3 6-7 6z', 'M12 15c0-3-2-5-6-5 0 3 2 5 6 5z'],
  review: ['M20 12a8 8 0 1 1-2.3-5.6', 'M20 4v5h-5'],
  mix: ['M12 21v-7', 'M12 16c0-3 2.5-5 6-5 0 3-2.5 5-6 5z', 'M4.5 14A8 8 0 0 1 17 5.3', 'M17.5 2v4h-4'],
  master: ['M3 20l6-10 4 6 3-4 5 8z'],
  resume: ['M8 5l11 7-11 7z'],
  practise: ['M12 21a8 8 0 1 0 0-16 8 8 0 0 0 0 16z', 'M12 9v4l2.5 2', 'M10 2h4'],
  texts: ['M4 5c3-1.5 5.5-1.5 8 0v15c-2.5-1.5-5-1.5-8 0z', 'M12 5c2.5-1.5 5-1.5 8 0v15c-3-1.5-5.5-1.5-8 0'],
  skill: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z', 'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', 'M12 12h.01'],
  dictionary: ['M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z', 'M5 17a3 3 0 0 1 3-3h11', 'M9 8h6'],
  mode: ['M12 3v18', 'M5 8l7-5 7 5', 'M7 21h10'],
  progress: ['M4 20h16', 'M7 20v-6', 'M12 20V8', 'M17 20v-10'],
  common: ['M4 20h16', 'M5 20V8', 'M9 20V6', 'M13 20V9', 'M16 20l2-12 3 .6-2 11.4'],
  yours: ['M6 3h12v18l-6-4-6 4z', 'M10 9h4'],
  close: ['M6 6l12 12', 'M18 6L6 18'],
  reading: ['M4 5c3-1.5 5.5-1.5 8 0v15c-2.5-1.5-5-1.5-8 0z', 'M12 5c2.5-1.5 5-1.5 8 0v15c-3-1.5-5.5-1.5-8 0'],
  listening: ['M4 15v-3a8 8 0 0 1 16 0v3', 'M4 15h3v5H4z', 'M17 15h3v5h-3z'],
  words: ['M4 5h16v11H10l-5 4v-4H4z', 'M8 9h8', 'M8 12h5'],
  grammar: ['M7 3v18', 'M7 9h5a4 4 0 0 0 4-4V3', 'M7 15h8a3 3 0 0 1 3 3v3'],
  play: ['M8 5l11 7-11 7z'],
  // The word menu (G-03 FR-305, version A): Pick up, Let it fall, a folded row's chevron, Explain, Report.
  up: ['M12 19V5', 'M6 11l6-6 6 6'],
  down: ['M12 5v14', 'M6 13l6 6 6-6'],
  chev: ['M9 6l6 6-6 6'],
  help: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z', 'M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7', 'M12 17h.01'],
  flag: ['M5 21V4', 'M5 4h11l-2 4 2 4H5'],
  // Add a text's choices (G-09 FR-918, version A): your AI (a chat bubble) and your own text (a page).
  ai: ['M4 5h16v11H9l-5 4z', 'M8 10h.01', 'M12 10h.01', 'M16 10h.01'],
  own: ['M6 3h9l4 4v14H6z', 'M14 3v5h5', 'M9 13h7', 'M9 17h5'],
  fell: ['M12 4v12', 'M7 11l5 5 5-5', 'M4 20h16'],
  // A listening text's Sentences (G-05 FR-506, FR-507, version A): a list of rows and a loop.
  list: ['M8 6h12', 'M8 12h12', 'M8 18h12', 'M4 6h.01', 'M4 12h.01', 'M4 18h.01'],
  loop: ['M4 11V9a3 3 0 0 1 3-3h13', 'M17 3l3 3-3 3', 'M20 13v2a3 3 0 0 1-3 3H4', 'M7 21l-3-3 3-3'],
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
