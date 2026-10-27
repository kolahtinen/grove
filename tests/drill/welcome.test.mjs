import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { drillGrove } from './helpers.mjs';
import { openDb } from '../../server/store/db.mjs';
import { join } from 'node:path';

let t;
let learner;
let c;
before(async () => { ({ t, learner, c } = await drillGrove()); });
after(() => t.close());

test('FR-416 RQ-73: the welcome shows until dismissed, per account', async () => {
  assert.equal((await c.get('/api/stages')).body.welcome, true);
  assert.deepEqual((await c.post('/api/welcome', {})).body, { result: 'dismissed' });
  assert.equal((await c.get('/api/stages')).body.welcome, false);
  const other = t.client();
  await other.signInAgreed('other@example.test');
  assert.equal((await other.get('/api/stages')).body.welcome, true);
});

test('FR-417 FR-418 RQ-75: marks, schedules and minutes are on disk as soon as grove confirms them', async () => {
  await c.post('/api/marks', { lemma: 'kopp', remember: true });
  await c.post('/api/input', { seconds: 30, day: new Date().toISOString().slice(0, 10) });
  // A second connection to the same file sees the committed state, as grove would after a restart.
  const db = openDb(join(t.config.dataDir, 'grove.db'));
  try {
    const kopp = db.prepare("SELECT drilled, to_read, to_remember, gap_days FROM words WHERE account_id = ? AND lemma = 'kopp'").get(learner.id);
    assert.deepEqual({ ...kopp }, { drilled: 1, to_read: 0, to_remember: 1, gap_days: 1 });
    assert.equal(db.prepare('SELECT seconds FROM input_days WHERE account_id = ?').get(learner.id).seconds, 30);
    assert.equal(db.prepare('SELECT welcome_dismissed FROM learner_settings WHERE account_id = ?').get(learner.id).welcome_dismissed, 1);
  } finally {
    db.close();
  }
});
