# grove library: content drafts

Drafts for grove's shared library, started 2026-10-29 at the owner's request ("start making texts in Swedish starting at complete beginner level, 10 per level for now, and start filling the vocab library"). **Nothing here is wired into grove.** The library isn't specified yet (PD-17, PD-18, PD-21 and PD-23 on question-pages/76), so these are data files and two scripts only, on branch `library-content`.

## Vocabulary: `vocab/<level>.tsv`

One file per CEFR level, A1 to C2, built by `node scripts/build-library-vocab.mjs` from:

- **Words and levels**: the Swedish Kelly list, Språkbanken (https://spraakbanken.gu.se/en/resources/kelly), CC BY-SA 3.0 / LGPL 3.0, as grove carries it in `server/levels/kelly-sv.tsv`.
- **Meanings**: grove's word list `server/lexicon/sv-en.tsv`: the English Wiktionary via kaikki.org (wiktextract), CC BY-SA 4.0. It keeps only the first meaning of each headword.

Columns: `sv`, `pos` (Kelly's part of speech), `kind` (word or phrase), `level`, `en`, `flags`, `wpm` (Kelly's words per million; rows are sorted by it, most frequent first). No meaning was made up; the gaps are flagged:

| Flag | Meaning |
|---|---|
| `none` | the word list has no meaning (mostly Kelly's multi-word phrases, e.g. "även om", "i samband med") |
| `via-form` | the meaning is that of another headword the form belongs to; check it is the same word |
| `pos` | the meaning looks like another part of speech, so probably the wrong homograph (göra → "work, task", få → "few", visa → "a song"); these need a person |
| `long` | a definition or cut-off text rather than a short translation |

| Level | Words | `none` | `via-form` | `pos` | `long` | Any flag |
|---|---|---|---|---|---|---|
| A1 | 1,352 | 22 | 10 | 41 | 30 | 100 |
| A2 | 1,357 | 23 | 19 | 30 | 26 | 97 |
| B1 | 1,374 | 45 | 42 | 25 | 21 | 129 |
| B2 | 1,369 | 59 | 40 | 41 | 27 | 160 |
| C1 | 1,384 | 61 | 20 | 41 | 23 | 142 |
| C2 | 1,334 | 107 | 25 | 42 | 20 | 186 |
| **All** | **8,170** | **317** | **156** | **220** | **147** | **814** |

**Kelly's levels are frequency bands, not textbook levels.** They come from how often words occur in web text. So everyday words a beginner meets first sit above A1 (kaffe, kök, syster A2; mjölk B1; skinka C1; smörgås, paraply C2), while Kelly's A1 holds formal phrases such as "i samband med" and "med tanke på". The lists are a usable base, but not a beginner's syllabus as they stand (see "To decide").

## Core list and graded list (added 2026-10-29, question-pages/76 F2, F4)

- **`core-a1a2.tsv`** (stopgap, **for the owner to skim**): 417 everyday words a beginner meets first, by theme. The themes are greetings and phrases, numbers, time, weather, food, home, family, body and health, clothes, town and travel, work and school, common verbs, common adjectives and colours. 299 are A1 and 118 A2. Each row has `level`, `theme`, `en`, `flags` and `source`:
  - **340** take their level from SweLLex (204) or Kelly (136), where either has the word at A1–A2.
  - **77** take it from their theme ("theme (Kelly C1)" etc.); these are the ones to skim first.
  - **28** meanings are flagged, most of them the wrong-homograph `pos` cases (göra, få, ringa, tro, lära…) and long definitions.

  Function words (och, jag, i, på…) are left out because Kelly already has them at A1. Built by `node scripts/build-library-core.mjs`.
- **`vocab-graded/<level>.tsv`**: SweLLex (CC BY 4.0, graded by learner essays), see `GRADED-LISTS.md`.

## Texts: `texts/<level>.json`

136 texts in the library (`texts/`) and 12 waiting for longer and shorter word ranges (`texts-pending/`, below), all written by Claude and **not yet read by a Swedish speaker**. Every text has a `level` and one `topic` from the shared set in `TOPICS.md`; the library is browsed by topic, and the level filter shows all levels up to the chosen one. Counts as of 2026-10-31 (words counted by the check, names left out):

| Level | Texts | Words each (library) | Pending: short, long | Listening | Dialogues | Style |
|---|---|---|---|---|---|---|
| A1 | 30 | 52–79 | 26, 116 | 13 | 15 | present tense, short main clauses |
| A2 | 30 | 82–118 | 43, 182 | 12 | 10 | past tense and simple clauses |
| B1 | 23 | 121–177 | 63, 263 | 9 | 8 | longer sentences and reasons |
| B2 | 21 | 181–248 | 71, 334 | 9 | 6 | mixed tenses, opinions, a few idioms |
| C1 | 16 | 252–347 | 121, 444 | 5 | 5 | complex syntax, idioms in moderation |
| C2 | 16 | 302–396 | 131, 585 | 5 | 5 | formal and literary registers |

### Pending texts: `texts-pending/<level>.json` (2026-10-31)

At the owner's request "populate library more; it should get texts of different lengths", each level got three new texts: a **usual** one (in the library, batch 9) and a **short** one (about half the level's usual length) and a **long** one (about double; a long A1 text is still short main clauses). The short and long ones fall outside the check's word ranges (A1 50–80 … C2 300–400), which are code (`LIMITS` in `scripts/check-library.mjs`), so they wait here, in the same format, until the ranges change. Apart from their length they pass every rule of the check (sentence length, far words, glossary, G-02's answer format), checked with the checker's own `checkText`. To take them in: widen the ranges (proposed: A1 25–160, A2 40–240, B1 60–360, B2 70–500, C1 120–700, C2 130–800), then move the texts into `texts/` and rebuild.

Each text has the fields G-02 accepts from an AI (`kind`, `title`, `lines` with `sv` and `en`, `questions` with `q`, `options`, `answer`), so it passes `validateAnswer`. It also has library fields that an import would read and drop: `id`, `topic`, `form` (prose or dialogue), `names` (names the counting should skip) and `above_level`. `above_level` is the text's glossary: every word above its level, written by `node scripts/check-library.mjs --fill` from what the check finds. Its forms come from the word list's lookup and want a look (e.g. "bakat" is listed as "bakad").

## Grammar patterns: `patterns/<level>.json` (2026-10-31)

At the owner's request "analyse all texts for grammar patterns and give those grammar patterns cefr levels", every text (the 136 in the library and the 12 pending) has its grammar patterns in `patterns/<level>.json`: `{ level, texts: [ { id, pending?, patterns: [ … ] } ] }`. Each pattern is in G-02/G-03's answer shape (`name` ≤ 80, `explain_en` ≤ 300, `places: [ { text: 1, line, words } ]`, `line` 1-based, `words` the exact words in a row, as the reading page marks them), plus three fields the importer doesn't read yet: `level` (A1…C2), `ladder` (the pattern's ID in grove's grammar ladder, `content/learning/grammar/patterns.json`) and, for a pattern not on the ladder, `level_reason`. Every text's patterns pass G-02's `validateAnswer` (at most 20 patterns, 20 places each) and every place is found in its line.

- **Ladder patterns** take the ladder's name, explanation and level as they are (28 of its 36 patterns are marked; the other eight are the noun basics G-A1-02…04 (en/ett, definite and plural endings) and adjective agreement G-A2-05, G-A2-06, which are on nearly every line and need a noun tagger to mark reliably, and G-C1-01, G-C1-04, G-C2-02, which the rules didn't find).
- **Patterns not on the ladder** got a level by the ladder's logic: det finns (A1, a fixed chunk on the A1 present tense), the -s genitive (A1, with min/mitt/mina), att + infinitive, commands, man, brukar + infinitive (A2, with the A2 modal verb + infinitive), för att + infinitive and håller på att (B1, with the B1 clauses), inte bara … utan också (B2). Each one's reason is in its `level_reason`.
- A text lists a pattern above its level only where it occurs more than once; patterns are listed from the lowest level.
- **How they were found**: by rule, with `patterns/find-patterns.mjs` (word-list forms and Kelly's parts of speech), checked by hand on a sample of texts at each level. So a place may be off (e.g. a verb form taken for a noun); a Report or the owner's reading fixes the file directly.
- **Not in grove yet**: `scripts/build-library.mjs` builds each text's answer with no patterns, and G-02's format has no field for a pattern's level. Both need a spec change (README, To decide 7).

## Meanings: `meanings.tsv` (2026-10-31)

At the owner's request "make sure common library does not have empty meanings or mistakes", every word a learner can tap in the 148 texts (about 4,000 forms) was looked up the way the reading page does it for a grove text (G-03 FR-306: the text's own meanings, which grove texts don't have, then grove's word list by form, then by dictionary form). Two kinds of gap:

- **Empty (189 forms)**: the word list has nothing, so the word menu shows no meaning: compounds (lånekort, matsvinnet, fyradagarsvecka), numbers written as words (fyrahundra, tjugotusen) and colloquial forms (stan).
- **Wrong word (311 rows)**: the word list keeps only Wiktionary's first sense of each headword, and a form is looked up as a headword first, so many common words show another word's meaning: i → "the ninth letter of the alphabet", får → "sheep", går → "yesterday", vill → "lost", efter → "slow", bakom → "slow", skulle → "an attic", sin/sitt/sina → "dryness", min → "minute", gör → "work, task", bor → "boron", stod → "a statue", såg → "a saw", middag → "midday", kyckling → "a chick", skolan → "shall, will", gula → "yolk", långa → "common ling" (a fish). Where a form means different things in different texts (kort "card" / "short", lag "team" / "law", åt "ate" / "for" / "at", mitt "my" / "in the middle"), the row names the texts.

`meanings.tsv` has a meaning for each, in G-02's `new_words` shape (`form`, `lemma`, `en`) with the `issue` and the `texts` it applies to (`*` = all); every row's form occurs in the texts it names, and no form has two meanings in one text (one exception left: A2-32 has åt as "ate" and in "skrattade åt", "laughed at"; the row keeps "ate").

**Not in grove yet**: the build gives grove texts no meanings of their own (`new_words: []`), so learners still see the word list's. Two ways in, both a spec change: the build passes each text's rows as its `new_words` (G-09 FR-916), or, better for the wrong-word rows, which hit every text a learner reads (also their own), a checked override list in front of the word list (G-02 FR-222). A word already in a learner's ground keeps the meaning it got then.

**Other checks** (2026-10-31): every question's right answer was compared with the text by rule (an answer whose words are not in the text, or a wrong option's are) and the 25 flagged were read by hand: all right. Each line's English was checked against its Swedish for numbers, names, dialogue dashes and question marks: no mismatch. No Swedish mistakes were found in the lines read for these checks, but the texts have still not been read whole by a Swedish speaker.

## The check: `CHECK.md`

`node scripts/check-library.mjs` counts each text with grove's own word counting (`server/words`: the tokenizer, regular and irregular inflections, compounds, fixed phrases) against the words at its level and below. A word's level comes from the core list first, otherwise the lower of SweLLex and Kelly. CHECK.md also shows each text's far words against Kelly alone (before) and now. Because of the frequency bands above, a word **one band up** is a stretch (reported, not limited). Words **two or more bands up, or not in Kelly**, are "far" and limited: A1 ≤ 4, A2 ≤ 5, B1 ≤ 7 per text, each word counted once. A text also fails outside its word range (A1 50–80, A2 80–120, B1 120–180, B2 180–250, C1 250–350, C2 300–400; counted words, names left out), with a sentence over the level's length (10, 14, 20 words), with an unlisted word above its level, or when it fails G-02's answer format. **All 136 pass** (2026-10-31).

## To decide (owner)

1. **Graded list**: SweLLex is in, and SVALex needs a licence decision (`GRADED-LISTS.md`). Skim `core-a1a2.tsv`, mainly its 77 theme-levelled rows.
2. **Where the library lives in grove**: PD-17 (inside Texts, by topic with a level filter) and PD-18 (your lessons first, published with "Publish to library").
3. **Who reviews the texts**: PD-23 proposes that Claude drafts and you read each text once. These 30 are ready for that read.
4. **The `pos` and `none` gaps** (537 words): fill by hand, by a meanings prompt to the learner's AI (as G-02 does for words the list lacks), or leave out.
5. **Word ranges** (2026-10-31): the check's ranges keep the 12 short and long texts in `texts-pending/` out of the library; widening them is a code change (`LIMITS` in the checker; proposal above).
6. **Glossaries**: `above_level` uses each word's dictionary form, with a short hand-checked table for irregular forms (`GLOSSARY_FORMS` in the checker). Long words no list knows get their commonest ending undone by rule, so a few may still be off.
7. **Patterns and meanings into grove** (2026-10-31): the build passes no patterns and no meanings for grove texts (`new_words: []`), and G-02's pattern has no level. A spec change to G-09 FR-916 (and G-02's answer format or G-03 FR-305 for the level) would let `scripts/build-library.mjs` read `patterns/<level>.json` and `meanings.tsv`.

## Approval

2026-10-29: the owner approved all 50 drafts (A1–C1, ten per level) for the common library as they stand, without a line-by-line read (docs/reviews/2026-10-29-branch-test.md, B-11). They are still marked as not read by a Swedish speaker; fixes come from learners' reports and the owner's later reading (the reading page keeps a Good / Small fixes / Rewrite mark per text).

2026-10-29, batch 1 (10 texts): A1-11…A1-13, A2-11…A2-15, B1-11, B1-12, added by Claude at the owner's word, 2026-10-29 (B-19). They fill the topic gaps (A1 Society; A2 People and family, Daily life, Nature and environment, Society) and thin topics (People and family, Food and drink).

2026-10-29, batch 2 (10 texts): C2-01…C2-10, one per shared topic, added by Claude at the owner's word, 2026-10-29 (B-19).

2026-10-29, batch 3 (10 texts): A1-14…A1-19, A2-16…A2-19, added by Claude at the owner's word, 2026-10-29 (B-19).

2026-10-29, batch 4 (10 texts): A1-20, A1-21, A2-20…A2-22, B1-13…B1-17, added by Claude at the owner's word, 2026-10-29 (B-19).

2026-10-29, batch 5 (10 texts): A1-22…A1-24, A2-23, A2-24, B2-11…B2-15, added by Claude at the owner's word, 2026-10-29 (B-19).

2026-10-29, batch 6 (10 texts): A1-25…A1-29, A2-25…A2-29, added by Claude at the owner's word, 2026-10-29 (B-19), at the owner's request "make a bunch of texts of DIFFERENT LENGTHS on top of the current ones". Their lengths spread across each level's whole range in the check (A1 52–79 words, A2 83–117), from a short text to a long one; the check's word ranges stay as they are.

2026-10-29, batch 7 (10 texts): B1-18…B1-22, B2-16…B2-20, added by Claude at the owner's word, 2026-10-29 (B-19), at the same request for texts of different lengths. Lengths spread across the check's ranges: B1 124–177 words, B2 184–248.

2026-10-29, batch 8 (10 texts): C1-11…C1-15, C2-11…C2-15, added by Claude at the owner's word, 2026-10-29 (B-19), at the same request for texts of different lengths. Lengths spread across the check's ranges: C1 252–347 words, C2 315–396. Batches 6–8 together take every level from a short text near the bottom of its range to a long one near the top; the check's ranges (A1 50–80 … C2 300–400) were not changed, so the longest text in a level is at most about 1.6 times the shortest.

2026-10-31, batch 9 (6 texts in the library, 12 pending): A1-30, A2-30, B1-23, B2-21, C1-16, C2-16 (usual length: 63, 91, 141, 219, 299, 317 words), added by Claude at the owner's word (B-19), at the owner's request "populate library more; it should get texts of different lengths". With each, a short and a long text at the same level (A1-31/32, A2-31/32, B1-24/25, B2-22/23, C1-17/18, C2-17/18) in `texts-pending/`, outside the check's word ranges (above). Topics: the thinner ones first (Society at A1, A2, B1, B2, C2; People and family at A1, B1, C1; Home, Work and study at C1; Health, Food and drink at C2), with listening texts and dialogues mixed in.
