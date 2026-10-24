# Research: G-04 Ground, drilling and progress

Phase 0 of `/speckit-plan`, 2026-10-24. Builds on G-01…G-03. Clarified on question-pages/59.

## R1. No new dependencies; a small schedule

- **Decision:** The spacing rule of FR-403…FR-405 in plain JavaScript (`server/drill/schedule.mjs`): `strength = 2^(−elapsedDays / gap)`; due at strength ≤ 0.5 (elapsed ≥ gap), fading below 0.2 (elapsed > 2.32 gaps); right → falls if gap ≥ 4, else gap × 2.5; wrong → gap ÷ 2, at least 0.5; a newly marked or picked-up leaf has gap 1 and "last review" = now.
- **Rationale:** RQ-60/79/170 fix the numbers; SC-002 (1 → 2.5 → 6.25, falls on the third right answer) follows. No library (SM-2, FSRS) adds anything the requirements ask for.

## R2. Data (migration 006, no rebuild)

- **Decision:** `ALTER TABLE … ADD COLUMN` only: on `words` — `to_read`, `to_remember`, `drilled`, `gap_days`, `last_review_at`, `reviews`, `fell_marks`; on `learner_settings` — `welcome_dismissed`. New tables `review_answers`, `input_days` (per account) and `level_words` (reference data, shared, no account).
- **Unmarked leaf of a text:** a leaf with `drilled = 0` whose dictionary form is among that text's sentences' new items (G-02 stores them), or whose `source_text_id` is the text.

## R3. Questions in sentences (FR-406, FR-407, FR-410)

- **Decision:** One question builder (`server/drill/questions.mjs`) for Review, Master and Let it fall: find the most recent sentence the learner has read that contains the item (new items, or the item or one of its forms as a word); meaning here = the AI's meaning for that text, else the item's meaning; wrong options = 2–3 other items' meanings (never the same item's). Master blanks the item's form in the sentence and offers the form plus 2–3 forms of other items of similar length. An item with no sentence, or not enough other meanings, becomes a **recall card** (show it, "Do you know what it means?", reveal, self-grade). Patterns: "which explanation fits?" with other patterns' explanations, else a recall card.
- **To remember:** the client speaks the sentence (G-03's `speak`) and hides it until answered; without a Swedish voice it shows the sentence (the To read form).

## R4. Level (FR-414)

- **Decision:** `level_words(level, lemma)` holds each CEFR level's own words (G-06 fills it from the Kelly list). Level = highest level L such that every level ≤ L has ≥ 90% of its words in the ground. Empty table → `null` ("Set your starting level").

## R5. Input minutes (FR-415)

- **Decision:** The reading and review pages send `POST /api/input {seconds: 30, day}` every 30 s while the page is visible and the learner tapped or scrolled within 2 minutes. `day` is the device's date (`YYYY-MM-DD`), accepted if within one day of the server's date (so evenings in Finland count on the right day). At most 60 s per call and 16 hours per day.

## R6. Colours and marks in the reading view (FR-413)

- **Decision:** The G-03 payload's word tokens gain `marks` (`read`, `remember`), `fell` (the marks it had when it fell) and `id` (the item for menu actions); the client maps them to classes for `--cw`, `--rlc`, `--cb`, `--rw`, `--rr`, `--rb`; a token with two or more dictionary forms gets an amber dot.

## R7. The prompt's words to reuse (G-02 FR-210)

- **Decision:** From now on the "words I'm learning" in a prompt are drilled leaves, fading first, then due, then the most recently marked (up to 10), as G-02 FR-210 anticipated.
