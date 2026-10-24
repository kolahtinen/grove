import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseKellyXml, toTsv } from '../../scripts/build-kelly.mjs';
import { readKelly, KELLY_FILE } from '../../server/levels/kelly.mjs';

test('FR-601 RQ-117: the build script cleans notes, lower-cases, keeps duplicates once at the lowest level, marks phrases and maps CEFR 1–6', () => {
  const rows = parseKellyXml(readFileSync(new URL('./fixture-kelly.xml', import.meta.url), 'utf8'));
  assert.deepEqual(rows.map((r) => [r.lemma, r.level, r.kind]), [['och', 'A1', 'word'], ['kafé', 'A2', 'word'], ['i dag', 'B1', 'phrase']]);
  assert.equal(rows.find((r) => r.lemma === 'kafé').wpm, 53.1, 'the higher frequency is kept');
  const tsv = toTsv(rows, { sha256: 'abc' });
  assert.match(tsv, /^# Swedish Kelly list, Språkbanken/m);
  assert.match(tsv, /CC BY-SA 3\.0, LGPL 3\.0/);
  assert.match(tsv, /sha256 abc/);
});

test('FR-601 RQ-117: the committed Kelly file has about 8,000 forms on every level, none twice', () => {
  const rows = readKelly(KELLY_FILE);
  assert.ok(rows.length > 7900 && rows.length < 8425, `${rows.length} forms`);
  const levels = new Set(rows.map((r) => r.level));
  assert.deepEqual([...levels].sort(), ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);
  assert.equal(new Set(rows.map((r) => r.lemma)).size, rows.length);
  assert.ok(rows.every((r) => !r.lemma.includes('(')));
  assert.ok(rows.some((r) => r.lemma === 'vara' && r.level === 'A1'));
});
