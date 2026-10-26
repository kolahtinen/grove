# Research: G-03 Reading and the word menu

Phase 0 of `/speckit-plan`, 2026-10-24. Builds on G-01 and G-02 (`specs/002-texts-from-own-ai/research.md`). Clarified on question-pages/58.

## R1. No new dependencies

- **Decision:** Plain JavaScript on Node built-ins and the browser's Web Speech API (`speechSynthesis`) for speaking words and texts.
- **Rationale:** Constitution 2.6; C-03 (browser voices).

## R2. Menu data comes with the text (FR-305, SC-001)

- **Decision:** `GET /api/reading?id=N` returns the text already split into sentences and tokens, each word token carrying its status, dictionary forms, meaning here, explanation, and the phrases and patterns it belongs to. A tap opens the menu from that data with no request, so it opens well within 0.5 s.
- **Resolution of a token** (server, `server/words/resolve.mjs`): name (answer's names list, or capitalised mid-sentence) → **name**; else the dictionary forms it may come from, checked against all the learner's words (ground and leaves): the word itself, learned forms (word_forms), the common irregular table, the regular endings, compounds (G-02 research R2). If one of those is a ground word → **ground**; else a leaf → **leaf**; else **new**.
- **Leaf forms:** accepting an answer now also learns each listed new word's form when it differs from its dictionary form (*kopparna* → *kopp*), under the same plausibility rule (G-02 FR-216), so leaves resolve too.
- **Meaning here:** the AI's meaning for that word in that text (stored per text from `new_words` from now on) → the word's meaning → "meaning missing".

## R3. Patterns, explanations and fixes in the answer (FR-307, FR-313, FR-315)

- **Decision:** Three new optional lists in G-02's answer format (prompt, schema, accept):
  - `patterns`: `[{ "name": "…", "explain_en": "…", "places": [{ "text": 1, "line": 3, "words": "har glömt" }] }]` (≤ 20 patterns, ≤ 20 places each).
  - `explanations`: `[{ "code": "E1", "explain_en": "…" }]` answering the prompt's open Explain flags, listed as `E1: "kopparna" in "Maja tvättar kopparna." — reason: why this form — note: …`.
  - `fixes`: `[{ "code": "R1", "q": "…", "options": […], "answer": 0 }]` or `[{ "code": "R2", "sv": "…", "en": "…" }]` answering reports listed as `R1: text "Olles väska", question 2 ("Var hittar Elsa väskan?") — reason: wrong answer — note: …`.
- **Codes:** flags and reports get codes per account (E1, E2…, R1, R2…) so the AI's answer can be matched exactly.
- **Pattern places:** found by searching the line for the given words, case-insensitive, on word boundaries; not found → stored but not marked.
- **Patterns as items:** a `words` row of kind `pattern`, its name as the dictionary form and the English explanation as its meaning; the same name again is the same item.

## R4. Schema change with a table rebuild (migration 005)

- **Decision:** SQLite can't change a CHECK constraint or drop NOT NULL in place, so migration 005 rebuilds three tables with the standard copy-and-rename: `words` (kind gains `pattern`), `texts` (`exchange_id` and `package_id` may be NULL for own texts; new column `own`) and `exchanges` (`package_id` may be NULL for meanings prompts about own-text leaves). Rows keep their ids, so references stay valid.
- **Foreign keys:** the rebuild must run with foreign keys off (dropping the old table would otherwise cascade-delete its children). `migrate.mjs` learns one marker: a migration file starting with `-- foreign-keys-off` runs as `PRAGMA foreign_keys = OFF` → transaction → `PRAGMA foreign_key_check` (must be empty) → `PRAGMA foreign_keys = ON`.
- **Test:** G-01's "migration keeps data" test fills the version-4 database (now including texts and words) and checks every row survives version 5.

## R5. Reading practice (FR-310…FR-312)

- **Decision:** `GET /api/practice?id=N` builds the word questions on the server: sentences with a leaf, in order, at most 8; for each, the meaning here and 2–3 wrong options drawn at random from other words' meanings the learner has (never the same text, never equal to the right one); shuffled, with the right index. The client checks answers itself (no stakes; nothing stored in G-03). Then the passage questions (G-02's `/api/question`), then the full text with Play.
- **Play:** `speechSynthesis.speak` one sentence at a time with a Swedish voice (`lang` starting `sv`), highlighting the current sentence; no Swedish voice → the button says "No Swedish voice on this device" (G-05 adds the help).

## R6. Reports don't count (FR-315, SC-004)

- **Decision:** A reported question's answers are excluded wherever question results are counted: the G-02 summary query and the reading page's results. A report on a sentence marks that line; its fix replaces the line's Swedish and English and re-splits its sentences.

## R7. Own texts (FR-318)

- **Decision:** `POST /api/own-text {title, text}` splits the text into lines at line breaks and sentences (G-02's splitter), stores it with `own = 1`, empty English, and counted new items. **Save as leaf** (`POST /api/leaf {textId, form}`) adds the form as a leaf without a meaning. A **Get meanings** button on Home makes a meanings exchange (G-02 FR-207) for leaves without a meaning, not tied to a package.

## R8. Translations setting (FR-301; question-pages/58)

- **Decision:** `learner_settings.show_translations` (default 1). The reading page shows each line's English under it when on; when off, hides them and keeps a per-line English button. A toggle on the reading page saves the setting (`POST /api/settings`).

## R9. Dictionary pages and stored examples (FR-316, FR-317, SC-005; question-pages/72)

- **Measured** (the demo grown to 5,000 sentences and 2,000 words): the whole dictionary took 73.8 s, nearly all of it testing every word against every sentence for its example; a page of 100 found that way 746 ms (7.3 s at 50,000 sentences); a page of 100 with a stored example 1.8 ms; a search with `LIKE` on the form and the meaning 3.7 ms (31 ms at 20,000 words).
- **Decision:**
  - `words.example_sentence_id` (migration 012). The module `words` gives `fillExamples(db, accountId, { sentenceIds?, wordIds? })`: for the given sentences (in id order), each word token (the `\p{L}+` rule of R2) and each listed new item is matched to the learner's words by lemma or stored form (`word_forms`), and phrases by their words in a row; a word without an example gets the first match. Patterns take the line of their first `pattern_places` row. G-02's accept path and own texts call it with the new sentences; adding a word calls it for that word over the learner's sentences.
  - The fill of words met before migration 012 is a G-01 FR-032 start-up load (research R14 of G-01) in the module `reading`: per account, steps of 10,000 sentences; at the end `settings.examples_filled = 1`, so it runs once.
  - `/api/dictionary` is one SQL query per request: `kind = ?` and `(lemma LIKE ? OR lower(en) LIKE ?)` with `ORDER BY lemma LIMIT 100 OFFSET ?`, joined to `sentences` for the example; the counts are one grouped query. A word whose stored meaning is empty shows the word list's (G-02 FR-207), looked up for the 100 shown; the search on meaning covers stored meanings only. Names come from `names` the same way.
  - No cache (question-pages/72, 3): nothing left to save that the network wouldn't swamp.
- **Alternatives:** a cache of recent searches (saves 2–30 ms, can go stale, empty after a restart); one pass over all sentences per request (84 ms at 5,000 sentences, growing); SQLite FTS5 (not needed at these sizes).
