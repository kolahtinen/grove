import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openDb } from '../../server/store/db.mjs';
import { migrate } from '../../server/store/migrate.mjs';
import { createResolver } from '../../server/words/resolve.mjs';

function setup() {
  const dir = mkdtempSync(join(tmpdir(), 'grove-resolve-'));
  const db = openDb(join(dir, 'grove.db'));
  migrate(db);
  db.prepare("INSERT INTO accounts (id, firebase_uid, email, created_at) VALUES (1, 'u', 'a@example.test', 1)").run();
  const add = db.prepare("INSERT INTO words (account_id, lemma, kind, en, state, added_at) VALUES (1, ?, 'word', ?, ?, 1)");
  for (const w of ['säga', 'gå', 'läsa', 'vara', 'var', 'dag']) add.run(w, null, 'ground');
  const kopp = add.run('kopp', 'cup', 'leaf').lastInsertRowid;
  db.prepare("INSERT INTO word_forms (account_id, form, word_id) VALUES (1, 'kopparna', ?)").run(kopp);
  return { db, done: () => { db.close(); rmSync(dir, { recursive: true, force: true }); } };
}

test('FR-306 RQ-18: tokens resolve to their status and dictionary forms against all the learner\'s words', () => {
  const s = setup();
  try {
    const r = createResolver(s.db, 1, { names: ['Elsa'] });
    assert.deepEqual(r.resolve('säga'), { status: 'ground', lemmas: ['säga'] });
    assert.deepEqual(r.resolve('kopparna'), { status: 'leaf', lemmas: ['kopp'] });
    assert.deepEqual(r.resolve('gick'), { status: 'ground', lemmas: ['gå'] });
    assert.deepEqual(r.resolve('läser'), { status: 'ground', lemmas: ['läsa'] });
    assert.deepEqual(r.resolve('var').lemmas.sort(), ['var', 'vara'], 'a homograph lists every dictionary form');
    assert.equal(r.resolve('dagen').status, 'ground');
    assert.deepEqual(r.resolve('bulle'), { status: 'new', lemmas: [] });
  } finally {
    s.done();
  }
});

test('FR-303 RQ-56: names never get status new', () => {
  const s = setup();
  try {
    const r = createResolver(s.db, 1, { names: ['Elsa'] });
    assert.equal(r.resolve('elsa').status, 'name');
    assert.equal(r.resolve('stockholm', { capitalisedMidSentence: true }).status, 'name');
    assert.equal(r.resolve('maja').status, 'new', 'an unlisted name first in a sentence is not known to be a name');
  } finally {
    s.done();
  }
});
