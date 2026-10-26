import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { startTestGrove, seedGround } from '../fakes/harness.mjs';

const known = readFileSync(new URL('../../docs/middle/ai-test/known.txt', import.meta.url), 'utf8').split(/\s+/).filter(Boolean);

// A grove whose sizes are tuned as the environment settings would tune them (GROVE_PART_READING=1,
// GROVE_TEXT_WORDS=70, GROVE_SETUP_CHUNK_WORDS=100, GROVE_OWN_PIECE_CHARS=200).
const t = await startTestGrove({ sizes: { partReading: 1, textWords: 70, setupChunkWords: 100, ownPieceChars: 200 } });
after(() => t.close());

test('FR-202 RQ-392: the size settings reach the prompts: texts per part, words per text and words per setup prompt', async () => {
  const learner = t.seedAccount({ email: 'sizes@example.test' });
  seedGround(t.grove.db, learner.id, known);
  const c = t.client();
  await c.signInAgreed('sizes@example.test');
  const p = (await c.post('/api/prompt', { action: 'next' })).body;
  assert.match(p.prompt, /1 reading text and 1 listening text, each about 70 words/);
  const words = p.steps.slice(1).map((step) => step.split('\n\n').at(-1).split(', ').length);
  assert.ok(words.length >= 2, `${words.length} word messages`);
  assert.ok(words.every((n) => n <= 100), words.join(' '));
});

test('FR-202 FR-318 RQ-392 RQ-400: the own-text piece size setting reaches the own-text round', async () => {
  t.seedAccount({ email: 'own-sizes@example.test' });
  const c = t.client();
  await c.signInAgreed('own-sizes@example.test');
  const text = Array.from({ length: 12 }, () => 'Jag dricker kaffe på ett kafé.').join(' ');
  const res = (await c.post('/api/own-text', { title: 'Kort', text })).body;
  assert.ok(res.of >= 2, `${res.of} pieces of a ${text.length}-character text`);
});
