import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseCorrections, correctionsTsv } from '../../scripts/build-lexicon.mjs';
import { loadLexicon, meaning, search } from '../../server/lexicon/lexicon.mjs';

const MEANINGS = readFileSync(new URL('../../content/library/meanings.tsv', import.meta.url), 'utf8');
const SHIPPED = readFileSync(new URL('../../server/lexicon/corrections.tsv', import.meta.url), 'utf8');

const SAMPLE = [
  '# a comment',
  'form\tlemma\ten\tissue\ttexts',
  'får\tfå\tget(s); may\thomograph\t*',
  'kort\tkort\tcard\thomograph\tA1-03,A1-11',
  'lånekort\tlånekort\tlibrary card\tempty\t*',
  '',
].join('\n');

test('FR-222 RQ-466: the corrections are the rows of meanings.tsv marked *, each with its form, dictionary form and meaning; rows for named texts are not corrections', () => {
  assert.deepEqual(parseCorrections(SAMPLE), [
    { form: 'får', lemma: 'få', en: 'get(s); may' },
    { form: 'lånekort', lemma: 'lånekort', en: 'library card' },
  ]);
  const stars = MEANINGS.split('\n').filter((l) => l && !l.startsWith('#') && l.split('\t')[4] === '*');
  assert.ok(stars.length > 400, `${stars.length} rows`);
  assert.equal(parseCorrections(MEANINGS).length, stars.length);
});

test('FR-222 RQ-466: grove ships the corrections in server/lexicon/, built from content/library/meanings.tsv as it stands, with their source', () => {
  assert.equal(SHIPPED, correctionsTsv(parseCorrections(MEANINGS)));
  assert.match(SHIPPED.slice(0, 400), /content\/library\/meanings\.tsv/);
});

test('FR-222 RQ-466: a corrected form takes its correction before the word list (får "get(s)", i "in", efter "after"); a form the list leaves empty gets one; every other form keeps the list\'s meaning', () => {
  loadLexicon();
  assert.deepEqual(meaning('får'), { lemma: 'få', en: 'get(s); may, be allowed to' });
  assert.equal(meaning('i').en, 'in');
  assert.equal(meaning('Efter').en, 'after');
  assert.deepEqual(meaning('skolan'), { lemma: 'skola', en: 'the school' });
  assert.deepEqual(meaning('fyrahundra'), { lemma: 'fyrahundra', en: 'four hundred' });
  assert.deepEqual(meaning('läsa'), { lemma: 'läsa', en: 'to read' });
  assert.equal(meaning('qwxzy'), null);
  for (const c of parseCorrections(MEANINGS)) assert.equal(meaning(c.form).en, c.en, c.form);
});

test('FR-222 FR-917 RQ-466: the common dictionary shows a corrected headword\'s meaning and finds a corrected headword the list lacks', () => {
  assert.equal(search('efter').find((r) => r.lemma === 'efter').en, 'after');
  assert.equal(search('fyrahundra').find((r) => r.lemma === 'fyrahundra').en, 'four hundred');
  const hits = search('efter');
  assert.equal(new Set(hits.map((r) => r.lemma)).size, hits.length, 'each headword once');
});
