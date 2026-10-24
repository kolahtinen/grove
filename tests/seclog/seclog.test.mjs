import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync, readdirSync, readFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openDb } from '../../server/store/db.mjs';
import { migrate } from '../../server/store/migrate.mjs';
import { createSeclog } from '../../server/seclog/seclog.mjs';

function setup() {
  const dir = mkdtempSync(join(tmpdir(), 'grove-seclog-'));
  const db = openDb(join(dir, 'grove.db'));
  migrate(db);
  let clock = Date.UTC(2026, 9, 24, 12);
  const seclog = createSeclog({ db, logDir: join(dir, 'logs'), now: () => clock });
  return { dir, db, seclog, setClock: (t) => { clock = t; }, done: () => { db.close(); rmSync(dir, { recursive: true, force: true }); } };
}

test('FR-023 RQ-371: entries hold time, event, who and only allow-listed detail fields', () => {
  const s = setup();
  try {
    s.seclog.security('signin', { accountId: 7, ip: '203.0.113.5', detail: { role: 'reviewer', password: 'Forest-walk-42', token: 'eyJabc', body: 'secret text' } });
    const [row] = s.seclog.list();
    assert.equal(row.event, 'signin');
    assert.equal(row.account_id, 7);
    assert.equal(row.ip, '203.0.113.5');
    assert.equal(row.at, Date.UTC(2026, 9, 24, 12));
    assert.deepEqual(JSON.parse(row.detail), { role: 'reviewer' });
    assert.throws(() => s.seclog.security('made_up_event'));
  } finally {
    s.done();
  }
});

test('FR-023 RQ-371: the app log drops passwords, tokens and body text', () => {
  const s = setup();
  try {
    s.seclog.app('info', 'request', { method: 'POST', path: '/api/signin', status: 200, password: 'Forest-walk-42', idToken: 'eyJabc', body: '{"x":1}' });
    const file = readdirSync(join(s.dir, 'logs'))[0];
    const text = readFileSync(join(s.dir, 'logs', file), 'utf8');
    assert.match(text, /"path":"\/api\/signin"/);
    assert.doesNotMatch(text, /Forest-walk-42|eyJabc|"x":1/);
  } finally {
    s.done();
  }
});

test('FR-023 RQ-371: entries, availability checks and app-log files older than 30 days are removed', () => {
  const s = setup();
  try {
    const day = 24 * 60 * 60 * 1000;
    const now = Date.UTC(2026, 9, 24, 12);
    s.setClock(now - 31 * day);
    s.seclog.security('signin', { accountId: 1 });
    s.db.prepare('INSERT INTO availability_checks (at, url, ok) VALUES (?, ?, 1)').run(now - 31 * day, 'https://a');
    s.setClock(now - 1 * day);
    s.seclog.security('signout', { accountId: 1 });
    s.db.prepare('INSERT INTO availability_checks (at, url, ok) VALUES (?, ?, 1)').run(now - day, 'https://a');
    mkdirSync(join(s.dir, 'logs'), { recursive: true });
    writeFileSync(join(s.dir, 'logs', '2026-09-20.jsonl'), '{}\n');
    writeFileSync(join(s.dir, 'logs', '2026-10-20.jsonl'), '{}\n');
    s.setClock(now);
    s.seclog.cleanUp(now);
    assert.deepEqual(s.seclog.list().map((r) => r.event), ['signout']);
    assert.equal(s.db.prepare('SELECT COUNT(*) AS n FROM availability_checks').get().n, 1);
    assert.deepEqual(readdirSync(join(s.dir, 'logs')).sort(), ['2026-10-20.jsonl']);
  } finally {
    s.done();
  }
});
