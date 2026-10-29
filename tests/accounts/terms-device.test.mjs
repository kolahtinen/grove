import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { startTestGrove } from '../fakes/harness.mjs';
import { TERMS_VERSION, DEVICE_COOKIE } from '../../server/accounts/terms.mjs';

let t;
let one;
before(async () => {
  t = await startTestGrove();
  one = t.seedAccount({ email: 'one@example.test' });
  t.seedAccount({ email: 'two@example.test' });
});
after(() => t.close());

test('FR-011 RQ-437 RQ-228: agreeing sets an HttpOnly device cookie and records the agreement with the terms version and the device\'s hash only', async () => {
  const c = t.client();
  assert.equal((await c.signIn('one@example.test')).body.termsNeeded, true);
  const res = await c.post('/api/agree', { agreeTerms: true, confirmAge13: true });
  const cookie = res.cookies.find((x) => x.startsWith(`${DEVICE_COOKIE}=`));
  assert.ok(cookie, 'device cookie set');
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /SameSite=Lax/);
  assert.match(cookie, /Max-Age=34560000/);
  const value = c.jar.get(DEVICE_COOKIE);
  const row = t.grove.db.prepare('SELECT * FROM terms_agreements WHERE account_id = ? ORDER BY id DESC').get(one.id);
  assert.equal(row.terms_version, TERMS_VERSION);
  assert.notEqual(row.device_hash, value);
  assert.ok(row.agreed_at > 0 && row.age_confirmed_at > 0);
  const session = t.grove.db.prepare('SELECT terms_agreement_id FROM sessions WHERE account_id = ? AND terms_agreed_at IS NOT NULL ORDER BY created_at DESC').get(one.id);
  assert.equal(session.terms_agreement_id, row.id);
});

test('FR-011 RQ-437 R-27: a later sign-in on the same device goes straight in, recording the agreement it relied on; a new device, another account, a forged cookie or a new terms version asks again', async () => {
  const c = t.client();
  await c.signInAgreed('one@example.test');
  const device = c.jar.get(DEVICE_COOKIE);
  await c.post('/api/signout', {});
  const again = await c.signIn('one@example.test');
  assert.equal(again.body.termsNeeded, false);
  assert.equal((await c.get('/api/me')).body.termsAgreed, true);
  assert.equal((await c.get('/')).status, 200);
  const relied = t.grove.db.prepare('SELECT terms_agreement_id FROM sessions WHERE account_id = ? ORDER BY created_at DESC, rowid DESC').get(one.id);
  assert.ok(relied.terms_agreement_id > 0);

  // A new device (no cookie).
  assert.equal((await t.client().signIn('one@example.test')).body.termsNeeded, true);
  // Another account on this device.
  const other = t.client();
  other.jar.set(DEVICE_COOKIE, device);
  assert.equal((await other.signIn('two@example.test')).body.termsNeeded, true);
  // A forged or malformed cookie.
  for (const forged of ['x'.repeat(43), 'not a value', '']) {
    const f = t.client();
    f.jar.set(DEVICE_COOKIE, forged);
    assert.equal((await f.signIn('one@example.test')).body.termsNeeded, true, forged);
  }
  // A new terms version: the stored agreements are to an older one.
  t.grove.db.prepare("UPDATE terms_agreements SET terms_version = '2000-01-01' WHERE account_id = ?").run(one.id);
  const later = t.client();
  later.jar.set(DEVICE_COOKIE, device);
  assert.equal((await later.signIn('one@example.test')).body.termsNeeded, true);
});

test('FR-011 FR-025 RQ-437: the terms version is the date the terms page says they last changed', () => {
  const html = readFileSync(new URL('../../public/terms.html', import.meta.url), 'utf8');
  const m = html.match(/Last changed (\d{1,2}) (\w+) (\d{4})/);
  assert.ok(m);
  const month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].indexOf(m[2]) + 1;
  assert.equal(TERMS_VERSION, `${m[3]}-${String(month).padStart(2, '0')}-${m[1].padStart(2, '0')}`);
});
