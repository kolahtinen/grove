# 44: Combining p0 and p1 (rejections and conflicts)

Asked in Claude Code during `/pre.combine` on 2026-10-20. Rebuilt on 2026-10-21 from that session's log, because the session ended before this record was written.

## 1. Should either prototype be rejected? A rejected prototype's needs still count; only its requirements stay out of the combined list. (default: neither)

- **Neither**: Combine both.
- **Reject p0**: Only p1's requirements go forward.
- **Reject p1**: Only p0's requirements go forward.

**Answer:** Neither

## 2. Conflict 1/11, the unit of AI work: p0 exchanges a pack with the AI (PR-p0-04, 07; now only the changes, X-p0-01), and the AI returns many exercises at once. p1 gives a prompt per package part (PR-p1-24, 25, 30) and the AI returns texts. How should they combine?

- **p1's prompts, p0's marks**: Prompts per package part; they also carry the learner's marks.
- **Both kinds of prompt**: Content prompts (p1) and a separate 'session summary' prompt (p0).
- **p0's way**: One exchange per session: changes in, new items out.

**Answer:** p0's way

## 3. Conflict 2/11, levels: p0 has a level per skill (listening, reading, writing, grammar) that moves after every item and can be dragged (PR-p0-20, 23, 26, 58). Earlier you said levels should work like p1's: one estimated level from known words (PR-p1-64, 269, X-p1-04). How should p0's level requirements come over?

- **p1's level only**: p0-20, 23, 58 not carried; 26 adapted.
- **p1's level + per-skill**: Known-word level overall, plus per-skill levels.
- **p1's level, draggable**: As p1, but the learner can nudge it (p0-23).

**Answer:** last two (p1's level + per-skill levels, and draggable)

## 4. Conflict 3/11, what gets practised again: p0 has three stages per skill, Discover (new), Review (earlier packs' items) and Master (PR-p0-24, 25). p1 practises only words the learner marked for drilling, on a spaced-repetition schedule (PR-p1-36, 175). How should they combine?

- **Stages, Review = drilling**: p0's stages; Review draws on p1's drilled words.
- **p1 only**: No stages; drilling as in p1.
- **Both, side by side**: Stages for exercises, drilling for words.

**Answer:** Stages, Review = drilling

## 5. Conflict 4/11, saving words: in p0 you save words yourself to Heard words and the Reading list (PR-p0-62, 74, 75). In p1, words join your ground automatically unless you mark them, and every met word is in the Dictionary (PR-p1-40, 41). How should they combine?

- **p1's ground + p0's lists**: Ground and Dictionary as p1; saving to Heard words / Reading list is extra.
- **Lists = drilling**: Saving a word to a list means drilling it.
- **p1 only**: No separate lists.

**Answer:** Lists = drilling

## 6. Conflict 5/11, English: p0 shows a translation under every sentence after answering, which can be turned off (PR-p0-41, 104). p1 shows English only on tap and hides it completely above a chosen level (PR-p1-198, 199). How should they combine?

- **p1's rule everywhere**: English on tap; hidden above a chosen level.
- **Exercises vs texts**: After exercises: shown (p0); in texts: on tap (p1).
- **p0's rule everywhere**: Shown after answering, can be turned off.

**Answer:** p0's rule everywhere

## 7. Conflict 6/11, feedback on difficulty: p0 marks each item too hard, just right or too easy, for the AI (PR-p0-72). p1 rates each text on five buttons, and that changes the share of known words (PR-p1-33, 172, 200…203). How should they combine?

- **p1's five buttons**: One rating; it steers grove and goes to the AI.
- **Both**: Five buttons for texts, three marks for exercises.
- **p0's three marks**: Simpler; the AI adjusts.

**Answer:** p1's five buttons

## 8. Conflict 7/11, explanations: p0 flags a word for the AI to explain in the next exchange, with a reason and a note, and the explanation then appears in the word's menu (PR-p0-67, 68, 69). p1 gives an immediate prompt: 'Explain with AI' for a pattern, or an AI prompt for an unknown word's meaning (PR-p1-74, 230; grammar explanations in the Dictionary). How should they combine?

- **Flags in the next exchange**: p0's way; fits the session exchange from conflict 1.
- **Both**: Flag for later, or ask right now.
- **Immediate only**: p1's way.

**Answer:** Both

## 9. Conflict 8/11, grammar colours: p1 colour-codes each grammar pattern in its own colour inside sentences (PR-p1-219). p0 shows all patterns in one pink colour (PR-p0-102; token --gpk in Appendix A). How should they combine?

- **p0's single pink**: One pattern colour, as in the forest look.
- **p1's colour per pattern**: Each pattern its own colour.
- **Pink, own colour on tap**: Pink in texts; its own colour in the Dictionary and on tap.

**Answer:** p0's single pink

## 10. Conflict 9/11, speech speed: p0 offers 'natural' (0.95×) and 'slow' (0.7×) (PR-p0-31). p1 starts at normal speed (1×) and has slower/normal (PR-p1-93, 204). Which?

- **Normal 1× and slow 0.7×**: p1's normal, p0's slow.
- **p0's 0.95× and 0.7×**: As p0.

**Answer:** neither, have a slider in stead

## 11. Conflict 10/11, retiring words: p0's retire check asks, once lists are big, whether you'd still know a word in a year, and retired words stop appearing in Review and Master (PR-p0-80, 81). In p1, words in the ground never fade and drilling ends when it succeeds (PR-p1-173, 210). With 'lists = drilling' (conflict 4), how should they combine?

- **Retire = join the ground**: A retired drilled word joins the ground.
- **Drop the retire check**: p1's drilling success covers it.
- **Keep both**: Retire check and drilling success.

**Answer:** Retire = join the ground

## 12. Conflict 11/11, content kinds: p1 makes texts (story series, dialogues, packages; reading and listening; PR-p1-29–31). p0 makes exercises for four skills (listening and reading items with questions, long texts, writing tiles and gaps, grammar cards and exercises; PR-p0-30–52). With one exchange per session (conflict 1), what does the AI return?

- **Both in one exchange**: Texts (p1) and exercises (p0) together.
- **Texts first, exercises from them**: The AI writes texts; exercises are made from those texts.
- **p0's exercises only**: Exercise items; p1's series and packages stay out.

**Answer:** Texts first, exercises from them

