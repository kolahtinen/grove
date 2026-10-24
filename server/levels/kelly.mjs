// Reads the Kelly TSV carried in the build (FR-601).
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const KELLY_FILE = join(dirname(fileURLToPath(import.meta.url)), 'kelly-sv.tsv');

export function readKelly(file = KELLY_FILE) {
  const rows = [];
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    if (!line || line.startsWith('#') || line.startsWith('lemma\t')) continue;
    const [lemma, level, kind, pos, wpm] = line.split('\t');
    rows.push({ lemma, level, kind, pos, wpm: Number(wpm) });
  }
  return rows;
}
