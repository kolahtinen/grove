import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { startTestGrove } from '../fakes/harness.mjs';
import { createAccount } from '../../server/owner/setup.mjs';

let t;
before(async () => { t = await startTestGrove(); });
after(() => t.close());

test('FR-023 RQ-371: after setup, sign-in, a failed sign-in, an agreement, a reset, an oversized request and a pasted AI answer, no log holds a password, token or body text', async () => {
  const deps = { db: t.grove.db, seclog: t.grove.seclog, firebase: t.grove.firebase };
  const ownerPw = 'Owner-secret-71!';
  const reviewerPw = 'Reviewer-secret-72!';
  await createAccount({ ...deps, role: 'owner', email: 'owner@example.test', password: ownerPw });
  await createAccount({ ...deps, role: 'reviewer', email: 'reviewer@example.test', password: reviewerPw });

  const captured = [];
  const write = process.stdout.write.bind(process.stdout);
  process.stdout.write = (chunk, ...rest) => { captured.push(String(chunk)); return write(chunk, ...rest); };
  const ewrite = process.stderr.write.bind(process.stderr);
  process.stderr.write = (chunk, ...rest) => { captured.push(String(chunk)); return ewrite(chunk, ...rest); };
  const idToken = t.fb.idTokenFor({ uid: 'x', email: 'reviewer@example.test' });
  const bodyText = 'Det var en gång en björn som läste en bok';
  try {
    const c = t.client();
    await c.signIn('reviewer@example.test', 'Wrong-secret-73!');
    await c.signInAgreed('reviewer@example.test', reviewerPw);
    await c.post('/api/reset', { email: 'reviewer@example.test' });
    await c.post('/api/signin', undefined, { raw: JSON.stringify({ email: 'x', password: bodyText.repeat(4000) }), headers: { 'content-type': 'application/json' } });
    await c.post('/api/signin', { email: 'reviewer@example.test', password: idToken });
    // A pasted AI answer (G-02) must not reach any log either.
    const p = await c.post('/api/prompt', { action: 'next' });
    await c.post('/api/answer', { exchangeId: p.body.exchangeId, answer: `{"part": "${p.body.code}", "texts": [{"title": "Loggtest", "lines": [{"sv": "${bodyText}.", "en": "x"}]}]}` });
    // An own text and an Explain note (G-03) must not reach any log either.
    const own = await c.post('/api/own-text', { title: 'Egen', text: `${bodyText} igen.` });
    const sentence = t.grove.db.prepare('SELECT id FROM sentences WHERE text_id = ?').get(own.body.id);
    await c.post('/api/explain', { sentenceId: sentence.id, form: 'björn', reason: 'other', note: 'Hemlig anteckning om björnen' });
  } finally {
    process.stdout.write = write;
    process.stderr.write = ewrite;
  }

  const logDir = join(t.config.dataDir, 'logs');
  const appLogs = readdirSync(logDir).map((name) => readFileSync(join(logDir, name), 'utf8')).join('\n');
  const security = JSON.stringify(t.grove.seclog.list());
  for (const [name, text] of [['app log', appLogs], ['security log', security], ['standard output', captured.join('')]]) {
    for (const secret of [ownerPw, reviewerPw, 'Wrong-secret-73!', idToken, bodyText, 'Hemlig anteckning om björnen']) {
      assert.ok(!text.includes(secret), `${name} holds a secret`);
    }
  }
  assert.ok(security.includes('signin_failed') && security.includes('reset_requested') && security.includes('terms_agreed'));
});
