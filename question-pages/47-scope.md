# 47: Scope (phase 2) and combine corrections

Asked in Claude Code on 2026-10-21 (`/pre.scope`). Draft: docs/middle/scope.md.

## Corrections made before asking (no question needed)

Last night's combine cited some p1 IDs one too low (from about PR-p1-170 on). Requirements copied unchanged were right; conflict decisions and the 'not carried' list were not. Fixed in docs/requirements.md:
- Wrongly left out, now carried: PR-p1-204 (RQ-355), 209 (RQ-356), 217 (RQ-357), 227 (RQ-358), 231 (RQ-359).
- Conflict 5 (p0's translation rule everywhere) also covers PR-p1-200 and 222: RQ-192, RQ-208 dropped.
- Page 43 meant to drop PR-p1-230 (Expand every 2 hours), but PR-p1-227 was dropped: PR-p1-227 restored, PR-p1-230 / RQ-215 dropped.
- Sources fixed: RQ-03 (PR-p1-210), RQ-12 (PR-p1-184), RQ-13 (PR-p1-205), RQ-18 (PR-p1-218, 219), RQ-21 (PR-p1-206), RQ-23 (PR-p1-185); duplicates merged: RQ-179 → RQ-23, RQ-196 → RQ-21, RQ-199 → RQ-03.
- RQ-181 dropped after page 46 (restored below when the budget went back to zero).

## 1. Scope 1/4, out for now: tick the groups you want in the Sunday build

- Writing + grammar · Expand your grove · Per-skill levels · Game feel

**Answer:** all four.

## 2. Scope 2/4, out for now: tick the groups you want in

- Packages and sizes · Easier texts · Reading test · Long read/listen

**Answer:** all four. Note: "actually, for the first version the budget really should be zero. let's do demo content for the reviewer accounts and the copy paste AI".

## 3. Budget zero: what happens to the €20 a month from page 46? (default: kept for a later version)

- Later version · Drop the €20 · Zero, but a domain

**Answer:** Drop the €20. → C-01, C-06, C-08, C-13 back to zero cost; RQ-125, RQ-181 restored; RQ-349…354 dropped; RQ-42, RQ-67 back to 'cut for now'.

## 4. Demo content for reviewer accounts: what is it? (default: ready-made texts)

- Ready-made texts · Texts + a demo learner · Texts for everyone

**Answer:** Texts + a demo learner. → PR-p1-285…287 / RQ-360…362.

## 5. Scope 3/4, in the Sunday build: tick the groups you'd cut (The look basics, Starting level, Grammar basics, Explain and report)

**Answer:** none (all stay in).

## 6. Scope 4/4, still out: tick any you want in (Pasted texts, Retiring words, Map and motivation, Shared bank/library)

**Answer:** Pasted texts, Retiring words, Shared bank/library.

## 7. About 270 requirements in the Sunday build: how do we fit it? (default: build in order; Sunday ships what's done)

- Build in order · Move the date · Cut harder

**Answer:** Cut harder: Sunday keeps the original first build (plus the demo learner); the groups ticked in 1, 2 and 6 become the second build, right after Sunday.

## 8. What should a new reviewer see first? (default: the demo learner)

- Demo learner first · They choose · Starting level first

**Answer:** Demo learner first (the default). → PR-p1-288 / RQ-363; RQ-248 narrowed.
