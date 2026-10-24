# Research: G-06 Starting level

Phase 0 of `/speckit-plan`, 2026-10-25. Builds on G-01…G-04. Clarified on question-pages/60.

## R1. The Kelly file in the build (FR-601)

- **Decision:** `scripts/build-kelly.mjs <kelly.xml>` turns Språkbanken's `kelly.xml` (https://svn.spraakbanken.gu.se/sb-arkiv/pub/lexikon/kelly/kelly.xml, 8,425 entries, sha256 `80495f31…7cdb`, fetched 2026-10-25) into `server/levels/kelly-sv.tsv`: one line per cleaned form — `lemma`, `level` (A1–C2), `kind` (word/phrase), `pos`, `wpm` — with a header naming the source, licence and file hash. The TSV is committed with `server/levels/KELLY-LICENCE.txt` (CC BY-SA 3.0 / LGPL 3.0, attribution).
- **Cleaning:** drop notes in brackets (`vara (vardagl. va)` → `vara`); lower-case; trim; skip empty forms; a form seen twice keeps its lowest level and highest frequency; a form with a space is a phrase. Parsed with a small regex reader (the file is flat, one tag per line), no XML dependency.
- **Rationale:** RQ-117 reduced: "the Kelly list as a plain file, not in a shared bank". A derived TSV keeps the build small (~200 KB) and reviewable.

## R2. Import at start-up (FR-601)

- **Decision:** `server/levels/import.mjs` hashes the TSV; if `settings.kelly_hash` differs, it replaces all `level_words` rows from Kelly in one transaction (with `source`, `licence`, `kind`, `wpm`) and records the hash. Missing file → log and carry on (the level line keeps "Set your starting level").

## R3. Data (migration 007, no rebuild)

- **Decision:** `level_words` gains `kind`, `wpm`, `source`, `licence`; new table `sources (name, licence, url)` for the credits; `words` gains `origin` (`start` for words the starting check added); `learner_settings` gains `start_level` (A1–C2 or `beginner`), `start_done`, `start_at`.

## R4. The check (FR-603…FR-607)

- **Sample:** the level's words sorted by frequency, 30 taken at even steps from most to least common (all of them if fewer than 30).
- **Apply (one transaction):** first remove untouched starting-check words — `origin = 'start'`, never drilled, no review answers, not met in a text (`uses = 0`), not fallen from a leaf (`fell_marks` NULL) — then insert every word of the levels up to the chosen one as ground (`origin = 'start'`), except words the learner already has (their state is kept) and the ticked ones, which are inserted as unmarked leaves (`origin = 'start'`, no meaning). Beginner: only the removal step.
- **Suggestion:** 20 or more ticked → `suggestLower: true` (A1 has none below).

## R5. Pages and routing (FR-605, FR-606)

- **Decision:** `/start` (agreed): level buttons, the sample with tick boxes, Confirm, the suggestion. `GET /api/stages` gains `needsStart` (not the reviewer, check not done) and `canRestart` (not the reviewer). Home: closing the welcome goes to `/start` when `needsStart`; a "Set my starting level again" link when `canRestart`. `/credits` is public, linked from the terms page and Home.
