# Implementation Plan: Demo content for reviewers (G-07)

**Branch**: `main` (spec folder `007-reviewer-demo`) | **Date**: 2026-10-25 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/007-reviewer-demo/spec.md` (clarified 2026-10-25, question-pages/61)

## Summary

A demo file in grove's answer format, built once from the X-03 Claude answer by a script (dialogue speakers into the lines, the choose-your-path story along one path, the recorded slips corrected, new words taken from grove's own count with meanings filled in by hand), and a demo history applied when the owner creates the reviewer account: the X-03 known words as ground, the four texts accepted through grove's own accept path as one finished package, two ratings with question answers, six drilled leaves at set ages, input minutes on earlier days. No new dependencies.

## Technical Context

**Language/Version**: JavaScript (ES modules) on Node.js 22.14+

**Primary Dependencies**: none new

**Storage**: no migration; the demo writes ordinary rows

**Testing**: `node --test` (`tests/demo/`): the demo passes grove's checks; the history after `reviewer:setup`; Playwright: the reviewer's first visit

**Constraints**: plain text (T-06); demo dates relative to creation; C-07 (AI-written content under the provider's terms)

## Research (decisions)

- **R1 Demo file.** `scripts/build-demo.mjs` reads `docs/middle/ai-test/answer-claude.json` and writes `server/demo/demo-answer.json`: episodes as they are; the dialogue's lines become "Anna: …"; the choose-your-path story becomes one text from the nodes `start → granne → granne_ja` (choices dropped); the slips of results.md fixed by a small replacement table; `new_words` from grove's own count against `known.txt` with meanings from a hand-written table in the script (the X-03 answer listed none); `part` = `DEMO-1`; `inflections` dropped (grove works them out). Committed, so the demo is reviewable.
- **R2 Applying the demo.** `server/demo/apply.mjs` runs in one transaction for the reviewer account: seed the known words as ground; create a finished package and an accepted exchange; accept the demo answer through G-02's `acceptAnswer` (so sentences, leaves, meanings, names, patterns are made exactly as for a real answer); then ratings, question answers, drilled leaves (marks, gaps, last reviews at set offsets), input minutes and `last_summary_at` before the ratings. Called by `reviewer:setup` right after the account is created.
- **R3 Dev server.** The dev server's reviewer gets the demo through the same function instead of only the known words.

## Constitution Check

| Rule | How G-07 keeps it | Test or check |
|---|---|---|
| 1.3–1.5 | Tests named `FR-7xx RQ-…` | `check-trace` |
| 1.8 | New module `demo` | modules.md |
| 2.3 | The demo writes only the reviewer account's rows | demo test checks other accounts untouched |
| 4.6 | Demo text shown as plain text | existing reading tests apply |
| 4.13 | No data-format change | — |

No violations.

## Project Structure

```text
scripts/build-demo.mjs
server/demo/                 # module demo: demo-answer.json, history.mjs (the history description), apply.mjs
server/owner/setup.mjs       # reviewer:setup applies the demo
tests/demo/, tests/e2e/demo.spec.mjs
```

## Complexity Tracking

None.
