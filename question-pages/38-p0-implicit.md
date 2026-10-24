# grove p0: implicit requirements (asked in Claude Code, 2026-10-20)

Import of ~/Downloads/grove-2026-10-16b.html as p0. Keep = a candidate for grove (conflicts with p1 are settled in /pre.combine); Drop = not wanted.

- Clarified first: *keep for what? for p0?* Keep means a confirmed requirement of p0 and a candidate for grove; /pre.combine merges p0 and p1 and asks on conflicts.
- PR-p0-01 (data in a file on the device): **keep**.
- PR-p0-02 (start by opening a pack file): **keep**.
- PR-p0-03 (load by pasting a code): **drop**.
- PR-p0-04 (packs made by Claude): **keep**, reworded: *it can be whatever gen AI.*
- PR-p0-05 (save by downloading the pack): **keep**.
- PR-p0-06 (warn before closing with unsaved progress): **keep**.
- PR-p0-07 (Home says whether progress is saved): **keep**.
- PR-p0-08 (pack compressed and scrambled): **keep**.
- PR-p0-09 (confirm before opening another pack): **keep**.
- PR-p0-10 (a pack can have a topic): **keep**.
- PR-p0-11 (audio-free packs): **drop**; note: *is there a more efficient way of reviewing these? they are pretty much all kept.*
- How to go through the rest? Options: one list, I name drops · four at a time · keep one by one. **Answer:** one list, I name drops.
- PR-p0-12…85, listed in chat: **drop 21, 27, 28, 35, 45, 53, 54, 73, 74, 75**; the rest kept. Also: *rename 'seen words' to 'reading list', add the visual parts of the app to the requirements; if you need, I can give you a pack so you can test.*

Applied: 73 kept, 12 dropped; 'Seen words' renamed 'Reading list'; the look added as PR-p0-86…112 (active).

## Follow-ups
- **Word lists:** you dropped 74 and 75 but kept 19, 62, 76, 80. What did you mean to drop? Options: only the 1,000 cap · only the flashcards · the list screens · the lists entirely. **Answer:** only the 1,000 cap (74, 75 restored without it).
- **Levels:** you dropped 21 and 27 but kept 20, 23, 26, 58. How should levels work? Options: level names only · a simpler rule · only the AI moves them · like p1. **Answer:** like p1 (settled in /pre.combine).

