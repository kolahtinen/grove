// Builds content/library/vocab-graded/<level>.tsv from SweLLex (Språkbanken Text; CEFR-graded from
// learner essays; CC BY 4.0), with meanings from grove's word list, the same way as the Kelly files
// (scripts/build-library-vocab.mjs). A word's level is the first CEFR level whose essays use it;
// misspellings (SweLLex marks them with *) are left out. The SweLLex file is data, only read.
// Usage: node scripts/build-library-graded.mjs path/to/SweLLex_v1.tsv [path/to/svalex.tsv]
// With svalex.tsv (CC BY-NC-SA 4.0, not bundled) it also prints a comparison, nothing is written from it.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readKelly } from '../server/levels/kelly.mjs';
import { meaning } from '../server/lexicon/lexicon.mjs';
import { flagsFor, LEVELS } from './build-library-vocab.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'content', 'library', 'vocab-graded');

// SUC tags → Kelly's part-of-speech names, so flagsFor reads them the same way.
const POS = {
  NN_UTR: 'noun-en', NN_NEU: 'noun-ett', NN: 'noun', VB: 'verb', JJ: 'adjective', AB: 'adverb', HA: 'adverb',
  PP: 'prep', KN: 'conj', SN: 'subj', PN: 'pronoun', RG: 'numeral', RO: 'numeral', IN: 'interj', DT: 'det',
  PL: 'particle', PC: 'participle',
};

// Rows of a CEFRLex TSV (SweLLex, SVALex): { word, tag, level } with level the first level used.
export function readCefrLex(file) {
  const [head, ...lines] = readFileSync(file, 'utf8').split('\n');
  const cols = head.split('\t');
  const at = Object.fromEntries(LEVELS.map((l) => [l, cols.indexOf(`nb_doc@${l.toLowerCase()}`)]));
  const rows = [];
  for (const line of lines) {
    if (!line) continue;
    const f = line.split('\t');
    const word = f[0].trim().toLowerCase();
    if (!word || word.includes('*') || !/^[\p{L} -]+$/u.test(word)) continue;
    const level = LEVELS.find((l) => at[l] >= 0 && Number(f[at[l]]) > 0);
    if (level) rows.push({ word, tag: f[1], level });
  }
  return rows;
}

// One row per word: its lowest level over its tags; the tags kept for the part of speech.
export function byWord(rows) {
  const words = new Map();
  for (const r of rows) {
    const w = words.get(r.word);
    if (!w) words.set(r.word, { ...r, tags: [r.tag] });
    else {
      w.tags.push(r.tag);
      if (LEVELS.indexOf(r.level) < LEVELS.indexOf(w.level)) Object.assign(w, { level: r.level, tag: r.tag });
    }
  }
  return words;
}

const clean = (s) => String(s).replace(/[\t\r\n]+/g, ' ').trim();
const posOf = (tag) => (tag.endsWith('_MWE') ? 'phrase' : POS[tag] ?? tag);

if (import.meta.url === `file://${process.argv[1]}`) {
  const [file, svalexFile] = process.argv.slice(2);
  if (!file) { console.error('Usage: node scripts/build-library-graded.mjs path/to/SweLLex_v1.tsv [path/to/svalex.tsv]'); process.exit(2); }
  const sha = createHash('sha256').update(readFileSync(file)).digest('hex');
  const words = byWord(readCefrLex(file));
  mkdirSync(OUT, { recursive: true });
  const byLevel = Object.fromEntries(LEVELS.map((l) => [l, []]));
  for (const w of words.values()) {
    const pos = posOf(w.tag);
    const found = meaning(w.word);
    byLevel[w.level].push({ ...w, pos, en: found?.en ?? '', flags: flagsFor({ lemma: w.word, pos }, found) });
  }
  for (const level of LEVELS) {
    const rows = byLevel[level].sort((a, b) => a.word.localeCompare(b.word, 'sv'));
    const lines = [
      `# grove library vocabulary (graded), level ${level}. Words and levels from SweLLex (Volodina, Pilán, Llozhi, Degryse & François 2016; Språkbanken Text, https://doi.org/10.23695/6h3v-zw25), CC BY 4.0: the first CEFR level whose learner essays use the word; misspellings left out. SweLLex_v1.tsv sha256 ${sha}. Meanings from the English Wiktionary via kaikki.org (CC BY-SA 4.0). Built by scripts/build-library-graded.mjs.`,
      'sv\tpos\tlevel\ten\tflags\tsuc',
      ...rows.map((r) => [r.word, r.pos, level, clean(r.en), r.flags.join(','), r.tags.join(',')].join('\t')),
    ];
    writeFileSync(join(OUT, `${level}.tsv`), `${lines.join('\n')}\n`);
    console.log(`${level}: ${rows.length} words, ${rows.filter((r) => r.flags.includes('none')).length} without a meaning, ${rows.filter((r) => r.flags.length).length} flagged`);
  }

  // Against Kelly: how many words each graded level holds from each Kelly level, and examples that move.
  const kelly = new Map();
  for (const r of readKelly()) if (!kelly.has(r.lemma)) kelly.set(r.lemma, r.level);
  const compare = (name, map) => {
    const table = {};
    const moves = { down: [], up: [] };
    let notInKelly = 0;
    for (const [word, w] of map) {
      const k = kelly.get(word);
      if (!k) { notInKelly += 1; continue; }
      table[w.level] ??= {};
      table[w.level][k] = (table[w.level][k] ?? 0) + 1;
      const d = LEVELS.indexOf(k) - LEVELS.indexOf(w.level);
      if (d >= 2) moves.down.push(`${word} (Kelly ${k} → ${w.level})`);
      if (d <= -2) moves.up.push(`${word} (Kelly ${k} → ${w.level})`);
    }
    console.log(`\n${name}: ${map.size} words, ${notInKelly} not in Kelly. Rows: ${name} level; columns: Kelly level.`);
    console.log(`| | ${LEVELS.join(' | ')} |`);
    for (const l of LEVELS) if (table[l]) console.log(`| ${l} | ${LEVELS.map((k) => table[l][k] ?? 0).join(' | ')} |`);
    console.log(`Down two or more levels (${moves.down.length}): ${moves.down.slice(0, 40).join(', ')}`);
    console.log(`Up two or more levels (${moves.up.length}): ${moves.up.slice(0, 25).join(', ')}`);
  };
  compare('SweLLex', words);
  if (svalexFile) compare('SVALex', byWord(readCefrLex(svalexFile)));
}
