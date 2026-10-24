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

test('FR-220 RQ-54: every G-02 table has account_id, so export and delete cover it', () => {
  const dir = tempDir();
  try {
    const db = openDb(join(dir, 'grove.db'));
    migrate(db);
    for (const name of ['words', 'word_forms', 'learner_settings', 'packages', 'exchanges', 'texts', 'text_lines', 'questions', 'sentences', 'ratings', 'question_answers']) {
      const cols = db.prepare(`PRAGMA table_info("${name}")`).all().map((c) => c.name);
      assert.ok(cols.includes('account_id'), `${name} has account_id`);
    }
    db.close();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('FR-307 RQ-29: migration 005 keeps every row and allows pattern items, own texts and package-less exchanges', () => {
  const dir = tempDir();
  try {
    const db = openDb(join(dir, 'grove.db'));
    migrate(db, { upTo: 4 });
    const run = (sql, ...args) => db.prepare(sql).run(...args);
    run("INSERT INTO accounts (id, firebase_uid, email, created_at) VALUES (1, 'u1', 'a@example.test', 1)");
    run("INSERT INTO words (id, account_id, lemma, kind, en, state, added_at) VALUES (5, 1, 'kopp', 'word', 'cup', 'leaf', 1)");
    run("INSERT INTO words (id, account_id, lemma, kind, state, added_at) VALUES (6, 1, 'hur mår du', 'phrase', 'leaf', 1)");
    run("INSERT INTO word_forms (account_id, form, word_id) VALUES (1, 'kopparna', 5)");
    run('INSERT INTO learner_settings (account_id, topic) VALUES (1, ?)', 'kafé');
    run("INSERT INTO packages (id, account_id, status, created_at) VALUES (3, 1, 'open', 1)");
    run("INSERT INTO exchanges (id, account_id, package_id, part_no, kind, code, prompt, status, created_at) VALUES (7, 1, 3, 1, 'part', 'ABCD-1', 'p', 'accepted', 1)");
    run("INSERT INTO texts (id, account_id, exchange_id, package_id, part_no, position, title, topic, created_at) VALUES (9, 1, 7, 3, 1, 1, 'T', 'kafé', 1)");
    run("INSERT INTO text_lines (account_id, text_id, position, sv, en) VALUES (1, 9, 0, 'Hej.', 'Hi.')");
    run("INSERT INTO questions (account_id, text_id, position, q, options, answer) VALUES (1, 9, 0, 'Q?', '[\"a\",\"b\"]', 0)");
    run("INSERT INTO sentences (account_id, text_id, line_position, position, sv) VALUES (1, 9, 0, 0, 'Hej.')");
    run("INSERT INTO ratings (account_id, text_id, value, at) VALUES (1, 9, 'most', 1)");
    run("INSERT INTO question_answers (account_id, text_id, position, option, right, at) VALUES (1, 9, 0, 0, 1, 1)");
    const tables = ['accounts', 'words', 'word_forms', 'learner_settings', 'packages', 'exchanges', 'texts', 'text_lines', 'questions', 'sentences', 'ratings', 'question_answers'];
    const before = Object.fromEntries(tables.map((t) => [t, db.prepare(`SELECT * FROM "${t}" ORDER BY rowid`).all()]));
    migrate(db);
    assert.equal(db.prepare('PRAGMA user_version').get().user_version >= 5, true);
    assert.deepEqual(db.prepare('PRAGMA foreign_key_check').all(), []);
    assert.equal(db.prepare('PRAGMA foreign_keys').get().foreign_keys, 1, 'foreign keys are back on');
    for (const t of tables) {
      const after = db.prepare(`SELECT * FROM "${t}" ORDER BY rowid`).all();
      assert.equal(after.length, before[t].length, t);
      before[t].forEach((row, i) => { for (const [k, v] of Object.entries(row)) assert.equal(after[i][k], v, `${t}.${k}`); });
    }
    run("INSERT INTO words (account_id, lemma, kind, en, state, added_at) VALUES (1, 'har + supine', 'pattern', 'x', 'leaf', 2)");
    run("INSERT INTO texts (account_id, position, title, topic, created_at, own) VALUES (1, 1, 'Own', '', 2, 1)");
    run("INSERT INTO exchanges (account_id, kind, code, prompt, status, created_at) VALUES (1, 'meanings', 'OWN', 'p', 'waiting', 2)");
    assert.equal(db.prepare("SELECT COUNT(*) AS n FROM word_forms WHERE word_id = 5").get().n, 1, 'children of rebuilt tables survive');
    db.close();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('FR-418 RQ-75: migration 006 keeps every row and adds the drill columns with their defaults', () => {
  const dir = tempDir();
  try {
    const db = openDb(join(dir, 'grove.db'));
    migrate(db, { upTo: 5 });
    db.prepare("INSERT INTO accounts (id, firebase_uid, email, created_at) VALUES (1, 'u1', 'a@example.test', 1)").run();
    db.prepare("INSERT INTO words (id, account_id, lemma, kind, en, state, added_at) VALUES (5, 1, 'kopp', 'word', 'cup', 'leaf', 1)").run();
    db.prepare('INSERT INTO learner_settings (account_id) VALUES (1)').run();
    migrate(db);
    const w = db.prepare('SELECT * FROM words WHERE id = 5').get();
    assert.equal(w.lemma, 'kopp');
    assert.equal(w.en, 'cup');
    for (const [k, v] of Object.entries({ to_read: 0, to_remember: 0, drilled: 0, gap_days: null, last_review_at: null, reviews: 0, fell_marks: null })) assert.equal(w[k], v, k);
    assert.equal(db.prepare('SELECT welcome_dismissed FROM learner_settings').get().welcome_dismissed, 0);
    for (const t of ['review_answers', 'input_days', 'level_words']) assert.ok(db.prepare("SELECT 1 FROM sqlite_master WHERE name = ?").get(t), t);
    db.close();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('FR-610 Q-03: migration 007 keeps every row and adds the level columns with their defaults', () => {
  const dir = tempDir();
  try {
    const db = openDb(join(dir, 'grove.db'));
    migrate(db, { upTo: 6 });
    db.prepare("INSERT INTO accounts (id, firebase_uid, email, created_at) VALUES (1, 'u1', 'a@example.test', 1)").run();
    db.prepare("INSERT INTO words (id, account_id, lemma, kind, state, added_at) VALUES (5, 1, 'kopp', 'word', 'ground', 1)").run();
    db.prepare("INSERT INTO level_words (level, lemma) VALUES ('A1', 'och')").run();
    db.prepare('INSERT INTO learner_settings (account_id) VALUES (1)').run();
    migrate(db);
    assert.equal(db.prepare('SELECT origin FROM words WHERE id = 5').get().origin, null);
    assert.deepEqual({ ...db.prepare('SELECT kind, wpm, source, licence FROM level_words').get() }, { kind: 'word', wpm: null, source: null, licence: null });
    assert.deepEqual({ ...db.prepare('SELECT start_level, start_done, start_at FROM learner_settings').get() }, { start_level: null, start_done: 0, start_at: null });
    assert.ok(db.prepare("SELECT 1 FROM sqlite_master WHERE name = 'sources'").get());
    db.close();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('FR-002 RQ-180: a nested transaction is part of the outer one; an inner failure undoes only the inner part', async () => {
  const { transaction } = await import('../../server/store/db.mjs');
  const dir = tempDir();
  try {
    const db = openDb(join(dir, 'grove.db'));
    migrate(db);
    transaction(db, () => {
      db.prepare("INSERT INTO settings (key, value) VALUES ('outer', '1')").run();
      transaction(db, () => db.prepare("INSERT INTO settings (key, value) VALUES ('inner', '1')").run());
      assert.throws(() => transaction(db, () => { db.prepare("INSERT INTO settings (key, value) VALUES ('failed', '1')").run(); throw new Error('boom'); }));
    });
    assert.deepEqual(db.prepare('SELECT key FROM settings ORDER BY key').all().map((r) => r.key), ['inner', 'outer']);
    assert.throws(() => transaction(db, () => { transaction(db, () => db.prepare("INSERT INTO settings (key, value) VALUES ('gone', '1')").run()); throw new Error('outer fails'); }));
    assert.equal(db.prepare("SELECT COUNT(*) AS n FROM settings WHERE key = 'gone'").get().n, 0, 'an outer failure undoes the inner part too');
    db.close();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
