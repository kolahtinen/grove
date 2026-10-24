import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { startTestGrove } from '../fakes/harness.mjs';

let t;
before(async () => {
  t = await startTestGrove();
  t.seedAccount({ email: 'reviewer@example.test', role: 'reviewer' });
});
after(() => t.close());

test('FR-009 RQ-366: with Firebase unreachable, sign-in and reset say so plainly and a signed-in session keeps working', async () => {
  const signedIn = t.client();
  await signedIn.signInAgreed('reviewer@example.test');
  t.fb.state.unreachable = true;
  try {
    const c = t.client();
    await c.prepare();
    for (const [path, body] of [['/api/signin', { email: 'reviewer@example.test', password: 'x' }], ['/api/reset', { email: 'reviewer@example.test' }]]) {
      const res = await c.post(path, body);
      assert.equal(res.status, 503, path);
      assert.equal(res.body.error, 'signin_unavailable');
      assert.match(res.body.message, /isn’t possible right now/);
      assert.doesNotMatch(res.text, /ECONNREFUSED|fetch failed|127\.0\.0\.1|stack/i);
    }
    assert.equal((await signedIn.get('/api/me')).status, 200);
  } finally {
    t.fb.state.unreachable = false;
  }
});

test('FR-009 RQ-366: error answers and the app log contain no secret from the config (constitution 2.1)', async () => {
  const c = t.client();
  await c.prepare();
  const answers = [
    await c.post('/api/signin', undefined, { raw: '{bad', headers: { 'content-type': 'application/json' } }),
    await c.post('/api/signin', { email: 'a@b.c', password: 'x', extra: 1 }),
    await c.get('/api/me'),
    await c.get('/nothing'),
  ].map((r) => r.text);
  const logDir = join(t.config.dataDir, 'logs');
  const logs = readdirSync(logDir).map((name) => readFileSync(join(logDir, name), 'utf8')).join('\n');
  const secrets = [t.config.firebase.apiKey, t.config.github.token, t.fb.serviceAccount.private_key.split('\n')[1]];
  for (const secret of secrets) {
    for (const text of [...answers, logs]) assert.ok(!text.includes(secret), 'a secret leaked');
  }
  assert.ok(!JSON.stringify(t.config).includes(t.config.firebase.apiKey), 'the config hides secrets from JSON');
});
