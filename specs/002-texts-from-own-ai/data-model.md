# Data model: G-02

New migration `server/store/migrations/004-texts.sql`. Every table has `account_id` (→ `accounts.id ON DELETE CASCADE`), so the owner's export and delete commands (G-01 FR-017) cover them without changes. Times are UTC milliseconds.

## words (spec: Word entry + Learner word)

One row per word or fixed phrase per account (no shared lexicon in the first build; the shared bank is second build).

| Field | Type | Rules |
|---|---|---|
| id | INTEGER PK | |
| account_id | INTEGER NOT NULL | |
| lemma | TEXT NOT NULL | dictionary form, lower-case, ≤ 80 chars |
| kind | TEXT NOT NULL | `word` or `phrase` |
| en | TEXT NULL | English meaning, ≤ 200 chars; NULL only for legacy rows the word list lacks (shown as "meaning coming with your next texts" and put first in the next meaning checks) |
| en_source | TEXT NULL | `ai`, `dictionary` or `learner` (migration 010; FR-207) |
| explain_sv | TEXT NULL | simple Swedish explanation, ≤ 300 chars |
| state | TEXT NOT NULL | `leaf` or `ground` (glossary) |
| uses | INTEGER NOT NULL DEFAULT 0 | times seen in accepted texts (prompt choice, research R4) |
| added_at | INTEGER NOT NULL | |
| fallen_at | INTEGER NULL | when it joined the ground |
| source_text_id | INTEGER NULL → texts.id ON DELETE SET NULL | |
| UNIQUE (account_id, lemma, kind) | | |

## word_forms

| Field | Type | Rules |
|---|---|---|
| account_id | INTEGER NOT NULL | |
| form | TEXT NOT NULL | lower-case, ≤ 80 chars |
| word_id | INTEGER NOT NULL → words.id ON DELETE CASCADE | |
| PRIMARY KEY (account_id, form, word_id) | | a form can belong to two words (homographs) |

## learner_settings (spec: Learner settings)

| Field | Type | Rules |
|---|---|---|
| account_id | INTEGER PK | |
| topic | TEXT NULL | ≤ 80 chars; NULL → the default topic "everyday life" |
| topics_used | TEXT NOT NULL DEFAULT '[]' | JSON array of lower-cased topics that already got starter words |
| target_share | REAL NOT NULL DEFAULT 95 | 93–98 (CHECK) |
| firm_new | INTEGER NOT NULL DEFAULT 0 | 1 = next prompt asks more firmly for new words |
| shorter | INTEGER NOT NULL DEFAULT 0 | 1 = next prompt asks for shorter sentences |
| high_streak | INTEGER NOT NULL DEFAULT 0 | 'most'/'everything' in a row |
| last_summary_at | INTEGER NOT NULL DEFAULT 0 | |

## packages (spec: Package)

| Field | Type | Rules |
|---|---|---|
| id | INTEGER PK | |
| account_id | INTEGER NOT NULL | |
| parts_total | INTEGER NOT NULL DEFAULT 3 | |
| parts_accepted | INTEGER NOT NULL DEFAULT 0 | ≤ parts_total |
| status | TEXT NOT NULL | `open`, `finished`, `closed` |
| created_at | INTEGER NOT NULL | |

At most one `open` package per account (partial unique index).

## exchanges (spec: Exchange)

| Field | Type | Rules |
|---|---|---|
| id | INTEGER PK | |
| account_id | INTEGER NOT NULL | |
| package_id | INTEGER NOT NULL → packages.id | |
| part_no | INTEGER NOT NULL | 1–3 |
| kind | TEXT NOT NULL | `part`, `fix`, `meanings` |
| code | TEXT NOT NULL | part code, e.g. `K7QM-2`; a fix shares its part's code |
| carries_summary | INTEGER NOT NULL DEFAULT 0 | |
| fixes_id | INTEGER NULL → exchanges.id | the part a fix belongs to |
| prompt | TEXT NOT NULL | |
| status | TEXT NOT NULL | `waiting`, `needs_fix`, `accepted`, `replaced` |
| answer_hash | TEXT NULL | SHA-256 of the accepted JSON |
| asked_forms | TEXT NULL | JSON array of the forms the prompt asks about (meanings fix-its, meaning checks, own-text pieces): trimmed, lower case, no repeats, in the order first asked, always made by `askedForms` in `server/words/asked.mjs` (FR-207; question-pages/68, 3); migration 009 filled it once for old meanings exchanges from their prompts |
| created_at, answered_at | INTEGER | |

## texts, text_lines, questions, sentences (spec: Text, Sentence)

| Table | Fields |
|---|---|
| texts | id PK, account_id, exchange_id, package_id, part_no, position (1–3), title (≤ 120), topic, created_at, read_at NULL |
| text_lines | account_id, text_id → texts ON DELETE CASCADE, position, sv (≤ 400), en (≤ 400) |
| questions | account_id, text_id → texts ON DELETE CASCADE, position, q (≤ 300), options (JSON array of 2–3 strings ≤ 200), answer (index) |
| sentences | id PK, account_id, text_id → texts ON DELETE CASCADE, line_position, position, sv, new_items (JSON array of lemmas) |

## ratings, question_answers (spec: Rating)

| Table | Fields |
|---|---|
| ratings | account_id, text_id → texts ON DELETE CASCADE, value (`almost_nothing`, `a_little`, `about_half`, `most`, `everything`), at; UNIQUE (account_id, text_id) — a new rating replaces the old |
| question_answers | account_id, text_id → texts ON DELETE CASCADE, position, option, right (0/1), at; UNIQUE (account_id, text_id, position) — first answer counts |

## Ground before G-04/G-06

G-02 reads `state = 'ground'` as known. The starting level (G-06) and demo history (G-07) fill the ground; drilling and falling (G-04) move leaves there. Tests seed ground words directly.

## Migration 010 (2026-10-26; addendum 002, FR-202–FR-207, FR-219; G-03 FR-318)

`server/store/migrations/010-setup-and-meanings.sql`:

| Table | Added | Rules |
|---|---|---|
| words | `en_source` | as above; existing rows with a meaning get `ai` |
| packages | `code` TEXT NULL | four random letters, shared by its parts' codes (`K7QM-2`) and the whole-package code (`K7QM`) |
| packages | `summary` TEXT NULL | the summary its setup sent, resent by **I'm in a new chat** |
| packages | `one_text` INTEGER NOT NULL DEFAULT 0 | 1 = every later request asks for one text (FR-206) |
| packages | `fail_streak` INTEGER NOT NULL DEFAULT 0 | answers in a row with a failed text |
| exchanges | `steps` TEXT NULL | JSON array of prompt strings shown before the request: the setup prompts (empty when the request needs none); `prompt` stays the request itself |
| exchanges | `asks` TEXT NULL | JSON array of the texts the request asks for: `{part, kind}` |
| exchanges | `held` TEXT NULL | meanings fix-its: the checked texts waiting for their meanings, as JSON |
| exchanges | `text_id` INTEGER NULL → texts.id ON DELETE CASCADE | own exchanges: the own text the piece belongs to |
| texts | `kind` TEXT NOT NULL DEFAULT 'reading' | `reading` or `listening` (CHECK) |
| texts | `ready` INTEGER NOT NULL DEFAULT 1 | own texts: 0 until their AI round is complete (G-03 FR-318) |
| texts | `copyright_view` TEXT NULL, `copyright_note` TEXT NULL | own texts: the AI's view, `free`, `unsure` or `copyrighted`, and its reason (≤ 300) |
| texts | `known_share` REAL NULL | own texts: share of known words when added (G-03 FR-318) |
| learner_settings | `whole_package` INTEGER NOT NULL DEFAULT 0 | the learner's choice (FR-203) |

New table `text_meanings` (G-03 FR-318): account_id, text_id → texts ON DELETE CASCADE, form, lemma, en (≤ 200), explain_sv (≤ 300) NULL; PRIMARY KEY (text_id, form). The AI's meaning of every word of an own text, in context.

`exchanges.kind` values become `part`, `package` (whole package), `redo`, `fix`, `meanings_fix`, `own` (and `meanings` for old rows); the table is rebuilt for the new CHECK, keeping its ids. Existing waiting `meanings` exchanges become `replaced` (the meanings prompt is gone). A part is accepted when its texts of each kind reach `GROVE_PART_READING` and `GROVE_PART_LISTENING`; `packages.parts_accepted` counts those parts.

## Migration 011 (2026-10-26; FR-223, question-pages/70)

`server/store/migrations/011-tactics.sql`: `learner_settings` gains `ai_family` TEXT NULL (`chatgpt`, `gemini`, `claude`, `copilot`, `lechat`, `other`), `ai_product` TEXT NULL (an id from the table in `server/texts/plans.mjs`) and `tactic` TEXT NOT NULL DEFAULT 'steps' (`steps`, `long`, `whole`; CHECK); a learner with `whole_package = 1` gets `tactic = 'whole'`. `whole_package` stays unused. `packages` gains `tactic` TEXT NULL: the tactic its first request used, so a started package keeps its shape.

