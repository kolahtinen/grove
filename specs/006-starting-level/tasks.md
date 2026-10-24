---
description: "Tasks for G-06: starting level"
---

# Tasks: Starting level (G-06)

**Input**: `specs/006-starting-level/` — [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/http-api.md](contracts/http-api.md). Builds on G-01…G-04.

**Tests**: Required. Names start with the FR ID (FR-601…FR-610) and list RQ IDs.

## Phase 1: Setup

- [X] T401 Create `server/levels/`, `tests/levels/`
- [X] T402 Write `scripts/build-kelly.mjs` (research R1) and run it on the downloaded `kelly.xml` to produce `server/levels/kelly-sv.tsv`; write `server/levels/KELLY-LICENCE.txt`

## Phase 2: Foundational

### Tests (write first)

- [X] T403 [P] Tests in `tests/levels/kelly.test.mjs`: `FR-601 RQ-117:` the build script on a small XML fixture drops bracket notes, lower-cases, keeps a duplicate once at its lowest level, marks multi-word forms as phrases, maps CEFR 1–6 to A1–C2, and writes the header with source and licence; the committed TSV has about 8,000 forms, every level, and no form twice
- [X] T404 [P] Test addition in `tests/store/store.test.mjs`: `FR-610: migration 007 keeps every row and adds the level columns with their defaults`
- [X] T405 [P] Tests in `tests/levels/import.test.mjs`: `FR-601 RQ-117 C-05:` start-up imports the TSV into `level_words` with source "Swedish Kelly list, Språkbanken" and licence "CC BY-SA 3.0, LGPL 3.0" on every row, fills `sources`, records the hash, and doesn't re-import an unchanged file; a missing file is logged and grove still starts

### Implementation

- [X] T406 Write `server/store/migrations/007-levels.sql` exactly as data-model.md
- [X] T407 Write `server/levels/kelly.mjs` (read the TSV) and `server/levels/import.mjs`; call the import from `server/main.mjs` at start-up

## Phase 3: User Story 3 - Level word lists and credits (P1)

### Tests (write first)

- [X] T408 [P] [US3] Test `tests/levels/credits.test.mjs`: `FR-602 C-05:` `/credits` is public and names every row of `sources` (the Kelly list with its licence and link) and the font with its licence
- [X] T409 [P] [US3] Playwright test `tests/e2e/levels.spec.mjs` (part 1): `FR-602:` the terms page links to Credits, which lists the Kelly list and the font

### Implementation

- [X] T410 [US3] Write `public/credits.html` (public, linked from `public/terms.html` and Home); add `/credits` to the static pages (access public)

## Phase 4: User Story 1 - Start from about what I know (P1) 🎯 MVP

### Tests (write first)

- [X] T411 [P] [US1] Tests in `tests/levels/start.test.mjs`: `FR-604 RQ-114 RQ-249:` `GET /api/start/sample?level=A2` gives 30 distinct A2 forms spread from most to least common; `POST /api/start` with A2 and 5 unknown puts every A1 and A2 form except those 5 in the ground with origin start, keeps the learner's existing words as they were, and makes the 5 unmarked leaves (no meaning); `FR-603 RQ-113:` `beginner` leaves the ground as it was; `FR-607:` 20+ unknown → `suggestLower: true` (never for A1); `FR-608 RQ-03 RQ-253:` afterwards `GET /api/stages` shows level "A2"; `FR-605 RQ-248:` `needsStart` is true for a new account until the check is done and never for the reviewer; `FR-609 RQ-155:` the reviewer gets 403; another account's ground is unchanged; level lists unchanged; SC-002: A2 with nothing ticked gives every A1 and A2 form; applying takes under 2 s
- [X] T412 [P] [US1] Playwright test `tests/e2e/levels.spec.mjs` (part 2): `FR-605 FR-604 RQ-248 RQ-114:` the owner account closes the welcome and lands on Starting level; picks A2, ticks two words, confirms, and Home shows "Level: A2"; the reviewer goes to Home without it

### Implementation

- [X] T413 [US1] Write `server/levels/start.mjs` (research R4) and `server/levels/routes.mjs` (`GET /api/start/sample`, `POST /api/start`); register in `server/web/app.mjs`; `needsStart` and `canRestart` in `GET /api/stages` (`server/drill/routes.mjs`)
- [X] T414 [US1] Write `public/start.html` + `public/assets/start.mjs` (levels, beginner, the sample with ticks, Confirm, the suggestion with one tap to the level below); Home sends the learner to `/start` after closing the welcome when `needsStart`; add `/start` to the static pages (agreed)

## Phase 5: User Story 2 - Change my starting level later (P2)

### Tests (write first)

- [X] T415 [P] [US2] Tests in `tests/levels/restart.test.mjs`: `FR-606 RQ-252:` after A2, a check at B1 adds B1 forms; a check at A1 removes untouched A2 starting words but keeps starting words that were met in a text, drilled, picked up or fell from a leaf, and every word learned from texts; ticked leaves from the first check that are untouched are replaced too; `canRestart` is false for the reviewer
- [X] T416 [P] [US2] Playwright test `tests/e2e/levels.spec.mjs` (part 3): `FR-606 RQ-252:` Home's "Set my starting level again" opens the check; the reviewer's Home has no such link

### Implementation

- [X] T417 [US2] "Set my starting level again" link on Home when `canRestart`

## Phase 6: Polish

- [X] T418 [P] Extend `tests/web/authz.test.mjs` for `POST /api/start`; `tests/owner/data.test.mjs` unchanged (no new per-account tables) but check export includes `origin`
- [X] T419 Run `npm test`, `npm run test:e2e`, `npm run check`; FR-601…FR-610 traced; record in `docs/STATUS.md`

## Dependencies & Execution Order

Setup → Foundational (TSV, migration, import) → US3 → US1 → US2 → Polish.

## Implementation Strategy

MVP = import + US1. If time runs short: FR-607 (suggestion) and US2 (SHOULD: RQ-252) go first; RQ-248's redirect is SHOULD too.
