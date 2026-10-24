import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openDb } from '../../server/store/db.mjs';
import { migrate, listMigrations } from '../../server/store/migrate.mjs';

function tempDir() {
  return mkdtempSync(join(tmpdir(), 'grove-store-'));
}

test('FR-002 RQ-180: a committed change is still there after the database is closed and reopened', () => {
  const dir = tempDir();
  try {
    const path = join(dir, 'grove.db');
    let db = openDb(path);
    migrate(db);
    db.prepare("INSERT INTO settings (key, value) VALUES ('tunnel_url', 'https://a.trycloudflare.com')").run();
    db.close();
    db = openDb(path);
    assert.equal(db.prepare("SELECT value FROM settings WHERE key = 'tunnel_url'").get().value, 'https://a.trycloudflare.com');
    db.close();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('FR-002 RQ-180: the database runs in WAL mode with synchronous FULL so saves survive a power cut', () => {
  const dir = tempDir();
  try {
    const db = openDb(join(dir, 'grove.db'));
    assert.equal(db.prepare('PRAGMA journal_mode').get().journal_mode, 'wal');
    assert.equal(db.prepare('PRAGMA synchronous').get().synchronous, 2);
    assert.equal(db.prepare('PRAGMA foreign_keys').get().foreign_keys, 1);
    db.close();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('FR-002 RQ-180: migrations run in order and set user_version', () => {
  const dir = tempDir();
  try {
    const db = openDb(join(dir, 'grove.db'));
    const versions = listMigrations().map((m) => m.version);
    assert.deepEqual(versions, [...versions].sort((a, b) => a - b));
    assert.equal(migrate(db), versions.at(-1));
    assert.equal(db.prepare('PRAGMA user_version').get().user_version, versions.at(-1));
    assert.equal(migrate(db), versions.at(-1), 'running again changes nothing');
    db.close();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('FR-002 RQ-180: migration keeps data — every row of a database at the previous version survives', () => {
  const dir = tempDir();
  try {
    const db = openDb(join(dir, 'grove.db'));
    const versions = listMigrations().map((m) => m.version);
    const previous = versions.length > 1 ? versions.at(-2) : 0;
    migrate(db, { upTo: previous });
    if (previous >= 1) {
      db.prepare("INSERT INTO accounts (firebase_uid, email, is_owner, created_at) VALUES ('u1', 'owner@example.test', 1, 1)").run();
      db.prepare("INSERT INTO accounts (firebase_uid, email, is_reviewer, created_at) VALUES ('u2', 'rev@example.test', 1, 2)").run();
      db.prepare("INSERT INTO sessions (id_hash, account_id, csrf_token, created_at, expires_at) VALUES ('h', 1, 'c', 1, 99)").run();
      db.prepare("INSERT INTO settings (key, value) VALUES ('tunnel_url', 'x')").run();
    }
    const before = {};
    for (const { name } of db.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all()) {
      before[name] = db.prepare(`SELECT * FROM "${name}" ORDER BY rowid`).all();
    }
    migrate(db);
    for (const [name, rows] of Object.entries(before)) {
      const after = db.prepare(`SELECT * FROM "${name}" ORDER BY rowid`).all();
      assert.equal(after.length, rows.length, `rows kept in ${name}`);
      rows.forEach((row, i) => {
        for (const [key, value] of Object.entries(row)) assert.equal(after[i][key], value, `${name}.${key}`);
      });
    }
    db.close();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('FR-016 RQ-146: the database allows at most one owner and one reviewer account', () => {
  const dir = tempDir();
  try {
    const db = openDb(join(dir, 'grove.db'));
    migrate(db);
    db.prepare("INSERT INTO accounts (firebase_uid, email, is_owner, created_at) VALUES ('u1', 'a@x.test', 1, 1)").run();
    assert.throws(() => db.prepare("INSERT INTO accounts (firebase_uid, email, is_owner, created_at) VALUES ('u2', 'b@x.test', 1, 1)").run());
    db.prepare("INSERT INTO accounts (firebase_uid, email, is_reviewer, created_at) VALUES ('u3', 'c@x.test', 1, 1)").run();
    assert.throws(() => db.prepare("INSERT INTO accounts (firebase_uid, email, is_reviewer, created_at) VALUES ('u4', 'd@x.test', 1, 1)").run());
    assert.throws(() => db.prepare("INSERT INTO accounts (firebase_uid, email, is_owner, is_reviewer, created_at) VALUES ('u5', 'e@x.test', 0, 1, 1)").run());
    db.close();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('FR-002 RQ-180: a failed migration leaves the database at its previous version', () => {
  const dir = tempDir();
  try {
    const migrations = join(dir, 'migrations');
    mkdirSync(migrations);
    writeFileSync(join(migrations, '001-ok.sql'), 'CREATE TABLE t (x INTEGER);');
    writeFileSync(join(migrations, '002-bad.sql'), 'INSERT INTO t VALUES (1); THIS IS NOT SQL;');
    const db = openDb(join(dir, 'grove.db'));
    assert.throws(() => migrate(db, { dir: migrations }));
    assert.equal(db.prepare('PRAGMA user_version').get().user_version, 1);
    assert.equal(db.prepare('SELECT COUNT(*) AS n FROM t').get().n, 0);
    db.close();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
