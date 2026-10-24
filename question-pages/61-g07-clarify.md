# 61: G-07 clarify (phase 3)

Asked on 2026-10-25 during `/speckit-clarify` for G-07 (`specs/007-reviewer-demo/spec.md`), in Claude Code from the phone.

## 1. Add an owner command to reset the shared reviewer account to the demo? (default: A)

Why asked: the spec draft added it beyond the feed, because reviewers share one account (question-pages/55) and one reviewer's practice changes what the next sees.

- **A:** yes, `demo:reset`: puts the account back in the exact demo state, dates from now (~15 minutes of extra work)
- **B:** no: the demo is put in once at creation; reviewers see each other's changes

**Answer:** B. FR-706 withdrawn.
