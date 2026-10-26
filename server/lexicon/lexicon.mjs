// grove's Swedish–English word list (G-02 FR-222, FR-207; research R10): a meaning for every word,
// by its form or through the headword the form belongs to. Read when grove starts, in steps, as one
// of G-01 FR-032's start-up loads (research R14); a lookup before that finishes the load at once.
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const FILE = join(dirname(fileURLToPath(import.meta.url)), 'sv-en.tsv');
const STEP = 10000;
let words = null;
let forms = null;
// The steps of a load that has started but not finished, so a lookup can finish it.
let pending = null;

// A start-up load: { name, size, steps } (research R14). Only the raw bytes are read and the data lines
// counted before grove listens; the steps decode them and fill new maps, put in place at the end.
export function lexiconLoad(file = FILE) {
  const buf = readFileSync(file);
  // Byte offset where each data line starts (comment and empty lines skipped).
  const starts = [];
  for (let at = 0; at < buf.length;) {
    const nl = buf.indexOf(10, at);
    const end = nl === -1 ? buf.length : nl;
    if (end > at && buf[at] !== 0x23) starts.push(at);
    at = end + 1;
  }
  return {
    name: 'word list',
    size: starts.length,
    steps() {
      const it = readSteps(buf, starts);
      pending = it;
      return it;
    },
  };
}

function* readSteps(buf, starts) {
  const w = new Map();
  const f = new Map();
  const finish = () => { words = w; forms = f; pending = null; };
  if (!starts.length) finish();
  for (let first = 0; first < starts.length; first += STEP) {
    const last = Math.min(first + STEP, starts.length);
    const until = last < starts.length ? starts[last] : buf.length;
    for (const line of buf.toString('utf8', starts[first], until).split('\n')) {
      if (!line || line.startsWith('#')) continue;
      const [kind, a, b] = line.split('\t');
      if (kind === 'w') w.set(a, b);
      else if (kind === 'f') f.set(a, b);
    }
    if (last === starts.length) finish();
    yield last - first;
  }
}

// Reads the whole list at once (owner commands, scripts, a lookup before the start-up load).
export function loadLexicon(file = FILE) {
  for (const _ of lexiconLoad(file).steps());
}

function ready() {
  if (pending) {
    const it = pending;
    pending = null;
    for (const _ of it);
  }
  if (!words) loadLexicon();
}

// { lemma, en } for a form, or null when the list doesn't have it.
export function meaning(form) {
  ready();
  const f = String(form || '').trim().toLowerCase();
  if (words.has(f)) return { lemma: f, en: words.get(f) };
  const lemma = forms.get(f);
  return lemma ? { lemma, en: words.get(lemma) } : null;
}
