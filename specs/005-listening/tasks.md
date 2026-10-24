---
description: "Tasks for G-05: listening"
---

# Tasks: Listening (G-05)

**Input**: `specs/005-listening/` — [plan.md](plan.md), [spec.md](spec.md). Builds on G-01…G-04.

**Tests**: Required. Names start with the FR ID (FR-501…FR-508) and list RQ IDs.

## Phase 1: Foundational

- [X] T601 [P] Test addition in `tests/store/store.test.mjs`: `FR-503 RQ-13: migration 008 keeps every row and adds speech_rate (1) and voice_help_shown (0)`
- [X] T602 [P] Tests in `tests/reading/listening.test.mjs`: `FR-503 RQ-13 RQ-365:` `POST /api/settings` keeps a speech rate within 0.5–1.5 and refuses 0.4 and 1.6 and non-numbers; `GET /api/reading` and `GET /api/stages` return it; `FR-502 RQ-20 RQ-369:` `voiceHelpShown` starts false and stays true once set; each per account
- [X] T603 Write `server/store/migrations/008-listening.sql`; add the `number` schema type to `server/web/http.mjs`; extend `POST /api/settings` and the payloads

## Phase 2: User Stories 1–3 (P1)

### Tests (write first)

- [X] T604 [P] Playwright tests `tests/e2e/listening.spec.mjs` with a fake speech engine: `FR-504 FR-505 RQ-198 RQ-21 RQ-47 RQ-57:` Listen blurs the text, Play speaks each sentence in order, highlighting it, and unblurs at the end; `FR-506 RQ-14:` replaying a sentence twice shows "played 2×"; `FR-507 RQ-197:` a looped sentence is spoken again until the loop is turned off; `FR-508 RQ-270:` after listening the questions are shown; `FR-503 RQ-13 RQ-365:` the slider changes the rate used by the next utterance, the note is shown, and the rate is kept after reload; `FR-501 FR-502 RQ-20 RQ-369:` with no Swedish voice (only an English one) nothing is spoken and the help appears once (not after reload); with voices arriving late, the Swedish one is used; `sv_SE` counts as Swedish

### Implementation

- [X] T605 Write `public/assets/speech.mjs` (voice choice with `voiceschanged`, `sv`/`sv-SE`/`sv_SE`, rate, `speak(text, {onend})`, `cancel()`, `hasSwedish()`); use it in `reading.mjs`, `review.mjs`, `leaves.mjs` instead of their own speak functions
- [X] T606 Listening mode in `public/text.html`, `public/assets/reading.mjs`, `grove.css`: Listen button, blur, Play/Pause, per-sentence replay with count and loop, speed slider with note, the one-time voice help (and a "No Swedish voice?" link), questions after listening

## Phase 3: Polish

- [X] T607 Extend `tests/web/authz.test.mjs` bodies; run `npm test`, `npm run test:e2e`, `npm run check` and read the result before committing; FR-501…FR-508 traced; record in `docs/STATUS.md`
