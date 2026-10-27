import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readingGrove, signedIn, addPart } from './helpers.mjs';
import { examplesLoad } from '../../server/reading/dictionary.mjs';

let t;
let c;
let learner;
before(async () => {
  ({ t, learner } = await readingGrove());
  c = await signedIn(t);
  const { res } = await addPart(c);
  assert.equal(res.result, 'accepted', JSON.stringify(res));
});
after(() => t.close());

const page = async (query = '', client = c) => (await client.get(`/api/dictionary${query}`));
const find = (d, lemma) => d.items.find((i) => i.lemma === lemma);

test('FR-316 RQ-53 RQ-205 RQ-357 RQ-409: the Words tab lists words met with translation, state and the stored example; a word never met in a text has none', async () => {
  const d = (await page('?q=kopp')).body;
  assert.equal(d.tab, 'words');
  const kopp = find(d, 'kopp');
  assert.equal(kopp.en, 'cup');
  assert.equal(kopp.state, 'leaf');
  assert.match(kopp.example, /kopp/i);
  const kaffe = (await page('?q=kaffe')).body.items.find((i) => i.lemma === 'kaffe');
  assert.equal(kaffe.state, 'ground');
  assert.match(kaffe.example, /kaffe/i, 'a ground word met in a text shows where');
  const hundra = (await page('?q=hundra')).body.items.find((i) => i.lemma === 'hundra');
  assert.equal(hundra.example, null);
  assert.ok(d.items.every((i) => i.kind === 'word'));
});

test('FR-316 RQ-409: phrases and grammar patterns have their own tabs, with examples', async () => {
  const phrases = (await page('?tab=phrases')).body;
  assert.match(find(phrases, 'hur mår du').example, /Hur mår du/);
  assert.ok(phrases.items.every((i) => i.kind === 'phrase'));
  const patterns = (await page('?tab=patterns')).body;
  assert.match(find(patterns, 'har + supine').example, /har/);
});

test('FR-316 RQ-409: a tab shows 100 entries at a time, A to Ö, with the total; More is the next offset', async () => {
  const add = t.grove.db.prepare("INSERT OR IGNORE INTO words (account_id, lemma, kind, state, added_at) VALUES (?, ?, 'word', 'ground', 1)");
  for (let i = 0; i < 250; i += 1) add.run(learner.id, `zz${String(i).padStart(3, '0')}`);
  for (const w of ['ökänd', 'ålder', 'ära']) add.run(learner.id, w);
  const first = (await page()).body;
  assert.equal(first.items.length, 100);
  assert.equal(first.offset, 0);
  const total = first.total;
  assert.ok(total > 250);
  assert.equal(first.counts.words, total);
  const lastOffset = Math.floor((total - 1) / 100) * 100;
  const last = (await page(`?offset=${lastOffset}`)).body;
  assert.equal(last.items.length, total - lastOffset);
  const all = [];
  for (let o = 0; o < total; o += 100) all.push(...(await page(`?offset=${o}`)).body.items.map((i) => i.lemma));
  assert.equal(new Set(all).size, total, 'no entry twice and none missing across pages');
  const at = (w) => all.indexOf(w);
  assert.ok(at('zz249') < at('ålder') && at('ålder') < at('ära') && at('ära') < at('ökänd'), 'å, ä, ö come after z, in that order');
});

test('FR-316 RQ-409: search matches the form or the meaning in the open tab and counts the matches of every tab', async () => {
  const byMeaning = (await page('?q=umbrella')).body;
  assert.deepEqual(byMeaning.items.map((i) => i.lemma), ['paraply']);
  assert.equal(byMeaning.total, 1);
  const byForm = (await page('?q=kop')).body;
  assert.ok(find(byForm, 'kopp'));
  const mår = (await page('?tab=phrases&q=mår')).body;
  assert.equal(mår.counts.phrases, 1);
  assert.equal(mår.counts.words, 0);
  assert.deepEqual(mår.items.map((i) => i.lemma), ['hur mår du']);
  assert.equal((await page('?q=%25')).body.total, 0, 'a % is searched for as itself');
});

test('FR-316 RQ-409 RQ-410: a word added later gets the first earlier sentence it appears in', async () => {
  t.grove.db.prepare("DELETE FROM words WHERE account_id = ? AND lemma = 'bröd'").run(learner.id);
  const added = await c.post('/api/leaves', { text: 'bröd' });
  assert.equal(added.status, 200, JSON.stringify(added.body));
  const bröd = find((await page('?q=bröd')).body, 'bröd');
  assert.match(bröd.example, /bröd/);
});

test('FR-316 FR-032 RQ-410 RQ-407: words met before stored examples get theirs once, as a start-up load in steps', async () => {
  const db = t.grove.db;
  db.prepare('UPDATE words SET example_sentence_id = NULL').run();
  db.prepare("DELETE FROM settings WHERE key = 'examples_filled'").run();
  const load = examplesLoad({ db });
  assert.equal(load.name, 'examples');
  assert.ok(load.size > 0);
  let done = 0;
  for (const n of load.steps()) done += n;
  assert.equal(done, load.size);
  assert.match(find((await page('?q=kopp')).body, 'kopp').example, /kopp/i);
  assert.equal(db.prepare("SELECT value FROM settings WHERE key = 'examples_filled'").get().value, '1');
  assert.equal(examplesLoad({ db }).size, 0, 'it runs once');
});

test('FR-317 RQ-56 RQ-409: names have their own tab, paged and searched like the others, and are not among the words', async () => {
  const names = (await page('?tab=names')).body;
  assert.ok(names.items.some((i) => i.lemma === 'Elsa'));
  assert.ok(!find((await page('?q=elsa')).body, 'elsa'));
  const searched = (await page('?tab=names&q=ols')).body;
  assert.deepEqual(searched.items.map((i) => i.lemma), []);
  assert.deepEqual((await page('?tab=names&q=oll')).body.items.map((i) => i.lemma), ['Olle']);
});

test('FR-316 RQ-409: another tab, a bad offset or a search longer than 80 characters is refused', async () => {
  for (const q of ['?tab=verbs', '?offset=50', '?offset=-100', '?offset=x', `?q=${'a'.repeat(81)}`]) {
    const r = await page(q);
    assert.equal(r.status, 400, q);
    assert.equal(r.body.error, 'bad_request', q);
  }
});

test('FR-319 RQ-155: the dictionary lists only the learner\'s own words and names', async () => {
  const other = await signedIn(t, 'other@example.test');
  assert.ok(!find((await page('?q=kopp', other)).body, 'kopp'));
  assert.deepEqual((await page('?tab=names', other)).body.items, []);
});
