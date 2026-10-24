# Data model: G-06

Migration `server/store/migrations/007-levels.sql` (adds columns and a table; no rebuild).

| Table | Change |
|---|---|
| level_words | + `kind TEXT NOT NULL DEFAULT 'word'`, `wpm REAL`, `source TEXT`, `licence TEXT` |
| sources (new) | `name TEXT PRIMARY KEY`, `licence TEXT NOT NULL`, `url TEXT` — reference data for the credits page |
| words | + `origin TEXT` (`start` when the starting check added it) |
| learner_settings | + `start_level TEXT` (`A1`…`C2`, `beginner`), `start_done INTEGER NOT NULL DEFAULT 0`, `start_at INTEGER` |
| settings | key `kelly_hash` (the imported file's hash) |

Untouched starting-check word (replaced by a new check): `origin = 'start'` and `drilled = 0` and `uses = 0` and `fell_marks IS NULL` and no `review_answers`.
