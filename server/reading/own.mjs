// Own texts, Save as leaf, and a meanings prompt for leaves without meaning (FR-318; research R7).
import { HttpError } from '../web/http.mjs';
import { transaction } from '../store/db.mjs';
import { splitSentences } from '../words/sentences.mjs';
import { createWordStore } from '../words/store.mjs';
import { buildMeaningsPrompt } from '../texts/fixit.mjs';

export function addOwnText(db, accountId, { title, text }, now = Date.now()) {
  const words = createWordStore({ db, now: () => now });
  const names = db.prepare('SELECT name FROM names WHERE account_id = ?').all(accountId).map((r) => r.name);
  const counter = words.counterFor(accountId, { names });
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (!lines.length) throw new HttpError(400, 'bad_request', 'Please paste some Swedish text.');
  return transaction(db, () => {
    const info = db.prepare("INSERT INTO texts (account_id, position, title, topic, created_at, own) VALUES (?, 1, ?, '', ?, 1)").run(accountId, title.trim(), now);
    const id = Number(info.lastInsertRowid);
    lines.forEach((line, li) => {
      db.prepare("INSERT INTO text_lines (account_id, text_id, position, sv, en) VALUES (?, ?, ?, ?, '')").run(accountId, id, li, line);
      splitSentences(line).forEach((sv, si) => {
        const items = counter.countSentence(sv).items.map((x) => x.text);
        db.prepare('INSERT INTO sentences (account_id, text_id, line_position, position, sv, new_items) VALUES (?, ?, ?, ?, ?, ?)')
          .run(accountId, id, li, si, sv, JSON.stringify(items));
      });
    });
    return id;
  });
}

export function saveLeaf(db, accountId, { textId, form }, now = Date.now()) {
  const text = db.prepare('SELECT id FROM texts WHERE id = ? AND account_id = ?').get(textId, accountId);
  if (!text) throw new HttpError(404, 'not_found', 'There is no such text.');
  createWordStore({ db, now: () => now }).addLeaf({ accountId, lemma: form.trim().toLowerCase(), sourceTextId: text.id });
}

export function meaningsPrompt(db, accountId, now = Date.now()) {
  const missing = db.prepare("SELECT lemma FROM words WHERE account_id = ? AND state = 'leaf' AND kind = 'word' AND en IS NULL ORDER BY added_at, id LIMIT 200").all(accountId).map((r) => r.lemma);
  if (!missing.length) throw new HttpError(409, 'nothing_missing', 'Every leaf already has a meaning.');
  const prompt = buildMeaningsPrompt(missing);
  const info = db.prepare(`INSERT INTO exchanges (account_id, kind, code, prompt, status, created_at)
    VALUES (?, 'meanings', 'MEANINGS', ?, 'waiting', ?)`).run(accountId, prompt, now);
  return { exchangeId: Number(info.lastInsertRowid), prompt };
}
