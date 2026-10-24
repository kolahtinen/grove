import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startTestGrove } from '../fakes/harness.mjs';
import { createAccount } from '../../server/owner/setup.mjs';
import { exportAccount, deleteAccount } from '../../server/owner/data.mjs';
import { formatLog } from '../../server/owner/log.mjs';

let t;
let deps;
before(async () => {
  t = await startTestGrove();
  deps = { db: t.grove.db, seclog: t.grove.seclog, firebase: t.grove.firebase };
});
after(() => t.close());

test('FR-017 RQ-229: learner:export writes JSON with the account and every row that references it', async () => {
  await createAccount({ ...deps, role: 'reviewer', email: 'reviewer@example.test', password: 'Forest-walk-42' });
  const c = t.client();
  await c.signInAgreed('reviewer@example.test', 'Forest-walk-42');
  const data = exportAccount({ ...deps, email: 'reviewer@example.test' });
  const json = JSON.parse(JSON.stringify(data));
  assert.equal(json.account.email, 'reviewer@example.test');
  assert.ok(Array.isArray(json.tables.sessions) && json.tables.sessions.length === 1);
  assert.ok(json.tables.sessions[0].terms_agreed_at > 0);
  assert.equal(json.tables.sessions[0].id_hash, undefined, 'session secrets are not exported');
  assert.equal(json.tables.sessions[0].csrf_token, undefined);
  assert.ok(t.grove.seclog.list({ event: 'export' }).length === 1);
});

test('FR-017 RQ-229: learner:delete removes the account, its sessions and its rows in grove, and the Firebase user; its session is then signed out', async () => {
  const c = t.client();
  await c.signInAgreed('reviewer@example.test', 'Forest-walk-42');
  const { id } = t.grove.db.prepare('SELECT id FROM accounts WHERE email = ?').get('reviewer@example.test');
  await deleteAccount({ ...deps, email: 'reviewer@example.test' });
  assert.equal(t.grove.db.prepare('SELECT COUNT(*) AS n FROM accounts WHERE id = ?').get(id).n, 0);
  for (const { name } of t.grove.db.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all()) {
    if (name === 'security_log') continue; // kept 30 days with no foreign key (data-model.md)
    const cols = t.grove.db.prepare(`PRAGMA table_info("${name}")`).all().map((col) => col.name);
    if (cols.includes('account_id')) assert.equal(t.grove.db.prepare(`SELECT COUNT(*) AS n FROM "${name}" WHERE account_id = ?`).get(id).n, 0, name);
  }
  assert.ok(!t.fb.users.has('reviewer@example.test'), 'gone from Firebase');
  assert.equal((await c.get('/api/me')).status, 401);
  assert.ok(t.grove.seclog.list({ event: 'delete' }).some((r) => r.account_id === id));
});

test('FR-017 RQ-229: export and delete of an unknown address fail plainly', async () => {
  assert.throws(() => exportAccount({ ...deps, email: 'nobody@example.test' }), /no account/);
  await assert.rejects(deleteAccount({ ...deps, email: 'nobody@example.test' }), /no account/);
});

test('FR-023 RQ-371: log:show prints entries filtered by event and hours', () => {
  const all = formatLog(t.grove.seclog.list({ sinceMs: 0 }));
  assert.match(all, /delete/);
  const only = formatLog(t.grove.seclog.list({ sinceMs: Date.now() - 3600000, event: 'export' }));
  assert.match(only, /export/);
  assert.doesNotMatch(only, /delete/);
});
