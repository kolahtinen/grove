// The security log and the app log. Entries are built from allow-listed fields only, so passwords,
// tokens and request bodies never get in; both are kept 30 days (FR-023, constitution 3.6).
import { appendFileSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

export const EVENTS = new Set([
  'account_created', 'signin', 'signin_failed', 'lockout', 'terms_agreed', 'reset_requested',
  'signout', 'owner_setup', 'export', 'delete', 'firebase_unreachable',
]);
const DETAIL_FIELDS = ['role', 'reason', 'count'];
const APP_FIELDS = ['method', 'path', 'status', 'ms', 'code', 'event', 'reason', 'count', 'url'];
const KEEP_MS = 30 * 24 * 60 * 60 * 1000;

function pick(fields, allowed) {
  const out = {};
  for (const key of allowed) {
    const value = fields?.[key];
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      out[key] = typeof value === 'string' ? value.slice(0, 200) : value;
    }
  }
  return out;
}

export function createSeclog({ db, logDir, now = () => Date.now() }) {
  const insert = db.prepare('INSERT INTO security_log (at, event, account_id, email, ip, detail) VALUES (?, ?, ?, ?, ?, ?)');

  function security(event, { accountId = null, email = null, ip = null, detail } = {}) {
    if (!EVENTS.has(event)) throw new Error(`unknown security event: ${event}`);
    const kept = pick(detail, DETAIL_FIELDS);
    insert.run(now(), event, accountId, email ? String(email).slice(0, 254) : null,
      ip ? String(ip).slice(0, 64) : null, Object.keys(kept).length ? JSON.stringify(kept) : null);
  }

  function app(level, msg, fields = {}) {
    if (!logDir) return;
    mkdirSync(logDir, { recursive: true });
    const at = new Date(now());
    const line = JSON.stringify({ at: at.toISOString(), level, msg: String(msg).slice(0, 200), ...pick(fields, APP_FIELDS) });
    appendFileSync(join(logDir, `${at.toISOString().slice(0, 10)}.jsonl`), `${line}\n`);
  }

  function cleanUp(at = now()) {
    const cutoff = at - KEEP_MS;
    db.prepare('DELETE FROM security_log WHERE at < ?').run(cutoff);
    db.prepare('DELETE FROM availability_checks WHERE at < ?').run(cutoff);
    if (!logDir) return;
    let names = [];
    try { names = readdirSync(logDir); } catch { return; }
    const cutoffDay = new Date(cutoff).toISOString().slice(0, 10);
    for (const name of names) {
      const m = name.match(/^(\d{4}-\d{2}-\d{2})\.jsonl$/);
      if (m && m[1] < cutoffDay) rmSync(join(logDir, name), { force: true });
    }
  }

  function list({ sinceMs = 0, event } = {}) {
    if (event) return db.prepare('SELECT * FROM security_log WHERE at >= ? AND event = ? ORDER BY at, id').all(sinceMs, event);
    return db.prepare('SELECT * FROM security_log WHERE at >= ? ORDER BY at, id').all(sinceMs);
  }

  return { security, app, cleanUp, list };
}
