import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseKaikki, toTsv } from '../../scripts/build-lexicon.mjs';
import { loadLexicon, meaning } from '../../server/lexicon/lexicon.mjs';

const SAMPLE = [
  { word: 'läsa', lang_code: 'sv', pos: 'verb', senses: [{ glosses: ['to read (text)'] }, { glosses: ['to study'] }] },
  { word: 'läser', lang_code: 'sv', pos: 'verb', senses: [{ glosses: ['present indicative of läsa'], form_of: [{ word: 'läsa' }], tags: ['form-of'] }] },
  { word: 'Kaffe', lang_code: 'sv', pos: 'noun', senses: [{ glosses: ['coffee (a tree, its beans, a drink)'] }] },
  { word: 'lång', lang_code: 'sv', pos: 'adj', senses: [{ glosses: ['<b>long</b> ' + 'x'.repeat(200)] }] },
  { word: 'tom', lang_code: 'sv', pos: 'adj', senses: [{ tags: ['no-gloss'] }] },
  { word: 'gammal', lang_code: 'en', pos: 'adj', senses: [{ glosses: ['not Swedish'] }] },
].map((e) => JSON.stringify(e)).join('\n');

test('FR-222 RQ-396: the build keeps each headword\'s first real gloss, plain text, notes in brackets dropped, at most 120 characters, and forms with their headword', () => {
  const { words, forms } = parseKaikki(SAMPLE);
  assert.equal(words.get('läsa'), 'to read');
  assert.equal(words.get('kaffe'), 'coffee');
  assert.ok(words.get('lång').length <= 120);
  assert.doesNotMatch(words.get('lång'), /[<>]/);
  assert.equal(words.has('tom'), false, 'no gloss, no entry');
  assert.equal(words.has('gammal'), false, 'only Swedish entries');
  assert.equal(forms.get('läser'), 'läsa');
  const tsv = toTsv({ words, forms }, { sha256: 'abc' });
  assert.match(tsv, /CC BY-SA/);
  assert.match(tsv, /kaikki\.org/);
  assert.match(tsv, /abc/);
});

test('FR-222 RQ-396 RQ-399: the shipped word list gives a meaning by form or through its headword, covers every demo ground word, and answers null for an unknown word', () => {
  const head = readFileSync(new URL('../../server/lexicon/sv-en.tsv', import.meta.url), 'utf8').slice(0, 600);
  assert.match(head, /Wiktionary/);
  assert.match(head, /CC BY-SA 4\.0/);
  assert.match(head, /sha256 [0-9a-f]{64}/);
  loadLexicon();
  assert.deepEqual(meaning('läsa'), { lemma: 'läsa', en: 'to read' });
  assert.equal(meaning('läser').lemma, 'läsa');
  assert.equal(meaning('LÄSA').lemma, 'läsa');
  assert.equal(meaning('qwxzy'), null);
  const ground = readFileSync(new URL('../../server/demo/demo-ground.txt', import.meta.url), 'utf8').split(/\s+/).filter(Boolean);
  const missing = ground.filter((w) => !meaning(w));
  assert.deepEqual(missing, []);
});

test('FR-221 FR-222 RQ-380: no meaning in the word list holds markup', () => {
  const text = readFileSync(new URL('../../server/lexicon/sv-en.tsv', import.meta.url), 'utf8');
  assert.doesNotMatch(text.split('\n').filter((l) => !l.startsWith('#')).join('\n'), /[<>]/);
});
