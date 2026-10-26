import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('FR-004 RQ-364: the owner commands load the web settings (they ask for Firebase, never for GitHub; constitution 2.1)', () => {
  const dir = mkdtempSync(join(tmpdir(), 'grove-role-'));
  try {
    const env = { GROVE_DATA_DIR: dir, GITHUB_REPO: 'owner/grove', GITHUB_TOKEN: 'gh-token-secret' };
    const run = spawnSync(process.execPath, [new URL('../../server/owner/cli.mjs', import.meta.url).pathname, 'log:show'], { env, encoding: 'utf8', timeout: 10000 });
    assert.notEqual(run.status, 0);
    assert.match(run.stderr, /missing settings: .*FIREBASE_API_KEY/);
    assert.doesNotMatch(run.stderr, /GITHUB_/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
