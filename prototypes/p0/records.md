# Prototype records: grove / p0

What the prototype taught, besides the requirements. Used to find needs, in each round's short pass and in phase 2 (also for rejected prototypes).

## Features added that weren't asked for

Also listed as implicit requirements in `requirements.md`.

| Round | Feature | Kept or removed |
|---|---|---|

## Rejected, and why

| Round | What | Why |
|---|---|---|

## Technical problems and dead ends

| Round | What happened | What it shows |
|---|---|---|
| import | Tried on 2026-10-20 with your pack 15 (Japanese, 'A weekend at a hot spring') in headless Chromium, both looks: home, choosing a skill, a reading item, the word menu, the listening player, Patterns. No page errors. Speech couldn't be heard in a headless browser. Screenshots in prototypes/p0/screenshots/. | The code reading holds; the look matches PR-p0-86…114. |
| import | Pack 15 is 181 KB as a file and 583 KB of text unpacked. | A whole pack is far too big for a chat AI to rewrite; see F-p0-01. |
| import | All progress lives in a file the learner must download after each session (the page warns before closing). | Forgetting to download loses a day's work; the learner juggles files between grove and Claude. |
| import | The pack file is scrambled with a fixed key ('kikitori-v1') and compressed. | It keeps the file from being edited by hand, but it isn't protection: anyone with the page can read it. |
| import | Lists are capped at 1,000 words; the retire check only starts at 500. | A limit from keeping everything in one file. |
| import | Unused code: an 'Explain' button built for each list row but never shown; empty functions renderInText and paintSnd. | Leftovers of features that were dropped or moved into the word menu. |
| import | The file name and scrambling key say 'kikitori' (Japanese for listening comprehension). | It began as a Japanese listening trainer and grew into grove. |

## Possible user needs

| Round | [Who] needs [what] | From |
|---|---|---|
| import | Learners need to tell the AI what they didn't understand. | PR-p0-67, 69, 71 |
| import | Learners need their progress kept without having to remember to save it. | PR-p0-05, 06 |
| import | Learners need practice in listening, reading, writing and grammar, each at its own level. | PR-p0-20, 27 |
| import | Learners need to hear the language as it's spoken where they'll use it. | PR-p0-14 |
| import | Learners need to notice they're improving. | PR-p0-55…59 |
