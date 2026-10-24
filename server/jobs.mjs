// The hourly job: log clean-up, expired sessions and idle counters (backups join it in US4).

export async function hourlyJob({ db, seclog, sessions, now = () => Date.now() }) {
  try {
    seclog.cleanUp(now());
    sessions.removeExpired();
    const hasCounters = db.prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'failed_signins'").get();
    if (hasCounters) db.prepare('DELETE FROM failed_signins WHERE updated_at < ? AND (locked_until IS NULL OR locked_until < ?)').run(now() - 3600000, now());
  } catch (error) {
    seclog.app('error', 'hourly job failed', { code: error?.code || error?.name || 'Error' });
  }
}
