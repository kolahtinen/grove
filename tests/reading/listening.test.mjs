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
