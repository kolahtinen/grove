// A finished session's summary (G-09 FR-904): minutes, texts read, words reviewed and words that fell
// between its start and end. PD-05's "days practised this week" is still to confirm with the owner.
export function summarise(db, accountId, row) {
  const end = row.finished_at ?? Date.now();
  const exercises = JSON.parse(row.plan).filter((e) => e.done);
  const between = [accountId, row.started_at, end];
  return {
    minutes: Math.round(exercises.reduce((s, e) => s + e.seconds, 0) / 60),
    textsRead: exercises.filter((e) => e.textId).length,
    wordsReviewed: db.prepare("SELECT COUNT(DISTINCT word_id) AS n FROM review_answers WHERE account_id = ? AND at BETWEEN ? AND ? AND mode IN ('remember', 'master', 'recall')").get(...between).n,
    wordsFell: db.prepare('SELECT COUNT(*) AS n FROM words WHERE account_id = ? AND fallen_at BETWEEN ? AND ?').get(...between).n,
  };
}
