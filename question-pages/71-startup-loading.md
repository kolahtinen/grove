# 71 — Loading the word list at start-up

Found while finishing the FR-223/FR-224 regeneration (2026-10-26): G-07 SC-003 ("creating the reviewer account with its demo takes under 2 seconds") fails, at about 2.03 s, on HEAD as well. 1.3 s of it is the first meaning lookup reading grove's word list (`server/lexicon/sv-en.tsv`, 294,291 lines). G-02 SC-003 (checking a one-part answer takes at most 2 s) is at risk in the same way on the first answer after a restart.

## 1. How should it be fixed? (default: load at start-up)

- **Load at start-up (Recommended)**: grove reads the word list once when it starts, before it takes requests.
- Faster file format: the build writes the word list in a form that loads much faster.
- Word list in the database: imported into SQLite once; each lookup is a quick query.
- Relax the time limit: SC-003 measures the demo with the word list already loaded.

**Answer (Other):** "load at start-up, for other big loads set up batch loading, set up start up loading screen"

## 2. "Batch loading" for other big loads: what should it mean? (default: in steps, so grove can answer while loading)

- **In steps, server answers**: big loads run in chunks, so grove can show the loading screen meanwhile.
- Everything at once: all big loads happen together before grove starts.
- Database writes batched: large imports write many rows per database step.

**Answer:** In steps, server answers (the default).

## 3. The start-up loading screen: what should a learner see while grove loads? (default: logo, message, auto-reload)

- Logo, message, auto-reload: a small page that opens grove by itself when loading is done.
- **Same, with a progress bar**: as above, plus how far loading has got.
- Plain message only: plain text, reload by hand.

**Answer:** Same, with a progress bar.

## Applied

RQ-407, RQ-408 in addendum 002; G-01 FR-032 and SC-008 (with the HTTP and owner-command contracts); G-02 FR-222 and G-06 FR-601 name FR-032 as their start-up load; G-07 SC-003 counts from a started grove. The logo is grove's current logo until the oak (question-pages/65) replaces it everywhere.
