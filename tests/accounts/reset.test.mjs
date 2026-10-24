import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startTestGrove } from '../fakes/harness.mjs';

let t;
before(async () => {
  t = await startTestGrove({ answerMinMs: 1200 });
  t.seedAccount({ email: 'reviewer@example.test', role: 'reviewer' });
});
after(() => t.close());

test('FR-015 RQ-219: a reset for an account sends a Firebase PASSWORD_RESET request and answers sent_if_account', async () => {
  const c = t.client();
  await c.prepare();
  t.fb.state.resetEmails.length = 0;
  const res = await c.post('/api/reset', { email: 'Reviewer@Example.test ' });
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { result: 'sent_if_account' });
  assert.deepEqual(t.fb.state.resetEmails, ['reviewer@example.test']);
});

test('FR-015 RQ-372: an unknown address gets the identical answer, and both take at least 1.2 s', async () => {
  const c = t.client();
  await c.prepare();
  const timed = async (email) => {
    const started = Date.now();
    const res = await c.post('/api/reset', { email });
    return { res, ms: Date.now() - started };
  };
  const known = await timed('reviewer@example.test');
  const unknown = await timed('nobody@example.test');
  assert.equal(known.res.status, unknown.res.status);
  assert.deepEqual(known.res.body, unknown.res.body);
  assert.ok(known.ms >= 1150, `known took ${known.ms} ms`);
  assert.ok(unknown.ms >= 1150, `unknown took ${unknown.ms} ms`);
});

test('FR-023 RQ-371: a reset request is logged as reset_requested', async () => {
  const c = t.client();
  await c.prepare();
  await c.post('/api/reset', { email: 'reviewer@example.test' });
  assert.ok(t.grove.seclog.list({ event: 'reset_requested' }).some((r) => r.email === 'reviewer@example.test'));
});

test('FR-013 RQ-224 RQ-219: an existing sign-in keeps working after the password is changed (clarification 2)', async () => {
  const c = t.client();
  await c.signInAgreed('reviewer@example.test');
  t.fb.setPassword('reviewer@example.test', 'A-new-password-7');
  try {
    assert.equal((await c.get('/api/me')).status, 200);
    assert.equal((await c.get('/')).status, 200);
  } finally {
    t.fb.setPassword('reviewer@example.test', 'Forest-walk-42');
  }
});

test('FR-015 RQ-219: reset says plainly when Firebase is unreachable', async () => {
  const c = t.client();
  await c.prepare();
  t.fb.state.unreachable = true;
  try {
    const res = await c.post('/api/reset', { email: 'reviewer@example.test' });
    assert.equal(res.status, 503);
    assert.equal(res.body.error, 'signin_unavailable');
  } finally {
    t.fb.state.unreachable = false;
  }
});
