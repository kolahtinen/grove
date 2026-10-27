// The demo learner's history (G-07 FR-704), relative to when the demo is put in.
const DAY = 24 * 60 * 60 * 1000;

export const HISTORY = {
  topic: 'a small café in Stockholm',
  ratings: [{ text: 'En kall morgon', value: 'most', ago: 2 * DAY }, { text: 'Lördag på torget', value: 'a_little', ago: 2 * DAY }],
  answers: [{ text: 'En kall morgon', position: 0, right: true }, { text: 'En kall morgon', position: 1, right: false }, { text: 'Lördag på torget', position: 0, right: true }],
  drilled: [
    { lemma: 'glömma', kind: 'word', read: 0, remember: 1, gap: 1, ago: 3 * DAY },        // fading
    { lemma: 'granne', kind: 'word', read: 0, remember: 1, gap: 1, ago: 1.2 * DAY },      // due
    { lemma: 'sälja', kind: 'word', read: 0, remember: 1, gap: 1, ago: 1.5 * DAY },       // due
    { lemma: 'hur mår du', kind: 'phrase', read: 0, remember: 1, gap: 1, ago: 1.1 * DAY }, // due
    { lemma: 'biljett', kind: 'word', read: 0, remember: 1, gap: 2.5, ago: 1 * DAY },     // Master
    { lemma: 'det gör inget', kind: 'phrase', read: 0, remember: 1, gap: 1, ago: 0.1 * DAY }, // fresh
  ],
  minutes: [{ ago: 1, seconds: 12 * 60 }, { ago: 2, seconds: 25 * 60 }, { ago: 4, seconds: 8 * 60 }],
  summaryAgo: 3 * DAY,
};
