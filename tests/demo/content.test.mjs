import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateAnswer } from '../../server/texts/schema.mjs';
import { checkAnswer } from '../../server/texts/check.mjs';
import { createCounter } from '../../server/words/count.mjs';
import { DEMO_ANSWER, DEMO_GROUND } from '../../server/demo/apply.mjs';

const raw = readFileSync(new URL('../../server/demo/demo-answer.json', import.meta.url), 'utf8');

test('FR-702 RQ-361: the demo has the four texts with questions, new words with meanings, the phrases and names; the slips are fixed', () => {
  const a = JSON.parse(raw);
  assert.deepEqual(a.texts.map((x) => x.title), ['En kall morgon', 'Brevet i väskan', 'Lördag på torget', 'Den borttappade nyckeln']);
  assert.ok(a.texts.every((x) => x.questions.length >= 2));
  assert.ok(a.new_words.length >= 5 && a.new_words.every((w) => w.en && w.explain_sv));
  assert.deepEqual(a.new_phrases.map((p) => p.sv), ['hur mår du', 'det gör inget']);
  assert.ok(a.names.includes('Elsa'));
  assert.ok(a.texts[2].lines.every((l) => /^[A-ZÅÄÖ][a-zåäö]+: /.test(l.sv)), 'dialogue lines start with a speaker');
  for (const slip of ['har glömt min väska här igår', 'Den borta nyckeln', 'Vem heter Olle']) assert.ok(!raw.includes(slip), slip);
});

test('FR-703 RQ-361: the demo passes grove\'s schema and answer checks against the demo ground', () => {
  const v = validateAnswer(DEMO_ANSWER);
  assert.equal(v.ok, true, JSON.stringify(v.problems));
  const counter = createCounter({
    ground: new Set(DEMO_GROUND),
    forms: new Map(v.value.inflections.map((i) => [i.form, [i.lemma]])),
    phrases: v.value.new_phrases.map((p) => ({ words: p.sv.split(' '), lemma: p.sv, known: false })),
    names: new Set(v.value.names.map((n) => n.toLowerCase())),
  });
  const result = checkAnswer(v.value, counter, 95);
  assert.equal(result.ok, true, JSON.stringify(result.problems));
});

test('FR-707 RQ-361: nothing in the demo is HTML', () => {
  assert.doesNotMatch(raw, /<[a-z!/]/i);
});
