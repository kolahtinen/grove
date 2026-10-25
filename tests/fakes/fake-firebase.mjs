// A local stand-in for Firebase Authentication's REST API, Google's OAuth token endpoint and the
// securetoken certificates, so tests never reach Google (research R13).
import { createServer } from 'node:http';
import { generateKeyPairSync, createSign, randomBytes } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

function base64url(data) {
  return Buffer.from(data).toString('base64url');
}

// A self-signed certificate for the token-signing key, made with openssl (Node can't make one).
function makeCertificate(privateKeyPem) {
  const dir = mkdtempSync(join(tmpdir(), 'grove-fake-cert-'));
  try {
    writeFileSync(join(dir, 'key.pem'), privateKeyPem);
    execFileSync('openssl', ['req', '-x509', '-new', '-key', join(dir, 'key.pem'), '-subj', '/CN=fake-securetoken',
      '-days', '2', '-out', join(dir, 'cert.pem')], { stdio: 'ignore' });
    return readFileSync(join(dir, 'cert.pem'), 'utf8');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

export async function startFakeFirebase({ projectId = 'grove-test', apiKey = 'test-api-key' } = {}) {
  const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
  const signingKeyPem = privateKey.export({ type: 'pkcs8', format: 'pem' });
  const kid = 'fake-kid-1';
  const certificate = makeCertificate(signingKeyPem);

  // Service-account key that grove signs its OAuth assertion with.
  const sa = generateKeyPairSync('rsa', { modulusLength: 2048 });
  const serviceAccount = {
    type: 'service_account',
    project_id: projectId,
    client_email: `grove@${projectId}.iam.gserviceaccount.com`,
    private_key: sa.privateKey.export({ type: 'pkcs8', format: 'pem' }),
  };

  const users = new Map(); // email -> { uid, email, password }
  const state = { unreachable: false, oddAnswer: false, delayMs: 0, requests: [], resetEmails: [] };

  function signToken(payload, { key = signingKeyPem, headerKid = kid } = {}) {
    const header = base64url(JSON.stringify({ alg: 'RS256', kid: headerKid, typ: 'JWT' }));
    const body = base64url(JSON.stringify(payload));
    const signer = createSign('RSA-SHA256');
    signer.update(`${header}.${body}`);
    return `${header}.${body}.${signer.sign(key).toString('base64url')}`;
  }

  function idTokenFor(user, overrides = {}) {
    const now = Math.floor(Date.now() / 1000);
    return signToken({
      iss: `https://securetoken.google.com/${projectId}`,
      aud: projectId,
      auth_time: now,
      user_id: user.uid,
      sub: user.uid,
      iat: now,
      exp: now + 3600,
      email: user.email,
      ...overrides,
    });
  }

  function send(res, status, body, headers = {}) {
    res.writeHead(status, { 'content-type': 'application/json', ...headers });
    res.end(JSON.stringify(body));
  }
  function fail(res, message, status = 400) {
    send(res, status, { error: { code: status, message } });
  }

  const server = createServer(async (req, res) => {
    let raw = '';
    for await (const chunk of req) raw += chunk;
    const url = new URL(req.url, 'http://fake');
    state.requests.push({ method: req.method, path: url.pathname, query: url.search, headers: req.headers, body: raw });
    if (state.unreachable) {
      req.socket.destroy();
      return;
    }
    if (state.delayMs) await new Promise((r) => setTimeout(r, state.delayMs));
    // An answer grove can't use, as from a misconfigured project.
    if (state.oddAnswer) return fail(res, 'SOMETHING_UNEXPECTED');

    if (url.pathname === '/certs') {
      return send(res, 200, { [kid]: certificate }, { 'cache-control': 'public, max-age=3600' });
    }
    if (url.pathname === '/token') {
      const params = new URLSearchParams(raw);
      if (params.get('grant_type') !== 'urn:ietf:params:oauth:grant-type:jwt-bearer' || !params.get('assertion')) {
        return fail(res, 'invalid_grant');
      }
      return send(res, 200, { access_token: `fake-access-${randomBytes(8).toString('hex')}`, expires_in: 3600, token_type: 'Bearer' });
    }

    let body = {};
    try { body = raw ? JSON.parse(raw) : {}; } catch { return fail(res, 'INVALID_JSON'); }
    const keyOk = url.searchParams.get('key') === apiKey;
    const bearerOk = /^Bearer fake-access-/.test(req.headers.authorization || '');

    switch (url.pathname) {
      case '/v1/accounts:signUp': {
        if (!keyOk) return fail(res, 'API_KEY_INVALID');
        const email = String(body.email || '').toLowerCase();
        if (users.has(email)) return fail(res, 'EMAIL_EXISTS');
        const user = { uid: `uid-${randomBytes(6).toString('hex')}`, email, password: body.password };
        users.set(email, user);
        return send(res, 200, { kind: 'identitytoolkit#SignupNewUserResponse', localId: user.uid, email, idToken: idTokenFor(user), refreshToken: 'r', expiresIn: '3600' });
      }
      case '/v1/accounts:signInWithPassword': {
        if (!keyOk) return fail(res, 'API_KEY_INVALID');
        const user = users.get(String(body.email || '').toLowerCase());
        if (!user || user.password !== body.password) return fail(res, 'INVALID_LOGIN_CREDENTIALS');
        const idToken = state.tokenOverride ? state.tokenOverride(user) : idTokenFor(user);
        return send(res, 200, { kind: 'identitytoolkit#VerifyPasswordResponse', localId: user.uid, email: user.email, idToken, registered: true, refreshToken: 'r', expiresIn: '3600' });
      }
      case '/v1/accounts:sendOobCode': {
        if (!keyOk) return fail(res, 'API_KEY_INVALID');
        if (body.requestType !== 'PASSWORD_RESET') return fail(res, 'INVALID_REQ_TYPE');
        const email = String(body.email || '').toLowerCase();
        // Email enumeration protection is on: the answer is the same either way.
        if (users.has(email)) state.resetEmails.push(email);
        return send(res, 200, { kind: 'identitytoolkit#GetOobConfirmationCodeResponse', email });
      }
      case `/v1/projects/${projectId}/accounts:delete`: {
        if (!bearerOk) return fail(res, 'UNAUTHENTICATED', 401);
        // Like the real API, an unknown user is an error, not a quiet success.
        const found = [...users].find(([, user]) => user.uid === body.localId);
        if (!found) return fail(res, 'USER_NOT_FOUND');
        users.delete(found[0]);
        return send(res, 200, { kind: 'identitytoolkit#DeleteAccountResponse' });
      }
      case `/v1/projects/${projectId}/accounts:lookup`: {
        if (!bearerOk) return fail(res, 'UNAUTHENTICATED', 401);
        const ids = body.localId || [];
        const found = [...users.values()].filter((u) => ids.includes(u.uid)).map((u) => ({ localId: u.uid, email: u.email }));
        return send(res, 200, found.length ? { users: found } : {});
      }
      default:
        return fail(res, 'NOT_FOUND', 404);
    }
  });

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;

  return {
    projectId,
    apiKey,
    serviceAccount,
    authUrl: base,
    tokenUrl: `${base}/token`,
    certsUrl: `${base}/certs`,
    state,
    users,
    publicKey,
    signToken,
    idTokenFor,
    addUser(email, password) {
      const user = { uid: `uid-${randomBytes(6).toString('hex')}`, email: email.toLowerCase(), password };
      users.set(user.email, user);
      return user;
    },
    setPassword(email, password) {
      users.get(email.toLowerCase()).password = password;
    },
    close: () => new Promise((resolve) => { server.closeAllConnections(); server.close(resolve); }),
  };
}
