# Data model: G-03

Migration `server/store/migrations/005-reading.sql` (runs with foreign keys off, research R4). Every new table has `account_id` (→ `accounts.id ON DELETE CASCADE`), so export and delete cover it.

## Rebuilt tables

| Table | Change |
|---|---|
| words | `kind` CHECK gains `'pattern'` (name as `lemma`, explanation as `en`) |
| texts | `exchange_id`, `package_id`, `part_no` may be NULL; new `own INTEGER NOT NULL DEFAULT 0` |
| exchanges | `package_id` and `part_no` may be NULL (meanings prompts for own-text leaves) |

## New tables

| Table | Fields | Rules |
|---|---|---|
| word_meanings | account_id, word_id → words, text_id → texts, en (≤ 200) | the AI's meaning for a word in that text; PRIMARY KEY (word_id, text_id) |
| pattern_places | account_id, word_id → words (kind pattern), text_id → texts, line_position, words (≤ 80) | one row per place the AI gave |
| names | account_id, name (≤ 80, as written), lower (lower-cased), text_id → texts NULL | UNIQUE (account_id, lower) |
| explain_flags | id, account_id, code (E1…), form (≤ 80), lemma NULL, text_id → texts, sentence_id → sentences, reason (`why_form`, `why_here`, `other_meaning`, `reading`, `other`), note (≤ 200) NULL, status (`open`, `answered`), created_at, answered_at | UNIQUE (account_id, code) |
| explanations | id, account_id, flag_id → explain_flags, form, lemma NULL, explain_en (≤ 500), at | shown in the menu for that form or dictionary form |
| reports | id, account_id, code (R1…), text_id → texts, question_position NULL, line_position NULL, reason (`wrong_answer`, `bad_translation`, `unnatural`, `wrong_reading`, `audio`, `other`), note (≤ 200) NULL, status (`open`, `fixed`), created_at, fixed_at | exactly one of question_position / line_position; UNIQUE (account_id, code) |

## Changed

| Table | Change |
|---|---|
| learner_settings | `show_translations INTEGER NOT NULL DEFAULT 1` |
| words | migration 012: `example_sentence_id INTEGER NULL REFERENCES sentences (id) ON DELETE SET NULL`; index `words_account_kind_lemma (account_id, kind, lemma)` (FR-316, question-pages/72) |
| settings | `examples_filled` = `1` once the start-up load has given the words met before migration 012 their examples |

## Rules carried

- Codes are per account and never reused (next number = count + 1).
- A reported question's answers don't count (G-02 summary and the reading page).
- Own texts: `own = 1`, English empty, no exchange; their sentences store new items like AI texts.
