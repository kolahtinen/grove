import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lexiconLoad, meaning } from '../../server/lexicon/lexicon.mjs';

// Runs in its own process, so the word list starts unloaded.
test('FR-222 FR-032 RQ-407: a lookup before the start-up load has finished finishes it at once', () => {
  const load = lexiconLoad();
  const steps = load.steps();
  const first = steps.next();
  assert.equal(first.done, false);
  assert.ok(first.value > 0 && first.value <= 10000);
  assert.equal(meaning('läser').lemma, 'läsa');
  assert.equal(meaning('läsa').en, 'to read');
});

test('FR-222 FR-032 RQ-407: the word list loads in steps of at most 10,000 lines that add up to its size, and gives the same meanings', () => {
  const load = lexiconLoad();
  assert.equal(load.name, 'word list');
  assert.ok(load.size > 290000, `${load.size} lines`);
  let total = 0;
  for (const n of load.steps()) {
    assert.ok(n > 0 && n <= 10000, `a step of ${n}`);
    total += n;
  }
  assert.equal(total, load.size);
  assert.deepEqual(meaning('läsa'), { lemma: 'läsa', en: 'to read' });
  assert.equal(meaning('qwxzy'), null);
});
