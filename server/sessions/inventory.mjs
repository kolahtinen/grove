// What a learner has to practise, for the planner (G-09 research R2, R4): drilled leaves with their
// strength (G-04's schedule), the texts with kind, topic, word count, read or not, when created (the fill
// bars, FR-920), and, when asked, the
// share of known words now; reading and listening done in the last 7 days; and, when asked, what Discover's
// Words and Grammar can show next (FR-928, FR-929).
import { strength, isDue, MASTER_GAP } from '../drill/schedule.mjs';
import { tokenize } from '../words/tokens.mjs';
import { createWordStore } from '../words/store.mjs';
import { levelFor, isBelowB1 } from '../drill/progress.mjs';
import { learningInventory } from '../learning/learning.mjs';

const DAY = 24 * 60 * 60 * 1000;

export function readInventory(db, accountId, { now = Date.now(), knownShares = false, learning = false } = {}) {
  const leaves = db.prepare("SELECT * FROM words WHERE account_id = ? AND drilled = 1 AND state = 'leaf'").all(accountId).map((w) => {
    const s = strength(w, now);
    return { id: w.id, lemma: w.lemma, kind: w.kind, strength: s, due: isDue(w, now), fading: s < 0.2, gap: w.gap_days, masterReady: w.gap_days >= MASTER_GAP, textIds: [] };
  });
  // The texts each leaf was met in: its source text and the texts whose sentences list it as new.
  const byLemma = new Map(leaves.map((l) => [l.lemma, l]));
  for (const w of db.prepare("SELECT lemma, source_text_id FROM words WHERE account_id = ? AND drilled = 1 AND state = 'leaf' AND source_text_id IS NOT NULL").all(accountId)) {
    byLemma.get(w.lemma)?.textIds.push(w.source_text_id);
  }
  const sentences = db.prepare('SELECT text_id, sv, new_items FROM sentences WHERE account_id = ? ORDER BY id').all(accountId);
  const words = new Map();
  for (const s of sentences) {
    words.set(s.text_id, (words.get(s.text_id) ?? 0) + tokenize(s.sv).length);
    for (const item of JSON.parse(s.new_items)) {
      const leaf = byLemma.get(String(item).toLowerCase());
      if (leaf && !leaf.textIds.includes(s.text_id)) leaf.textIds.push(s.text_id);
    }
  }
  const places = new Map(db.prepare('SELECT text_id, COUNT(*) AS n FROM pattern_places WHERE account_id = ? GROUP BY text_id').all(accountId).map((r) => [r.text_id, r.n]));
  const texts = db.prepare('SELECT id, kind, topic, own, read_at, created_at FROM texts WHERE account_id = ? AND ready = 1 ORDER BY id').all(accountId)
    .map((t) => ({ id: t.id, kind: t.kind, topic: t.own ? '' : t.topic, read: !!t.read_at, readAt: t.read_at ?? null, createdAt: t.created_at, words: words.get(t.id) ?? 0, patternPlaces: places.get(t.id) ?? 0 }));

  if (knownShares) {
    // Counted now with G-02's counter (research R4): only unread texts are candidates.
    const counter = createWordStore({ db }).counterFor(accountId, { names: db.prepare('SELECT name FROM names WHERE account_id = ?').all(accountId).map((r) => r.name) });
    const unread = new Set(texts.filter((t) => !t.read).map((t) => t.id));
    const tally = new Map();
    for (const s of sentences) {
      if (!unread.has(s.text_id)) continue;
      const c = counter.countSentence(s.sv);
      const t = tally.get(s.text_id) ?? { total: 0, known: 0 };
      t.total += c.total;
      t.known += c.known;
      tally.set(s.text_id, t);
    }
    for (const t of texts) {
      const c = tally.get(t.id);
      if (c) t.knownShare = c.total ? Math.round((c.known / c.total) * 1000) / 10 : 100;
    }
  }

  const since = now - 7 * DAY;
  const recent = { reading: 0, listening: 0 };
  for (const t of db.prepare('SELECT kind, id FROM texts WHERE account_id = ? AND read_at >= ?').all(accountId, since)) {
    recent[t.kind] += words.get(t.id) ?? 0;
  }
  const targetShare = db.prepare('SELECT target_share FROM learner_settings WHERE account_id = ?').get(accountId)?.target_share ?? 95;
  return { leaves, texts, recent, targetShare, belowB1: isBelowB1(levelFor(db, accountId)), ...(learning ? { learning: learningInventory(db, accountId, { now }) } : {}) };
}
