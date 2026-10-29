// How long grove counts each kind of exercise when it plans a session (G-09 FR-905; question-pages/75, 1:
// the first guess; learning each learner's own times is for a later version). One place to change after
// SC-004's timed session. Reading is 100 words a minute from B1 and 70 below (PD-02, question-pages/76, 5).
export const DURATIONS = {
  readingWordsPerMinute: 100,
  readingWordsPerMinuteBelowB1: 70,
  listeningWordsPerMinute: 80,
  review: 20,
  master: 25,
  marking: 30,
  // Discover's Words and Grammar (FR-928, FR-929; the picked sketch's times, question-pages/89).
  word: 30,
  phrase: 150,
  pattern: 300,
  spot: 150,
};

// The durations for a learner: below B1, reading is planned at the slower rate.
export function durationsFor(belowB1, durations = DURATIONS) {
  return belowB1 ? { ...durations, readingWordsPerMinute: durations.readingWordsPerMinuteBelowB1 ?? durations.readingWordsPerMinute } : durations;
}

// A text's seconds: its words at the reading or listening rate, plus the marking step after a first reading.
export function textSeconds(text, durations = DURATIONS) {
  const rate = text.kind === 'listening' ? durations.listeningWordsPerMinute : durations.readingWordsPerMinute;
  return Math.round((text.words / rate) * 60) + (text.read ? 0 : durations.marking);
}
