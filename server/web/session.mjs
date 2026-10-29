// Grove's own sessions: a random cookie whose hash is stored, a CSRF token per session, 30 days,
// ended on the server at sign-out (FR-013, FR-014, constitution 4.7, research R6).
import { randomBytes, createHash, timingSafeEqual } from 'node:crypto';
import { HttpError } from './http.mjs';

export const SESSION_COOKIE = '__Host-grove_session';
export const CSRF_COOKIE = '__Host-grove_csrf';
export const SESSION_DAYS = 30;
const SESSION_MS = SESSION_DAYS * 24 * 60 * 60 * 1000;

const hash = (value) => createHash('sha256').update(value).digest('hex');
const random = () => randomBytes(32).toString('base64url');

function sameSecret(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || !a || a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export function createSessions({ db, now = () => Date.now() }) {
  return {
    create(accountId) {
      const value = random();
      const csrf = random();
      const at = now();
      db.prepare('INSERT INTO sessions (id_hash, account_id, csrf_token, created_at, expires_at) VALUES (?, ?, ?, ?, ?)')
        .run(hash(value), accountId, csrf, at, at + SESSION_MS);
      return {
        csrf,
        idHash: hash(value),
        cookie: `${SESSION_COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_MS / 1000}`,
      };
    },

    lookup(cookies) {
      const value = cookies[SESSION_COOKIE];
      if (!value || value.length > 100) return null;
      const row = db.prepare(`SELECT s.id_hash, s.account_id, s.csrf_token, s.expires_at, s.terms_agreed_at,
          a.email, a.is_owner, a.is_reviewer
        FROM sessions s JOIN accounts a ON a.id = s.account_id WHERE s.id_hash = ?`).get(hash(value));
      if (!row || row.expires_at <= now()) return null;
      return row;
    },

    // Marks a sign-in agreed, naming the agreement it rests on (G-01 FR-011, constitution 3.1).
    agree(idHash, agreementId = null) {
      const at = now();
      db.prepare('UPDATE sessions SET terms_agreed_at = ?, age_confirmed_at = ?, terms_agreement_id = ? WHERE id_hash = ?').run(at, at, agreementId, idHash);
    },

    destroy(idHash) {
      db.prepare('DELETE FROM sessions WHERE id_hash = ?').run(idHash);
    },

    removeExpired() {
      db.prepare('DELETE FROM sessions WHERE expires_at <= ?').run(now());
    },

    clearCookie() {
      return `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
    },

    // A pre-session token for the signed-out forms (double submit).
    preSession() {
      const token = random();
      return { token, cookie: `${CSRF_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400` };
    },
  };
}

// Every state-changing request needs a same-origin Origin and a CSRF token matching the session's
// or the pre-session cookie (constitution 4.7).
export function checkCsrf(ctx) {
  const origin = ctx.req.headers.origin;
  const host = ctx.req.headers.host;
  let originHost = null;
  try { originHost = origin ? new URL(origin).host : null; } catch { originHost = null; }
  if (!originHost || originHost !== host) throw new HttpError(403, 'csrf', 'Please reload the page and try again.');
  const header = ctx.req.headers['x-csrf-token'];
  const ok = (ctx.session && sameSecret(header, ctx.session.csrf_token)) || sameSecret(header, ctx.cookies[CSRF_COOKIE]);
  if (!ok) throw new HttpError(403, 'csrf', 'Please reload the page and try again.');
}
