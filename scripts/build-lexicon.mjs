// Builds server/lexicon/sv-en.tsv from kaikki.org's Swedish extract of the English Wiktionary
// (G-02 FR-222; research R10 of specs/002-texts-from-own-ai). Usage:
//   node scripts/build-lexicon.mjs data/kaikki.org-dictionary-Swedish.jsonl
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const SOURCE = 'Swedish–English word list from the English Wiktionary, via kaikki.org (wiktextract)';
export const LICENCE = 'CC BY-SA 4.0';
export const URL = 'https://kaikki.org/dictionary/Swedish/';
// The download this build was checked against (T-21); another file stops the build.
export const SHA256 = '9f698de54e6b515d1da5a8a06a2baef256954a3c502ecba519ca501b9c9a1bc7';
const MAX_GLOSS = 120;

// First gloss as plain text: markup and notes in brackets dropped, at most 120 characters.
export function cleanGloss(gloss) {
  let g = String(gloss).replace(/<[^>]*>/g, '').replace(/[<>]/g, '');
  for (let i = 0; i < 3; i += 1) g = g.replace(/\s*\([^()]*\)/g, '');
  g = g.replace(/\s+/g, ' ').trim().replace(/[;:,]$/, '');
  if (g.length > MAX_GLOSS) g = `${g.slice(0, MAX_GLOSS - 1).replace(/\s+\S*$/, '')}…`;
  return g;
}

export function parseKaikki(jsonl) {
  const words = new Map();
  const formsRaw = new Map();
  for (const line of jsonl.split('\n')) {
    if (!line.trim()) continue;
    const e = JSON.parse(line);
    if (e.lang_code !== 'sv' || typeof e.word !== 'string') continue;
    const word = e.word.toLowerCase();
    if (!word || word.length > 80 || /[\t\n]/.test(word)) continue;
    for (const sense of e.senses || []) {
      const formOf = sense.form_of || sense.alt_of;
      if (formOf || (sense.tags || []).includes('form-of')) {
        const target = formOf?.[0]?.word?.toLowerCase();
        if (target && !formsRaw.has(word)) formsRaw.set(word, target);
        continue;
      }
      const gloss = sense.glosses?.[0];
      if (!gloss || words.has(word)) continue;
      const clean = cleanGloss(gloss);
      if (clean) words.set(word, clean);
    }
  }
  const forms = new Map();
  for (const [form, lemma] of formsRaw) if (form !== lemma && words.has(lemma)) forms.set(form, lemma);
  return { words, forms };
}

export function toTsv({ words, forms }, { sha256 }) {
  const byWord = (a, b) => a[0].localeCompare(b[0], 'sv');
  const head = [
    `# ${SOURCE} (${URL}; https://www.wiktionary.org), licence ${LICENCE}.`,
    `# Built by scripts/build-lexicon.mjs from kaikki.org-dictionary-Swedish.jsonl sha256 ${sha256}; first gloss of each Swedish headword, notes in brackets dropped, plain text.`,
    '# w <headword> <English meaning> | f <inflected form> <headword>',
  ];
  const rows = [...[...words].sort(byWord).map(([w, en]) => `w\t${w}\t${en}`), ...[...forms].sort(byWord).map(([f, w]) => `f\t${f}\t${w}`)];
  return `${[...head, ...rows].join('\n')}\n`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const raw = readFileSync(process.argv[2]);
  const sha256 = createHash('sha256').update(raw).digest('hex');
  if (sha256 !== SHA256) throw new Error(`build-lexicon: unexpected file (sha256 ${sha256}); check it and update SHA256`);
  const parsed = parseKaikki(raw.toString('utf8'));
  const root = join(dirname(fileURLToPath(import.meta.url)), '..');
  writeFileSync(join(root, 'server/lexicon/sv-en.tsv'), toTsv(parsed, { sha256 }));
  console.log(`build-lexicon: ${parsed.words.size} headwords, ${parsed.forms.size} forms written to server/lexicon/sv-en.tsv`);
}
