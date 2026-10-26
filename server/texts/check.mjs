// Checks an answer's texts against the margins (FR-213, FR-214, FR-212): per sentence and per text,
// each text judged on its own (FR-206), and whether there were clearly too few new words.
import { splitSentences } from '../words/sentences.mjs';

// Starting values, to be tuned after trying real answers (RQ-127, RQ-216).
export const MARGINS = { maxPerSentence: 2, shareOfSentencesWithTwo: 0.1, shareBelowTarget: 2, tooFewAboveTarget: 2 };

export function checkAnswer(answer, counter, targetShare, margins = MARGINS) {
  const problems = [];
  const texts = [];
  const newItems = [];
  const seen = new Set();
  let tooFew = false;

  answer.texts.forEach((text, ti) => {
    const sentences = [];
    const own = [];
    const ownItems = [];
    const ownSeen = new Set();
    let total = 0;
    let known = 0;
    text.lines.forEach((line, li) => {
      splitSentences(line.sv).forEach((sv, si) => {
        const r = counter.countSentence(sv);
        total += r.total;
        known += r.known;
        sentences.push({ line: li, position: si, sv, items: r.items });
        for (const item of r.items) {
          if (!seen.has(item.text)) { seen.add(item.text); newItems.push(item); }
          if (!ownSeen.has(item.text)) { ownSeen.add(item.text); ownItems.push(item); }
        }
      });
    });
    const share = total ? (known / total) * 100 : 100;
    const doubles = sentences.filter((s) => s.items.length === 2);
    const allowedDoubles = Math.ceil(sentences.length * margins.shareOfSentencesWithTwo);
    for (const s of sentences.filter((x) => x.items.length > margins.maxPerSentence)) {
      own.push({ kind: 'too_many_in_sentence', text: ti + 1, sentence: s.sv, items: s.items.map((i) => i.text) });
    }
    if (doubles.length > allowedDoubles) {
      own.push({ kind: 'too_many_doubles', text: ti + 1, count: doubles.length, allowed: allowedDoubles, sentences: doubles.map((s) => ({ sentence: s.sv, items: s.items.map((i) => i.text) })) });
    }
    if (share < targetShare - margins.shareBelowTarget) {
      own.push({ kind: 'share', text: ti + 1, share: Math.round(share * 10) / 10, target: targetShare });
    }
    if (share > targetShare + margins.tooFewAboveTarget) tooFew = true;
    problems.push(...own);
    texts.push({ share, sentences, problems: own, ok: own.length === 0, newItems: ownItems });
  });

  return { ok: problems.length === 0, problems, texts, newItems, tooFew };
}

// Plain-English problem lines for the learner and the fix-it prompt (FR-206, RQ-63).
export function describeProblem(p) {
  switch (p.kind) {
    case 'too_many_in_sentence':
      return `Text ${p.text}: "${p.sentence}" has ${p.items.length} new words (${p.items.join(', ')}); rewrite it with at most one.`;
    case 'too_many_doubles':
      return `Text ${p.text}: ${p.count} sentences have 2 new words; at most ${p.allowed} may. Rewrite these with at most one new word each: ${p.sentences.map((s) => `"${s.sentence}" (${s.items.join(', ')})`).join('; ')}.`;
    case 'share':
      return `Text ${p.text}: only ${p.share}% of its words are known; at least ${p.target}% should be. Use fewer new words.`;
    case 'cut_off':
      return 'The answer was cut off before the end of the JSON block.';
    case 'not_json':
      return `The answer isn't valid JSON${p.line ? ` (near line ${p.line})` : ''}.`;
    case 'no_json':
      return 'The answer has no JSON block.';
    case 'format':
      return p.message;
    default:
      return 'The answer has a problem.';
  }
}
