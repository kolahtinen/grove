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
