import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, rmSync, cpSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { startTestGrove, seedGround } from '../fakes/harness.mjs';
import { buildContent, hasMark } from '../../server/learning/content.mjs';
import {
  LEARNING_FILE, importLearningContent, learningInventory, getItem, wordCard, phraseCard, patternCard,
  answerItem, markSeen, reportItem, listReports, formatReports, ladderFor,
} from '../../server/learning/learning.mjs';

const CONTENT = new URL('../../content/learning/', import.meta.url).pathname;
const FILE = JSON.parse(readFileSync(LEARNING_FILE, 'utf8'));
const DAY = 24 * 60 * 60 * 1000;

let t;
let db;
let learner;
let other;
before(async () => {
  t = await startTestGrove();
  db = t.grove.db;
  importLearningContent(db);
  learner = t.seedAccount({ email: 'learner@example.test' });
  other = t.seedAccount({ email: 'other@example.test' });
});
after(() => t.close());

test('FR-930 RQ-454: the build carries every approved item of content/learning, checked, in order; a word in both word files is one item', () => {
  const { items, problems } = buildContent(CONTENT);
  assert.deepEqual(problems, []);
  assert.deepEqual(FILE, JSON.parse(JSON.stringify(items)), 'server/learning/learning-content.json is built from content/learning');
  const count = (type) => FILE.filter((x) => x.type === type).length;
  assert.equal(count('pattern'), 36);
  assert.equal(count('phrase'), 103);
  assert.ok(count('word') >= 120);
  assert.equal(new Set(FILE.map((x) => x.id)).size, FILE.length, 'one item per ID');
  for (const p of FILE.filter((x) => x.type === 'pattern')) {
    for (const s of p.data.spot) assert.ok(hasMark(p.data.text.lines[s.line].sv, s.mark), `${p.id} ${s.mark}`);
  }
  assert.deepEqual(FILE.filter((x) => x.type === 'pattern').map((x) => x.id).slice(0, 2), ['G-A1-01', 'G-A1-02'], 'the ladder\'s order');
});

test('FR-930 RQ-454: a file not approved, or an item whose mark is not in its sentence, stops the build', () => {
  const dir = mkdtempSync(join(tmpdir(), 'grove-learning-'));
  try {
    cpSync(CONTENT, dir, { recursive: true });
    const file = join(dir, 'grammar/patterns.json');
    const json = JSON.parse(readFileSync(file, 'utf8'));
    json.status = 'draft';
    json.patterns[0].examples[0].mark = 'inte här';
    writeFileSync(file, JSON.stringify(json));
    const { problems } = buildContent(dir);
    assert.ok(problems.some((p) => /not "approved"/.test(p)));
    assert.ok(problems.some((p) => /G-A1-01: example mark/.test(p)));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('FR-930 RQ-454: grove imports the content at start-up into learning_items, belonging to no learner, and again only when the file changes', () => {
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM learning_items').get().n, FILE.length);
  assert.equal(importLearningContent(db), 'unchanged');
  db.prepare("DELETE FROM settings WHERE key = 'learning_content_hash'").run();
  db.prepare("UPDATE learning_items SET data = '{}' WHERE id = 'G-A1-01'").run();
  assert.equal(importLearningContent(db), 'imported');
  assert.equal(getItem(db, 'G-A1-01').data.name, FILE[0].data.name);
});

test('FR-928 RQ-452: next words are at the learner\'s level, not yet theirs and not shown before, then the levels below; phrases the same', () => {
  const inv = learningInventory(db, learner.id);
  assert.equal(inv.level, 'A1', 'no level yet: A1');
  const first = getItem(db, inv.words[0]);
  assert.equal(first.level, 'A1');
  assert.equal(first.id, FILE.find((x) => x.type === 'word' && x.level === 'A1').id, 'the next words first, in order');
  seedGround(db, learner.id, [first.data.lemma]);
  markSeen(db, learner.id, inv.words[1]);
  const again = learningInventory(db, learner.id);
  assert.ok(!again.words.includes(inv.words[0]), 'a word of theirs is left out');
  assert.ok(!again.words.includes(inv.words[1]), 'a word shown before is left out');
  assert.ok(learningInventory(db, other.id).words.includes(inv.words[1]), 'another learner still gets it');
  db.prepare("INSERT INTO learner_settings (account_id, start_level) VALUES (?, 'A2') ON CONFLICT (account_id) DO UPDATE SET start_level = 'A2'").run(other.id);
  const a2 = learningInventory(db, other.id);
  assert.equal(a2.level, 'A2');
  assert.equal(getItem(db, a2.words[0]).level, 'A2');
  assert.ok(a2.words.some((id) => getItem(db, id).level === 'A1'), 'then the level below');
  assert.equal(getItem(db, a2.phrases[0]).level, 'A2');
  db.prepare('DELETE FROM learner_settings WHERE account_id = ?').run(other.id);
});

test('FR-928 RQ-452: a word card has its meaning and example with the word marked; a phrase card three choices with its meaning once, fixed by the phrase', () => {
  const card = wordCard(getItem(db, 'W-noll'));
  assert.equal(card.lemma, 'noll');
  assert.equal(card.example.mark, 'noll');
  const phrase = phraseCard(db, getItem(db, 'P-A1-01'));
  assert.equal(phrase.choices.length, 3);
  assert.equal(phrase.choices[phrase.right], phrase.en);
  assert.equal(phrase.choices.filter((c) => c === phrase.en).length, 1);
  assert.deepEqual(phraseCard(db, getItem(db, 'P-A1-01')), phrase, 'the same every time');
  assert.equal(phrase.examples.length, 2);
});

test('FR-928 RQ-452: I know it puts a word in the ground; + Pick up makes a word or phrase a drilled leaf To remember, due now; both mark it shown; only for this learner', () => {
  const [know, pick] = learningInventory(db, learner.id).words;
  assert.deepEqual(answerItem({ db, accountId: learner.id, id: know, action: 'know' }), { state: 'ground' });
  const lemma = getItem(db, know).data.lemma.toLowerCase();
  const row = db.prepare("SELECT * FROM words WHERE account_id = ? AND lemma = ? AND kind = 'word'").get(learner.id, lemma);
  assert.equal(row.state, 'ground');
  assert.equal(row.en, getItem(db, know).data.en, 'the content\'s meaning');
  assert.deepEqual(answerItem({ db, accountId: learner.id, id: pick, action: 'pick' }), { state: 'leaf' });
  const leaf = db.prepare("SELECT * FROM words WHERE account_id = ? AND lemma = ? AND kind = 'word'").get(learner.id, getItem(db, pick).data.lemma.toLowerCase());
  assert.equal(leaf.drilled, 1);
  assert.equal(leaf.to_remember, 1);
  assert.equal(answerItem({ db, accountId: learner.id, id: 'P-A1-02', action: 'pick' }).state, 'leaf');
  assert.equal(db.prepare("SELECT drilled FROM words WHERE account_id = ? AND kind = 'phrase' AND lemma = ?").get(learner.id, getItem(db, 'P-A1-02').data.phrase).drilled, 1);
  assert.throws(() => answerItem({ db, accountId: learner.id, id: 'P-A1-03', action: 'know' }), /Only a word/);
  assert.throws(() => answerItem({ db, accountId: learner.id, id: 'G-A1-01', action: 'know' }), /Only a word/);
  assert.equal(answerItem({ db, accountId: learner.id, id: 'G-A1-01', action: 'pick' }).state, 'leaf', 'a ladder pattern is picked up by its name (FR-305)');
  assert.equal(db.prepare("SELECT en FROM words WHERE account_id = ? AND kind = 'pattern'").get(learner.id).en, getItem(db, 'G-A1-01').data.explain);
  assert.throws(() => answerItem({ db, accountId: learner.id, id: 'W-nonsenseword', action: 'pick' }), /no such item/);
  const inv = learningInventory(db, learner.id);
  assert.ok(!inv.words.includes(know) && !inv.words.includes(pick));
  assert.ok(!inv.phrases.includes('P-A1-02'));
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM words WHERE account_id = ?').get(other.id).n, 0, 'nothing for another learner');
});

test('FR-929 RQ-453: the pattern of the day is the first of the ladder at or below the level not yet met, or the one first met today; earlier patterns the longest ago first', () => {
  const now = Date.UTC(2026, 9, 29, 12);
  const fresh = t.seedAccount({ email: 'grammar@example.test' });
  assert.equal(learningInventory(db, fresh.id, { now }).patterns.day, 'G-A1-01');
  assert.deepEqual(learningInventory(db, fresh.id, { now }).patterns.earlier, []);
  markSeen(db, fresh.id, 'G-A1-01', now - 2 * DAY);
  markSeen(db, fresh.id, 'G-A1-02', now - DAY);
  let inv = learningInventory(db, fresh.id, { now });
  assert.equal(inv.patterns.day, 'G-A1-03');
  assert.deepEqual(inv.patterns.earlier, ['G-A1-01', 'G-A1-02']);
  markSeen(db, fresh.id, 'G-A1-03', now - 1000);
  inv = learningInventory(db, fresh.id, { now });
  assert.equal(inv.patterns.day, 'G-A1-03', 'met today: still the pattern of the day');
  inv = learningInventory(db, fresh.id, { now: now + DAY });
  assert.equal(inv.patterns.day, 'G-A1-04', 'the next day, the next pattern');
  for (const p of FILE.filter((x) => x.type === 'pattern' && x.level === 'A1')) markSeen(db, fresh.id, p.id, now - 3 * DAY);
  assert.equal(learningInventory(db, fresh.id, { now: now + 3 * DAY }).patterns.day, null, 'every A1 pattern met: none at A1');
  const card = patternCard(getItem(db, 'G-A2-06'));
  assert.ok(card.name && card.explain && card.howToSpot && card.examples.length >= 4 && card.text.lines.length >= 6 && card.spot.length >= 6);
});

test('FR-931 RQ-454: Report on an item is kept with the learner and reaches the owner\'s list; an unknown item is refused', () => {
  reportItem(db, learner.id, { id: 'W-noll', reason: 'wrong_meaning', note: '  zero, nought  ' });
  reportItem(db, other.id, { id: 'G-A1-01', reason: 'unnatural' });
  assert.throws(() => reportItem(db, learner.id, { id: 'X-1', reason: 'other' }), /no such item/);
  const list = listReports(db);
  assert.equal(list.length, 2);
  assert.deepEqual({ item: list[0].item, what: list[0].what, reason: list[0].reason, note: list[0].note }, { item: 'W-noll', what: 'noll', reason: 'wrong meaning', note: 'zero, nought' });
  assert.equal(list[1].what, getItem(db, 'G-A1-01').data.name);
  assert.match(formatReports(list), /W-noll.*noll.*wrong meaning.*"zero, nought"/);
  assert.equal(formatReports([]), 'No open reports on the learning content.');
});

test('FR-305 RQ-455: the ladder patterns of a sentence are those whose marked parts occur in it, with the words they cover', () => {
  const tokens = 'jag tar den gröna jackan och de svarta byxorna'.split(' ');
  const found = ladderFor(db, tokens);
  const big = found.find((p) => p.id === 'G-A2-06');
  assert.ok(big, 'the big car: den gröna jackan');
  assert.deepEqual(big.indexes, [2, 3, 4, 6, 7, 8]);
  assert.ok(big.name && big.explain && big.level === 'A2');
  assert.deepEqual(ladderFor(db, ['hej', 'då']), []);
});
