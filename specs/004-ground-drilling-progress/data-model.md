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
