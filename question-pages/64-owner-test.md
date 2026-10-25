# 64: Decisions from the owner's first test

Asked on 2026-10-25 in Claude Code, after the owner's notes ([notes](../docs/reviews/2026-10-25-owner-test.md)). Deadline: 2026-11-01.

## 1. O-01: what needs work in the animation?

Why asked: "the animation needs some work" didn't say what.

- **A:** looks too plain
- **B:** message unclear
- **C:** too long or in the way
- **D:** timing or motion off

**Answer:** A, with the owner's vision: the tree is an oak, not a spruce. The camera zooms in to a single leaf that shakes and starts falling, zooms out to show the leaf fall, then zooms in to ground covered with leaves, where the falling leaf joins them. Expect a couple of tries.

## 2. O-03: how should a new sign-in be made to read the terms better?

Why asked: "enforce reading the terms better" didn't say how.

- **A:** short summary, Agree unlocks after scrolling to the end
- **B:** full terms, Agree unlocks after scrolling to the end
- **C:** tick each key point
- **D:** a short quiz

**Answer:** C, changed by the owner's note: "one term section at a time appearing at the screen, no ticks."

## 3. O-03 follow-up: how does the learner move on and agree?

Why asked: one section at a time with no ticks still needs the agreement and the 13+ confirmation recorded (constitution 3.1).

- **A:** a button per section; the last confirms 13+ and agreement
- **B:** Next on each section, one Agree at the end (confirms 13+ and the terms)
- **C:** as B, but each Next unlocks after about 3 seconds

**Answer:** C.

## 4. O-04: where does the starting-level text come from?

Why asked: the starting check becomes a text where the learner taps the words they don't know; every untapped word joins the ground and nothing else does.

- **A:** ready texts built into grove, one per level A1–C1, getting harder; tap unknown words, then go on or stop
- **B:** pick a level, then one built-in text for it
- **C:** the first copy-paste prompt asks the learner's AI for a placement text

**Answer:** A. Untapped words join the ground, tapped ones become leaves; no Kelly level lists go into the ground; "I'm a complete beginner" still gives an empty ground; too many taps → grove suggests stopping.

## 5. O-10: how should every word get a meaning?

Why asked: "meaning missing" shows for ground words (starting level, demo); only new words get a meaning from the AI.

- **A:** bundle an open Swedish–English dictionary (Wiktionary, CC BY-SA) plus the AI's meanings in context
- **B:** every prompt also asks for meanings of words without one
- **C:** an automatic separate meanings round

**Answer:** none chosen; the owner's note: "demo content should have meanings ready." Follow-up on question 6.

## 6. O-10 follow-up: meanings for a real learner's ground words?

Why asked: the demo's meanings will be made in advance; the starting texts' untapped words also go to the ground.

- **A:** everything grove ships (demo, starting texts, ready lessons) is prepared with a meaning for every word; later words get theirs from the learner's AI, and missing ones are asked for automatically in the next prompt
- **B:** as A, plus an open Wiktionary list as a fallback
- **C:** demo only

**Answer:** A.

## 7. O-08: what should ready lessons be now?

Why asked: the full shared library (RQ-128 onward) was left out of the first build.

- **A:** the owner's library: the owner publishes texts made with their own AI; all learners can read them
- **B:** lesson files in the build, like the demo
- **C:** later, after 1 November

**Answer:** none chosen; the owner's note: "shared library should be back in the build." Follow-up on question 8.

## 8. O-08 follow-up: how much of the shared library goes in now?

Why asked: the full library also needs the shared word bank and automatic checks, which won't fit before 1 November with everything else.

- **A:** learners share per text (RQ-134, 137, 143); the owner approves each shared text instead of automatic checks (RQ-129, 236, 375 reduced); library page by level (RQ-237, 238); add to my texts (RQ-239); report, delete, source kept (RQ-135, 136, 140, 142); the owner's own lessons go in the same way
- **B:** only the owner's lessons now; learner sharing after 1 November
- **C:** everything including the word bank, moving other items past 1 November

**Answer:** A. Later: the shared word bank, automatic checks, and suspension and ban as automatic rules (the owner handles them by hand).

## 9. O-12: when is the "My own texts" page reachable?

Why asked: the note said it is reached "after generating the whole package".

- **A:** always, from Home and the top bar; after a finished package Home also suggests it
- **B:** unlocked after the first finished package
- **C:** only offered as the next step after each package

**Answer:** A.

## 10. O-19: does the "To read" list go for Latin-alphabet languages?

Why asked: confirm the reading of "languages without special characters like Chinese do not have a reading list".

- **A:** yes: Swedish has one list (To remember); To read stays only for languages with their own script
- **B:** something else

**Answer:** A. This also settles O-18: a word being learned is simply in To remember.

## 11. O-15: what happens to the yellow dot?

Why asked: the dot marks a form that could belong to more than one dictionary word; nothing explains it.

- **A:** remove it; the word menu shows the other meanings
- **B:** keep it and explain it with a key and in the menu
- **C:** mark it differently

**Answer:** A.

## 12. O-17: how does the learner see the translation once the "English" button is gone?

Why asked: the per-sentence English on/off button goes.

- **A:** tap a sentence to show its translation; a setting to always show them
- **B:** the on/off choice moves to settings
- **C:** always shown, smaller

**Answer:** none chosen (question stopped); the owner's words: "the english translation for the whole text can be shown below the other text, if a button is pressed. the user should be able to decipher the meaning from individual words." So: no translation under each sentence; one button shows the whole text's translation below the text; the learner works out meaning from the word menu.

## 13. O-09, O-13: how should prompts work for weak and strong AIs?

Why asked: free ChatGPT breaks on today's prompt, which is long mostly because it lists every ground word; some AIs could take a whole package at once.

- **A:** short by default (level, words being learned, the 200 most useful known words, compact format, one part per prompt); an option for a whole-package prompt with the full word list; grove remembers the choice
- **B:** keep the full word list; the learner only chooses parts per prompt
- **C:** the learner names their AI; grove sizes prompts from a built-in table

**Answer:** A, with the owner's note: "shorter, divide the pack more, esp if ai fails checks." So the default part is smaller than today's 3 texts, and when an answer fails grove's checks, the next prompt asks for less (for example one text at a time).

## 14. O-20: what do different texts for Reading and Listening mean for a package?

Why asked: Practise becomes Reading, and Reading and Listening should not use the same texts.

- **A:** each part has texts marked for reading and texts marked for listening (for example 2 and 1); listening texts open audio-first and are written to be heard
- **B:** the same texts; Listening uses texts read some days ago, as review

**Answer:** A.

## 15. O-06: which Home layout?

Why asked: Home is confusing; three mock-ups were shown as screenshots ([A](../docs/reviews/2026-10-25-owner-test/home-a.png), [B](../docs/reviews/2026-10-25-owner-test/home-b.png), [C](../docs/reviews/2026-10-25-owner-test/home-c.png)).

- **A:** a Continue card, four tiles for today (Reading, Listening, Review, Master), a new-texts card with Copy prompt, then links (Library, My own texts, Progress, Settings)
- **B:** Read and Listen lists, word practice, a tab bar at the bottom
- **C:** one big next step, then a short to-do list

**Answer:** A.

## 16. What can wait until after 1 November?

Why asked: the decisions add up to about 8½ days of work; about 6 are left.

- **A:** the oak animation
- **B:** learner sharing (the library starts with the owner's lessons only)
- **C:** the whole-package prompt
- **D:** the low review findings except 4 and 8

**Answer:** B only. The rest stays in; the work is done in order of value, so whatever is last risks slipping past 1 November.
