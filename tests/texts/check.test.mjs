import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createCounter } from '../../server/words/count.mjs';
import { checkAnswer, MARGINS } from '../../server/texts/check.mjs';
import { validateAnswer } from '../../server/texts/schema.mjs';

const known = new Set(readFileSync(new URL('../../docs/middle/ai-test/known.txt', import.meta.url), 'utf8').split(/\s+/).filter(Boolean));
const load = (name) => validateAnswer(JSON.parse(readFileSync(new URL(`./answers/${name}`, import.meta.url), 'utf8'))).value;

function check(answer, targetShare = 95) {
  const counter = createCounter({
    ground: known,
    forms: new Map(answer.inflections.map((i) => [i.form.toLowerCase(), [i.lemma.toLowerCase()]])),
    phrases: answer.new_phrases.map((p) => ({ words: p.sv.toLowerCase().split(/\s+/), lemma: p.sv.toLowerCase(), known: false })),
    names: new Set(answer.names.map((n) => n.toLowerCase())),
  });
  return checkAnswer(answer, counter, targetShare);
}

// A text of n sentences built from known words, with the given new words put in sentences.
function textWith(newBySentence) {
  const lines = newBySentence.map((news, i) => ({ sv: `Jag ser en stor hund i parken ${['och', 'men', 'ibland', 'ofta', 'nu', 'snart', 'sedan', 'idag', 'igen', 'alltid', 'också', 'redan'][i % 12]} ${news.join(' ')}.`.replace(' .', '.'), en: 'x' }));
  return { part: 'X-1', texts: [{ title: 'T', lines, questions: [] }], new_words: [], new_phrases: [], inflections: [], names: [], starter_words: [] };
}

test('FR-214 RQ-127 RQ-216 RQ-28: the margins are settings with the spec\'s starting values', () => {
  assert.deepEqual(MARGINS, { maxPerSentence: 2, shareOfSentencesWithTwo: 0.1, shareBelowTarget: 2, tooFewAboveTarget: 2 });
});

test('FR-214 RQ-127 RQ-28: a sentence with 3 new items refuses the answer', () => {
  const result = check(load('too-many-new.json'));
  assert.equal(result.ok, false);
  assert.ok(result.problems.some((p) => p.sentence === 'Hon säljer stora bullar med kanel.' && p.items.length === 3), JSON.stringify(result.problems));
});

test('FR-214 RQ-127: 2 of 10 sentences with 2 new items refuse; exactly 1 in 10 is accepted', () => {
  const two = Array(10).fill([]);
  const oneOfTen = [...two]; oneOfTen[3] = ['cykelpump', 'grill'];
  const twoOfTen = [...oneOfTen]; twoOfTen[6] = ['kanel', 'bulle'];
  // Keep the share high so only the per-sentence rule decides.
  assert.equal(check(textWith(oneOfTen), 93).ok, true, JSON.stringify(check(textWith(oneOfTen), 93).problems));
  const refused = check(textWith(twoOfTen), 93);
  assert.equal(refused.ok, false);
  assert.ok(refused.problems.some((p) => p.kind === 'too_many_doubles'));
});

test('FR-214 RQ-216: a text more than 2 points below the target share is refused; within 2 points is accepted', () => {
  const lines = Array(10).fill([]); lines[0] = ['grill']; lines[2] = ['kanel']; lines[4] = ['bulle']; lines[6] = ['cykelpump'];
  // 10 sentences of ~9 words with 4 new ≈ 95.6% known.
  assert.equal(check(textWith(lines), 95).ok, true);
  const refused = check(textWith(lines), 98.5 > 98 ? 98 : 98);
  assert.equal(refused.ok, false);
  assert.ok(refused.problems.some((p) => p.kind === 'share'));
});

test('FR-212 RQ-378: few new words are accepted and flag "ask more firmly"', () => {
  const result = check(load('few-new.json'));
  assert.equal(result.ok, true, JSON.stringify(result.problems));
  assert.equal(result.tooFew, true);
  assert.equal(check(load('good.json')).tooFew, false);
});

test('FR-207 RQ-379: new words the AI didn\'t list are found by grove, and the answer is still accepted within the margins', () => {
  const result = check(load('unlisted-new.json'));
  assert.equal(result.ok, true, JSON.stringify(result.problems));
  for (const word of ['tolv', 'pensionär', 'paraply', 'räknar', 'mörkt', 'gärna', 'släcker']) {
    assert.ok(result.newItems.some((i) => i.text === word), word);
  }
});

test('FR-214 RQ-28: the good sample answer is accepted at the default target', () => {
  const result = check(load('good.json'));
  assert.equal(result.ok, true, JSON.stringify(result.problems));
});

test('FR-214 FR-206 RQ-395: each text is judged on its own: a failing text has its own problems, the others pass', () => {
  const a = textWith([[], ['zebrafink', 'kolibri', 'pelikan'], []]);
  a.texts.push({ ...textWith([[], []]).texts[0], title: 'U' });
  const r = check(a);
  assert.equal(r.ok, false);
  assert.equal(r.texts[0].ok, false);
  assert.ok(r.texts[0].problems.length > 0);
  assert.equal(r.texts[1].ok, true);
  assert.deepEqual(r.texts[1].problems, []);
  assert.ok(r.texts[0].newItems.some((i) => i.text === 'kolibri'));
});
