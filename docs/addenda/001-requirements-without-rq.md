# Addendum 001: combined requirements for 10 spec requirements that had none

**Date:** 2026-10-25

Not a risky new need: the first-build review ([review](../reviews/2026-10-25-first-build.md), finding 3) found 10 spec requirements that name no combined requirement, which constitution 1.5 requires. They came from the threat model, constraints, quality attributes, risks, question-pages/56 and the glossary. Since `docs/requirements.md` and `docs/needs.md` are frozen, the combined requirements are added here instead (question-pages/63, answer B). Every need these meet already exists, so no needs are added.

## Requirements

Same columns as [requirements.md](../requirements.md). Each spec requirement was already built and tested under its FR ID, so every requirement is feasible and has the priority it was built with.

| ID | Requirement | Sources | Rewords or merges? | Needs | Feasibility | Priority | Status |
|---|---|---|---|---|---|---|---|
| RQ-380 | Everything from a pasted AI answer is shown as plain text only. | T-06, constitution 4.6 | no | N-43 | easy (built: FR-221) | must | active |
| RQ-381 | Every text is shown as plain text. | T-06, constitution 4.6 | no | N-43 | easy (built: FR-304) | must | active |
| RQ-382 | A learner can say they already know a drilled word: grove checks its meaning once, and only a right answer moves it to the ground; patterns and words with too few other meanings to choose from get a confirmation instead. | question-pages/56 | no | N-12, N-32 | easy (built: FR-410) | should | active |
| RQ-383 | A learner can take a word from the ground back into drilling; it is due at once. | glossary (Pick up) | no | N-04 | easy (built: FR-411) | should | active |
| RQ-384 | New data for the ground and drilling comes with a migration that keeps every learner's data. | Q-03, R-06, constitution 4.13 | no | N-16 | easy (built: FR-418) | must | active |
| RQ-385 | A public credits page names every outside source and its licence, linked from the terms page and Home. | C-05, R-14, constitution 4.14 | no | N-43 | easy (built: FR-602) | must | active |
| RQ-386 | When the learner marks most of the starting-level sample as unknown, grove suggests the level below, without forcing it. | R-11 | no | N-13 | easy (built: FR-607) | should | active |
| RQ-387 | New data for the starting level comes with a migration that keeps every learner's data. | Q-03, constitution 4.13 | no | N-12 | easy (built: FR-610) | must | active |
| RQ-388 | Demo content is shown as plain text like any AI text. | T-06, constitution 4.6 | no | N-18 | easy (built: FR-707) | must | active |
| RQ-389 | The logo animation plays once after a new learner agrees to the terms, can be replayed on the help page, and plays when the logo is tapped; it can always be skipped. | question-pages/56 | no | N-25, N-26 | easy (built: FR-802) | could | active |

## Why it's risky
Not risky: nothing new is built. The addendum only records where 10 already-built requirements come from.

## Risks
None new. RQ-380, 381, 388 meet T-06; RQ-385 meets R-14; RQ-386 meets R-11; RQ-384 and RQ-387 meet Q-03 and R-06.

## Feasibility
- **Rating:** easy for all 10: built and tested in the first build (G-03, G-04, G-06, G-07, G-08).

## STRIDE (new components or connections)
None.

## Decision
question-pages/63, question 1: new combined requirements for all 10 (B); constitution 1.5 unchanged. The spec requirements now name these IDs.
