// Verifies Firebase ID tokens before grove trusts them: RS256 signature against Google's published
// securetoken certificates, project, issuer, expiry and subject (T-10, constitution 4.5, research R4).
import { X509Certificate, createPublicKey, verify } from 'node:crypto';

export class TokenError extends Error {}

export function createTokenVerifier({ projectId, certsUrl, fetchJson, now = () => Date.now() }) {
  let cache = { keys: null, until: 0 };

  async function getKeys() {
    if (cache.keys && now() < cache.until) return cache.keys;
    const { body, headers } = await fetchJson(certsUrl, { method: 'GET' });
    if (!body || typeof body !== 'object') throw new TokenError('bad certificates');
    const keys = new Map();
    for (const [kid, pem] of Object.entries(body)) {
      if (typeof pem !== 'string') continue;
      const key = pem.includes('BEGIN CERTIFICATE') ? new X509Certificate(pem).publicKey : createPublicKey(pem);
      keys.set(kid, key);
    }
    const maxAge = Number((headers.get('cache-control') || '').match(/max-age=(\d+)/)?.[1] || 0);
    cache = { keys, until: now() + Math.min(maxAge, 6 * 3600) * 1000 };
    return keys;
  }

  return async function verifyIdToken(token) {
    if (typeof token !== 'string') throw new TokenError('no token');
    const parts = token.split('.');
    if (parts.length !== 3) throw new TokenError('malformed token');
    let header;
    let payload;
    try {
      header = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
      payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
    } catch {
      throw new TokenError('malformed token');
    }
    if (header.alg !== 'RS256' || typeof header.kid !== 'string') throw new TokenError('wrong algorithm');
    const key = (await getKeys()).get(header.kid);
    if (!key) throw new TokenError('unknown key');
    const ok = verify('RSA-SHA256', Buffer.from(`${parts[0]}.${parts[1]}`), key, Buffer.from(parts[2], 'base64url'));
    if (!ok) throw new TokenError('bad signature');
    const seconds = Math.floor(now() / 1000);
    if (payload.aud !== projectId) throw new TokenError('wrong audience');
    if (payload.iss !== `https://securetoken.google.com/${projectId}`) throw new TokenError('wrong issuer');
    if (typeof payload.exp !== 'number' || payload.exp <= seconds) throw new TokenError('expired');
    if (typeof payload.iat !== 'number' || payload.iat > seconds + 300) throw new TokenError('issued in the future');
    if (typeof payload.sub !== 'string' || payload.sub.length === 0 || payload.sub.length > 128) throw new TokenError('no subject');
    return payload;
  };
}
