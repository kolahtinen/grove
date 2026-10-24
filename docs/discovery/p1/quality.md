# Quality attributes: grove (p1)

Draft from round 4's short pass (2026-10-20). Candidates come from the needs, implicit attributes and the risk list. Kept only if they pass all three criteria: (1) a design consideration outside the domain, (2) shapes the structure of the design, (3) critical or important to success. Security always stays. Reviewed in round 5 (question-pages/35).

## Kept

| ID | Attribute | SMART statement (with a number) | How it's tested | Needs | Risks |
|---|---|---|---|---|---|
| Q-p1-01 | Security | No account can read or change another learner's data, except a teacher seeing the progress of students currently in their class. | Authorisation tests for every server route, per role (learner, teacher, owner). | N-p1-53, N-p1-57 | R-p1-07, R-p1-10 |
| Q-p1-02 | Reliability of learner data | Once grove says a change is saved, it survives a restart of the owner's computer; at most one hour of data can be lost if the database itself is lost (hourly backup to another disk). | Restart tests; a restore from backup tried by hand. | N-p1-59, N-p1-51 | R-p1-03 |
| Q-p1-03 | Correctness of the shared bank | No 'unchecked' or rejected entry is ever shown to anyone except the learner who pasted it (or, for a teacher's own material, their class). | Tests over every combination of entry state and viewer. | N-p1-39, N-p1-51 | R-p1-04 |
| Q-p1-04 | Ease of the AI flow | A new learner gets their first AI text into grove within 5 minutes, with at most one fix-it round in 4 out of 5 tries. | Tried by hand with real Claude, ChatGPT and Gemini answers. | N-p1-48, N-p1-03 | R-p1-01, R-p1-02 |
| Q-p1-05 | Responsiveness | Opening the word inspector takes under 0.5 s on a mid-range phone. | Timed by hand on a mid-range phone. | N-p1-64 | — |

## Dropped

| Attribute | Source | Why dropped |
|---|---|---|
| Accessibility (Q-p1-06: told apart without colour) | N-p1-30 | Its need was withdrawn (page 27); dropped in question-pages/35. |
| Scalability | implicit | Free hosting caps the number of users anyway; it won't shape the design now. |
| Availability around the clock | implicit | Free hosts sleep; accepted (cold start covered by Q-p1-05). |
| Portability to native apps | PR-p1-19 | A mobile app is left out. |
