# 97 — The library job's results: lengths, patterns, meanings

Asked 2026-10-31 in Claude Code, one at a time, after the background job (the owner: "populate library more; it should get texts of different lengths. finally, analyse all texts for grammar patterns and give those grammar patterns cefr levels. make sure common library does not have empty meanings or mistakes."). Its results: content/library/README.md (pending texts, patterns, meanings).

### 1. 12 new short and long texts fail the checker's word ranges. Widen them? (default: as proposed)
- Widen as proposed (Recommended): A1 25–160, A2 40–240, B1 60–360, B2 70–500, C1 120–700, C2 130–800
- Only a little wider
- Keep the ranges
**Answer:** Widen as proposed.

### 2. Grammar patterns with CEFR levels for every library text: bring them in, and show the level? (default: both)
- Bring in, show level (Recommended)
- Bring in, no level
- Not yet
**Answer:** Bring in, show level.

### 3. Corrected meanings (189 empty, 311 another word's): how should grove use them? (default: an override list for every text)
- Override list, all texts (Recommended): per-text senses take the text's own row; a stored meaning stays
- Library texts only
- Both
**Answer:** Override list, all texts.

## Applied
RQ-464…RQ-466; G-09 FR-916 (ranges; grove texts carry patterns and their own meanings), G-02 FR-222 (the corrections before the word list), G-03 FR-305 (the level chip on a text's pattern). Build: library, lexicon, store (a pattern's level), reading, client, after the sketch round's regeneration.
