// The part prompt (FR-201…FR-212, research R4), based on the X-03 prompt that worked in free
// ChatGPT, Claude and Gemini.

export const MAX_KNOWN = 1500;

// Up to 1,500 known dictionary forms: topic words first, then the most recently fallen, then by uses.
export function chooseKnown(groundRows, topicWords = [], cap = MAX_KNOWN) {
  const inGround = new Set(groundRows.map((r) => r.lemma));
  const chosen = [];
  const seen = new Set();
  const take = (lemma) => { if (!seen.has(lemma) && chosen.length < cap) { seen.add(lemma); chosen.push(lemma); } };
  for (const w of topicWords) if (inGround.has(w)) take(w);
  const byRecent = [...groundRows].sort((a, b) => (b.fallen_at || 0) - (a.fallen_at || 0) || b.uses - a.uses || a.lemma.localeCompare(b.lemma, 'sv'));
  // Half of what's left goes to the most recently fallen, the rest by uses.
  const recentShare = Math.floor((cap - chosen.length) / 2);
  for (const r of byRecent.slice(0, recentShare)) take(r.lemma);
  const byUses = [...groundRows].sort((a, b) => b.uses - a.uses || a.lemma.localeCompare(b.lemma, 'sv'));
  for (const r of byUses) take(r.lemma);
  return chosen;
}

const FORMAT = `\`\`\`json
{
  "part": "<PART>",
  "texts": [
    {
      "title": "…",
      "lines": [ { "sv": "one Swedish sentence", "en": "its English translation" } ],
      "questions": [ { "q": "…", "options": ["…", "…", "…"], "answer": 0 } ]
    }
  ],
  "new_words": [ { "form": "as written", "lemma": "dictionary form", "en": "short English meaning", "explain_sv": "enkel förklaring" } ],
  "new_phrases": [ { "sv": "…", "en": "…", "explain_sv": "…" } ],
  "inflections": [ { "form": "as written", "lemma": "dictionary form" } ],
  "names": ["…"],
  "starter_words": [ { "lemma": "…", "en": "…", "explain_sv": "…" } ]
}
\`\`\``;

export function buildPartPrompt({ code, partNo, of, topic, newTopic, known, reuse, targetShare, firmNew, shorter, summary, continueHint }) {
  const beginner = known.length === 0;
  const out = [];
  out.push("I'm learning Swedish (my own language is English) with an app called grove. It gives me comprehensible input: texts where I know almost every word.");
  if (summary) out.push(`What I did since my last package:\n${summary}`);
  out.push(`This is part ${partNo} of ${of} of my current package. Please write 3 texts (about 10 minutes of reading in all), each about 130 words, on this topic: ${topic}.`);
  if (continueHint) out.push('If this chat already has the earlier parts of this package, continue their story and characters.');
  if (newTopic) out.push('This topic is new to me: also give 10–15 useful starter words for it in "starter_words", and use some of them in the texts.');
  out.push('After every text, add 2–3 comprehension questions in simple Swedish, each with 2–3 answer options (also simple Swedish) and the index of the right option.');

  const rules = ['Language rules for ALL Swedish text, including questions and options:'];
  if (beginner) {
    rules.push("- I'm a complete beginner: build the texts from the starter words and the most common Swedish words, with very short sentences.");
  } else {
    rules.push(`- Use my known words (any inflection is fine): ${known.join(', ')}`);
    rules.push(`- About ${targetShare}% of the words in each text must be known: at most ONE new word or new fixed phrase per sentence.`);
  }
  if (firmNew) rules.push('- My last texts had too few new words: this time, really do use about one new word in most sentences.');
  if (shorter) rules.push('- Use shorter, simpler sentences than last time.');
  if (reuse.length) rules.push(`- Please reuse these words I'm learning: ${reuse.join(', ')}`);
  rules.push('- Names of people and places are fine; list them in "names".');
  rules.push('- List every new word in "new_words" with its dictionary form, a short English meaning and a simple Swedish explanation that uses known words ("explain_sv"). List new fixed phrases in "new_phrases". List inflected forms of known words that aren\'t spelled as in my list in "inflections".');
  rules.push('- Write one sentence per line, and give an English translation for every line.');
  out.push(rules.join('\n'));
  out.push(`Reply with ONLY exactly one \`\`\`json code block in this format, and no other text. Copy the "part" value exactly:\n${FORMAT.replace('<PART>', code)}`);
  return out.join('\n\n');
}
