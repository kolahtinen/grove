import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readingGrove, signedIn } from './helpers.mjs';
import { search } from '../../server/lexicon/lexicon.mjs';

let t;
let c;
before(async () => {
  ({ t } = await readingGrove());
  c = await signedIn(t);
});
after(() => t.close());

test('FR-917 RQ-432: the common dictionary searches grove\'s whole word list from 2 letters, words starting with the search first, at most 50', () => {
  assert.deepEqual(search('k'), []);
  const hits = search('katt');
  assert.ok(hits.length > 0 && hits.length <= 50);
  assert.equal(hits[0].lemma, 'katt');
  assert.match(hits[0].en, /cat/i);
  const firstContains = hits.findIndex((h) => !h.lemma.startsWith('katt'));
  if (firstContains !== -1) assert.ok(hits.slice(firstContains).every((h) => !h.lemma.startsWith('katt')));
  assert.equal(search('a'.repeat(3)).length <= 50, true);
});

test('FR-917 RQ-432 RQ-155: GET /api/common-dictionary answers with meaning, level and the learner\'s own state; added as a leaf, the word shows as a leaf', async () => {
  const r = await c.get('/api/common-dictionary?q=pingvin');
  assert.equal(r.status, 200);
  const word = r.body.results.find((x) => x.lemma === 'pingvin');
  assert.ok(word);
  assert.ok('level' in word);
  assert.equal(word.state, null);
  assert.equal((await c.post('/api/leaves', { text: 'pingvin', kind: 'word', en: word.en.slice(0, 200) })).status, 200);
  const again = (await c.get('/api/common-dictionary?q=pingvin')).body.results.find((x) => x.lemma === 'pingvin');
  assert.equal(again.state, 'leaf');
  assert.equal((await t.client().get('/api/common-dictionary?q=pingvin')).status, 401);
});
