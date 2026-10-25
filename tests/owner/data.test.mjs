import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startTestGrove } from '../fakes/harness.mjs';
import { createAccount } from '../../server/owner/setup.mjs';
import { exportAccount, deleteAccount } from '../../server/owner/data.mjs';
import { formatLog } from '../../server/owner/log.mjs';

let t;
let deps;
before(async () => {
  t = await startTestGrove();
  deps = { db: t.grove.db, seclog: t.grove.seclog, firebase: t.grove.firebase };
});
after(() => t.close());

test('FR-017 RQ-229: learner:export writes JSON with the account and every row that references it', async () => {
  await createAccount({ ...deps, role: 'reviewer', email: 'reviewer@example.test', password: 'Forest-walk-42' });
  const c = t.client();
  await c.signInAgreed('reviewer@example.test', 'Forest-walk-42');
  const data = exportAccount({ ...deps, email: 'reviewer@example.test' });
  const json = JSON.parse(JSON.stringify(data));
  assert.equal(json.account.email, 'reviewer@example.test');
  assert.ok(Array.isArray(json.tables.sessions) && json.tables.sessions.length === 1);
  assert.ok(json.tables.sessions[0].terms_agreed_at > 0);
  assert.equal(json.tables.sessions[0].id_hash, undefined, 'session secrets are not exported');
  assert.equal(json.tables.sessions[0].csrf_token, undefined);
  assert.ok(t.grove.seclog.list({ event: 'export' }).length === 1);
});

test('FR-017 RQ-229: learner:delete removes the account, its sessions and its rows in grove, and the Firebase user; its session is then signed out', async () => {
  const c = t.client();
  await c.signInAgreed('reviewer@example.test', 'Forest-walk-42');
  const { id } = t.grove.db.prepare('SELECT id FROM accounts WHERE email = ?').get('reviewer@example.test');
  await deleteAccount({ ...deps, email: 'reviewer@example.test' });
  assert.equal(t.grove.db.prepare('SELECT COUNT(*) AS n FROM accounts WHERE id = ?').get(id).n, 0);
  for (const { name } of t.grove.db.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all()) {
    if (name === 'security_log') continue; // kept 30 days with no foreign key (data-model.md)
    const cols = t.grove.db.prepare(`PRAGMA table_info("${name}")`).all().map((col) => col.name);
    if (cols.includes('account_id')) assert.equal(t.grove.db.prepare(`SELECT COUNT(*) AS n FROM "${name}" WHERE account_id = ?`).get(id).n, 0, name);
  }
  assert.ok(!t.fb.users.has('reviewer@example.test'), 'gone from Firebase');
  assert.equal((await c.get('/api/me')).status, 401);
  assert.ok(t.grove.seclog.list({ event: 'delete' }).some((r) => r.account_id === id));
});

test('FR-017 RQ-229: export and delete of an unknown address fail plainly', async () => {
  assert.throws(() => exportAccount({ ...deps, email: 'nobody@example.test' }), /no account/);
  await assert.rejects(deleteAccount({ ...deps, email: 'nobody@example.test' }), /no account/);
});

test('FR-023 RQ-371: log:show prints entries filtered by event and hours', () => {
  const all = formatLog(t.grove.seclog.list({ sinceMs: 0 }));
  assert.match(all, /delete/);
  const only = formatLog(t.grove.seclog.list({ sinceMs: Date.now() - 3600000, event: 'export' }));
  assert.match(only, /export/);
  assert.doesNotMatch(only, /delete/);
});

test('FR-220 FR-319 FR-419 RQ-54 RQ-155: export includes texts, words, flags, reports, reviews and minutes, and delete leaves no G-02…G-04 rows (constitution 3.2, 3.3)', async () => {
  const { seedGround } = await import('../fakes/harness.mjs');
  const { readFileSync } = await import('node:fs');
  await createAccount({ ...deps, role: 'reviewer', email: 'texts@example.test', password: 'Forest-walk-42' });
  const { id } = t.grove.db.prepare('SELECT id FROM accounts WHERE email = ?').get('texts@example.test');
  seedGround(t.grove.db, id, readFileSync(new URL('../../docs/middle/ai-test/known.txt', import.meta.url), 'utf8').split(/\s+/).filter(Boolean));
  const c = t.client();
  await c.signInAgreed('texts@example.test', 'Forest-walk-42');
  const p = await c.post('/api/prompt', { action: 'next' });
  const good = readFileSync(new URL('../texts/answers/good.json', import.meta.url), 'utf8').replaceAll('TEST-1', p.body.code);
  assert.equal((await c.post('/api/answer', { exchangeId: p.body.exchangeId, answer: good })).body.result, 'accepted');
  const texts = (await c.get('/api/home')).body.texts;
  await c.post('/api/rating', { textId: texts[0].id, value: 'most' });
  // G-03 data: a name and meanings came with the answer; add a flag, a report and an own text.
  const sentence = t.grove.db.prepare('SELECT id FROM sentences WHERE account_id = ? LIMIT 1').get(id);
  await c.post('/api/explain', { sentenceId: sentence.id, form: 'kaffe', reason: 'other' });
  await c.post('/api/report', { textId: texts[0].id, questionPosition: 0, reason: 'other' });
  await c.post('/api/own-text', { title: 'Egen', text: 'Hej på dig.' });
  // G-04 data: a mark with a review answer, and input minutes.
  await c.post('/api/marks', { lemma: 'kopp', read: true, remember: false });
  await c.post('/api/review', { lemma: 'kopp', mode: 'read', right: true });
  await c.post('/api/input', { seconds: 30, day: new Date().toISOString().slice(0, 10) });

  const data = exportAccount({ ...deps, email: 'texts@example.test' });
  for (const table of ['words', 'texts', 'text_lines', 'questions', 'sentences', 'ratings', 'packages', 'exchanges', 'learner_settings', 'names', 'word_meanings', 'explain_flags', 'reports', 'review_answers', 'input_days']) {
    assert.ok(data.tables[table]?.length > 0, `export has ${table}`);
  }
  await deleteAccount({ ...deps, email: 'texts@example.test' });
  for (const table of ['words', 'word_forms', 'texts', 'text_lines', 'questions', 'sentences', 'ratings', 'question_answers', 'packages', 'exchanges', 'learner_settings', 'names', 'word_meanings', 'pattern_places', 'explain_flags', 'explanations', 'reports', 'review_answers', 'input_days']) {
    assert.equal(t.grove.db.prepare(`SELECT COUNT(*) AS n FROM "${table}" WHERE account_id = ?`).get(id).n, 0, table);
  }
});

test('FR-017 RQ-229: if Firebase can’t be reached, learner:delete fails with grove’s data untouched, and can be run again', async () => {
  await createAccount({ ...deps, role: 'reviewer', email: 'retry@example.test', password: 'Forest-walk-42' });
  const { id } = t.grove.db.prepare('SELECT id FROM accounts WHERE email = ?').get('retry@example.test');
  const c = t.client();
  await c.signInAgreed('retry@example.test', 'Forest-walk-42');
  const deletions = t.grove.seclog.list({ event: 'delete' }).length; // account IDs can be reused, so count
  t.fb.state.unreachable = true;
  try {
    await assert.rejects(deleteAccount({ ...deps, email: 'retry@example.test' }));
  } finally {
    t.fb.state.unreachable = false;
  }
  assert.equal(t.grove.db.prepare('SELECT COUNT(*) AS n FROM accounts WHERE id = ?').get(id).n, 1, 'account kept');
  assert.equal(t.grove.db.prepare('SELECT COUNT(*) AS n FROM sessions WHERE account_id = ?').get(id).n, 1, 'session kept');
  assert.equal(t.grove.seclog.list({ event: 'delete' }).length, deletions, 'no deletion logged');
  await deleteAccount({ ...deps, email: 'retry@example.test' });
  assert.equal(t.grove.db.prepare('SELECT COUNT(*) AS n FROM accounts WHERE id = ?').get(id).n, 0);
  assert.ok(!t.fb.users.has('retry@example.test'));
});

test('FR-017 RQ-229: learner:delete finishes when Firebase no longer has the account', async () => {
  await createAccount({ ...deps, role: 'reviewer', email: 'half@example.test', password: 'Forest-walk-42' });
  const { id } = t.grove.db.prepare('SELECT id FROM accounts WHERE email = ?').get('half@example.test');
  t.fb.users.delete('half@example.test');
  await deleteAccount({ ...deps, email: 'half@example.test' });
  assert.equal(t.grove.db.prepare('SELECT COUNT(*) AS n FROM accounts WHERE id = ?').get(id).n, 0);
  assert.equal(t.grove.db.prepare('SELECT COUNT(*) AS n FROM words WHERE account_id = ?').get(id).n, 0);
});
