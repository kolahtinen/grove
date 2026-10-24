import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startTestGrove } from '../fakes/harness.mjs';

let t;
let reviewer;
before(async () => {
  t = await startTestGrove();
  reviewer = t.seedAccount({ email: 'reviewer@example.test', role: 'reviewer' });
});
after(() => t.close());

test('FR-011 RQ-141 RQ-228: a new sign-in reaches nothing but the terms until it agrees', async () => {
  const c = t.client();
  await c.signIn('reviewer@example.test');
  const home = await c.get('/');
  assert.equal(home.status, 303);
  assert.equal(home.headers.get('location'), '/terms');
  for (const route of t.grove.app.router.table().filter((r) => r.access === 'agreed' && r.path.startsWith('/api/'))) {
    const res = await c.request(route.method, route.path, route.method === 'GET' ? {} : { body: {} });
    assert.equal(res.status, 403, route.path);
    assert.equal(res.body.error, 'terms_needed', route.path);
  }
  assert.equal((await c.get('/terms')).status, 200);
  assert.equal((await c.get('/api/me')).status, 200);
});

test('FR-011 RQ-141 RQ-228: agreeing with both boxes records both times on that session and opens grove', async () => {
  const c = t.client();
  await c.signIn('reviewer@example.test');
  const res = await c.post('/api/agree', { agreeTerms: true, confirmAge13: true });
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { result: 'agreed' });
  const rows = t.grove.db.prepare('SELECT terms_agreed_at, age_confirmed_at FROM sessions WHERE account_id = ? AND terms_agreed_at IS NOT NULL').all(reviewer.id);
  assert.ok(rows.length >= 1);
  assert.ok(rows.every((r) => r.terms_agreed_at > 0 && r.age_confirmed_at > 0));
  assert.equal((await c.get('/')).status, 200);
  assert.equal((await c.get('/api/me')).body.termsAgreed, true);
});

test('FR-011 RQ-141 RQ-228: a missing or false box gives agreement_needed and records nothing', async () => {
  const c = t.client();
  await c.signIn('reviewer@example.test');
  for (const body of [{ agreeTerms: true, confirmAge13: false }, { agreeTerms: false, confirmAge13: true }, { agreeTerms: true }, { confirmAge13: true }, {}]) {
    const res = await c.post('/api/agree', body);
    assert.equal(res.status, 400, JSON.stringify(body));
    assert.equal(res.body.error, 'agreement_needed', JSON.stringify(body));
  }
  assert.equal((await c.get('/api/me')).body.termsAgreed, false);
});

test('FR-011 RQ-228: a second sign-in of the same account starts unagreed', async () => {
  const first = t.client();
  await first.signInAgreed('reviewer@example.test');
  const second = t.client();
  await second.signIn('reviewer@example.test');
  assert.equal((await second.get('/api/me')).body.termsAgreed, false);
  assert.equal((await first.get('/api/me')).body.termsAgreed, true);
});

test('FR-023 RQ-371: the agreement is logged as terms_agreed', async () => {
  const c = t.client();
  await c.signInAgreed('reviewer@example.test');
  assert.ok(t.grove.seclog.list({ event: 'terms_agreed' }).some((r) => r.account_id === reviewer.id));
});
