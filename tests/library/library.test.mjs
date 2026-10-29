import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { startTestGrove } from '../fakes/harness.mjs';
import { GROVE_TEXTS_FILE, importGroveTexts } from '../../server/library/library.mjs';
import { validateAnswer } from '../../server/texts/schema.mjs';
import { durationsFor, textSeconds } from '../../server/sessions/durations.mjs';
import { tokenize } from '../../server/words/tokens.mjs';

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
const CONTENT = new URL('../../content/library/texts/', import.meta.url);
const SOURCE = readdirSync(CONTENT).filter((f) => f.endsWith('.json')).sort()
  .flatMap((f) => { const j = JSON.parse(readFileSync(new URL(f, CONTENT), 'utf8')); return Array.isArray(j) ? j : j.texts; });

test('FR-916 RQ-438: every grove text in content/library is in the build, each with a topic and a level A1–C2 and in G-02\'s answer format', () => {
  assert.ok(FILE.length >= 50);
  assert.deepEqual(FILE.map((x) => x.id).sort(), SOURCE.map((x) => x.id).sort());
  for (const x of FILE) assert.ok(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(x.level), x.id);
  for (const x of FILE) {
    assert.ok(x.topic && x.id && ['reading', 'listening'].includes(x.kind), x.id);
    const checked = validateAnswer({ part: `LIB-${x.id}`, texts: [{ kind: x.kind, title: x.title, lines: x.lines, questions: x.questions }], new_words: [], new_phrases: [], inflections: [], names: x.names });
    assert.ok(checked.ok, `${x.id}: ${checked.problems?.join('; ')}`);
  }
});

test('FR-916 RQ-438: grove imports them at start-up into library_texts, belonging to no learner, and again only when the file changes', () => {
  const db = t.grove.db;
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM library_texts').get().n, FILE.length);
  assert.equal(db.prepare("PRAGMA table_info(library_texts)").all().some((col) => col.name === 'account_id'), false);
  assert.equal(importGroveTexts(db), 'unchanged');
});

test('FR-916 RQ-438 RQ-431: GET /api/library lists every grove text by topic with its level, and the learner\'s level for the filter (A1 with none yet)', async () => {
  const r = await c.get('/api/library');
  assert.equal(r.status, 200);
  assert.equal(r.body.level, 'A1');
  assert.equal(r.body.texts.length, FILE.length);
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

test('FR-916 FR-905 RQ-445 R-34: every library text shows its kind and its minutes for this learner, at the planner\'s durations', async () => {
  const { texts } = (await c.get('/api/library')).body;
  const below = durationsFor(true);
  for (const x of texts) {
    const source = FILE.find((y) => y.id === x.id);
    const words = source.lines.reduce((n, l) => n + tokenize(l.sv).length, 0);
    assert.ok(['reading', 'listening'].includes(x.kind), x.id);
    assert.equal(x.minutes, Math.max(1, Math.round(textSeconds({ kind: x.kind, words, read: false }, below) / 60)), x.id);
  }
  const lengths = new Set(texts.map((x) => x.minutes));
  assert.ok(lengths.size > 1, 'texts differ in length');
});

test('FR-916 RQ-445: a grove text not yet added can be read in full (its lines, level, topic, kind and minutes), with whether the learner has a copy; an unknown id is 404', async () => {
  const one = FILE.find((x) => x.level === 'A2');
  const r = await c.get(`/api/library/text?id=${one.id}`);
  assert.equal(r.status, 200);
  assert.equal(r.body.title, one.title);
  assert.deepEqual(r.body.lines.map((l) => l.sv), one.lines.map((l) => l.sv));
  for (const key of ['level', 'topic', 'kind', 'minutes']) assert.ok(r.body[key], key);
  assert.equal(r.body.added, null);
  assert.equal((await c.get('/api/library/text?id=Z9-99')).status, 404);
  assert.equal((await t.client().get(`/api/library/text?id=${one.id}`)).status, 401);
});
