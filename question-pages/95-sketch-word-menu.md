# 95 — Sketch: Word menu, round 1

Sketch: https://claude.ai/artifact/L7h8CGG7WLssPYV7aR4CXz · source `prototypes/sketches/2026-10-31-word-menu/index.html` · published 2026-10-31. Questions before it: question-pages/91 (4).

## Your pick and comments

Said done 2026-10-31. No comments on the versions.

- **Pick:** A (the meaning first, then one named action, "↑ Pick up Bröden" or "↓ Let it fall", with a line saying what it does; patterns and the phrase as folded rows, each with its own "Pick up this pattern" / "Pick up this phrase"; Explain and Report sentence a quiet row of links with a hint each; a name gets one line).
- 1. To remember on a ground word duplicates Pick up → **no To remember in the menu at all** (not the default), with the note "to remember is the same thing as pick up, no?". Answered in Claude Code: yes, in the menu they do the same thing (both make the word a drilled leaf, due now); the only extra To remember did was switching drilling off on a leaf without letting it fall, which goes. Read as: the menu offers Pick up on a ground, new or unmarked word and Let it fall on a drilled leaf; the marking step after a text (G-04 FR-401) keeps its To remember switches.
- 2. After Pick up or Let it fall → **the menu stays open, the button turns over, a message with Undo for 8 s** (default).
- 3. A new word in a grove text → **offers ↑ Pick up** (default).
- 4. A pattern's explanation → **one short line, with More for the full text and an example** (default).
- 5. What closes the menu → **Esc, ✕ and a tap outside** (default).
- 6. A name's menu → **"A name — grove never counts it as new", Report sentence, and "Not a name?" to report it as a mistake** (not the default).

## Applied

RQ-456; G-03 FR-305 (the menu as version A), FR-315 ("not a name"); G-04 FR-409 (no To remember in the menu), FR-411 (Pick up on ground, new and unmarked words, phrases and patterns). Build: regen to follow.

## Sketch and build side by side (docs/sketching.md, 6)

Screenshots at 390 px, light look, in `prototypes/sketches/2026-10-31-word-menu/`: `picked-menu.png`, `picked-name.png` (version A, "Bröden" and the name "Lina") and `built-menu.png`, `built-name.png` (the dev server's reviewer on "Brevet i väskan": "är" with a ladder pattern opened, and the name "Elsa"; whole-page shots, so the menu sits over the text with the page below it).

The menu matches version A: the green head with the word, ▶ and ✕; the state chip and times met; the meaning large with "Dictionary form"; one named ↑ Pick up <word> with its line; "Grammar in this word" with folded rows, level and its own Pick up this pattern; Explain and Report sentence as a quiet row with hints; "Esc, ✕ or a tap outside closes it."; a name shows one line, Report sentence and Not a name?. Differences:

1. **The word in the head** is a little smaller than the sketch's.
2. **Times met**: a ground word that grove counts as known but has no item yet says "first time you meet it" (the sketch's "met 2 times" needs an item with uses).
3. **The opened pattern row** shows its short line with More inline; the example (the sentence with the word marked) shows only after More.
4. **Not a name?** has a question-mark icon and the hint "Tell grove it is a word here" (the sketch had no hint there).
