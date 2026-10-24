# Implementation Plan: Starting level (G-06)

**Branch**: `main` (spec folder `006-starting-level`) | **Date**: 2026-10-25 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/006-starting-level/spec.md` (clarified 2026-10-25, question-pages/60)

## Summary

Grove carries the Swedish Kelly list as a cleaned TSV built from Språkbanken's XML, imports it into the level word lists at start-up with its source and licence, and credits it on a public page. A new learner (not the reviewer) goes from the welcome to a starting check: pick a level or "complete beginner", tick unknown words among 30 samples, confirm; the levels' words join the ground (marked as from the starting check), ticked ones become unmarked leaves. Running it again replaces only untouched starting-check words. No new dependencies. Details: [research.md](research.md).

## Technical Context

**Language/Version**: JavaScript (ES modules) on Node.js 22.14+

**Primary Dependencies**: none new

**Storage**: migration `007-levels.sql`; `server/levels/kelly-sv.tsv` (~8,200 forms) ([data-model.md](data-model.md))

**Testing**: `node --test` (`tests/levels/`, with a small Kelly fixture and the real file); Playwright for the check and credits

**Performance Goals**: applying a check (up to ~8,000 inserts) in under 2 s in one transaction

**Constraints**: CC BY-SA 3.0 attribution (C-05, constitution 4.14); Swedish only (C-09)

**Scale/Scope**: 2 routes, 2 pages, Home links

## Constitution Check

| Rule | How G-06 keeps it | Test or check |
|---|---|---|
| 1.3–1.5 | Tests named `FR-6xx RQ-…` | `check-trace` |
| 1.8 | New module `levels` | modules.md updated |
| 2.3 | The check changes only the learner's words; level lists can't be changed through grove; reviewer refused | route tests |
| 2.4 | Schemas for both routes | schema tests |
| 4.13 | 007 adds columns only | migration test 6 → 7 |
| 4.14 | Every level word keeps source and licence; credits page names every source | import test; credits test |
| 4.15 | Kelly CC BY-SA 3.0 / LGPL 3.0; licence file committed | review |

No violations.

## Project Structure

```text
scripts/build-kelly.mjs                # XML → TSV
server/
├── store/migrations/007-levels.sql
└── levels/                            # module levels: kelly-sv.tsv, KELLY-LICENCE.txt, kelly.mjs (read TSV), import.mjs,
                                       #   start.mjs (sample, apply, re-run), routes.mjs
public/
├── start.html, assets/start.mjs
├── credits.html
└── index.html, assets/home.mjs        # welcome → /start; "Set my starting level again"; credits link
tests/levels/, tests/e2e/levels.spec.mjs
```

## Complexity Tracking

None.
