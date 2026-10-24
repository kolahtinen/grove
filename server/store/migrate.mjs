// Applies numbered SQL migrations in order, tracked by PRAGMA user_version (constitution 4.13).
import { readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { transaction } from './db.mjs';

const MIGRATIONS_DIR = join(dirname(fileURLToPath(import.meta.url)), 'migrations');

export function listMigrations(dir = MIGRATIONS_DIR) {
  return readdirSync(dir)
    .filter((name) => /^\d{3}-.+\.sql$/.test(name))
    .sort()
    .map((name) => ({ version: Number(name.slice(0, 3)), name, sql: readFileSync(join(dir, name), 'utf8') }));
}

export function migrate(db, { upTo = Infinity, dir = MIGRATIONS_DIR } = {}) {
  let current = db.prepare('PRAGMA user_version').get().user_version;
  for (const m of listMigrations(dir)) {
    if (m.version <= current || m.version > upTo) continue;
    // A table rebuild needs foreign keys off, or dropping the old table would empty its children
    // (research R4 of specs/003-reading-word-menu).
    const keysOff = m.sql.startsWith('-- foreign-keys-off');
    if (keysOff) db.exec('PRAGMA foreign_keys = OFF');
    try {
      transaction(db, () => {
        db.exec(m.sql);
        if (keysOff) {
          const broken = db.prepare('PRAGMA foreign_key_check').all();
          if (broken.length) throw new Error(`migration ${m.name} breaks ${broken.length} foreign keys`);
        }
        db.exec(`PRAGMA user_version = ${m.version}`);
      });
    } finally {
      if (keysOff) db.exec('PRAGMA foreign_keys = ON');
    }
    current = m.version;
  }
  return current;
}
