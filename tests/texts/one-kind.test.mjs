import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startTestGrove } from '../fakes/harness.mjs';

// G-02 FR-202 as amended by addendum 006 (B-23, question-pages/83): a package started from G-09's
// short-session offer when the session needs only one kind asks only for that kind, in every part.
let t;
let learner;
before(async () => {
  t = await startTestGrove();
  learner = t.seedAccount({ email: 'reader@example.test' });
});
after(() => t.close());

const asksOf = (db, id) => JSON.parse(db.prepare('SELECT asks FROM exchanges WHERE id = ?').get(id).asks).map((a) => a.kind);

test('FR-202 FR-920 RQ-444: a package started from a Reading session\'s offer asks only for reading texts, as many as a part holds; started any other way, both kinds', async () => {
  const c = t.client();
  await c.signInAgreed('reader@example.test');
  const db = t.grove.db;
  const s = (await c.post('/api/sessions', { kind: 'time', tile: 'discover', skill: 'reading', minutes: 30, voice: true })).body.session;
  assert.deepEqual(s.offer.needs, ['reading']);
  const p = await c.post('/api/prompt', { action: 'new_package', forSession: true });
  assert.equal(p.status, 200, JSON.stringify(p.body));
  const kinds = asksOf(db, p.body.exchangeId);
  assert.ok(kinds.length >= 2 && kinds.every((k) => k === 'reading'), kinds.join());
  assert.equal(db.prepare("SELECT only_kind FROM packages WHERE account_id = ? AND status = 'open'").get(learner.id).only_kind, 'reading');
  const plain = await c.post('/api/prompt', { action: 'new_package' });
  assert.deepEqual(new Set(asksOf(db, plain.body.exchangeId)), new Set(['reading', 'listening']));
  assert.equal(db.prepare("SELECT only_kind FROM packages WHERE account_id = ? AND status = 'open'").get(learner.id).only_kind, null);
});

test('FR-202 RQ-444: from a Listening session\'s offer only listening; from a Mix needing both, both; with no offer, forSession changes nothing', async () => {
  const c = t.client();
  await c.signInAgreed('reader@example.test');
  const db = t.grove.db;
  await c.post('/api/sessions', { kind: 'time', tile: 'discover', skill: 'listening', minutes: 30, voice: true });
  const l = (await c.post('/api/prompt', { action: 'new_package', forSession: true })).body;
  assert.ok(asksOf(db, l.exchangeId).every((k) => k === 'listening'));
  await c.post('/api/sessions', { kind: 'time', tile: 'discover', skill: 'mix', minutes: 30, voice: true });
  const both = (await c.post('/api/prompt', { action: 'new_package', forSession: true })).body;
  assert.deepEqual(new Set(asksOf(db, both.exchangeId)), new Set(['reading', 'listening']));
  db.prepare("UPDATE practice_sessions SET status = 'replaced' WHERE account_id = ?").run(learner.id);
  const none = (await c.post('/api/prompt', { action: 'new_package', forSession: true })).body;
  assert.deepEqual(new Set(asksOf(db, none.exchangeId)), new Set(['reading', 'listening']));
});
