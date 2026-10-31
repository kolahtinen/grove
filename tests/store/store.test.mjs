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

test('FR-503 RQ-13: migration 008 keeps every row and adds speech_rate (1) and voice_help_shown (0)', () => {
  const dir = tempDir();
  try {
    const db = openDb(join(dir, 'grove.db'));
    migrate(db, { upTo: 7 });
    db.prepare("INSERT INTO accounts (id, firebase_uid, email, created_at) VALUES (1, 'u1', 'a@example.test', 1)").run();
    db.prepare("INSERT INTO learner_settings (account_id, topic) VALUES (1, 'kafé')").run();
    migrate(db);
    assert.deepEqual({ ...db.prepare('SELECT topic, speech_rate, voice_help_shown FROM learner_settings').get() }, { topic: 'kafé', speech_rate: 1, voice_help_shown: 0 });
    db.close();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('FR-207 RQ-379: migration 009 adds asked_forms and fills it for existing meanings exchanges from their prompts', () => {
  const dir = tempDir();
  try {
    const db = openDb(join(dir, 'grove.db'));
    migrate(db, { upTo: 8 });
    db.prepare("INSERT INTO accounts (id, firebase_uid, email, created_at) VALUES (1, 'u1', 'a@example.test', 1)").run();
    const prompt = 'Intro line:\n\ntolv, pensionär, paraply\n\nFor each word give its dictionary form.';
    db.prepare("INSERT INTO exchanges (account_id, kind, code, prompt, status, created_at) VALUES (1, 'meanings', 'MEANINGS', ?, 'waiting', 1)").run(prompt);
    db.prepare("INSERT INTO exchanges (account_id, kind, code, prompt, status, created_at) VALUES (1, 'part', 'ABCD-1', 'a part prompt', 'waiting', 1)").run();
    migrate(db);
    const rows = db.prepare('SELECT kind, prompt, asked_forms FROM exchanges ORDER BY id').all();
    assert.deepEqual(JSON.parse(rows[0].asked_forms), ['tolv', 'pensionär', 'paraply']);
    assert.equal(rows[0].prompt, prompt);
    assert.equal(rows[1].asked_forms, null);
    db.close();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('FR-207 RQ-379: migration 009 reads the asked forms from a prompt grove itself made, in lower case', async () => {
  // The meanings prompt as grove made it before G-02 FR-207 removed it (2026-10-26), frozen here.
  const buildMeaningsPrompt = (forms) => [
    "I'm learning Swedish with grove. Please give the meaning of each of these Swedish words as they were used in the texts you just wrote:",
    forms.join(', '),
    'For each word give its dictionary form, a short English meaning and a simple Swedish explanation using very common words.',
    'Reply with ONLY one ```json code block in this format, and no other text:\n```json\n{ "meanings": [ { "form": "as written", "lemma": "dictionary form", "en": "short English meaning", "explain_sv": "enkel förklaring" } ] }\n```',
  ].join('\n\n');
  const dir = tempDir();
  try {
    const db = openDb(join(dir, 'grove.db'));
    migrate(db, { upTo: 8 });
    db.prepare("INSERT INTO accounts (id, firebase_uid, email, created_at) VALUES (1, 'u1', 'a@example.test', 1)").run();
    db.prepare("INSERT INTO exchanges (account_id, kind, code, prompt, status, created_at) VALUES (1, 'meanings', 'MEANINGS', ?, 'accepted', 1)")
      .run(buildMeaningsPrompt(['Tolv', 'pensionär', 'Paraply']));
    migrate(db);
    assert.deepEqual(JSON.parse(db.prepare('SELECT asked_forms FROM exchanges').get().asked_forms), ['tolv', 'pensionär', 'paraply']);
    db.close();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('FR-202 FR-207 FR-318 RQ-393 RQ-396 RQ-400: migration 010 keeps every row and id, marks existing meanings as the AI\'s, replaces waiting meanings prompts, and adds the new columns', () => {
  const dir = tempDir();
  try {
    const db = openDb(join(dir, 'grove.db'));
    migrate(db, { upTo: 9 });
    db.prepare("INSERT INTO accounts (id, firebase_uid, email, created_at) VALUES (1, 'u1', 'a@example.test', 1)").run();
    db.prepare("INSERT INTO packages (id, account_id, status, created_at) VALUES (5, 1, 'open', 1)").run();
    db.prepare("INSERT INTO exchanges (id, account_id, package_id, part_no, kind, code, prompt, status, created_at) VALUES (7, 1, 5, 1, 'part', 'ABCD-1', 'p', 'accepted', 1)").run();
    db.prepare("INSERT INTO exchanges (id, account_id, package_id, part_no, kind, code, prompt, status, created_at, asked_forms) VALUES (8, 1, 5, 1, 'meanings', 'ABCD-1', 'm', 'waiting', 1, '[\"tolv\"]')").run();
    db.prepare("INSERT INTO texts (id, account_id, exchange_id, package_id, part_no, position, title, topic, created_at) VALUES (3, 1, 7, 5, 1, 1, 'T', 'kafé', 1)").run();
    db.prepare("INSERT INTO words (account_id, lemma, kind, en, state, added_at) VALUES (1, 'kopp', 'word', 'cup', 'leaf', 1)").run();
    db.prepare("INSERT INTO words (account_id, lemma, kind, state, added_at) VALUES (1, 'tolv', 'word', 'leaf', 1)").run();
    migrate(db);
    assert.equal(db.prepare('PRAGMA foreign_key_check').all().length, 0);
    assert.deepEqual(db.prepare('SELECT lemma, en_source FROM words ORDER BY lemma').all().map((r) => ({ ...r })), [{ lemma: 'kopp', en_source: 'ai' }, { lemma: 'tolv', en_source: null }]);
    assert.deepEqual(db.prepare('SELECT id, status, asked_forms FROM exchanges ORDER BY id').all().map((r) => ({ ...r })), [{ id: 7, status: 'accepted', asked_forms: null }, { id: 8, status: 'replaced', asked_forms: '["tolv"]' }]);
    assert.deepEqual({ ...db.prepare('SELECT id, exchange_id, kind, ready, known_share FROM texts').get() }, { id: 3, exchange_id: 7, kind: 'reading', ready: 1, known_share: null });
    assert.deepEqual({ ...db.prepare('SELECT one_text, fail_streak, code FROM packages').get() }, { one_text: 0, fail_streak: 0, code: null });
    db.prepare("INSERT INTO exchanges (account_id, kind, code, prompt, status, created_at, text_id, steps) VALUES (1, 'own', 'OWN-1', 'p', 'waiting', 2, 3, '[]')").run();
    assert.throws(() => db.prepare("INSERT INTO texts (account_id, position, title, topic, created_at, kind) VALUES (1, 1, 'x', 'y', 1, 'song')").run());
    db.close();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('FR-223 RQ-404: migration 011 adds the AI, product and tactic, and a whole-package learner gets the whole-package tactic', () => {
  const dir = tempDir();
  try {
    const db = openDb(join(dir, 'grove.db'));
    migrate(db, { upTo: 10 });
    db.prepare("INSERT INTO accounts (id, firebase_uid, email, created_at) VALUES (1, 'u1', 'a@example.test', 1), (2, 'u2', 'b@example.test', 1)").run();
    db.prepare('INSERT INTO learner_settings (account_id, whole_package) VALUES (1, 1), (2, 0)').run();
    migrate(db);
    assert.deepEqual(db.prepare('SELECT account_id, ai_family, ai_product, tactic FROM learner_settings ORDER BY account_id').all().map((r) => ({ ...r })),
      [{ account_id: 1, ai_family: null, ai_product: null, tactic: 'whole' }, { account_id: 2, ai_family: null, ai_product: null, tactic: 'steps' }]);
    assert.throws(() => db.prepare("UPDATE learner_settings SET tactic = 'chat' WHERE account_id = 1").run());
    assert.equal(db.prepare('SELECT tactic FROM packages').all().length, 0);
    db.close();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});


test('FR-316 RQ-410: migration 012 keeps every word and adds an empty example_sentence_id and the dictionary index', () => {
  const dir = tempDir();
  try {
    const db = openDb(join(dir, 'grove.db'));
    migrate(db, { upTo: 11 });
    db.prepare("INSERT INTO accounts (id, firebase_uid, email, created_at) VALUES (1, 'u1', 'a@example.test', 1)").run();
    db.prepare("INSERT INTO words (id, account_id, lemma, kind, state, added_at) VALUES (5, 1, 'kopp', 'word', 'leaf', 1), (6, 1, 'kaffe', 'word', 'ground', 1)").run();
    migrate(db);
    assert.deepEqual(db.prepare('SELECT id, lemma, example_sentence_id FROM words ORDER BY id').all().map((r) => ({ ...r })),
      [{ id: 5, lemma: 'kopp', example_sentence_id: null }, { id: 6, lemma: 'kaffe', example_sentence_id: null }]);
    assert.ok(db.prepare("SELECT name FROM sqlite_master WHERE type = 'index' AND name = 'words_account_kind_lemma'").get());
    db.close();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('FR-418 RQ-415 RQ-412 RQ-411: migration 013 turns every To read mark into To remember with its schedule, keeps fell marks, adds Speak words (on) and drops the translations setting', () => {
  const dir = tempDir();
  try {
    const db = openDb(join(dir, 'grove.db'));
    migrate(db, { upTo: 12 });
    db.prepare("INSERT INTO accounts (id, firebase_uid, email, created_at) VALUES (1, 'u1', 'a@example.test', 1)").run();
    db.prepare('INSERT INTO learner_settings (account_id, show_translations) VALUES (1, 0)').run();
    db.prepare(`INSERT INTO words (id, account_id, lemma, kind, state, added_at, drilled, to_read, to_remember, gap_days, last_review_at, reviews, fell_marks) VALUES
      (1, 1, 'kopp', 'word', 'leaf', 1, 1, 1, 0, 2.5, 100, 3, NULL),
      (2, 1, 'mörk', 'word', 'leaf', 1, 1, 1, 1, 1, 200, 1, NULL),
      (3, 1, 'gärna', 'word', 'ground', 1, 0, 0, 0, NULL, NULL, 2, 'read')`).run();
    migrate(db);
    assert.deepEqual(db.prepare('SELECT id, drilled, to_read, to_remember, gap_days, last_review_at, reviews, fell_marks FROM words ORDER BY id').all().map((r) => ({ ...r })), [
      { id: 1, drilled: 1, to_read: 0, to_remember: 1, gap_days: 2.5, last_review_at: 100, reviews: 3, fell_marks: null },
      { id: 2, drilled: 1, to_read: 0, to_remember: 1, gap_days: 1, last_review_at: 200, reviews: 1, fell_marks: null },
      { id: 3, drilled: 0, to_read: 0, to_remember: 0, gap_days: null, last_review_at: null, reviews: 2, fell_marks: 'read' },
    ]);
    assert.equal(db.prepare('SELECT speak_words FROM learner_settings WHERE account_id = 1').get().speak_words, 1);
    assert.ok(!db.prepare('PRAGMA table_info(learner_settings)').all().some((c) => c.name === 'show_translations'));
    db.close();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('FR-914 RQ-155: migration 014 keeps every row and adds practice_sessions with one going session per account', () => {
  const dir = tempDir();
  try {
    const db = openDb(join(dir, 'grove.db'));
    migrate(db, { upTo: 13 });
    db.prepare("INSERT INTO accounts (id, firebase_uid, email, created_at) VALUES (1, 'u1', 'a@example.test', 1)").run();
    db.prepare("INSERT INTO words (id, account_id, lemma, kind, state, added_at) VALUES (5, 1, 'kopp', 'word', 'leaf', 1)").run();
    migrate(db);
    assert.equal(db.prepare('SELECT lemma FROM words WHERE id = 5').get().lemma, 'kopp');
    const add = db.prepare("INSERT INTO practice_sessions (account_id, kind, minutes, plan, status, started_at) VALUES (1, 'time', 10, '[]', ?, 1)");
    add.run('going');
    assert.throws(() => add.run('going'), 'a second going session');
    add.run('finished');
    assert.throws(() => db.prepare("INSERT INTO practice_sessions (account_id, kind, minutes, plan, status, started_at) VALUES (1, 'time', 61, '[]', 'finished', 1)").run());
    db.close();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('FR-903 FR-905 FR-920 RQ-440 RQ-441 RQ-444: migration 017 keeps every session and adds tile, skill, hard_only and offer', () => {
  const dir = tempDir();
  try {
    const db = openDb(join(dir, 'grove.db'));
    migrate(db, { upTo: 16 });
    db.prepare("INSERT INTO accounts (id, firebase_uid, email, created_at) VALUES (1, 'u1', 'a@example.test', 1)").run();
    const old = db.prepare("INSERT INTO practice_sessions (id, account_id, kind, minutes, params, plan, status, started_at) VALUES (?, 1, ?, ?, ?, '[]', ?, 1)");
    old.run(1, 'time', 10, '{}', 'going');
    old.run(2, 'topic', 10, '{"topic":"Mat"}', 'finished');
    old.run(3, 'skill', 5, '{"skill":"listening","form":"short"}', 'finished');
    old.run(4, 'skill', 5, '{"skill":"words","form":"long"}', 'finished');
    old.run(5, 'mode', null, '{"mode":"discover"}', 'finished');
    old.run(6, 'mode', null, '{"mode":"review"}', 'finished');
    old.run(7, 'mode', null, '{"mode":"master"}', 'finished');
    migrate(db);
    const row = (id) => db.prepare('SELECT kind, minutes, params, status, tile, skill, hard_only, offer FROM practice_sessions WHERE id = ?').get(id);
    assert.deepEqual({ ...row(1) }, { kind: 'time', minutes: 10, params: '{}', status: 'going', tile: 'mix', skill: 'mix', hard_only: 0, offer: null });
    assert.equal(row(2).tile, 'mix');
    assert.equal(row(2).params, '{"topic":"Mat"}');
    assert.deepEqual([row(3).tile, row(3).skill], ['mix', 'listening']);
    assert.deepEqual([row(4).tile, row(4).skill], ['mix', 'words']);
    assert.deepEqual([row(5).tile, row(5).skill, row(5).hard_only], ['discover', 'mix', 0]);
    assert.deepEqual([row(6).tile, row(6).hard_only], ['review', 0]);
    assert.deepEqual([row(7).tile, row(7).hard_only], ['review', 1]);
    const add = db.prepare("INSERT INTO practice_sessions (account_id, kind, minutes, plan, status, started_at, tile, skill, hard_only, offer) VALUES (1, 'time', 10, '[]', 'finished', 1, ?, ?, ?, ?)");
    add.run('review', 'reading', 1, '{"missing":{"reading":180,"listening":0},"at":5}');
    assert.throws(() => add.run('master', 'mix', 0, null), 'tile is discover, review or mix');
    assert.throws(() => add.run('mix', 'speaking', 0, null), 'skill is one of five');
    assert.throws(() => add.run('mix', 'mix', 2, null), 'hard_only is 0 or 1');
    db.close();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('FR-202 RQ-444: migration 018 keeps every package and adds only_kind, reading or listening or none', () => {
  const dir = tempDir();
  try {
    const db = openDb(join(dir, 'grove.db'));
    migrate(db, { upTo: 17 });
    db.prepare("INSERT INTO accounts (id, firebase_uid, email, created_at) VALUES (1, 'u1', 'a@example.test', 1)").run();
    db.prepare("INSERT INTO packages (id, account_id, status, created_at) VALUES (7, 1, 'closed', 1)").run();
    migrate(db);
    assert.equal(db.prepare('SELECT only_kind FROM packages WHERE id = 7').get().only_kind, null);
    db.prepare("INSERT INTO packages (account_id, status, created_at, only_kind) VALUES (1, 'closed', 2, 'reading')").run();
    assert.throws(() => db.prepare("INSERT INTO packages (account_id, status, created_at, only_kind) VALUES (1, 'closed', 3, 'video')").run());
    db.close();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('FR-925 RQ-448: migration 019 keeps every row; earlier minutes count as reading, and a drilled leaf\'s picked-up time is its added time', () => {
  const dir = tempDir();
  try {
    const db = openDb(join(dir, 'grove.db'));
    migrate(db, { upTo: 18 });
    db.prepare("INSERT INTO accounts (id, firebase_uid, email, created_at) VALUES (1, 'u1', 'a@example.test', 111)").run();
    db.prepare("INSERT INTO input_days (account_id, day, seconds) VALUES (1, '2026-10-28', 600)").run();
    db.prepare("INSERT INTO words (id, account_id, lemma, kind, state, added_at, drilled) VALUES (5, 1, 'kopp', 'word', 'leaf', 222, 1)").run();
    db.prepare("INSERT INTO words (id, account_id, lemma, kind, state, added_at, drilled) VALUES (6, 1, 'hus', 'word', 'ground', 333, 0)").run();
    migrate(db);
    assert.deepEqual({ ...db.prepare('SELECT seconds, read_seconds, listen_seconds FROM input_days WHERE account_id = 1').get() }, { seconds: 600, read_seconds: 600, listen_seconds: 0 });
    assert.equal(db.prepare('SELECT picked_at FROM words WHERE id = 5').get().picked_at, 222);
    assert.equal(db.prepare('SELECT picked_at FROM words WHERE id = 6').get().picked_at, null);
    assert.throws(() => db.prepare("UPDATE input_days SET listen_seconds = 60000 WHERE account_id = 1").run());
    db.close();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('FR-930 FR-931 FR-905 RQ-454 RQ-451: migration 020 keeps every row and adds learning_items, learning_seen and learning_reports, which go with the account', () => {
  const dir = tempDir();
  try {
    const db = openDb(join(dir, 'grove.db'));
    migrate(db, { upTo: 19 });
    db.prepare("INSERT INTO accounts (id, firebase_uid, email, created_at) VALUES (1, 'u1', 'a@example.test', 111)").run();
    db.prepare("INSERT INTO practice_sessions (account_id, kind, minutes, params, plan, at_index, status, started_at, tile, skill) VALUES (1, 'time', 10, '{}', '[]', 0, 'going', 1, 'mix', 'words')").run();
    migrate(db);
    assert.equal(db.prepare('SELECT skill FROM practice_sessions').get().skill, 'words', 'old sessions kept as they were');
    db.prepare("INSERT INTO learning_items (id, type, level, position, data) VALUES ('G-A1-01', 'pattern', 'A1', 0, '{}')").run();
    assert.throws(() => db.prepare("INSERT INTO learning_items (id, type, level, position, data) VALUES ('X', 'text', 'A1', 0, '{}')").run());
    assert.throws(() => db.prepare("INSERT INTO learning_items (id, type, level, position, data) VALUES ('Y', 'word', 'D1', 0, '{}')").run());
    db.prepare("INSERT INTO learning_seen (account_id, item_id, first_at, last_at) VALUES (1, 'G-A1-01', 5, 5)").run();
    assert.throws(() => db.prepare("INSERT INTO learning_seen (account_id, item_id, first_at, last_at) VALUES (1, 'G-A1-01', 6, 6)").run(), 'one row per learner and item');
    db.prepare("INSERT INTO learning_reports (account_id, item_id, reason, note, created_at) VALUES (1, 'W-noll', 'wrong_meaning', 'hm', 7)").run();
    assert.equal(db.prepare('SELECT status FROM learning_reports').get().status, 'open');
    assert.throws(() => db.prepare("INSERT INTO learning_reports (account_id, item_id, reason, created_at) VALUES (1, 'W-noll', 'nonsense', 7)").run());
    db.prepare('DELETE FROM practice_sessions').run();
    db.prepare('DELETE FROM accounts WHERE id = 1').run();
    assert.equal(db.prepare('SELECT COUNT(*) AS n FROM learning_seen').get().n, 0);
    assert.equal(db.prepare('SELECT COUNT(*) AS n FROM learning_reports').get().n, 0);
    assert.equal(db.prepare('SELECT COUNT(*) AS n FROM learning_items').get().n, 1, 'the content belongs to no learner');
    db.close();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('FR-315 FR-605 RQ-456 RQ-463: migration 021 keeps every report and lets a sentence be reported as not a name; the starting level is offered once (earlier accounts that saw Home count as offered)', () => {
  const dir = tempDir();
  try {
    const db = openDb(join(dir, 'grove.db'));
    migrate(db, { upTo: 20 });
    db.prepare("INSERT INTO accounts (id, firebase_uid, email, created_at) VALUES (1, 'u1', 'a@example.test', 111), (2, 'u2', 'b@example.test', 112), (3, 'u3', 'c@example.test', 113)").run();
    db.prepare('INSERT INTO learner_settings (account_id, welcome_dismissed, start_done) VALUES (1, 1, 0), (2, 0, 0), (3, 0, 1)').run();
    db.prepare("INSERT INTO packages (id, account_id, status, created_at) VALUES (3, 1, 'open', 1)").run();
    db.prepare("INSERT INTO exchanges (id, account_id, package_id, part_no, kind, code, prompt, status, created_at) VALUES (7, 1, 3, 1, 'part', 'ABCD-1', 'p', 'accepted', 1)").run();
    db.prepare("INSERT INTO texts (id, account_id, exchange_id, package_id, part_no, position, title, topic, created_at) VALUES (9, 1, 7, 3, 1, 1, 'T', 'kafé', 1)").run();
    db.prepare("INSERT INTO reports (account_id, code, text_id, line_position, reason, status, created_at) VALUES (1, 'R1', 9, 0, 'audio', 'open', 5)").run();
    migrate(db);
    assert.equal(db.prepare('SELECT reason FROM reports').get().reason, 'audio', 'the report is kept');
    db.prepare("INSERT INTO reports (account_id, code, text_id, line_position, reason, status, created_at) VALUES (1, 'R2', 9, 1, 'not_a_name', 'open', 6)").run();
    assert.throws(() => db.prepare("INSERT INTO reports (account_id, code, text_id, line_position, reason, status, created_at) VALUES (1, 'R3', 9, 1, 'nonsense', 'open', 6)").run());
    assert.throws(() => db.prepare("INSERT INTO reports (account_id, code, text_id, reason, status, created_at) VALUES (1, 'R4', 9, 'other', 'open', 6)").run(), 'still exactly one position');
    assert.throws(() => db.prepare("INSERT INTO reports (account_id, code, text_id, line_position, reason, status, created_at) VALUES (1, 'R1', 9, 2, 'other', 'open', 6)").run(), 'codes stay unique per account');
    const offered = Object.fromEntries(db.prepare('SELECT account_id, start_offered FROM learner_settings').all().map((r) => [r.account_id, r.start_offered]));
    assert.deepEqual(offered, { 1: 1, 2: 0, 3: 1 });
    db.prepare('DELETE FROM texts').run();
    db.prepare('DELETE FROM accounts WHERE id = 1').run();
    assert.equal(db.prepare('SELECT COUNT(*) AS n FROM reports').get().n, 0, 'reports go with their text and account');
    db.close();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
