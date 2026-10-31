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
