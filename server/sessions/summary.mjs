// A finished session's summary (G-09 FR-904; RQ-457): minutes, new texts read and heard (read again and
// listen again count only as minutes, FR-933), words reviewed (practice reviews included, though they are
// never stored as answers), words and phrases picked up and patterns met, words that fell between its start
// and end, and the days practised this week, Monday to Sunday (PD-05; no streaks or goals). The page shows
// only the lines with something in them.
const DAY = 24 * 60 * 60 * 1000;

function weekStart(ms) {
  const d = new Date(ms);
  const back = (d.getUTCDay() + 6) % 7;
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - back * DAY).toISOString().slice(0, 10);
}

function newTexts(db, accountId, exercises, kind) {
  return exercises.filter((e) => e.textId && !e.again
    && (db.prepare('SELECT kind FROM texts WHERE id = ? AND account_id = ?').get(e.textId, accountId)?.kind ?? 'reading') === kind).length;
}

export function summarise(db, accountId, row) {
  const end = row.finished_at ?? Date.now();
  const exercises = JSON.parse(row.plan).filter((e) => e.done);
  const between = [accountId, row.started_at, end];
  return {
    minutes: Math.round(exercises.reduce((s, e) => s + e.seconds, 0) / 60),
    textsRead: newTexts(db, accountId, exercises, 'reading'),
    textsHeard: newTexts(db, accountId, exercises, 'listening'),
    wordsReviewed: exercises.filter((e) => e.practice).length + db.prepare("SELECT COUNT(DISTINCT word_id) AS n FROM review_answers WHERE account_id = ? AND at BETWEEN ? AND ? AND mode IN ('remember', 'master', 'recall')").get(...between).n,
    pickedUp: db.prepare("SELECT COUNT(*) AS n FROM words WHERE account_id = ? AND kind != 'pattern' AND picked_at BETWEEN ? AND ?").get(...between).n,
    patternsMet: db.prepare("SELECT COUNT(*) AS n FROM learning_seen s JOIN learning_items i ON i.id = s.item_id WHERE s.account_id = ? AND i.type = 'pattern' AND s.first_at BETWEEN ? AND ?").get(...between).n,
    wordsFell: db.prepare('SELECT COUNT(*) AS n FROM words WHERE account_id = ? AND fallen_at BETWEEN ? AND ?').get(...between).n,
    daysThisWeek: db.prepare('SELECT COUNT(*) AS n FROM input_days WHERE account_id = ? AND day >= ? AND day <= ? AND seconds > 0').get(accountId, weekStart(end), new Date(end).toISOString().slice(0, 10)).n,
  };
}
