// Copy-paste AI (PR-p1-24…PR-p1-27): prompts that work in any chat AI, and strict checks on the pasted JSON.
import { tokenize, annotate, status, isPattern } from "./core.js";

const FORMAT = (example) => `Reply with ONLY one \`\`\`json code block in exactly this format, and no other text:
\`\`\`json
${JSON.stringify(example, null, 2)}
\`\`\``;

const intro = "I'm learning Swedish (my own language is English) with an app called grove. It gives me comprehensible input: texts where I know almost every word.";

const active = (st) => st === "ground" || st === "drilling" || st === "fading";
export function knownLemmas(lex, state) {
  return lex.words.filter((w) => active(status(state, w.id))).map((w) => w.sv);
}
export function fadingLemmas(lex, state) {
  return [...lex.words, ...lex.phrases].filter((i) => status(state, i.id) === "fading").map((i) => i.sv);
}
export function unlearnedPhrases(lex, state) {
  return lex.phrases.filter((p) => status(state, p.id) === "new").map((p) => p.sv);
}

// ---------- parsing ----------
export function parseAnswer(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  let src = fenced ? fenced[1] : text;
  if (!fenced) { const a = src.indexOf("{"), b = src.lastIndexOf("}"); if (a >= 0 && b > a) src = src.slice(a, b + 1); }
  try { return { data: JSON.parse(src) }; }
  catch (e) { return { problems: [`The answer isn't valid JSON (${e.message}). If it was cut off, ask for a smaller part.`] }; }
}
export function fixPrompt(problems) {
  return `Your previous answer had these problems:\n${problems.map((p) => "- " + p).join("\n")}\n\nPlease answer again with a corrected version: only one \`\`\`json code block, in the same format as before.`;
}

const isStr = (x) => typeof x === "string" && x.trim().length > 0;
const isArr = (x) => Array.isArray(x);

// ---------- i+1 check (PR-p1-06): new = words and phrases ----------
// PR-p1-130: answers within a margin are accepted: about 1 sentence in 10 may have one new item too many,
// and the text as a whole may be about 2 percentage points over the new-word share. (The exact margins are set after testing.)
export const TOLERANCE = { extraSentenceShare: 0.1, sharePoints: 0.02 };
export function checkSentences(sentences, decl, lex, state, { maxPerSentence = 1, share = 0.05, label = "Sentence", tolerant = true } = {}) {
  const { newWords = [], newPhrases = [], inflections = [], names = [] } = decl;
  const problems = [];
  const newForms = new Map(newWords.map((w) => [String(w.form || w.lemma).toLowerCase(), w]));
  const infl = new Map(inflections.map((i) => [String(i.form).toLowerCase(), String(i.lemma).toLowerCase()]));
  const nameSet = new Set(names.map((n) => String(n).toLowerCase()));
  const phraseList = newPhrases.map((p) => String(p.sv).toLowerCase()).filter(Boolean);
  const allNew = new Set(), over = [];
  let total = 0;
  sentences.forEach((s, i) => {
    const where = `${label} ${i + 1} ("${s.sv}")`;
    if (!isStr(s.sv) || !isStr(s.en)) { problems.push(`${label} ${i + 1} needs both "sv" and "en".`); return; }
    const fresh = new Set();
    for (const t of tokenize(s.sv)) {
      total++;
      if (nameSet.has(t.lower) || lex.names?.has(t.lower)) continue;
      const id = lex.formMap.get(t.lower) || (infl.has(t.lower) && lex.formMap.get(infl.get(t.lower)));
      if (id) { if (status(state, id) === "new") fresh.add(lex.byId.get(id).sv); continue; }
      if (newForms.has(t.lower)) { fresh.add(newForms.get(t.lower).lemma || t.lower); continue; }
      problems.push(`${where} uses "${t.t}", which is not in my known words. List it in "new_words" (or "inflections" if it is a form of a known word, or "names" if it is a name).`);
    }
    for (const id of annotate(s.sv, lex).items) if (!isPattern(id) && lex.byId.get(id)?.type === "phrase" && status(state, id) === "new") fresh.add(lex.byId.get(id).sv);
    for (const p of phraseList) if (s.sv.toLowerCase().includes(p)) fresh.add(p);
    if (fresh.size > maxPerSentence) over.push({ where, fresh, n: fresh.size });
    fresh.forEach((f) => allNew.add(f));
  });
  const allowedOver = tolerant ? Math.floor(sentences.length * TOLERANCE.extraSentenceShare) : 0;
  const slight = over.filter((o) => o.n === maxPerSentence + 1);
  const flagged = [...over.filter((o) => o.n > maxPerSentence + 1), ...slight.slice(allowedOver)];
  for (const o of flagged) problems.push(`${o.where} has ${o.n} new words/phrases (${[...o.fresh].join(", ")}); at most ${maxPerSentence} allowed. Rewrite it with known words.`);
  const budget = Math.max(maxPerSentence ? 1 : 0, Math.ceil((share + (tolerant ? TOLERANCE.sharePoints : 0)) * total));
  if (sentences.length > 2 && allNew.size > budget) problems.push(`${label.replace(/, line$/, "")} has ${allNew.size} new words/phrases (${[...allNew].join(", ")}) in ${total} words; at most ${budget} (about ${Math.round(share * 100)}%) allowed. Use fewer new words.`);
  return problems;
}

// ---------- content packages (PR-p1-29…PR-p1-31, PR-p1-30) ----------
export const UNIT = {
  episode: { label: "Story episode", plural: "Story episodes", min: 5, words: 250 },
  retell: { label: "Retelling", plural: "Retellings", min: 4, words: 150 },
  dialogue: { label: "Dialogue", plural: "Dialogues", min: 4, words: 150 },
  cyoa: { label: "Choose-your-path story", plural: "Choose-your-path stories", min: 6, words: 250 },
};

function unitSpec(u, i) {
  const n = `${i + 1}. ${u.easy ? "[EASY READ: use ONLY my known words – no new words or phrases at all] " : ""}`;
  if (u.kind === "episode") {
    const s = u.series;
    return s.isNew
      ? `${n}Episode 1 of a NEW story series (about ${UNIT.episode.words} words). Topic: ${s.topic}. Invent the characters (give them names) and the setting, and give the series a short Swedish title.`
      : `${n}Episode ${u.episode} of the story series "${s.title}" (about ${UNIT.episode.words} words). Story so far: ${s.summary} ${s.lastNew?.length ? `Reuse these words from the last episode: ${s.lastNew.join(", ")}.` : ""}`;
  }
  if (u.kind === "retell") return `${n}Retell the text "${u.source.title}" ${u.how} (about ${UNIT.retell.words} words). The original:\n"""\n${u.source.text}\n"""`;
  if (u.kind === "dialogue") return `${n}A dialogue between two people about ${u.topic} (about ${UNIT.dialogue.words} words, 10–16 lines). Give every line a speaker name.`;
  return `${n}A choose-your-path story about ${u.topic} (about ${UNIT.cyoa.words} words in total): a start part that ends with 2–3 choices; each choice leads to a short part that either ends the story or offers 2 more choices leading to endings. Pre-write every branch.`;
}

export function packagePrompt({ units, known, fading, newPhrases, difficulty, partNo, partCount }) {
  const ks = Math.round(difficulty.knownShare * 100);
  const minutes = units.reduce((a, u) => a + UNIT[u.kind].min, 0);
  return `${intro}

${partCount > 1 ? `This is part ${partNo} of ${partCount} of a content package. ` : ""}Please write these texts (about ${minutes} minutes of reading and listening):

${units.map(unitSpec).join("\n\n")}

After every text, add 2–3 comprehension questions in simple Swedish, each with 2–3 answer options (also simple Swedish) and the index of the right option.

Language rules for ALL Swedish text, including questions and choices:
- Use my known words (any inflection is fine): ${known.join(", ")}
- About ${ks}% of the words in each text must be known: at most ONE new word or new fixed phrase per sentence, and at most ${100 - ks}% new words in each text.
${difficulty.short ? "- Keep sentences short and simple (at most about 8 words).\n" : ""}${fading.length ? `- Please reuse these words I'm practising: ${fading.join(", ")}\n` : ""}${newPhrases.length ? `- These fixed phrases are new to me and count as new: ${newPhrases.join(", ")}\n` : ""}- Names of people and places are fine; list them in "names".
- List every new word in "new_words" with a short English meaning and a simple Swedish explanation that uses known words ("explain_sv"). List new fixed phrases in "new_phrases". List inflected forms of known words that aren't spelled as in my list in "inflections".
- Give an English translation for every line.

${FORMAT({
    texts: [{ kind: "episode | retell | dialogue | cyoa (same order as above)", title: "…", series: "series title (episodes only)", episode: 1,
      lines: [{ speaker: "name (dialogues only)", sv: "…", en: "…" }],
      nodes: [{ id: "start", lines: [{ sv: "…", en: "…" }], choices: [{ sv: "…", en: "…", to: "node id" }] }],
      questions: [{ q: "…", options: ["…", "…"], answer: 0 }] }],
    new_words: [{ form: "as written", lemma: "dictionary form", en: "meaning", explain_sv: "enkel förklaring" }],
    new_phrases: [{ sv: "…", en: "…", explain_sv: "…" }],
    inflections: [{ form: "as written", lemma: "the known word" }],
    names: ["…"],
    series_summaries: [{ series: "series title", summary: "the story so far, in English, 2–4 sentences" }],
  })}
(For non-cyoa texts leave "nodes" empty; for cyoa texts leave "lines" empty.)`;
}

export function textSentences(t) {
  return t.kind === "cyoa" ? (t.nodes || []).flatMap((n) => [...(n.lines || []), ...(n.choices || [])]) : t.lines || [];
}

export function checkPackage(d, units, lex, state, difficulty) {
  const p = [];
  if (!isArr(d.texts)) return [`"texts" must be a list.`];
  if (d.texts.length !== units.length) p.push(`I asked for ${units.length} texts but got ${d.texts.length}.`);
  const decl = { newWords: d.new_words || [], newPhrases: d.new_phrases || [], inflections: d.inflections || [], names: d.names || [] };
  d.texts.forEach((t, i) => {
    const u = units[i], label = `Text ${i + 1}${t.title ? ` "${t.title}"` : ""}`;
    if (u && t.kind !== u.kind) p.push(`${label} should be a "${u.kind}" but is "${t.kind}".`);
    if (!isStr(t.title)) p.push(`${label} needs a "title".`);
    if (t.kind === "cyoa") {
      const nodes = t.nodes || [];
      const ids = new Set(nodes.map((n) => n.id));
      if (!ids.has("start")) p.push(`${label}: the nodes need one with id "start".`);
      for (const n of nodes) for (const c of n.choices || []) if (!ids.has(c.to)) p.push(`${label}: choice "${c.sv}" leads to "${c.to}", which doesn't exist.`);
      const seen = new Set(), stack = ["start"];
      while (stack.length) { const id = stack.pop(); if (seen.has(id)) continue; seen.add(id); for (const c of nodes.find((n) => n.id === id)?.choices || []) stack.push(c.to); }
      for (const n of nodes) if (!seen.has(n.id)) p.push(`${label}: node "${n.id}" can't be reached from "start".`);
      if (!nodes.some((n) => !(n.choices || []).length)) p.push(`${label}: there must be at least one ending (a node without choices).`);
    } else if (!isArr(t.lines) || !t.lines.length) p.push(`${label} needs "lines".`);
    if (t.kind === "dialogue" && (t.lines || []).some((l) => !isStr(l.speaker))) p.push(`${label}: every dialogue line needs a "speaker".`);
    if (t.kind === "episode" && !isStr(t.series)) p.push(`${label} needs the "series" title.`);
    p.push(...checkSentences(textSentences(t), decl, lex, state, u?.easy ? { maxPerSentence: 0, share: 0, label: `${label} (easy read), line` } : { share: 1 - difficulty.knownShare, label: `${label}, line` }));
    for (const [qi, q] of (t.questions || []).entries()) {
      if (!isStr(q.q) || !isArr(q.options) || q.options.length < 2 || !(q.answer >= 0 && q.answer < q.options.length)) p.push(`${label}, question ${qi + 1} needs "q", 2–3 "options" and a valid "answer" index.`);
      else p.push(...checkSentences([{ sv: q.q, en: "-" }, ...q.options.map((o) => ({ sv: o, en: "-" }))], decl, lex, state, { share: 1, label: `${label}, question ${qi + 1} part` }));
    }
  });
  for (const w of decl.newWords) if (!isStr(w.lemma) || !isStr(w.en) || !isStr(w.explain_sv)) { p.push(`Every item in "new_words" needs "form", "lemma", "en" and "explain_sv".`); break; }
  if (units.some((u) => u.kind === "episode") && !(d.series_summaries || []).length) p.push(`Please add "series_summaries" with the story so far for each series.`);
  return [...new Set(p)];
}

// ---------- meanings for unknown words in a pasted text ----------
export function glossPrompt({ words, context }) {
  return `${intro}

Give short meanings for these Swedish words from a text I'm reading: ${words.join(", ")}

The text, for context:
"""
${context}
"""

Give one entry for every word, with "form" spelled exactly as in my list, a short English meaning, and a simple Swedish explanation.

${FORMAT({ glosses: [{ form: "as in my list", lemma: "dictionary form", en: "short meaning", explain_sv: "enkel förklaring" }] })}`;
}
export function checkGloss(d, words) {
  if (!isArr(d.glosses)) return [`"glosses" must be a list.`];
  const got = new Set(d.glosses.map((g) => String(g.form).toLowerCase()));
  const missing = words.filter((w) => !got.has(w));
  const p = missing.length ? [`These words have no entry: ${missing.join(", ")}.`] : [];
  if (d.glosses.some((g) => !isStr(g.lemma) || !isStr(g.en))) p.push(`Every gloss needs "form", "lemma" and "en".`);
  return p;
}

// ---------- starter vocabulary for a topic (PR-p1-05) ----------
export function topicPrompt({ topic, known }) {
  return `${intro}

I want to start learning the topic: ${topic}.

Give me:
- 12 useful new Swedish words for this topic that are NOT in my known words, each with its common inflected forms (including the dictionary form), an English meaning and a simple Swedish explanation;
- 5 short phrases built from my known words plus these new words;
- 8 example sentences. Each sentence may use at most ONE of the new words; everything else must be my known words (any inflection is fine — list such forms in "inflections").

My known words: ${known.join(", ")}

${FORMAT({ words: [{ lemma: "…", forms: ["…", "…"], en: "…", explain_sv: "…" }], phrases: [{ sv: "…", en: "…" }], sentences: [{ sv: "…", en: "…" }], inflections: [{ form: "…", lemma: "the known word" }] })}`;
}
export function checkTopic(d, lex, state) {
  const p = [];
  if (!isArr(d.words) || d.words.length < 5) return [`"words" must be a list of about 12 words.`];
  for (const w of d.words) if (!isStr(w.lemma) || !isStr(w.en) || !isArr(w.forms)) p.push(`Every word needs "lemma", "forms" (a list) and "en".`);
  const newWords = d.words.flatMap((w) => [w.lemma, ...(w.forms || [])].map((f) => ({ form: f, lemma: w.lemma, en: w.en })));
  if (isArr(d.sentences)) p.push(...checkSentences(d.sentences, { newWords, inflections: d.inflections || [] }, lex, state, { share: 1 }));
  else p.push(`"sentences" must be a list.`);
  for (const ph of d.phrases || []) if (!isStr(ph.sv) || !isStr(ph.en)) p.push(`Every phrase needs "sv" and "en".`);
  return [...new Set(p)];
}

// ---------- correction of free writing (PR-p1-18) ----------
export function writingPrompt({ pattern, rule, text }) {
  return `${intro}

I'm practising this grammar pattern: ${pattern} — ${rule}
I wrote this Swedish sentence:
"${text}"

Check it. Is it correct Swedish? Does it use the pattern? If something is wrong, give the corrected sentence and a short, simple explanation in English.

${FORMAT({ correct: true, uses_pattern: true, corrected: "the corrected sentence (or the same one if it was right)", explanation: "short explanation in English" })}`;
}
export function checkWriting(d) {
  const p = [];
  if (typeof d.correct !== "boolean") p.push(`"correct" must be true or false.`);
  if (typeof d.uses_pattern !== "boolean") p.push(`"uses_pattern" must be true or false.`);
  if (!isStr(d.corrected)) p.push(`"corrected" must be the corrected sentence.`);
  if (typeof d.explanation !== "string") p.push(`"explanation" must be text.`);
  return p;
}

// ---------- grammar explanations (PR-p1-16) ----------
export function grammarPrompt({ pattern, rule, examples, known }) {
  return `${intro}

Explain this Swedish grammar pattern to me simply, in English (3–6 sentences): ${pattern}
What the app already says: ${rule}
Examples I've seen: ${examples.join(" / ")}

Then give 3 new example sentences that use the pattern. Each example may use at most ONE word that isn't in my known words (list it in "new_words" with a simple Swedish explanation); inflected forms of known words go in "inflections".
My known words: ${known.join(", ")}

${FORMAT({ explanation: "…", examples: [{ sv: "…", en: "…" }], new_words: [{ form: "…", lemma: "…", en: "…", explain_sv: "…" }], inflections: [{ form: "…", lemma: "…" }] })}`;
}
export function checkGrammar(d, lex, state) {
  const p = [];
  if (!isStr(d.explanation)) p.push(`"explanation" must be text.`);
  if (!isArr(d.examples) || d.examples.length < 2) return [...p, `"examples" must be a list of 3 sentences.`];
  p.push(...checkSentences(d.examples, { newWords: d.new_words || [], inflections: d.inflections || [] }, lex, state, { share: 1, label: "Example" }));
  return p;
}
