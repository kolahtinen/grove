// Discover's Words and Grammar (G-09 FR-928…FR-931; B-26, question-pages/89): grove's learning content,
// carried in the build and imported at start-up like the library's texts (FR-916), belonging to no learner;
// what each learner sees next (the next words and phrases not yet theirs nor shown, the pattern of the
// day and earlier patterns); the cards' answers (I know it, + Pick up, shown, met); Report for the owner;
// and the ladder patterns of a sentence for the word menu (G-03 FR-305).
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { transaction } from '../store/db.mjs';
import { HttpError } from '../web/http.mjs';
import { levelFor } from '../drill/progress.mjs';
import { createItems } from '../drill/items.mjs';
import { LEVELS, words } from './content.mjs';

export const LEARNING_FILE = join(dirname(fileURLToPath(import.meta.url)), 'learning-content.json');
export const REPORT_REASONS = { wrong_meaning: 'wrong meaning', bad_translation: 'bad translation', unnatural: 'unnatural sentence', wrong_mark: 'wrong mark', audio: 'audio', other: 'other' };

let ladderCache = null;

export function importLearningContent(db, file = LEARNING_FILE) {
  if (!existsSync(file)) return 'missing';
  const raw = readFileSync(file);
  const hash = createHash('sha256').update(raw).digest('hex');
  if (db.prepare("SELECT value FROM settings WHERE key = 'learning_content_hash'").get()?.value === hash) return 'unchanged';
  const items = JSON.parse(raw.toString('utf8'));
  transaction(db, () => {
    const upsert = db.prepare(`INSERT INTO learning_items (id, type, level, position, data) VALUES (?, ?, ?, ?, ?)
      ON CONFLICT (id) DO UPDATE SET type = excluded.type, level = excluded.level, position = excluded.position, data = excluded.data`);
    for (const x of items) upsert.run(x.id, x.type, x.level, x.position, JSON.stringify(x.data));
    db.prepare('DELETE FROM learning_items WHERE id NOT IN (SELECT value FROM json_each(?))').run(JSON.stringify(items.map((x) => x.id)));
    db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('learning_content_hash', ?)").run(hash);
  });
  ladderCache = null;
  return 'imported';
}

const parse = (row) => (row ? { id: row.id, type: row.type, level: row.level, position: row.position, data: JSON.parse(row.data) } : null);

export function getItem(db, id) {
  return parse(db.prepare('SELECT * FROM learning_items WHERE id = ?').get(String(id)));
}

// The learner's level for the content: FR-905's level, none yet (or below A1) A1.
export function learnerLevel(db, accountId) {
  const level = levelFor(db, accountId);
  return LEVELS.includes(level) ? level : 'A1';
}

// The levels to take words and phrases from: the learner's, then those below, nearest first.
const downFrom = (level) => LEVELS.slice(0, LEVELS.indexOf(level) + 1).reverse();

// What Discover's Words and Grammar can show this learner next (FR-928, FR-929), in order, as item IDs.
export function learningInventory(db, accountId, { now = Date.now(), limit = 200 } = {}) {
  const level = learnerLevel(db, accountId);
  const seen = new Map(db.prepare('SELECT item_id, first_at, last_at FROM learning_seen WHERE account_id = ?').all(accountId).map((r) => [r.item_id, r]));
  const own = new Set(db.prepare('SELECT kind, lemma FROM words WHERE account_id = ?').all(accountId).map((r) => `${r.kind}:${r.lemma}`));
  const pick = (type, key) => {
    const out = [];
    for (const lvl of downFrom(level)) {
      for (const row of db.prepare('SELECT * FROM learning_items WHERE type = ? AND level = ? ORDER BY position').all(type, lvl)) {
        if (out.length >= limit) return out;
        const data = JSON.parse(row.data);
        if (seen.has(row.id) || own.has(key(data))) continue;
        out.push(row.id);
      }
    }
    return out;
  };
  const wordsNext = pick('word', (d) => `word:${String(d.lemma).toLowerCase()}`);
  const phrases = pick('phrase', (d) => `phrase:${String(d.phrase).toLowerCase()}`);
  // The pattern of the day: the one first met today, else the first at or below the level not yet met.
  const patterns = db.prepare('SELECT id, level FROM learning_items WHERE type = ? ORDER BY position').all('pattern')
    .filter((p) => LEVELS.indexOf(p.level) <= LEVELS.indexOf(level));
  const today = new Date(now).toISOString().slice(0, 10);
  const metToday = patterns.filter((p) => seen.has(p.id) && new Date(seen.get(p.id).first_at).toISOString().slice(0, 10) === today)
    .sort((a, b) => seen.get(a.id).first_at - seen.get(b.id).first_at)[0];
  const day = metToday?.id ?? patterns.find((p) => !seen.has(p.id))?.id ?? null;
  const earlier = [...seen.keys()].filter((id) => id.startsWith('G-') && id !== day && getItem(db, id))
    .sort((a, b) => (seen.get(a).last_at - seen.get(b).last_at) || a.localeCompare(b));
  return { level, words: wordsNext, phrases, patterns: { day, earlier } };
}

// The example's word to mark: the first word of the sentence that starts with the word's stem.
function markFor(lemma, sv) {
  const first = words(lemma)[0] ?? '';
  const stem = first.length > 3 ? first.replace(/[ae]$/, '') : first;
  const m = String(sv).match(/\p{L}+(?:[-’']\p{L}+)*/gu)?.find((w) => w.toLowerCase().startsWith(stem));
  return m ?? null;
}

// The cards as the session page shows them (contracts/http-api.md, Exercise).
export function wordCard(item) {
  const d = item.data;
  return { id: item.id, lemma: d.lemma, pos: d.pos, en: d.en, level: item.level, example: { ...d.example, mark: markFor(d.lemma, d.example.sv) } };
}

export function phraseCard(db, item) {
  const d = item.data;
  const others = db.prepare("SELECT id, data FROM learning_items WHERE type = 'phrase' AND level = ? ORDER BY position").all(item.level)
    .filter((r) => r.id !== item.id).map((r) => JSON.parse(r.data).en).filter((en) => en !== d.en);
  const seed = [...item.id].reduce((n, ch) => n + ch.charCodeAt(0), 0);
  const wrong = others.length >= 2 ? [others[seed % others.length], others[(seed + 1 + Math.floor(others.length / 2)) % others.length]] : others;
  const unique = [...new Set(wrong)].slice(0, 2);
  const right = seed % (unique.length + 1);
  const choices = [...unique];
  choices.splice(right, 0, d.en);
  return { id: item.id, phrase: d.phrase, en: d.en, note: d.note, level: item.level, examples: d.examples, choices, right };
}

export function patternCard(item) {
  const d = item.data;
  return { id: item.id, level: item.level, name: d.name, explain: d.explain, howToSpot: d.howToSpot, examples: d.examples, text: d.text, spot: d.spot };
}

function mustItem(db, id, types) {
  const item = getItem(db, id);
  if (!item || !types.includes(item.type)) throw new HttpError(404, 'not_found', 'There is no such item.');
  return item;
}

export function markSeen(db, accountId, id, now = Date.now()) {
  mustItem(db, id, ['word', 'phrase', 'pattern']);
  db.prepare(`INSERT INTO learning_seen (account_id, item_id, first_at, last_at) VALUES (?, ?, ?, ?)
    ON CONFLICT (account_id, item_id) DO UPDATE SET last_at = excluded.last_at`).run(accountId, id, now, now);
}

// I know it (a word joins the ground) or + Pick up (a drilled leaf To remember, due now, G-04 FR-411); the
// content's meaning is the item's, as approved (FR-930). Either marks the item shown.
export function answerItem({ db, accountId, id, action, now = () => Date.now() }) {
  const item = mustItem(db, id, ['word', 'phrase']);
  if (action === 'know' && item.type !== 'word') throw new HttpError(400, 'bad_request', 'Only a word can be known this way.');
  const items = createItems({ db, now });
  const kind = item.type;
  const lemma = kind === 'word' ? item.data.lemma : item.data.phrase;
  return transaction(db, () => {
    let word = items.find(accountId, lemma, kind);
    if (!word) {
      word = items.findOrCreate(accountId, lemma, kind, null, item.data.en);
      db.prepare("UPDATE words SET en_source = 'ai' WHERE id = ?").run(word.id);
      word = items.groundFor(word);
    }
    if (action === 'pick') {
      if (word.state === 'ground') items.pickUp(word);
      else if (!word.drilled) items.setMarks(word, { remember: true });
    }
    markSeen(db, accountId, id, now());
    return { state: db.prepare('SELECT state FROM words WHERE id = ?').get(word.id).state };
  });
}

export function reportItem(db, accountId, { id, reason, note }, now = Date.now()) {
  mustItem(db, id, ['word', 'phrase', 'pattern']);
  db.prepare('INSERT INTO learning_reports (account_id, item_id, reason, note, created_at) VALUES (?, ?, ?, ?, ?)')
    .run(accountId, id, reason, note?.trim() ? note.trim().slice(0, 200) : null, now);
}

// The owner's list (FR-931, `npm run reports:show`): open reports, oldest first, with what the item is.
export function listReports(db) {
  return db.prepare("SELECT r.id, r.item_id, r.reason, r.note, r.created_at, i.type, i.data FROM learning_reports r LEFT JOIN learning_items i ON i.id = r.item_id WHERE r.status = 'open' ORDER BY r.created_at, r.id").all()
    .map((r) => {
      const d = r.data ? JSON.parse(r.data) : {};
      return { id: r.id, item: r.item_id, what: d.name ?? d.phrase ?? d.lemma ?? '(no longer in the content)', reason: REPORT_REASONS[r.reason] ?? r.reason, note: r.note, at: r.created_at };
    });
}

export function formatReports(rows) {
  if (!rows.length) return 'No open reports on the learning content.';
  return rows.map((r) => [new Date(r.at).toISOString().replace('T', ' ').slice(0, 16), r.item.padEnd(12), r.what, `— ${r.reason}`, r.note ? `— "${r.note}"` : ''].join('  ').trim()).join('\n');
}

// G-03 FR-305: grove's grammar ladder patterns whose marked parts (an example's or Spot it's mark) occur in
// a sentence, with the words of the sentence they cover. `tokens` are the sentence's words, lower case.
function ladder(db) {
  if (!ladderCache) {
    ladderCache = db.prepare("SELECT * FROM learning_items WHERE type = 'pattern' ORDER BY position").all().map(parse).map((p) => ({
      id: p.id, level: p.level, name: p.data.name, explain: p.data.explain,
      seqs: [...new Map([...p.data.examples.map((e) => e.mark), ...p.data.spot.map((s) => s.mark)].map((m) => words(m)).filter((s) => s.length).map((s) => [s.join(' '), s])).values()],
    }));
  }
  return ladderCache;
}

export function ladderFor(db, tokens) {
  const found = [];
  for (const p of ladder(db)) {
    const covered = new Set();
    for (const seq of p.seqs) {
      for (let i = 0; i + seq.length <= tokens.length; i += 1) {
        if (seq.every((w, k) => tokens[i + k] === w)) for (let k = 0; k < seq.length; k += 1) covered.add(i + k);
      }
    }
    if (covered.size) found.push({ id: p.id, level: p.level, name: p.name, explain: p.explain, indexes: [...covered].sort((a, b) => a - b) });
  }
  return found;
}
