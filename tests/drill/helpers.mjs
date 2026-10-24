// Shared set-up for the drill tests: a learner with the X-03 ground and the G-03 sample answer, and a
// clock the tests can move.
import { readFileSync } from 'node:fs';
import { startTestGrove, seedGround } from '../fakes/harness.mjs';

export const KNOWN = readFileSync(new URL('../../docs/middle/ai-test/known.txt', import.meta.url), 'utf8').split(/\s+/).filter(Boolean);
export const ANSWER = readFileSync(new URL('../texts/answers/good-patterns.json', import.meta.url), 'utf8');
export const DAY = 24 * 60 * 60 * 1000;

export async function drillGrove() {
  const clock = { now: Date.now() };
  const t = await startTestGrove({ now: () => clock.now });
  const learner = t.seedAccount({ email: 'learner@example.test' });
  seedGround(t.grove.db, learner.id, KNOWN);
  const other = t.seedAccount({ email: 'other@example.test' });
  seedGround(t.grove.db, other.id, KNOWN);
  const c = t.client();
  await c.signInAgreed('learner@example.test');
  const p = await c.post('/api/prompt', { action: 'next' });
  const res = await c.post('/api/answer', { exchangeId: p.body.exchangeId, answer: ANSWER.replaceAll('TEST-1', p.body.code) });
  if (res.body.result !== 'accepted') throw new Error(JSON.stringify(res.body));
  const texts = Object.fromEntries(res.body.texts.map((x) => [x.title, x.id]));
  return { t, learner, other, c, clock, texts };
}

export const word = (t, accountId, lemma, kind = 'word') =>
  t.grove.db.prepare('SELECT * FROM words WHERE account_id = ? AND lemma = ? AND kind = ?').get(accountId, lemma, kind);
