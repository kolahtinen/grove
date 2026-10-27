// How long grove counts each kind of exercise when it plans a session (G-09 FR-905; question-pages/75, 1:
// the first guess; learning each learner's own times is for a later version). One place to change after
// SC-004's timed session. PD-02 (70 words a minute below B1) is still to confirm with the owner.
export const DURATIONS = {
  readingWordsPerMinute: 100,
  listeningWordsPerMinute: 80,
  review: 20,
  master: 25,
  marking: 30,
};

// A text's seconds: its words at the reading or listening rate, plus the marking step after a first reading.
export function textSeconds(text, durations = DURATIONS) {
  const rate = text.kind === 'listening' ? durations.listeningWordsPerMinute : durations.readingWordsPerMinute;
  return Math.round((text.words / rate) * 60) + (text.read ? 0 : durations.marking);
}
