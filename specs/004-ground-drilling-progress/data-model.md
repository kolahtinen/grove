# Data model: G-04

Migration `server/store/migrations/006-drill.sql` (adds columns and tables; no rebuild).

## words — new columns

| Column | Type | Rules |
|---|---|---|
| to_read | INTEGER NOT NULL DEFAULT 0 | mark (0/1) |
| to_remember | INTEGER NOT NULL DEFAULT 0 | mark (0/1) |
| drilled | INTEGER NOT NULL DEFAULT 0 | 1 when it has a schedule (a mark is on) |
| gap_days | REAL NULL | ≥ 0.5 while drilled |
| last_review_at | INTEGER NULL | ms; set when marked or answered |
| reviews | INTEGER NOT NULL DEFAULT 0 | answers given |
| fell_marks | TEXT NULL | `read`, `remember` or `both`: the marks when it fell (for colours) |

States: **unmarked leaf** (state leaf, drilled 0) → marked → **drilled leaf** (state leaf, drilled 1) → right at gap ≥ 4 or Let it fall → **ground** (drilled 0, fallen_at, fell_marks) → Pick up → drilled leaf. Done in the marking step without a mark: unmarked leaf → ground (fell_marks NULL). Delete on Leaves removes the row.

## New tables

| Table | Fields | Rules |
|---|---|---|
| review_answers | account_id → accounts, word_id → words ON DELETE CASCADE, mode (`read`, `remember`, `master`, `recall`, `fall_check`), right (0/1), at | one row per answer |
| input_days | account_id → accounts, day (`YYYY-MM-DD`), seconds | PRIMARY KEY (account_id, day); seconds ≤ 57,600 |
| level_words | level (`A1`…`C2`), lemma | PRIMARY KEY (level, lemma); reference data, no account (filled by G-06) |

## learner_settings — new column

| Column | Type | Rules |
|---|---|---|
| welcome_dismissed | INTEGER NOT NULL DEFAULT 0 | |

## Addendum 003: migration 013 (FR-418, RQ-415, RQ-412, RQ-411)

`server/store/migrations/013-to-remember.sql`:
- `words`: every `to_read = 1` becomes `to_remember = 1`, `to_read = 0`, keeping `drilled`, `gap_days`, `last_review_at` and `reviews`; `fell_marks` is kept as it was (colours of words that fell before, FR-413). The `to_read` column stays (always 0 for Swedish; kept for languages with their own writing system).
- `learner_settings`: `speak_words INTEGER NOT NULL DEFAULT 1 CHECK (speak_words IN (0, 1))` added; `show_translations` dropped.
