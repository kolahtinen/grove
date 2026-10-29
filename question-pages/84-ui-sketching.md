# 84 — A lighter way to sketch new screens (B-29)

Answered 2026-10-29 on an answer page (https://claude.ai/artifact/A6MHiSmGi7kwuqnAeHJmXL), at the owner's word: "make it a html page where i answer. that way you're free to work on other stuff in the meantime." The owner pasted the answers back; no notes were written. Recommended options were listed first.

## Purpose and scope

### 1. What is a UI sketch for? (default: Before the spec)

- Before the spec: Try a screen’s look and flow; the spec is then written from the one you pick.
- Instead of questions: Replace most UI questions with sketches you click through.
- Only to show finished decisions: A picture of what was decided, before it is built.

**Answer:** Before the spec.

### 2. Which changes get a sketch? (default: Any visible change to a screen)

- Any visible change to a screen: New screens, moved buttons, new flows. Not text-only fixes.
- Only new screens: Changes to existing screens go straight to the spec.
- Only when I ask: You say "sketch it" on a note.
- When Claude is unsure: Claude decides when a picture would settle it faster.

**Answer:** Any visible change to a screen.

### 3. How many versions of one idea should a sketch show? (default: Two or three)

- Two or three: Different takes side by side, so you choose between real alternatives.
- One: Claude’s best guess; you correct it.
- Up to five: A wider spread for big screens like Home.

**Answer:** Two or three.

### 4. CLAUDE.md says prototypes/ is read-only since phase 2. Where do sketches live? (default: A new folder, docs/sketches/)

- A new folder, docs/sketches/: Outside prototypes/, so that rule stays. Each sketch has its own file.
- Only as published pages: Nothing in the repository; the link is the record.
- Reopen prototypes/: Change the rule so prototypes can grow again.

**Answer:** Reopen prototypes/.

### 5. Is a sketch thrown away after you pick? (default: Thrown away)

- Thrown away: Never copied into the build; the build is regenerated from the spec, as today.
- Kept as a picture: Kept beside the spec as the look to match.
- Can grow into code: The picked sketch becomes the starting code.

**Answer:** Can grow into code.

### 6. Who looks at sketches? (default: Only you)

- Only you: Private links, as now.
- You and test learners: You can send a link to someone trying grove.
- Anyone with the link: Open links to share widely.

**Answer:** Only you.

## What a sketch is made of

### 7. What is a sketch made as? (default: A clickable HTML page)

- A clickable HTML page: Published like this page; opens on your phone from a link.
- A real grove page behind a switch: Inside the app, only for you, with real data.
- Text drawings in the terminal: Boxes and lines in Claude Code; fastest, roughest.
- A design canvas: Artboards laid out side by side, less clickable.

**Answer:** A clickable HTML page.

### 8. How should it look? (default: Like grove)

- Like grove: grove’s own colours, font, buttons and tiles, so it reads as the real thing.
- Grey wireframe: Boxes and labels only, so you judge layout, not colour.
- Wireframe first, then grove’s look: Grey for the first round, styled once the layout is chosen.

**Answer:** Like grove.

### 9. How much should it do when you tap? (default: Click through the flow)

- Click through the flow: Buttons move between screens and show results, with made-up data; nothing is saved.
- Nothing: pictures only: Still screens with arrows between them.
- Work fully: A small fake server so forms and lists really work.

**Answer:** Click through the flow.

### 10. What data fills it? (default: The demo learner’s)

- The demo learner’s: The same texts, words and leaves the reviewer account has.
- Made-up examples: Written for each sketch.
- Yours: A copy of your own account’s data.

**Answer:** Made-up examples.

### 11. Which screen size first? (default: Phone first, with a desktop switch)

- Phone first, with a desktop switch: Most use is on the phone; one tap shows the wide view.
- Phone only: Desktop later.
- Both side by side: Two frames at once.

**Answer:** Phone first, with a desktop switch.

### 12. Which states does a sketch show? (default: Normal, empty, error and loading)

- Normal, empty, error and loading: As tabs on each screen, so nothing is forgotten.
- Normal only: The usual case; the rest comes in the spec.
- Normal and empty: The two you see most.

**Answer:** Normal, empty, error and loading.

### 13. How are the versions shown? (default: Tabs A, B, C on one page)

- Tabs A, B, C on one page: Switch between them in place.
- Side by side: All at once, narrower.
- One page per version: Separate links.

**Answer:** Tabs A, B, C on one page.

### 14. How big is one sketch? (default: One flow, up to about five screens)

- One flow, up to about five screens: For example: Learning tile → Options page → session start.
- One screen: Small and quick.
- No limit: Whatever the idea needs.

**Answer:** One flow, up to about five screens.

## The steps

### 15. What starts a sketch? (default: A note of yours)

- A note of yours: When you send a B-note about a screen, Claude offers a sketch.
- You ask: You write "sketch X".
- Every screen note, automatically: No offer; it just happens.

**Answer:** A note of yours.

### 16. What comes before the sketch? (default: A three-line brief at its top)

- A three-line brief at its top: What it is for, which screens, which choices are open. No questions first.
- A few questions first: As now, then the sketch.
- Nothing: Straight to the sketch.

**Answer:** A few questions first.

### 17. How fast should the first version come? (default: Within about 30 minutes)

- Within about 30 minutes: Built in the background while other work goes on.
- The same day: No rush.
- No target

**Answer:** Within about 30 minutes.

### 18. How many rounds of changes? (default: Up to three, then decide)

- Up to three, then decide: Keeps it light; a fourth round means the idea needs a question instead.
- As many as you like
- One: Pick, comment, done.

**Answer:** Up to three, then decide.

### 19. How do you decide? (default: Pick a version and comment on the sketch page)

- Pick a version and comment on the sketch page: Your choice is saved with the sketch; Claude reads it.
- Tell Claude in chat
- Multiple-choice in Claude Code: As with decisions now.

**Answer:** Pick a version and comment on the sketch page.

### 20. What happens after you pick? (default: Claude writes the spec change from it)

- Claude writes the spec change from it: Acceptance scenarios that describe the picked sketch; an addendum only if a new need appears.
- Straight to code: Skip the spec for small things.
- You write the change

**Answer:** Claude writes the spec change from it.

### 21. Who builds sketches? (default: A background helper)

- A background helper: So the main work, like the deploy, goes on.
- The main session: One thing at a time.
- Either, whichever is free

**Answer:** A background helper.

### 22. How many sketches at once? (default: Up to three)

- Up to three: Enough to keep up with your notes.
- One at a time
- Any number

**Answer:** Up to three.

### 23. Related notes: together or apart? (default: Grouped into one sketch)

- Grouped into one sketch: For example B-24, B-25 and B-26 (Options page, several skills, Words and Grammar) in one.
- One sketch per note

**Answer:** Grouped into one sketch.

### 24. Where is a sketch recorded? (default: A question-pages file per sketch)

- A question-pages file per sketch: With its link, the brief, your pick and comments, like other decisions.
- A line in STATUS only
- Nowhere but the page

**Answer:** A question-pages file per sketch.

## How you give feedback

### 25. Where do you comment? (default: On the sketch page)

- On the sketch page: A comment box per version, saved where Claude reads it.
- Pinned to parts of the screen: Tap a button or tile and comment on that spot.
- In chat

**Answer:** On the sketch page.

### 26. Should you be able to pin a comment to one element? (default: Yes)

- Yes: Tap anything in the sketch and write about it.
- No: One comment box is enough.

**Answer:** No.

### 27. Should each version get a quick rating? (default: Thumbs up or down)

- Thumbs up or down: One tap per version.
- A score from 1 to 5
- No rating: Only the pick.

**Answer:** No rating.

### 28. Must every question on a sketch be answered? (default: No: blanks take the default)

- No: blanks take the default: As on this page.
- Yes, all of them

**Answer:** No: blanks take the default.

### 29. How does Claude learn you have answered? (default: You say "done" in Claude Code)

- You say "done" in Claude Code: Simple and certain.
- Claude checks every now and then: No need to say anything; may be slower.
- The page sends a notice: If the platform allows it.

**Answer:** You say "done" in Claude Code.

### 30. How do you try a sketch on the phone? (default: Open its link)

- Open its link: Published pages open anywhere.
- Through the tunnel to the dev server: Like the real app; needs your computer on.
- Screenshots in chat

**Answer:** Open its link.

### 31. Can a sketch page also hold multiple-choice questions? (default: Yes)

- Yes: Questions the sketch raises sit under it, like this page.
- No: keep them apart: Sketches show, questions ask.

**Answer:** Yes.

### 32. How do you write feedback? (default: In your own words)

- In your own words: Claude reads it, says back what it understood, and asks only if unclear.
- Only by picking options: More structured, less free.

**Answer:** In your own words.

## From sketch to the real build

### 33. Can the build reuse sketch code? (default: Never)

- Never: The build is regenerated from the spec, as the rules say now.
- Only colours and sizes: The CSS tokens, which are grove’s anyway.
- Yes, freely

**Answer:** Never.

### 34. Do browser tests come from the picked sketch? (default: Yes)

- Yes: Each thing you can do in the sketch becomes an acceptance scenario and a test.
- No: Tests come from the spec as today.

**Answer:** Yes.

### 35. Should the picked sketch’s screenshot be kept with the spec? (default: Yes)

- Yes: In docs/sketches/, linked from the spec’s requirement.
- No

**Answer:** Yes.

### 36. Before you test a build, compare it to the sketch? (default: Yes: side-by-side screenshots)

- Yes: side-by-side screenshots: Claude shows the sketch and the built page together and lists differences.
- No: You test as now.

**Answer:** Yes: side-by-side screenshots.

### 37. Keep a gallery of grove’s parts? (default: Yes)

- Yes: One page with every button, tile, chip, card and bar, kept up to date, so sketches are built from real parts.
- No: Each sketch draws its own.

**Answer:** Yes.

### 38. What happens to old sketches? (default: Kept, dated, linked from their question page)

- Kept, dated, linked from their question page
- Deleted once built

**Answer:** Kept, dated, linked from their question page.

### 39. Do small UI changes still need an addendum? (default: No: spec edit and rebuild after the pick)

- No: spec edit and rebuild after the pick: Addenda only for new needs or risks, as the rules say.
- Yes, always

**Answer:** No: spec edit and rebuild after the pick.

### 40. A sketch reveals a new need. Then? (default: An addendum, as now)

- An addendum, as now: Risk and feasibility check, then the spec.
- Note it and carry on: Decide later.

**Answer:** An addendum, as now.

## Tools and sharing

### 41. Where are sketches published? (default: As private pages on claude.ai)

- As private pages on claude.ai: Like this one: a link that works on the phone.
- As local files: Opened from your computer.
- On the dev server: A /sketch route in grove itself.

**Answer:** As private pages on claude.ai.

### 42. Where do grove’s colours and font come from? (default: Copied from grove.css each time)

- Copied from grove.css each time: So sketches always match the current look.
- Written by hand per sketch

**Answer:** Copied from grove.css each time.

### 43. Where does the made-up data come from? (default: A script exports the demo learner to JSON)

- A script exports the demo learner to JSON: Every sketch reads the same file.
- Written into each sketch

**Answer:** A script exports the demo learner to JSON.

### 44. How are sketches named? (default: "Sketch: <what it is>")

- "Sketch: <what it is>": For example "Sketch: Options page".
- By note number: For example "B-24".
- Both: "B-24 Options page".

**Answer:** "Sketch: <what it is>".

### 45. Share sketches with others? (default: No, only you)

- No, only you
- Yes, test learners by link

**Answer:** No, only you.

### 46. An index of all sketches? (default: Yes: one page listing each with its state)

- Yes: one page listing each with its state: Waiting for you, picked, built.
- STATUS.md is enough

**Answer:** Yes: one page listing each with its state.

## Time and limits

### 47. How much time per sketch? (default: About an hour of Claude’s work at most)

- About an hour of Claude’s work at most: Past that, the idea needs breaking down.
- No limit

**Answer:** About an hour of Claude’s work at most.

### 48. When is a sketch skipped? (default: Text-only changes and bug fixes)

- Text-only changes and bug fixes: Straight to the spec.
- Never: Every change gets one.

**Answer:** Text-only changes and bug fixes.

### 49. Near a deadline? (default: Only big changes get a sketch)

- Only big changes get a sketch: Small ones go straight to the spec.
- Same as always

**Answer:** Same as always.

### 50. Which notes should be the first sketches? (default: B-24, B-25, B-26 together)

- B-24, B-25, B-26 together: The Options page, ticking several skills, and content for Words and Grammar.
- B-27, the Progress page: What you have read and listened to, words picked up and fallen, start versus now.
- B-28, the Dictionary button: Pick up and Let it fall as two sides of one button.
- All three: In parallel, by background helpers.

**Answer:** All three.

## Follow-ups

### F1. Q5 says a picked sketch "can grow into code", Q33 that the build "never" reuses sketch code. Which holds? (default: never reuse)

- Never reuse (Recommended): the sketch is kept as the look to match; the build is regenerated from the spec
- Code may grow from it

**Answer:** Never reuse. Q5 is read as: the picked sketch grows into the spec.

### F2. Q10 says "made-up examples", Q43 "a script exports the demo learner to JSON". Which data? (default: demo export, plus made-up where it lacks)

- Demo export, plus made-up where it lacks (Recommended)
- Made-up only
- Demo export only

**Answer:** Made-up only (Q43 dropped).

## Applied

`docs/sketching.md` (the process); CLAUDE.md (sketches first for every visible screen change; `prototypes/sketches/` reopened; long question sets on an answer page). Next: the parts gallery, the sketch index, and the first three sketches (Q50), each after a few questions (Q16).

