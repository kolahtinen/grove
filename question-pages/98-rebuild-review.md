# 98 — Settling the sketch round's rebuild (branch worktree-agent-a5e6a4717b5558c2e)

Asked 2026-10-31 in Claude Code.

### 1. During a session, how do you get back to Home? FR-922 says a "‹ Home" link; FR-932 says the slim session bar's ✕. (default: only the ✕)
- Only the ✕ (Recommended): no "‹ Home" link and no logo during a session; the start screen and summary have Back to Home
- Both
**Answer:** Only the ✕. Applied: G-09 FR-922 names the session as its one exception. The rebuild had loosened FR-922's browser test to accept either without a rule change; the test now checks the ✕ only.
