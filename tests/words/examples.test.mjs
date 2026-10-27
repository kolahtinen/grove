import { test } from 'node:test';
import assert from 'node:assert/strict';
import { openDb } from '../../server/store/db.mjs';
import { migrate } from '../../server/store/migrate.mjs';
import { fillExamples } from '../../server/words/examples.mjs';

// Two learners, each with one text; sentences in id order.
function setUp() {
  const db = openDb(':memory:');
  migrate(db);
  db.prepare("INSERT INTO accounts (id, firebase_uid, email, created_at) VALUES (1, 'u1', 'a@example.test', 1), (2, 'u2', 'b@example.test', 1)").run();
  db.prepare("INSERT INTO texts (id, account_id, position, title, topic, created_at) VALUES (10, 1, 1, 'Kafé', 'café', 1), (20, 2, 1, 'Other', 'café', 1)").run();
  const sentence = db.prepare('INSERT INTO sentences (id, account_id, text_id, line_position, position, sv, new_items) VALUES (?, ?, ?, ?, ?, ?, ?)');
  sentence.run(1, 1, 10, 0, 0, 'Jag dricker kaffe.', '[]');
  sentence.run(2, 1, 10, 1, 0, 'Kopparna står på bordet.', '["kopp"]');
  sentence.run(3, 1, 10, 1, 1, 'Hur mår du, Elsa? Jag har druckit kaffe.', '[]');
  sentence.run(4, 1, 10, 2, 0, 'Hon har läst boken.', '[]');
  sentence.run(9, 2, 20, 0, 0, 'Paraplyet är blött.', '[]');
  const word = db.prepare("INSERT INTO words (id, account_id, lemma, kind, state, added_at) VALUES (?, ?, ?, ?, 'leaf', 1)");
  word.run(100, 1, 'kaffe', 'word');
  word.run(101, 1, 'kopp', 'word');
  word.run(102, 1, 'hur mår du', 'phrase');
  word.run(103, 1, 'har + supine', 'pattern');
  word.run(104, 1, 'bord', 'word');
  word.run(105, 1, 'hundra', 'word');
  word.run(106, 1, 'paraply', 'word');
  db.prepare("INSERT INTO word_forms (account_id, form, word_id) VALUES (1, 'bordet', 104)").run();
  db.prepare("INSERT INTO pattern_places (account_id, word_id, text_id, line_position, words) VALUES (1, 103, 10, 2, '[\"har\",\"läst\"]')").run();
  return db;
}
const exampleOf = (db, id) => db.prepare('SELECT example_sentence_id AS s FROM words WHERE id = ?').get(id).s;

test('FR-316 RQ-410: each word without an example gets the first sentence it appears in, by its form, a stored form or the sentence\'s new items', () => {
  const db = setUp();
  fillExamples(db, 1);
  assert.equal(exampleOf(db, 100), 1, 'kaffe: first of sentences 1 and 3');
  assert.equal(exampleOf(db, 101), 2, 'kopp: listed among the new items of sentence 2');
  assert.equal(exampleOf(db, 104), 2, 'bord: through its stored form bordet');
  assert.equal(exampleOf(db, 105), null, 'hundra: in no sentence');
});

test('FR-316 RQ-410: a phrase gets the first sentence with its words in a row; a pattern the first sentence of its first place\'s line', () => {
  const db = setUp();
  fillExamples(db, 1);
  assert.equal(exampleOf(db, 102), 3);
  assert.equal(exampleOf(db, 103), 4);
});

test('FR-316 RQ-410: only the given sentences are used, and an example once stored is kept', () => {
  const db = setUp();
  fillExamples(db, 1, { sentenceIds: [3] });
  assert.equal(exampleOf(db, 100), 3);
  assert.equal(exampleOf(db, 101), null);
  fillExamples(db, 1);
  assert.equal(exampleOf(db, 100), 3, 'kaffe keeps sentence 3');
  assert.equal(exampleOf(db, 101), 2);
});

test('FR-316 FR-319 RQ-410 RQ-155: a word added later gets an earlier sentence of its own learner only', () => {
  const db = setUp();
  fillExamples(db, 1, { wordIds: [104] });
  assert.equal(exampleOf(db, 104), 2);
  assert.equal(exampleOf(db, 100), null, 'only the given words');
  fillExamples(db, 1, { wordIds: [106] });
  assert.equal(exampleOf(db, 106), null, 'paraply is only in another learner\'s sentence');
});
