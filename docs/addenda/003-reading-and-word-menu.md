# Addendum 003: the reading page and the word menu

**Date:** 2026-10-26

The owner's-test group "reading page and word menu" (O-12, O-14, O-15, O-16, O-17, O-19, O-21, O-22; [notes](../reviews/2026-10-25-owner-test.md); decisions on question-pages/64 and 73). No new needs: every requirement here meets needs that already exist. Not risky in itself; kept as an addendum because it rewords frozen requirements.

## Requirements

Same columns as [requirements.md](../requirements.md).

| ID | Requirement | Sources | Rewords or merges? | Needs | Feasibility | Priority | Status |
|---|---|---|---|---|---|---|---|
| RQ-411 | The reading view shows no translation under the sentences; one **Show translation** button shows the whole text's English below the text. The learner works out meaning from the words (the word menu). | O-17; question-pages/64 (12) | yes (RQ-10: translation under each sentence, off by a setting) | N-02, N-11 | easy | must | active |
| RQ-412 | Speaking a tapped word is a setting, on by default, switched in the word menu and kept for the learner. | O-14; question-pages/64 | yes (RQ-18: a tap always speaks) | N-03, N-19 | easy | should | active |
| RQ-413 | A form that may belong to more than one dictionary word has no mark in the text; its word menu lists each word with its meaning. | O-15; question-pages/64 (11) | yes (RQ-294's amber dot) | N-45 | easy | should | active |
| RQ-414 | The word menu offers picking up a grammar pattern of the sentence, not only the word. | O-16 | no | N-04, N-05 | easy | should | active |
| RQ-415 | Swedish, written in the Latin alphabet, has one drill list, **To remember**; **To read** is only for languages with their own writing system. Marks To read become To remember with their schedules. Review shows the sentence with a **Play** button. | O-18, O-19; question-pages/64 (10), 73 (1, 2) | yes (RQ-52's two switches as decided on question-pages/59; RQ-32's spoken-and-hidden To remember) | N-04, N-37, N-32 | easy | must | active |
| RQ-416 | Ground words can be picked up from the Dictionary. | O-21 | no | N-04 | easy | should | active |
| RQ-417 | A word and the punctuation after it never break onto separate lines; a name doesn't stand on a line of its own. | O-22 | no | N-34, N-02 | easy | must | active |
| RQ-418 | Own texts have their own page, always reachable from Home and the top bar; after a finished package Home suggests it. | O-12; question-pages/64 (9) | no | N-16, N-41 | easy | should | active |

O-14 also asked why the word wasn't spoken in the owner's test: checked when the client is rebuilt.

## Decision

Accepted with the owner's answers (question-pages/64, 73). The specs changed: G-03 FR-301, FR-305, FR-306, FR-316, FR-318, FR-320, FR-321; G-04 FR-401, FR-406, FR-409, FR-411, FR-412, FR-413, FR-418.
