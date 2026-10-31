// grove's Swedish–English word list (G-02 FR-222, FR-207; research R10): a meaning for every word,
// by its form or through the headword the form belongs to. Read when grove starts, in steps, as one
// of G-01 FR-032's start-up loads (research R14); a lookup before that finishes the load at once.
// Its corrections (RQ-466; question-pages/97, 3), the `*` rows of content/library/meanings.tsv built
// into corrections.tsv, come before the list's meaning for their form everywhere the list is used.
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const FILE = join(HERE, 'sv-en.tsv');
const CORRECTIONS = join(HERE, 'corrections.tsv');
const STEP = 10000;
let words = null;
let forms = null;
// Corrected forms: form → { lemma, en }; and corrected headwords (form = lemma): lemma → en.
let fixes = new Map();
let fixedHeads = new Map();
// The steps of a load that has started but not finished, so a lookup can finish it.
let pending = null;

function readCorrections(file) {
  const byForm = new Map();
  const heads = new Map();
  if (existsSync(file)) {
    for (const line of readFileSync(file, 'utf8').split('\n')) {
      if (!line || line.startsWith('#')) continue;
      const [form, lemma, en] = line.split('\t');
      if (!form || !lemma || !en) continue;
      byForm.set(form, { lemma, en });
      if (form === lemma) heads.set(lemma, en);
    }
  }
  return { byForm, heads };
}

// A start-up load: { name, size, steps } (research R14). Only the raw bytes are read and the data lines
// counted before grove listens; the steps decode them and fill new maps, put in place at the end.
export function lexiconLoad(file = FILE, correctionsFile = CORRECTIONS) {
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
      const it = readSteps(buf, starts, correctionsFile);
      pending = it;
      return it;
    },
  };
}

function* readSteps(buf, starts, correctionsFile) {
  const w = new Map();
  const f = new Map();
  const finish = () => {
    const c = readCorrections(correctionsFile);
    words = w;
    forms = f;
    fixes = c.byForm;
    fixedHeads = c.heads;
    pending = null;
  };
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
export function loadLexicon(file = FILE, correctionsFile = CORRECTIONS) {
  for (const _ of lexiconLoad(file, correctionsFile).steps());
}

function ready() {
  if (pending) {
    const it = pending;
    pending = null;
    for (const _ of it);
  }
  if (!words) loadLexicon();
}

// { lemma, en } for a form, or null when neither the corrections nor the list has it.
export function meaning(form) {
  ready();
  const f = String(form || '').trim().toLowerCase();
  const fixed = fixes.get(f);
  if (fixed) return { lemma: fixed.lemma, en: fixed.en };
  if (words.has(f)) return { lemma: f, en: words.get(f) };
  const lemma = forms.get(f);
  return lemma ? { lemma, en: fixedHeads.get(lemma) ?? words.get(lemma) } : null;
}

// The common dictionary (G-09 FR-917): headwords that start with the search first, then those that
// contain it, each group in Swedish order; at most `limit`. A corrected headword shows its correction.
const collator = new Intl.Collator('sv');
export function search(query, limit = 50) {
  ready();
  const q = String(query || '').trim().toLowerCase();
  if (q.length < 2) return [];
  const starts = [];
  const contains = [];
  const take = (lemma, en) => {
    if (lemma.startsWith(q)) starts.push({ lemma, en });
    else if (contains.length < limit && lemma.includes(q)) contains.push({ lemma, en });
  };
  for (const [lemma, en] of words) take(lemma, fixedHeads.get(lemma) ?? en);
  for (const [lemma, en] of fixedHeads) if (!words.has(lemma)) take(lemma, en);
  const order = (a, b) => (a.lemma.length - b.lemma.length) || collator.compare(a.lemma, b.lemma);
  return [...starts.sort(order), ...contains.sort(order)].slice(0, limit);
}
