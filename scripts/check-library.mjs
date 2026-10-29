// Checks the library's texts (content/library/texts/<level>.json) with grove's own word counting
// (server/words: the tokenizer, regular and irregular inflections, compounds, fixed phrases): for each
// text, the words above its level (with the level they belong to), words in none of the lists nor the
// word list, the word count and the longest sentence.
//
// A word's level comes from the core list (content/library/core-a1a2.tsv) first; otherwise it is the
// lower of SweLLex's (content/library/vocab-graded) and Kelly's. SweLLex only counts essays learners
// wrote, so a word they didn't write early isn't harder; hence the lower of the two, not SweLLex first.
// Kelly's levels are frequency bands from web text, so a word one band above the text's level is still
// a "stretch" (reported, not limited); words two or more bands above, or in no list, are "far" and
// limited per level. Each word counts once, whatever its forms. CHECK.md also shows each text against
// Kelly alone ("before"), as the check was until the core and graded lists came.
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
import { IRREGULAR } from '../server/words/irregular.mjs';
import { validateAnswer } from '../server/texts/schema.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const LIB = join(ROOT, 'content', 'library');
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

// The shared topics the library is browsed by (question-pages/77); see content/library/TOPICS.md.
export const TOPICS = ['People and family', 'Daily life', 'Food and drink', 'Home', 'Work and study', 'Travel and transport',
  'Free time and culture', 'Health', 'Nature and environment', 'Society'];

// Words per text, the longest sentence in words, and how many words above the level a text may have.
export const LIMITS = {
  A1: { min: 50, max: 80, sentence: 10, far: 4 },
  A2: { min: 80, max: 120, sentence: 14, far: 5 },
  B1: { min: 120, max: 180, sentence: 20, far: 7 },
  B2: { min: 180, max: 250, sentence: 25, far: 9 },
  C1: { min: 250, max: 350, sentence: 30, far: 12 },
  C2: { min: 300, max: 400, sentence: 35, far: 15 },
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

// Forms neither list nor the word list resolves (irregular or colloquial), checked by hand; counted as
// their dictionary form too.
const GLOSSARY_FORMS = new Map([['sköt', 'skjuta'], ['stan', 'stad'], ['sjönk', 'sjunka'], ['drog', 'dra'], ['höll', 'hålla'], ['diffusa', 'diffus'], ['tömda', 'tömma'], ['bidrog', 'bidra'],
  ['förstagångsföräldrar', 'förstagångsförälder'], ['sansade', 'sansad'], ['infekterade', 'infekterad']]);
const kelly = readKelly();
const forms = readForms();
for (const [form, lemma] of GLOSSARY_FORMS) forms.set(form, [...(forms.get(form) || []), lemma]);

function readTsv(file, levelCol) {
  const out = new Map();
  if (!existsSync(file)) return out;
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    if (!line || line.startsWith('#') || line.startsWith('sv\t')) continue;
    const f = line.split('\t');
    if (!out.has(f[0])) out.set(f[0], f[levelCol]);
  }
  return out;
}
const lower = (a, b) => (!a ? b : !b ? a : LEVELS.indexOf(a) <= LEVELS.indexOf(b) ? a : b);

// lemma → level for a mode: 'kelly' (Kelly alone) or 'graded' (core list, then the lower of SweLLex and Kelly).
const LEVEL_MAPS = new Map();
export function levelMap(mode) {
  if (LEVEL_MAPS.has(mode)) return LEVEL_MAPS.get(mode);
  const map = new Map();
  for (const r of kelly) if (!map.has(r.lemma)) map.set(r.lemma, r.level);
  if (mode === 'graded') {
    for (const level of LEVELS) {
      for (const [w, l] of readTsv(join(LIB, 'vocab-graded', `${level}.tsv`), 2)) map.set(w, lower(map.get(w), l));
    }
    for (const [w, l] of readTsv(join(LIB, 'core-a1a2.tsv'), 1)) map.set(w, l);
  }
  LEVEL_MAPS.set(mode, map);
  return map;
}

// A counter for a level and mode: its ground is every word at that level or below.
const counters = new Map();
function counterFor(level, names, mode) {
  const at = LEVELS.indexOf(level);
  const ground = new Set();
  const phrases = [];
  for (const [w, l] of levelMap(mode)) {
    const known = LEVELS.indexOf(l) <= at;
    if (w.includes(' ')) phrases.push({ words: w.split(' '), lemma: w, known });
    else if (known) ground.add(w);
  }
  return createCounter({ ground, forms, phrases, names });
}
function levelCounter(level, mode) {
  const key = `${mode} ${level}`;
  if (!counters.has(key)) counters.set(key, counterFor(level, new Set(), mode));
  return counters.get(key);
}

// The lowest level at which a word counts as known, or null.
function wordLevel(word, mode) {
  for (const level of LEVELS) if (levelCounter(level, mode).isKnownWord(word)) return level;
  return null;
}
// A form's dictionary form for the glossary: the listed word it inflects (lowest level first, so
// "bakat" → baka, not the participle bakad), else the word list's headword.
function dictionaryForm(word, mode) {
  const map = levelMap(mode);
  if (GLOSSARY_FORMS.has(word)) return GLOSSARY_FORMS.get(word);
  if (map.has(word)) return word;
  const rank = (l) => LEVELS.indexOf(map.get(l));
  const listed = [...(forms.get(word) || []), ...(IRREGULAR.get(word) || [])].filter((l) => map.has(l)).sort((a, b) => rank(a) - rank(b));
  if (listed.length) return listed[0];
  const regular = regularLemma(word, (l) => map.has(l)) ?? meaning(word)?.lemma;
  if (regular) return regular;
  // A long word no list knows: undo the commonest endings (uppkörningen → uppkörning, klädbutiker →
  // klädbutik, likåldriga → likåldrig, sansade → sansad, hyggesfritt → hyggesfri).
  if (word.length < 8) return word;
  for (const [ending, put] of [['iga', 'ig'], ['ade', 'ad'], ['tt', ''], ['ar', ''], ['er', ''], ['en', ''], ['et', '']]) {
    if (word.endsWith(ending)) return word.slice(0, -ending.length) + put;
  }
  return word;
}

const inLexicon = (word) => !!meaning(word) || !!regularLemma(word, (l) => !!meaning(l));

export function checkText(text, level, mode = 'graded') {
  const limits = LIMITS[level];
  const names = new Set((text.names || []).map((n) => n.toLowerCase()));
  const counter = counterFor(level, names, mode);
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
        const key = item.kind === 'phrase' ? item.text : dictionaryForm(item.text, mode);
        if (!above.has(key)) above.set(key, { forms: new Set(), level: item.kind === 'phrase' ? (levelMap(mode).get(item.text) ?? null) : wordLevel(item.text, mode) });
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
  if (!TOPICS.includes(text.topic)) problems.push(`topic "${text.topic}" is not one of the shared topics`);
  if (text.level !== level) problems.push(`level "${text.level}" but it is in ${level}.json`);
  const { id, level: _l, topic, form, names: _n, above_level: _a, ...core } = text;
  const valid = validateAnswer({ part: 'LIB', texts: [core] });
  if (!valid.ok) problems.push(...valid.problems);
  return { id, title: text.title, kind: text.kind, topic, form, words, longest, above, far, unknown, problems };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const report = ['# Library check', '', 'Written by `node scripts/check-library.mjs`: each text counted with grove\'s own word counting against the words at its level and below: the core list (`core-a1a2.tsv`) first, otherwise the lower of SweLLex (`vocab-graded/`) and Kelly (inflections, compounds and fixed phrases included). "Above" lists the words above the text\'s level with the level they first count at (— = in no list; * = in no list and not in the word list); **bold** words are far (two or more bands above, or not in Kelly) and limited; the others are one band above, a stretch.', ''];
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
    report.push('| id | title | kind | words | longest | above | far: Kelly alone → now | result |', '|---|---|---|---|---|---|---|---|');
    for (const text of texts) {
      const r = checkText(text, level);
      const before = checkText(text, level, 'kelly');
      total += 1;
      if (r.problems.length) failed += 1;
      const aboveList = [...r.above.entries()].map(([w, a]) => `${r.far.includes(w) ? `**${w}**` : w} (${a.level ?? '—'}${r.unknown.includes(w) ? '*' : ''})`).join(', ') || '—';
      report.push(`| ${r.id} | ${r.title} | ${r.kind}${r.form === 'dialogue' ? ', dialogue' : ''} | ${r.words} | ${r.longest} | ${aboveList} | ${before.far.length} → ${r.far.length}${before.far.length ? ` (${before.far.filter((w) => !r.far.includes(w)).join(', ') || 'none'} no longer far)` : ''} | ${r.problems.length ? `**fails**: ${r.problems.join('; ')}` : 'passes'} |`);
      console.log(`${level} ${r.id} ${r.words}w ${r.longest}max above=${before.above.size}→${r.above.size} far=${before.far.length}→${r.far.length} [${r.far.join(' ')}]${r.problems.length ? ` FAIL ${r.problems.join('; ')}` : ''}`);
    }
    report.push('');
  }
  report.push(`${total - failed} of ${total} texts pass.`, '');
  writeFileSync(join(LIB, 'CHECK.md'), report.join('\n'));
  console.log(`${total - failed}/${total} pass`);
  process.exit(failed ? 1 : 0);
}
