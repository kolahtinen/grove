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

## Texts: `texts/<level>.json`

30 texts so far, written by Claude in the owner's absence and **not yet read by a Swedish speaker**:

| Level | Texts | Words each | Listening | Dialogues | Topics |
|---|---|---|---|---|---|
| A1 | 10 | 54–66, present tense, sentences ≤ 8 words | 3 | 4 | me and my family, daily life, food and drink, home, shopping, weather, getting around, work, free time, health |
| A2 | 10 | 82–92, past tense and simple clauses | 4 | 3 | travel, work, celebrations, health, home, food, culture, free time |
| B1 | 10 | 121–130, longer sentences and reasons | 3 | 3 | work, culture, getting around, society, home, nature, health, everyday life, environment, free time |

Each text has the fields G-02 accepts from an AI (`kind`, `title`, `lines` with `sv` and `en`, `questions` with `q`, `options`, `answer`), so it passes `validateAnswer`. It also has library fields that an import would read and drop: `id`, `topic`, `form` (prose or dialogue), `names` (names the counting should skip) and `above_level`. `above_level` is the text's glossary: every word above its level, written by `node scripts/check-library.mjs --fill` from what the check finds. Its forms come from the word list's lookup and want a look (e.g. "bakat" is listed as "bakad").

## The check: `CHECK.md`

`node scripts/check-library.mjs` counts each text with grove's own word counting (`server/words`: the tokenizer, regular and irregular inflections, compounds, Kelly's fixed phrases) against the Kelly words at its level and below. Because of the frequency bands above, a word **one band up** is a stretch (reported, not limited). Words **two or more bands up, or not in Kelly**, are "far" and limited: A1 ≤ 4, A2 ≤ 5, B1 ≤ 7 per text, each word counted once. A text also fails outside its word range (A1 50–80, A2 80–120, B1 120–180), with a sentence over the level's length (10, 14, 20 words), with an unlisted word above its level, or when it fails G-02's answer format. **All 30 pass.**

## To decide (owner)

1. **Kelly for levels?** Keep Kelly with the one-band stretch rule, or build a beginner core list (everyday nouns such as kaffe, kök and buss moved down to A1). The core list would be a new source to choose and licence.
2. **Where the library lives in grove**: PD-17 (inside Texts, by topic with a level filter) and PD-18 (your lessons first, published with "Publish to library").
3. **Who reviews the texts**: PD-23 proposes that Claude drafts and you read each text once. These 30 are ready for that read.
4. **The `pos` and `none` gaps** (537 words): fill by hand, by a meanings prompt to the learner's AI (as G-02 does for words the list lacks), or leave out.
5. **More levels**: B2–C2 texts weren't started; the limits are in the checker.
