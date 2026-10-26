import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { extractJson } from '../../server/texts/extract.mjs';

const load = (name) => readFileSync(new URL(`./answers/${name}`, import.meta.url), 'utf8');

test('FR-205 RQ-41: the JSON is found inside prose and a ```json fence', () => {
  const result = extractJson(load('good-in-prose.txt'));
  assert.equal(result.ok, true);
  assert.equal(result.value.part, 'TEST-1');
});

test('FR-205 RQ-41: a bare JSON paste and the first of two fenced blocks are found', () => {
  assert.equal(extractJson(load('good.json')).ok, true);
  const two = `First:\n\`\`\`json\n${load('good.json')}\n\`\`\`\nAnd again:\n\`\`\`\n{"other": 1}\n\`\`\``;
  assert.equal(extractJson(two).value.part, 'TEST-1');
  const skipFirst = `\`\`\`\n{"note": "not the answer"}\n\`\`\`\n\`\`\`json\n${load('good.json')}\n\`\`\``;
  assert.equal(extractJson(skipFirst).value.part, 'TEST-1', 'a block without texts is skipped');
});

test('FR-205 RQ-41: a cut-off answer is reported as cut off', () => {
  const result = extractJson(load('cut-off.txt'));
  assert.equal(result.ok, false);
  assert.equal(result.problem, 'cut_off');
});

test('FR-205 RQ-41: prose without JSON is reported as not valid JSON; broken JSON gets a line number', () => {
  assert.equal(extractJson(load('not-json.txt')).problem, 'no_json');
  const broken = extractJson('```json\n{\n  "part": "X",\n  "texts": [1, 2,,]\n}\n```');
  assert.equal(broken.problem, 'not_json');
  assert.equal(broken.line, 4);
});

// The shape of ChatGPT's answers in the probe test (question-pages/69): the rendered message copied
// as markdown, with escaped backticks, a backslash at every line end and &#x20; for indentation.
function escapedCopy(value) {
  const body = JSON.stringify(value, null, 2).split('\n').map((l) => l.replace(/^( +)/, (sp) => `&#x20;${sp.slice(1)}`));
  return ['\\`\\`\\`json', ...body, '\\`\\`\\`'].join('\\\n');
}

test('FR-205 RQ-41: a markdown-escaped copy of the answer (escaped fence, backslashes at line ends, &#x20;) is read', () => {
  const good = JSON.parse(load('good.json'));
  const pasted = `Here you go:\n\n${escapedCopy(good)}`;
  assert.match(pasted, /\\`\\`\\`json\\\n\{\\\n&#x20; "part"/);
  const r = extractJson(pasted);
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.deepEqual(r.value, good);
});

test('FR-205 RQ-41: a readable paste is never changed by the escape undoing, even with a backslash or "&#x20;" in its text', () => {
  const good = JSON.parse(load('good.json'));
  good.texts[0].lines[0].en = 'A back\\slash, \\_ and &#x20; stay as written.';
  const r = extractJson(JSON.stringify(good));
  assert.equal(r.ok, true);
  assert.equal(r.value.texts[0].lines[0].en, 'A back\\slash, \\_ and &#x20; stay as written.');
});
