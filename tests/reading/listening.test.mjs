import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readingGrove, signedIn, addPart, textId } from './helpers.mjs';

let t;
let learner;
let c;
before(async () => {
  ({ t, learner } = await readingGrove());
  c = await signedIn(t);
  await addPart(c);
});
after(() => t.close());

test('FR-503 RQ-13 RQ-365: the speech rate is kept within 0.5–1.5 and returned with the text and the stages', async () => {
  assert.deepEqual((await c.post('/api/settings', { speechRate: 0.7 })).body, { speechRate: 0.7 });
  for (const bad of [0.4, 1.6, '1', null]) assert.equal((await c.post('/api/settings', { speechRate: bad })).status, 400, String(bad));
  const r = (await c.get(`/api/reading?id=${textId(t, learner.id, 'En bra dag')}`)).body;
  assert.equal(r.speechRate, 0.7);
  assert.equal((await c.get('/api/stages')).body.speechRate, 0.7);
});

test('FR-502 RQ-20 RQ-369: "voice help shown" starts false, stays true once set, and is per account', async () => {
  const id = textId(t, learner.id, 'En bra dag');
  assert.equal((await c.get(`/api/reading?id=${id}`)).body.voiceHelpShown, false);
  await c.post('/api/settings', { voiceHelpShown: true });
  assert.equal((await c.get(`/api/reading?id=${id}`)).body.voiceHelpShown, true);
  const other = await signedIn(t, 'other@example.test');
  assert.equal((await other.get('/api/stages')).body.voiceHelpShown, false);
});

test('FR-921 RQ-421: the speech speed starts at 0.9× below B1 and 1× from B1, until the learner sets it (PD-03)', async () => {
  const { id } = t.seedAccount({ email: 'speed@example.test' });
  const fresh = await signedIn(t, 'speed@example.test');
  // No level yet counts as below B1.
  assert.equal((await fresh.get('/api/settings')).body.speechRate, 0.9);
  assert.equal((await fresh.get('/api/stages')).body.speechRate, 0.9);
  t.grove.db.prepare('INSERT OR IGNORE INTO learner_settings (account_id) VALUES (?)').run(id);
  t.grove.db.prepare("UPDATE learner_settings SET start_level = 'B1' WHERE account_id = ?").run(id);
  assert.equal((await fresh.get('/api/settings')).body.speechRate, 1);
  await fresh.post('/api/settings', { speechRate: 1.2 });
  t.grove.db.prepare("UPDATE learner_settings SET start_level = 'A1' WHERE account_id = ?").run(id);
  assert.equal((await fresh.get('/api/settings')).body.speechRate, 1.2, 'the learner\'s own speed stays');
});
