# 87 — Sketch: Progress (B-27), round 1

Sketch: https://claude.ai/artifact/2wXNgLwSFyBQikTBXb7Za6 · source `prototypes/sketches/2026-10-29-progress/index.html` · published 2026-10-29. Questions before it: question-pages/85 (2: minutes first, words underneath).

Versions: **A** one long page, sections in the note's order · **B** summary cards on top, the week and Ever below · **C** this week first, Ever behind a switch.

Questions on the page (blanks take the first option): what "this week" is (Monday–Sunday / last 7 days); what "picked up for drilling" counts (leaves now / ever picked up); whether the ground includes the starting level's words (yes, split shown / only grown in grove); today's minutes on Progress (keep / Home only).

Open points from building it, for the spec: reading and listening minutes must be recorded apart (FR-415 keeps one total today); the 14 day bars give way to this week's Monday–Sunday.

## Your pick and comments

Said done 2026-10-29.

- **Pick:** B (summary cards on top, the week and Ever below). No comments.
- What is "this week"? → **The last 7 days** (not the default).
- "Picked up for drilling" shows → **The leaves you have now**.
- The ground includes the starting level's words? → **Yes, with the split shown underneath**.
- Today's minutes on Progress → **Keep them on Progress**.

## Applied

RQ-448 (requirements from sketches, docs/requirements.md); G-09 FR-924 (Progress as version B, "this week" as the last 7 days), FR-925 (minutes per kind, picked-up time), user story 9, SC-009, FR-910; G-04 FR-415 points to them; data model migration 019; contract for `/api/progress` and `/api/input`'s kind. Built 2026-10-29: regen(store, drill, demo, client).

## Sketch and build side by side (docs/sketching.md, 6)

Screenshots: `prototypes/sketches/2026-10-29-progress/picked.png` (version B, the sketch's made-up A2 learner) and `built.png` (the dev server's demo learner, 390 px). The layout matches: the level card with today's minutes, the four cards two by two, the 7-day chart, since you started. Differences, apart from the data:

1. The chart: the sketch has a minute scale with grid lines, each day's total above its bar, today marked "today", the legend above it and "Tap a bar to see its minutes and words" under it; the build has bars, day names and the legend only.
2. The level card: the build keeps a line "Your level: …" under the two boxes (the old level line, still read by the levels tests); the sketch has only the boxes. The sketch's "since 22 Oct" under Now is not built, as grove keeps no day for reaching a level (FR-924).
3. Since you started: the sketch puts the words on their own line under the minutes; the build puts them after "·".
4. The demo learner shows "Listened 0 min · 136 words": its history has a listening text read but its minutes count as reading.

### After the side by side: make the chart match the sketch? (default: yes)

- Yes, match the sketch (Recommended): the scale, the totals, "today" and the hint; also no extra level line, and words on their own line under the minutes
- Keep it as built

**Answer:** Yes, match the sketch. Applied to FR-924 (3), (1), (4).

