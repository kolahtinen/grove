// Builds server/demo/demo-answer.json and server/demo/demo-ground.txt from the X-03 Claude answer and
// known words (G-07 FR-702, FR-704; plan R1 of specs/007-reviewer-demo); grove never reads docs/ itself. Usage: node scripts/build-demo.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCounter } from '../server/words/count.mjs';
import { splitSentences } from '../server/words/sentences.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = JSON.parse(readFileSync(join(root, 'docs/middle/ai-test/answer-claude.json'), 'utf8'));
// The demo ground: the X-03 known words, except the three the X-03 prompt asked to reuse as words
// "I'm practising" — in the demo they are leaves being drilled.
export const PRACTISING = ['glömma', 'granne', 'biljett'];
export const DEMO_GROUND = readFileSync(join(root, 'docs/middle/ai-test/known.txt'), 'utf8').split(/\s+/).filter(Boolean).filter((w) => !PRACTISING.includes(w));
const known = new Set(DEMO_GROUND);
// Inflections of known words grove's rules don't reach.
export const INFLECTIONS = [{ form: 'hänt', lemma: 'hända' }];

// The Swedish slips recorded in docs/middle/ai-test/results.md, corrected.
const FIXES = [
  ['Jag har glömt min väska här igår', 'Jag glömde min väska här igår'],
  ['Den borta nyckeln', 'Den borttappade nyckeln'],
  ['Vem heter Olle?', 'Vem är Olle?'],
];
const fix = (text) => FIXES.reduce((t, [a, b]) => t.split(a).join(b), text);

// Meanings for the words grove finds new against the X-03 known words (the X-03 answer listed none).
export const MEANINGS = JSON.parse(readFileSync(join(root, 'scripts/demo-meanings.json'), 'utf8'));

export function buildTexts() {
  const texts = [];
  for (const t of source.texts) {
    let lines;
    if (t.kind === 'cyoa') {
      const byId = Object.fromEntries(t.nodes.map((n) => [n.id, n]));
      lines = ['start', 'granne', 'granne_ja'].flatMap((id) => byId[id].lines);
    } else {
      lines = t.lines.map((l) => (l.speaker ? { sv: `${l.speaker}: ${l.sv}`, en: `${l.speaker}: ${l.en}` } : { sv: l.sv, en: l.en }));
    }
    texts.push({
      title: fix(t.title),
      lines: lines.map((l) => ({ sv: fix(l.sv), en: l.en })),
      questions: (t.questions || []).map((q) => ({ q: fix(q.q), options: q.options.map(fix), answer: q.answer })),
    });
  }
  return texts;
}

export function newWordsOf(texts) {
  const counter = createCounter({
    ground: known,
    forms: new Map(INFLECTIONS.map((i) => [i.form, [i.lemma]])),
    phrases: source.new_phrases.map((p) => ({ words: p.sv.split(' '), lemma: p.sv, known: false })),
    names: new Set(source.names.flatMap((n) => n.toLowerCase().split(' '))),
  });
  const found = new Map();
  for (const t of texts) for (const l of t.lines) for (const s of splitSentences(l.sv)) {
    for (const i of counter.countSentence(s).items) if (i.kind === 'word') found.set(i.text, (found.get(i.text) || 0) + 1);
  }
  return found;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const texts = buildTexts();
  const found = newWordsOf(texts);
  const missing = [...found.keys()].filter((f) => !MEANINGS[f]);
  if (missing.length) {
    console.log(`build-demo: meanings missing for: ${missing.join(', ')}`);
    process.exit(1);
  }
  const answer = {
    part: 'DEMO-1',
    texts,
    new_words: [...found.keys()].map((form) => ({ form, lemma: MEANINGS[form].lemma, en: MEANINGS[form].en, explain_sv: MEANINGS[form].explain_sv })),
    new_phrases: source.new_phrases,
    inflections: INFLECTIONS,
    names: source.names,
  };
  writeFileSync(join(root, 'server/demo/demo-answer.json'), `${JSON.stringify(answer, null, 1)}\n`);
  writeFileSync(join(root, 'server/demo/demo-ground.txt'), `${DEMO_GROUND.join('\n')}\n`);
  console.log(`build-demo: ${texts.length} texts, ${answer.new_words.length} new words written to server/demo/demo-answer.json; ${DEMO_GROUND.length} ground words to server/demo/demo-ground.txt`);
}
