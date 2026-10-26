import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openDb } from '../../server/store/db.mjs';
import { migrate } from '../../server/store/migrate.mjs';
import { importKelly, kellyLoad } from '../../server/levels/import.mjs';
import { createSeclog } from '../../server/seclog/seclog.mjs';

function setup() {
  const dir = mkdtempSync(join(tmpdir(), 'grove-levels-'));
  const db = openDb(join(dir, 'grove.db'));
  migrate(db);
  const seclog = createSeclog({ db, logDir: join(dir, 'logs') });
  return { dir, db, seclog, done: () => { db.close(); rmSync(dir, { recursive: true, force: true }); } };
}

const rows = (db) => db.prepare('SELECT level, lemma, kind, source, licence FROM level_words ORDER BY level, lemma, kind').all();

test('FR-601 FR-032 RQ-407: the Kelly import as a start-up load runs in steps of at most 10,000 rows and stores the same as importing at once', () => {
  const stepped = setup();
  const direct = setup();
  try {
    const load = kellyLoad({ db: stepped.db, seclog: stepped.seclog });
    assert.equal(load.name, 'Kelly list');
    assert.ok(load.size > 7900, `${load.size} rows`);
    let total = 0;
    for (const n of load.steps()) {
      assert.ok(n > 0 && n <= 10000, `a step of ${n}`);
      total += n;
    }
    assert.equal(total, load.size);
    assert.equal(importKelly({ db: direct.db, seclog: direct.seclog }), 'imported');
    assert.deepEqual(rows(stepped.db), rows(direct.db));
    assert.equal(stepped.db.prepare("SELECT value FROM settings WHERE key = 'kelly_hash'").get().value,
      direct.db.prepare("SELECT value FROM settings WHERE key = 'kelly_hash'").get().value);
  } finally {
    stepped.done();
    direct.done();
  }
});

test('FR-601 FR-032 RQ-407: an unchanged or missing Kelly file is a load with nothing to do', () => {
  const s = setup();
  try {
    importKelly({ db: s.db, seclog: s.seclog });
    const unchanged = kellyLoad({ db: s.db, seclog: s.seclog });
    assert.equal(unchanged.size, 0);
    assert.deepEqual([...unchanged.steps()], []);
    const missing = kellyLoad({ db: s.db, seclog: s.seclog, file: join(s.dir, 'nope.tsv') });
    assert.equal(missing.size, 0);
    assert.deepEqual([...missing.steps()], []);
  } finally {
    s.done();
  }
});
