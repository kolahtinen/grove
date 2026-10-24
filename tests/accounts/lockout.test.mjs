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

async function failTimes(email, n) {
  for (let i = 0; i < n; i += 1) {
    const res = await t.client().signIn(email, 'Wrong-password-9');
    assert.equal(res.status, 401);
  }
}

test('FR-020 RQ-156: after 5 failures a 6th try within 15 minutes is refused even with the right password, without asking Firebase', async () => {
  const c = t.client();
  await c.signInAgreed('reviewer@example.test');
  await failTimes('reviewer@example.test', 5);
  t.fb.state.requests.length = 0;
  const locked = await t.client().signIn('reviewer@example.test', PASSWORD);
  assert.equal(locked.status, 401);
  assert.equal(locked.body.error, 'wrong_credentials');
  assert.ok(!t.fb.state.requests.some((r) => r.path.includes('signInWithPassword')), 'Firebase is not asked while locked');
  assert.equal((await c.get('/api/me')).status, 200, 'a session already signed in keeps working');

  const start = clock;
  clock = start + 14 * 60 * 1000;
  assert.equal((await t.client().signIn('reviewer@example.test', PASSWORD)).status, 401, 'still locked at 14 minutes');
  clock = start + 15 * 60 * 1000 + 1000;
  assert.equal((await t.client().signIn('reviewer@example.test', PASSWORD)).status, 200, 'open again after 15 minutes');
});

test('FR-020 RQ-156: a success resets the count', async () => {
  await failTimes('reviewer@example.test', 4);
  assert.equal((await t.client().signIn('reviewer@example.test', PASSWORD)).status, 200);
  await failTimes('reviewer@example.test', 4);
  assert.equal((await t.client().signIn('reviewer@example.test', PASSWORD)).status, 200, 'four more failures do not lock');
});

test('FR-020 RQ-372: an address with no account locks the same way, and the locked answer equals the wrong-password answer', async () => {
  const wrong = await t.client().signIn('reviewer@example.test', 'Wrong-password-9');
  await failTimes('ghost@example.test', 5);
  const lockedGhost = await t.client().signIn('ghost@example.test', 'Wrong-password-9');
  assert.equal(lockedGhost.status, wrong.status);
  assert.deepEqual(lockedGhost.body, wrong.body);
  assert.equal(t.grove.db.prepare('SELECT failures FROM failed_signins WHERE email = ?').get('ghost@example.test').failures >= 5, true);
  // Clear the reviewer's single failure so later tests start clean.
  assert.equal((await t.client().signIn('reviewer@example.test', PASSWORD)).status, 200);
});

test('FR-023 RQ-371: failed sign-ins and the lockout are logged', () => {
  const failed = t.grove.seclog.list({ event: 'signin_failed' });
  const lockouts = t.grove.seclog.list({ event: 'lockout' });
  assert.ok(failed.some((r) => r.email === 'reviewer@example.test'));
  assert.ok(lockouts.some((r) => r.email === 'reviewer@example.test'));
  assert.ok(lockouts.some((r) => r.email === 'ghost@example.test'));
  void reviewer;
});
