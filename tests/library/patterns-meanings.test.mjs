import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { startTestGrove } from '../fakes/harness.mjs';
import { GROVE_TEXTS_FILE } from '../../server/library/library.mjs';
import { validateAnswer } from '../../server/texts/schema.mjs';
import { LIMITS, checkText } from '../../scripts/check-library.mjs';

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const LIB = new URL('../../content/library/', import.meta.url);
const FILE = JSON.parse(readFileSync(GROVE_TEXTS_FILE, 'utf8'));
const read = (path) => JSON.parse(readFileSync(new URL(path, LIB), 'utf8'));
const PATTERNS = new Map(LEVELS.flatMap((l) => read(`patterns/${l}.json`).texts.map((x) => [x.id, x.patterns])));
const MEANING_ROWS = readFileSync(new URL('meanings.tsv', LIB), 'utf8').split('\n')
  .filter((l) => l && !l.startsWith('#') && !l.startsWith('form\t'))
  .map((l) => { const [form, lemma, en, , texts] = l.split('\t'); return { form, lemma, en, texts: texts.split(',').map((x) => x.trim()) }; });
const WORD = /\p{L}+(?:[-’']\p{L}+)*/gu; // as the reading page marks a place (G-03)
const words = (s) => (String(s).toLowerCase().match(WORD) || []);

let t;
let c;
let learner;
before(async () => {
  t = await startTestGrove();
  learner = t.seedAccount({ email: 'patterns@example.test' });
  c = t.client();
  await c.signInAgreed('patterns@example.test');
});
after(() => t.close());

test('FR-916 RQ-464: the checker\'s word range per level is A1 25–160, A2 40–240, B1 60–360, B2 70–500, C1 120–700, C2 130–800, and every grove text passes the check', () => {
  const ranges = Object.fromEntries(LEVELS.map((l) => [l, [LIMITS[l].min, LIMITS[l].max]]));
  assert.deepEqual(ranges, { A1: [25, 160], A2: [40, 240], B1: [60, 360], B2: [70, 500], C1: [120, 700], C2: [130, 800] });
  for (const level of LEVELS) {
    for (const text of read(`texts/${level}.json`).texts) {
      const r = checkText(text, level);
      assert.deepEqual(r.problems, [], `${text.id}: ${r.problems.join('; ')}`);
    }
  }
});

test('FR-916 RQ-464: content/library/texts-pending/ is not read by the build; each level has short, usual and long texts', () => {
  const pendingDir = new URL('texts-pending/', LIB);
  const pending = existsSync(pendingDir) ? readdirSync(pendingDir).filter((f) => f.endsWith('.json')).flatMap((f) => read(`texts-pending/${f}`).texts.map((x) => x.id)) : [];
  const built = new Set(FILE.map((x) => x.id));
  for (const id of pending) assert.equal(built.has(id), false, `${id} is pending`);
  for (const level of LEVELS) {
    const counts = FILE.filter((x) => x.level === level).map((x) => x.lines.reduce((n, l) => n + words(l.sv).length, 0));
    assert.ok(Math.max(...counts) >= 1.8 * Math.min(...counts), `${level}: ${Math.min(...counts)}–${Math.max(...counts)} words`);
  }
});

test('FR-916 RQ-465: each grove text carries its grammar patterns from patterns/<level>.json with their level and ladder ID, in G-02\'s pattern format, every place found in its line', () => {
  for (const x of FILE) {
    const source = PATTERNS.get(x.id) ?? [];
    assert.deepEqual(x.patterns, source.map((p) => ({ name: p.name, explain_en: p.explain_en, level: p.level, ladder: p.ladder ?? null, places: p.places })), x.id);
    for (const p of x.patterns) assert.ok(LEVELS.includes(p.level), `${x.id} ${p.name}`);
    const checked = validateAnswer({ part: `LIB-${x.id}`, texts: [{ kind: x.kind, title: x.title, lines: x.lines, questions: x.questions }], patterns: x.patterns.map(({ name, explain_en, places }) => ({ name, explain_en, places })) });
    assert.ok(checked.ok, `${x.id}: ${checked.problems?.join('; ')}`);
    for (const p of x.patterns) {
      for (const place of p.places) {
        const line = words(x.lines[place.line - 1]?.sv ?? '');
        const target = words(place.words);
        assert.ok(line.some((_, i) => target.every((w, k) => line[i + k] === w)), `${x.id} ${p.name}: "${place.words}" in line ${place.line}`);
      }
    }
  }
  assert.ok(FILE.filter((x) => x.patterns.length).length === FILE.length, 'every grove text has patterns');
});

test('FR-916 RQ-466: each grove text carries its own meanings, the rows of meanings.tsv that name it (not *)', () => {
  for (const x of FILE) {
    const rows = MEANING_ROWS.filter((r) => r.texts.includes(x.id)).map(({ form, lemma, en }) => ({ form, lemma, en }));
    const seen = new Set();
    const expected = rows.filter((r) => (seen.has(r.form) ? false : seen.add(r.form)));
    assert.deepEqual(x.meanings, expected, x.id);
  }
  assert.ok(FILE.some((x) => x.meanings.length), 'some texts have their own meanings');
});

test('FR-916 FR-305 FR-306 RQ-465 RQ-466: an added grove text stores its patterns with their levels and its own meanings as the copy\'s meanings here; the learner\'s stored meaning of the word stays', async () => {
  const one = FILE.find((x) => x.id === 'A1-03');
  assert.ok(one.meanings.some((m) => m.form === 'kort' && m.en === 'card'));
  const db = t.grove.db;
  db.prepare("INSERT INTO words (account_id, lemma, kind, en, en_source, state, added_at) VALUES (?, 'kort', 'word', 'short', 'ai', 'ground', 1)").run(learner.id);
  const r = await c.post('/api/library/add', { id: one.id });
  assert.equal(r.status, 200, JSON.stringify(r.body));
  const textId = r.body.textId;
  assert.equal(db.prepare("SELECT en FROM words WHERE account_id = ? AND lemma = 'kort' AND kind = 'word'").get(learner.id).en, 'short', 'the stored meaning stays');
  const here = new Map(db.prepare('SELECT form, en FROM text_meanings WHERE text_id = ?').all(textId).map((m) => [m.form, m.en]));
  for (const m of one.meanings) assert.equal(here.get(m.form), m.en, m.form);
  for (const p of one.patterns) {
    const item = db.prepare("SELECT id, level, ladder FROM words WHERE account_id = ? AND kind = 'pattern' AND lemma = ?").get(learner.id, p.name.toLowerCase());
    assert.ok(item, p.name);
    assert.equal(item.level, p.level, p.name);
    assert.equal(item.ladder, p.ladder, p.name);
    assert.equal(db.prepare('SELECT COUNT(*) AS n FROM pattern_places WHERE text_id = ? AND word_id = ?').get(textId, item.id).n, p.places.length, p.name);
  }
});
