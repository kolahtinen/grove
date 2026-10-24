import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startTestGrove } from '../fakes/harness.mjs';
import { CSP } from '../../server/web/headers.mjs';
import { createRouter } from '../../server/web/http.mjs';

let t;
before(async () => { t = await startTestGrove(); });
after(() => t.close());

test('FR-001 RQ-125: the server listens on 127.0.0.1 only (constitution 2.2)', async () => {
  const port = new URL(t.base).port;
  const res = await fetch(`http://127.0.0.1:${port}/health`);
  assert.equal(res.status, 200);
  assert.equal(await res.text(), 'ok');
  const { networkInterfaces } = await import('node:os');
  const external = Object.values(networkInterfaces()).flat().find((i) => i && i.family === 'IPv4' && !i.internal);
  if (external) {
    await assert.rejects(fetch(`http://${external.address}:${port}/health`, { signal: AbortSignal.timeout(2000) }));
  }
});

test('FR-024 RQ-331 RQ-367: every response has the CSP and the other security headers', async () => {
  const c = t.client();
  for (const path of ['/health', '/signin', '/api/csrf', '/nope', '/api/me']) {
    const res = await c.get(path);
    assert.equal(res.headers.get('content-security-policy'), CSP, path);
    assert.equal(res.headers.get('x-content-type-options'), 'nosniff', path);
    assert.equal(res.headers.get('referrer-policy'), 'no-referrer', path);
    assert.match(res.headers.get('strict-transport-security'), /max-age=31536000/, path);
  }
  assert.equal((await c.get('/api/csrf')).headers.get('cache-control'), 'no-store');
  assert.match(CSP, /script-src 'self'/);
  assert.doesNotMatch(CSP, /unsafe-inline|https?:/);
});

test('FR-022 RQ-161 RQ-231: a body over 100 KB gets 413 too_large and the server answers the next request', async () => {
  const c = t.client();
  await c.prepare();
  const big = JSON.stringify({ email: 'a'.repeat(100 * 1024), password: 'x' });
  const res = await c.post('/api/signin', undefined, { raw: big, headers: { 'content-type': 'application/json' } });
  assert.equal(res.status, 413);
  assert.equal(res.body.error, 'too_large');
  assert.match(res.body.message, /100 KB/);
  assert.equal((await t.client().get('/health')).status, 200);
});

test('FR-022 RQ-231: malformed JSON and unknown fields get 400 bad_request with no internal detail (constitution 2.5)', async () => {
  const c = t.client();
  await c.prepare();
  const malformed = await c.post('/api/signin', undefined, { raw: '{"email":', headers: { 'content-type': 'application/json' } });
  assert.equal(malformed.status, 400);
  assert.equal(malformed.body.error, 'bad_request');
  assert.doesNotMatch(malformed.text, /SyntaxError|at .*\.mjs|stack/i);
  const unknown = await c.post('/api/signin', { email: 'a@example.test', password: 'x', isOwner: true });
  assert.equal(unknown.status, 400);
  assert.equal(unknown.body.error, 'bad_request');
});

test('FR-022 RQ-231: a thrown handler error gives a plain 500 with no stack trace (constitution 2.5)', async () => {
  const router = createRouter();
  const { createHandler } = await import('../../server/web/http.mjs');
  router.add({ method: 'GET', path: '/boom', access: 'public', handler: () => { throw new Error('secret internals at /home/x.mjs:1'); } });
  const handler = createHandler({ router, guard: { attach() {}, check: () => null }, csrf() {} });
  const { createServer } = await import('node:http');
  const server = createServer(handler);
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  try {
    const res = await fetch(`http://127.0.0.1:${server.address().port}/boom`);
    const text = await res.text();
    assert.equal(res.status, 500);
    assert.doesNotMatch(text, /secret internals|\.mjs/);
  } finally {
    server.close();
  }
});

test('FR-013 RQ-224: a state-changing request without a valid CSRF token or with a foreign Origin gets 403 csrf (constitution 4.7)', async () => {
  const c = t.client();
  await c.prepare();
  const noToken = await c.post('/api/signin', { email: 'a@example.test', password: 'x' }, { sendCsrf: false });
  assert.equal(noToken.status, 403);
  assert.equal(noToken.body.error, 'csrf');
  const foreign = await c.post('/api/signin', { email: 'a@example.test', password: 'x' }, { origin: 'https://evil.example' });
  assert.equal(foreign.status, 403);
  const noOrigin = await c.post('/api/signin', { email: 'a@example.test', password: 'x' }, { origin: null });
  assert.equal(noOrigin.status, 403);
  c.setCsrf('not-the-token');
  const wrong = await c.post('/api/signin', { email: 'a@example.test', password: 'x' });
  assert.equal(wrong.status, 403);
});

test('FR-001 RQ-125: GET /health answers 200 ok and an unknown path answers 404 with a plain message', async () => {
  const c = t.client();
  assert.equal((await c.get('/health')).text, 'ok');
  const missing = await c.get('/api/nothing-here');
  assert.equal(missing.status, 404);
  assert.equal(missing.body.error, 'not_found');
});
