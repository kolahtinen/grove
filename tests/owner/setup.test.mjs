import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startTestGrove } from '../fakes/harness.mjs';
import { createAccount } from '../../server/owner/setup.mjs';

let t;
let deps;
before(async () => {
  t = await startTestGrove();
  deps = { db: t.grove.db, seclog: t.grove.seclog, firebase: t.grove.firebase };
});
after(() => t.close());

test('FR-016 RQ-146 RQ-223 RQ-227: owner:setup creates the owner account with the owner and learner roles', async () => {
  const account = await createAccount({ ...deps, role: 'owner', email: 'Owner@Example.test', password: 'Owner-forest-1' });
  assert.equal(account.email, 'owner@example.test');
  const row = t.grove.db.prepare('SELECT * FROM accounts WHERE id = ?').get(account.id);
  assert.equal(row.is_owner, 1);
  assert.ok(t.fb.users.has('owner@example.test'));
  const me = await (async () => { const c = t.client(); await c.signIn('owner@example.test', 'Owner-forest-1'); return c.get('/api/me'); })();
  assert.deepEqual(me.body.roles, ['learner', 'owner']);
});

test('FR-016 RQ-146 RQ-223: a second owner:setup is refused and no second owner exists', async () => {
  await assert.rejects(createAccount({ ...deps, role: 'owner', email: 'other@example.test', password: 'Owner-forest-2' }), /owner already exists/);
  assert.equal(t.grove.db.prepare('SELECT COUNT(*) AS n FROM accounts WHERE is_owner = 1').get().n, 1);
  assert.ok(!t.fb.users.has('other@example.test'), 'nothing was made in Firebase either');
});

test('FR-010 RQ-217 RQ-363: if the demo can’t be stored, reviewer:setup leaves nothing in grove or Firebase and can be run again', async () => {
  const failingDemo = () => { throw new Error('demo failed'); };
  await assert.rejects(createAccount({ ...deps, role: 'reviewer', email: 'reviewer@example.test', password: 'Forest-walk-42', demo: failingDemo }));
  assert.equal(t.grove.db.prepare('SELECT COUNT(*) AS n FROM accounts WHERE email = ?').get('reviewer@example.test').n, 0);
  assert.equal(t.grove.db.prepare('SELECT COUNT(*) AS n FROM accounts WHERE is_reviewer = 1').get().n, 0);
  assert.ok(!t.fb.users.has('reviewer@example.test'), 'the Firebase account was deleted again');
  assert.ok(!t.grove.seclog.list().some((r) => r.event === 'account_created'), 'nothing logged as created');
});

test('FR-010 RQ-217 RQ-360 RQ-221: reviewer:setup creates one reviewer account and checks the password rule', async () => {
  for (const weak of ['short1!', 'nodigits-here!', 'NoSymbols123', '12345678!']) {
    await assert.rejects(createAccount({ ...deps, role: 'reviewer', email: 'reviewer@example.test', password: weak }), /password/i, weak);
  }
  const account = await createAccount({ ...deps, role: 'reviewer', email: 'reviewer@example.test', password: 'Forest-walk-42' });
  assert.equal(t.grove.db.prepare('SELECT is_reviewer FROM accounts WHERE id = ?').get(account.id).is_reviewer, 1);
  await assert.rejects(createAccount({ ...deps, role: 'reviewer', email: 'second@example.test', password: 'Forest-walk-42' }), /reviewer account already exists/);
});

test('FR-010 RQ-217: no route creates accounts', async () => {
  const paths = t.grove.app.router.table().map((r) => r.path);
  assert.ok(!paths.some((p) => /sign-?up|register|account|invite/i.test(p)), paths.join(', '));
  // Signing in with an address Firebase knows but grove doesn't never makes an account.
  t.fb.addUser('newcomer@example.test', 'Forest-walk-42');
  const before = t.grove.db.prepare('SELECT COUNT(*) AS n FROM accounts').get().n;
  await t.client().signIn('newcomer@example.test', 'Forest-walk-42');
  assert.equal(t.grove.db.prepare('SELECT COUNT(*) AS n FROM accounts').get().n, before);
});

test('FR-023 RQ-371: both setups are logged', () => {
  const events = t.grove.seclog.list().map((r) => [r.event, r.detail && JSON.parse(r.detail).role]);
  assert.ok(events.some(([e, role]) => e === 'owner_setup' && role === 'owner'));
  assert.ok(events.some(([e, role]) => e === 'account_created' && role === 'reviewer'));
});
