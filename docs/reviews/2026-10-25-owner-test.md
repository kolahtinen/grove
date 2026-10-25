# Owner's first test of the build (2026-10-25)

The owner tried the first build locally (`npm run dev`, fake Firebase) and sent these notes. Each change goes through the specs and `/regenerate` (constitution 1.1); decisions on question-pages/64 onward. Deadline 2026-11-01.

**Kind:** *fix* = the build misses its own spec; *change* = a spec rule changes; *new* = a new requirement (an addendum if it is risky, `/pre.addendum`); *unclear* = needs a question first.

| # | Note (owner's words, shortened) | What it touches | Kind | Decision |
|---|---|---|---|---|
| O-01 | The animation needs some work. | G-08 FR-801/802 (`grow.mjs`) | unclear: what's wrong with it | oak, not spruce; zoom to one leaf that shakes and falls, zoom out to the fall, zoom in to leaf-covered ground where it lands; a few tries expected (q-p 64/1) |
| O-02 | The grove logo should be a home button. | G-08 FR-802 (logo tap plays the animation) | change | logo goes Home; replay stays on the help bubble |
| O-03 | A new sign-in should enforce reading the terms better. | G-01 FR-011, FR-025 | unclear: how | one terms section per screen, Next unlocks after ~3 s, one Agree at the end confirms 13+ and the terms (q-p 64/2, 3) |
| O-04 | Starting level: one text with "click all the words you don't know or don't know that well"; every word not clicked joins the ground, and nothing else (the demo added about 5000 words). | G-06 FR-601…610 (30-word sample, then the level's Kelly words go to the ground) | change | ready texts A1–C1 getting harder; tap unknown words; untapped → ground, tapped → leaves; no Kelly lists in the ground (q-p 64/4) |
| O-05 | The ? button should open a bubble, not a new page. | G-08 (help page `how.html`) | change | help opens as a bubble on the page |
| O-06 | Home is a bit confusing: make example pages and show screenshots. | Home layout (G-01…G-08) | change: mock-ups first | layout A: Continue card, Today tiles, new-texts card, links (q-p 64/15; [mock-ups](2026-10-25-owner-test/)) |
| O-07 | Copy prompt should say "Copied to clipboard". | G-02 copy button | change | "Copied to clipboard" after copying |
| O-08 | Ready lessons from material the owner has generated. | shared library (scope) | new | shared library back: learners share, the owner approves each text, library page by level, add to my texts, report and delete; the owner's lessons the same way; word bank and automatic checks later (q-p 64/7, 8) |
| O-09 | ChatGPT's free version breaks on a prompt as long as the current one. | G-02 prompt length; T141 real-AI check | change | short prompt by default, smaller parts, smaller still after a failed check (q-p 64/13) |
| O-10 | Gemini works better, but every word says "meaning missing": not acceptable. | G-02/G-03 meanings (separate meanings prompt) | change | everything grove ships has meanings for every word (demo, starting texts, lessons); missing AI meanings asked for automatically (q-p 64/5, 6) |
| O-11 | The copy-prompt part doesn't need to show the prompt; the button is enough. | G-02 prompt screen | change | prompt text hidden; the Copy button is enough |
| O-12 | "Your own texts" is hard to find: its own page, reached after generating the whole package. | G-03 own text (on Home) | change; unclear: when it's reachable | own page, always reachable; suggested after a finished package (q-p 64/9) |
| O-13 | Option to generate the whole package at once, for AIs that can handle it. | G-02 package in parts | change | "whole package" prompt option for capable AIs (q-p 64/13) |
| O-14 | Words should be read aloud when tapped and the word menu opens, as an option. | G-05 speech, G-03 word menu | change | speaking on tap becomes a setting (on by default); also check why it didn't play (G-03 already says the word is spoken where the device has a Swedish voice) |
| O-15 | The yellow circles next to words aren't understood. | G-03: the dot marks a form that could belong to more than one dictionary word | change | dot removed; the word menu shows the other words with that form (q-p 64/11) |
| O-16 | Picking up a grammar pattern from the word menu, not just the word. | G-04 FR-411, G-03 patterns | change | word menu offers picking up the pattern itself |
| O-17 | Remove the "English" buttons: really ugly. | G-03 English on/off | change | no English under sentences; one button shows the whole text's translation below it (q-p 64/12) |
| O-18 | "Words I'm learning" should automatically be in the "to remember" list. | G-04 marks | change | settled by O-19: learning = To remember |
| O-19 | Languages without a special writing system (unlike Chinese) don't need a reading list. | G-04 To read / To remember | change; unclear: confirm reading | no To read list for Latin-alphabet languages (q-p 64/10) |
| O-20 | Practise and Listen should use different texts; Practise should be called Reading. | G-03 / G-05 | change | Practise → Reading; separate reading and listening texts in each part (q-p 64/14) |
| O-21 | Grounded words can be picked up from the dictionary. | G-04 FR-411, dictionary page | change | Pick up on dictionary entries for ground words |

Seen in the screenshots while sorting these (not in the notes):

| # | Note | What it touches | Kind | Decision |
|---|---|---|---|---|
| O-22 | A name and its full stop break onto lines of their own ("Din granne heter / Olle / . 1 new"). | G-03 reading layout | fix | fix: names and punctuation stay on their line |
