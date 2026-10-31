# 93 — Sketch: Exercises, round 1

Sketch: https://claude.ai/artifact/DvqHneaxUjjY9MWpMq8pSN · source `prototypes/sketches/2026-10-31-exercises/index.html` · published 2026-10-31. Questions before it: question-pages/91 (2).

## Your pick and comments

Said done 2026-10-31. No comments.

- **Pick:** B (during a session grove's top bar gives way to a slim bar with ✕, one segment per exercise and "4/10"; the card starts with the skill and the task; a fixed bottom bar holds the feedback and the one button, Check / Next / Done).
- 1. A text in a session opens → **in the session's own frame** (default).
- 2. A listening text in a session starts → **with Play first, the text hidden** (default).
- 3. Read again / listen again ask → **nothing: read or listen, then Done** (default).
- 4. After a wrong answer → **one more try, then show it** (not the default).
- 5. Going back to a finished exercise → **yes, to look again, answers kept as they were** (not the default; changes G-09 FR-904, "only on or leave").

## Follow-ups (Claude Code, 2026-10-31)

### F1. "One more try": if the second try is right, how does grove count the answer? (default: still a wrong answer)

- Still wrong (Recommended): the retry is for learning; the word is scheduled as missed
- Half right: the gap stays as it is
- Right

**Answer:** Still wrong.

### F2. Going back to a finished exercise in version B: how? (default: tap its segment in the top bar)

- Tap its segment (Recommended): the exercise opens as you left it, answers shown, nothing can be changed, with a bottom button "Back to 4 of 10"
- A ‹ Previous button
- Both

**Answer:** Tap its segment.

## Applied

RQ-457…RQ-459; G-09 FR-903 (Harder questions only: one bar part; messages never cover buttons), FR-904 (start screen, look again, summary, no Resume for an unstarted plan), FR-905 (never "0 min"), FR-912 (the kicker line replaces the mode banner), FR-928, FR-929 (steps, not tabs; punctuation; outlines), new FR-932 (the shared frame, right/wrong, one more try counted wrong, Recall), FR-933 (texts inside the session; again without questions). Build: regen to follow.

## Sketch and build side by side (docs/sketching.md, 6)

Screenshots at 390 px, light look, in `prototypes/sketches/2026-10-31-exercises/`: `picked-start.png`, `picked-review.png`, `picked-reading.png`, `picked-summary.png` (version B, its made-up 20-minute Mix) and `built-start.png`, `built-review.png`, `built-reading.png`, `built-summary.png` (the dev server's reviewer, a 10-minute Mix of all skills).

The frame matches: grove's top bar gives way to the slim bar with ✕, a coloured segment per exercise and "i/n"; the start screen lists the exercises with skill icons and times; the card starts with the kicker line ("Review · Pick the meaning … 20 s") and one line of what to do; the fixed bottom bar holds "Pick an answer" over a disabled Next; the summary shows only lines above 0 with Back to Home and Another 10 minutes. Differences:

1. **The asked word** is marked with a soft background and an underline; the sketch also made it bold.
2. **A reading text** shows one line of the text per paragraph (as on the text page, G-03), where the sketch ran the text on as one paragraph; its stats line shows the word count only, no "96% known".
3. **The summary** has no closing "Lines with nothing in them are left out" note.
4. **The start screen's list** names a text by its title ("Reading · new text: Den borttappade nyckeln") and calls Grammar "pattern"; the sketch said "new text" and "pattern of the day".
5. **The finished segments** in the summary are coloured by skill as in the sketch; the reviewer's plan had 7 exercises, the sketch 10.
