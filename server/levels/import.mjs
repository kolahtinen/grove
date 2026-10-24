// Imports the Kelly list into the level word lists at start-up, with its source and licence, when
// the file is new or changed (FR-601; constitution 4.14).
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { transaction } from '../store/db.mjs';
import { readKelly, KELLY_FILE } from './kelly.mjs';

export const KELLY = { name: 'Swedish Kelly list, Språkbanken', licence: 'CC BY-SA 3.0, LGPL 3.0', url: 'https://spraakbanken.gu.se/en/resources/kelly' };

export function importKelly({ db, seclog, file = KELLY_FILE }) {
  if (!existsSync(file)) {
    seclog.app('error', 'Kelly list missing; level word lists not imported', {});
    return 'missing';
  }
  const hash = createHash('sha256').update(readFileSync(file)).digest('hex');
  if (db.prepare("SELECT value FROM settings WHERE key = 'kelly_hash'").get()?.value === hash) return 'unchanged';
  const rows = readKelly(file);
  transaction(db, () => {
    db.prepare('DELETE FROM level_words WHERE source = ? OR source IS NULL').run(KELLY.name);
    const insert = db.prepare('INSERT OR IGNORE INTO level_words (level, lemma, kind, wpm, source, licence) VALUES (?, ?, ?, ?, ?, ?)');
    for (const r of rows) insert.run(r.level, r.lemma, r.kind, r.wpm, KELLY.name, KELLY.licence);
    db.prepare('INSERT OR REPLACE INTO sources (name, licence, url) VALUES (?, ?, ?)').run(KELLY.name, KELLY.licence, KELLY.url);
    db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('kelly_hash', ?)").run(hash);
  });
  seclog.app('info', 'Kelly list imported', { count: rows.length });
  return 'imported';
}
