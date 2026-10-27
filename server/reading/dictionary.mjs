// The dictionary (FR-316, FR-317; research R9): four tabs (words, phrases, patterns, names), 100
// entries at a time A to Ö, searched on the server by form or meaning; each entry's example is the
// stored one. A word without a stored meaning shows the word list's (G-02 FR-207).
import { HttpError } from '../web/http.mjs';
import { meaning as dictionaryMeaning } from '../lexicon/lexicon.mjs';
import { fillExamples } from '../words/examples.mjs';

export const PAGE = 100;
const TABS = { words: 'word', phrases: 'phrase', patterns: 'pattern', names: null };
const STEP = 10000;

// Swedish order: å, ä, ö after z (SQLite compares bytes, which puts ä before å).
const sortKey = (column) => `replace(replace(replace(${column}, 'å', '{1'), 'ä', '{2'), 'ö', '{3')`;
const like = (q) => `%${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;

export function readQuery(params) {
  const tab = params.get('tab') ?? 'words';
  const q = (params.get('q') ?? '').trim().toLowerCase();
  const rawOffset = params.get('offset') ?? '0';
  const offset = /^\d+$/.test(rawOffset) ? Number(rawOffset) : NaN;
  if (!(tab in TABS) || q.length > 80 || !Number.isSafeInteger(offset) || offset % PAGE !== 0) {
    throw new HttpError(400, 'bad_request', 'That isn’t a dictionary page.');
  }
  return { tab, q, offset };
}

export function dictionaryPage(db, accountId, { tab = 'words', q = '', offset = 0 } = {}) {
  const pattern = like(q);
  const counts = { words: 0, phrases: 0, patterns: 0, names: 0 };
  for (const r of db.prepare(`SELECT kind, COUNT(*) AS n FROM words WHERE account_id = ? AND (lemma LIKE ? ESCAPE '\\' OR lower(en) LIKE ? ESCAPE '\\') GROUP BY kind`)
    .all(accountId, pattern, pattern)) {
    counts[`${r.kind}s`] = r.n;
  }
  counts.names = db.prepare("SELECT COUNT(*) AS n FROM names WHERE account_id = ? AND lower LIKE ? ESCAPE '\\'").get(accountId, pattern).n;

  let items;
  if (tab === 'names') {
    items = db.prepare(`SELECT name FROM names WHERE account_id = ? AND lower LIKE ? ESCAPE '\\' ORDER BY ${sortKey('lower')} LIMIT ? OFFSET ?`)
      .all(accountId, pattern, PAGE, offset).map((r) => ({ lemma: r.name }));
  } else {
    items = db.prepare(`SELECT w.lemma, w.kind, w.en, w.state, s.sv AS example FROM words w
      LEFT JOIN sentences s ON s.id = w.example_sentence_id
      WHERE w.account_id = ? AND w.kind = ? AND (w.lemma LIKE ? ESCAPE '\\' OR lower(w.en) LIKE ? ESCAPE '\\')
      ORDER BY ${sortKey('w.lemma')} LIMIT ? OFFSET ?`).all(accountId, TABS[tab], pattern, pattern, PAGE, offset)
      .map((w) => ({
        lemma: w.lemma,
        kind: w.kind,
        en: w.en ?? (w.kind === 'word' ? dictionaryMeaning(w.lemma)?.en ?? null : null),
        state: w.state,
        example: w.example ?? null,
      }));
  }
  return { tab, q, offset, total: counts[tab], counts, items };
}

// A start-up load (G-01 FR-032, research R14): gives the words met before migration 012 their
// examples, in steps of sentences, once.
export function examplesLoad({ db }) {
  const filled = db.prepare("SELECT value FROM settings WHERE key = 'examples_filled'").get()?.value === '1';
  const size = filled ? 0 : db.prepare('SELECT COUNT(*) AS n FROM sentences').get().n;
  const finish = () => db.prepare("INSERT INTO settings (key, value) VALUES ('examples_filled', '1') ON CONFLICT (key) DO UPDATE SET value = '1'").run();
  return {
    name: 'examples',
    size,
    *steps() {
      if (filled) return;
      for (const { account_id: accountId } of db.prepare('SELECT DISTINCT account_id FROM sentences').all()) {
        const ids = db.prepare('SELECT id FROM sentences WHERE account_id = ? ORDER BY id').all(accountId).map((r) => r.id);
        for (let i = 0; i < ids.length; i += STEP) {
          const chunk = ids.slice(i, i + STEP);
          fillExamples(db, accountId, { sentenceIds: chunk });
          yield chunk.length;
        }
      }
      finish();
    },
  };
}
