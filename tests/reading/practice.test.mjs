import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readingGrove, signedIn, addPart, textId } from './helpers.mjs';

let t;
let learner;
let c;
before(async () => {
  ({ t, learner } = await readingGrove());
  c = await signedIn(t);
  const { res } = await addPart(c);
  assert.equal(res.result, 'accepted', JSON.stringify(res));
});
after(() => t.close());

test('FR-310 RQ-274 RQ-278 RQ-58: practice asks, in text order, what a leaf means in its sentence, with 3–4 options from other words\' meanings', async () => {
  const id = textId(t, learner.id, 'En bra dag');
  const res = await c.get(`/api/practice?id=${id}`);
  assert.equal(res.status, 200);
  const qs = res.body.questions;
  assert.ok(qs.length >= 3 && qs.length <= 8, `${qs.length} questions`);
  const order = qs.map((q) => q.sentence);
  const lines = t.grove.db.prepare('SELECT sv FROM sentences WHERE text_id = ? ORDER BY line_position, position').all(id).map((r) => r.sv);
  assert.deepEqual(order, lines.filter((l) => order.includes(l)), 'questions follow the text');
  const meanings = new Set(t.grove.db.prepare('SELECT en FROM words WHERE account_id = ? AND en IS NOT NULL').all(learner.id).map((r) => r.en));
  for (const q of qs) {
    assert.ok(q.options.length >= 3 && q.options.length <= 4);
    assert.equal(new Set(q.options).size, q.options.length, 'options are distinct');
    assert.ok(q.sentence.toLowerCase().includes(q.word.toLowerCase()));
    q.options.forEach((o, i) => { if (i !== q.right) assert.ok(meanings.has(o), `wrong option "${o}" is another word's meaning`); });
  }
  const kopparna = qs.find((q) => q.word === 'kopparna');
  assert.equal(kopparna.options[kopparna.right], 'the cups');
});

test('FR-310 RQ-278: never more than 8 questions, and a word without enough other meanings is skipped', async () => {
  const db = t.grove.db;
  // Every leaf has a meaning now (the word list's at least, G-03 FR-306), so leave the learner one
  // other word's meaning: no question can have 3 options.
  db.prepare("UPDATE words SET en = NULL WHERE account_id = ? AND lemma NOT IN ('kopp')").run(learner.id);
  db.prepare("DELETE FROM word_meanings WHERE account_id = ? AND word_id NOT IN (SELECT id FROM words WHERE lemma IN ('kopp'))").run(learner.id);
  const res = await c.get(`/api/practice?id=${textId(t, learner.id, 'En bra dag')}`);
  assert.equal(res.body.questions.length, 0, 'with only 1 other meaning known, no question can have 3 options');
});

test('FR-319 RQ-155: another account gets 404 for practice on this text', async () => {
  const other = await signedIn(t, 'other@example.test');
  assert.equal((await other.get(`/api/practice?id=${textId(t, learner.id, 'En bra dag')}`)).status, 404);
});
