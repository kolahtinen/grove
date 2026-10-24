---
description: "Tasks for G-03: reading and the word menu"
---

# Tasks: Reading and the word menu (G-03)

**Input**: `specs/003-reading-word-menu/` — [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/http-api.md](contracts/http-api.md), [quickstart.md](quickstart.md). Builds on G-01 and G-02.

**Tests**: Required (constitution 1.3, 1.4). Names start with the FR ID (FR-301…FR-319) and list RQ IDs. Write each story's tests first.

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup

- [ ] T201 Create `server/reading/`, `tests/reading/`
- [ ] T202 [P] Write sample answer `tests/texts/answers/good-patterns.json`: good.json plus `patterns` (2 patterns: "har + supine" at text 2 line 9 `har han glömt`, and "adjective -a after a definite word" at text 1 line 18 `nya`, plus one place whose words aren't in the line) and `explanations`/`fixes` left out; and `answer-with-fixes.json` built in tests from codes

---

## Phase 2: Foundational

### Tests (write first)

- [ ] T203 [P] Test addition in `tests/store/store.test.mjs`: `FR-307 RQ-29: migration 005 keeps every row and allows pattern items, own texts and package-less exchanges` — fill a version-4 database (accounts, words with forms, a package, exchanges, texts with lines, questions, sentences, ratings), migrate to 5, check every row and id survives, `PRAGMA foreign_key_check` is empty, and that a `pattern` word, a text with NULL exchange and an exchange with NULL package can be inserted
- [ ] T204 [P] Tests in `tests/words/resolve.test.mjs`: `FR-306 RQ-18:` a token resolves to status ground/leaf/new/name with its dictionary forms: a ground lemma, a learned form of a leaf (*kopparna* → *kopp*, leaf), an irregular form (*gick* → *gå*), a regular ending (*läser* → *läsa*), a homograph listing two forms (*var* → *vara*, *var* if both are words), a name from the list and a capitalised mid-sentence word; `FR-303 RQ-56:` names never get status new
- [ ] T205 [P] Tests in `tests/texts/schema.test.mjs` additions: `FR-307 RQ-29 RQ-177:` `patterns`, `explanations`, `fixes` pass within limits and are refused beyond them (21 patterns, a place with text 5, an explanation of 501 characters, a fix with 4 options, a fix with neither question nor sentence)

### Implementation

- [ ] T206 Extend `server/store/migrate.mjs`: a migration file starting with `-- foreign-keys-off` runs as `PRAGMA foreign_keys = OFF`, the transaction, `PRAGMA foreign_key_check` (throw if any row), `PRAGMA foreign_keys = ON` (research R4)
- [ ] T207 Write `server/store/migrations/005-reading.sql`: rebuild `words` (kind CHECK in ('word','phrase','pattern')), `texts` (exchange_id, package_id, part_no NULL allowed; `own INTEGER NOT NULL DEFAULT 0`) and `exchanges` (package_id, part_no NULL allowed) by create-copy-drop-rename keeping ids and indexes; add `word_meanings`, `pattern_places`, `names`, `explain_flags`, `explanations`, `reports` exactly as data-model.md; `ALTER TABLE learner_settings ADD COLUMN show_translations INTEGER NOT NULL DEFAULT 1`
- [ ] T208 [P] Write `server/words/resolve.mjs`: `createResolver(db, accountId, {names})` → `resolve(word, {capitalisedMidSentence})` → `{status, lemmas, wordIds}` as research R2, reusing `inflect.mjs` and `irregular.mjs` against all the learner's words
- [ ] T209 Extend `server/texts/schema.mjs` with `patterns`, `explanations`, `fixes` (contract limits)

**Checkpoint**: T203–T205 pass.

---

## Phase 3: User Story 1 - Read with help exactly where I'm stuck (P1) 🎯 MVP

### Tests (write first)

- [ ] T210 [P] [US1] Tests in `tests/reading/view.test.mjs`: `FR-305 FR-306 RQ-18:` `/api/reading` for the sample text returns sentences with tokens; *kopparna* → kopp, leaf, meaning here "the cups" (the per-text meaning), *säger* → säga, ground, *Elsa* → name; phrases listed for words in *hur mår du*; `FR-302 RQ-55 RQ-76:` each sentence has its new count and the text its word count, new words and share, matching G-02's counting; `FR-301 RQ-10:` `showTranslations` follows `POST /api/settings` and each line carries its English; `FR-303 RQ-56:` the answer's names are stored in `names` and no name counts as new; `FR-319 RQ-155:` another account gets 404 for the text and can't change its settings
- [ ] T211 [P] [US1] Playwright test `tests/e2e/reading.spec.mjs` (part 1): `FR-305 FR-301 FR-304 RQ-18 RQ-10:` English shows under each sentence; tapping *kopparna* opens the menu with kopp, the meaning and "leaf" within 500 ms; turning translations off hides them after reload, and a line's English button still shows it; a title and line with HTML show as text

### Implementation

- [ ] T212 [US1] Extend `server/texts/accept.mjs`: store each new word's meaning for its text (`word_meanings`), learn listed new-word forms that differ from the dictionary form (plausibility rule), store the answer's names (`names`)
- [ ] T213 [US1] Write `server/reading/view.mjs`: the reading payload of the contract (lines → sentences → tokens with resolution, meaning here, explanation, phrases, pattern ids; stats; patterns; questions with `reported`), and `server/reading/routes.mjs` with `GET /api/reading`, `POST /api/settings`; register in `server/web/app.mjs`
- [ ] T214 [US1] Rebuild `public/text.html` + `public/assets/reading.mjs` (replacing `text.mjs`): sentences of word buttons and plain spaces/punctuation, new-count badge per sentence, stats line, English under each line per setting with a per-line English button, translations toggle; tapping a word speaks it (`speechSynthesis`, Swedish voice if any) and opens a bottom-sheet menu from the payload; questions and rating as in G-02; all text via `textContent`; styles in `public/assets/grove.css` (pattern colour `--gpk`)

**Checkpoint**: US1 passes.

---

## Phase 4: User Story 2 - Notice and learn grammar patterns (P1)

### Tests (write first)

- [ ] T215 [P] [US2] Tests in `tests/reading/patterns.test.mjs`: `FR-307 RQ-29 RQ-177:` every part prompt asks for `patterns` with name, explanation and places; accepting `good-patterns.json` stores each pattern once as a `pattern` leaf with its explanation, and its places; the same pattern name in a later answer is the same item; `FR-308 RQ-12:` the reading payload marks the tokens of *har han glömt* with the pattern's id and doesn't mark the place whose words aren't in the line; a text without patterns has no marks; `FR-309 RQ-171:` a pattern item has the same fields as a word (state, added time) so G-04 can schedule it
- [ ] T216 [P] [US2] Playwright test `tests/e2e/reading.spec.mjs` (part 2): `FR-308 RQ-12:` the pattern's words are coloured, and tapping one shows the pattern's name and explanation in the menu

### Implementation

- [ ] T217 [US2] Add the patterns request and format to `server/texts/prompt.mjs`; store patterns and places in `server/texts/accept.mjs`; pattern marks in `server/reading/view.mjs`; pattern section in the menu in `public/assets/reading.mjs`

---

## Phase 5: User Story 3 - Practise reading a text (P1)

### Tests (write first)

- [ ] T218 [P] [US3] Tests in `tests/reading/practice.test.mjs`: `FR-310 RQ-274 RQ-278 RQ-58:` `/api/practice` returns at most 8 questions, one per sentence with a leaf, in text order; each has the sentence, the leaf, 3–4 distinct options with the meaning here at `right`, and wrong options that are other words' meanings; a word with fewer than 2 other meanings available is skipped; `FR-319 RQ-155:` another account gets 404
- [ ] T219 [P] [US3] Playwright test `tests/e2e/reading.spec.mjs` (part 3): `FR-310 FR-311 FR-312 RQ-274 RQ-276:` Practise shows a sentence with a word question, answering marks right/wrong; after the word questions come the passage questions; then the full text with a Play button (with a stubbed `speechSynthesis`, each sentence is highlighted in turn and Stop ends it)

### Implementation

- [ ] T220 [US3] Write `server/reading/practice.mjs` (research R5) and `GET /api/practice` in `server/reading/routes.mjs`
- [ ] T221 [US3] Practice mode in `public/assets/reading.mjs`: word questions, then passage questions, then the full text with Play/Stop and sentence highlighting

---

## Phase 6: User Story 4 - Explain and Report (P2)

### Tests (write first)

- [ ] T222 [P] [US4] Tests in `tests/reading/flags.test.mjs`: `FR-313 RQ-297:` `POST /api/explain` stores a flag with code E1, reason and note; the next part prompt lists `E1:` with the word, sentence, reason and note and asks for `explanations`; `FR-314 RQ-298:` an accepted answer with `explanations: [{code: "E1"}]` stores it, the reading payload shows it for that word (in any text), and the flag is answered; an answer without it leaves the flag open; `FR-315 RQ-301:` `POST /api/report` on a question stores R1; that question's answers stop counting in the G-02 summary and the reading payload marks it reported; the next part prompt lists `R1:` with the text, question, reason and note; an accepted fix replaces the question (or a reported sentence's line, re-split into sentences) and closes the report; a body with both or neither position is refused; codes count up per account; `FR-319 RQ-155:` flags and reports on another account's text are refused (404)
- [ ] T223 [P] [US4] Playwright test `tests/e2e/reading.spec.mjs` (part 4): `FR-313 FR-315 RQ-297 RQ-301:` Explain from the menu with a reason and note shows "Asked — the next prompt will include it"; Report on a question with a reason shows it as reported

### Implementation

- [ ] T224 [US4] Write `server/reading/flags.mjs` (flags, reports, codes) and routes `POST /api/explain`, `POST /api/report`; add open flags and reports to `server/texts/prompt.mjs`; store explanations and apply fixes in `server/texts/accept.mjs`; skip reported questions in the summary in `server/texts/packages.mjs`
- [ ] T225 [US4] Explain form (reason buttons, note) in the menu, and Report buttons (questions; a line's menu) with reason and note, in `public/assets/reading.mjs`

---

## Phase 7: User Story 5 - My dictionary (P2)

### Tests (write first)

- [ ] T226 [P] [US5] Tests in `tests/reading/dictionary.test.mjs`: `FR-316 RQ-53 RQ-205 RQ-357:` `/api/dictionary` lists every word, phrase and pattern of the learner (ground and leaves) with its translation or null, state and one example sentence where it was met (kopp → "Maja tvättar kopparna." or another sentence with it); `FR-317 RQ-56:` names are listed apart and not among the items; `FR-319 RQ-155:` it lists only the learner's own
- [ ] T227 [P] [US5] Playwright test `tests/e2e/reading.spec.mjs` (part 5): `FR-316 FR-317 RQ-53 RQ-56:` the Dictionary page shows kopp with its meaning and example, the search box filters, and Elsa is under Names

### Implementation

- [ ] T228 [US5] Write `server/reading/dictionary.mjs` and `GET /api/dictionary`; `public/dictionary.html` + `public/assets/dictionary.mjs` (search, sections for words/phrases/patterns and names); a Dictionary link in the top bar of the signed-in pages; add `/dictionary` to the static pages (access `agreed`)

---

## Phase 8: User Story 6 - Read my own texts (P3)

### Tests (write first)

- [ ] T229 [P] [US6] Tests in `tests/reading/own.test.mjs`: `FR-318 RQ-74:` `POST /api/own-text` saves a text with `own = 1`, no English, its lines and sentences with new items; it appears on Home as own; the reading payload works for it; a text over 20,000 characters is refused; `POST /api/leaf` adds a new word as a leaf without meaning; `POST /api/meanings-prompt` makes a meanings exchange (no package) for leaves without meaning, and `409 nothing_missing` when none; `FR-319 RQ-155:` another account can't read the own text or save leaves from it
- [ ] T230 [P] [US6] Playwright test `tests/e2e/reading.spec.mjs` (part 6): `FR-318 RQ-74:` paste an own text on Home, open it, tap a new word and Save as leaf

### Implementation

- [ ] T231 [US6] Write `server/reading/own.mjs` and routes `POST /api/own-text`, `POST /api/leaf`, `POST /api/meanings-prompt`; own-text form and Get meanings on Home (`public/index.html`, `public/assets/home.mjs`); Save as leaf in the menu

---

## Phase 9: Polish

- [ ] T232 [P] Extend `tests/web/authz.test.mjs` bodies for the new POST routes; `tests/seclog/logscan.test.mjs` with an own text and an Explain note that must not reach any log; `tests/owner/data.test.mjs` so export and delete cover the G-03 tables
- [ ] T233 Run `npm test`, `npm run test:e2e`, `npm run check`; fix through spec and tasks; FR-301…FR-319 traced
- [ ] T234 Walk through quickstart §2; record in `docs/STATUS.md` (Implemented for G-03)

---

## Dependencies & Execution Order

Setup → Foundational (migration, resolver, schema) → US1 → US2 and US3 (both need the reading payload) → US4 (needs the menu and questions) → US5 → US6 → Polish. Tests first in each story.

## Implementation Strategy

1. MVP = US1 + US2 + US3 (reading with the menu, patterns, practice).
2. Then US4, US5, US6.
3. If time runs short (constitution 4.3): SHOULD first — RQ-58's "inside a sentence" wording is already the way questions are made, so nothing to cut there; US6 (own texts) is the last to build. Everything else in G-03 is MUST.
