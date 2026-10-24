import { test } from 'node:test';
import assert from 'node:assert/strict';
import { strength, isDue, isFading, answer, START_GAP } from '../../server/drill/schedule.mjs';

const DAY = 24 * 60 * 60 * 1000;

test('FR-403 RQ-170: strength is 2^(−days since last review ÷ gap)', () => {
  const item = { drilled: 1, gap_days: 2, last_review_at: 0 };
  assert.equal(strength(item, 0), 1);
  assert.equal(strength(item, 2 * DAY), 0.5);
  assert.equal(strength(item, 4 * DAY), 0.25);
});

test('FR-403 RQ-169 RQ-170: ground items and unmarked leaves have no strength and never fade', () => {
  assert.equal(strength({ drilled: 0, state: 'ground' }, 100 * DAY), null);
  assert.equal(strength({ drilled: 0, state: 'leaf' }, 100 * DAY), null);
  assert.equal(isFading({ drilled: 0, state: 'ground' }, 100 * DAY), false);
});

test('FR-404 RQ-79: due at strength 0.5 or less, fading below 0.2', () => {
  const item = { drilled: 1, gap_days: 1, last_review_at: 0 };
  assert.equal(isDue(item, 0.9 * DAY), false);
  assert.equal(isDue(item, 1 * DAY), true);
  assert.equal(isFading(item, 2.3 * DAY), false);
  assert.equal(isFading(item, 2.4 * DAY), true);
});

test('FR-405 RQ-60 RQ-200: right answers take the gap 1 → 2.5 → 6.25 and the third right answer falls (SC-002)', () => {
  assert.equal(START_GAP, 1);
  let item = { drilled: 1, gap_days: START_GAP, last_review_at: 0 };
  let r = answer(item, true, DAY);
  assert.deepEqual(r, { gap: 2.5, fell: false });
  item = { ...item, gap_days: r.gap };
  r = answer(item, true, 4 * DAY);
  assert.deepEqual(r, { gap: 6.25, fell: false });
  item = { ...item, gap_days: r.gap };
  r = answer(item, true, 11 * DAY);
  assert.equal(r.fell, true);
});

test('FR-405 RQ-170: a wrong answer halves the gap, never below half a day', () => {
  assert.deepEqual(answer({ drilled: 1, gap_days: 6.25 }, false, 0), { gap: 3.125, fell: false });
  assert.deepEqual(answer({ drilled: 1, gap_days: 0.6 }, false, 0), { gap: 0.5, fell: false });
});
