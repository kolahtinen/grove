import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openDb } from '../../server/store/db.mjs';
import { migrate } from '../../server/store/migrate.mjs';
import { backupNow, restoreBackup } from '../../server/store/backup.mjs';

function setup() {
  const dir = mkdtempSync(join(tmpdir(), 'grove-backup-'));
  const dataDir = join(dir, 'data');
  const backupDir = join(dir, 'backup');
  mkdirSync(dataDir);
  const db = openDb(join(dataDir, 'grove.db'));
  migrate(db);
  db.prepare("INSERT INTO accounts (firebase_uid, email, created_at) VALUES ('u1', 'a@example.test', 1)").run();
  return { dir, dataDir, backupDir, db, done: () => { try { db.close(); } catch {} rmSync(dir, { recursive: true, force: true }); } };
}

test('FR-003 RQ-180: backup:now writes grove-YYYYMMDD-HH.db to the backup folder and it reads back with the same rows', () => {
  const s = setup();
  try {
    const at = Date.UTC(2026, 9, 24, 15, 30);
    const { file, counts } = backupNow({ db: s.db, backupDir: s.backupDir, now: () => at });
    assert.match(file, /grove-20261024-15\.db$/);
    assert.equal(counts.accounts, 1);
    const copy = openDb(file);
    assert.equal(copy.prepare('SELECT email FROM accounts').get().email, 'a@example.test');
    copy.close();
  } finally {
    s.done();
  }
});

test('FR-003 RQ-180: only the last 48 backups are kept', () => {
  const s = setup();
  try {
    mkdirSync(s.backupDir, { recursive: true });
    for (let h = 0; h < 50; h += 1) writeFileSync(join(s.backupDir, `grove-202610${String(20 + Math.floor(h / 24)).padStart(2, '0')}-${String(h % 24).padStart(2, '0')}.db`), '');
    backupNow({ db: s.db, backupDir: s.backupDir, now: () => Date.UTC(2026, 9, 24, 12) });
    const left = readdirSync(s.backupDir).filter((n) => n.endsWith('.db')).sort();
    assert.equal(left.length, 48);
    assert.equal(left.at(-1), 'grove-20261024-12.db');
  } finally {
    s.done();
  }
});

test('FR-003 RQ-180: backup:restore refuses while grove runs and otherwise replaces the database', () => {
  const s = setup();
  try {
    const { file } = backupNow({ db: s.db, backupDir: s.backupDir, now: () => Date.UTC(2026, 9, 24, 12) });
    s.db.prepare("INSERT INTO accounts (firebase_uid, email, created_at) VALUES ('u2', 'b@example.test', 2)").run();
    writeFileSync(join(s.dataDir, 'grove.pid'), String(process.pid));
    assert.throws(() => restoreBackup({ dataDir: s.dataDir, file }), /grove is running/);
    rmSync(join(s.dataDir, 'grove.pid'));
    s.db.close();
    restoreBackup({ dataDir: s.dataDir, file });
    const db = openDb(join(s.dataDir, 'grove.db'));
    assert.deepEqual(db.prepare('SELECT email FROM accounts ORDER BY id').all().map((r) => r.email), ['a@example.test']);
    db.close();
  } finally {
    rmSync(s.dir, { recursive: true, force: true });
  }
});
