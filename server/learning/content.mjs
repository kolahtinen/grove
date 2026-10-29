// grove's learning content (G-09 FR-930; B-26, question-pages/89): reads the approved files in
// content/learning/, checks every item and turns them into learning items in their order. Used by
// scripts/build-learning.mjs at build time and by the tests; nothing grove runs reads content/.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const WORD = /\p{L}+(?:[-’']\p{L}+)*/gu;
export const words = (s) => (String(s).toLowerCase().match(WORD) || []);

// The word's id: one item per dictionary form.
export const wordId = (lemma) => `W-${String(lemma).trim().toLowerCase()}`;

function read(dir, file, problems) {
  const json = JSON.parse(readFileSync(join(dir, file), 'utf8'));
  if (json.status !== 'approved') problems.push(`${file}: status is "${json.status}", not "approved"`);
  return json;
}

// Whether `mark` occurs in `sv` as whole words (case aside).
export function hasMark(sv, mark) {
  const a = words(sv);
  const b = words(mark);
  if (!b.length) return false;
  for (let i = 0; i + b.length <= a.length; i += 1) if (b.every((w, k) => a[i + k] === w)) return true;
  return false;
}

export function buildContent(dir) {
  const problems = [];
  const items = [];
  const level = (x, where) => { if (!LEVELS.includes(x)) problems.push(`${where}: level ${x}`); return x; };

  const grammar = read(dir, 'grammar/patterns.json', problems);
  const seen = new Set();
  grammar.patterns.forEach((p, position) => {
    if (!/^G-(A1|A2|B1|B2|C1|C2)-\d{2}$/.test(p.id) || seen.has(p.id)) problems.push(`pattern id ${p.id}`);
    seen.add(p.id);
    level(p.level, p.id);
    if (!p.name || p.name.length > 80) problems.push(`${p.id}: name`);
    if (!p.explain_en || p.explain_en.length > 300) problems.push(`${p.id}: explain_en`);
    for (const e of p.examples) if (!hasMark(e.sv, e.mark)) problems.push(`${p.id}: example mark "${e.mark}" not in "${e.sv}"`);
    for (const s of p.spot) {
      const line = p.text.lines[s.line];
      if (!line) problems.push(`${p.id}: spot line ${s.line}`);
      else if (!hasMark(line.sv, s.mark)) problems.push(`${p.id}: spot mark "${s.mark}" not in line ${s.line}`);
    }
    items.push({ id: p.id, type: 'pattern', level: p.level, position, data: { name: p.name, explain: p.explain_en, howToSpot: p.how_to_spot, examples: p.examples.map(({ sv, en, mark }) => ({ sv, en, mark })), text: p.text, spot: p.spot.map(({ line, mark }) => ({ line, mark })) } });
  });

  const phrases = read(dir, 'words/phrases.json', problems);
  phrases.phrases.forEach((p, position) => {
    if (!/^P-(A1|A2|B1|B2|C1|C2)-\d{2}$/.test(p.id) || seen.has(p.id)) problems.push(`phrase id ${p.id}`);
    seen.add(p.id);
    level(p.level, p.id);
    if (!p.phrase || !p.en || (p.examples || []).length < 2) problems.push(`${p.id}: phrase, meaning or examples`);
    items.push({ id: p.id, type: 'phrase', level: p.level, position, data: { phrase: p.phrase, en: p.en, note: p.note ?? '', examples: p.examples.map(({ sv, en }) => ({ sv, en })) } });
  });

  // Next words first, then the topic words; a form in both is one item (the next words' entry).
  const next = read(dir, 'words/next-words.json', problems);
  const topics = read(dir, 'words/topics.json', problems);
  let position = 0;
  const addWord = (w, lvl, topic) => {
    const id = wordId(w.lemma);
    if (seen.has(id)) return;
    seen.add(id);
    level(lvl, id);
    if (!w.lemma || !w.en || !w.example?.sv) problems.push(`${id}: lemma, meaning or example`);
    items.push({ id, type: 'word', level: lvl, position: position++, data: { lemma: w.lemma, pos: w.pos, en: w.en, example: { sv: w.example.sv, en: w.example.en }, ...(topic ? { topic } : {}) } });
  };
  for (const w of next.words) addWord(w, w.level, null);
  for (const cell of topics.topics) for (const w of cell.words) addWord(w, cell.level, cell.topic);

  return { items, problems };
}
