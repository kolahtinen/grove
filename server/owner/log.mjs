// Text for log:show, availability:show and reports:show.
import { listReports, formatReports } from '../learning/learning.mjs';

// G-09 FR-931: the open reports on grove's learning content, for the owner to fix content/learning/.
export function showReports(db) {
  return formatReports(listReports(db));
}

export function formatLog(rows) {
  if (!rows.length) return 'No entries.';
  return rows.map((r) => [
    new Date(r.at).toISOString().replace('T', ' ').slice(0, 19),
    r.event.padEnd(20),
    r.account_id ? `account ${r.account_id}` : (r.email || '-'),
    r.ip || '-',
    r.detail || '',
  ].join('  ')).join('\n');
}

export function formatAvailability(rows) {
  if (!rows.length) return 'No checks yet.';
  const days = new Map();
  for (const r of rows) {
    const day = new Date(r.at).toISOString().slice(0, 10);
    const d = days.get(day) || { ok: 0, all: 0 };
    d.all += 1;
    d.ok += r.ok;
    days.set(day, d);
  }
  return [...days].sort().map(([day, d]) => `${day}  answered ${d.ok} of ${d.all} checks`).join('\n');
}
