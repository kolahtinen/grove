import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { readingGrove, signedIn, addPart, textId, tokensOf } from './helpers.mjs';
import { GROVE_TEXTS_FILE } from '../../server/library/library.mjs';

const GROVE = JSON.parse(readFileSync(GROVE_TEXTS_FILE, 'utf8'));
const ONE = GROVE.find((x) => x.id === 'A1-03');

let t;
let learner;
let c;
let reading;
before(async () => {
  ({ t, learner } = await readingGrove());
  c = await signedIn(t);
  const db = t.grove.db;
  // A meaning already stored for the learner's word, from before the corrections.
  db.prepare("UPDATE words SET en = 'mead', en_source = 'dictionary' WHERE account_id = ? AND lemma = 'med' AND kind = 'word'").run(learner.id);
  db.prepare("INSERT OR IGNORE INTO words (account_id, lemma, kind, en, en_source, state, added_at) VALUES (?, 'med', 'word', 'mead', 'dictionary', 'ground', 1)").run(learner.id);
  db.prepare("DELETE FROM words WHERE account_id = ? AND lemma IN ('i', 'kort')").run(learner.id);
  db.prepare("INSERT INTO words (account_id, lemma, kind, en, en_source, state, added_at) VALUES (?, 'kort', 'word', 'short', 'ai', 'ground', 1)").run(learner.id);
  const r = await c.post('/api/library/add', { id: ONE.id });
  assert.equal(r.status, 200, JSON.stringify(r.body));
  reading = (await c.get(`/api/reading?id=${r.body.textId}`)).body;
});
after(() => t.close());

test('FR-305 RQ-465: a grove text\'s patterns in the reading payload carry their level and ladder ID, and mark their places', () => {
  assert.equal(reading.patterns.length, ONE.patterns.length);
  for (const p of ONE.patterns) {
    const got = reading.patterns.find((x) => x.name.toLowerCase() === p.name.toLowerCase());
    assert.ok(got, p.name);
    assert.equal(got.level, p.level, p.name);
    assert.equal(got.ladder, p.ladder, p.name);
    assert.ok(tokensOf(reading).some((x) => x.patterns?.includes(got.id)), `${p.name} is marked`);
  }
  const ladderNames = new Set(ONE.patterns.map((p) => p.name.toLowerCase()));
  assert.ok(!(reading.ladder ?? []).some((x) => ladderNames.has(x.name.toLowerCase())), 'a ladder pattern the text lists is not listed twice');
});

test('FR-305 RQ-465: an AI text\'s pattern has no level', async () => {
  const { res } = await addPart(c);
  assert.equal(res.result, 'accepted', JSON.stringify(res));
  const ai = (await c.get(`/api/reading?id=${textId(t, learner.id, 'Olles väska')}`)).body;
  const p = ai.patterns.find((x) => x.name === 'har + supine');
  assert.equal(p.level, null);
  assert.equal(p.ladder, null);
});

test('FR-306 FR-916 RQ-466: a grove text\'s own meaning is its meaning here, before the learner\'s stored one (kort "card" here, stored "short")', () => {
  const kort = tokensOf(reading).find((x) => x.t?.toLowerCase() === 'kort' || x.word === 'kort');
  assert.ok(kort, 'kort is in the text');
  assert.equal(kort.meaning, 'card');
});

test('FR-306 FR-222 RQ-466: a word with no stored meaning shows the word list\'s correction (i "in"); a meaning already stored for the learner\'s word stays (med "mead")', () => {
  const tokens = tokensOf(reading);
  const i = tokens.find((x) => x.word === 'i');
  assert.ok(i, 'i is in the text');
  assert.equal(i.meaning, 'in');
  const med = tokens.find((x) => x.word === 'med');
  assert.ok(med, 'med is in the text');
  assert.equal(med.meaning, 'mead');
});
