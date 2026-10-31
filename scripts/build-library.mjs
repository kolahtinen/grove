// Builds grove's library texts for the build (G-09 FR-916; addendum 005, RQ-438; RQ-464…RQ-466): reads the
// texts in content/library/texts/<level>.json (B-11, B-19; never texts-pending/), with each text's grammar
// patterns from content/library/patterns/<level>.json (name, explanation, places, level, ladder ID) and its
// own meanings, the rows of content/library/meanings.tsv that name it (not "*", which are the word list's
// corrections, G-02 FR-222). Each text with its patterns is checked by G-02's answer format and every
// pattern place must be found in its line; any failure stops the build. Writes
// server/library/grove-texts.json, which grove imports at start-up. Nothing grove runs reads content/.
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateAnswer } from '../server/texts/schema.mjs';

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const WORD = /\p{L}+(?:[-’']\p{L}+)*/gu; // as the reading page marks a place (G-03)
const wordsOf = (s) => String(s).toLowerCase().match(WORD) || [];

// form, lemma, en per text ID, from meanings.tsv's rows that name texts; a form keeps its first row.
export function textMeanings(tsv) {
  const byText = new Map();
  for (const line of String(tsv).split('\n')) {
    if (!line || line.startsWith('#')) continue;
    const [form, lemma, en, , texts] = line.split('\t');
    if (form === 'form' && lemma === 'lemma') continue;
    if (!form || !lemma || !en || !texts || texts.trim() === '*') continue;
    for (const id of texts.split(',').map((x) => x.trim()).filter(Boolean)) {
      const list = byText.get(id) ?? [];
      if (!list.some((m) => m.form === form)) list.push({ form, lemma, en });
      byText.set(id, list);
    }
  }
  return byText;
}

// Whether a place's words occur in a row in the line.
export function placeFound(lineSv, words) {
  const line = wordsOf(lineSv);
  const target = wordsOf(words);
  if (!target.length) return false;
  for (let i = 0; i + target.length <= line.length; i += 1) if (target.every((w, k) => line[i + k] === w)) return true;
  return false;
}

export function buildLibrary(root) {
  const lib = join(root, 'content/library');
  const patternsOf = new Map();
  for (const level of LEVELS) {
    const file = join(lib, 'patterns', `${level}.json`);
    if (!existsSync(file)) continue;
    for (const t of JSON.parse(readFileSync(file, 'utf8')).texts) patternsOf.set(t.id, t.patterns ?? []);
  }
  const meaningsFile = join(lib, 'meanings.tsv');
  const meaningsOf = existsSync(meaningsFile) ? textMeanings(readFileSync(meaningsFile, 'utf8')) : new Map();
  const dir = join(lib, 'texts');
  const out = [];
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.json')).sort()) {
    for (const t of JSON.parse(readFileSync(join(dir, file), 'utf8')).texts) {
      const patterns = (patternsOf.get(t.id) ?? []).map((p) => ({ name: p.name, explain_en: p.explain_en, level: p.level, ladder: p.ladder ?? null, places: p.places }));
      for (const p of patterns) {
        if (!LEVELS.includes(p.level)) throw new Error(`${t.id}: pattern "${p.name}" has no level A1–C2`);
        for (const place of p.places) {
          if (place.text !== 1 || !placeFound(t.lines[place.line - 1]?.sv ?? '', place.words)) {
            throw new Error(`${t.id}: pattern "${p.name}": "${place.words}" is not in line ${place.line}`);
          }
        }
      }
      const answer = {
        part: `LIB-${t.id}`,
        texts: [{ kind: t.kind, title: t.title, lines: t.lines, questions: t.questions }],
        new_words: [], new_phrases: [], inflections: [], names: t.names ?? [],
        patterns: patterns.map(({ name, explain_en, places }) => ({ name, explain_en, places })),
      };
      const checked = validateAnswer(answer);
      if (!checked.ok) throw new Error(`${t.id}: ${checked.problems.join('; ')}`);
      out.push({
        id: t.id, level: t.level, topic: t.topic, form: t.form, kind: t.kind, title: t.title, names: t.names ?? [],
        lines: t.lines, questions: t.questions, patterns, meanings: meaningsOf.get(t.id) ?? [],
      });
    }
  }
  return out;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = join(dirname(fileURLToPath(import.meta.url)), '..');
  const out = buildLibrary(root);
  writeFileSync(join(root, 'server/library/grove-texts.json'), `${JSON.stringify(out, null, 1)}\n`);
  console.log(`${out.length} grove texts, ${out.reduce((n, t) => n + t.patterns.length, 0)} patterns, ${out.reduce((n, t) => n + t.meanings.length, 0)} text meanings`);
}
