// Firebase Authentication over its REST API, from grove's server only (FR-009, RQ-367). Outbound
// requests may reach only the configured Firebase, OAuth and certificate hosts (FR-006).
import { readFileSync } from 'node:fs';
import { createTokenVerifier } from './verify-token.mjs';
import { createServiceToken } from './service-token.mjs';

export class FirebaseError extends Error {
  constructor(code) {
    super(code);
    this.code = code; // email_exists | wrong_credentials | unavailable | bad_answer
  }
}

export function createFirebase(config, { fetchImpl = globalThis.fetch, timeoutMs = 10000, now = () => Date.now() } = {}) {
  const { projectId, apiKey, authUrl, tokenUrl, certsUrl } = config;
  const allowedOrigins = new Set([authUrl, tokenUrl, certsUrl].map((u) => new URL(u).origin));
  const serviceAccount = config.serviceAccount
    ?? (config.serviceAccountFile ? JSON.parse(readFileSync(config.serviceAccountFile, 'utf8')) : null);

  async function fetchJson(url, init) {
    if (!allowedOrigins.has(new URL(url).origin)) throw new Error('outbound host not allowed');
    let response;
    try {
      response = await fetchImpl(url, { ...init, signal: AbortSignal.timeout(timeoutMs) });
    } catch {
      throw new FirebaseError('unavailable');
    }
    let body = null;
    try { body = await response.json(); } catch { body = null; }
    if (response.status >= 500) throw new FirebaseError('unavailable');
    return { status: response.status, body, headers: response.headers };
  }

  const verifyIdToken = createTokenVerifier({ projectId, certsUrl, fetchJson, now });
  const accessToken = createServiceToken({ serviceAccount, tokenUrl, fetchJson, now });

  function errorMessage(body) {
    return typeof body?.error?.message === 'string' ? body.error.message : '';
  }

  async function publicCall(method, payload) {
    return fetchJson(`${authUrl}/v1/accounts:${method}?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
  }

  async function adminCall(method, payload) {
    let token;
    try { token = await accessToken(); } catch (e) { throw e instanceof FirebaseError ? e : new FirebaseError('unavailable'); }
    return fetchJson(`${authUrl}/v1/projects/${encodeURIComponent(projectId)}/accounts:${method}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
  }

  return {
    async signUp(email, password) {
      const { status, body } = await publicCall('signUp', { email, password, returnSecureToken: true });
      if (status === 200 && typeof body?.localId === 'string' && body.localId) return { uid: body.localId };
      if (errorMessage(body).startsWith('EMAIL_EXISTS')) throw new FirebaseError('email_exists');
      throw new FirebaseError('bad_answer');
    },

    async signIn(email, password) {
      const { status, body } = await publicCall('signInWithPassword', { email, password, returnSecureToken: true });
      if (status === 200 && typeof body?.idToken === 'string') {
        let payload;
        try { payload = await verifyIdToken(body.idToken); } catch (e) {
          if (e instanceof FirebaseError) throw e;
          throw new FirebaseError('bad_answer');
        }
        return { uid: payload.sub };
      }
      const message = errorMessage(body);
      if (/^(INVALID_LOGIN_CREDENTIALS|EMAIL_NOT_FOUND|INVALID_PASSWORD|USER_DISABLED|INVALID_EMAIL|TOO_MANY_ATTEMPTS)/.test(message)) {
        throw new FirebaseError('wrong_credentials');
      }
      throw new FirebaseError('bad_answer');
    },

    async sendPasswordReset(email) {
      const { status, body } = await publicCall('sendOobCode', { requestType: 'PASSWORD_RESET', email });
      // EMAIL_NOT_FOUND only appears if enumeration protection is off; the answer is the same anyway.
      if (status === 200 || errorMessage(body).startsWith('EMAIL_NOT_FOUND')) return;
      throw new FirebaseError('bad_answer');
    },

    // A user Firebase no longer has counts as deleted, so a failed deletion can be run again (FR-017).
    async deleteUser(uid) {
      const { status, body } = await adminCall('delete', { localId: uid });
      if (status === 200 || errorMessage(body).startsWith('USER_NOT_FOUND')) return;
      throw new FirebaseError('bad_answer');
    },

    async lookupUser(uid) {
      const { status, body } = await adminCall('lookup', { localId: [uid] });
      if (status !== 200) throw new FirebaseError('bad_answer');
      const user = Array.isArray(body?.users) ? body.users[0] : null;
      return user && typeof user.localId === 'string' ? { uid: user.localId, email: user.email } : null;
    },

    verifyIdToken,
  };
}
