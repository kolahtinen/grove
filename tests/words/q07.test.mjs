import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createCounter } from '../../server/words/count.mjs';

const known = new Set(readFileSync(new URL('../../docs/middle/ai-test/known.txt', import.meta.url), 'utf8').split(/\s+/).filter(Boolean));
const set = JSON.parse(readFileSync(new URL('./q07-sentences.json', import.meta.url), 'utf8'));
const baseline = JSON.parse(readFileSync(new URL('./q07-baseline.json', import.meta.url), 'utf8'));

test('FR-213 RQ-28: Q-07 score on the 50-sentence set does not drop below the baseline', () => {
  assert.equal(set.sentences.length, 50);
  let right = 0;
  const wrong = [];
  for (const item of set.sentences) {
    const counter = createCounter({ ground: known, forms: new Map(), phrases: [], names: new Set(item.names || []) });
    const got = counter.countSentence(item.sv).items.map((i) => i.text).sort();
    const want = [...item.new].sort();
    if (JSON.stringify(got) === JSON.stringify(want)) right += 1;
    else wrong.push(`${item.sv} → got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`);
  }
  console.log(`Q-07 score: ${right} of ${set.sentences.length} (baseline ${baseline.score})`);
  if (wrong.length) console.log(`Q-07 misses:\n  ${wrong.join('\n  ')}`);
  assert.ok(right >= baseline.score, `score ${right} fell below the baseline ${baseline.score}`);
});
