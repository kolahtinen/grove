---
description: "Tasks for G-07: demo content for reviewers"
---

# Tasks: Demo content for reviewers (G-07)

**Input**: `specs/007-reviewer-demo/` — [plan.md](plan.md), [spec.md](spec.md). Builds on G-01…G-06.

**Tests**: Required. Names start with the FR ID (FR-701…FR-707) and list RQ IDs.

## Phase 1: Setup

- [X] T501 Create `server/demo/`, `tests/demo/`
- [X] T502 Write `scripts/build-demo.mjs` (plan R1) and run it to produce `server/demo/demo-answer.json`

## Phase 2: User Story 1 - Try grove fully before using an AI (P1) 🎯 MVP

### Tests (write first)

- [X] T503 [P] [US1] Tests in `tests/demo/content.test.mjs`: `FR-702 RQ-361:` the demo file has the four texts with their titles, questions, new words with meanings, the two phrases and the names; the dialogue's lines start with a speaker; the story is one text; no recorded slip remains ("har glömt min väska här igår", "Den borta nyckeln", "Vem heter Olle"); `FR-703 RQ-361:` it passes grove's schema and answer checks against the X-03 known words with no problems; `FR-707 RQ-361:` nothing in it is HTML
- [X] T504 [P] [US1] Tests in `tests/demo/history.test.mjs`: `FR-704 FR-705 FR-701 RQ-362 RQ-363 RQ-360:` after `reviewer:setup`, the reviewer account has the ~400-word ground, four texts in one finished package, two ratings (most, a little) with question answers, six drilled leaves (one fading, three due, one with gap 2.5, one fresh; both kinds of marks), input minutes on three of the last five days, the welcome not dismissed, no starting check needed and no restart; Review lists the fading leaf first; Master has one leaf; the next prompt is part 1 of a new package with a summary naming the two rated texts; another account is untouched; SC-003: setup with the demo takes under 2 s
- [X] T505 [P] [US1] Playwright test `tests/e2e/demo.spec.mjs`: `FR-704 FR-705 RQ-362 RQ-363:` the reviewer's Home shows Review with due words and Master ready, four demo texts with two rated, and Progress shows minutes on earlier days

### Implementation

- [X] T506 [US1] Write `server/demo/history.mjs` (the history of FR-704) and `server/demo/apply.mjs` (plan R2); call it from `reviewer:setup` in `server/owner/setup.mjs`
- [X] T507 [US1] Give the dev server's reviewer the demo through `applyDemo` (`tests/fakes/dev-server.mjs`); adjust nothing else

## Phase 3: Polish

- [X] T508 Run `npm test`, `npm run test:e2e`, `npm run check` (reading its result before committing); FR-701…FR-707 traced (FR-706 withdrawn); record in `docs/STATUS.md`

## Dependencies

Setup → US1 → Polish.
