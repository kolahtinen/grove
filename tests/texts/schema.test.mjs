import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateAnswer, validateMeanings } from '../../server/texts/schema.mjs';

const load = (name) => JSON.parse(readFileSync(new URL(`./answers/${name}`, import.meta.url), 'utf8'));

test('FR-205 RQ-41 RQ-184: a good answer passes the format', () => {
  const result = validateAnswer(load('good.json'));
  assert.equal(result.ok, true, JSON.stringify(result.problems));
  assert.equal(result.value.texts.length, 3);
  assert.equal(result.value.part, 'TEST-1');
});

test('FR-205 RQ-41: the harmless fields the AIs add are dropped silently; any other unknown field is refused', () => {
  const harmless = validateAnswer(load('extra-fields-harmless.json'));
  assert.equal(harmless.ok, true, JSON.stringify(harmless.problems));
  assert.equal(harmless.value.texts[0].kind, undefined);
  assert.equal(harmless.value.texts[0].lines[0].speaker, undefined);
  const unknown = validateAnswer(load('extra-fields.json'));
  assert.equal(unknown.ok, false);
  assert.match(unknown.problems.join('\n'), /admin/);
});

test('FR-205 RQ-41 RQ-184: answers beyond the limits are refused with a named problem', () => {
  const good = load('good.json');
  const cases = {
    'five texts': load('huge.json'),
    'no texts': { ...good, texts: [] },
    '61 lines': { ...good, texts: [{ ...good.texts[0], lines: Array(61).fill({ sv: 'Hej.', en: 'Hi.' }) }] },
    '401-character line': { ...good, texts: [{ ...good.texts[0], lines: [{ sv: 'a'.repeat(401), en: 'x' }] }] },
    'four options': { ...good, texts: [{ ...good.texts[0], questions: [{ q: 'Vad?', options: ['a', 'b', 'c', 'd'], answer: 0 }] }] },
    'answer out of range': { ...good, texts: [{ ...good.texts[0], questions: [{ q: 'Vad?', options: ['a', 'b'], answer: 2 }] }] },
    '201 new words': { ...good, new_words: Array(201).fill(good.new_words[0]) },
    'wrong type': { ...good, names: 'Elsa' },
    'missing part': (() => { const c = { ...good }; delete c.part; return c; })(),
    'line without sv': { ...good, texts: [{ ...good.texts[0], lines: [{ en: 'x' }] }] },
  };
  for (const [name, answer] of Object.entries(cases)) {
    const result = validateAnswer(answer);
    assert.equal(result.ok, false, name);
    assert.ok(result.problems.length > 0 && result.problems.every((p) => typeof p === 'string' && p.length < 300), name);
  }
});

test('FR-207 RQ-379: the meanings answer has its own small format', () => {
  assert.equal(validateMeanings({ meanings: [{ form: 'säljer', lemma: 'sälja', en: 'sells', explain_sv: 'Man ger något för pengar.' }] }).ok, true);
  assert.equal(validateMeanings({ meanings: [{ form: 'säljer' }] }).ok, false);
  assert.equal(validateMeanings({ texts: [] }).ok, false);
});
