# 88 — Sketch: Dictionary pick up and let fall (B-28), round 1

Sketch: https://claude.ai/artifact/9y3VSm1GiB7cRaekzByeFt · source `prototypes/sketches/2026-10-29-dictionary-toggle/index.html` · published 2026-10-29. Questions before it: question-pages/85 (3: both dictionaries).

Versions: **A** a two-part control "Pick up | Let it fall", the current state lit, Undo under the row · **B** one button showing only the action you can take now, flipping after a tap, Undo in a toast · **C** an upright switch, Pick up above and Let it fall below, no Undo (flipping back is the undo).

Questions on the page (blanks take the default): undo for both / Pick up only / none; a wrong answer in the meaning check keeps the leaf / offers "Let it fall anyway"; a state label on each row, yes / no; in A, light the current state / the side you can tap.

Made up for the sketch, not in the spec: C's rule that dropping a word you just picked up skips the meaning check; "Are you sure?" instead of the check for a word with too few other meanings.

## Your pick and comments

Said done 2026-10-29.

- **Pick:** B (one button showing only the action you can take now, flipping after a tap, Undo in a toast). No comments.
- Undo → **for both, for a few seconds** (Pick up, and a fall after a right answer).
- A wrong answer in the meaning check → **offer "Let it fall anyway"** (not the default; today a wrong answer keeps the leaf, G-04 FR-410).
- A state label on each row → **yes**.
- In A, what is lit → default (does not apply to B).

## Applied

RQ-449 (requirements from sketches); G-09 FR-926 (the one-sided button, version B; state labels; the toast with Undo), FR-927 (Undo puts the word back, 15 s, server memory); G-04 FR-410 (Keep it or Let it fall anyway after a wrong answer), FR-411 (Pick up in both dictionaries, also a word not yet the learner's). Built 2026-10-29: regen(drill, client).

## Sketch and build side by side (docs/sketching.md, 6)

Screenshots: `prototypes/sketches/2026-10-29-dictionary-toggle/picked.png` (version B, made-up words) and `built.png` (the dev server's demo learner, 390 px). The rows match: word, meaning, state label, example under it, and one button at the right, filled green "↑ Pick up" or outlined "↓ Let it fall". Small differences: the page is titled "Dictionary" (sketch: "Your dictionary", with "Leaves can fall; words in your ground can be picked up" in its line); the build puts "—" between word and meaning and shows examples upright in quotes (sketch: no dash, examples in italics); the build's buttons are pills, the sketch's rounded rectangles.

