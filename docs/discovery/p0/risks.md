# Risks: grove (p0)

Draft from the short pass after the import (2026-10-20); accepted on question-pages/42.

| Rank | ID | Failure scenario | Kind | Cost (to whom) | Likelihood | Technique to reduce it | Needs | Requirements |
|---|---|---|---|---|---|---|---|---|
| 1 | R-p0-01 | The learner's AI can't read or write the pack file (no code running, upload limits), so they can't get a new pack. | engineering | high (learners) | high | Plain JSON packs (X-p0-01); try packs with Claude, ChatGPT and Gemini. | N-p0-03, N-p0-16 | PR-p0-04, 08 |
| 2 | R-p0-02 | The learner forgets to download the pack and loses a session's progress. | engineering | high (learners) | medium | The close warning (PR-p0-06); or save automatically (p1's server, settled in /pre.combine). | N-p0-02 | PR-p0-05, 06 |
| 3 | R-p0-03 | The AI returns a malformed or incomplete pack, which won't open, and there's no fix-it message like p1's. | engineering | high (learners) | medium | A check with a fix-it message (as PR-p1-26) when a pack fails to load. | N-p0-03 | PR-p0-02, 04 |
| 4 | R-p0-04 | With no cap on the lists, packs grow too big for the AI's upload or reply limits (pack 15 is already 583 KB unpacked). | engineering | medium (learners) | high | Send the AI only what changed; keep lists outside the pack. | N-p0-08 | PR-p0-74, 75 |
| 5 | R-p0-05 | p0's file-based design and p1's server with accounts can't both be built by Sunday. | project | high (owner) | high | Choose one storage model in /pre.combine; the other can export or import. | — | PR-p0-01, PR-p1-127 |

Cost and likelihood: high / medium / low.
