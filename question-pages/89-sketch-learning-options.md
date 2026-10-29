# 89 — Sketch: Learning options (B-24, B-25, B-26), round 1

Sketch: https://claude.ai/artifact/4dHCj1pU4UfQmr7UMBuob9 · source `prototypes/sketches/2026-10-29-learning-options/index.html` · published 2026-10-29. Questions before it: question-pages/85 (1: several ticked skills share the time, in turns). Example content from the draft `content/learning/`.

Versions: **A** a full Options page with tick boxes and a summary card; Words as a list of next words and a phrase spotlight, Grammar as pattern of the day then Spot it · **B** a sheet-style page with skill chips and a split bar; one word per card, learn and spot in one Grammar exercise · **C** plan first: the session as a numbered list that changes as you tick; example-first Words, spot-first Grammar.

Questions on the page (blanks take the first option): the Options page's top link (‹ Discover / ‹ Home); where a ticked skill's time goes when it has too little (to the others / filled as today / shorter); when Discover's words become leaves (on Pick up / all / never); Spot it (a tap on any word of a place counts / every word).

Read as: Mix keeps Review first at 40% and splits the rest among the ticked skills; turns alternate per exercise of about 2½ minutes.

## Your pick and comments

Said done 2026-10-29.

- **Pick:** B (a sheet-style Options page with skill chips and a split bar; one word per card; learn and spot in one Grammar exercise). No comments.
- The Options page's top link → **‹ Home** (not the default).
- A ticked skill with too little for its share → **its time goes to the other ticked skills**.
- Words and phrases shown in Discover become leaves → **only on + Pick up**.
- Spot it → left blank with a note: "what do you mean by 'finding a place'?" Explained in Claude Code (a place is where the pattern shows, sometimes several words, e.g. "har ätit") and asked again:

### Q4 again. A place can be several words. When you tap, what counts as finding it? (default: any of its words)

- Any of its words (Recommended)
- Every word of it
- Mark it by dragging

**Answer:** (Other) "any of its words, but have the word menu have a separate 'patterns' section that lists any patterns it is part of." Read as: a tap on any word of a place finds it; and the word menu (G-03 FR-305) gets its own **Patterns** section listing every grammar pattern the tapped word is part of (today patterns share a list with phrases only when the AI named them).

### F1. Discover's Words and Grammar would show the draft content in content/learning (no Swedish speaker has read it). What should grove use? (default: approve as it stands)

- Approve as it stands (Recommended): Report on each item reaches the owner; fixes as read
- Approve after the README's list is checked
- Not yet: Words and Grammar say "coming soon"

**Answer:** Approve as it stands.


## Applied

RQ-450…RQ-455 (requirements from sketches); G-09 FR-903 (the Options page, version B: a sheet with ‹ Home and ✕, skill chips in a 2×2 grid ticked in any number, none = all, 5 · 10 · 20 · 30, Harder questions only on Review, the split bar with its legend), FR-905 and FR-906 (the ticked skills share the time equally in turns; a short share goes to the other ticked skills, texts only after Practise without; Mix keeps Review first at most 40%; the new exercises' durations), FR-922 (the Options page → Home), new FR-928 (Words: next words one per card, I know it / + Pick up; the phrase spotlight with its meaning check), FR-929 (Grammar: the pattern of the day, Learn then Spot it; a tap on any word of a place finds it; earlier patterns spotted after), FR-930 (the approved `content/learning/` built into the server and imported at start-up, migration 020), FR-931 (Report on each item, listed for the owner by `npm run reports:show`); G-03 FR-305 (the word menu's own Patterns section, with the text's patterns and grove's grammar ladder's). Contract, data model (migration 020), plan and `docs/modules.md` (new module `learning`) updated.

## Sketch and build side by side (docs/sketching.md, 6)

Screenshots at 390 px, light look, in `prototypes/sketches/2026-10-29-learning-options/`: `picked-options.png`, `picked-words.png`, `picked-grammar-learn.png`, `picked-grammar-spot.png` (version B, its made-up data) and `built-options.png`, `built-words.png`, `built-grammar-learn.png`, `built-grammar-spot.png` (the dev server's reviewer, Discover with Words + Grammar, 10 minutes).

The Options page matches: the sheet over blurred tiles with its handle, "‹ Home", the title and ✕, the 2×2 chips with ✓, the 5 · 10 · 20 · 30 control, "Your 10 minutes · Words + Grammar, in turns", the split bar with its legend, and Start · 10 min. Differences:

1. **Icons**: grove draws its own skill icons (Words a speech bubble, Grammar a branching stem; Reading and Listening as in the sketch); the sketch had a leaf for Words and a bracket for Grammar. The ✕ is a plain icon, not a boxed button.
2. **The session line**: the build keeps its card with the line and bar and has no "Words + Grammar, in turns" line under it; the sketch shows them bare with that line.
3. **The exercise card**: the build has no kicker line with the skill's icon ("Words · Next words at your level") and no "Up next: …" line; the minutes chip says "2 min" / "5 min" (whole minutes, FR-912), not "≈2½ min".
4. **Words**: the part of speech reads "en-word" (sketch "en"); Play is a full-width button in both; each card has a small **Report** at the bottom right (FR-931; not in the sketch). The word card shows a real A1 word for the reviewer (sketch: A2).
5. **Grammar**: the title of the pattern is larger in the build; the spot text after Check keeps every word as a (now inactive) button; the instruction ends with the content's own "how to spot" sentence (sketch: a short hint), so it is longer.
6. **Spot it**: the dashed outline is drawn around each missed place's words as in the sketch.
