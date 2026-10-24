---
description: "Tasks for G-04: ground, drilling and progress"
---

# Tasks: Ground, drilling and progress (G-04)

**Input**: `specs/004-ground-drilling-progress/` — [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/http-api.md](contracts/http-api.md), [quickstart.md](quickstart.md). Builds on G-01…G-03.

**Tests**: Required (constitution 1.3, 1.4). Names start with the FR ID (FR-401…FR-419) and list RQ IDs. Tests first in each story.

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup

- [X] T301 Create `server/drill/`, `tests/drill/`; add a clock option to `tests/fakes/harness.mjs`'s `startTestGrove` already present (`now`), and a helper `tests/drill/helpers.mjs` (learner with the X-03 ground and the G-03 sample answer added, a mutable clock)

---

## Phase 2: Foundational

### Tests (write first)

- [X] T302 [P] Test addition in `tests/store/store.test.mjs`: `FR-418 RQ-75: migration 006 keeps every row and adds the drill columns with their defaults` (fill a version-5 database, migrate, check rows and new defaults)
- [X] T303 [P] Tests in `tests/drill/schedule.test.mjs`: `FR-403 FR-404 FR-405 RQ-170 RQ-79 RQ-60 RQ-200:` strength = 2^(−days/gap); due at ≤ 0.5, fading below 0.2; right answers take the gap 1 → 2.5 → 6.25 and the third right answer falls (SC-002); a wrong answer halves the gap, never below 0.5; ground and unmarked items have no strength (`RQ-169`)

### Implementation

- [X] T304 Write `server/store/migrations/006-drill.sql` exactly as data-model.md
- [X] T305 [P] Write `server/drill/schedule.mjs` (research R1) and `server/drill/items.mjs` (find an item by account, lemma, kind; create a leaf if missing; set marks; fall; pick up)

**Checkpoint**: T302–T303 pass.

---

## Phase 3: User Story 1 - Mark what I don't know; the rest joins my ground (P1) 🎯 MVP

### Tests (write first)

- [X] T306 [P] [US1] Tests in `tests/drill/marking.test.mjs`: `FR-401 RQ-52 RQ-203 RQ-204:` `GET /api/marking` lists the text's unmarked leaves with meanings; `POST /api/marking` drills words with a switch on (To read, To remember or both, gap 1 day) and the rest of the listed words fall to the ground; words not in the text's unmarked leaves are ignored; a second call finds nothing to mark; `FR-402 RQ-34 RQ-204:` fallen words count as known in the next prompt's known-word list and in the reading counts, unmarked leaves still count as new; `FR-419 RQ-155:` another account's text gives 404
- [X] T307 [P] [US1] Playwright test `tests/e2e/drill.spec.mjs` (part 1): `FR-401 RQ-52:` after rating a text, the marking step lists its new words with two switches each; switching some and pressing Done shows "n to drill, m to your ground"; reopening the text offers no marking

### Implementation

- [X] T308 [US1] Write `server/drill/marking.mjs` and routes `GET/POST /api/marking` in `server/drill/routes.mjs`; register in `server/web/app.mjs`; the reading payload's `marking` count in `server/reading/view.mjs`
- [X] T309 [US1] Marking step in `public/assets/reading.mjs`: after a rating (and on opening a rated text with unmarked words), a card listing the words with meaning and two switches (To read, To remember), Done and Later; styles in `grove.css`

---

## Phase 4: User Story 2 - Drill my leaves at the right time, in real sentences (P1)

### Tests (write first)

- [X] T310 [P] [US2] Tests in `tests/drill/review.test.mjs` (with the clock moved): `FR-404 FR-406 RQ-80 RQ-32 RQ-07:` `GET /api/review?mode=review` lists fading leaves first (weakest first), then due ones, ≤ 10, each with a sentence the learner read containing it; To read items are `read`, To remember items `remember`, both alternate; options as G-03 (meaning here + 2–3 other items' meanings, never the item's own); an item without a sentence or enough meanings is a `recall` card; nothing due → empty with `nextDue`; `FR-405 RQ-60 RQ-200:` `POST /api/review` right/wrong updates the gap as the schedule says and the third right answer falls; `FR-407 RQ-06:` `mode=master` lists only drilled leaves with gap ≥ 2 days, each with the sentence's form blanked, the English meaning, and 3–4 Swedish forms with the right one at `right`; a Master answer updates the schedule like Review; `FR-408 RQ-201 RQ-356:` adding a text raises an item's `met` count but leaves its schedule unchanged; `FR-419 RQ-155:` review answers for another account's items are refused
- [X] T311 [P] [US2] Playwright test `tests/e2e/drill.spec.mjs` (part 2): `FR-407 FR-406 RQ-06:` Home shows Discover, Review and Master with counts; Review with a due leaf (set up through the API with a past last review) shows a sentence and options; answering moves on and finishes with "All done"

### Implementation

- [X] T312 [US2] Write `server/drill/questions.mjs` (research R3) and `server/drill/review.mjs`; routes `GET/POST /api/review`, `GET /api/stages` (counts, next due) in `server/drill/routes.mjs`; `met` in the reading payload
- [X] T313 [US2] Write `public/review.html` + `public/assets/review.mjs` (Review and Master: sentence or spoken sentence, options, right/wrong, next, "All done" with the next due time); the stages card on Home in `public/index.html` + `public/assets/home.mjs`; add `/review` to the static pages (agreed)
- [X] T314 [US2] Change the prompt's words to reuse in `server/texts/packages.mjs` to drilled leaves (fading, due, then most recently marked, up to 10) (research R7)

---

## Phase 5: User Story 3 - Mark, drop and pick up words myself (P2)

### Tests (write first)

- [X] T315 [P] [US3] Tests in `tests/drill/marks.test.mjs`: `FR-409 RQ-07:` `POST /api/marks` switches To read / To remember on a ground word (drilled, gap 1) and on a word grove hasn't got (a new drilled leaf), both off makes it an unmarked leaf; `FR-410:` `GET /api/fall-check` gives a meaning question (or null for a pattern or too few meanings); `POST /api/let-it-fall` with right → falls with its marks kept in `fell_marks`, wrong → stays, confirmed for a pattern → falls; `FR-411:` `POST /api/pick-up` on a ground word drills it To read with gap 1; on a leaf → 409; `FR-419 RQ-155:` these act only on the learner's own items
- [X] T316 [P] [US3] Tests in `tests/drill/leaves.test.mjs`: `FR-412 RQ-08 RQ-35 RQ-77 RQ-207:` `GET /api/leaves` groups drilled leaves To remember / To read (both in both) with gap, strength and due, and lists unmarked leaves (e.g. starter words) apart; `POST /api/leaves` adds a typed word, phrase or pattern as a drilled leaf To read; `POST /api/leaf-delete` removes it (not to the ground); the meanings prompt (G-03) includes added items without a meaning
- [X] T317 [P] [US3] Playwright test `tests/e2e/drill.spec.mjs` (part 3): `FR-409 FR-410 FR-411 FR-412 RQ-07 RQ-08:` the word menu's switches mark a ground word; Let it fall asks a question; Pick up on a ground word; the Leaves page lists, adds and deletes, and marks an unmarked starter word from its Unmarked section

### Implementation

- [X] T318 [US3] Write `server/drill/marks.mjs` and `server/drill/leaves.mjs`; routes `POST /api/marks`, `GET /api/fall-check`, `POST /api/let-it-fall`, `POST /api/pick-up`, `GET/POST /api/leaves`, `POST /api/leaf-delete`
- [X] T319 [US3] Menu additions in `public/assets/reading.mjs` (To read / To remember switches, Let it fall with its question, Pick up, times met); `public/leaves.html` + `public/assets/leaves.mjs`; add `/leaves` to the static pages

---

## Phase 6: User Story 4 - See my leaves in my texts (P2)

### Tests (write first)

- [X] T320 [P] [US4] Tests in `tests/drill/colours.test.mjs`: `FR-413 RQ-294:` the reading payload's tokens carry `marks` and `fell` for leaves marked To read, To remember, both, and for words that fell from each; a token with two dictionary forms is flagged for the amber dot
- [X] T321 [P] [US4] Playwright test `tests/e2e/drill.spec.mjs` (part 4): `FR-413 RQ-294:` words in each state get the class for `--cw`, `--rlc`, `--cb`, `--rw`, `--rr`, `--rb`

### Implementation

- [X] T322 [US4] `marks` and `fell` on tokens in `server/reading/view.mjs`; colour classes and the amber dot in `public/assets/reading.mjs` and `grove.css`

---

## Phase 7: User Story 5 - See my level and progress (P2)

### Tests (write first)

- [X] T323 [P] [US5] Tests in `tests/drill/progress.test.mjs`: `FR-414 RQ-03 RQ-253:` with no level lists → `level: null`; with A1 and A2 lists 90% in the ground → "A2"; with A1 at 89% → "below A1"; a gap in a lower level stops the climb; `FR-415 RQ-48 RQ-71:` `POST /api/input` adds seconds to the day (≤ 60 per call, ≤ 16 h per day), refuses a day more than one day off; `GET /api/progress` gives 14 days of minutes, the ground size and drilled count; `FR-419 RQ-155:` minutes are per account
- [X] T324 [P] [US5] Playwright test `tests/e2e/drill.spec.mjs` (part 5): `FR-414 FR-415 RQ-03 RQ-71:` Home shows the level line and today's minutes; the Progress page shows 14 day bars

### Implementation

- [X] T325 [US5] Write `server/drill/progress.mjs` (level, input, progress) and routes `GET /api/progress`, `POST /api/input`; level and minutes in `GET /api/stages`
- [X] T326 [US5] Heartbeat in `public/assets/reading.mjs` and `public/assets/review.mjs` (every 30 s while visible and active); level and minutes on Home; `public/progress.html` + `public/assets/progress.mjs` (14 bars in the forest look); add `/progress` to the static pages

---

## Phase 8: User Story 6 - Welcome, and never lose anything (P3)

### Tests (write first)

- [X] T327 [P] [US6] Tests in `tests/drill/welcome.test.mjs`: `FR-416 RQ-73:` `GET /api/stages` says `welcome: true` until `POST /api/welcome`, then false (per account); `FR-417 FR-418 RQ-75:` marks, schedules and minutes survive closing and reopening the database (restart)
- [X] T328 [P] [US6] Playwright test `tests/e2e/drill.spec.mjs` (part 6): `FR-416 RQ-73:` the welcome card shows on a first visit and stays gone after closing

### Implementation

- [X] T329 [US6] Route `POST /api/welcome`; the welcome card on Home (a few lines on leaves, the ground and the three stages)

---

## Phase 9: Polish

- [X] T330 [P] Extend `tests/web/authz.test.mjs` bodies for the new POST routes; `tests/owner/data.test.mjs` so export and delete cover `review_answers` and `input_days`
- [X] T331 Run `npm test`, `npm run test:e2e`, `npm run check`; fix through spec and tasks; FR-401…FR-419 traced
- [X] T332 Walk through quickstart §2; record in `docs/STATUS.md` (Implemented for G-04)

---

## Dependencies & Execution Order

Setup → Foundational (migration, schedule, items) → US1 → US2 → US3, US4, US5 (independent) → US6 → Polish.

## Implementation Strategy

1. MVP = US1 + US2: marking and drilling.
2. Then US3 (menu and Leaves), US4 (colours), US5 (level and progress), US6 (welcome).
3. If time runs short (constitution 4.3): SHOULDs first — FR-412's Leaves list view (RQ-08), FR-414 (RQ-03, RQ-253), FR-415 (RQ-48, RQ-71), FR-416 (RQ-73), the meanings prompt for typed items (RQ-207).
