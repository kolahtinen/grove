# Quality attributes: grove (app-wide)

Phase 2 (`/pre.quality`, 2026-10-21; reviewed on question-pages/51). The prototypes' attributes (Q-p0-01, 02; Q-p1-01…05) merged, plus candidates from the app-wide needs, the implicit attributes and the risk list (docs/middle/risks.md). Kept only if they pass all three criteria: (1) a design consideration outside the domain, (2) shapes the structure of the design, (3) critical or important to success. Security always stays.

## Kept

| ID | Attribute | SMART statement (with a number) | How it's tested | Needs | Risks |
|---|---|---|---|---|---|
| Q-01 | Security (Q-p1-01) | In the first build, no account can read or change another learner's data, and without signing in only the sign-in, sign-up, password-reset and terms pages can be reached. (Course roles in a later build get their own rule.) | Automated authorisation tests for every server endpoint, for a signed-out visitor, a learner, a reviewer and the owner; a test per endpoint that another learner's IDs are refused. | N-17, N-20, N-24 | R-07, R-17 |
| Q-02 | Privacy | The browser contacts no service other than grove on any page, except Firebase's password-reset page reached from the reset email (C-12). | An automated browser test records every network request on every page and fails on any other host. | N-20, N-24 | R-07 |
| Q-03 | Reliability of learner data (Q-p1-02, Q-p0-02) | Once grove says a change is saved, it survives a restart of grove or the owner's computer; at most one hour of data is lost if the database itself is lost (hourly backup to another disk); a data-format change keeps every learner's data. | Restart tests; a restore from backup tried once by hand before Sunday; each migration tested on a copy of real data. | N-20, N-29 | R-05, R-06 |
| Q-04 | Ease of the AI exchange (Q-p1-04, Q-p0-01) | A reviewer gets their first AI text into grove within 5 minutes of starting an exchange, and 4 out of 5 answers from free ChatGPT, Claude and Gemini are accepted on the first try, with no fix-it round (p0's target, question-pages/51). | Tried by hand with real answers from the three free chats (X-03), counting fix-it rounds; repeated after each prompt change. | N-42, N-15 | R-01, R-04, R-09 |
| Q-05 | Responsiveness (Q-p1-05) | The word menu opens within 0.5 s, and a pasted 20-minute part is checked and shown within 2 s, on a mid-range phone through the tunnel. | Timed by hand on a mid-range phone over mobile data; an automated timing test of the check on the owner's computer. | N-45, N-34 | R-15 |
| Q-06 | Availability during the review | While the review is running, grove answers at the README link in at least 19 of 20 checks a day, and after a tunnel restart the README shows the new link within 2 minutes. | A check script on the owner's computer opens the README link every hour and logs the result; the tunnel is restarted once by hand and the README timed. | N-18 | R-05 |
| Q-07 | Accuracy of new-word counting | Grove reports how many of a fixed test set of 50 real Swedish sentences (inflected forms, homographs, compounds) it counts correctly; no minimum in the first build, and a change may not lower the score without being noticed. A learner's own texts get best-effort automatic checks only (RQ-376); texts are verified before others use them (Q-08) (question-pages/51). | An automated test over the fixed set, with the right counts written by hand; its score is shown in the test report, and the build doesn't fail on it. | N-11, N-13 | R-03 |
| Q-08 | Correctness of shared content (Q-p1-03; second build) | No 'unchecked' or rejected entry is ever shown to anyone except the learner who pasted it, and no shared text reaches another learner unless every sentence has passed the automatic check or a content maintainer's check (RQ-375, question-pages/51). | Tests over every combination of entry or sentence state and viewer. | N-43 | R-13 |

## Dropped

| Attribute | Source | Why dropped |
|---|---|---|
| Accessibility (Q-p1-06: told apart without colour) | N-p1-30 | Its need was withdrawn (page 27); dropped on question-pages/35. |
| Scalability | implicit | At most 5 reviewers and one owner's computer (C-11); it won't shape the design now. |
| Availability around the clock | implicit | The owner's computer and a free quick tunnel with no uptime promise (C-06, X-01); Q-06 covers the review period only. |
| Portability to native apps | PR-p1-19 | A mobile app is left out (C-03). |
| Performance on older phones | R-15 | Covered by Q-05 (a mid-range phone) and reduced motion (RQ-308); it doesn't shape the structure on its own. |
| Maintainability | N-10 | Fails criterion 1 as a separate attribute: handled by the process (spec as the source, small first build, C-10) and the constitution. |
| Security of the pack file (Q-p0) | PR-p0-08 | No pack files any more. |
