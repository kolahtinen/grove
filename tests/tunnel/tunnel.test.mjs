import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { startTestGrove } from '../fakes/harness.mjs';
import { createSupervisor } from '../../tunnel/supervisor.mjs';
import { formatAvailability } from '../../server/owner/log.mjs';

let t;
before(async () => { t = await startTestGrove(); });
after(() => t.close());

function supervisor(extra = {}) {
  return createSupervisor({ config: t.config, db: t.grove.db, seclog: t.grove.seclog, retryMs: 20, ...extra });
}

test('FR-004 RQ-364: a new trycloudflare address is stored and written into the README between the link markers', async () => {
  const s = supervisor();
  await s.handleLine('2026-10-24T12:00:00Z INF |  https://quiet-forest-path.trycloudflare.com                     |');
  assert.equal(t.grove.db.prepare("SELECT value FROM settings WHERE key = 'tunnel_url'").get().value, 'https://quiet-forest-path.trycloudflare.com');
  const readme = t.gh.files.get('README.md');
  assert.match(readme, /<!-- grove-link -->\n.*https:\/\/quiet-forest-path\.trycloudflare\.com.*\n<!-- \/grove-link -->/);
  await s.handleLine('INF Registered tunnel connection connIndex=0');
  assert.equal(t.gh.state.writes.length, 1, 'lines without a new address change nothing');
});

test('FR-004 RQ-364: while GitHub fails, the supervisor retries until the link is published, well within 2 minutes', async () => {
  const s = supervisor();
  t.gh.state.failing = 3;
  const started = Date.now();
  await s.handleLine('INF +---- https://second-river-bend.trycloudflare.com ----+');
  assert.match(t.gh.files.get('README.md'), /second-river-bend/);
  assert.ok(Date.now() - started < 120000);
});

test('FR-004 RQ-364: when the address changes while GitHub is failing, the older link is never written and the README ends with the newest', async () => {
  const s = supervisor();
  t.gh.state.failing = 1000;
  const writesBefore = t.gh.state.writes.length;
  const older = s.handleLine('https://older-moss-bank.trycloudflare.com');
  await new Promise((r) => setTimeout(r, 60));
  const newer = s.handleLine('https://newer-fern-glade.trycloudflare.com');
  await new Promise((r) => setTimeout(r, 100));
  t.gh.state.failing = 0;
  await Promise.all([older, newer]);
  await new Promise((r) => setTimeout(r, 100));
  const writes = t.gh.state.writes.slice(writesBefore);
  assert.ok(writes.length >= 1);
  for (const w of writes) assert.doesNotMatch(w.text, /older-moss-bank/);
  assert.match(t.gh.files.get('README.md'), /newer-fern-glade/);
});

test('FR-004 RQ-364: the supervisor never writes any path but README.md (constitution 4.8)', async () => {
  const s = supervisor();
  await s.handleLine('https://third-stone-step.trycloudflare.com');
  assert.ok(t.gh.state.writes.length >= 1);
  for (const write of t.gh.state.writes) assert.equal(write.path, 'README.md');
  for (const r of t.gh.state.requests) assert.match(r.url, /\/contents\/README\.md$/);
});

test('FR-004 RQ-364: the hourly check records whether grove answered at the link, and availability:show sums it per day', async () => {
  const up = createServer((req, res) => { res.writeHead(req.url === '/health' ? 200 : 404); res.end('ok'); });
  await new Promise((r) => up.listen(0, '127.0.0.1', r));
  try {
    const s = supervisor();
    t.grove.db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('tunnel_url', ?)").run(`http://127.0.0.1:${up.address().port}`);
    assert.equal(await s.checkAvailability(), true);
    t.grove.db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('tunnel_url', 'http://127.0.0.1:9')").run();
    assert.equal(await s.checkAvailability(), false);
    const rows = t.grove.db.prepare('SELECT ok FROM availability_checks ORDER BY at').all().map((r) => r.ok);
    assert.deepEqual(rows, [1, 0]);
    assert.match(formatAvailability(t.grove.db.prepare('SELECT * FROM availability_checks').all()), /1 of 2/);
  } finally {
    up.close();
  }
});

test('FR-002 RQ-125: the service units restart grove and the tunnel, run as grove and start on boot; journald keeps 30 days', () => {
  for (const unit of ['grove.service', 'grove-tunnel.service']) {
    const text = readFileSync(new URL(`../../deploy/${unit}`, import.meta.url), 'utf8');
    assert.match(text, /^Restart=always$/m, unit);
    assert.match(text, /^User=grove$/m, unit);
    assert.match(text, /^WantedBy=multi-user\.target$/m, unit);
  }
  assert.match(readFileSync(new URL('../../deploy/journald-grove.conf', import.meta.url), 'utf8'), /^MaxRetentionSec=30day$/m);
});

test('FR-004 RQ-364: each service loads its own environment file and cannot open the other service\'s secrets (constitution 2.1, 4.8)', () => {
  const read = (name) => readFileSync(new URL(`../../deploy/${name}`, import.meta.url), 'utf8');
  const blocked = (text) => (text.match(/^InaccessiblePaths=(.*)$/m)?.[1] || '').split(/\s+/);
  const web = read('grove.service');
  assert.match(web, /^EnvironmentFile=\/etc\/grove\/web\.env$/m);
  assert.ok(blocked(web).includes('/etc/grove/tunnel.env'));
  const tunnel = read('grove-tunnel.service');
  assert.match(tunnel, /^EnvironmentFile=\/etc\/grove\/tunnel\.env$/m);
  for (const path of ['/etc/grove/web.env', '/etc/grove/service-account.json']) assert.ok(blocked(tunnel).includes(path), path);
  assert.doesNotMatch(read('web.env.example'), /GITHUB_/);
  assert.doesNotMatch(read('tunnel.env.example'), /FIREBASE_/);
  const setup = read('SETUP.md');
  assert.match(setup, /web\.env/);
  assert.match(setup, /tunnel\.env/);
  assert.doesNotMatch(setup, /grove\.env\b/);
});

// Holds the next GitHub request with this method open until the returned release() is called.
function holdNext(method) {
  let release;
  t.gh.state.gate = { method, promise: new Promise((r) => { release = r; }) };
  return () => release();
}
async function until(cond) {
  for (let i = 0; i < 200 && !cond(); i += 1) await new Promise((r) => setTimeout(r, 10));
  assert.ok(cond(), 'timed out');
}

test('FR-004 RQ-364: an address that changes after the README was read is the one sent; the older link is never sent', async () => {
  const s = supervisor();
  const writesBefore = t.gh.state.writes.length;
  const requestsBefore = t.gh.state.requests.length;
  const release = holdNext('GET');
  const older = s.handleLine('https://held-read-older.trycloudflare.com');
  await until(() => t.gh.state.requests.slice(requestsBefore).some((r) => r.method === 'GET'));
  const newer = s.handleLine('https://held-read-newer.trycloudflare.com');
  release();
  await Promise.all([older, newer]);
  await new Promise((r) => setTimeout(r, 100));
  const writes = t.gh.state.writes.slice(writesBefore);
  assert.ok(writes.length >= 1);
  for (const w of writes) assert.doesNotMatch(w.text, /held-read-older/);
  assert.match(t.gh.files.get('README.md'), /held-read-newer/);
});

test('FR-004 RQ-364: an address that changes while a write is being sent is written next, so the README ends with the newest', async () => {
  const s = supervisor();
  const requestsBefore = t.gh.state.requests.length;
  const release = holdNext('PUT');
  const older = s.handleLine('https://held-write-older.trycloudflare.com');
  await until(() => t.gh.state.requests.slice(requestsBefore).some((r) => r.method === 'PUT'));
  const newer = s.handleLine('https://held-write-newer.trycloudflare.com');
  release();
  await Promise.all([older, newer]);
  await new Promise((r) => setTimeout(r, 100));
  assert.match(t.gh.files.get('README.md'), /held-write-newer/);
});

test('FR-004 RQ-364: each service unit loads exactly one environment file, and each example holds its own secrets (constitution 2.1, 4.8)', () => {
  const read = (name) => readFileSync(new URL(`../../deploy/${name}`, import.meta.url), 'utf8');
  const envFiles = (text) => [...text.matchAll(/^EnvironmentFile=-?(.*)$/gm)].map((m) => m[1].trim());
  assert.deepEqual(envFiles(read('grove.service')), ['/etc/grove/web.env']);
  assert.deepEqual(envFiles(read('grove-tunnel.service')), ['/etc/grove/tunnel.env']);
  for (const key of ['FIREBASE_PROJECT_ID', 'FIREBASE_API_KEY', 'FIREBASE_SERVICE_ACCOUNT_FILE']) assert.match(read('web.env.example'), new RegExp(`^${key}=`, 'm'), key);
  for (const key of ['GITHUB_REPO', 'GITHUB_TOKEN']) assert.match(read('tunnel.env.example'), new RegExp(`^${key}=`, 'm'), key);
});

test('FR-004 RQ-364: the tunnel process loads the tunnel settings (it asks for GitHub, never for Firebase)', async () => {
  const { spawnSync } = await import('node:child_process');
  const { mkdtempSync, rmSync } = await import('node:fs');
  const { tmpdir } = await import('node:os');
  const { join } = await import('node:path');
  const dir = mkdtempSync(join(tmpdir(), 'grove-role-'));
  try {
    const env = { GROVE_DATA_DIR: dir, FIREBASE_PROJECT_ID: 'p', FIREBASE_API_KEY: 'k', FIREBASE_SERVICE_ACCOUNT_FILE: '/nowhere.json', GROVE_BACKUP_DIR: dir };
    const run = spawnSync(process.execPath, [new URL('../../tunnel/supervisor.mjs', import.meta.url).pathname], { env, encoding: 'utf8', timeout: 10000 });
    assert.notEqual(run.status, 0);
    assert.match(run.stderr, /missing settings: .*GITHUB_TOKEN/);
    assert.doesNotMatch(run.stderr, /FIREBASE_/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
