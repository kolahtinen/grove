# 80 — Sorting the round-2 branch-test notes (B-15…B-17)

Asked 2026-10-29 in Claude Code, one at a time. Notes: [docs/reviews/2026-10-29-branch-test.md](../docs/reviews/2026-10-29-branch-test.md), round 2.

### 1. B-15a: A session says there isn't enough to practise, and you go to the common library to add texts. How do you get back to the session? (default: a bar that counts up)

- Counting bar (Recommended): a bar on the library shows how much is still needed and turns into Start when enough is added
- Plain back link: "‹ Back to your session", no count
- Add and start right away: adding one text starts the session at once

**Answer:** (Other) "Tell the user how much listening and how much reading to add left." Read as the counting bar with the count split into listening and reading.

### 2. B-15b: Should the library open filtered to what the session still needs? (default: filtered, can be cleared)

- Filtered, can be cleared (Recommended)
- Labelled, not filtered
- Filtered, fixed

**Answer:** (Other) "Two bars that fill up more when you add more." Read as a change to B-15a: two progress bars, listening and reading, that fill as texts are added. The filter itself was not answered (see 3).

### 3. B-15b (asked again): With the two filling bars at the bottom, should the library list itself also be filtered to the kind still needed? (default: filtered, can be cleared)

- Filtered, can be cleared (Recommended): the list shows the kinds whose bar isn't full; ✕ Show all
- No filter, bars only
- Tap a bar to filter

**Answer:** (Other) "Also show the length of texts that can be added, assuming they are not the same length, which they shouldn't." Every library text shows its length in minutes. The filter was again not chosen: **default used** (filtered to what's still needed, ✕ Show all). Checked afterwards: lengths vary by level, roughly 120–190 words at A1 to 650–720 at C2.

### 4. B-16: Tapping a text in the common library today opens it and takes you away from the list. What should a tap do instead? (default: preview sheet)

- Preview sheet (Recommended)
- Add button on the list: each row has + Add; tapping the title still opens the full text, with ‹ Back to the library
- Both

**Answer:** Add button on the list.

### 5. B-17: How should grove show where "back" goes? (default: a labelled parent link plus the phone's Back)

- Labelled link + phone Back (Recommended): a labelled link to the parent page at the top of every page (‹ Library, ‹ Learning, ‹ Home); "‹ Back to your session" instead when a task sent you elsewhere; the phone/browser Back works as usual; Back, Esc or ✕ close a menu or sheet first; in a wizard ‹ Back is the previous step
- Only the phone/browser Back
- Back link to the previous page

**Answer:** Labelled link + phone Back.

### 6. Follow-up (B-15 + B-16): You're filling the bars for a session and tap a text's title to read it in full. What do you see? (default: bars stay)

- Bars stay (Recommended): the text page keeps the two bars and has + Add; ‹ Library returns to the list, still filtered, at the same place
- Plain text page

**Answer:** Bars stay.

## Decided (summary)

- **B-15:** When a session is short, the common library shows two bars at the bottom, **Listening** and **Reading**, each filling toward the minutes the session still needs ("4 of 6 min"). Each text added fills its bar by its own length. When both are full, the bars turn into **▶ Start your session**; tapping them earlier goes back to the session. The list opens filtered to the kinds still needed, with ✕ Show all (default). The bars appear only when a session sent you.
- **Every library text shows its length in minutes** (and its kind, 🎧 listening or 📖 reading).
- **B-16:** Each library row has **+ Add**, which adds the text without leaving the list. Tapping the title opens the full text, with ‹ Library at the top.
- While filling the bars, a text opened in full keeps the bars and has + Add; ‹ Library returns to the list where you were.
- **B-17:** Up and back as in the option above, app-wide.

## Applied

(filled in when the specs change)
