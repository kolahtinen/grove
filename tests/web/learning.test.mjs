import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { startTestGrove } from '../fakes/harness.mjs';
import { LEARNING_FILE, learningInventory } from '../../server/learning/learning.mjs';

let t;
let c;
let other;
let learner;
before(async () => {
  t = await startTestGrove();
  learner = t.seedAccount({ email: 'learner@example.test' });
  other = t.seedAccount({ email: 'other@example.test' });
  c = t.client();
  await c.signInAgreed('learner@example.test');
});
after(() => t.close());

test('FR-930 RQ-454: grove imports its learning content at start-up', () => {
  const n = JSON.parse(readFileSync(LEARNING_FILE, 'utf8')).length;
  assert.equal(t.grove.db.prepare('SELECT COUNT(*) AS n FROM learning_items').get().n, n);
  assert.ok(t.grove.db.prepare("SELECT value FROM settings WHERE key = 'learning_content_hash'").get().value);
});

test('FR-928 FR-930 RQ-452 T-24: the card routes take only an item of the content, change only the signed-in learner\'s data and need the CSRF token', async () => {
  const [word] = learningInventory(t.grove.db, learner.id).words;
  assert.equal((await c.post('/api/learning/answer', { item: 'W-not-in-grove', action: 'pick' })).status, 404);
  assert.equal((await c.post('/api/learning/answer', { item: 'texts', action: 'pick' })).status, 404);
  assert.equal((await c.post('/api/learning/answer', { item: word, action: 'eat' })).status, 400);
  assert.equal((await c.post('/api/learning/answer', { item: word, action: 'pick' }, { sendCsrf: false })).status, 403);
  const r = await c.post('/api/learning/answer', { item: word, action: 'pick' });
  assert.equal(r.status, 200, JSON.stringify(r.body));
  assert.deepEqual(r.body, { state: 'leaf' });
  assert.equal(t.grove.db.prepare('SELECT COUNT(*) AS n FROM words WHERE account_id = ?').get(other.id).n, 0);
  assert.equal((await c.post('/api/learning/seen', { item: 'G-A1-01' })).status, 200);
  assert.equal(t.grove.db.prepare('SELECT COUNT(*) AS n FROM learning_seen WHERE account_id = ?').get(learner.id).n, 2);
  assert.equal((await c.post('/api/learning/seen', { item: 'G-Z9-99' })).status, 404);
});

test('FR-931 RQ-454: Report on an item keeps a reason and a note of at most 200 characters for the owner', async () => {
  assert.equal((await c.post('/api/learning/report', { item: 'P-A1-01', reason: 'bad_translation', note: 'x'.repeat(201) })).status, 400);
  assert.equal((await c.post('/api/learning/report', { item: 'P-A1-01', reason: 'nonsense' })).status, 400);
  assert.equal((await c.post('/api/learning/report', { item: 'P-A1-01', reason: 'bad_translation', note: 'the English' })).status, 200);
  const row = t.grove.db.prepare('SELECT * FROM learning_reports WHERE account_id = ?').get(learner.id);
  assert.deepEqual([row.item_id, row.reason, row.note, row.status], ['P-A1-01', 'bad_translation', 'the English', 'open']);
});
