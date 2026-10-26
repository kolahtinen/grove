import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildSetup, buildRequest, chooseKnown } from '../../server/texts/prompt.mjs';

const setupBase = { targetShare: 95, summary: null, known: ['jag', 'du', 'kaffe', 'kafé', 'dricka'], chunkWords: 500 };
const asks = [{ part: 1, kind: 'reading' }, { part: 1, kind: 'reading' }, { part: 1, kind: 'listening' }];
const requestBase = {
  code: 'ABCD-1', partNo: 1, of: 3, asks, textWords: 90, topic: 'a small café in Stockholm', newTopic: true,
  reuse: ['kopp', 'paraply'], firmNew: false, shorter: false, checks: [], continueHint: false, whole: false,
};
const all = (steps, request) => [...steps, request].join('\n\n');

test('FR-201 FR-203 RQ-182 RQ-183 RQ-40 RQ-390: the setup and the request are plain English, need no tool or file; the setup asks for "OK" only, the request for one JSON block with its code', () => {
  const steps = buildSetup(setupBase);
  const request = buildRequest(requestBase);
  assert.match(steps[0], /^I'm learning Swedish/);
  for (const step of steps) assert.match(step, /reply only with "OK"|Reply only "OK"|Reply "OK"/i);
  assert.match(request, /exactly one ```json code block|only the JSON block/i);
  assert.match(request, /"ABCD-1"/);
  assert.doesNotMatch(all(steps, request), /upload|attach|browse|search the web|run code/i);
});

test('FR-202 RQ-186 RQ-393 RQ-392: the request asks for the part\'s reading and listening texts at the size setting; listening texts are written to be heard', () => {
  const request = buildRequest(requestBase);
  assert.match(request, /2 reading texts and 1 listening text/);
  assert.match(request, /about 90 words/);
  assert.match(request, /part 1 of 3/i);
  const steps = buildSetup(setupBase);
  assert.match(steps[0], /2–3 comprehension questions/);
  assert.match(steps[0], /one sentence per line/i);
  assert.match(steps[0], /English translation for every line/i);
  assert.match(steps[0], /written to be heard/);
  assert.match(buildRequest({ ...requestBase, asks: [{ part: 1, kind: 'listening' }], textWords: 70 }), /1 listening text, about 70 words/);
});

test('FR-204 RQ-184 RQ-393 RQ-398: the setup gives every field of the answer format', () => {
  const p = buildSetup(setupBase)[0];
  for (const field of ['"part"', '"texts"', '"kind"', '"title"', '"lines"', '"sv"', '"en"', '"questions"', '"options"', '"answer"', '"new_words"', '"lemma"', '"explain_sv"', '"new_phrases"', '"inflections"', '"names"', '"meaning_checks"', '"starter_words"']) {
    assert.ok(p.includes(field), field);
  }
});

test('FR-208 RQ-28 RQ-172 RQ-33 RQ-64 RQ-390: the setup lists the known dictionary forms over prompts of at most the chunk size, each once, and asks for inflections and names', () => {
  const known = Array.from({ length: 1200 }, (_, i) => `ord${i}`);
  const steps = buildSetup({ ...setupBase, known, chunkWords: 500 });
  assert.equal(steps.length, 4, 'rules and format, then 3 word messages');
  assert.match(steps[1], /message 1 of 3/);
  const listed = steps.slice(1).flatMap((s) => s.split('\n\n').at(-1).split(', '));
  assert.deepEqual(listed, known);
  for (const s of steps.slice(1)) assert.ok(s.split('\n\n').at(-1).split(', ').length <= 500);
  assert.match(steps[0], /any inflection is fine/i);
  assert.match(steps[0], /"inflections"/);
  assert.match(steps[0], /Names of people and places/);
});

test('FR-208 RQ-28 RQ-33 RQ-392: the known words are capped at the setting, topic words first, then most recently fallen, then by uses', () => {
  const ground = Array.from({ length: 5000 }, (_, i) => ({ lemma: `ord${i}`, uses: i % 7, fallen_at: i }));
  ground.push({ lemma: 'kaffe', uses: 0, fallen_at: 0 });
  const chosen = chooseKnown(ground, ['kaffe'], 3000);
  assert.equal(chosen.length, 3000);
  assert.equal(chosen[0], 'kaffe');
  assert.ok(chosen.includes('ord4999'), 'the most recently fallen come next');
});

test('FR-209 RQ-167 RQ-168: the setup states the target share and the one-new-item-per-sentence rule', () => {
  const p = buildSetup({ ...setupBase, targetShare: 96.5 })[0];
  assert.match(p, /About 96\.5% of the words in each text must be known/);
  assert.match(p, /at most ONE new word or new fixed phrase per sentence/);
});

test('FR-210 FR-203 RQ-50: each request asks to reuse up to 10 leaves', () => {
  assert.match(buildRequest(requestBase), /Please reuse these words I'm learning: kopp, paraply/);
  assert.doesNotMatch(buildRequest({ ...requestBase, reuse: [] }), /Please reuse/);
});

test('FR-207 FR-203 RQ-398: a request carries the dictionary meanings to check, each with its sentence', () => {
  const r = buildRequest({ ...requestBase, checks: [{ form: 'var', sentence: 'Var bor du?', en: 'where' }] });
  assert.match(r, /"meaning_checks"/);
  assert.match(r, /var — "Var bor du\?" — dictionary: where/);
  assert.doesNotMatch(buildRequest(requestBase), /meaning_checks/);
});

test('FR-203 RQ-390 RQ-188: a later part\'s request is short and asks to continue the story; the summary is in the setup only', () => {
  const later = buildRequest({ ...requestBase, code: 'ABCD-2', partNo: 2, continueHint: true, newTopic: false });
  assert.match(later, /continue the story and characters/i);
  assert.doesNotMatch(later, /What I did since/);
  const steps = buildSetup({ ...setupBase, summary: '- "En kall morgon": understood most; questions right 2 of 3' });
  assert.match(steps[0], /What I did since my last package:\n- "En kall morgon"/);
});

test('FR-203 RQ-394: a whole-package request asks for every part, each text naming its part, under the package code', () => {
  const whole = [1, 2, 3].flatMap((part) => [{ part, kind: 'reading' }, { part, kind: 'reading' }, { part, kind: 'listening' }]);
  const r = buildRequest({ ...requestBase, code: 'ABCD', asks: whole, whole: true });
  assert.match(r, /all 3 parts/);
  assert.match(r, /part 1: 2 reading texts and 1 listening text/);
  assert.match(r, /part 3: 2 reading texts and 1 listening text/);
  assert.match(r, /"part": 1/);
  assert.match(r, /"ABCD"/);
});

test('FR-208 RQ-28: SC-006 — with a 5,000-word ground no setup prompt holds more than the chunk size, and a request stays under 4,000 characters', () => {
  const ground = Array.from({ length: 5000 }, (_, i) => ({ lemma: `långtord${i}`.slice(0, 9), uses: 0, fallen_at: i }));
  const steps = buildSetup({ ...setupBase, known: chooseKnown(ground, [], 3000), chunkWords: 500 });
  for (const s of steps.slice(1)) assert.ok(s.split('\n\n').at(-1).split(', ').length <= 500);
  const checks = Array.from({ length: 20 }, (_, i) => ({ form: `ord${i}`, sentence: 'Det här är en ganska lång mening om ett ord.', en: 'a word' }));
  const r = buildRequest({ ...requestBase, checks, reuse: Array.from({ length: 10 }, (_, i) => `löv${i}`) });
  assert.ok(r.length < 4000, `${r.length} characters`);
});

test('FR-208 RQ-28: with an empty ground the setup asks for beginner texts built from starter words, with no word messages', () => {
  const steps = buildSetup({ ...setupBase, known: [] });
  assert.equal(steps.length, 1);
  assert.match(steps[0], /complete beginner/);
  assert.doesNotMatch(steps[0], /Use my known words/);
});

test('FR-203 RQ-404: for one long prompt, the setup is one block without the "OK" instructions, to go in front of the request', () => {
  const known = Array.from({ length: 1200 }, (_, i) => `ord${i}`);
  const steps = buildSetup({ ...setupBase, known, chunkWords: 500, single: true });
  assert.equal(steps.length, 1);
  assert.doesNotMatch(steps[0], /"OK"/);
  assert.match(steps[0], /ord0, ord1/);
  assert.match(steps[0], /ord1199/);
  assert.match(steps[0], /"meaning_checks"/);
});

