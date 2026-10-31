// Builds grove's word list (G-02 FR-222; research R10 of specs/002-texts-from-own-ai):
//   node scripts/build-lexicon.mjs data/kaikki.org-dictionary-Swedish.jsonl
//     server/lexicon/sv-en.tsv from kaikki.org's Swedish extract of the English Wiktionary;
//   node scripts/build-lexicon.mjs --corrections
//     server/lexicon/corrections.tsv from the rows of content/library/meanings.tsv marked * (RQ-466),
//     which grove reads before the list. Nothing grove runs reads content/.
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
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

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

// The corrections (RQ-466): meanings.tsv's rows (form, lemma, en, issue, texts) whose texts are "*",
// in the file's order; a row naming texts is that text's own meaning (G-09 FR-916), not a correction.
// A form listed twice keeps its first row.
export function parseCorrections(tsv) {
  const out = [];
  const seen = new Set();
  for (const line of String(tsv).split('\n')) {
    if (!line || line.startsWith('#')) continue;
    const [form, lemma, en, , texts] = line.split('\t');
    if (form === 'form' && lemma === 'lemma') continue;
    if (texts?.trim() !== '*' || !form || !lemma || !en) continue;
    const f = form.trim().toLowerCase();
    if (seen.has(f)) continue;
    seen.add(f);
    out.push({ form: f, lemma: lemma.trim().toLowerCase(), en: en.trim() });
  }
  return out;
}

export function correctionsTsv(rows) {
  const head = [
    '# Corrections to grove\'s word list (G-02 FR-222, RQ-466): forms the list leaves empty or gives another word\'s meaning.',
    '# Built by `node scripts/build-lexicon.mjs --corrections` from the rows of content/library/meanings.tsv marked * (written by Claude from each word\'s use in grove\'s texts).',
    '# <form> <dictionary form> <English meaning>; read before the list for that form.',
  ];
  return `${[...head, ...rows.map((r) => `${r.form}\t${r.lemma}\t${r.en}`)].join('\n')}\n`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (process.argv[2] === '--corrections') {
    const rows = parseCorrections(readFileSync(join(ROOT, 'content/library/meanings.tsv'), 'utf8'));
    writeFileSync(join(ROOT, 'server/lexicon/corrections.tsv'), correctionsTsv(rows));
    console.log(`build-lexicon: ${rows.length} corrections written to server/lexicon/corrections.tsv`);
  } else {
    const raw = readFileSync(process.argv[2]);
    const sha256 = createHash('sha256').update(raw).digest('hex');
    if (sha256 !== SHA256) throw new Error(`build-lexicon: unexpected file (sha256 ${sha256}); check it and update SHA256`);
    const parsed = parseKaikki(raw.toString('utf8'));
    writeFileSync(join(ROOT, 'server/lexicon/sv-en.tsv'), toTsv(parsed, { sha256 }));
    console.log(`build-lexicon: ${parsed.words.size} headwords, ${parsed.forms.size} forms written to server/lexicon/sv-en.tsv`);
  }
}
