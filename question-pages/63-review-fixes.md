# 63: Fixing the first-build review findings

Asked on 2026-10-25 in Claude Code, after the fresh-session review ([review](../docs/reviews/2026-10-25-first-build.md)). Deadline: 2026-11-01.

## 1. Finding 3: 10 requirements name no combined requirement (default: split by kind)

Why asked: FR-221, 304, 410, 411, 418, 602, 607, 610, 707 and 802 name a threat, constraint, quality attribute, question page or the glossary, but no RQ, which constitution 1.5 requires. Six only put constitution rules into practice (4.6, 4.13, 4.14); four are features decided after the freeze.

- **A:** split by kind: amend 1.5 so the six may cite their constitution rule; the four features get new RQs in an addendum
- **B:** new RQs for all 10 in an addendum (RQ-380 onward); 1.5 unchanged
- **C:** amend 1.5 so any source counts when no RQ exists
- **D:** keep 1.5 and log the 10 as violations

**Answer:** B. Note: the highest existing RQ is RQ-379, so the new ones are RQ-380…389 (the question said RQ-392…401).

## 2. Which other findings to fix before the deploy? (default: all 9 now)

Why asked: the review found 2 medium and 7 low issues besides finding 3; deploy, the real-AI check and validation still need time before 2026-11-01.

- **A:** all 9 now (1, 2, 4–10), through spec changes and `/regenerate`
- **B:** medium only (1, 2); the low ones later
- **C:** medium plus the security ones (1, 2, 4, 8); the rest later

**Answer:** A.
