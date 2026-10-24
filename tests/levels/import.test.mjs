import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync, readdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openDb } from '../../server/store/db.mjs';
import { migrate } from '../../server/store/migrate.mjs';
import { importKelly } from '../../server/levels/import.mjs';
import { KELLY_FILE } from '../../server/levels/kelly.mjs';
import { createSeclog } from '../../server/seclog/seclog.mjs';

function setup() {
  const dir = mkdtempSync(join(tmpdir(), 'grove-levels-'));
  const db = openDb(join(dir, 'grove.db'));
  migrate(db);
  const seclog = createSeclog({ db, logDir: join(dir, 'logs') });
  return { dir, db, seclog, done: () => { db.close(); rmSync(dir, { recursive: true, force: true }); } };
}

test('FR-601 RQ-117 C-05: start-up imports the Kelly file with source and licence on every row, fills sources and skips an unchanged file', () => {
  const s = setup();
  try {
    assert.equal(importKelly({ db: s.db, seclog: s.seclog }), 'imported');
    const n = s.db.prepare('SELECT COUNT(*) AS n FROM level_words').get().n;
    assert.ok(n > 7900);
    assert.equal(s.db.prepare("SELECT COUNT(*) AS n FROM level_words WHERE source = 'Swedish Kelly list, Språkbanken' AND licence = 'CC BY-SA 3.0, LGPL 3.0'").get().n, n);
    const src = s.db.prepare("SELECT * FROM sources WHERE name = 'Swedish Kelly list, Språkbanken'").get();
    assert.equal(src.licence, 'CC BY-SA 3.0, LGPL 3.0');
    assert.match(src.url, /spraakbanken\.gu\.se/);
    assert.ok(s.db.prepare("SELECT value FROM settings WHERE key = 'kelly_hash'").get().value.length === 64);
    assert.equal(importKelly({ db: s.db, seclog: s.seclog }), 'unchanged');
  } finally {
    s.done();
  }
});

test('FR-601 RQ-117: a missing Kelly file is logged and grove carries on', () => {
  const s = setup();
  try {
    assert.equal(importKelly({ db: s.db, seclog: s.seclog, file: join(s.dir, 'nope.tsv') }), 'missing');
    assert.equal(s.db.prepare('SELECT COUNT(*) AS n FROM level_words').get().n, 0);
    const log = readdirSync(join(s.dir, 'logs')).map((f) => readFileSync(join(s.dir, 'logs', f), 'utf8')).join('');
    assert.match(log, /Kelly list missing/);
  } finally {
    s.done();
  }
});
