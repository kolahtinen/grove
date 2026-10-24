// An OAuth access token for Firebase's admin calls, from the service-account key: grove signs a
// JWT (RS256) and exchanges it at Google's token endpoint (research R4).
import { createSign } from 'node:crypto';

const SCOPE = 'https://www.googleapis.com/auth/identitytoolkit';

export function createServiceToken({ serviceAccount, tokenUrl, fetchJson, now = () => Date.now() }) {
  let cached = { token: null, until: 0 };

  return async function accessToken() {
    if (cached.token && now() < cached.until) return cached.token;
    if (!serviceAccount?.client_email || !serviceAccount?.private_key) throw new Error('service account missing');
    const iat = Math.floor(now() / 1000);
    const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
    const claims = Buffer.from(JSON.stringify({
      iss: serviceAccount.client_email, scope: SCOPE, aud: tokenUrl, iat, exp: iat + 3600,
    })).toString('base64url');
    const signer = createSign('RSA-SHA256');
    signer.update(`${header}.${claims}`);
    const assertion = `${header}.${claims}.${signer.sign(serviceAccount.private_key).toString('base64url')}`;
    const { status, body } = await fetchJson(tokenUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion }).toString(),
    });
    if (status !== 200 || typeof body?.access_token !== 'string' || typeof body?.expires_in !== 'number') {
      throw new Error('service token refused');
    }
    cached = { token: body.access_token, until: now() + (body.expires_in - 300) * 1000 };
    return cached.token;
  };
}
