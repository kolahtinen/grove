---
description: "Tasks for G-08: the look's extras and help"
---

# Tasks: The look's extras and help (G-08)

**Input**: `specs/008-look-extras-help/` — [plan.md](plan.md), [spec.md](spec.md). Builds on G-01…G-07.

**Tests**: Required. Names start with the FR ID (FR-801…FR-807) and list RQ IDs.

## Phase 1: Foundational

- [ ] T701 [P] Tests in `tests/web/how.test.mjs`: `FR-804 RQ-370:` `/how` is served without signing in; it names every term of `docs/glossary.md`, the three stages, the marking step, CEFR and the share of known words; `FR-807 FR-804 RQ-346 RQ-370:` every page's HTML has the A.5 logo (ground line `gl`, trees `t1`–`t3`) and a "?" link to `/how`
- [ ] T702 Add `/how` to `server/web/static.mjs` (public); write `public/how.html`; add the "?" link, the A.5 logo classes and `topbar.mjs` to every page

## Phase 2: User Stories 1–3

### Tests (write first)

- [ ] T703 [P] Playwright tests `tests/e2e/look-extras.spec.mjs`: `FR-801 FR-802 RQ-311 RQ-310:` after agreeing, Home shows the scene card, its steps advance with the four captions, and it goes away by itself (about 10 s) — or at once on Skip; it doesn't play again on reload; the help page's Replay and a logo tap play it; `FR-803 RQ-308:` with reduced motion, four still frames with captions show; `FR-805 RQ-319:` a right answer gets the right look with a check mark and the bounce, a wrong one the cross and the shake; `FR-806 RQ-322:` the word menu has the header strip in the pop-up border colour and slides up; `FR-807 RQ-309 RQ-341:` at 360 px no two top-bar items overlap and "Sign out" is one line, on Home and the reading page

### Implementation

- [ ] T704 [US1] Write `public/assets/grow.mjs` (scene builder, five steps, Skip, onend, still frames) and the scene CSS
- [ ] T705 [US1] `public/assets/topbar.mjs` (logo tap → pop-up), `home.mjs` card once after agreeing, `terms.mjs` sets the flag; `public/assets/how.mjs` with Replay
- [ ] T706 [US3] CSS: answer feedback (✓/✗, bounce, shake), menu slide-up and header strip, screen slide-in, reduced-motion fades, top bar at 360 px

## Phase 3: Polish

- [ ] T707 Run `npm test`, `npm run test:e2e`, `npm run check` and read the result before committing; FR-801…FR-807 traced; record in `docs/STATUS.md`; note the G-08 changes in `docs/modules.md`
