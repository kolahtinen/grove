// The setup and the requests (FR-201…FR-212, research R4, R9): a package starts in a new chat with
// setup prompts (rules, format, summary, known words over several messages) the AI answers with
// "OK"; requests then ask for texts and carry only what changed. Based on the X-03 prompt.

// Up to `cap` known dictionary forms: topic words first, then the most recently fallen, then by uses.
export function chooseKnown(groundRows, topicWords = [], cap = 3000) {
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
  "part": "<the code I give in my request>",
  "texts": [
    {
      "kind": "reading or listening",
      "part": 1,
      "title": "…",
      "lines": [ { "sv": "one Swedish sentence", "en": "its English translation" } ],
      "questions": [ { "q": "…", "options": ["…", "…", "…"], "answer": 0 } ]
    }
  ],
  "new_words": [ { "form": "as written", "lemma": "dictionary form", "en": "short English meaning", "explain_sv": "enkel förklaring" } ],
  "new_phrases": [ { "sv": "…", "en": "…", "explain_sv": "…" } ],
  "inflections": [ { "form": "as written", "lemma": "dictionary form" } ],
  "names": ["…"],
  "meaning_checks": [ { "form": "as written", "lemma": "dictionary form", "en": "its meaning in that sentence", "explain_sv": "enkel förklaring" } ],
  "starter_words": [ { "lemma": "…", "en": "…", "explain_sv": "…" } ],
  "patterns": [ { "name": "short name", "explain_en": "short English explanation", "places": [ { "text": 1, "line": 3, "words": "the exact words" } ] } ],
  "explanations": [ { "code": "E1", "explain_en": "…" } ],
  "fixes": [ { "code": "R1", "q": "…", "options": ["…", "…"], "answer": 0 } ]
}
\`\`\``;

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

// "2 reading texts and 1 listening text" for a list of asked kinds.
export function describeKinds(kinds) {
  const reading = kinds.filter((k) => k === 'reading').length;
  const listening = kinds.filter((k) => k === 'listening').length;
  return [reading && plural(reading, 'reading text'), listening && plural(listening, 'listening text')].filter(Boolean).join(' and ');
}

// The setup: the first prompt has the rules, the format and the summary; the rest carry the known
// words, at most `chunkWords` per prompt. Every setup prompt is answered with "OK" only.
export function buildSetup({ targetShare, summary, known, chunkWords }) {
  const beginner = known.length === 0;
  const chunks = [];
  for (let i = 0; i < known.length; i += chunkWords) chunks.push(known.slice(i, i + chunkWords));
  const first = [];
  first.push(`I'm learning Swedish (my own language is English) with an app called grove. It gives me comprehensible input: texts where I know almost every word. In this new chat I'll first send you the rules and the answer format${chunks.length ? `, then my known words in ${plural(chunks.length, 'message')}` : ''}, then ask you for texts. Until I ask for texts, reply only with "OK".`);
  if (summary) first.push(`What I did since my last package:\n${summary}`);
  const rules = ['Language rules for ALL Swedish text you write in this chat, including questions and options:'];
  if (beginner) {
    rules.push("- I'm a complete beginner: build the texts from the starter words and the most common Swedish words, with very short sentences.");
  } else {
    rules.push('- Use my known words (I will send them next; any inflection is fine).');
    rules.push(`- About ${targetShare}% of the words in each text must be known: at most ONE new word or new fixed phrase per sentence.`);
  }
  rules.push('- Names of people and places are fine; list them in "names".');
  rules.push('- List every new word in "new_words" with its dictionary form, a short English meaning and a simple Swedish explanation that uses known words ("explain_sv"). List new fixed phrases in "new_phrases". List inflected forms of known words that aren\'t spelled as in my list in "inflections".');
  rules.push('- Write one sentence per line, and give an English translation for every line.');
  rules.push('- After every text, add 2–3 comprehension questions in simple Swedish, each with 2–3 answer options (also simple Swedish) and the index of the right option.');
  rules.push('- "reading" texts are for reading. "listening" texts are written to be heard: short sentences, spoken style, easy to follow by ear.');
  rules.push('- List the grammar patterns the texts use in "patterns": a short name, a short English explanation, and the places used (text number, line number, and the exact words).');
  rules.push('- When I ask you to check meanings, give each word\'s meaning in the sentence I quote in "meaning_checks".');
  first.push(rules.join('\n'));
  first.push(`When I ask for texts, reply with ONLY exactly one \`\`\`json code block in this format, and no other text. Copy the code I give into "part" exactly. Give each text its "kind"; give "part" on each text only when I ask for several parts at once. Leave out "meaning_checks", "starter_words", "explanations" and "fixes" when I don't ask for them:\n${FORMAT}`);
  first.push('Reply only with "OK" now.');
  const steps = [first.join('\n\n')];
  chunks.forEach((words, i) => {
    steps.push(`My known words, message ${i + 1} of ${chunks.length} (dictionary forms). Reply only "OK".\n\n${words.join(', ')}`);
  });
  return steps;
}

// A request for texts: one part (or the whole package), with only what changed since the setup.
export function buildRequest({ code, partNo, of, asks, textWords, topic, newTopic, targetShare, reuse = [], firmNew, shorter, checks = [], flags = [], reports = [], continueHint, whole }) {
  const out = [];
  if (whole) {
    const parts = [...new Set(asks.map((a) => a.part))].sort();
    const lines = parts.map((p) => `- part ${p}: ${describeKinds(asks.filter((a) => a.part === p).map((a) => a.kind))}`);
    out.push(`Now please write all ${parts.length} parts of my package "${code}" on this topic: ${topic}. Each text about ${textWords} words:\n${lines.join('\n')}\nGive every text its "part" number ("part": 1, 2 or 3). The parts follow one story with the same characters.`);
  } else {
    out.push(`Now please write part ${partNo} of ${of} ("${code}") on this topic: ${topic}: ${describeKinds(asks.map((a) => a.kind))}, ${asks.length === 1 ? 'about' : 'each about'} ${textWords} words.`);
    if (continueHint) out.push('Continue the story and characters of the earlier parts in this chat.');
  }
  if (newTopic) out.push('This topic is new to me: also give 10–15 useful starter words for it in "starter_words", and use some of them in the texts.');
  const notes = [];
  // The target share moves with the ratings, so every request states it (FR-203, FR-218).
  if (targetShare !== undefined) notes.push(`- About ${targetShare}% of the words in each text must be known: at most ONE new word or new fixed phrase per sentence.`);
  if (firmNew) notes.push('- My last texts had too few new words: this time, really do use about one new word in most sentences.');
  if (shorter) notes.push('- Use shorter, simpler sentences than last time.');
  if (reuse.length) notes.push(`- Please reuse these words I'm learning: ${reuse.join(', ')}`);
  if (notes.length) out.push(notes.join('\n'));
  if (checks.length) {
    out.push(`Please check these meanings (in the sentences where I met them, where given), and give each in "meaning_checks" (its meaning there, and a simple Swedish explanation):\n${checks.map((c) => `- ${c.form}${c.sentence ? ` — "${c.sentence}"` : ''} — ${c.guess ? 'my guess' : 'dictionary'}: ${c.en}`).join('\n')}`);
  }
  if (flags.length) out.push(`Please explain these for me in "explanations" (one entry per code):\n${flags.join('\n')}`);
  if (reports.length) out.push(`I reported these problems; please fix each in "fixes" with its code (a corrected question with "q", "options" and "answer", or a corrected sentence with "sv" and "en"):\n${reports.join('\n')}`);
  out.push(`Follow all the rules from the start of this chat, and reply with only the JSON block, with "part": "${code}".`);
  return out.join('\n\n');
}
