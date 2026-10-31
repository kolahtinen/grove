# Data model: G-09 additions

Migration `014-sessions.sql` (012 and 013 were taken by the Dictionary and addendum 003). Adds one table, `practice_sessions` (`sessions` is G-01's sign-in sessions); changes no rows.

## practice_sessions

| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER PRIMARY KEY | |
| `account_id` | INTEGER NOT NULL | → `accounts (id)` ON DELETE CASCADE (exported and deleted by `owner data`) |
| `kind` | TEXT NOT NULL | `time` \| `topic` \| `skill` \| `mode` |
| `minutes` | INTEGER | 3–60; NULL for `mode` |
| `params` | TEXT NOT NULL DEFAULT `'{}'` | JSON: `{topic}` \| `{skill: reading\|listening\|words\|grammar, form: short\|medium\|long}` \| `{mode: discover\|review\|master}`, plus `{voice: bool}` |
| `plan` | TEXT NOT NULL | JSON array of exercises, below; ≤ 80 |
| `at_index` | INTEGER NOT NULL DEFAULT 0 | the exercise shown next; = length when finished |
| `status` | TEXT NOT NULL | `going` \| `finished` \| `replaced` |
| `started_at` | INTEGER NOT NULL | ms |
| `finished_at` | INTEGER | ms; set when finished or replaced |

Indexes: `UNIQUE (account_id) WHERE status = 'going'` (one going session per account; the reviewer's "last started wins"); `(account_id, started_at)`.

## Migration 017 (addendum 006): tile, skill, harder questions only, the short-session offer

`017-session-tiles.sql` adds four columns to `practice_sessions` (no table rebuild; `kind` keeps its four values) and fills them for the rows already there; it changes no other row.

| Column | Type | Notes |
|---|---|---|
| `tile` | TEXT | `discover` \| `review` \| `mix` (FR-903). New sessions: `kind` `time` (from a tile) or `topic` (Practise this topic, always `mix`). Filled for old rows: `time`, `topic`, `skill` → `mix`; `mode` → `discover` for Discover, `review` for Review and Master |
| `skill` | TEXT | `mix` \| `reading` \| `listening` \| `words` \| `grammar` (FR-906). Filled for old rows: `skill` sessions their `params.skill`, `words` for `words` (Words and phrases), all others `mix` |
| `hard_only` | INTEGER NOT NULL DEFAULT 0 | 0 \| 1: Review's Harder questions only (FR-905). Filled 1 for old `mode` sessions of Master |
| `offer` | TEXT | JSON or NULL: `{ missing: { reading: seconds, listening: seconds }, at: ms }`, the short-session offer's minutes missing per text kind and its time (FR-920, FR-923); the fill bars count texts added to the learner's library after `at`. NULL when no offer was made |

The return link (FR-923) is this row: a page shows "‹ Back to your session" only while the learner's own going session has an `offer`.

## Exercise (inside `plan`)

`{ mode: discover|review|master, type: text|reread|listen|review|master, seconds, textId?, lemma?, kind?, done: bool }` (addendum 006: new plans write a harder question as `mode: review, type: master`; old plans' `mode: master` items are shown as Review, FR-912)

- `text`: read or hear an unread or unfinished text (the reading page; marking step after a first reading).
- `reread`, `listen`: a text already read, read again or heard (pending PD-28).
- `review`, `master`: one leaf by `lemma` + `kind`; the question is built when shown (research R5).

## State

`going` → `finished` (the last exercise's `next`) · `going` → `replaced` (another session started). A finished or replaced session is kept for the summary and "days practised" (pending PD-05) and goes with the account on deletion.

## Unchanged

`words`, `review_answers`, `texts`: sessions read them; answers and reads change them through G-03's and G-04's routes as before. The summary counts `review_answers` and `texts.read_at` between `started_at` and `finished_at`.

## Migration 019 (B-27; FR-924, FR-925): minutes per kind, picked-up time

`019-progress.sql` changes no row's meaning:

| Table | Column | Notes |
|---|---|---|
| `input_days` | `read_seconds`, `listen_seconds` INTEGER NOT NULL DEFAULT 0 | Each 0–57600; with `seconds` still the day's total. Existing rows: `read_seconds = seconds` (all earlier input was counted on text pages). "Other" is `seconds − read_seconds − listen_seconds`. |
| `words` | `picked_at` INTEGER | When the leaf was first drilled (FR-925). Existing drilled or fallen leaves: `added_at`. |
The starting level's day is `learner_settings.start_at`, kept since G-06.


## Migration 020 (B-24…B-26; FR-905, FR-928…FR-931): learning content, what a learner has seen, reports

`020-learning.sql` adds three tables and changes no row. The ticked skills (B-25) need no column: a new session's `params` holds `skills` (the ticked skills in the order Reading, Listening, Words, Grammar; `[]` = all), and its `skill` column is the one ticked skill, or `mix` for none or several. A row without `params.skills` (every session before 020) counts as `[]` for `mix` and `[skill]` otherwise.

| Table | Column | Notes |
|---|---|---|
| `learning_items` | `id` TEXT PRIMARY KEY | `G-<level>-<nn>` a grammar pattern, `P-<level>-<nn>` a phrase, `W-<dictionary form>` a word (next words first, then topic words; one item per form) |
| | `type` TEXT NOT NULL | `pattern` \| `phrase` \| `word` |
| | `level` TEXT NOT NULL | A1…C2 |
| | `position` INTEGER NOT NULL | order within its type: the ladder's for patterns, the files' for phrases and words |
| | `data` TEXT NOT NULL | JSON: the item as in its content file (pattern: name, explain_en, how_to_spot, examples, text, spot; phrase: phrase, en, note, examples; word: lemma, pos, en, example, topic) |
| `learning_seen` | `account_id` INTEGER NOT NULL | → `accounts (id)` ON DELETE CASCADE |
| | `item_id` TEXT NOT NULL | a `learning_items` ID (no foreign key: the content can change at start-up) |
| | `first_at`, `last_at` INTEGER NOT NULL | ms; a word or phrase shown, a pattern met (its Spot it checked) |
| | | PRIMARY KEY `(account_id, item_id)` |
| `learning_reports` | `id` INTEGER PRIMARY KEY | |
| | `account_id` INTEGER NOT NULL | → `accounts (id)` ON DELETE CASCADE |
| | `item_id` TEXT NOT NULL | |
| | `reason` TEXT NOT NULL | `wrong_meaning` \| `bad_translation` \| `unnatural` \| `wrong_mark` \| `audio` \| `other` |
| | `note` TEXT | ≤ 200 characters |
| | `status` TEXT NOT NULL DEFAULT `open` | `open` \| `closed` |
| | `created_at` INTEGER NOT NULL | ms |

The import keeps a hash of `server/learning/learning-content.json` in `settings` (`learning_content_hash`), as the library's texts do (`grove_texts_hash`).

## Exercise (B-26 additions)

`{ mode: discover, type: words, items: [ids], seconds }` (a Words exercise, 30 s a card) · `{ mode: discover, type: phrase, item, seconds: 150 }` · `{ mode: discover, type: grammar, item, learn: bool, seconds: 300 | 150 }`.

## Migration 021 (RQ-456, RQ-463; G-03 FR-315, G-06 FR-605): Not a name?, the starting level once

`021-sketches.sql` (foreign keys off, a table rebuild) changes no row's meaning:

| Table | Change | Notes |
|---|---|---|
| `reports` | rebuilt with the same columns, rows and indexes; `reason` also takes `not_a_name` | A name's word menu reports its sentence with "Not a name?" (G-03 FR-305, FR-315) |
| `learner_settings` | `start_offered` INTEGER NOT NULL DEFAULT 0 | 1 once the starting level page has been opened (G-06 FR-605: Home sends a new account there once). Existing rows: 1 where the choice is made (`start_done`) or the welcome was closed (an account that already saw Home) |

## Exercise (RQ-457…RQ-459 additions; no migration)

Inside `plan`, an exercise also keeps:
- `shown`: the exercise as first shown (its question with its options and right answer, the cards, the phrase, the pattern), stored the first time the session shows it (G-04's questions are shuffled when built, so looking again needs the one shown); at most 8 KB.
- `answer`: the learner's answer sent with `POST /api/session/next` (contracts: `Answer`), shown when the exercise is looked at again.

A session left on its offer, never planned (`plan` = `[]`, `offer` set), is deleted by `POST /api/session/leave` (FR-904: not kept, no Resume). Home's Resume shows only a going session with a plan.

The summary reads, between `started_at` and `finished_at`: done text exercises by kind (not `reread` or `listen`), `review_answers` as before, `words.picked_at` (picked up), `learning_seen.first_at` of patterns (met), `words.fallen_at`.
