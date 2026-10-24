---
description: "Tasks for G-02: texts from the learner's own AI"
---

# Tasks: Texts from the learner's own AI (G-02)

**Input**: `specs/002-texts-from-own-ai/` — [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/http-api.md](contracts/http-api.md), [quickstart.md](quickstart.md). Builds on G-01's code.

**Tests**: Required (constitution 1.3, 1.4). Test names start with the FR ID (FR-201…FR-221) and list RQ IDs, e.g. `FR-214 RQ-127 RQ-216: a sentence with 3 new items refuses the answer`. Write each story's tests first and see them fail.

**Organization**: By user story (US1…US5 of spec.md).

## Format: `[ID] [P?] [Story] Description`

## Path Conventions

`server/words/`, `server/texts/`, `public/`, `tests/words/`, `tests/texts/`, `tests/texts/answers/`, `tests/e2e/` (plan.md "Project Structure").

---

## Phase 1: Setup

- [ ] T101 Create folders `server/words`, `server/texts`, `tests/words`, `tests/texts/answers`
- [ ] T102 [P] Write sample answers in `tests/texts/answers/`: `good.json` (3 texts of ~130 words built only from `docs/middle/ai-test/known.txt` words plus at most one new word per sentence, adapted from `docs/middle/ai-test/answer-claude.json` to the format of contracts/http-api.md, part code `TEST-1`), `good-in-prose.txt` (good.json inside prose and a ```json fence), `cut-off.txt` (good.json cut inside text 2), `not-json.txt`, `too-many-new.json` (one sentence with 3 new words, two sentences with 2 new words in a 10-sentence text), `few-new.json` (texts at ~100% known), `unlisted-new.json` (new words used but missing from new_words), `extra-fields.json` (X-03's harmless `kind`/`series`/`speaker` plus one unknown field `"admin": true`), `script.json` (a line containing `<script>alert(1)</script>` and `<b>x</b>`), `huge.json` (5 texts)
- [ ] T103 [P] Write the Q-07 set `tests/words/q07-sentences.json`: 50 real Swedish sentences (from the X-03 answers in `docs/middle/ai-test/results.md` and hand-made ones for inflections, homographs like *var*, compounds, irregular plurals and past tenses, names and numbers), each with the expected new items given `docs/middle/ai-test/known.txt` as the ground; and `tests/words/q07-baseline.json` (`{"score": 0}`, raised to the first measured score in T112)

---

## Phase 2: Foundational

**Purpose**: Tables, the words module and the answer schema, which every story needs.

### Tests (write first)

- [ ] T104 [P] Tests in `tests/words/count.test.mjs`: `FR-213 RQ-28 RQ-64:` lines split into sentences at `.`, `!`, `?`, `…` (quotes kept), several sentences on one line split; words are Unicode letters (å ä ö), lower-cased, digits skipped; a known dictionary form, a learned form and a listed inflection are known; regular endings of known words are known (*läser*, *kaféet*, *kakor*, *bilar*, *gatan*, *stora*); a compound of two known words is known (*kaffekopp* with *kaffe*, *kopp*); names from the list and capitalised words mid-sentence are never counted; a listed new phrase counts as one item and its words aren't counted again
- [ ] T105 [P] Test `tests/words/q07.test.mjs`: `FR-213 RQ-28: Q-07 score on the 50-sentence set` prints the number of sentences counted exactly right and fails if it is below `q07-baseline.json`
- [ ] T106 [P] Tests in `tests/texts/schema.test.mjs`: `FR-205 RQ-41 RQ-184:` good.json passes; `extra-fields.json` drops `kind`/`series`/`speaker` silently and refuses `admin`; `huge.json` (5 texts), a 61-line text, a 401-character line, a question with 4 options, an answer index out of range and a 201-entry list are each refused with a named problem; wrong types are refused
- [ ] T107 [P] Tests in `tests/texts/extract.test.mjs`: `FR-205 RQ-41:` the JSON is found in `good-in-prose.txt`, in a bare paste and in the first of two fenced blocks; `cut-off.txt` gives the problem "cut off"; `not-json.txt` gives "not valid JSON" with a line number
- [ ] T108 [P] Migration test addition in `tests/store/store.test.mjs` is covered by G-01's "migration keeps data" test, which runs all migrations; add `FR-220 RQ-54: every G-02 table has account_id` checking `004-texts.sql`'s tables

### Implementation

- [ ] T109 Write `server/store/migrations/004-texts.sql` with the tables of data-model.md exactly: `words` (UNIQUE (account_id, lemma, kind), `state` CHECK in ('leaf','ground')), `word_forms` (PRIMARY KEY (account_id, form, word_id)), `learner_settings` (`target_share` CHECK BETWEEN 93 AND 98), `packages` (one open per account by partial unique index), `exchanges`, `texts`, `text_lines`, `questions`, `sentences`, `ratings` (UNIQUE (account_id, text_id)), `question_answers` (UNIQUE (account_id, text_id, position)); every table has `account_id INTEGER NOT NULL REFERENCES accounts (id) ON DELETE CASCADE`
- [ ] T110 [P] Write `server/words/sentences.mjs` (sentence splitting) and `server/words/tokens.mjs` (word tokens, names rule, numbers) as research R2 steps 1–3
- [ ] T111 [P] Write `server/words/inflect.mjs` (the ending list and rules of research R2 step 5, compounds of step 6) and `server/words/count.mjs` (`countNew(sentence, {known, forms, phrases, names})` → `{items: [lemma or form], known: n, total: n}`; phrases first, longest first)
- [ ] T112 Write `server/words/store.mjs`: the learner's ground set and forms map for counting, `addLeaf({accountId, lemma, kind, en, explainSv, sourceTextId})` (no duplicate; an existing ground word stays ground), `learnForm(accountId, form, lemma)`, `addUses`, `fillMeaning`; run T105 and set `q07-baseline.json` to the first score (the baseline may only be raised, never lowered — Q-07)
- [ ] T113 Write `server/texts/schema.mjs` (the nested answer schema and limits of contracts/http-api.md, the dropped harmless fields, the meanings schema) and `server/texts/extract.mjs` (research R3); add the `integer` type to `checkSchema` in `server/web/http.mjs`

**Checkpoint**: T104–T108 pass.

---

## Phase 3: User Story 1 - Get a part of texts from my own AI (P1) 🎯 MVP

**Goal**: Prompt → paste → texts added, with new words as leaves.

**Independent Test**: Reviewer with the X-03 ground: Get texts, paste `good-in-prose.txt`, see 3 texts listed within 2 s.

### Tests (write first)

- [ ] T114 [P] [US1] Tests in `tests/texts/prompt.test.mjs`: `FR-201 RQ-182 RQ-183 RQ-40:` a part prompt is plain English, names no tool or file, asks for exactly one JSON block in the format, and contains the part code; `FR-202 RQ-186:` it asks for 3 texts of about 130 words with 2–3 questions each, one sentence per line, English per line; `FR-204 RQ-184:` it lists every field of the format; `FR-208 RQ-28 RQ-172 RQ-33 RQ-64:` it lists the ground's dictionary forms, at most 1,500, topic words first, then most recently fallen, then by uses; `FR-209 RQ-167 RQ-168:` it states the target share and the one-new-item-per-sentence rule; `FR-210 RQ-50:` it asks to reuse up to 10 leaves, most recent first; SC-006: with a generated 5,000-word ground the prompt is under 16,000 characters; with an empty ground it asks for beginner texts from starter words
- [ ] T115 [P] [US1] Tests in `tests/texts/exchange.test.mjs`: `FR-201 RQ-182 RQ-40:` `POST /api/prompt` returns a part prompt and asking again returns the same waiting prompt; `FR-205 RQ-41:` pasting `good-in-prose.txt` to `POST /api/answer` accepts it and `GET /api/home` lists 3 texts; `FR-217 RQ-17:` each text's sentences are kept with their position for exercises; `FR-216 RQ-54 RQ-65 RQ-64:` the texts' sentences are saved, new words are leaves with the AI's meaning, explanation and source text, listed inflections are learned forms only when their dictionary form is a leaf or ground word and they share its first two letters (X-03's "Elsas → Elsa (namn)" and a swapped le/ler pair are not learned), `uses` grow; an answer of 80,001 characters is refused with a plain message; pasting the same answer again gives `409 duplicate` and nothing doubles; an answer with another part code gives `409 wrong_part`; `FR-215 RQ-41:` checking and storing the answer takes ≤ 2 s (timed); `FR-220 RQ-54 RQ-155:` another account can't answer, read or list this account's exchanges or texts (404)
- [ ] T116 [P] [US1] Playwright test `tests/e2e/texts.spec.mjs` (part 1): `FR-201 FR-219 RQ-40 RQ-19:` on Home, Get texts shows the prompt and Copy prompt puts it on the clipboard; pasting `good-in-prose.txt` and Add texts lists the three texts

### Implementation

- [ ] T117 [US1] Write `server/texts/packages.mjs`: open package (create part 1 of 3 when none is open or the last is finished; return the waiting exchange if any), part codes (4 random letters + part number), `nextPart`, `newPackage` (closes the open one), status updates as research R6
- [ ] T118 [US1] Write `server/texts/prompt.mjs`: the part prompt of research R4 (known words chosen and capped at 1,500, leaves to reuse, topic, starter-word request for a new topic, target share and rules, the format, empty-ground variant; summary and continue hint added in US5; nudges in US3)
- [ ] T119 [US1] Write `server/texts/check.mjs` (counts per sentence and per text with `server/words/count.mjs`; accept/refuse per FR-214 is completed in US2) and `server/texts/accept.mjs` (in one transaction: texts, lines, questions, sentences with new items, leaves, learned forms, uses, the topic's starter words, exchange and package updates, answer hash)
- [ ] T120 [US1] Write `server/texts/routes.mjs` with `GET /api/home`, `POST /api/prompt`, `POST /api/answer` (access `agreed`; schemas of the contract; every query filtered by the session's account) and register it in `server/web/app.mjs`; add `/text` to the static pages (access `agreed`)
- [ ] T121 [US1] Rebuild `public/index.html` + `public/assets/home.mjs`: topic card, package card (progress "part n of 3", prompt in a read-only box, Copy prompt with clipboard and select-all fallback, paste box with a warning above 80,000 characters, Add texts, messages), texts list (newest first, new/read/rated); all values via `textContent`

**Checkpoint**: US1 passes on its own.

---

## Phase 4: User Story 2 - A bad answer costs one more paste at most (P1)

**Goal**: Problems listed with sentences and words; fix-it and meanings prompts.

**Independent Test**: Paste `cut-off.txt`, `not-json.txt`, `too-many-new.json`; each lists problems and gives a fix-it prompt; the corrected answer is accepted.

### Tests (write first)

- [ ] T122 [P] [US2] Tests in `tests/texts/check.test.mjs`: `FR-214 RQ-127 RQ-216 RQ-28:` `too-many-new.json` is refused (a sentence with 3 new items; 2 of 10 sentences with 2 new items); a text 3 points below the target share is refused; a text with exactly 1 in 10 sentences with 2 new items and within 2 points is accepted; `FR-212 RQ-378:` `few-new.json` is accepted and sets "ask more firmly"; `FR-207 RQ-379:` `unlisted-new.json` is accepted when within the margins by grove's own count, and a meanings prompt lists exactly the new words without a meaning
- [ ] T123 [P] [US2] Tests in `tests/texts/fixit.test.mjs`: `FR-206 RQ-185 RQ-63:` for `too-many-new.json` the problems and the fix-it prompt quote each offending sentence and its new words; for `cut-off.txt` and `not-json.txt` the fix-it prompt asks for the whole block again; the fix-it exchange shares the part code; pasting a corrected answer into it is accepted and adds the texts once; `FR-207 RQ-379:` a meanings answer fills meanings, ignores words not asked about, and leaves the rest "meaning missing"; `FR-205 RQ-41:` nothing from a refused answer is stored
- [ ] T124 [P] [US2] Playwright test `tests/e2e/texts.spec.mjs` (part 2): `FR-206 FR-221 RQ-185 RQ-63:` pasting `too-many-new.json` shows the problems and a fix-it prompt with Copy; pasting `script.json` shows `<script>` and `<b>` as text and runs nothing

### Implementation

- [ ] T125 [US2] Complete `server/texts/check.mjs` with the margins of FR-214 (as settings in one object) and problem messages naming text, sentence and words; set `firm_new` after a text more than 2 points above the target
- [ ] T126 [US2] Write `server/texts/fixit.mjs`: fix-it prompt of research R5 (numbered problems, quoted sentences, "reply with the whole corrected JSON block") and the meanings prompt; exchanges of kind `fix` and `meanings`; handle `POST /api/answer` for both kinds in `server/texts/routes.mjs`
- [ ] T127 [US2] Show problems, the fix-it prompt and the meanings prompt (each with Copy prompt and its paste box) on Home in `public/assets/home.mjs`

**Checkpoint**: US1 and US2 pass together: the MVP.

---

## Phase 5: User Story 3 - Read, answer and rate (P1)

**Goal**: Reading page, questions, five ratings that tune the next prompt.

**Independent Test**: Open a text, show English, answer questions, rate "a little"; the next prompt has a higher share and asks for shorter sentences.

### Tests (write first)

- [ ] T128 [P] [US3] Tests in `tests/texts/ratings.test.mjs`: `FR-218 RQ-11 RQ-355 RQ-193 RQ-195 RQ-167 RQ-168:` the share starts at 95; "almost nothing" → +2 and shorter, "a little" → +1 and shorter, "about half" → no change; three "most"/"everything" in a row → −1, a lower rating resets the streak; the share never leaves 93–98; a new rating of the same text replaces the old; "most"/"everything" count as understood; `POST /api/question` returns right/wrong and the right option, and only the first answer per question counts; `FR-212 RQ-193:` the next prompt asks for shorter sentences after a low rating and stops after one prompt; `FR-220 RQ-155:` another account's text id is refused on `/api/text`, `/api/question`, `/api/rating`
- [ ] T129 [P] [US3] Playwright test `tests/e2e/texts.spec.mjs` (part 3): `FR-218 RQ-36 RQ-46 RQ-11:` open a text from Home, tap a line to show its English, answer a question and see right/wrong, rate it, and see it marked rated on Home

### Implementation

- [ ] T130 [US3] Write `server/texts/ratings.mjs` (target share rules of research R7) and routes `GET /api/text`, `POST /api/question`, `POST /api/rating` in `server/texts/routes.mjs`; mark `read_at` when a text is opened; add the shorter-sentences and firm-new nudges to `server/texts/prompt.mjs`
- [ ] T131 [P] [US3] Write `public/text.html` + `public/assets/text.mjs`: title, lines in Swedish with the English shown on tap (button per line), questions with option buttons showing right/wrong (the forest look's right/wrong colours), five rating buttons, back to Home; values via `textContent`

**Checkpoint**: US3 passes.

---

## Phase 6: User Story 4 - Pick a topic (P2)

### Tests (write first)

- [ ] T132 [P] [US4] Tests in `tests/texts/topic.test.mjs`: `FR-219 RQ-19:` `POST /api/topic` sets the topic, `GET /api/home` shows it, the next prompt names it; without a topic the prompt uses "everyday life"; `FR-211 RQ-165 RQ-175:` a new topic's prompt asks for 10–15 starter words, an accepted answer's starter words become leaves and the topic is recorded as used; a used topic doesn't ask again; changing topic mid-package makes the remaining parts use the new topic

### Implementation

- [ ] T133 [US4] Route `POST /api/topic` and topic handling in `server/texts/routes.mjs`, `prompt.mjs` and `accept.mjs`; topic card with an edit form on Home in `public/assets/home.mjs`

---

## Phase 7: User Story 5 - A package at a time, starting with what changed (P2)

### Tests (write first)

- [ ] T134 [P] [US5] Tests in `tests/texts/package.test.mjs`: `FR-203 RQ-01 RQ-02 RQ-11 RQ-186 RQ-188:` part 1 of a package carries a plain-text summary listing exactly the texts done since the last summary (title, rating, questions right of asked) and nothing else from the learner's data; parts 2 and 3 carry no summary, are self-contained (known words, rules, format) and ask to continue the earlier story if the chat has it; after 3 accepted parts with all texts rated, the next request starts a new package; with texts unrated, `next` gives `409 package_waiting`; `new_package` closes the open package and its first prompt carries the summary; two requests at once open one package only

### Implementation

- [ ] T135 [US5] Summary building and the continue hint in `server/texts/prompt.mjs`; finished/closed rules and `409 package_waiting` in `server/texts/packages.mjs` and `routes.mjs`; package progress, Next part and New package buttons on Home in `public/assets/home.mjs`

---

## Phase 8: Polish & cross-cutting

- [ ] T136 [P] Extend `tests/web/authz.test.mjs` bodies for the new POST routes (the table test then covers them) and `tests/seclog/logscan.test.mjs` with a pasted answer whose text must not appear in any log
- [ ] T137 [P] Test `tests/owner/data.test.mjs` addition: `FR-220 RQ-54: export includes texts and words; delete leaves no G-02 rows` (constitution 3.2, 3.3)
- [ ] T138 Give the dev server's reviewer a ground of the X-03 known words (`docs/middle/ai-test/known.txt`) in `tests/fakes/dev-server.mjs`
- [ ] T139 Run `npm test`, `npm run test:e2e`, `npm run check`; fix through spec and tasks only (constitution 1.1); all of FR-201…FR-221 traced
- [ ] T140 Walk through quickstart §1–2; record in `docs/STATUS.md` (Implemented for G-02)
- [ ] T141 (owner, phone) Quickstart §3 with free ChatGPT, Claude and Gemini: first-try acceptance, fix-it rounds, minutes to first text (SC-001, SC-002, SC-005); record in `docs/STATUS.md` (Verified for G-02)

---

## Dependencies & Execution Order

- Setup → Foundational → US1 → US2 (needs US1's flow) → US3 (needs texts) → US4, US5 (both need the prompt; independent of each other) → Polish.
- Within each story: tests first and failing → server → routes → page.
- [P] tasks: T102–T103; T104–T108; T110–T111; each story's test tasks; T136–T137.

## Implementation Strategy

1. **MVP = US1 + US2**: a reviewer gets texts in and bad answers fixed. Stop and check with quickstart §2.
2. US3 (reading, questions, ratings), then US5 (packages), then US4 (topics).
3. If time runs short (constitution 4.3): cut SHOULDs first — FR-210 (reuse leaves, RQ-50), FR-212's firm-new nudge (RQ-378), the whole-text share margin of FR-214 (RQ-216). Everything else in G-02 is MUST.
