# 76 — Confirming the provisional decisions (PD-01…28)

Prepared 2026-10-27 while the owner was away; asked one at a time in Claude Code when they return. Background and sources for each: [docs/provisional-decisions.md](../docs/provisional-decisions.md). The four that need the owner come first, then the provisional ones by area; the ones research already agreed with are one quick question at the end. **Answers are blank until asked.**

## Needs you

### 1. A session runs out of things to do before its time is up. What should fill it? (PD-28; default: more texts, re-reading, listening again)

- **More texts, then re-read and re-listen (Recommended)**: on the demo account, 10 and 20 minutes then plan 8.0 and 16.6 minutes (as written: 4.3).
- A shorter session that says so: "only 4 minutes of practice today".
- Review words that aren't due yet: changes G-04's schedule.

**Answer:**

### 2. Icons only on the Home tiles, or a one-word label under each? (PD-08; default: icons only, labels if a new person hesitates)

- **Icons only, test with one new person (Recommended)**: as asked; `p14-grid.png`.
- Labels from the start: `p14-grid-labels.png`.

**Answer:**

### 3. Should grove check 5 untapped words after each starting text? (PD-22; default: yes)

- **Yes, 5 words, about 30 s a text (Recommended)**: wrong ones become leaves.
- No check: simpler; the ground may hold words the learner doesn't really know.

**Answer:**

### 4. The flaky browser tests: may tests that depend on an account's state start their own learner? (PD-25; default: yes, one recorded exception)

- **Yes, as one recorded exception (Recommended)**: what the tests check doesn't change.
- No: keep the tests and rerun when one fails.

**Answer:**

## Sessions

### 5. Reading speed for planning: 70 words a minute below B1 and 100 from B1, or 100 for everyone? (PD-02)

- **70 below B1, 100 from B1 (Recommended)** · 100 for everyone (as clarified)

**Answer:**

### 6. Should the speech start at 0.9× for learners below B1? (PD-03)

- **0.9× below B1, 1× from B1 (Recommended)** · 1× for everyone

**Answer:**

### 7. What share of known words should Short, Medium and Long pick? (PD-04)

- **Short 90–94%, Medium the target (95%), Long 98%+ (Recommended)** · Other bands

**Answer:**

### 8. What should the session summary show? (PD-05)

- **Minutes, texts, words reviewed, words that fell, days practised this week; no streaks or goals (Recommended)** · Without days this week · With a streak

**Answer:**

### 9. Are these empty and edge states right? (PD-06: nothing due → New texts and re-reading; nothing fits → Review and Master only; one session per shared account)

- **As drafted (Recommended)** · Change something

**Answer:**

## Home and navigation

### 10. Tiles for keyboards and screen readers: should opening a tile move focus to its panel? (PD-07)

- **Yes; Esc or ✕ closes and returns focus to the tile (Recommended)** · Leave focus on the tile

**Answer:**

### 11. Tap targets and reduced motion: ☰, ✕, chips and minute choices at least 44 px; with reduced motion tiles open instantly? (PD-10, PD-11)

- **Both (Recommended)** · Change something

**Answer:**

## The look

### 12. Palette 14 adjusted for contrast: the re-spaced mode browns (`p14-modes-aa.png`) or the chosen ones (`p14-modes-final2.png` B, which fail as small text)? (PD-12)

- **Adjusted (Recommended)** · As chosen, bigger chip text so 3:1 is enough · Pick other browns together

**Answer:**

### 13. Words in texts: To remember in teal-green with a dotted underline, fallen words plain? (PD-13)

- **Yes (Recommended)** · Another colour for To remember · Keep a colour for fallen words

**Answer:**

### 14. Right, wrong and Beta colours from the same palette (green `#3C7738`, your reddish `#A14646`, chestnut Beta)? (PD-14)

- **Yes (Recommended)** · Change something

**Answer:**

### 15. The oak logo and animation in palette 14's bark, greens and caramel? (PD-15)

- **Yes (Recommended)** · Later, with the oak

**Answer:**

## Terms

### 16. Terms screens: the Agree screen says what pressing it means, has Back and a link to the whole terms; grove stores the terms version? (PD-16)

- **All of it (Recommended)** · Without the stored version

**Answer:**

## Texts, the library and starting texts

### 17. The library inside Texts: by topic, with a level filter? (PD-17)

- **By topic with a level filter (Recommended)** · By level only · By topic only

**Answer:**

### 18. The library for 1 November: your lessons only, published with Publish to library on your own texts, marked "grove lesson"? (PD-18)

- **Yes (Recommended)** · Change something

**Answer:**

### 19. Before learners can share: Report becomes a proper notice with a reply (EU DSA)? (PD-19, for later)

- **Yes, noted for later (Recommended)** · Decide later

**Answer:**

### 20. Starting texts: five texts A1–C1, about 120 words each, suggest stopping after a text with more than 10% tapped? (PD-21)

- **Yes (Recommended)** · Fewer or longer texts · Change the stop rule

**Answer:**

### 21. Who writes the starting texts: Claude drafts from Kelly-list words, the build checks them, you read them once? (PD-23)

- **Yes (Recommended)** · You write them · Your own AI writes them

**Answer:**

## Order and process

### 22. Order inside the new Home: palette → grid and menu → Practise → Texts → By skill → Just one mode? (PD-27)

- **Yes (Recommended)** · Another order

**Answer:**

### 23. The ones research agreed with, and the two "nothing to change": OK as they are? (PD-01 session order, PD-09 ☰ menu, PD-20 copyright check stays, PD-24 quick tunnel, PD-26 prompt sizes stay)

- **All fine (Recommended)** · Go through them one by one

**Answer:**

### 24. The G-09 plan (drafted while you were away) proposes one shared sign-in helper for the browser tests, since the terms screens change the sign-in steps in 9 test files. OK? (plan: Tests whose spec rules change)

- **Yes, one helper (Recommended)** · Change each file's own steps

**Answer:**

### 25. The demo's six drilled words were "with both kinds of marks" (G-07 FR-704); with To read gone (RQ-415, which you confirmed on question-pages/73) they are now all To remember, and FR-704 says so. OK? (built 2026-10-27 with addendum 003)

- **Yes (Recommended)** · Keep some demo words marked To read (would contradict RQ-415)

**Answer:**

### 26. My own texts "always reachable from the top bar" (FR-321) doesn't fit at 360 px next to Dictionary, Sign out and ? (G-08 FR-807). For now the top-bar link shows only above 400 px; on phones it's on Home. OK until G-09's ☰ menu? (built 2026-10-27)

- **Yes, until the ☰ menu (Recommended)** · Drop the tagline on phones to make room · Replace Dictionary in the bar with Own texts

**Answer:**

### 27. The G-09 work built on branch `g09-sessions` (not in main): the sessions server and planner as FR-905 says now, the session page with the mode banner, Settings and Account pages. Bring it into main once 1 (PD-28), 5 (PD-02) and 12 (PD-12) are answered and applied?

- **Yes, after those answers (Recommended)** · Look at it first (a dev server from the branch) · Start G-09 again from the confirmed decisions

**Answer:**

## Applied

(filled in after the session: which specs and addenda changed)
