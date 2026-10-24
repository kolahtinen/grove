// Explain flags and reports (FR-313…FR-315; research R3): codes per account, the lines for the next
// prompt, and applying the AI's explanations and fixes.
import { HttpError } from '../web/http.mjs';
import { splitSentences } from '../words/sentences.mjs';

export const EXPLAIN_REASONS = { why_form: 'why this form', why_here: 'why this word is here', other_meaning: 'a different meaning than I know', reading: 'reading', other: 'other' };
export const REPORT_REASONS = { wrong_answer: 'wrong answer', bad_translation: 'bad translation', unnatural: 'unnatural sentence', wrong_reading: 'wrong reading', audio: 'audio', other: 'other' };

function nextCode(db, table, accountId, prefix) {
  const n = db.prepare(`SELECT COUNT(*) AS n FROM ${table} WHERE account_id = ?`).get(accountId).n;
  return `${prefix}${n + 1}`;
}

export function createFlag(db, accountId, { sentenceId, form, reason, note }, now = Date.now()) {
  const s = db.prepare('SELECT id, text_id FROM sentences WHERE id = ? AND account_id = ?').get(sentenceId, accountId);
  if (!s) throw new HttpError(404, 'not_found', 'There is no such sentence.');
  const code = nextCode(db, 'explain_flags', accountId, 'E');
  db.prepare(`INSERT INTO explain_flags (account_id, code, form, text_id, sentence_id, reason, note, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'open', ?)`).run(accountId, code, form.toLowerCase(), s.text_id, s.id, reason, note?.trim() || null, now);
  return code;
}

export function createReport(db, accountId, { textId, questionPosition, linePosition, reason, note }, now = Date.now()) {
  if ((questionPosition === undefined) === (linePosition === undefined)) {
    throw new HttpError(400, 'bad_request', 'Report a question or a sentence, one at a time.');
  }
  const text = db.prepare('SELECT id FROM texts WHERE id = ? AND account_id = ?').get(textId, accountId);
  if (!text) throw new HttpError(404, 'not_found', 'There is no such text.');
  const exists = questionPosition !== undefined
    ? db.prepare('SELECT 1 FROM questions WHERE text_id = ? AND position = ?').get(text.id, questionPosition)
    : db.prepare('SELECT 1 FROM text_lines WHERE text_id = ? AND position = ?').get(text.id, linePosition);
  if (!exists) throw new HttpError(404, 'not_found', 'There is no such question or sentence.');
  const code = nextCode(db, 'reports', accountId, 'R');
  db.prepare(`INSERT INTO reports (account_id, code, text_id, question_position, line_position, reason, note, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'open', ?)`).run(accountId, code, text.id, questionPosition ?? null, linePosition ?? null, reason, note?.trim() || null, now);
  return code;
}

// The lines the next part prompt lists, so the AI can explain and fix (FR-313, FR-315).
export function openRequests(db, accountId) {
  const flags = db.prepare(`SELECT f.code, f.form, f.reason, f.note, s.sv FROM explain_flags f JOIN sentences s ON s.id = f.sentence_id
    WHERE f.account_id = ? AND f.status = 'open' ORDER BY f.id`).all(accountId)
    .map((f) => `${f.code}: "${f.form}" in "${f.sv}" — reason: ${EXPLAIN_REASONS[f.reason]}${f.note ? ` — note: ${f.note}` : ''}`);
  const reports = db.prepare(`SELECT r.*, t.title FROM reports r JOIN texts t ON t.id = r.text_id
    WHERE r.account_id = ? AND r.status = 'open' ORDER BY r.id`).all(accountId).map((r) => {
    let what;
    if (r.question_position !== null) {
      const q = db.prepare('SELECT q FROM questions WHERE text_id = ? AND position = ?').get(r.text_id, r.question_position);
      what = `question ${r.question_position + 1} ("${q?.q ?? ''}")`;
    } else {
      const line = db.prepare('SELECT sv FROM text_lines WHERE text_id = ? AND position = ?').get(r.text_id, r.line_position);
      what = `sentence "${line?.sv ?? ''}"`;
    }
    return `${r.code}: text "${r.title}", ${what} — reason: ${REPORT_REASONS[r.reason]}${r.note ? ` — note: ${r.note}` : ''}`;
  });
  return { flags, reports };
}

export function applyExplanations(db, accountId, explanations, now) {
  for (const e of explanations) {
    const flag = db.prepare("SELECT * FROM explain_flags WHERE account_id = ? AND code = ? AND status = 'open'").get(accountId, e.code.toUpperCase());
    if (!flag) continue;
    db.prepare('INSERT INTO explanations (account_id, flag_id, form, lemma, explain_en, at) VALUES (?, ?, ?, ?, ?, ?)')
      .run(accountId, flag.id, flag.form, flag.lemma, e.explain_en, now);
    db.prepare("UPDATE explain_flags SET status = 'answered', answered_at = ? WHERE id = ?").run(now, flag.id);
  }
}

export function applyFixes(db, accountId, fixes, counter, now) {
  for (const f of fixes) {
    const report = db.prepare("SELECT * FROM reports WHERE account_id = ? AND code = ? AND status = 'open'").get(accountId, f.code.toUpperCase());
    if (!report) continue;
    if (report.question_position !== null && f.q !== undefined) {
      db.prepare('UPDATE questions SET q = ?, options = ?, answer = ? WHERE text_id = ? AND position = ?')
        .run(f.q, JSON.stringify(f.options), f.answer, report.text_id, report.question_position);
    } else if (report.line_position !== null && f.sv !== undefined) {
      db.prepare('UPDATE text_lines SET sv = ?, en = ? WHERE text_id = ? AND position = ?').run(f.sv, f.en, report.text_id, report.line_position);
      db.prepare('DELETE FROM sentences WHERE text_id = ? AND line_position = ?').run(report.text_id, report.line_position);
      splitSentences(f.sv).forEach((sv, i) => {
        const items = counter.countSentence(sv).items.map((x) => x.text);
        db.prepare('INSERT INTO sentences (account_id, text_id, line_position, position, sv, new_items) VALUES (?, ?, ?, ?, ?, ?)')
          .run(accountId, report.text_id, report.line_position, i, sv, JSON.stringify(items));
      });
    } else {
      continue;
    }
    db.prepare("UPDATE reports SET status = 'fixed', fixed_at = ? WHERE id = ?").run(now, report.id);
  }
}
