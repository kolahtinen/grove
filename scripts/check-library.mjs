// Checks the library's texts (content/library/texts/<level>.json) with grove's own word counting
// (server/words: the tokenizer, regular and irregular inflections, compounds, fixed phrases): for each
// text, the words above its level (with the Kelly level they belong to), words in neither Kelly nor the
// word list, the word count and the longest sentence.
//
// Kelly's levels are frequency bands from web text, not textbook levels: everyday words a beginner
// meets first (kaffe, kök, syster A2; mjölk B1; smörgås C2) sit above A1. So a word one band above the
// text's level is a "stretch" (reported, not limited); words two or more bands above, or not in Kelly,
// are "far" and limited per level. Each word counts once, whatever its forms.
//
// A text fails when it is outside its level's limits, when a word above its level isn't listed in its
// "above_level", or when its lines and questions don't pass G-02's answer format. Writes
// content/library/CHECK.md; exits 1 when a text fails. With --fill, a text's "above_level" is written
// from what the check finds (the word list form of each word), so the list is a glossary to review.
// Usage: node scripts/check-library.mjs [--fill]
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readKelly } from '../server/levels/kelly.mjs';
import { meaning } from '../server/lexicon/lexicon.mjs';
import { createCounter } from '../server/words/count.mjs';
import { splitSentences } from '../server/words/sentences.mjs';
import { tokenize } from '../server/words/tokens.mjs';
import { regularLemma } from '../server/words/inflect.mjs';
import { validateAnswer } from '../server/texts/schema.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const LIB = join(ROOT, 'content', 'library');
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

// Words per text, the longest sentence in words, and how many words above the level a text may have.
export const LIMITS = {
  A1: { min: 50, max: 80, sentence: 10, far: 4 },
  A2: { min: 80, max: 120, sentence: 14, far: 5 },
  B1: { min: 120, max: 180, sentence: 20, far: 7 },
  B2: { min: 180, max: 250, sentence: 25, far: 9 },
  C1: { min: 220, max: 320, sentence: 30, far: 12 },
  C2: { min: 250, max: 380, sentence: 35, far: 15 },
};

// The word list's inflected forms (form → headwords), so "bilar" is known through "bil".
function readForms() {
  const forms = new Map();
  for (const line of readFileSync(join(ROOT, 'server', 'lexicon', 'sv-en.tsv'), 'utf8').split('\n')) {
    if (!line.startsWith('f\t')) continue;
    const [, form, lemma] = line.split('\t');
    forms.set(form, [...(forms.get(form) || []), lemma]);
  }
  return forms;
}

const kelly = readKelly();
const forms = readForms();
// A counter per level: its ground is every Kelly word at that level or below.
const counters = new Map();
function counterFor(level, names) {
  const at = LEVELS.indexOf(level);
  const ground = new Set(kelly.filter((r) => LEVELS.indexOf(r.level) <= at && !r.lemma.includes(' ')).map((r) => r.lemma));
  const phrases = kelly.filter((r) => r.lemma.includes(' ')).map((r) => ({ words: r.lemma.split(' '), lemma: r.lemma, known: LEVELS.indexOf(r.level) <= at }));
  return createCounter({ ground, forms, phrases, names });
}
function levelCounter(level) {
  if (!counters.has(level)) counters.set(level, counterFor(level, new Set()));
  return counters.get(level);
}

// The lowest Kelly level at which a word counts as known, or null.
function kellyLevel(word) {
  for (const level of LEVELS) if (levelCounter(level).isKnownWord(word)) return level;
  return null;
}
const inLexicon = (word) => !!meaning(word) || !!regularLemma(word, (l) => !!meaning(l));

export function checkText(text, level) {
  const limits = LIMITS[level];
  const names = new Set((text.names || []).map((n) => n.toLowerCase()));
  const counter = counterFor(level, names);
  const problems = [];
  let words = 0;
  let longest = 0;
  const above = new Map();
  for (const line of text.lines) {
    for (const sentence of splitSentences(line.sv)) {
      const n = tokenize(sentence).length;
      longest = Math.max(longest, n);
      const counted = counter.countSentence(sentence);
      words += counted.total;
      for (const item of counted.items) {
        const key = item.kind === 'phrase' ? item.text : (meaning(item.text)?.lemma ?? item.text);
        if (!above.has(key)) above.set(key, { forms: new Set(), level: item.kind === 'phrase' ? kellyLevelOfPhrase(item.text) : kellyLevel(item.text) });
        above.get(key).forms.add(item.text);
      }
    }
  }
  const listed = new Set((text.above_level || []).map((w) => w.toLowerCase()));
  const notListed = [...above.entries()].filter(([w, a]) => !listed.has(w) && ![...a.forms].some((f) => listed.has(f))).map(([w]) => w);
  const unknown = [...above.entries()].filter(([w, a]) => a.level === null && !inLexicon(w)).map(([w]) => w);
  const at = LEVELS.indexOf(level);
  const far = [...above.entries()].filter(([, a]) => a.level === null || LEVELS.indexOf(a.level) > at + 1).map(([w]) => w);
  if (words < limits.min || words > limits.max) problems.push(`${words} words (${limits.min}–${limits.max})`);
  if (longest > limits.sentence) problems.push(`a sentence of ${longest} words (at most ${limits.sentence})`);
  if (far.length > limits.far) problems.push(`${far.length} far words (at most ${limits.far}): ${far.join(', ')}`);
  if (notListed.length) problems.push(`not listed in above_level: ${notListed.join(', ')}`);
  const { id, level: _l, topic, form, names: _n, above_level: _a, ...core } = text;
  const valid = validateAnswer({ part: 'LIB', texts: [core] });
  if (!valid.ok) problems.push(...valid.problems);
  return { id, title: text.title, kind: text.kind, topic, form, words, longest, above, far, unknown, problems };
}

function kellyLevelOfPhrase(phrase) {
  return kelly.find((r) => r.lemma === phrase)?.level ?? null;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const report = ['# Library check', '', 'Written by `node scripts/check-library.mjs`: each text counted with grove\'s own word counting against the Kelly words at its level and below (inflections, compounds and Kelly\'s fixed phrases included). "Above" lists the words above the text\'s level with the Kelly level they first count at (— = not in Kelly; * = in neither Kelly nor the word list); **bold** words are far (two or more bands above, or not in Kelly) and limited; the others are one band above, a stretch.', ''];
  let failed = 0;
  let total = 0;
  for (const level of LEVELS) {
    const file = join(LIB, 'texts', `${level}.json`);
    if (!existsSync(file)) continue;
    const data = JSON.parse(readFileSync(file, 'utf8'));
    const { texts } = data;
    if (process.argv.includes('--fill')) {
      for (const text of texts) text.above_level = [...checkText({ ...text, above_level: [] }, level).above.keys()];
      writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
    }
    const l = LIMITS[level];
    report.push(`## ${level} (${texts.length} texts; ${l.min}–${l.max} words, sentences ≤ ${l.sentence} words, ≤ ${l.far} far words)`, '');
    report.push('| id | title | kind | words | longest | above | result |', '|---|---|---|---|---|---|---|');
    for (const text of texts) {
      const r = checkText(text, level);
      total += 1;
      if (r.problems.length) failed += 1;
      const aboveList = [...r.above.entries()].map(([w, a]) => `${r.far.includes(w) ? `**${w}**` : w} (${a.level ?? '—'}${r.unknown.includes(w) ? '*' : ''})`).join(', ') || '—';
      report.push(`| ${r.id} | ${r.title} | ${r.kind}${r.form === 'dialogue' ? ', dialogue' : ''} | ${r.words} | ${r.longest} | ${aboveList} | ${r.problems.length ? `**fails**: ${r.problems.join('; ')}` : 'passes'} |`);
      console.log(`${level} ${r.id} ${r.words}w ${r.longest}max above=${r.above.size} far=${r.far.length} [${r.far.join(' ')}]${r.problems.length ? ` FAIL ${r.problems.join('; ')}` : ''}`);
    }
    report.push('');
  }
  report.push(`${total - failed} of ${total} texts pass.`, '');
  writeFileSync(join(LIB, 'CHECK.md'), report.join('\n'));
  console.log(`${total - failed}/${total} pass`);
  process.exit(failed ? 1 : 0);
}
