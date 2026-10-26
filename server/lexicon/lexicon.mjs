// grove's Swedish–English word list (G-02 FR-222, FR-207; research R10): a meaning for every word,
// by its form or through the headword the form belongs to. Loaded once, on first use.
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const FILE = join(dirname(fileURLToPath(import.meta.url)), 'sv-en.tsv');
let words = null;
let forms = null;

export function loadLexicon(file = FILE) {
  words = new Map();
  forms = new Map();
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    if (!line || line.startsWith('#')) continue;
    const [kind, a, b] = line.split('\t');
    if (kind === 'w') words.set(a, b);
    else if (kind === 'f') forms.set(a, b);
  }
}

// { lemma, en } for a form, or null when the list doesn't have it.
export function meaning(form) {
  if (!words) loadLexicon();
  const f = String(form || '').trim().toLowerCase();
  if (words.has(f)) return { lemma: f, en: words.get(f) };
  const lemma = forms.get(f);
  return lemma ? { lemma, en: words.get(lemma) } : null;
}
