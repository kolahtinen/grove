// Hourly backups to the second disk, checked after writing, last 48 kept; and a restore for the
// by-hand test (FR-003, constitution 4.12).
import { mkdirSync, readdirSync, rmSync, existsSync, readFileSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';
import { openDb } from './db.mjs';

const KEEP = 48;

function tableCounts(db) {
  const counts = {};
  for (const { name } of db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'").all()) {
    counts[name] = db.prepare(`SELECT COUNT(*) AS n FROM "${name}"`).get().n;
  }
  return counts;
}

export function backupNow({ db, backupDir, now = () => Date.now() }) {
  mkdirSync(backupDir, { recursive: true });
  const stamp = new Date(now()).toISOString().replace(/[-:]/g, '').slice(0, 11).replace('T', '-');
  const file = join(backupDir, `grove-${stamp}.db`);
  rmSync(file, { force: true });
  db.prepare('VACUUM INTO ?').run(file);
  const expected = tableCounts(db);
  const copy = openDb(file);
  let counts;
  try { counts = tableCounts(copy); } finally { copy.close(); }
  for (const [name, n] of Object.entries(expected)) {
    if (counts[name] !== n) throw new Error(`backup check failed for ${name}`);
  }
  const old = readdirSync(backupDir).filter((n) => /^grove-\d{8}-\d{2}\.db$/.test(n)).sort();
  for (const name of old.slice(0, Math.max(0, old.length - KEEP))) rmSync(join(backupDir, name), { force: true });
  return { file, counts };
}

function groveRunning(dataDir) {
  const pidFile = join(dataDir, 'grove.pid');
  if (!existsSync(pidFile)) return false;
  const pid = Number(readFileSync(pidFile, 'utf8'));
  try { process.kill(pid, 0); return true; } catch { return false; }
}

export function restoreBackup({ dataDir, file }) {
  if (groveRunning(dataDir)) throw new Error('grove is running; stop it first (systemctl stop grove).');
  if (!existsSync(file)) throw new Error('There is no such backup file.');
  const target = join(dataDir, 'grove.db');
  for (const extra of ['-wal', '-shm']) rmSync(target + extra, { force: true });
  copyFileSync(file, target);
}
