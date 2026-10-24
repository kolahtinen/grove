import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startTestGrove, PASSWORD } from '../fakes/harness.mjs';

let t;
let clock = Date.now();
let reviewer;
before(async () => {
  t = await startTestGrove({ now: () => clock });
  reviewer = t.seedAccount({ email: 'reviewer@example.test', role: 'reviewer' });
});
after(() => t.close());

test('FR-009 RQ-366: the right password gives signed_in and a session cookie, after the ID token is verified', async () => {
  const c = t.client();
  t.fb.state.requests.length = 0;
  const res = await c.signIn('reviewer@example.test');
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { result: 'signed_in', termsNeeded: true });
  assert.ok(res.cookies.some((h) => h.startsWith('__Host-grove_session=')));
  assert.ok(t.fb.state.requests.some((r) => r.path === '/certs'), 'certificates fetched to verify the token');
});

test('FR-009 RQ-366: a Firebase user with no grove account cannot sign in', async () => {
  t.fb.addUser('stranger@example.test', PASSWORD);
  const res = await t.client().signIn('stranger@example.test');
  assert.equal(res.status, 401);
  assert.equal(res.body.error, 'wrong_credentials');
});

test('FR-012 RQ-372: a wrong password and an unknown address give the same 401 wrong_credentials', async () => {
  const wrong = await t.client().signIn('reviewer@example.test', 'Not-the-password-1');
  const unknown = await t.client().signIn('nobody@example.test', 'Not-the-password-1');
  assert.equal(wrong.status, 401);
  assert.equal(unknown.status, 401);
  assert.deepEqual(wrong.body, unknown.body);
  assert.equal(wrong.body.error, 'wrong_credentials');
});

test('FR-013 RQ-224: the session cookie is HttpOnly, Secure, SameSite=Lax, Path=/ with Max-Age 30 days', async () => {
  const res = await t.client().signIn('reviewer@example.test');
  const cookie = res.cookies.find((h) => h.startsWith('__Host-grove_session='));
  for (const attr of ['HttpOnly', 'Secure', 'SameSite=Lax', 'Path=/', 'Max-Age=2592000']) assert.ok(cookie.includes(attr), attr);
});

test('FR-013 RQ-224: a session 29 days old still works and one 30 days old does not', async () => {
  const c = t.client();
  await c.signIn('reviewer@example.test');
  const day = 24 * 60 * 60 * 1000;
  const start = clock;
  try {
    clock = start + 29 * day;
    assert.equal((await c.get('/api/me')).status, 200);
    clock = start + 30 * day;
    assert.equal((await c.get('/api/me')).status, 401);
  } finally {
    clock = start;
  }
});

test('FR-014 RQ-226: GET /api/me returns the email, roles, termsAgreed and a CSRF token', async () => {
  const c = t.client();
  await c.signIn('reviewer@example.test');
  const me = await c.get('/api/me');
  assert.equal(me.status, 200);
  assert.equal(me.body.email, 'reviewer@example.test');
  assert.deepEqual(me.body.roles, ['learner', 'reviewer']);
  assert.equal(me.body.termsAgreed, false);
  assert.equal(typeof me.body.csrf, 'string');
});

test('FR-014 RQ-226: sign-out deletes the session on the server and the old cookie no longer works', async () => {
  const c = t.client();
  await c.signIn('reviewer@example.test');
  const saved = new Map(c.jar);
  const out = await c.post('/api/signout', {});
  assert.equal(out.status, 200);
  assert.deepEqual(out.body, { result: 'signed_out' });
  assert.ok(out.cookies.some((h) => /__Host-grove_session=;.*Max-Age=0/.test(h)));
  for (const [k, v] of saved) c.jar.set(k, v);
  assert.equal((await c.get('/api/me')).status, 401, 'the old cookie is dead on the server');
  assert.equal(t.grove.db.prepare('SELECT COUNT(*) AS n FROM sessions WHERE account_id = ?').get(reviewer.id).n >= 0, true);
});

test('FR-023 RQ-371: sign-ins and sign-outs are logged', async () => {
  const c = t.client();
  await c.signIn('reviewer@example.test');
  await c.post('/api/signout', {});
  const events = t.grove.seclog.list({ sinceMs: 0 }).filter((r) => r.account_id === reviewer.id).map((r) => r.event);
  assert.ok(events.includes('signin'));
  assert.ok(events.includes('signout'));
});

test('FR-009 RQ-366: sign-in says plainly when Firebase is unreachable', async () => {
  t.fb.state.unreachable = true;
  try {
    const res = await t.client().signIn('reviewer@example.test');
    assert.equal(res.status, 503);
    assert.equal(res.body.error, 'signin_unavailable');
  } finally {
    t.fb.state.unreachable = false;
  }
});
