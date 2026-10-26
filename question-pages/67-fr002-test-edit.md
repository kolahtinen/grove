# 67: The FR-002 test edit (test review 2026-10-26, finding 9)

Asked on 2026-10-26 in Claude Code, after `docs/reviews/2026-10-26-test-review.md`.

## 1. FR-002's test lost its env-file check (moved to FR-004's test) without FR-002 changing. How should this be handled? (default: accept as a one-off)

Why asked: CLAUDE.md says a test changes only when its spec rule changes; the 2026-10-26 tunnel regeneration removed the `EnvironmentFile=/etc/grove/grove.env` check from the FR-002 units test because FR-004 split that file, and the check now lives in a new FR-004 test.

- **A:** accept as a one-off; note the exception in the 2026-10-26 regeneration-log row
- **B:** add a rule to CLAUDE.md allowing a check to move to the test of the rule it belongs to, logged
- **C:** back it with a spec change: a sentence in FR-002 pointing the env files to FR-004

**Answer:** A (the default).
