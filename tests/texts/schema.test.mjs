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
  assert.equal(harmless.value.texts[0].series, undefined);
  assert.equal(harmless.value.texts[0].kind, 'reading', 'kind is a real field now (FR-204)');
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

test('FR-204 FR-205 RQ-393 RQ-394 RQ-398: each text has a kind, reading or listening; a whole package takes up to 12 texts naming their part; meaning checks pass within their limits', () => {
  const good = load('good.json');
  const without = structuredClone(good);
  delete without.texts[0].kind;
  assert.equal(validateAnswer(without).ok, false);
  assert.equal(validateAnswer({ ...good, texts: [{ ...good.texts[0], kind: 'song' }] }).ok, false);
  const nine = [1, 2, 3].flatMap((part) => good.texts.map((x) => ({ ...x, part })));
  assert.equal(validateAnswer({ ...good, texts: nine }, { whole: true }).ok, true);
  assert.equal(validateAnswer({ ...good, texts: nine }).ok, false, 'a part takes at most 4');
  assert.equal(validateAnswer({ ...good, texts: [...nine, ...nine] }, { whole: true }).ok, false);
  assert.equal(validateAnswer({ ...good, texts: [{ ...good.texts[0], part: 4 }] }, { whole: true }).ok, false);
  const check = { form: 'var', lemma: 'var', en: 'where', explain_sv: 'Vilken plats.' };
  assert.equal(validateAnswer({ ...good, meaning_checks: [check] }).ok, true);
  assert.equal(validateAnswer({ ...good, meaning_checks: Array(101).fill(check) }).ok, false);
});

test('FR-207 RQ-379: the meanings answer has its own small format', () => {
  assert.equal(validateMeanings({ meanings: [{ form: 'säljer', lemma: 'sälja', en: 'sells', explain_sv: 'Man ger något för pengar.' }] }).ok, true);
  assert.equal(validateMeanings({ meanings: [{ form: 'säljer' }] }).ok, false);
  assert.equal(validateMeanings({ texts: [] }).ok, false);
});

test('FR-307 RQ-29 RQ-177: patterns, explanations and fixes pass within their limits and are refused beyond them', () => {
  const good = load('good.json');
  const ok = validateAnswer({ ...good,
    patterns: [{ name: 'har + supine', explain_en: 'past', places: [{ text: 2, line: 9, words: 'har han glömt' }] }],
    explanations: [{ code: 'E1', explain_en: 'Plural definite.' }],
    fixes: [{ code: 'R1', q: 'Vad?', options: ['a', 'b'], answer: 1 }, { code: 'R2', sv: 'Hej.', en: 'Hi.' }] });
  assert.equal(ok.ok, true, JSON.stringify(ok.problems));
  assert.equal(ok.value.patterns[0].places[0].words, 'har han glömt');
  const pattern = { name: 'p', explain_en: 'x', places: [] };
  const bad = {
    '21 patterns': { patterns: Array(21).fill(pattern) },
    'place in text 5': { patterns: [{ ...pattern, places: [{ text: 5, line: 1, words: 'x' }] }] },
    'long explanation': { explanations: [{ code: 'E1', explain_en: 'x'.repeat(501) }] },
    'fix with 4 options': { fixes: [{ code: 'R1', q: 'Q', options: ['a', 'b', 'c', 'd'], answer: 0 }] },
    'fix with nothing': { fixes: [{ code: 'R1' }] },
  };
  for (const [name, extra] of Object.entries(bad)) assert.equal(validateAnswer({ ...good, ...extra }).ok, false, name);
});
