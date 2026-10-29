# Graded Swedish word lists for learners

The owner asked for a better graded word list than Kelly (question-pages/76, F2, F4). Kelly's levels are frequency bands from web text, so everyday beginner words sit too high (kaffe A2, mjölk B1, smörgås C2). Checked 2026-10-29 on Språkbanken's resource pages and the CEFRLex pages at UCLouvain.

## What exists

| List | Grades by | Size | Licence | Format | Can grove bundle it? |
|---|---|---|---|---|---|
| **SVALex** (François, Volodina, Pilán & Tack 2016) | the CEFR level of **coursebook** texts a word appears in (COCTAILL corpus: Rivstart, Svenska Utifrån, På svenska!, Nya Mål, Språkporten…); receptive vocabulary | 15,681 entries (13,868 words after removing junk), A1–C1 | **CC BY-NC-SA 4.0** | TSV/XLSX in .tar.bz2; per level: normalized frequency, number of texts, per coursebook | **Not without a decision.** "NC" forbids commercial use. "SA" requires sharing under the same licence, and BY-NC-SA can't be combined with the CC BY-SA data grove already uses (Kelly, Wiktionary) in one derived file. Used here only to compare, not saved in the repo. |
| **SweLLex** (Volodina, Pilán, Llozhi, Degryse & François 2016) | the CEFR level of **learner essays** that use a word (SweLL-pilot corpus, 339 essays: A1 15, A2 82, B1 75, B2 74, C1 88); productive vocabulary | 6,967 entries (4,663 words after removing misspellings, which it marks with `*`) | **CC BY 4.0** | TSV/XLSX in .tar.bz2; same columns | **Yes**, with attribution. |
| Swe-MWELex | multi-word expressions from both corpora | small | (not checked in detail) | | later, for phrases |
| SFI-based lists | none found with an open licence; the SFI word books on the market (e.g. "Bygg upp ditt ordförråd", "Nybörjarsvenska") are sold, not licensed for reuse | | | | no |
| Kelly (carried already) | web-text frequency bands, A1–C2 | 8,170 | CC BY-SA 3.0 / LGPL 3.0 | | yes (already) |

Sources: [SVALex at Språkbanken](https://spraakbanken.gu.se/en/node/4675) · [SweLLex at Språkbanken](https://spraakbanken.gu.se/en/node/4676) · [CEFRLex: SVALex](https://cental.uclouvain.be/cefrlex/svalex) · [CEFRLex: SweLLex](https://cental.uclouvain.be/cefrlex/swellex) · [SVALex paper, LREC 2016](https://aclanthology.org/L16-1032/) · [SweLL paper](https://arxiv.org/pdf/1604.06583).

## Compared with Kelly

A word's level here is the first CEFR level that uses it (`nb_doc` > 0). Rows are the graded list's level and columns Kelly's; counts are words in both lists.

**SweLLex** (4,663 words; 1,362 not in Kelly)

| | Kelly A1 | A2 | B1 | B2 | C1 | C2 |
|---|---|---|---|---|---|---|
| **A1** | 202 | 47 | 21 | 16 | 10 | 3 |
| **A2** | 336 | 160 | 88 | 58 | 41 | 24 |
| **B1** | 379 | 284 | 140 | 107 | 61 | 40 |
| **B2** | 111 | 167 | 118 | 64 | 63 | 19 |
| **C1** | 67 | 212 | 180 | 134 | 101 | 45 |

- 293 words move **down** two or more levels, e.g. baka B2 → A1, bio B2 → A2, byxa B2 → A2, bebis C1 → A2, apelsin C2 → B1, ambulans C1 → B1.
- 1,119 move **up**, e.g. acceptera A1 → B1, analys A1 → B2, allvar A1 → C1. Most of these only mean learners didn't *write* the word early, not that it is hard. That is why the checker never lets SweLLex raise a word above Kelly.
- Noise from only 15 A1 essays: assistera, berika and bomba land at A1.

**SVALex** (13,868 words; 8,319 not in Kelly; for comparison only)

| | Kelly A1 | A2 | B1 | B2 | C1 | C2 |
|---|---|---|---|---|---|---|
| **A1** | 437 | 165 | 84 | 65 | 47 | 26 |
| **A2** | 350 | 296 | 179 | 147 | 135 | 101 |
| **B1** | 308 | 366 | 342 | 264 | 247 | 159 |
| **B2** | 67 | 219 | 256 | 243 | 246 | 168 |
| **C1** | 24 | 91 | 138 | 146 | 145 | 88 |

- 1,179 words move down two or more levels, e.g. apotek B2 → A1, apelsin C2 → A1, ambulans C1 → A1, abonnemang C1 → A1, arbetskamrat B2 → A1, adjö C2 → A2.
- SVALex is the better fit for a reading library: it is graded by what learners **read** in coursebooks, it is three times SweLLex's size and its A1 is built from 82 texts rather than 15.

## Recommendation

1. **Now: SweLLex + Kelly + the core list** (done on this branch). The check takes a word's level from `core-a1a2.tsv` first, then the lower of SweLLex and Kelly. All three are bundleable.
2. **Decide on SVALex** (owner). Its licence only matters if grove is or becomes commercial or wants to publish combined files. Options:
   - **(a)** Ask Språkbanken whether grove's use is fine (free, no ads, a hobby project). They are the rights holders and often answer.
   - **(b)** Use SVALex only at build time to *choose* levels, publishing no SVALex data. This needs the same check, since the derived levels are still adaptations.
   - **(c)** Don't use it.

   (a) is cheapest and settles it.
3. Whatever is chosen, keep the core list as the hand-checked override for A1–A2.

## Files

- `vocab-graded/<level>.tsv`: SweLLex words per level with meanings and flags, built by `node scripts/build-library-graded.mjs path/to/SweLLex_v1.tsv [path/to/svalex.tsv]`. With SVALex's path it only prints the comparison above. The downloads were kept outside the repo (SweLLex_v1.tsv sha256 bd58cf3aff3a6aeffa83…, svalex.tsv sha256 3491b1a51c004b58b0bd…), read as data only.
- `core-a1a2.tsv`: the stopgap core list (README).
