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
  assert.deepEqual(a.texts.map((x) => x.kind), ['reading', 'reading', 'listening', 'reading'], 'the dialogue is the listening text (2026-10-26)');
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

test('FR-704 RQ-362: the demo ground is built into server/demo/, and nothing grove runs reads a file in docs/', async () => {
  const { readdirSync } = await import('node:fs');
  const built = readFileSync(new URL('../../server/demo/demo-ground.txt', import.meta.url), 'utf8').split(/\s+/).filter(Boolean);
  const known = readFileSync(new URL('../../docs/middle/ai-test/known.txt', import.meta.url), 'utf8').split(/\s+/).filter(Boolean);
  assert.deepEqual(built, known.filter((w) => !['glömma', 'granne', 'biljett'].includes(w)));
  assert.deepEqual(DEMO_GROUND, built);
  const files = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? files(`${dir}/${e.name}`) : [`${dir}/${e.name}`]));
  const root = new URL('../../', import.meta.url).pathname;
  for (const file of [...files(`${root}server`), ...files(`${root}tunnel`)].filter((f) => f.endsWith('.mjs'))) {
    assert.doesNotMatch(readFileSync(file, 'utf8'), /['"`/]docs\//, file);
  }
});

test('FR-704 RQ-362: no code grove runs names docs/, however the path is written', async () => {
  const { readdirSync } = await import('node:fs');
  const files = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? files(`${dir}/${e.name}`) : [`${dir}/${e.name}`]));
  const root = new URL('../../', import.meta.url).pathname;
  const code = [...files(`${root}server`), ...files(`${root}tunnel`)].filter((f) => /\.(mjs|js|cjs)$/.test(f));
  assert.ok(code.length > 10);
  for (const file of code) {
    // 'docs/…', "docs", `docs` or join(…, 'docs', …).
    assert.doesNotMatch(readFileSync(file, 'utf8'), /['"`/]docs(['"`/\\]|$)/m, file);
  }
});

test('FR-704 RQ-399: every demo word, ground words included, has an English meaning and a simple Swedish explanation, built into server/demo/', () => {
  const ground = readFileSync(new URL('../../server/demo/demo-ground.txt', import.meta.url), 'utf8').split(/\s+/).filter(Boolean);
  const meanings = JSON.parse(readFileSync(new URL('../../server/demo/demo-ground-meanings.json', import.meta.url), 'utf8'));
  const lacking = ground.filter((w) => !meanings[w]?.en || !meanings[w]?.explain_sv);
  assert.deepEqual(lacking, []);
  assert.equal(meanings.efter.en, 'after', 'the word list\'s first sense is corrected where it is wrong');
  const a = JSON.parse(raw);
  assert.ok(a.new_words.every((w) => w.en && w.explain_sv));
  assert.doesNotMatch(JSON.stringify(meanings), /<[a-z!/]/i);
});

