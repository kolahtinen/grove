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
