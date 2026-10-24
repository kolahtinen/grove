// Builds server/levels/kelly-sv.tsv from Språkbanken's kelly.xml (FR-601; research R1 of
// specs/006-starting-level). Usage: node scripts/build-kelly.mjs path/to/kelly.xml
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const SOURCE = 'Swedish Kelly list, Språkbanken';
export const LICENCE = 'CC BY-SA 3.0, LGPL 3.0';
export const URL = 'https://spraakbanken.gu.se/en/resources/kelly';
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const tag = (entry, name) => entry.match(new RegExp(`<${name}>([^<]*)</${name}>`))?.[1] ?? '';

export function parseKellyXml(xml) {
  const byLemma = new Map();
  for (const m of xml.matchAll(/<LexicalEntry>([\s\S]*?)<\/LexicalEntry>/g)) {
    const raw = tag(m[1], 'gf').replace(/\s*\(.*$/, '').trim().toLowerCase();
    const cefr = Number(tag(m[1], 'cefr'));
    if (!raw || !(cefr >= 1 && cefr <= 6)) continue;
    const wpm = Number(tag(m[1], 'wpm').replace(/\s/g, '').replace(',', '.')) || 0;
    const row = { lemma: raw, level: LEVELS[cefr - 1], kind: raw.includes(' ') ? 'phrase' : 'word', pos: tag(m[1], 'pos'), wpm };
    const old = byLemma.get(raw);
    if (!old) byLemma.set(raw, row);
    else byLemma.set(raw, { ...old, level: LEVELS[Math.min(LEVELS.indexOf(old.level), cefr - 1)], wpm: Math.max(old.wpm, wpm) });
  }
  return [...byLemma.values()];
}

export function toTsv(rows, { sha256 }) {
  const head = [
    `# ${SOURCE} (${URL}), licence ${LICENCE}.`,
    `# Built by scripts/build-kelly.mjs from kelly.xml sha256 ${sha256}; notes in brackets dropped, forms lower-cased, duplicates kept once at their lowest level.`,
    'lemma\tlevel\tkind\tpos\twpm',
  ];
  return `${[...head, ...rows.map((r) => [r.lemma, r.level, r.kind, r.pos, r.wpm].join('\t'))].join('\n')}\n`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const xml = readFileSync(process.argv[2], 'utf8');
  const sha256 = createHash('sha256').update(xml).digest('hex');
  const rows = parseKellyXml(xml);
  const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'server', 'levels', 'kelly-sv.tsv');
  writeFileSync(out, toTsv(rows, { sha256 }));
  console.log(`build-kelly: ${rows.length} forms written to ${out}`);
}
