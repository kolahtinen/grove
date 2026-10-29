import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { startTestGrove } from '../fakes/harness.mjs';
import { GROVE_TEXTS_FILE, importGroveTexts } from '../../server/library/library.mjs';
import { validateAnswer } from '../../server/texts/schema.mjs';

let t;
let c;
let learner;
before(async () => {
  t = await startTestGrove();
  learner = t.seedAccount({ email: 'reader@example.test' });
  t.seedAccount({ email: 'other@example.test' });
  c = t.client();
  await c.signInAgreed('reader@example.test');
});
after(() => t.close());

const FILE = JSON.parse(readFileSync(GROVE_TEXTS_FILE, 'utf8'));

test('FR-916 RQ-438: the 50 approved grove texts are in the build, ten per level A1–C1, each with a topic and level and in G-02\'s answer format', () => {
  assert.equal(FILE.length, 50);
  for (const level of ['A1', 'A2', 'B1', 'B2', 'C1']) assert.equal(FILE.filter((x) => x.level === level).length, 10, level);
  for (const x of FILE) {
    assert.ok(x.topic && x.id && ['reading', 'listening'].includes(x.kind), x.id);
    const checked = validateAnswer({ part: `LIB-${x.id}`, texts: [{ kind: x.kind, title: x.title, lines: x.lines, questions: x.questions }], new_words: [], new_phrases: [], inflections: [], names: x.names });
    assert.ok(checked.ok, `${x.id}: ${checked.problems?.join('; ')}`);
  }
});

test('FR-916 RQ-438: grove imports them at start-up into library_texts, belonging to no learner, and again only when the file changes', () => {
  const db = t.grove.db;
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM library_texts').get().n, 50);
  assert.equal(db.prepare("PRAGMA table_info(library_texts)").all().some((col) => col.name === 'account_id'), false);
  assert.equal(importGroveTexts(db), 'unchanged');
});

test('FR-916 RQ-438 RQ-431: GET /api/library lists every grove text by topic with its level, and the learner\'s level for the filter (A1 with none yet)', async () => {
  const r = await c.get('/api/library');
  assert.equal(r.status, 200);
  assert.equal(r.body.level, 'A1');
  assert.equal(r.body.texts.length, 50);
  assert.ok(r.body.texts.every((x) => x.topic && x.level && x.title && x.added === null));
  assert.equal((await t.client().get('/api/library')).status, 401);
});

test('FR-916 RQ-438 RQ-155: Add to your library stores the learner\'s own copy through G-02\'s accept path, under its topic, marked grove text and never Beta; adding again opens the same copy; another learner sees none of it', async () => {
  const one = FILE.find((x) => x.level === 'A1');
  const r = await c.post('/api/library/add', { id: one.id });
  assert.equal(r.status, 200, JSON.stringify(r.body));
  assert.equal(r.body.added, true);
  const again = await c.post('/api/library/add', { id: one.id });
  assert.deepEqual(again.body, { textId: r.body.textId, added: false });
  const row = { ...t.grove.db.prepare('SELECT account_id, topic, title, library_id FROM texts WHERE id = ?').get(r.body.textId) };
  assert.deepEqual(row, { account_id: learner.id, topic: one.topic, title: one.title, library_id: one.id });
  const reading = (await c.get(`/api/reading?id=${r.body.textId}`)).body;
  assert.equal(reading.beta, false);
  assert.equal(reading.grove, true);
  assert.ok(reading.lines.length > 0);
  const home = (await c.get('/api/home')).body.texts.find((x) => x.id === r.body.textId);
  assert.equal(home.beta, false);
  assert.equal(home.grove, true);
  const topics = (await c.get('/api/topics')).body.topics.find((x) => x.topic === one.topic);
  assert.ok(topics.texts.some((x) => x.id === r.body.textId && x.grove && !x.beta));
  assert.equal((await c.get('/api/library')).body.texts.find((x) => x.id === one.id).added, r.body.textId);
  const other = t.client();
  await other.signInAgreed('other@example.test');
  assert.equal((await other.get('/api/library')).body.texts.find((x) => x.id === one.id).added, null);
  assert.equal((await other.get(`/api/reading?id=${r.body.textId}`)).status, 404);
  assert.equal((await c.post('/api/library/add', { id: 'Z9-99' })).status, 404);
});
