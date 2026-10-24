import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildPartPrompt, chooseKnown } from '../../server/texts/prompt.mjs';

const base = {
  code: 'ABCD-1', partNo: 1, of: 3, topic: 'a small café in Stockholm', newTopic: true,
  known: ['jag', 'du', 'kaffe', 'kafé', 'dricka'], reuse: ['kopp', 'paraply'], targetShare: 95,
  firmNew: false, shorter: false, summary: null, continueHint: false,
};

test('FR-201 RQ-182 RQ-183 RQ-40: a part prompt is plain English, needs no tool or file, asks for one JSON block and has the part code', () => {
  const p = buildPartPrompt(base);
  assert.match(p, /^I'm learning Swedish/);
  assert.match(p, /exactly one ```json code block/i);
  assert.match(p, /"part": "ABCD-1"/);
  assert.doesNotMatch(p, /upload|attach|browse|search the web|run code/i);
});

test('FR-202 RQ-186: it asks for 3 texts of about 130 words, 2–3 questions each, one sentence per line, English per line', () => {
  const p = buildPartPrompt(base);
  assert.match(p, /3 texts/);
  assert.match(p, /about 130 words/);
  assert.match(p, /2–3 comprehension questions/);
  assert.match(p, /one sentence per line/i);
  assert.match(p, /English translation for every line/i);
  assert.match(p, /part 1 of 3/i);
});

test('FR-204 RQ-184: it lists every field of the answer format', () => {
  const p = buildPartPrompt(base);
  for (const field of ['"part"', '"texts"', '"title"', '"lines"', '"sv"', '"en"', '"questions"', '"options"', '"answer"', '"new_words"', '"lemma"', '"explain_sv"', '"new_phrases"', '"inflections"', '"names"', '"starter_words"']) {
    assert.ok(p.includes(field), field);
  }
});

test('FR-208 RQ-28 RQ-172 RQ-33 RQ-64: it lists the known dictionary forms and asks for inflections and names', () => {
  const p = buildPartPrompt(base);
  assert.match(p, /jag, du, kaffe, kafé, dricka/);
  assert.match(p, /any inflection is fine/i);
  assert.match(p, /"inflections"/);
  assert.match(p, /Names of people and places/);
});

test('FR-208 RQ-28 RQ-33: the known words are capped at 1,500, topic words first, then most recently fallen, then by uses', () => {
  const ground = Array.from({ length: 3000 }, (_, i) => ({ lemma: `ord${i}`, uses: i % 7, fallen_at: i }));
  ground.push({ lemma: 'kaffe', uses: 0, fallen_at: 0 });
  const chosen = chooseKnown(ground, ['kaffe']);
  assert.equal(chosen.length, 1500);
  assert.equal(chosen[0], 'kaffe');
  assert.ok(chosen.includes('ord2999'), 'the most recently fallen come next');
});

test('FR-209 RQ-167 RQ-168: it states the target share and the one-new-item-per-sentence rule', () => {
  const p = buildPartPrompt({ ...base, targetShare: 96.5 });
  assert.match(p, /About 96\.5% of the words in each text must be known/);
  assert.match(p, /at most ONE new word or new fixed phrase per sentence/);
});

test('FR-210 RQ-50: it asks to reuse up to 10 leaves, most recent first', () => {
  assert.match(buildPartPrompt(base), /Please reuse these words I'm learning: kopp, paraply/);
  assert.doesNotMatch(buildPartPrompt({ ...base, reuse: [] }), /Please reuse/);
});

test('FR-208 RQ-28: SC-006 — with a 5,000-word ground the prompt stays under 16,000 characters', () => {
  const ground = Array.from({ length: 5000 }, (_, i) => ({ lemma: `långtord${i}`.slice(0, 9), uses: 0, fallen_at: i }));
  const p = buildPartPrompt({ ...base, known: chooseKnown(ground, []) });
  assert.ok(p.length < 16000, `${p.length} characters`);
});

test('FR-208 RQ-28: with an empty ground it asks for beginner texts built from starter words', () => {
  const p = buildPartPrompt({ ...base, known: [] });
  assert.match(p, /complete beginner/);
  assert.doesNotMatch(p, /Use my known words/);
});
