import { test } from 'node:test';
import assert from 'node:assert/strict';
import { startTestGrove } from '../fakes/harness.mjs';
import { meaning } from '../../server/lexicon/lexicon.mjs';

// A start-up load that finishes `first` of its `size` lines, then waits until `open()` is called.
function heldLoad(size, first) {
  let open;
  const gate = new Promise((resolve) => { open = resolve; });
  const load = {
    name: 'held',
    size,
    async *steps() { yield first; await gate; yield size - first; },
  };
  return { load, open };
}

async function until(check) {
  for (let i = 0; i < 100; i += 1) {
    if (await check()) return;
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
  assert.fail('condition never met');
}

test('FR-032 RQ-408: while grove is starting, pages get the loading page, assets are served, and the API and /health answer 503 starting before the CSRF check', async () => {
  const held = heldLoad(100, 40);
  const t = await startTestGrove({ loads: [held.load], waitReady: false });
  try {
    const c = t.client();
    const page = await c.get('/');
    assert.equal(page.status, 503);
    assert.match(page.headers.get('content-type'), /text\/html/);
    assert.equal(page.headers.get('retry-after'), '1');
    assert.match(page.text, /grove is starting/);
    assert.match(page.text, /<progress/);
    assert.match(page.text, /\/assets\/starting\.mjs/);
    assert.equal((await c.get('/assets/grove.css')).status, 200);
    assert.equal((await c.get('/assets/starting.mjs')).status, 200);
    for (const path of ['/health', '/api/me', '/api/csrf']) {
      const res = await c.get(path);
      assert.equal(res.status, 503, path);
      assert.equal(res.body.error, 'starting', path);
      assert.equal(res.body.message, 'grove is starting. Try again in a moment.', path);
      assert.equal(res.headers.get('retry-after'), '1', path);
    }
    // No CSRF token: the start-up gate answers before the CSRF check, and the body is never read.
    const post = await c.post('/api/signin', { email: 'nobody@example.test', password: 'Not-it-1' });
    assert.equal(post.status, 503);
    assert.equal(post.body.error, 'starting');
    assert.equal(post.headers.get('connection'), 'close');
  } finally {
    held.open();
    await t.grove.ready;
    await t.close();
  }
});

test('FR-032 RQ-408: /api/starting reports the share of lines loaded, then ready, after which grove answers as usual', async () => {
  const held = heldLoad(100, 40);
  const t = await startTestGrove({ loads: [held.load], waitReady: false });
  try {
    const c = t.client();
    await until(async () => (await c.get('/api/starting')).body.progress > 0);
    assert.deepEqual((await c.get('/api/starting')).body, { ready: false, progress: 0.4 });
    held.open();
    await t.grove.ready;
    assert.deepEqual((await c.get('/api/starting')).body, { ready: true, progress: 1 });
    const health = await c.get('/health');
    assert.equal(health.status, 200);
    assert.equal(health.text, 'ok');
    assert.equal((await c.get('/')).status, 303, 'a signed-out page request goes to sign-in again');
  } finally {
    await t.close();
  }
});

test('FR-032 RQ-408: loads run one after another in steps, and a load with nothing to do counts as done', async () => {
  const order = [];
  const a = { name: 'a', size: 3, *steps() { order.push('a1'); yield 2; order.push('a2'); yield 1; } };
  const none = { name: 'none', size: 0, *steps() {} };
  const b = { name: 'b', size: 1, *steps() { order.push('b1'); yield 1; } };
  const t = await startTestGrove({ loads: [a, none, b] });
  try {
    assert.deepEqual(order, ['a1', 'a2', 'b1']);
    assert.deepEqual((await t.client().get('/api/starting')).body, { ready: true, progress: 1 });
  } finally {
    await t.close();
  }
  const empty = await startTestGrove({ loads: [] });
  try {
    assert.deepEqual((await empty.client().get('/api/starting')).body, { ready: true, progress: 1 });
  } finally {
    await empty.close();
  }
});

test('FR-032 FR-222 RQ-407 SC-008: a started grove has its word list loaded, so the first meaning lookup is as quick as any other', async () => {
  const t = await startTestGrove();
  try {
    const started = performance.now();
    assert.equal(meaning('läsa').en, 'to read');
    assert.ok(performance.now() - started < 50, 'the first lookup did not load the list');
  } finally {
    await t.close();
  }
});
