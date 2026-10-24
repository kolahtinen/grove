import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startTestGrove } from '../fakes/harness.mjs';

let t;
before(async () => {
  t = await startTestGrove({ answerMinMs: 1200 });
  t.seedAccount({ email: 'reviewer@example.test', role: 'reviewer' });
});
after(() => t.close());

async function timed(fn) {
  const started = Date.now();
  const res = await fn();
  return { res, ms: Date.now() - started };
}

test('FR-012 RQ-372: sign-in for an address with an account and one without gives identical status and body, both ≥ 1.2 s', async () => {
  const c = t.client();
  await c.prepare();
  const known = await timed(() => c.post('/api/signin', { email: 'reviewer@example.test', password: 'Wrong-password-9' }));
  const unknown = await timed(() => c.post('/api/signin', { email: 'nobody@example.test', password: 'Wrong-password-9' }));
  assert.equal(known.res.status, unknown.res.status);
  assert.deepEqual(known.res.body, unknown.res.body);
  assert.ok(known.ms >= 1150 && unknown.ms >= 1150, `${known.ms} / ${unknown.ms} ms`);
});

test('FR-012 RQ-372: password reset for an address with an account and one without gives identical status and body, both ≥ 1.2 s', async () => {
  const c = t.client();
  await c.prepare();
  const known = await timed(() => c.post('/api/reset', { email: 'reviewer@example.test' }));
  const unknown = await timed(() => c.post('/api/reset', { email: 'nobody@example.test' }));
  assert.equal(known.res.status, unknown.res.status);
  assert.deepEqual(known.res.body, unknown.res.body);
  assert.ok(known.ms >= 1150 && unknown.ms >= 1150, `${known.ms} / ${unknown.ms} ms`);
});
