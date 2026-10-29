// The common library's grove texts (G-09 FR-916; addendum 005, RQ-438; B-11): carried in the build,
// imported at start-up when missing or changed, belonging to no learner. A learner adds one to Your
// library as their own copy through G-02's accept path, marked "grove text" and never Beta.
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { transaction } from '../store/db.mjs';
import { HttpError } from '../web/http.mjs';
import { validateAnswer } from '../texts/schema.mjs';
import { checkAnswer } from '../texts/check.mjs';
import { acceptAnswer } from '../texts/accept.mjs';
import { createWordStore } from '../words/store.mjs';
import { levelFor, isBelowB1 } from '../drill/progress.mjs';
import { tokenize } from '../words/tokens.mjs';
import { durationsFor, textSeconds } from '../sessions/durations.mjs';

export const GROVE_TEXTS_FILE = join(dirname(fileURLToPath(import.meta.url)), 'grove-texts.json');
export const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
// The exchange code of a learner's copy, so it is never taken for an AI text (Beta).
export const LIBRARY_CODE = (id) => `LIB-${id}`;
export const isGroveCode = (code) => /^LIB-/.test(code ?? '');

export function importGroveTexts(db, file = GROVE_TEXTS_FILE) {
  if (!existsSync(file)) return 'missing';
  const raw = readFileSync(file);
  const hash = createHash('sha256').update(raw).digest('hex');
  if (db.prepare("SELECT value FROM settings WHERE key = 'grove_texts_hash'").get()?.value === hash) return 'unchanged';
  const texts = JSON.parse(raw.toString('utf8'));
  transaction(db, () => {
    const upsert = db.prepare(`INSERT INTO library_texts (id, level, topic, kind, form, title, data) VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT (id) DO UPDATE SET level = excluded.level, topic = excluded.topic, kind = excluded.kind, form = excluded.form, title = excluded.title, data = excluded.data`);
    for (const t of texts) upsert.run(t.id, t.level, t.topic, t.kind, t.form, t.title, JSON.stringify({ names: t.names, lines: t.lines, questions: t.questions }));
    const ids = texts.map((t) => t.id);
    db.prepare(`DELETE FROM library_texts WHERE id NOT IN (SELECT value FROM json_each(?))`).run(JSON.stringify(ids));
    db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('grove_texts_hash', ?)").run(hash);
  });
  return 'imported';
}

// The library for a learner: their level (the filter's default), and every grove text by topic with
// its level, kind, minutes for this learner (the planner's durations, so the fill bars and the session
// agree, FR-905, R-34) and the learner's copy, if any.
export function listLibrary(db, accountId) {
  const level = levelFor(db, accountId);
  const durations = durationsFor(isBelowB1(level));
  const copies = new Map(db.prepare('SELECT library_id, id FROM texts WHERE account_id = ? AND library_id IS NOT NULL').all(accountId).map((r) => [r.library_id, r.id]));
  const texts = db.prepare('SELECT id, level, topic, kind, title, data FROM library_texts ORDER BY topic, level, id').all()
    .map(({ data, ...t }) => {
      const words = JSON.parse(data).lines.reduce((n, l) => n + tokenize(l.sv).length, 0);
      return { ...t, minutes: Math.max(1, Math.round(textSeconds({ kind: t.kind, words, read: false }, durations) / 60)), added: copies.get(t.id) ?? null };
    });
  return { level: LEVELS.includes(level) ? level : 'A1', texts };
}

// Adds a grove text to the learner's library through G-02's accept path; adding it again opens the copy.
// Only an ID in library_texts is accepted, so no other text can be copied this way (T-24).
export function addToLibrary({ db, accountId, id, now = () => Date.now() }) {
  const row = db.prepare('SELECT * FROM library_texts WHERE id = ?').get(id);
  if (!row) throw new HttpError(404, 'not_found', 'There is no such text in the library.');
  const had = db.prepare('SELECT id FROM texts WHERE account_id = ? AND library_id = ?').get(accountId, id);
  if (had) return { textId: had.id, added: false };
  const data = JSON.parse(row.data);
  const answer = validateAnswer({ part: LIBRARY_CODE(id), texts: [{ kind: row.kind, title: row.title, lines: data.lines, questions: data.questions }], new_words: [], new_phrases: [], inflections: [], names: data.names }).value;
  const words = createWordStore({ db, now });
  return transaction(db, () => {
    const at = now();
    const ex = db.prepare(`INSERT INTO exchanges (account_id, package_id, part_no, kind, code, prompt, status, created_at, answered_at)
      VALUES (?, NULL, 1, 'part', ?, '(grove text from the common library)', 'accepted', ?, ?)`).run(accountId, LIBRARY_CODE(id), at, at);
    const exchange = db.prepare('SELECT * FROM exchanges WHERE id = ?').get(Number(ex.lastInsertRowid));
    const counter = words.counterFor(accountId, { names: answer.names, phrases: [], inflections: [] });
    const target = db.prepare('SELECT target_share FROM learner_settings WHERE account_id = ?').get(accountId)?.target_share ?? 95;
    const check = checkAnswer(answer, counter, target);
    acceptAnswer({ db, words, accountId, exchange, answer, check, topic: row.topic, now, counter });
    const text = db.prepare('SELECT id FROM texts WHERE account_id = ? AND exchange_id = ?').get(accountId, exchange.id);
    db.prepare('UPDATE texts SET library_id = ? WHERE id = ?').run(id, text.id);
    return { textId: text.id, added: true };
  });
}
