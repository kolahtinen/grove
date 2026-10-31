# 92 — Sketch: Adding texts, round 1

Sketch: https://claude.ai/artifact/9858tDrn81wA1ZWbCFG6AZ · source `prototypes/sketches/2026-10-31-adding-texts/index.html` · published 2026-10-31. Questions before it: question-pages/91 (1).

## Your pick and comments

Said done 2026-10-31. No comments.

- **Pick:** A (a chooser, then a page per way; library previews in a sheet over the list; the AI way and Your own text one step per screen with "Step 3 of 5", a bar, "Done so far", a green line after every action saying what happened and what's next, and Back).
- 1. After + Add in the common library → **still on the list, with a line saying it was added and Read now** (default).
- 2. After a copy, does the AI wizard move on by itself? → **No: it says "Copied" and what to do; you tap to go on** (default).
- 3. The ways of asking your AI → **hidden under "How grove asks", the recommended one chosen** (default).
- 4. Your own text's AI word check → **right after Save, as step 2 on the same page** (default).
- 5. Something half done → **a line on that way, "Under way: step 4 of 5", with Continue** (default).
- 6. Beta badges → **keep them** (default).

## Applied

RQ-460…RQ-462; G-09 FR-916 (preview sheet; Added with Read now; the level filter at the learner's level), FR-918 (the chooser, Under way with Continue, ‹ Add a text), FR-919 (one step per screen, five fixed steps, unusable answers never hang, the next paste answers the fix-it); G-03 FR-318 (three steps, the word check at once), FR-321. Build: regen to follow.

## Sketch and build side by side (docs/sketching.md, 6)

Screenshots at 390 px, light look, in `prototypes/sketches/2026-10-31-adding-texts/`: `picked-add.png`, `picked-library.png`, `picked-ai.png`, `picked-own.png` (version A, its made-up data) and `built-add.png`, `built-library.png` (the preview sheet open), `built-ai.png`, `built-own.png` (the dev server's reviewer).

The chooser matches: "Add a text", the line under it, three big choices with icon, name, Beta badges, explainer and ›; the common library's preview sheet over the list with + Add to your library and Read now; the AI way and Your own text one step per screen with "Step i of n" and the bar. Differences:

1. **The choices** have no facts line ("Ready now · A1 to C2 · Free", "About 5 minutes · 3 texts each time · Your topic", "About 3 minutes · Reading only · Private"); the explainers are the spec's (FR-918) words.
2. **Texts from your AI, Your AI step**: the AI and its version are two drop-downs (as before), not the sketch's chips; the step's heading is "Your AI" (sketch: "Choose your AI"); How grove asks folds under the drop-downs once an AI is chosen. The reviewer had no AI chosen, so the shot shows step 1 where the sketch showed step 2 (Setup, with Done so far).
3. **The step counter** reads "Step 1 of 5" in sentence case (sketch: capitals); Back reads "‹ Back" (sketch: "‹ Back: choose your ai").
4. **Your own text**: the main button is "Save" (sketch: "Save and go on"); there is no "34 words · about 6 new to you" line before saving; the list of own texts is its own card under the step.
5. **The library rows** keep the level select ("Show levels up to") with "Your level is A1, so texts up to A1 show first." under it; the sketch had level chips. A row's + Add sits under its title on phones.
