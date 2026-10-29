# grove learning content: drafts for Discover > Grammar and Words

Content for the empty "Learning > Discover > Options > Grammar" and "… > Words" pages, from the owner's note B-26 (docs/reviews/2026-10-29-branch-test.md): "should have some content". The owner then said "you can make content for the words and grammar in the meantime". **Nothing here is wired into grove.** How grove uses it isn't specified yet, so these are data files only, like the library drafts in `content/library/`.

**Status: approved by the owner as it stands, 2026-10-29** (question-pages/89: "Approve as it stands"; like the library's B-11). Claude wrote all the Swedish and English, and no Swedish speaker has read it yet: the list of items to check first (below) stays the owner's reading list, a Report on any item reaches the owner, and fixes go into these files and the next build.

## What each file is for

| File | Direction it serves | Contents |
|---|---|---|
| `grammar/patterns.json` | Grammar 1 "Pattern of the day", Grammar 2 "Spot it", Grammar 3 the ladder | 36 patterns in teaching order: A1 8, A2 8, B1 7, B2 6, C1 4, C2 3 |
| `words/phrases.json` | Words 3 "Phrase spotlight" | 103 multi-word expressions: A1 18, A2 18, B1 18, B2 18, C1 16, C2 15 |
| `words/topics.json` | Words 5 "Topic words" | 10 library topics × A1–B2, 11–12 words per cell, 479 words (A1 120, A2 120, B1 120, B2 119) |
| `words/next-words.json` | Words 2 "Next words at your level" | 40 words each at A1, A2 and B1 (120) |

Words 1 ("words you've met but haven't learned") needs no content, because it comes from the learner's own texts.

Each file has `about` and `status` at the top (`"approved"` since 2026-10-29).

## Formats

### `grammar/patterns.json`

`{ about, status, patterns: [ … ] }`. Each pattern:

| Field | |
|---|---|
| `id` | `G-<level>-<nn>`, e.g. `G-A1-01`, numbered in teaching order within the level |
| `level` | A1 … C2 |
| `name` | English, learner-friendly, at most 80 characters |
| `explain_en` | Plain English, two short sentences, at most 300 characters |
| `how_to_spot` | One line on what to look for |
| `examples` | 4–6 `{ sv, en, mark }`. `mark` is the exact part of `sv` that shows the pattern |
| `text` | `{ title, lines: [ { sv, en } ] }`: 6–10 lines at the pattern's level, full of the pattern |
| `spot` | 6–10 `{ line, mark }`. `line` is a 0-based index into `text.lines`, and `mark` is the exact part of that line. Together they mark **every** place in the text where the pattern occurs, so "Spot it" can show the ones a learner missed |

`name` and `explain_en` fit grove's existing pattern shape in `server/texts/schema.mjs` (`patterns: { name ≤ 80, explain_en ≤ 300, places }`). A `spot` item maps onto a `place` (`line` is 0-based here; `places.line` starts at 1).

Some definitions of "an occurrence", where a pattern could be read more than one way:
- **Verb second** (G-A1-05) marks the verb and the subject after a fronted time or place. Subject-first sentences are not marked.
- **Questions** (G-A1-06) marks the verb and subject (or question word, verb and subject).
- **Conditional** (G-B2-02) marks each `skulle` + verb.
- **sin/sitt/sina** (G-B1-06) marks only sin-forms. The text also has hans and hennes for contrast, and these are not marked.
- **Dropped har/hade** (G-C2-02) marks the supine with the word before it.

### `words/phrases.json`

`{ about, status, phrases: [ { id, level, phrase, en, note?, examples: [ {sv, en}, {sv, en} ] } ] }`. `id` is `P-<level>-<nn>`. `phrase` is the dictionary form (`ha lust att`, `hålla med`). `note` is optional and at most 120 characters; it covers register, a literal meaning or a trap. A1–A2 are everyday expressions and particle verbs. B1–B2 are common collocations and discourse phrases. C1–C2 are idioms. C2 also has formal and old fixed phrases.

### `words/topics.json`

`{ about, status, topics: [ { topic, level, words: [ … ] } ] }`. There is one entry per topic and level, with the 10 topic names from `content/library/TOPICS.md`. Each word:

| Field | |
|---|---|
| `lemma` | Dictionary form. A few are particle or reflexive verbs (`lägga sig`, `slappna av`) |
| `pos` | `noun-en`, `noun-ett`, `noun-plural`, `verb`, `adjective`, `adverb` |
| `en` | Short meaning, written for the context the word is chosen for |
| `list_level` | The word's level in the bundled lists, by the same rule the library check uses: the core list first, otherwise the lower of SweLLex and Kelly. `null` when no list has it |
| `level_source` | Where `list_level` comes from, e.g. `core list A1`, `SweLLex B1; Kelly C1`, or `base word lägga: Kelly A1; SweLLex B1` for multi-word lemmas |
| `example` | `{ sv, en }` |

The cell's `level` is the teaching level Claude chose. It agrees with the lists where they allow it:

| | Words |
|---|---|
| `list_level` equal to the cell | 199 |
| `list_level` below the cell (the word is already expected by then) | 159 |
| `list_level` above the cell | 70 |
| in no list (`null`; mostly compounds and modern words like *flygskam*, *livspussel*, *bostadskö*) | 51 |

Most of the 70 "above" words are one band above. They are everyday words that Kelly's frequency bands put high, the same problem the library README describes (bröd, fisk, lägenhet and fönster are core-list A2 but are taught at A1 here). The cases two or more bands up, which a reviewer may want to move or replace, are *svärmor* (Kelly C2, cell B1), *allergi*, *krydda* (C1, cell B1), *hosta* (Kelly C1, cell A2), *kosttillskott* and *smaklös* (Kelly C2, cell B2). The library check's "far word" rule would flag these.

### `words/next-words.json`

`{ about, status, words: [ { lemma, pos, en, level, level_source, list_level, example: {sv, en} } ] }`. `level` always equals `list_level`, using the same rule as above. The words were chosen in three steps:
1. Take candidates whose level is A1, A2 or B1 under that rule.
2. Keep those whose forms don't occur in `content/library/texts/*.json` at or below their level (checked roughly, by word stem, on 2026-10-29).
3. Pick by hand for everyday usefulness. Kelly's A1 band is full of formal web words (*bestämmelse*, *utskott*, *lagstiftning*), and those were left out.

A few occur in texts above their level, which is still "not met yet" for a learner at that level: *himmel* (A2 texts), *tallrik* (A2), *gråta* (B2). The list will go stale as the library grows, so a build step should re-check it against the texts.

## Sources and licences

- **Swedish and English text**: written by Claude for grove (2026-10-29). This covers all example sentences, pattern texts, explanations, phrase notes and translations. No sentences were copied from coursebooks, dictionaries or the web.
- **Word levels**, as carried in `content/library/`:
  - **Kelly list**: Språkbanken, CC BY-SA 3.0 / LGPL 3.0 (`content/library/vocab/*.tsv`).
  - **SweLLex**: Volodina, Pilán, Llozhi, Degryse & François 2016, Språkbanken Text (https://doi.org/10.23695/6h3v-zw25), CC BY 4.0 (`content/library/vocab-graded/*.tsv`).
  - **The core list** `content/library/core-a1a2.tsv`: grove's own, levelled from SweLLex and Kelly.
- **Meanings**: the `en` meanings were written for each word's chosen sense. They were cross-checked against the English Wiktionary meanings in those files (via kaikki.org, CC BY-SA 4.0) but not copied from them. Where Wiktionary gives the wrong homograph (e.g. *sopa* "garbage"), Claude's meaning is used.
- **SVALex** was not used (licence undecided, `content/library/GRADED-LISTS.md`).

The topic and next-word files publish each word's level from Kelly and SweLLex together with its source. That is attribution as both licences require. Because Kelly is CC BY-SA, a published file that carries Kelly levels should be shared under CC BY-SA too.

## To check first (Swedish speaker)

These are the items Claude was least sure of:

1. **G-B2-02 "Drömmen om en gård"**, line 1: *Jag skulle ha en liten gård* is marked as a conditional (*skulle ha* = "would have"). Check that it doesn't read as "was supposed to have".
2. **G-C1-01 "Till hyresgästerna"**: check the formal register (*Önskar ni skydda möbler …*, *Uppstår det skador …*). Is it natural for a housing association notice, or too stiff?
3. **G-C1-04 extended attributes**: *En av grannarna startad insamling* and *Den i förra veckan försvunna hunden*. These are correct but heavy, so check that they don't sound off.
4. **G-C2-02 "Fyren"**: Stora Ören is a made-up place, so check it isn't a real one with different facts. Also check *säger sig förstå honom*.
5. **G-B2-04**: *Mamman kom springande efter med ett trött leende* (word order with *efter*).
6. **G-B1-02**: commas after a fronted *när/om*-clause are used throughout. Both styles are accepted, so decide which one grove teaches.
7. **G-A2-06**: the example *den gröna jackan* avoids *blå*, which doesn't take -a. Consider adding a note on *blå/grå*.
8. **Phrases**: the C1/C2 idioms' glosses and literal meanings, especially *ta skeden i vacker hand*, *gå över ån efter vatten*, *halka på ett bananskal* and *stå som spön i backen* (used of criticism as well as rain).
9. **Topic words**: *bonusbarn* (an everyday word, gloss "stepchild"), *trappa* "tre trappor upp" glossed "three floors up", and the B2 housing words (*bostadsrätt*, *hyresrätt*, *kontantinsats*), whose glosses are approximations of Swedish-specific things.

## To decide (owner)

1. Approve, fix or drop these drafts, as was done for the library texts.
2. Whether "Spot it" counts only the marked spans or accepts any tap inside a marked word.
3. Whether topic words should keep cells where the lists disagree, or move each word to its list level.

## History

- 2026-10-29: first draft by Claude at the owner's word (B-26): grammar ladder (36 patterns), phrase spotlight (103), topic words (479), next words (120). Checked with a throwaway script, not committed. It confirmed that every file parses, every `mark` occurs exactly once as written (whole-word) in its sentence or line, every `spot` line index exists, the counts and lengths are within the limits above, and example sentences stay at most 14 words at A1–A2 and 20 at B1–B2.

2026-10-29: approved by the owner as it stands, for Discover's Words and Grammar (question-pages/89).
