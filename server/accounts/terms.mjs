// Agreements to the terms per device and terms version (G-01 FR-011, constitution 3.1 2.0.0; addendum
// 005): agreed at sign-up, at the first sign-in on each new device, and again when the terms change. The
// device is a random value in an HttpOnly cookie; only its hash is stored, with the agreement.
import { randomBytes, createHash } from 'node:crypto';

// The date the terms page says they last changed (public/terms.html); a new date asks everyone again.
export const TERMS_VERSION = '2026-10-29';
export const DEVICE_COOKIE = '__Host-grove_device';
const DEVICE_DAYS = 400;

const hash = (value) => createHash('sha256').update(value).digest('hex');
const valid = (value) => typeof value === 'string' && /^[A-Za-z0-9_-]{43}$/.test(value);

export function createTermsAgreements({ db, now = () => Date.now() }) {
  return {
    // The account's agreement on this device to the current version, or null.
    find(accountId, deviceValue) {
      if (!valid(deviceValue)) return null;
      return db.prepare('SELECT id FROM terms_agreements WHERE account_id = ? AND device_hash = ? AND terms_version = ? ORDER BY id DESC LIMIT 1')
        .get(accountId, hash(deviceValue), TERMS_VERSION) ?? null;
    },
    // Records an agreement on this device (a new device value when the cookie is missing or not ours).
    record(accountId, deviceValue) {
      const value = valid(deviceValue) ? deviceValue : randomBytes(32).toString('base64url');
      const at = now();
      const id = Number(db.prepare('INSERT INTO terms_agreements (account_id, device_hash, terms_version, agreed_at, age_confirmed_at) VALUES (?, ?, ?, ?, ?)')
        .run(accountId, hash(value), TERMS_VERSION, at, at).lastInsertRowid);
      return { id, cookie: `${DEVICE_COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${DEVICE_DAYS * 24 * 60 * 60}` };
    },
  };
}
