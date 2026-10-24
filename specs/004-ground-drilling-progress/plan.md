# Implementation Plan: Ground, drilling and progress (G-04)

**Branch**: `main` (spec folder `004-ground-drilling-progress`) | **Date**: 2026-10-24 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/004-ground-drilling-progress/spec.md` (clarified 2026-10-24, question-pages/59)

## Summary

The second half of the learning loop. After a text is rated, a marking step lets the learner switch on To read / To remember for words they don't know; the rest fall to the ground. Drilled leaves follow a simple spacing rule (strength 2^(−days/gap); ×2.5 on a right answer from 1 day; fall at gap ≥ 4; halve on a wrong one), and are reviewed in sentences the learner has read — shown (To read), spoken and hidden (To remember), or gapped in reverse (Master). The word menu gains the switches, Let it fall (after a meaning check) and Pick up; texts colour words by mark; Leaves and Progress pages; level from level word lists (filled by G-06); input minutes from an activity heartbeat; a welcome card. No new dependencies. Details: [research.md](research.md).

## Technical Context

**Language/Version**: JavaScript (ES modules) on Node.js 22.14+

**Primary Dependencies**: none new

**Storage**: migration `006-drill.sql` (columns on words and learner_settings; tables review_answers, input_days, level_words) ([data-model.md](data-model.md))

**Testing**: `node --test` (new `tests/drill/`, injectable clock for schedules); Playwright for marking, review, master, leaves, progress, welcome

**Target Platform / Project Type**: as G-01 (web application)

**Performance Goals**: marking 6 words in < 20 s (SC-001, by hand); review question builds < 100 ms

**Constraints**: plain-text display; strict schemas; every change saved on the server (FR-417)

**Scale/Scope**: 14 new API routes, 3 new pages, Home and the reading page extended

## Constitution Check

*GATE: passed before Phase 0; re-checked after Phase 1: still passes.*

| Rule | How G-04 keeps it | Test or check |
|---|---|---|
| 1.3–1.5 tests first, named, IDs | Tests named `FR-4xx RQ-…` | `check-trace` |
| 1.8 modules.md | New module `drill`; reading (payload), texts (reuse list), client extended | updated |
| 2.3 least privilege | All routes `agreed`; items found by the session's account only | authz table gets the new routes; ID-swap tests |
| 2.4 strict input | Schemas with limits for every body; `day` checked | schema tests |
| 3.2, 3.3 export/delete | New per-account tables have `account_id`; `level_words` is shared reference data, not personal | owner data test extended |
| 4.13 migrations | 006 keeps every row | migration test covers 5 → 6 |
| 4.14 licences | Level word lists come from the Kelly list in G-06 with their licence | G-06 |

No violations.

Note (analyze L2): whether a Let it fall question was answered right is checked in the browser, like G-03's practice; a learner could only cheat their own ground, so a server check isn't worth the round trip.

## Project Structure

```text
server/
├── store/migrations/006-drill.sql
├── drill/                       # module drill: schedule.mjs, items.mjs (find/create by lemma+kind), marking.mjs,
│                                #   questions.mjs, review.mjs, marks.mjs (menu switches, let it fall, pick up),
│                                #   leaves.mjs, progress.mjs (level, input, stages), routes.mjs
├── reading/view.mjs             # tokens gain marks, fell, met; payload gains marking
└── texts/packages.mjs           # prompt's reuse list from drilled leaves
public/
├── index.html, assets/home.mjs  # stages, level, minutes, welcome, links
├── assets/reading.mjs           # marking step, colours, menu switches, Let it fall, Pick up, heartbeat
├── review.html, assets/review.mjs
├── leaves.html, assets/leaves.mjs
└── progress.html, assets/progress.mjs
tests/
├── drill/
└── e2e/drill.spec.mjs
```

**Structure Decision**: a new server module `drill` for marks, schedules, reviews and progress; the reading payload and the prompt's reuse list change in their own modules. `docs/modules.md` updated.

## Complexity Tracking

None.
