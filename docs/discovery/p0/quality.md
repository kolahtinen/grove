# Quality attributes: grove (p0)

Draft from the short pass after the import (2026-10-20); accepted on question-pages/42.

## Kept

| ID | Attribute | SMART statement (with a number) | How it's tested | Needs | Risks |
|---|---|---|---|---|---|
| Q-p0-01 | Ease of the pack exchange | An answer from the learner's AI (the changes, X-p0-01) opens in grove on the first try in 4 out of 5 tries, with Claude, ChatGPT and Gemini. | Tried by hand with each AI. | N-p0-03, N-p0-16 | R-p0-01, R-p0-03 |
| Q-p0-02 | Reliability of progress | A downloaded pack reopens with exactly the same progress, lists and settings. | Round-trip tests (save, reopen, compare). | N-p0-02 | R-p0-02 |

## Dropped

| Attribute | Source | Why dropped |
|---|---|---|
| Security of the pack file | PR-p0-08 | The scrambling isn't protection; the file is the learner's own, on their device. |
