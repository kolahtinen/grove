// Prototype logic shared by the UI: lexicon, annotation, the ground/drilling model, difficulty, levels.
import { TOPICS, WORDS, PHRASES, PATTERNS, SENTENCES } from "./seed.js";

export const DAY = 86400000;

// ---------- lexicon ----------
export function buildLexicon(state) {
  const c = state.custom || {};
  const words = [...WORDS, ...(c.words || [])];
  const phrases = [...PHRASES, ...(c.phrases || [])];
  const topics = [...TOPICS, ...(c.topics || [])];
  const sentences = [...SENTENCES, ...(c.sentences || [])];
  const byId = new Map();
  const formMap = new Map();
  const extra = c.extraForms || {}; // inflections learned from AI answers, per word id
  for (const w of words) {
    byId.set(w.id, w);
    if (extra[w.id]) w.forms = [...new Set([...w.forms, ...extra[w.id]])];
    for (const f of [...w.forms, ...(w.past || [])]) if (!formMap.has(f.toLowerCase())) formMap.set(f.toLowerCase(), w.id);
  }
  for (const p of phrases) byId.set(p.id, p);
  const defForms = words.flatMap((w) => w.def || []);
  const pastForms = words.flatMap((w) => w.past || []);
  const patterns = PATTERNS.map((p) => {
    let src = p.regex;
    if (p.regexFrom === "def") src = `\\b(?:${defForms.join("|")})\\b`;
    if (p.regexFrom === "past") src = `\\b(?:${pastForms.join("|")})\\b`;
    return { ...p, re: new RegExp(src.replaceAll("\\b", B), "giu") };
  });
  for (const p of patterns) byId.set(p.id, p);
  const phraseForms = phrases
    .flatMap((p) => p.forms.map((f) => ({ id: p.id, toks: f.toLowerCase().split(/\s+/) })))
    .sort((a, b) => b.toks.length - a.toks.length);
  const names = new Set((c.names || []).map((n) => n.toLowerCase())); // character names never count as new
  return { words, phrases, patterns, topics, sentences, byId, formMap, phraseForms, names };
}

// \b doesn't know å/ä/ö; use unicode-aware boundaries instead.
const B = "(?:(?<![\\p{L}])(?=[\\p{L}])|(?<=[\\p{L}])(?![\\p{L}]))";

export function tokenize(text) {
  const out = [];
  for (const m of text.matchAll(/\p{L}+/gu)) out.push({ t: m[0], lower: m[0].toLowerCase(), start: m.index, end: m.index + m[0].length });
  return out;
}

export function annotate(text, lex) {
  const tokens = tokenize(text).map((t) => ({ ...t, wordId: lex.formMap.get(t.lower) || null, phraseIds: [] }));
  const items = new Set();
  for (const pf of lex.phraseForms) {
    for (let i = 0; i + pf.toks.length <= tokens.length; i++) {
      if (pf.toks.every((tk, k) => tokens[i + k].lower === tk) && !tokens[i].phraseIds.includes(pf.id)) {
        for (let k = 0; k < pf.toks.length; k++) tokens[i + k].phraseIds.push(pf.id);
        items.add(pf.id);
      }
    }
  }
  const unknown = [];
  for (const t of tokens) {
    if (t.wordId) items.add(t.wordId);
    else if (lex.names?.has(t.lower)) t.name = true;
    else if (!unknown.includes(t.lower)) unknown.push(t.lower);
  }
  const patternSpans = [];
  for (const p of lex.patterns) {
    p.re.lastIndex = 0;
    for (const m of text.matchAll(p.re)) {
      let s = m.index, e = m.index + m[0].length;
      while (s < e && !/\p{L}/u.test(text[s])) s++;
      patternSpans.push({ id: p.id, start: s, end: e });
      items.add(p.id);
    }
  }
  return { text, tokens, items: [...items], unknown, patternSpans };
}

// ---------- ground / drilling model (round 3: PR-p1-12, PR-p1-36, PR-p1-40) ----------
// ground: the learner's known vocabulary; it doesn't fade.
// drill: words/phrases the learner marked; spaced repetition; they join the ground when drilling succeeds.
// patterns keep plain spaced repetition (they aren't part of marking).
const maturity = (s) => Math.min(1, s.stab / 4);
export const isPattern = (id) => id.startsWith("g:");
export function strength(state, id, now = Date.now()) {
  const s = state.srs[id];
  if (!s || !s.reps) return 0;
  return Math.exp(-(now - s.last) / DAY / s.stab) * maturity(s);
}
export function status(state, id, now = Date.now()) {
  if (state.ground[id]) return "ground";
  const s = state.srs[id];
  if (isPattern(id)) {
    if (!s || !s.reps) return "new";
    if (strength(state, id, now) >= 0.5) return "ground";
    return maturity(s) >= 0.5 ? "fading" : "drilling";
  }
  if (state.drill[id]) return s && s.reps && strength(state, id, now) < 0.2 ? "fading" : "drilling";
  return "new";
}
export const STATUS_LABEL = { ground: "known", drilling: "drilling", fading: "fading", new: "new" };
const active = (st) => st === "ground" || st === "drilling" || st === "fading";
export function locked(state, item, now) {
  return status(state, item.id, now) === "new" && (item.deps || []).some((d) => !active(status(state, d, now)));
}
export function atRisk(state, item, now) {
  return active(status(state, item.id, now)) && (item.deps || []).some((d) => status(state, d, now) === "fading");
}

export function markDrill(state, id, now = Date.now()) {
  delete state.ground[id];
  state.drill[id] = { since: now };
  state.srs[id] ||= { stab: 0, last: now, reps: 0 };
}
export function addGround(state, id, via, now = Date.now()) {
  delete state.drill[id];
  state.ground[id] = { since: now, via };
}
// Returns "promoted" when a drilled item joins the ground (drilling succeeded).
export function grade(state, id, ok, ex, now = Date.now()) {
  const s = state.srs[id] || { stab: 0, last: now, reps: 0 };
  if (ok) { s.stab = s.stab ? Math.min(365, s.stab * 2.5) : 1; s.reps++; }
  else { s.stab = Math.max(0.5, (s.stab || 1) * 0.4); s.reps = Math.max(1, s.reps); }
  s.last = now;
  state.srs[id] = s;
  state.history.push({ t: now, id, ok, ex });
  if (state.drill[id] && ok && s.stab >= 4) { addGround(state, id, "drill", now); return "promoted"; }
  return null;
}
// Meeting an item in a text: counted (PR-p1-35) with its first context; patterns get a light review.
export function meet(state, id, ctx, now = Date.now()) {
  state.met[id] = (state.met[id] || 0) + 1;
  if (ctx && !state.contexts[id]) state.contexts[id] = ctx;
  const s = state.srs[id];
  if (isPattern(id) && s && s.reps) { s.stab = Math.min(365, s.stab * 1.15); s.last = now; }
}

export function snapshot(state, lex, now = Date.now()) {
  const date = new Date(now).toISOString().slice(0, 10);
  const learned = Object.keys(state.ground).length;
  state.snapshots = (state.snapshots || []).filter((s) => s.date !== date);
  state.snapshots.push({ date, learned });
}

export const allItems = (lex) => [...lex.words, ...lex.phrases, ...lex.patterns];

// i+1 (PR-p1-06): new = words and phrases the learner hasn't met, plus unknown forms. Patterns don't count.
export function newItems(annot, state, now) {
  return annot.items.filter((id) => !isPattern(id) && status(state, id, now) === "new").length + annot.unknown.length;
}

// Practice only what's being drilled (PR-p1-36), fading first; patterns by their own spaced repetition.
export function pickTarget(state, lex, types, now = Date.now()) {
  const rank = { fading: 0, drilling: 1, new: 2, ground: 3 };
  const cands = allItems(lex)
    .filter((i) => types.includes(i.type))
    .map((i) => ({ i, st: status(state, i.id, now), str: strength(state, i.id, now) }))
    .filter((c) => (c.i.type === "pattern" ? true : c.st === "drilling" || c.st === "fading"))
    .map((c) => ({ ...c, sent: sentencesFor(c.i.id, state, lex, now) }))
    .filter((c) => c.sent.length && c.sent[0].nNew <= 1)
    .sort((a, b) => rank[a.st] - rank[b.st] || a.str - b.str);
  const top = cands.slice(0, 5);
  return top.length ? top[Math.floor(Math.random() * top.length)] : null;
}

const annCache = new Map();
export function annotated(sentence, lex) {
  const key = sentence.id + "|" + lex.words.length + "|" + lex.phrases.length;
  if (!annCache.has(key)) annCache.set(key, annotate(sentence.sv, lex));
  return annCache.get(key);
}
export function sentencesFor(id, state, lex, now) {
  return lex.sentences
    .map((s) => ({ s, a: annotated(s, lex) }))
    .filter((x) => x.s.en && x.a.items.includes(id))
    .map((x) => ({ ...x, nNew: newItems(x.a, state, now) }))
    .sort((a, b) => a.nNew - b.nNew || Math.random() - 0.5);
}

// ---------- difficulty from ratings (PR-p1-33) ----------
// Ratings 1–5. 1–2: fewer new words, shorter sentences, offer a simpler retelling.
// Three 4–5 ratings in a row: slightly more new words. Known share stays between 93% and 98%.
export const RATINGS = [
  [1, "Nästan inget", "almost nothing"], [2, "Lite", "a little"], [3, "Hälften", "about half"],
  [4, "Det mesta", "most of it"], [5, "Allt", "everything"],
];
export const understood = (r) => r >= 4; // page 06 Q7
export function applyRating(state, r) {
  const d = (state.difficulty ||= { knownShare: 0.95, short: false, goodStreak: 0 });
  if (r <= 2) { d.knownShare = Math.min(0.98, +(d.knownShare + 0.01).toFixed(2)); d.short = true; d.goodStreak = 0; }
  else if (r === 3) { d.goodStreak = 0; }
  else { d.short = false; d.goodStreak++; if (d.goodStreak >= 3) { d.knownShare = Math.max(0.93, +(d.knownShare - 0.01).toFixed(2)); d.goodStreak = 0; } }
  return d;
}

// ---------- levels (PR-p1-32, PR-p1-35): rough CEFR estimate from the size of the ground ----------
export const LEVELS = [["Pre-A1", 0], ["A1", 250], ["A2", 750], ["B1", 1500], ["B2", 3000], ["C1", 6000], ["C2", 10000]];
// X-p1-04: with a frequency list whose words carry CEFR tags, the level is the highest one such that it and every level
// below it have most (80%) of their own words in the ground; C1/C2 mean 'beyond the list'. Without the list, the old word-count estimate (PR-p1-64).
const TAGGED = ["A1", "A2", "B1", "B2", "C1", "C2"];
export function levelOf(state, lex, freq) {
  const n = lex.words.filter((w) => state.ground[w.id]).length;
  if (freq?.length) {
    const ids = (lv) => freq.filter((f) => f.level === lv).map((f) => lex.formMap.get(f.lemma)).filter(Boolean); // each level on its own words
    const tags = TAGGED.filter((lv) => freq.some((f) => f.level === lv));
    let cur = -1;
    for (const lv of tags) { const all = ids(lv); if (all.length && all.filter((id) => state.ground[id]).length / all.length >= 0.8) cur = TAGGED.indexOf(lv); else break; }
    const nextLv = tags.find((lv) => TAGGED.indexOf(lv) > cur);
    const need = nextLv ? Math.max(0, Math.ceil(ids(nextLv).length * 0.8) - ids(nextLv).filter((id) => state.ground[id]).length) : 0;
    const name = cur < 0 ? "Pre-A1" : TAGGED[cur];
    return { name, words: n, next: nextLv ? { name: nextLv, at: n + need } : null, index: LEVELS.findIndex((l) => l[0] === name), tagged: true };
  }
  let cur = LEVELS[0];
  for (const l of LEVELS) if (n >= l[1]) cur = l;
  const next = LEVELS[LEVELS.indexOf(cur) + 1];
  return { name: cur[0], words: n, next: next ? { name: next[0], at: next[1] } : null, index: LEVELS.indexOf(cur) };
}
export const inputHours = (state) => (state.inputLog || []).reduce((a, e) => a + e.ms, 0) / 3600000;

// ---------- skills (PR-p1-04) ----------
export const EX_SKILL = { flashcard: "vocabulary", mc: "vocabulary", translate: "writing", tiles: "grammar", gap: "grammar", write: "writing", reading: "reading", listening: "listening" };
export const SKILL_ACTIVITY = { reading: ["reading"], listening: ["listening"], vocabulary: ["flashcard", "mc"], grammar: ["tiles", "gap"], writing: ["translate", "write"] };
// PR-p1-37 (changed): the sliders alone decide; no extra weight on input.
export function pickBySliders(sliders) {
  const w = Object.entries(sliders).filter(([, v]) => v > 0);
  const total = w.reduce((a, [, v]) => a + v, 0);
  let r = Math.random() * total;
  for (const [k, v] of w) { if ((r -= v) <= 0) { const acts = SKILL_ACTIVITY[k]; return acts[Math.floor(Math.random() * acts.length)]; } }
  return "reading";
}
