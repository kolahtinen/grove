import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readingGrove, signedIn, KNOWN } from './helpers.mjs';
import { fillExamples } from '../../server/words/examples.mjs';

// A big learner (question-pages/72): 2,000 words and 5,000 sentences.
let t;
let c;
before(async () => {
  let learner;
  ({ t, learner } = await readingGrove());
  const db = t.grove.db;
  const add = db.prepare("INSERT OR IGNORE INTO words (account_id, lemma, kind, en, state, added_at) VALUES (?, ?, 'word', ?, 'ground', 1)");
  const count = () => db.prepare('SELECT COUNT(*) AS n FROM words WHERE account_id = ?').get(learner.id).n;
  const made = [];
  for (let i = 0; count() < 2000; i += 1) {
    made.push(`ord${i}`);
    add.run(learner.id, `ord${i}`, `meaning ord${i}`);
  }
  const text = Number(db.prepare("INSERT INTO texts (account_id, position, title, topic, created_at) VALUES (?, 1, 'Big', 'big', 1)").run(learner.id).lastInsertRowid);
  const sentence = db.prepare("INSERT INTO sentences (account_id, text_id, line_position, position, sv, new_items) VALUES (?, ?, ?, 0, ?, '[]')");
  const pool = [...KNOWN, ...made];
  for (let i = 0; i < 5000; i += 1) {
    const words = Array.from({ length: 10 }, (_, k) => pool[(i * 7 + k * 131) % pool.length]);
    sentence.run(learner.id, text, i, `${words.join(' ')}.`);
  }
  fillExamples(db, learner.id);
  c = await signedIn(t);
});
after(() => t.close());

async function slowest(path) {
  let worst = 0;
  for (let i = 0; i < 5; i += 1) {
    const start = performance.now();
    const r = await c.get(path);
    worst = Math.max(worst, performance.now() - start);
    assert.equal(r.status, 200);
  }
  return worst;
}

test('FR-316 SC-005 RQ-410: at 2,000 words and 5,000 sentences, a Dictionary page or search answers within 100 ms', async () => {
  const first = (await c.get('/api/dictionary')).body;
  assert.equal(first.items.length, 100);
  assert.ok(first.total >= 2000);
  assert.ok(first.items.some((i) => i.example), 'examples are stored');
  for (const path of ['/api/dictionary', '/api/dictionary?offset=1500', '/api/dictionary?q=ord1', '/api/dictionary?q=meaning', '/api/dictionary?tab=phrases&q=x']) {
    const ms = await slowest(path);
    assert.ok(ms < 100, `${path} took ${ms.toFixed(1)} ms`);
  }
});
