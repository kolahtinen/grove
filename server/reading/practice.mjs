// Reading practice (FR-310; research R5): for sentences with a leaf, "what does this word mean
// here?" with the meaning here and 2–3 other words' meanings.
import { randomInt } from 'node:crypto';
import { buildReading } from './view.mjs';

export const MAX_QUESTIONS = 8;

function shuffle(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = randomInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function buildPractice(db, accountId, textId) {
  const reading = buildReading(db, accountId, textId);
  const pool = db.prepare("SELECT lemma, en FROM words WHERE account_id = ? AND en IS NOT NULL AND kind = 'word'").all(accountId);
  const questions = [];
  for (const line of reading.lines) {
    for (const s of line.sentences) {
      if (questions.length >= MAX_QUESTIONS) break;
      const leaf = s.tokens.find((x) => x.word && x.status === 'leaf' && x.meaning);
      if (!leaf) continue;
      const right = leaf.meaning;
      const others = [...new Set(pool.filter((p) => !leaf.lemmas.includes(p.lemma) && p.en !== right).map((p) => p.en))];
      if (others.length < 2) continue;
      const options = shuffle([right, ...shuffle(others).slice(0, Math.min(3, others.length))]);
      questions.push({ sentence: s.sv, word: leaf.t, options, right: options.indexOf(right) });
    }
  }
  return { questions };
}
