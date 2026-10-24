# grove p1 round 5: quality, threats, this round (asked in Claude Code, 2026-10-20)

Replaces the HTML page 26.

## Quality attributes
1. **Q-p1-01 (security):** no account can read or change another learner's data, except a teacher seeing current students' progress. Options: keep · keep, change wording. **Answer:** keep.
2. **Q-p1-02 (reliability):** saved changes survive a restart; at most one day lost if the database is lost. Options: keep · drop · keep, change number. **Answer:** keep, change number.
   - Follow-up: how much data may be lost at most? Options: one hour · one day · one week · nothing (live copy). **Answer:** one hour.
3. **Q-p1-03 (shared bank):** unchecked or rejected entries are never shown to others. Options: keep · drop · keep, change wording. **Answer:** keep.
4. **Q-p1-04 (AI flow):** first AI text within 5 minutes; at most one fix-it round in 4 of 5 tries. Options: keep · drop · keep, change numbers. **Answer:** keep.
5. **Q-p1-05 (responsiveness):** word inspector under 0.5 s on a mid-range phone. Options: keep · drop · keep, change number. **Answer:** keep.
6. **Q-p1-06 (accessibility):** told apart without colour; its need was withdrawn. Options: drop · keep. **Answer:** drop.

## Threats
7. **T-p1-01 (login):** lock for 15 minutes after 5 failed attempts; hashed passwords. **Answer:** agree.
8. **T-p1-02 (pasted texts):** show pastes only as plain text. **Answer:** agree.
9. **T-p1-03 (bank flooding):** check and review list, plus a daily limit per account. **Answer:** agree.
10. **T-p1-04 (bank changes):** log who, when, what. **Answer:** agree.
11. **T-p1-05 (class progress):** check class membership on every request. **Answer:** agree.
12. **T-p1-06 (AI key):** key only in a setting, never logged or sent. **Answer:** agree.
13. **T-p1-07 (sign-ups and pastes):** limits on sign-ups per hour and paste size. **Answer:** agree.
14. **T-p1-08 (roles):** no answer; you clarified: *there are clear roles and the course creator is at first the only one in charge; suggest a workable scheme.*
    - Follow-up: use the proposed scheme (owner and learner on the server; creator, co-teacher, student per course; only the creator changes roles or hands over the course; every request checked on the server)? Options: use it as described · without co-teachers · change something. **Answer:** use it as described.
15. **New T-p1-09 (the owner's computer):** no open ports, grove as its own limited user, its own folder only. No answer; you clarified: *agree, and don't give users who aren't logged in access to anything that is hackable.*

## This round
16. **Scope:** review p1's priorities now or in phase 2? Options: leave to phase 2 · review now. **Answer:** review now.
17. **Topics for the next round** (multiple): account basics · phones and offline · real AI answers · the shared library. **Answer:** all four.
18. **Build this round?** Options: no · yes. **Answer:** no.

Applied: Q-p1-02 and Q-p1-05 updated, Q-p1-06 dropped; threats agreed, T-p1-08 updated, T-p1-09 added; PR-p1-150…166 added (role scheme, server checks, threat mitigations); courses cut for now with teachers.
