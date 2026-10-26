import { test, before, after } from 'node:test';
import { connect } from 'node:net';
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

// Sends the headers and only the first bytes of a body that claims to be 50 KB, then waits for an answer.
function partialPost(base, path, headers) {
  const { hostname, port } = new URL(base);
  return new Promise((resolve, reject) => {
    const socket = connect(Number(port), hostname);
    let data = '';
    const timer = setTimeout(() => { socket.destroy(); reject(new Error('no answer: the server waited for the body')); }, 3000);
    socket.on('connect', () => {
      const lines = [`POST ${path} HTTP/1.1`, `host: ${new URL(base).host}`, 'content-type: application/json', 'content-length: 50000',
        ...Object.entries(headers).map(([k, v]) => `${k}: ${v}`)];
      socket.write(lines.join('\r\n') + '\r\n\r\n' + '{"lines":"');
    });
    socket.on('data', (chunk) => { data += chunk; });
    socket.on('error', () => {});
    socket.on('close', () => { clearTimeout(timer); resolve(data); });
  });
}

test('FR-022 FR-018 RQ-231 RQ-155: a refused request is answered before its body is read, and the connection is closed', async () => {
  const visitor = t.client();
  await visitor.prepare();
  const pre = visitor.jar.get('__Host-grove_csrf');
  const preToken = (await visitor.get('/api/csrf')).body.csrf;
  const cookie = [...visitor.jar].map(([k, v]) => `${k}=${v}`).join('; ');
  assert.ok(pre && preToken);

  const signedOut = await partialPost(t.base, '/api/answer', { origin: t.base, cookie, 'x-csrf-token': preToken });
  assert.match(signedOut, /^HTTP\/1\.1 401/);
  assert.match(signedOut, /signed_out/);
  assert.match(signedOut, /connection: close/i);

  const noCsrf = await partialPost(t.base, '/api/answer', { origin: t.base, cookie });
  assert.match(noCsrf, /^HTTP\/1\.1 403/);
  assert.match(noCsrf, /"csrf"/);

  t.seedAccount({ email: 'early@example.test' });
  const learner = t.client();
  assert.equal((await learner.signIn('early@example.test')).status, 200);
  const me = await learner.get('/api/me');
  const learnerCookie = [...learner.jar].map(([k, v]) => `${k}=${v}`).join('; ');
  const notAgreed = await partialPost(t.base, '/api/answer', { origin: t.base, cookie: learnerCookie, 'x-csrf-token': me.body.csrf });
  assert.match(notAgreed, /^HTTP\/1\.1 403/);
  assert.match(notAgreed, /terms_needed/);

  assert.equal((await t.client().get('/health')).status, 200);
});

test('FR-022 FR-019 FR-018 RQ-231 RQ-155: a signed-in learner whose request has a bad CSRF token is refused by the CSRF check before the body is read, and the connection is closed', async () => {
  t.seedAccount({ email: 'csrf-first@example.test' });
  const learner = t.client();
  await learner.signInAgreed('csrf-first@example.test');
  const cookie = [...learner.jar].map(([k, v]) => `${k}=${v}`).join('; ');
  const missing = await partialPost(t.base, '/api/answer', { origin: t.base, cookie });
  assert.match(missing, /^HTTP\/1\.1 403/);
  assert.match(missing, /"csrf"/);
  assert.match(missing, /connection: close/i);
  const wrong = await partialPost(t.base, '/api/answer', { origin: t.base, cookie, 'x-csrf-token': 'not-the-token' });
  assert.match(wrong, /^HTTP\/1\.1 403/);
  assert.match(wrong, /"csrf"/);
  assert.equal((await learner.get('/api/me')).status, 200, 'the session still works');
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
