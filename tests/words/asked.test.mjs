import { test } from 'node:test';
import assert from 'node:assert/strict';
import { askedForms } from '../../server/words/asked.mjs';

test('FR-207 RQ-379 RQ-398: the forms a prompt asks about are stored trimmed, in lower case, without repeats, in the order first asked', () => {
  assert.deepEqual(askedForms([' Tolv', 'pensionär ', 'TOLV', '', 'Paraply', 'paraply']), ['tolv', 'pensionär', 'paraply']);
});
