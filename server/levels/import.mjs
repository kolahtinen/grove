// Imports the Kelly list into the level word lists at start-up, with its source and licence, when
// the file is new or changed (FR-601; constitution 4.14). It is one of G-01 FR-032's start-up loads:
// steps of rows, all in one transaction, which is safe because nothing else writes while grove is
// starting (research R14). importKelly runs every step at once.
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { readKelly, KELLY_FILE } from './kelly.mjs';

export const KELLY = { name: 'Swedish Kelly list, Språkbanken', licence: 'CC BY-SA 3.0, LGPL 3.0', url: 'https://spraakbanken.gu.se/en/resources/kelly' };
const STEP = 10000;

// A start-up load: { name, size, steps, status } (research R14); status is 'missing', 'unchanged'
// or 'imported' (once the steps have run).
export function kellyLoad({ db, seclog, file = KELLY_FILE }) {
  const nothing = (status) => ({ name: 'Kelly list', size: 0, steps: () => [][Symbol.iterator](), status });
  if (!existsSync(file)) {
    seclog.app('error', 'Kelly list missing; level word lists not imported', {});
    return nothing('missing');
  }
  const hash = createHash('sha256').update(readFileSync(file)).digest('hex');
  if (db.prepare("SELECT value FROM settings WHERE key = 'kelly_hash'").get()?.value === hash) return nothing('unchanged');
  const rows = readKelly(file);
  const load = {
    name: 'Kelly list',
    size: rows.length,
    status: 'imported',
    *steps() {
      db.exec('BEGIN IMMEDIATE');
      let committed = false;
      try {
        db.prepare('DELETE FROM level_words WHERE source = ? OR source IS NULL').run(KELLY.name);
        const insert = db.prepare('INSERT OR IGNORE INTO level_words (level, lemma, kind, wpm, source, licence) VALUES (?, ?, ?, ?, ?, ?)');
        for (let start = 0; start < rows.length; start += STEP) {
          const end = Math.min(start + STEP, rows.length);
          for (let i = start; i < end; i += 1) {
            const r = rows[i];
            insert.run(r.level, r.lemma, r.kind, r.wpm, KELLY.name, KELLY.licence);
          }
          if (end === rows.length) {
            db.prepare('INSERT OR REPLACE INTO sources (name, licence, url) VALUES (?, ?, ?)').run(KELLY.name, KELLY.licence, KELLY.url);
            db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('kelly_hash', ?)").run(hash);
            db.exec('COMMIT');
            committed = true;
            seclog.app('info', 'Kelly list imported', { count: rows.length });
          }
          yield end - start;
        }
      } finally {
        if (!committed) db.exec('ROLLBACK');
      }
    },
  };
  return load;
}

export function importKelly({ db, seclog, file = KELLY_FILE }) {
  const load = kellyLoad({ db, seclog, file });
  for (const _ of load.steps());
  return load.status;
}
