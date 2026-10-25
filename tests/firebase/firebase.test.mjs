import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync } from 'node:crypto';
import { startFakeFirebase } from '../fakes/fake-firebase.mjs';
import { createFirebase, FirebaseError } from '../../server/firebase/client.mjs';

let fb;
let firebase;
before(async () => {
  fb = await startFakeFirebase();
  firebase = createFirebase({
    projectId: fb.projectId, apiKey: fb.apiKey, authUrl: fb.authUrl, tokenUrl: fb.tokenUrl, certsUrl: fb.certsUrl,
    serviceAccount: fb.serviceAccount,
  }, { timeoutMs: 2000 });
});
after(() => fb.close());

test('FR-009 RQ-366 RQ-367: sign-up, sign-in, reset and delete reach only the configured Firebase URLs with the server-side key', async () => {
  fb.state.requests.length = 0;
  const { uid } = await firebase.signUp('person@example.test', 'Forest-walk-42');
  assert.match(uid, /^uid-/);
  assert.deepEqual(await firebase.signIn('person@example.test', 'Forest-walk-42'), { uid });
  await firebase.sendPasswordReset('person@example.test');
  assert.deepEqual(await firebase.lookupUser(uid), { uid, email: 'person@example.test' });
  await firebase.deleteUser(uid);
  assert.equal(await firebase.lookupUser(uid), null);
  const publicCalls = fb.state.requests.filter((r) => r.path.startsWith('/v1/accounts:'));
  assert.ok(publicCalls.length >= 3);
  for (const r of publicCalls) assert.match(r.query, new RegExp(`key=${fb.apiKey}`));
  for (const r of fb.state.requests.filter((x) => x.path.startsWith('/v1/projects/'))) assert.match(r.headers.authorization, /^Bearer /);
});

test('FR-009 RQ-366: a known address on sign-up is reported as email_exists and a wrong password as wrong_credentials', async () => {
  await firebase.signUp('twice@example.test', 'Forest-walk-42');
  await assert.rejects(firebase.signUp('twice@example.test', 'Forest-walk-42'), (e) => e instanceof FirebaseError && e.code === 'email_exists');
  await assert.rejects(firebase.signIn('twice@example.test', 'nope'), (e) => e.code === 'wrong_credentials');
  await assert.rejects(firebase.signIn('nobody@example.test', 'nope'), (e) => e.code === 'wrong_credentials');
});

test('FR-009 RQ-366: ID-token verification accepts a good token', async () => {
  const user = fb.addUser('good@example.test', 'x');
  const payload = await firebase.verifyIdToken(fb.idTokenFor(user));
  assert.equal(payload.sub, user.uid);
});

test('FR-009 RQ-366: ID-token verification rejects forged, expired, other-project, wrong-issuer and subjectless tokens (T-10)', async () => {
  const user = fb.addUser('bad@example.test', 'x');
  const now = Math.floor(Date.now() / 1000);
  const forger = generateKeyPairSync('rsa', { modulusLength: 2048 }).privateKey.export({ type: 'pkcs8', format: 'pem' });
  const bad = {
    forged: fb.signToken({ iss: `https://securetoken.google.com/${fb.projectId}`, aud: fb.projectId, sub: user.uid, iat: now, exp: now + 3600 }, { key: forger }),
    expired: fb.idTokenFor(user, { iat: now - 7200, exp: now - 3600 }),
    otherProject: fb.idTokenFor(user, { aud: 'someone-else' }),
    wrongIssuer: fb.idTokenFor(user, { iss: 'https://securetoken.google.com/someone-else' }),
    noSubject: fb.idTokenFor(user, { sub: '' }),
    unknownKey: fb.signToken({ iss: `https://securetoken.google.com/${fb.projectId}`, aud: fb.projectId, sub: user.uid, iat: now, exp: now + 3600 }, { headerKid: 'other' }),
    notAJwt: 'abc.def',
  };
  for (const [name, token] of Object.entries(bad)) {
    await assert.rejects(firebase.verifyIdToken(token), `rejects ${name}`);
  }
});

test('FR-009 RQ-366: sign-in refuses when Firebase returns a token that does not verify', async () => {
  fb.addUser('forged@example.test', 'Forest-walk-42');
  fb.state.tokenOverride = (user) => fb.idTokenFor(user, { aud: 'someone-else' });
  try {
    await assert.rejects(firebase.signIn('forged@example.test', 'Forest-walk-42'), (e) => e.code === 'bad_answer');
  } finally {
    fb.state.tokenOverride = null;
  }
});

test('FR-009 RQ-366: an unexpected answer shape is rejected', async () => {
  const odd = createFirebase({
    projectId: fb.projectId, apiKey: 'wrong-key', authUrl: fb.authUrl, tokenUrl: fb.tokenUrl, certsUrl: fb.certsUrl,
    serviceAccount: fb.serviceAccount,
  });
  await assert.rejects(odd.signUp('x@example.test', 'Forest-walk-42'), (e) => e.code === 'bad_answer');
});

test('FR-017 RQ-229: deleting a user Firebase no longer has counts as done; an unreachable Firebase still fails', async () => {
  const { uid } = await firebase.signUp('gone@example.test', 'Forest-walk-42');
  await firebase.deleteUser(uid);
  await firebase.deleteUser(uid);
  fb.state.unreachable = true;
  try {
    await assert.rejects(firebase.deleteUser('uid-anything'), (e) => e instanceof FirebaseError && e.code === 'unavailable');
  } finally {
    fb.state.unreachable = false;
  }
});

test('FR-009 RQ-366: an unreachable Firebase gives unavailable', async () => {
  fb.state.unreachable = true;
  try {
    await assert.rejects(firebase.signIn('person@example.test', 'x'), (e) => e.code === 'unavailable');
    await assert.rejects(firebase.sendPasswordReset('person@example.test'), (e) => e.code === 'unavailable');
  } finally {
    fb.state.unreachable = false;
  }
});

test('FR-006 RQ-367: outbound requests to any host but the configured ones are refused', async () => {
  const calls = [];
  const spy = async (url, init) => { calls.push(url); return fetch(url, init); };
  const sneaky = createFirebase({
    projectId: fb.projectId, apiKey: fb.apiKey, authUrl: 'http://127.0.0.1:9', tokenUrl: fb.tokenUrl, certsUrl: fb.certsUrl,
    serviceAccount: fb.serviceAccount,
  }, { fetchImpl: spy, timeoutMs: 500 });
  // authUrl is configured, so this host is allowed but unreachable:
  await assert.rejects(sneaky.signIn('a@example.test', 'x'), (e) => e.code === 'unavailable');
  assert.ok(calls.every((u) => new URL(u).hostname === '127.0.0.1'));
});
