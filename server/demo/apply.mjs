// Puts the demo into the reviewer account (G-07 FR-704, FR-705; plan R2): the demo ground, the demo
// answer accepted through G-02's own accept path as one finished package, and the history.
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { transaction } from '../store/db.mjs';
import { validateAnswer } from '../texts/schema.mjs';
import { checkAnswer } from '../texts/check.mjs';
import { acceptAnswer } from '../texts/accept.mjs';
import { createWordStore } from '../words/store.mjs';
import { HISTORY } from './history.mjs';

// Both files are built by scripts/build-demo.mjs; nothing here reads docs/ (FR-704).
const here = dirname(fileURLToPath(import.meta.url));
export const DEMO_ANSWER = JSON.parse(readFileSync(join(here, 'demo-answer.json'), 'utf8'));
export const DEMO_GROUND = readFileSync(join(here, 'demo-ground.txt'), 'utf8').split(/\s+/).filter(Boolean);
const DAY = 24 * 60 * 60 * 1000;
const iso = (ms) => new Date(ms).toISOString().slice(0, 10);

export function applyDemo({ db, accountId, now = () => Date.now() }) {
  const t = now();
  const words = createWordStore({ db, now: () => t });
  const answer = validateAnswer(DEMO_ANSWER).value;
  transaction(db, () => {
    const add = db.prepare("INSERT OR IGNORE INTO words (account_id, lemma, kind, state, added_at) VALUES (?, ?, 'word', 'ground', ?)");
    for (const w of DEMO_GROUND) add.run(accountId, w, t - 7 * DAY);
    db.prepare('INSERT OR IGNORE INTO learner_settings (account_id) VALUES (?)').run(accountId);
    db.prepare('UPDATE learner_settings SET topic = ?, topics_used = ?, last_summary_at = ? WHERE account_id = ?')
      .run(HISTORY.topic, JSON.stringify([HISTORY.topic]), t - HISTORY.summaryAgo, accountId);
    const pkg = db.prepare("INSERT INTO packages (account_id, parts_total, parts_accepted, status, created_at) VALUES (?, 3, 3, 'finished', ?)").run(accountId, t - 4 * DAY);
    const ex = db.prepare(`INSERT INTO exchanges (account_id, package_id, part_no, kind, code, prompt, status, created_at, answered_at)
      VALUES (?, ?, 1, 'part', 'DEMO-1', '(demo content, made in advance)', 'accepted', ?, ?)`).run(accountId, Number(pkg.lastInsertRowid), t - 4 * DAY, t - 4 * DAY);
    const exchange = db.prepare('SELECT * FROM exchanges WHERE id = ?').get(Number(ex.lastInsertRowid));
    const counter = words.counterFor(accountId, { names: answer.names, phrases: answer.new_phrases.map((p) => p.sv), inflections: answer.inflections });
    const check = checkAnswer(answer, counter, 95);
    acceptAnswer({ db, words, accountId, exchange, answer, check, topic: HISTORY.topic, now: () => t - 4 * DAY, counter });
    const textId = (title) => db.prepare('SELECT id FROM texts WHERE account_id = ? AND title = ?').get(accountId, title).id;
    for (const r of HISTORY.ratings) {
      db.prepare('INSERT INTO ratings (account_id, text_id, value, at) VALUES (?, ?, ?, ?)').run(accountId, textId(r.text), r.value, t - r.ago);
      db.prepare('UPDATE texts SET read_at = ? WHERE id = ?').run(t - r.ago, textId(r.text));
    }
    for (const a of HISTORY.answers) {
      const qa = db.prepare('SELECT answer, options FROM questions WHERE text_id = ? AND position = ?').get(textId(a.text), a.position);
      const option = a.right ? qa.answer : (qa.answer + 1) % JSON.parse(qa.options).length;
      db.prepare('INSERT INTO question_answers (account_id, text_id, position, option, right, at) VALUES (?, ?, ?, ?, ?, ?)')
        .run(accountId, textId(a.text), a.position, option, a.right ? 1 : 0, t - 2 * DAY);
    }
    for (const d of HISTORY.drilled) {
      words.addLeaf({ accountId, lemma: d.lemma, kind: d.kind });
      db.prepare("UPDATE words SET state = 'leaf', drilled = 1, to_read = ?, to_remember = ?, gap_days = ?, last_review_at = ? WHERE account_id = ? AND lemma = ? AND kind = ?")
        .run(d.read, d.remember, d.gap, t - d.ago, accountId, d.lemma, d.kind);
    }
    for (const m of HISTORY.minutes) {
      db.prepare('INSERT OR REPLACE INTO input_days (account_id, day, seconds) VALUES (?, ?, ?)').run(accountId, iso(t - m.ago * DAY), m.seconds);
    }
  });
}
