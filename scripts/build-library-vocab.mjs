// Builds the library's vocabulary lists, content/library/vocab/<level>.tsv, from the Kelly list
// (server/levels/kelly-sv.tsv) and grove's Swedish–English word list (server/lexicon/sv-en.tsv).
// No meaning is made up: a word the word list can't give a plain meaning for is flagged instead.
// Usage: node scripts/build-library-vocab.mjs
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readKelly } from '../server/levels/kelly.mjs';
import { meaning } from '../server/lexicon/lexicon.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'content', 'library', 'vocab');
export const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const VERBISH = new Set(['verb', 'aux verb']);
const NOUNISH = new Set(['noun', 'noun-en', 'noun-ett', 'proper name']);

// Flags, separated by commas:
//   none       the word list has no meaning for it
//   via-form   the meaning is that of another headword the form belongs to (check it's the same word)
//   pos        the meaning looks like another part of speech (a verb not glossed "to …", or the reverse);
//              the word list keeps only the first meaning of a headword, so a homograph may get the wrong one
//   long       the meaning is a definition or cut off rather than a short translation
export function flagsFor(row, found) {
  if (!found) return ['none'];
  const flags = [];
  if (found.lemma !== row.lemma) flags.push('via-form');
  const en = found.en ?? '';
  const toVerb = /^to /i.test(en);
  if (VERBISH.has(row.pos) && !toVerb) flags.push('pos');
  if (NOUNISH.has(row.pos) && toVerb) flags.push('pos');
  if (en.length > 80 || en.endsWith('…')) flags.push('long');
  return flags;
}

export function buildRows() {
  const byLevel = Object.fromEntries(LEVELS.map((l) => [l, []]));
  for (const row of readKelly()) {
    if (!byLevel[row.level]) continue;
    const found = meaning(row.lemma);
    byLevel[row.level].push({ ...row, en: found?.en ?? '', flags: flagsFor(row, found) });
  }
  // Most frequent first (Kelly's words per million), then alphabetically in Swedish order.
  for (const rows of Object.values(byLevel)) rows.sort((a, b) => (b.wpm - a.wpm) || a.lemma.localeCompare(b.lemma, 'sv'));
  return byLevel;
}

const clean = (s) => String(s).replace(/[\t\r\n]+/g, ' ').trim();

if (import.meta.url === `file://${process.argv[1]}`) {
  mkdirSync(OUT, { recursive: true });
  const byLevel = buildRows();
  for (const level of LEVELS) {
    const rows = byLevel[level];
    const lines = [
      `# grove library vocabulary, level ${level}. Words from the Swedish Kelly list (Språkbanken, CC BY-SA 3.0 / LGPL 3.0); meanings from the English Wiktionary via kaikki.org (CC BY-SA 4.0). Built by scripts/build-library-vocab.mjs; see content/library/README.md.`,
      'sv\tpos\tkind\tlevel\ten\tflags\twpm',
      ...rows.map((r) => [r.lemma, r.pos, r.kind, level, clean(r.en), r.flags.join(','), r.wpm].join('\t')),
    ];
    writeFileSync(join(OUT, `${level}.tsv`), `${lines.join('\n')}\n`);
    const flagged = rows.filter((r) => r.flags.length).length;
    const none = rows.filter((r) => r.flags.includes('none')).length;
    console.log(`${level}: ${rows.length} words, ${none} without a meaning, ${flagged} flagged`);
  }
}
