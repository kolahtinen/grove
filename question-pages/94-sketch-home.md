# 94 — Sketch: Home, round 1

Sketch: https://claude.ai/artifact/16Ei3BRpQLtmXuGQTG9gyv · source `prototypes/sketches/2026-10-31-home/index.html` · published 2026-10-31. Questions before it: question-pages/91 (3).

## Your pick and comments

Said done 2026-10-31. No comments.

- **Pick:** C (Map of everything: three bands with a heading and a line each, Learn, Your texts, How you're doing; each tile a row with its name, a line and a count; Progress with a mini week chart; Learning rows open in place, Library and Progress rows go straight to their page; on a computer the bands side by side).
- 1. A brand-new learner after the terms lands → **on the starting level page first, as today, with its loop fixed** (not the default).
- 2. A Library or Progress tile → **opens its page straight away** (default).
- 3. Small live lines on tiles → **yes, on every tile that has one** (default).
- 4. The libraries' names → **keep "Your library" and "Common library"** (default).
- 5. Resume while a session is going → **at the very top of Home** (default).
- 6. Home on a computer → **wider, the groups side by side** (default).

## Applied

RQ-463; G-09 FR-901 (the map: three bands of rows with lines and live counts; Learn rows open in place, the rest open their pages; Resume at the top; side by side from 900 px), FR-904, FR-922 (the starting level's Home link no longer loops); G-06 FR-605 (the starting level once). Build: regen to follow.

## Sketch and build side by side (docs/sketching.md, 6)

Screenshots at 390 px, light look, in `prototypes/sketches/2026-10-31-home/`: `picked-home.png`, `picked-home-discover.png` (version C, its made-up data, a session going) and `built-home.png`, `built-home-discover.png` (the dev server's reviewer, with a 10-minute Mix going).

The build matches the map: three bands with their headings and lines, the rows with icon, name, line and count, Progress with its seven small bars, Discover opening in place below its row with Start and Options…. Differences:

1. **Resume** sits at the very top of Home, above the welcome card and the bands (the spec, question-pages/94, 5); the sketch put it inside the Learn band. It has a coloured stripe at its left.
2. **The welcome card** shows above the bands for an account that hasn't closed it (G-04 FR-416, kept); the sketch has none.
3. **The open Discover panel** has no "Waiting: 3 new texts · 4 next words · pattern: …" line; its Start reads "Start · 10 min, all skills" (FR-903), the sketch's "Start · 10 min".
4. **Band squares**: Learn's is Review's brown, Your texts' green, How you're doing's teal; the sketch had green, brown and teal.
5. **Progress line** for the demo reviewer says "No level yet · 0 min today · 45 min this week" (the demo has minutes but no level from its ground); the sketch shows "A2 · 14 min today · 67 min this week".
6. **Pick or assess your level now** appears as a link under Progress while no starting level is chosen (G-06 FR-605); the sketch has no such link.
