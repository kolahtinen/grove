import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readingGrove, signedIn, addPart, textId, tokensOf } from './helpers.mjs';

let t;
let learner;
let c;
let firstPrompt;
before(async () => {
  ({ t, learner } = await readingGrove());
  c = await signedIn(t);
  const { prompt, res } = await addPart(c);
  // The rules and format are in the setup since G-02 FR-203 changed (2026-10-26).
  firstPrompt = [...prompt.steps, prompt.prompt].join('\n\n');
  assert.equal(res.result, 'accepted', JSON.stringify(res));
});
after(() => t.close());

test('FR-307 RQ-29 RQ-177: every part prompt asks for the grammar patterns used, with name, explanation and places', () => {
  assert.match(firstPrompt, /"patterns"/);
  assert.match(firstPrompt, /grammar patterns/i);
  assert.match(firstPrompt, /"places"/);
});

test('FR-307 RQ-29 RQ-177: accepted patterns are stored once as pattern leaves with their explanation and places; the same name later is the same item', async () => {
  const db = t.grove.db;
  const p = db.prepare("SELECT * FROM words WHERE account_id = ? AND kind = 'pattern' AND lemma = 'har + supine'").get(learner.id);
  assert.equal(p.state, 'leaf');
  assert.match(p.en, /Past action/);
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM pattern_places WHERE word_id = ?').get(p.id).n, 2);
  const { res } = await addPart(c, undefined, (a) => { a.texts = a.texts.slice(0, 1); a.texts[0].title = 'Igen'; return a; });
  assert.equal(res.result, 'accepted', JSON.stringify(res));
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM words WHERE account_id = ? AND kind = 'pattern' AND lemma = 'har + supine'").get(learner.id).n, 1);
});

test('FR-308 RQ-12: the reading payload marks the pattern\'s words, skips a place whose words aren\'t in the line, and texts without patterns have no marks', async () => {
  const r = (await c.get(`/api/reading?id=${textId(t, learner.id, 'Olles väska')}`)).body;
  const pattern = r.patterns.find((x) => x.name === 'har + supine');
  assert.ok(pattern);
  const marked = tokensOf(r).filter((x) => x.patterns?.includes(pattern.id)).map((x) => x.t);
  assert.deepEqual(marked, ['har', 'han', 'glömt']);
  const first = (await c.get(`/api/reading?id=${textId(t, learner.id, 'En kall morgon')}`)).body;
  const firstLine = first.lines[0].sentences.flatMap((s) => s.tokens);
  assert.ok(!firstLine.some((x) => x.patterns?.length), 'the place "har glömt" in line 1 is not in the line, so nothing is marked');
  const third = (await c.get(`/api/reading?id=${textId(t, learner.id, 'En bra dag')}`)).body;
  assert.equal(third.patterns.length, 0);
});

test('FR-309 RQ-171: a pattern item has the fields of a word (state, added time, fallen time) so G-04 can schedule it', () => {
  const row = t.grove.db.prepare("SELECT state, added_at, fallen_at, kind FROM words WHERE account_id = ? AND kind = 'pattern' LIMIT 1").get(learner.id);
  assert.equal(row.kind, 'pattern');
  assert.equal(row.state, 'leaf');
  assert.ok(row.added_at > 0);
  assert.equal(row.fallen_at, null);
});
