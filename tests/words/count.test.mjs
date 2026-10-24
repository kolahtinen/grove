import { test } from 'node:test';
import assert from 'node:assert/strict';
import { splitSentences } from '../../server/words/sentences.mjs';
import { tokenize } from '../../server/words/tokens.mjs';
import { createCounter } from '../../server/words/count.mjs';

const GROUND = ['jag', 'du', 'hon', 'han', 'det', 'är', 'vara', 'en', 'ett', 'och', 'i', 'på', 'till', 'läsa', 'kafé', 'kaka', 'bil',
  'gata', 'stor', 'kaffe', 'kopp', 'bok', 'idag', 'gammal', 'säga', 'hej', 'hur', 'må', 'du', 'öppna', 'dörr', 'glad', 'vi', 'gå', 'hem'];

function counter(extra = {}) {
  return createCounter({ ground: new Set(GROUND), forms: new Map(Object.entries(extra.forms || {})), phrases: extra.phrases || [], names: new Set(extra.names || []) });
}

test('FR-213 RQ-28 RQ-64: lines split into sentences at . ! ? …, keeping quotes, and several sentences on one line are split', () => {
  assert.deepEqual(splitSentences('Det är kallt. Hon går hem! Varför? Jag vet inte…'), ['Det är kallt.', 'Hon går hem!', 'Varför?', 'Jag vet inte…']);
  assert.deepEqual(splitSentences('”Hej, Elsa!” säger hon. ”Hur mår du?”'), ['”Hej, Elsa!” säger hon.', '”Hur mår du?”']);
  assert.deepEqual(splitSentences('En mening utan punkt'), ['En mening utan punkt']);
  assert.deepEqual(splitSentences('Klockan är 7.30 nu.'), ['Klockan är 7.30 nu.']);
});

test('FR-213 RQ-28: words are Unicode letters, lower-cased, and digits are skipped', () => {
  const words = tokenize('Åsa köper 3 bröd och ÄPPLEN, inte päron!').map((t) => t.word);
  assert.deepEqual(words, ['åsa', 'köper', 'bröd', 'och', 'äpplen', 'inte', 'päron']);
});

test('FR-213 RQ-64: a dictionary form, a learned form and a listed inflection are known', () => {
  const c = counter({ forms: { böcker: ['bok'], var: ['vara'] } });
  assert.deepEqual(c.countSentence('Jag läser böcker.').items, []);
  assert.deepEqual(c.countSentence('Det var en bok.').items, []);
});

test('FR-213 RQ-28: regular endings of known words are known', () => {
  const c = counter();
  for (const s of ['Hon läser.', 'Kaféet är stort.', 'Kakorna är goda.', 'Bilar och kakor.', 'Gatan är stor.', 'De stora bilarna.', 'Hon öppnade dörren.']) {
    const result = c.countSentence(s);
    assert.ok(!result.items.some((i) => ['läser', 'kaféet', 'stort', 'kakorna', 'bilar', 'kakor', 'gatan', 'stora', 'bilarna', 'öppnade', 'dörren'].includes(i.text)), `${s} → ${JSON.stringify(result.items)}`);
  }
});

test('FR-213 RQ-28: a compound of two known words is known; an unknown word is new', () => {
  const c = counter();
  assert.deepEqual(c.countSentence('En kaffekopp.').items, []);
  assert.deepEqual(c.countSentence('En bokhylla.').items.map((i) => i.text), ['bokhylla']);
});

test('FR-213 RQ-28: names from the list and capitalised words mid-sentence never count', () => {
  const c = counter({ names: ['elsa'] });
  assert.deepEqual(c.countSentence('Elsa går till Stockholm idag.').items, []);
  assert.deepEqual(c.countSentence('Maja är glad.').items.map((i) => i.text), ['maja'], 'an unlisted name first in a sentence counts');
});

test('FR-213 RQ-28: a listed new phrase counts as one item and its words are not counted again', () => {
  const c = counter({ phrases: [{ words: ['det', 'gör', 'inget'], lemma: 'det gör inget', known: false }] });
  const result = c.countSentence('Det gör inget, säger hon.');
  assert.deepEqual(result.items, [{ text: 'det gör inget', kind: 'phrase' }]);
  assert.equal(result.total, 3, 'the phrase is one item among the words: phrase, säger, hon');
});

test('FR-213 RQ-28: total and known count words that are not names or numbers', () => {
  const c = counter({ names: ['elsa'] });
  const result = c.countSentence('Elsa köper 2 kaffe idag.');
  assert.equal(result.total, 3);
  assert.equal(result.known, 2);
  assert.deepEqual(result.items.map((i) => i.text), ['köper']);
});
