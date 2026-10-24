// After 5 failed sign-ins in a row for an address, that address is locked for 15 minutes. Counted
// per address entered, account or not, so the lock reveals nothing (FR-020, RQ-156, RQ-372).

export const MAX_FAILURES = 5;
export const LOCK_MS = 15 * 60 * 1000;

export function createLockout({ db, seclog, now = () => Date.now() }) {
  const get = db.prepare('SELECT failures, locked_until FROM failed_signins WHERE email = ?');
  const upsert = db.prepare(`INSERT INTO failed_signins (email, failures, locked_until, updated_at) VALUES (?, ?, ?, ?)
    ON CONFLICT (email) DO UPDATE SET failures = excluded.failures, locked_until = excluded.locked_until, updated_at = excluded.updated_at`);

  return {
    isLocked(email) {
      const row = get.get(email);
      return !!row && row.locked_until !== null && row.locked_until > now();
    },

    recordFailure(email, ip) {
      const row = get.get(email);
      const lockOver = row?.locked_until !== null && row?.locked_until !== undefined && row.locked_until <= now();
      const failures = (row && !lockOver ? row.failures : 0) + 1;
      const lockedUntil = failures >= MAX_FAILURES ? now() + LOCK_MS : null;
      upsert.run(email, failures, lockedUntil, now());
      if (lockedUntil) seclog.security('lockout', { email, ip, detail: { count: failures } });
    },

    recordSuccess(email) {
      db.prepare('DELETE FROM failed_signins WHERE email = ?').run(email);
    },
  };
}
