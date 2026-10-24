import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startTestGrove } from '../fakes/harness.mjs';

let t;
before(async () => {
  t = await startTestGrove({ levels: false });
  t.seedAccount({ email: 'learner@example.test' });
});
after(() => t.close());

test('FR-601 FR-604 RQ-117: without level word lists the starting check says it isn\'t available, and beginner still works', async () => {
  const c = t.client();
  await c.signInAgreed('learner@example.test');
  const res = await c.get('/api/start/sample?level=A2');
  assert.equal(res.status, 503);
  assert.equal(res.body.error, 'levels_unavailable');
  assert.equal((await c.post('/api/start', { level: 'A2', unknown: [] })).status, 503);
  assert.equal((await c.post('/api/start', { level: 'beginner', unknown: [] })).status, 200);
});
