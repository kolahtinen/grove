// Shared set-up for the reading tests: a learner with the X-03 ground and the sample answer with patterns.
import { readFileSync } from 'node:fs';
import { startTestGrove, seedGround } from '../fakes/harness.mjs';

export const KNOWN = readFileSync(new URL('../../docs/middle/ai-test/known.txt', import.meta.url), 'utf8').split(/\s+/).filter(Boolean);
export const ANSWER = readFileSync(new URL('../texts/answers/good-patterns.json', import.meta.url), 'utf8');

export async function readingGrove() {
  const t = await startTestGrove();
  const learner = t.seedAccount({ email: 'learner@example.test' });
  seedGround(t.grove.db, learner.id, KNOWN);
  const other = t.seedAccount({ email: 'other@example.test' });
  seedGround(t.grove.db, other.id, KNOWN);
  return { t, learner, other };
}

export async function signedIn(t, email = 'learner@example.test') {
  const c = t.client();
  await c.signInAgreed(email);
  return c;
}

// Asks for the next part and pastes an answer (by default the sample with patterns) into it.
export async function addPart(c, answer = ANSWER, tweak = (a) => a) {
  const p = await c.post('/api/prompt', { action: 'next' });
  const json = tweak(JSON.parse(answer.replaceAll('TEST-1', p.body.code)));
  const res = await c.post('/api/answer', { exchangeId: p.body.exchangeId, answer: JSON.stringify(json) });
  return { prompt: p.body, res: res.body };
}

export const textId = (t, accountId, title) => t.grove.db.prepare('SELECT id FROM texts WHERE account_id = ? AND title = ? ORDER BY id DESC').get(accountId, title).id;

// The tokens of the reading payload, flattened.
export const tokensOf = (reading) => reading.lines.flatMap((l) => l.sentences.flatMap((s) => s.tokens));
