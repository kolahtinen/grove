# Sketching new screens

The light way to try a screen before its spec changes (note B-29; decided on [question-pages/84](../question-pages/84-ui-sketching.md), 2026-10-29). A sketch is a clickable page you look at on your phone, choose from and comment on; the spec is then written from the version you pick, and grove is regenerated from the spec as always.

## When

- Every visible change to a screen gets a sketch (84: 1, 2). Text-only changes, bug fixes and a single control added, removed or renamed skip it (48; question-pages/86, F1). Deadlines don't change this (49).
- It starts from a note of yours (B-…): Claude offers the sketch (15). Related notes are grouped into one sketch (23).

## The loop

1. **A few questions first** (16), asked in Claude Code, about what the sketch can't decide by itself.
2. **The sketch**, built by a background helper while other work goes on (21), the first version within about 30 minutes (17), about an hour of Claude's work at most (47). Up to three sketches at a time (22).
3. **You look** by opening its link on your phone (30), **pick a version** and **comment in your own words** on the sketch page (19, 25, 32). No ratings and no comments pinned to elements (26, 27). The page can also hold multiple-choice questions; blanks take the default (28, 31). Say "done" in Claude Code when finished (29).
4. **Up to three rounds** of changes, then decide (18).
5. **Claude writes the spec change** from the picked version (20): acceptance scenarios that describe it, which become the browser tests (34). Small UI changes need no addendum, only the spec edit and `/regenerate` (39); a sketch that reveals a new need gets an addendum as now (40).
6. **Before you test the build**, Claude shows the picked sketch and the built page side by side as screenshots and lists the differences (36).

## What a sketch is

- One clickable HTML page per sketch (7), for one flow of up to about five screens (14), that clicks through the flow with nothing saved (9).
- It looks like grove: the colours, font and sizes are copied from `public/assets/grove.css` each time it is made (8, 42), from the parts gallery below (37).
- **Two or three versions** of the idea, as tabs A, B, C on one page (3, 13).
- **Phone first**, with a switch to the desktop width (11).
- **Every screen in four states** as tabs: normal, empty, error, loading (12).
- **Made-up example data only**, written into each sketch (10; 84 follow-up 2: no export of the demo learner).
- At the top, the note(s) it answers and the questions it settles.

## Where it lives

- Source in `prototypes/sketches/<yyyy-mm-dd>-<slug>/index.html` (4: `prototypes/` is reopened for sketches only); published as a private page on claude.ai for you alone (6, 41, 45), named "Sketch: <what it is>" (44).
- **Never copied into the build** (33; 84 follow-up 1): the picked sketch is kept as the look to match, and grove is regenerated from the spec. "Can grow into code" (5) means it grows into the spec, not into grove's files.
- Each sketch has its own `question-pages/NN-sketch-<slug>.md` with its link, its questions, your pick and comments (24). Old sketches are kept, dated and linked from that page (38). The picked version's screenshot is kept beside it in `prototypes/sketches/<…>/picked.png` and linked from the spec requirement it led to (35).
- **The sketch index** (46): one private page listing every sketch with its state (questions, waiting for you, picked, in the spec, built).
- **The parts gallery** (37): `prototypes/sketches/parts/index.html`, one page with grove's buttons, tiles, chips, cards, bars and banners in both looks, kept up to date with `grove.css`; every sketch is built from it.

## First sketches

All three at once (50): **B-24 + B-25 + B-26** (the Options page, ticking several skills, Words and Grammar in Discover), **B-27** (the Progress page) and **B-28** (the Dictionary's Pick up / Let it fall button).
