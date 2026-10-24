import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startTestGrove } from '../fakes/harness.mjs';

let t;
before(async () => {
  t = await startTestGrove();
  t.seedAccount({ email: 'owner@example.test', role: 'owner' });
  t.seedAccount({ email: 'reviewer@example.test', role: 'reviewer' });
});
after(() => t.close());

// Plausible bodies for each POST route, so the guard (not the schema) decides.
const BODIES = {
  '/api/signin': { email: 'nobody@example.test', password: 'Not-it-1' },
  '/api/signout': {},
  '/api/agree': { agreeTerms: true, confirmAge13: true },
  '/api/reset': { email: 'nobody@example.test' },
  '/api/topic': { topic: 'a small café' },
  '/api/prompt': { action: 'next' },
  '/api/answer': { exchangeId: 999999, answer: 'x' },
  '/api/question': { textId: 999999, position: 0, option: 0 },
  '/api/rating': { textId: 999999, value: 'most' },
  '/api/settings': { showTranslations: true },
  '/api/explain': { sentenceId: 999999, form: 'x', reason: 'other' },
  '/api/report': { textId: 999999, questionPosition: 0, reason: 'other' },
  '/api/own-text': { title: 'T', text: 'Hej.' },
  '/api/leaf': { textId: 999999, form: 'x' },
  '/api/meanings-prompt': {},
  '/api/welcome': {},
  '/api/marking': { textId: 999999, marks: [] },
  '/api/marks': { lemma: 'zzz', read: false, remember: false },
  '/api/let-it-fall': { lemma: 'zzz', right: false },
  '/api/pick-up': { lemma: 'zzz' },
  '/api/review': { lemma: 'zzz', mode: 'read', right: true },
  '/api/leaves': { text: 'zzz' },
  '/api/leaf-delete': { lemma: 'zzz' },
  '/api/input': { seconds: 1, day: '2026-10-24' },
};
const BLOCKING = new Set(['signed_out', 'terms_needed', 'forbidden']);

async function clientFor(role) {
  const c = t.client();
  if (role === 'visitor') { await c.prepare(); return c; }
  if (role === 'unagreed') { await c.signIn('reviewer@example.test'); return c; }
  await c.signInAgreed(role === 'owner' ? 'owner@example.test' : 'reviewer@example.test');
  return c;
}

function expectedBlock(access, role) {
  if (access === 'public') return null;
  if (role === 'visitor') return 'signed_out';
  if (access === 'signed_in') return null;
  if (role === 'unagreed') return 'terms_needed';
  if (access === 'agreed') return null;
  return role === 'owner' ? null : 'forbidden';
}

test('FR-018 RQ-155: every route × every role gets exactly the access its rule allows', async () => {
  const routes = t.grove.app.router.table();
  for (const route of routes) {
    if (route.method === 'POST') assert.ok(Object.hasOwn(BODIES, route.path), `the authz table has an entry for ${route.path}`);
  }
  for (const role of ['visitor', 'unagreed', 'reviewer', 'owner']) {
    for (const route of routes) {
      const path = route.path.endsWith('*') ? `${route.path.slice(0, -1)}grove.css` : route.path;
      const c = await clientFor(role);
      const res = route.method === 'GET' ? await c.get(path) : await c.post(path, BODIES[route.path]);
      const want = expectedBlock(route.access, role);
      const isPage = !path.startsWith('/api/');
      let got = null;
      if (isPage && res.status === 303) got = res.headers.get('location') === '/signin' ? 'signed_out' : 'terms_needed';
      else if (res.body && BLOCKING.has(res.body.error)) got = res.body.error;
      assert.equal(got, want, `${role} ${route.method} ${path} → ${res.status}`);
    }
  }
});

test('FR-018 RQ-155: an account ID, id or email added to a signed-in request is refused and never changes whose data is used', async () => {
  const c = await clientFor('reviewer');
  for (const extra of [{ accountId: 1 }, { id: 1 }, { email: 'owner@example.test' }]) {
    const res = await c.post('/api/signout', extra);
    assert.equal(res.status, 400, JSON.stringify(extra));
    assert.equal(res.body.error, 'bad_request');
  }
  const res = await c.post('/api/agree', { agreeTerms: true, confirmAge13: true, accountId: 1 });
  assert.equal(res.status, 400);
  const me = await c.get('/api/me?accountId=1&email=owner@example.test');
  assert.equal(me.body.email, 'reviewer@example.test');
});

test('FR-008 RQ-90 RQ-147: the owner and the reviewer signed in at once each get their own account, both learners', async () => {
  const owner = await clientFor('owner');
  const reviewer = await clientFor('reviewer');
  const a = await owner.get('/api/me');
  const b = await reviewer.get('/api/me');
  assert.equal(a.body.email, 'owner@example.test');
  assert.equal(b.body.email, 'reviewer@example.test');
  assert.deepEqual(a.body.roles, ['learner', 'owner']);
  assert.deepEqual(b.body.roles, ['learner', 'reviewer']);
});

test('FR-019 RQ-162: signed out, / redirects to sign-in and signed-in API routes answer 401; the public pages and their files answer 200', async () => {
  const c = t.client();
  const home = await c.get('/');
  assert.equal(home.status, 303);
  assert.equal(home.headers.get('location'), '/signin');
  assert.equal((await c.get('/api/me')).status, 401);
  assert.equal((await c.get('/assets/home.mjs')).status, 401);
  for (const path of ['/signin', '/reset', '/terms', '/health', '/assets/grove.css', '/assets/api.mjs', '/assets/page.mjs',
    '/assets/signin.mjs', '/assets/reset.mjs', '/assets/terms.mjs', '/assets/logo.svg', '/fonts/fonts.css']) {
    assert.equal((await c.get(path)).status, 200, path);
  }
  assert.equal((await c.get('/assets/../server/config.mjs')).status, 404);
  assert.equal((await c.get('/assets/%2e%2e/%2e%2e/package.json')).status, 404);
});
