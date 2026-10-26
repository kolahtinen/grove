import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadConfig } from '../../server/config.mjs';

const ALL = {
  GROVE_PORT: '8787', GROVE_DATA_DIR: '/var/lib/grove', GROVE_BACKUP_DIR: '/mnt/grove-backup',
  FIREBASE_PROJECT_ID: 'p', FIREBASE_API_KEY: 'fb-key-secret', FIREBASE_SERVICE_ACCOUNT_FILE: '/etc/grove/service-account.json',
  GITHUB_REPO: 'owner/grove', GITHUB_TOKEN: 'gh-token-secret',
};
const without = (keys) => Object.fromEntries(Object.entries(ALL).filter(([k]) => !keys.some((p) => k.startsWith(p))));

test('FR-004 RQ-364: the web config asks only for its own settings and never holds the GitHub token (constitution 2.1, 4.8)', () => {
  const config = loadConfig(without(['GITHUB_']), { role: 'web' });
  assert.equal(config.firebase.apiKey, 'fb-key-secret');
  const given = loadConfig(ALL, { role: 'web' });
  assert.ok(!given.github?.token, 'a GitHub token in the environment is not kept');
  assert.ok(!JSON.stringify(given).includes('gh-token-secret'));
  assert.throws(() => loadConfig(without(['FIREBASE_API_KEY']), { role: 'web' }), /FIREBASE_API_KEY/);
});

test('FR-004 RQ-364: the tunnel config asks only for its own settings and never holds Firebase secrets (constitution 2.1, 4.8)', () => {
  const config = loadConfig(without(['FIREBASE_', 'GROVE_BACKUP_DIR']), { role: 'tunnel' });
  assert.equal(config.github.token, 'gh-token-secret');
  assert.equal(config.dataDir, '/var/lib/grove');
  const given = loadConfig(ALL, { role: 'tunnel' });
  assert.ok(!given.firebase?.apiKey && !given.firebase?.serviceAccountFile, 'Firebase settings in the environment are not kept');
  assert.throws(() => loadConfig(without(['GITHUB_TOKEN']), { role: 'tunnel' }), /GITHUB_TOKEN/);
});

test('FR-004 RQ-364: a config must name its role', () => {
  assert.throws(() => loadConfig(ALL), /role/);
});

test('FR-004 RQ-364: an unknown role is refused', () => {
  assert.throws(() => loadConfig(ALL, { role: 'owner' }), /role/);
});

// Runs an entry point with only the tunnel's settings: a process using the web role must ask for Firebase.
async function startWithTunnelSettings(file, args = []) {
  const { spawnSync } = await import('node:child_process');
  const { mkdtempSync, rmSync } = await import('node:fs');
  const { tmpdir } = await import('node:os');
  const { join } = await import('node:path');
  const dir = mkdtempSync(join(tmpdir(), 'grove-role-'));
  try {
    const env = { GROVE_PORT: '0', GROVE_DATA_DIR: dir, GITHUB_REPO: 'owner/grove', GITHUB_TOKEN: 'gh-token-secret' };
    return spawnSync(process.execPath, [new URL(`../../${file}`, import.meta.url).pathname, ...args], { env, encoding: 'utf8', timeout: 10000 });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test('FR-004 RQ-364: grove\'s server loads the web settings (it asks for Firebase, never for GitHub)', async () => {
  const run = await startWithTunnelSettings('server/main.mjs');
  assert.notEqual(run.status, 0);
  assert.match(run.stderr, /missing settings: .*FIREBASE_API_KEY/);
  assert.doesNotMatch(run.stderr, /GITHUB_/);
});

test('FR-202 RQ-392: the prompt sizes come from the environment, with defaults, and a bad value stops grove at start with its name', () => {
  const web = without(['GITHUB_']);
  assert.deepEqual(loadConfig(web, { role: 'web' }).sizes, {
    partReading: 2, partListening: 1, textWords: 90, setupChunkWords: 500, setupMaxWords: 3000, checkMeanings: 20, ownPieceChars: 2500,
  });
  const tuned = loadConfig({ ...web, GROVE_PART_READING: '1', GROVE_SETUP_CHUNK_WORDS: '300', GROVE_TEXT_WORDS: '70' }, { role: 'web' }).sizes;
  assert.equal(tuned.partReading, 1);
  assert.equal(tuned.setupChunkWords, 300);
  assert.equal(tuned.textWords, 70);
  for (const bad of ['0', '-3', 'many', '2.5']) {
    assert.throws(() => loadConfig({ ...web, GROVE_SETUP_MAX_WORDS: bad }, { role: 'web' }), /GROVE_SETUP_MAX_WORDS/);
  }
});
