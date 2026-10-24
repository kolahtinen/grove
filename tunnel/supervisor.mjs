// Runs cloudflared's quick tunnel, keeps the README link current, and checks every hour that grove
// answers at that link (FR-001, FR-004, Q-06; grove-tunnel.service).
import { spawn } from 'node:child_process';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { updateReadmeBlock } from './github-readme.mjs';

const LINK = /https:\/\/[a-z0-9-]+\.trycloudflare\.com/;
const HOUR = 60 * 60 * 1000;

export function createSupervisor({ config, db, seclog, spawnImpl = spawn, fetchImpl = globalThis.fetch, now = () => Date.now(),
  retryMs = 15000, checkMs = HOUR }) {
  let child = null;
  let timer = null;
  let stopped = false;
  const getSetting = (key) => db.prepare('SELECT value FROM settings WHERE key = ?').get(key)?.value;
  const setSetting = (key, value) => db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(key, value);

  async function publish(link) {
    for (;;) {
      try {
        await updateReadmeBlock({
          ...config.github, token: config.github.token, fetchImpl,
          start: '<!-- grove-link -->', end: '<!-- /grove-link -->',
          content: `**grove is at:** ${link}`,
        });
        setSetting('tunnel_url_published_at', String(now()));
        seclog.app('info', 'README link updated', { url: link });
        return;
      } catch (error) {
        seclog.app('error', 'README update failed; retrying', { reason: String(error?.message || error).slice(0, 80) });
        if (stopped) return;
        await new Promise((r) => setTimeout(r, retryMs));
      }
    }
  }

  async function handleLine(line) {
    const link = String(line).match(LINK)?.[0];
    if (!link || link === getSetting('tunnel_url')) return;
    setSetting('tunnel_url', link);
    await publish(link);
  }

  async function checkAvailability() {
    const link = getSetting('tunnel_url');
    if (!link) return false;
    let ok = false;
    try {
      const res = await fetchImpl(`${link}/health`, { signal: AbortSignal.timeout(10000) });
      ok = res.status === 200 && (await res.text()) === 'ok';
    } catch {
      ok = false;
    }
    db.prepare('INSERT INTO availability_checks (at, url, ok) VALUES (?, ?, ?)').run(now(), link, ok ? 1 : 0);
    return ok;
  }

  function runCloudflared() {
    child = spawnImpl('cloudflared', ['tunnel', '--no-autoupdate', '--url', `http://127.0.0.1:${config.port}`], { stdio: ['ignore', 'pipe', 'pipe'] });
    let buffer = '';
    const onData = (chunk) => {
      buffer += chunk;
      const lines = buffer.split('\n');
      buffer = lines.pop();
      for (const line of lines) handleLine(line).catch(() => {});
    };
    child.stdout.setEncoding('utf8').on('data', onData);
    child.stderr.setEncoding('utf8').on('data', onData);
    child.on('exit', (code) => {
      seclog.app('error', 'cloudflared exited; restarting', { code: code ?? -1 });
      if (!stopped) setTimeout(runCloudflared, 5000);
    });
  }

  return {
    handleLine,
    checkAvailability,
    start() {
      runCloudflared();
      timer = setInterval(() => { checkAvailability().catch(() => {}); }, checkMs);
    },
    stop() {
      stopped = true;
      clearInterval(timer);
      child?.kill();
    },
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { loadConfig } = await import('../server/config.mjs');
  const { openStore } = await import('../server/main.mjs');
  const { createSeclog } = await import('../server/seclog/seclog.mjs');
  const config = loadConfig(process.env, { needGithub: true });
  const db = openStore(config);
  const seclog = createSeclog({ db, logDir: join(config.dataDir, 'logs') });
  const supervisor = createSupervisor({ config, db, seclog });
  supervisor.start();
  const stop = () => { supervisor.stop(); db.close(); process.exit(0); };
  process.on('SIGTERM', stop);
  process.on('SIGINT', stop);
}
