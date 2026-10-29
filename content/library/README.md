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

50 texts so far, written by Claude and **not yet read by a Swedish speaker**. They join the library only once the owner has approved them (question-pages/77). Every text has a `level` and one `topic` from the shared set in `TOPICS.md`; the library is browsed by topic, and the level filter shows all levels up to the chosen one.

| Level | Texts | Words each | Listening | Dialogues | Topics |
|---|---|---|---|---|---|
| A1 | 10 | 54–66, present tense, sentences ≤ 8 words | 3 | 4 | me and my family, daily life, food and drink, home, shopping, weather, getting around, work, free time, health |
| A2 | 10 | 82–92, past tense and simple clauses | 4 | 3 | travel, work, celebrations, health, home, food, culture, free time |
| B1 | 10 | 121–130, longer sentences and reasons | 3 | 3 | work, culture, getting around, society, home, nature, health, everyday life, environment, free time |
| B2 | 10 | 181–198, mixed tenses, opinions, a few idioms | 4 | 3 | one per shared topic (late parenthood, a cashless society, fika, flatmates, a four-day week, night trains, a book circle, children and screens, the wolf, a first election) |
| C1 | 10 | 261–281, complex syntax, idioms in moderation | 3 | 3 | one per shared topic (loneliness, lagom, food waste, a mortgage meeting, changing career, a car-free centre, Astrid Lindgren, burnout, the forest debate, trust) |

Each text has the fields G-02 accepts from an AI (`kind`, `title`, `lines` with `sv` and `en`, `questions` with `q`, `options`, `answer`), so it passes `validateAnswer`. It also has library fields that an import would read and drop: `id`, `topic`, `form` (prose or dialogue), `names` (names the counting should skip) and `above_level`. `above_level` is the text's glossary: every word above its level, written by `node scripts/check-library.mjs --fill` from what the check finds. Its forms come from the word list's lookup and want a look (e.g. "bakat" is listed as "bakad").

## The check: `CHECK.md`

`node scripts/check-library.mjs` counts each text with grove's own word counting (`server/words`: the tokenizer, regular and irregular inflections, compounds, fixed phrases) against the words at its level and below. A word's level comes from the core list first, otherwise the lower of SweLLex and Kelly. CHECK.md also shows each text's far words against Kelly alone (before) and now. Because of the frequency bands above, a word **one band up** is a stretch (reported, not limited). Words **two or more bands up, or not in Kelly**, are "far" and limited: A1 ≤ 4, A2 ≤ 5, B1 ≤ 7 per text, each word counted once. A text also fails outside its word range (A1 50–80, A2 80–120, B1 120–180, B2 180–250, C1 250–350, C2 300–400; counted words, names left out), with a sentence over the level's length (10, 14, 20 words), with an unlisted word above its level, or when it fails G-02's answer format. **All 30 pass.**

## To decide (owner)

1. **Graded list**: SweLLex is in, and SVALex needs a licence decision (`GRADED-LISTS.md`). Skim `core-a1a2.tsv`, mainly its 77 theme-levelled rows.
2. **Where the library lives in grove**: PD-17 (inside Texts, by topic with a level filter) and PD-18 (your lessons first, published with "Publish to library").
3. **Who reviews the texts**: PD-23 proposes that Claude drafts and you read each text once. These 30 are ready for that read.
4. **The `pos` and `none` gaps** (537 words): fill by hand, by a meanings prompt to the learner's AI (as G-02 does for words the list lacks), or leave out.
5. **C2** texts weren't started; the limits are in the checker. A2 has no text yet in four topics (TOPICS.md).
6. **Glossaries**: `above_level` uses each word's dictionary form, with a short hand-checked table for irregular forms (`GLOSSARY_FORMS` in the checker). Long words no list knows get their commonest ending undone by rule, so a few may still be off.

## Approval

2026-10-29: the owner approved all 50 drafts (A1–C1, ten per level) for the common library as they stand, without a line-by-line read (docs/reviews/2026-10-29-branch-test.md, B-11). They are still marked as not read by a Swedish speaker; fixes come from learners' reports and the owner's later reading (the reading page keeps a Good / Small fixes / Rewrite mark per text).

2026-10-29, batch 1 (10 texts): A1-11…A1-13, A2-11…A2-15, B1-11, B1-12, added by Claude at the owner's word, 2026-10-29 (B-19). They fill the topic gaps (A1 Society; A2 People and family, Daily life, Nature and environment, Society) and thin topics (People and family, Food and drink).
