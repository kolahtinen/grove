import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { startTestGrove } from '../fakes/harness.mjs';

const realFetch = globalThis.fetch;
const outbound = [];
let t;
before(async () => {
  // Record every fetch grove makes; the test client's own requests to grove are filtered out below.
  globalThis.fetch = (url, init) => { outbound.push(String(url)); return realFetch(url, init); };
  t = await startTestGrove();
  t.seedAccount({ email: 'reviewer@example.test', role: 'reviewer' });
});
after(async () => { await t.close(); globalThis.fetch = realFetch; });

test('FR-006 RQ-181 RQ-367: during sign-in, agreement, reset and sign-out grove reaches only the configured Firebase, OAuth and certificate URLs', async () => {
  const c = t.client();
  await c.signInAgreed('reviewer@example.test');
  await c.post('/api/reset', { email: 'reviewer@example.test' });
  await c.post('/api/signout', {});
  const allowed = new Set([t.config.firebase.authUrl, t.config.firebase.tokenUrl, t.config.firebase.certsUrl].map((u) => new URL(u).origin));
  const fromGrove = outbound.filter((u) => !u.startsWith(t.base));
  assert.ok(fromGrove.length > 0, 'grove did talk to Firebase');
  for (const url of fromGrove) assert.ok(allowed.has(new URL(url).origin), `unexpected outbound request to ${url}`);
});

test('FR-007 RQ-178: no route or page offers a conversation partner', () => {
  const paths = t.grove.app.router.table().map((r) => r.path);
  assert.ok(!paths.some((p) => /chat|conversation|partner/i.test(p)));
  for (const name of readdirSync(new URL('../../public/', import.meta.url)).filter((n) => n.endsWith('.html'))) {
    const html = readFileSync(new URL(`../../public/${name}`, import.meta.url), 'utf8');
    assert.doesNotMatch(html, /conversation partner|id="chat|class="[^"]*\bchat\b|\/api\/chat/i, name);
  }
});
