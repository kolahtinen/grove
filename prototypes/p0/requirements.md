# Prototype requirements: grove / p0

**Purpose:** an earlier grove prototype, imported on 2026-10-20 from `grove-2026-10-16b.html` (a single page). The learner's own Claude makes 'pack files' with exercises for four skills (listening, reading, writing, grammar); the learner works through them, marks things for Claude, downloads the updated pack and sends it back for the next one. Built for many languages, Japanese first.

The living requirements list for one throwaway prototype (phase 1). Each round adds or changes requirements here, one behaviour per requirement. A new requirement is checked against the existing ones; conflicts are raised before anything changes. Phase 2 combines the requirements of the prototypes that aren't rejected into `docs/requirements.md`.

- **Status:** active / changed / dropped / implicit: undecided / denied. Implicit requirements are things a build does that nobody asked for; I confirm (→ active), deny or leave them undecided.
- **Needs:** the need IDs behind it (`docs/discovery/<prototype>/needs.md`), or "prototype detail, no need", or "no need: a constraint (…)" when it only records a limit such as the budget.
- **Feasibility:** its rating (F-…: easy / possible with limits / not feasible) and any reduction (X-…).

| ID | Requirement | Round | Status | Needs | Feasibility | Notes |
|---|---|---|---|---|---|---|
| | **Pack files and saving** | | | | | |
| PR-p0-01 | All of a learner's data (levels, saved words, progress, settings) is kept in a pack file on the learner's device, not on a server. | import | active | prototype detail, no need | F-p0-01: possible with limits | Found in the imported code. Kept (question-pages/38). |
| PR-p0-02 | The learner starts by opening a pack file from their device. | import | active | prototype detail, no need | F-p0-01: possible with limits | Found in the imported code. Kept (question-pages/38). |
| PR-p0-03 | A pack can also be loaded by pasting its code (text starting with 'LC2:'). | import | denied |  |  | Found in the imported code. Dropped (question-pages/38). |
| PR-p0-04 | Each pack (its items, levels and settings) is made by the learner's own AI, whichever one they use. | import | active | N-p0-16 | F-p0-01: possible with limits | Found in the imported code. Kept (question-pages/38). Reworded: any generative AI, not only Claude. |
| PR-p0-05 | The learner saves progress by downloading the updated pack file; its name holds the language, the pack's title and the date. | import | active | prototype detail, no need | F-p0-01: possible with limits | Found in the imported code. Kept (question-pages/38). |
| PR-p0-06 | The page warns before closing when there's unsaved progress. | import | active | prototype detail, no need | easy | Found in the imported code. Kept (question-pages/38). |
| PR-p0-07 | Home says whether progress is saved, and tells the learner to send the file to Claude for a fresh pack (any time, or when the pack is finished). | import | active | N-p0-22 | easy | Found in the imported code. Kept (question-pages/38). |
| PR-p0-08 | The pack file's contents are compressed and scrambled, so they can't be read as plain text. | import | active | prototype detail, no need | F-p0-01; X-p0-01: possible with limits | Found in the imported code. Kept (question-pages/38). |
| PR-p0-09 | Opening a different pack asks for confirmation when there's unsaved progress. | import | active | prototype detail, no need | easy | Found in the imported code. Kept (question-pages/38). |
| PR-p0-10 | A pack can have a topic, shown on Home. | import | active | N-p0-23 | easy | Found in the imported code. Kept (question-pages/38). |
| PR-p0-11 | A pack can be audio-free, which hides the listening skill. | import | denied |  |  | Found in the imported code. Dropped (question-pages/38). |
| | **Languages, voices and readings** | | | | | |
| PR-p0-12 | grove works for many languages; the pack says which (Japanese if it doesn't). | import | active | prototype detail, no need | easy | Found in the imported code. Kept (question-pages/38). |
| PR-p0-13 | Level names follow the language: JLPT N5–N1 for Japanese, CEFR A1–C2 for others; a pack can set its own scale. | import | active | prototype detail, no need | easy | Found in the imported code. Kept (question-pages/38). |
| PR-p0-14 | For listening, the learner picks a regional variety (e.g. Swedish from Sweden or Finland) and a voice. | import | active | N-p0-05 | F-p0-02: possible with limits | Found in the imported code. Kept (question-pages/38). |
| PR-p0-15 | When no voice is installed for the language or variety, grove says so and how to add one. | import | active | N-p0-05 | F-p0-02: possible with limits | Found in the imported code. Kept (question-pages/38). |
| PR-p0-16 | For languages with another script (e.g. Japanese, Chinese), each word can show its reading: hiragana above, rōmaji or pinyin below, pinyin with tone colours. | import | active | N-p0-19 | F-p0-03: possible with limits | Found in the imported code. Kept (question-pages/38). |
| PR-p0-17 | The learner chooses which reading layers to show (in Settings). | import | active | N-p0-19 | F-p0-03: possible with limits | Found in the imported code. Kept (question-pages/38). |
| PR-p0-18 | A Readings on/off switch under the text, remembered separately for listening and for reading. | import | active | N-p0-19 | F-p0-03: possible with limits | Found in the imported code. Kept (question-pages/38). |
| PR-p0-19 | Japanese and Chinese get a separate 'Reading list' list for written words; other languages only have 'Heard words'. | import | active | N-p0-25 | F-p0-03: possible with limits | Found in the imported code. Kept (question-pages/38). Renamed: 'Seen words' is now 'Reading list'. |
| | **Skills, levels and stages** | | | | | |
| PR-p0-20 | Four skills, each with its own level: listening, reading, writing and grammar. | import | active | N-p0-03 | easy | Found in the imported code. Kept (question-pages/38). Levels should work like p1's (an estimated level from known words): settle against p1 in /pre.combine (question-pages/38). |
| PR-p0-21 | Levels run from 1 to 6 (matching the six level names), shown with two decimals. | import | denied |  |  | Found in the imported code. Dropped (question-pages/38). |
| PR-p0-22 | Home shows a card for each skill with its progress in each stage. | import | active | N-p0-03, N-p0-06 | easy | Found in the imported code. Kept (question-pages/38). |
| PR-p0-23 | The learner can drag a skill's level to set where Claude pitches the next pack. | import | active | N-p0-04 | easy | Found in the imported code. Kept (question-pages/38). Levels should work like p1's (an estimated level from known words): settle against p1 in /pre.combine (question-pages/38). |
| PR-p0-24 | Each skill's items come in three stages: Discover (new), Review and Master. | import | active | N-p0-03 | easy | Found in the imported code. Kept (question-pages/38). |
| PR-p0-25 | Choosing a skill shows its stages and modes (e.g. Sentences, Passages, Long text, Drill) with how many items are left. | import | active | N-p0-03, N-p0-22 | easy | Found in the imported code. Kept (question-pages/38). |
| PR-p0-26 | Items are picked near the learner's level for that skill, with some easier and some harder ones mixed in. | import | active | N-p0-04 | easy | Found in the imported code. Kept (question-pages/38). Levels should work like p1's (an estimated level from known words): settle against p1 in /pre.combine (question-pages/38). |
| PR-p0-27 | Each answered item moves the skill's level up or down, by how the score compares with what the level predicted. | import | denied |  |  | Found in the imported code. Dropped (question-pages/38). |
| PR-p0-28 | Listening scores count for less when the learner replayed the audio many times or used slow speed. | import | denied |  |  | Found in the imported code. Dropped (question-pages/38). |
| PR-p0-29 | A short card explains each mode before it starts (10 seconds, tap to skip); it can be turned off. | import | active | N-p0-22 | easy | Found in the imported code. Kept (question-pages/38). |
| | **Listening and reading exercises** | | | | | |
| PR-p0-30 | Listening sentences: a sentence plays by itself after a second, then multiple-choice questions follow. | import | active | N-p0-03 | easy | Found in the imported code. Kept (question-pages/38). |
| PR-p0-31 | While listening, the learner can replay, sees how many times they've played it, and can choose natural or slow speed. | import | active | N-p0-03 | easy | Found in the imported code. Kept (question-pages/38). |
| PR-p0-32 | Listening passages: a short passage with comprehension questions. | import | active | N-p0-03 | easy | Found in the imported code. Kept (question-pages/38). |
| PR-p0-33 | Long listening: a long text plays sentence by sentence, with a progress bar and time. | import | active | N-p0-03 | easy | Found in the imported code. Kept (question-pages/38). |
| PR-p0-34 | In long listening, the learner can go back or forward by sentence and by section, and repeat the sentence or start over. | import | active | N-p0-03 | easy | Found in the imported code. Kept (question-pages/38). |
| PR-p0-35 | Long listening can be left and continued later from the same place. | import | denied |  |  | Found in the imported code. Dropped (question-pages/38). |
| PR-p0-36 | After a long text, the learner can loop any stretch: tap its first and last word, and it repeats with 3 seconds between rounds. | import | active | N-p0-03 | easy | Found in the imported code. Kept (question-pages/38). |
| PR-p0-37 | Reading sentences and passages with multiple-choice questions. | import | active | N-p0-03 | easy | Found in the imported code. Kept (question-pages/38). |
| PR-p0-38 | Long reading: read at your own pace, tap 'Done reading', then answer. | import | active | N-p0-03 | easy | Found in the imported code. Kept (question-pages/38). |
| PR-p0-39 | After answering, the full text is shown, with a play button that highlights each sentence as it's read. | import | active | N-p0-19 | easy | Found in the imported code. Kept (question-pages/38). |
| PR-p0-40 | After answering, the text is replayed automatically (can be turned off). | import | active | N-p0-19 | easy | Found in the imported code. Kept (question-pages/38). |
| PR-p0-41 | After answering, a translation is shown under each sentence (can be turned off). | import | active | N-p0-19 | easy | Found in the imported code. Kept (question-pages/38). |
| | **Translation questions** | | | | | |
| PR-p0-42 | After a sentence, grove asks what individual words mean in that sentence, with wrong options taken from other words' meanings. | import | active | N-p0-03 | easy | Found in the imported code. Kept (question-pages/38). |
| PR-p0-43 | 'Pick the best translation' questions for whole sentences. | import | active | N-p0-03 | easy | Found in the imported code. Kept (question-pages/38). |
| PR-p0-44 | A 'Got lucky' button on a right answer: the answer then doesn't raise the level. | import | active | N-p0-19 | easy | Found in the imported code. Kept (question-pages/38). |
| | **Other exercise types** | | | | | |
| PR-p0-45 | In context: what does this word mean here? (In listening, the sentence stays hidden until answered.) | import | denied |  |  | Found in the imported code. Dropped (question-pages/38). |
| PR-p0-46 | Origins: pick the right character breakdown (Japanese, Chinese) or the word's origin. | import | active | N-p0-03 | easy | Found in the imported code. Kept (question-pages/38). |
| PR-p0-47 | Writing: rebuild a sentence from word tiles, after listening to it or reading a short scene; two tries. | import | active | N-p0-03 | easy | Found in the imported code. Kept (question-pages/38). |
| PR-p0-48 | Word tiles can have several forms (e.g. inflections); tapping a placed tile lets the learner pick its form. | import | active | N-p0-03 | easy | Found in the imported code. Kept (question-pages/38). |
| PR-p0-49 | Writing: fill the gaps in a passage from tiles; two tries; partial credit. | import | active | N-p0-03 | easy | Found in the imported code. Kept (question-pages/38). |
| PR-p0-50 | Grammar: a card introduces each new pattern (explanation, then 'Got it'). | import | active | N-p0-10 | easy | Found in the imported code. Kept (question-pages/38). |
| PR-p0-51 | Grammar exercises: what a highlighted pattern means, the right form for a gap, and short dialogues. | import | active | N-p0-03 | easy | Found in the imported code. Kept (question-pages/38). |
| PR-p0-52 | Grammar build: build sentences with a pattern from tiles; five all right masters the pattern. | import | active | N-p0-03 | easy | Found in the imported code. Kept (question-pages/38). |
| PR-p0-53 | Master drill: one word or pattern in five sentences; pick what each means; all five right counts, one miss moves on. | import | denied |  |  | Found in the imported code. Dropped (question-pages/38). |
| PR-p0-54 | A word or pattern mastered in two different packs gets a 'mastered' badge. | import | denied |  |  | Found in the imported code. Dropped (question-pages/38). |
| | **Feedback and motivation** | | | | | |
| PR-p0-55 | A streak counter (a flame) for right answers in a row, with a special sound every 5. | import | active | N-p0-06, N-p0-11 | easy | Found in the imported code. Kept (question-pages/38). |
| PR-p0-56 | Short sounds and a vibration for right and wrong answers; sounds can be turned off. | import | active | N-p0-11 | easy | Found in the imported code. Kept (question-pages/38). |
| PR-p0-57 | Progress dots show how each question in an item went. | import | active | N-p0-06 | easy | Found in the imported code. Kept (question-pages/38). |
| PR-p0-58 | After each item, a ring shows the score in percent and the level change counts up or down. | import | active | N-p0-06 | easy | Found in the imported code. Kept (question-pages/38). Levels should work like p1's (an estimated level from known words): settle against p1 in /pre.combine (question-pages/38). |
| PR-p0-59 | Finishing a stage of a skill shows a celebration with confetti. | import | active | N-p0-06, N-p0-11 | easy | Found in the imported code. Kept (question-pages/38). |
| PR-p0-60 | A saved word flies to its list's button. | import | active | N-p0-11 | easy | Found in the imported code. Kept (question-pages/38). |
| | **Tapping words** | | | | | |
| PR-p0-61 | One tap on a word plays it and opens its menu: its meaning here, its dictionary form and the grammar patterns in it. | import | active | N-p0-19 | easy | Found in the imported code. Kept (question-pages/38). |
| PR-p0-62 | From the word menu, the learner saves the word to Heard words (and Reading list); both the form in the text and its dictionary form are saved. | import | active | N-p0-19 | easy | Found in the imported code. Kept (question-pages/38). Renamed: 'Seen words' is now 'Reading list'. |
| PR-p0-63 | A double tap or long press starts selecting several words of one sentence as a phrase, saved as one entry. | import | active | N-p0-19 | easy | Found in the imported code. Kept (question-pages/38). |
| PR-p0-64 | Saved words and phrases are coloured in texts (heard, seen, both, retired, has another reading). | import | active | N-p0-20 | easy | Found in the imported code. Kept (question-pages/38). |
| PR-p0-65 | A 'How tapping works' card explains the taps and the colours. | import | active | N-p0-19, N-p0-22 | easy | Found in the imported code. Kept (question-pages/38). |
| PR-p0-66 | Saving or removing shows a confirmation with Undo. | import | active | N-p0-19 | easy | Found in the imported code. Kept (question-pages/38). |
| | **Marking for Claude** | | | | | |
| PR-p0-67 | 'Explain': flag a word or phrase for Claude to explain in the next pack, with a reason (why this form, why this word is here, a different meaning than I know, reading, other) and a note. | import | active | N-p0-18 | easy | Found in the imported code. Kept (question-pages/38). |
| PR-p0-68 | Claude's explanations appear in the word's menu in the next pack. | import | active | N-p0-18 | easy | Found in the imported code. Kept (question-pages/38). |
| PR-p0-69 | 'Pattern': flag that there's a grammar pattern in a word; Claude adds it and explains it in Patterns. | import | active | N-p0-18, N-p0-10 | easy | Found in the imported code. Kept (question-pages/38). |
| PR-p0-70 | Tick which of a word's grammar patterns apply in this sentence; ticked patterns are saved to Patterns with the sentence as an example. | import | active | N-p0-18, N-p0-10 | easy | Found in the imported code. Kept (question-pages/38). |
| PR-p0-71 | Report a question (wrong answer, bad translation, unnatural sentence, wrong reading, audio, other, with a note): it doesn't count, and Claude fixes it in the next pack. | import | active | N-p0-18, N-p0-12 | easy | Found in the imported code. Kept (question-pages/38). |
| PR-p0-72 | Mark each item as too hard, just right or too easy, for Claude to use in the next pack. | import | active | N-p0-18 | easy | Found in the imported code. Kept (question-pages/38). |
| PR-p0-73 | Home shows how many items are marked and questions reported for Claude. | import | denied |  |  | Found in the imported code. Dropped (question-pages/38). |
| | **Lists and review** | | | | | |
| PR-p0-74 | Heard words: a list of saved words, each with play, meaning and delete (no size limit). | import | active | N-p0-20 | easy | Found in the imported code (it capped the list at 1,000). Dropped, then restored without the cap (question-pages/38). |
| PR-p0-75 | Reading list: a list of saved written words, with flashcard practice (Show, Again, Got it) (no size limit). | import | active | N-p0-20 | easy | Found in the imported code (it capped the list at 1,000). Dropped, then restored without the cap (question-pages/38). |
| PR-p0-76 | On a flashcard, tapping a character (kanji) asks Claude to explain it; it's saved under Characters. | import | active | N-p0-18, N-p0-25 | easy | Found in the imported code. Kept (question-pages/38). |
| PR-p0-77 | Patterns: the patterns and characters the learner marked, newest first, each use with its 5 newest examples and translations. | import | active | N-p0-10 | easy | Found in the imported code. Kept (question-pages/38). |
| PR-p0-78 | In Patterns, the learner can search, add a note, remove a pattern or an example, and open Claude's explanation. | import | active | N-p0-10 | easy | Found in the imported code. Kept (question-pages/38). |
| PR-p0-79 | 'Answered items': every answered item with its text, the right answers, play and marks. | import | active | N-p0-20 | easy | Found in the imported code. Kept (question-pages/38). |
| | **Retire check** | | | | | |
| PR-p0-80 | After every 20 answers, once a list has 500 words (or 100 patterns), grove asks about one entry: answer its meaning, then keep it, or retire it if you'd still know it a year from now. | import | active | N-p0-20 | easy | Found in the imported code. Kept (question-pages/38). |
| PR-p0-81 | Retired words stop appearing in Review and Master, and can be added again later. | import | active | N-p0-20 | easy | Found in the imported code. Kept (question-pages/38). |
| | **Settings and look** | | | | | |
| PR-p0-82 | Two looks: Night forest (dark) and Pale birch (light), following the device's setting by default. | import | active | N-p0-21 | easy | Found in the imported code. Kept (question-pages/38). |
| PR-p0-83 | Text size can be changed (A−/A+, from 0.8 to 1.6 times). | import | active | N-p0-21 | easy | Found in the imported code. Kept (question-pages/38). |
| PR-p0-84 | Settings are saved in the pack file. | import | active | prototype detail, no need | easy | Found in the imported code. Kept (question-pages/38). |
| PR-p0-85 | Fewer animations when the device asks for reduced motion. | import | active | N-p0-21 | easy | Found in the imported code. Kept (question-pages/38). |
| | **Look (added on request, question-pages/38)** | | | | | |
| PR-p0-86 | The app is called Grove, with the tagline 'grow from what you know'. | import | active | N-p0-11 | easy | Visual part of the imported page, added on request (question-pages/38). |
| PR-p0-87 | The logo is three small trees on a ground line. | import | active | N-p0-11 | easy | Visual part of the imported page, added on request (question-pages/38). |
| PR-p0-88 | The logo grows (an animation) when a pack opens and on the mode explainer cards. | import | active | N-p0-11 | easy | Visual part of the imported page, added on request (question-pages/38). |
| PR-p0-89 | A forest palette: greens with warm wood and amber accents. | import | active | N-p0-11 | easy | Visual part of the imported page, added on request (question-pages/38). |
| PR-p0-90 | Soft coloured glows behind the content, staying put while the page scrolls. | import | active | N-p0-11 | easy | Visual part of the imported page, added on request (question-pages/38). |
| PR-p0-91 | Content sits on rounded, frosted-glass cards (blurred, see-through panels with soft shadows). | import | active | N-p0-11 | easy | Visual part of the imported page, added on request (question-pages/38). |
| PR-p0-92 | A single centred column (about 560 px wide at most), made for phones first. | import | active | N-p0-24 | easy | Visual part of the imported page, added on request (question-pages/38). |
| PR-p0-93 | A top bar that stays at the top: logo and name on the left, icon buttons on the right (streak, home, patterns, reading list, heard words, settings), each list button showing its count. | import | active | N-p0-11 | easy | Visual part of the imported page, added on request (question-pages/38). |
| PR-p0-94 | Buttons are rounded and dip slightly when pressed; main buttons have a green gradient and a soft glow. | import | active | N-p0-11 | easy | Visual part of the imported page, added on request (question-pages/38). |
| PR-p0-95 | Home's skill cards sit in a 2×2 grid, each with an icon, the skill's level and thin glowing progress bars for its stages. | import | active | N-p0-06 | easy | Visual part of the imported page, added on request (question-pages/38). |
| PR-p0-96 | A row of small level cards (one per skill) shows each level's number and name; tapping one opens its slider. | import | active | N-p0-06 | easy | Visual part of the imported page, added on request (question-pages/38). |
| PR-p0-97 | Answer options are large rounded buttons: a right one turns green with a check mark and a small bounce; a wrong one turns red with a cross and shakes. | import | active | N-p0-11 | easy | Visual part of the imported page, added on request (question-pages/38). |
| PR-p0-98 | Progress dots are leaf-shaped: green right, red wrong, amber partly right, grey reported. | import | active | N-p0-11 | easy | Visual part of the imported page, added on request (question-pages/38). |
| PR-p0-99 | Listening opens a full-screen dark player, with sound-wave rings spreading from a speaker icon while it plays. | import | active | N-p0-11 | easy | Visual part of the imported page, added on request (question-pages/38). |
| PR-p0-100 | Word menus are pop-up cards that slide up over a blurred background, with a coloured header strip. | import | active | N-p0-11 | easy | Visual part of the imported page, added on request (question-pages/38). |
| PR-p0-101 | One tap shows a speech bubble pointing at the word (meaning and buttons), which closes by itself after 4 seconds. | import | active | N-p0-11 | easy | Visual part of the imported page, added on request (question-pages/38). |
| PR-p0-102 | Words in a text have a dotted underline until saved; saved words take their list's colour (one colour for Heard words, one for the Reading list, one for both); grammar patterns are shown in pink. | import | active | N-p0-11 | easy | Visual part of the imported page, added on request (question-pages/38). |
| PR-p0-103 | The sentence being read aloud is highlighted. | import | active | N-p0-11 | easy | Visual part of the imported page, added on request (question-pages/38). |
| PR-p0-104 | Translations appear in small grey text under each sentence. | import | active | N-p0-20 | easy | Visual part of the imported page, added on request (question-pages/38). |
| PR-p0-105 | Readings appear in small grey text above or below each word. | import | active | N-p0-19 | easy | Visual part of the imported page, added on request (question-pages/38). |
| PR-p0-106 | Word tiles look like small raised cards; placed tiles go into a dashed answer area, and tiles slide smoothly when moved. | import | active | N-p0-19 | easy | Visual part of the imported page, added on request (question-pages/38). |
| PR-p0-107 | Gaps in a passage are shaded boxes with an underline, turning green or red when checked. | import | active | N-p0-11 | easy | Visual part of the imported page, added on request (question-pages/38). |
| PR-p0-108 | Screens slide in from the right when opened. | import | active | N-p0-11, N-p0-22 | easy | Visual part of the imported page, added on request (question-pages/38). |
| PR-p0-109 | A 'Next question' bar floats at the bottom of the screen. | import | active | N-p0-11 | easy | Visual part of the imported page, added on request (question-pages/38). |
| PR-p0-110 | The retire check has a wood-coloured card and banner; retiring stamps 'Retired' on the card and folds it away. | import | active | N-p0-06 | easy | Visual part of the imported page, added on request (question-pages/38). |
| PR-p0-111 | The result ring fills in green, or in the accent colour below 50%. | import | active | N-p0-19 | easy | Visual part of the imported page, added on request (question-pages/38). |
| PR-p0-112 | Text uses a sans-serif font that suits Japanese (Zen Kaku Gothic New, Hiragino or Noto Sans JP), falling back to the device's font. | import | active | N-p0-11 | easy | Visual part of the imported page, added on request (question-pages/38). |
| PR-p0-113 | The AI's explanations appear in boxes with a coloured bar down the left side. | import | active | N-p0-10 | easy | Seen when trying pack 15 (question-pages/38; screenshots in prototypes/p0/screenshots). |
| PR-p0-114 | Skill cards have a soft glow in one corner. | import | active | N-p0-11 | easy | Seen when trying pack 15 (screenshots in prototypes/p0/screenshots). |
| PR-p0-115 | Night forest (the dark look) uses the colour tokens in Appendix A.1. | import | active | N-p0-11 | easy | Visual design copied from the imported page on request (question-pages/39). |
| PR-p0-116 | Pale birch (the light look) uses the colour tokens in Appendix A.1. | import | active | N-p0-11 | easy | Visual design copied from the imported page on request (question-pages/39). |
| PR-p0-117 | The background glows, overlays, listening player, mastered marks and confetti use the fixed colours in Appendix A.1. | import | active | N-p0-11 | easy | Visual design copied from the imported page on request (question-pages/39). |
| PR-p0-118 | Type follows Appendix A.2: Zen Kaku Gothic New (with fallbacks), the listed sizes, and text sizes that follow the size setting. | import | active | N-p0-11 | easy | Visual design copied from the imported page on request (question-pages/39). |
| PR-p0-119 | Corner radii follow Appendix A.3. | import | active | N-p0-11 | easy | Visual design copied from the imported page on request (question-pages/39). |
| PR-p0-120 | Cards are frosted glass with the blur, shadow and glow in Appendix A.3. | import | active | N-p0-11 | easy | Visual design copied from the imported page on request (question-pages/39). |
| PR-p0-121 | Main buttons have the green gradient and glow in Appendix A.3, and every button shrinks slightly while pressed. | import | active | N-p0-11 | easy | Visual design copied from the imported page on request (question-pages/39). |
| PR-p0-122 | The layout follows Appendix A.3: one column at most 560px wide, a sticky blurred top bar, and the listed grids. | import | active | N-p0-11 | easy | Visual design copied from the imported page on request (question-pages/39). |
| PR-p0-123 | Progress bars, progress dots and the result ring look as in Appendix A.3. | import | active | N-p0-11 | easy | Visual design copied from the imported page on request (question-pages/39). |
| PR-p0-124 | Word underlines and marks look as in Appendix A.3. | import | active | N-p0-11 | easy | Visual design copied from the imported page on request (question-pages/39). |
| PR-p0-125 | Explanation boxes look as in Appendix A.3. | import | active | N-p0-11 | easy | Visual design copied from the imported page on request (question-pages/39). |
| PR-p0-126 | Motion follows the timings in Appendix A.4. | import | active | N-p0-11 | easy | Visual design copied from the imported page on request (question-pages/39). |
| PR-p0-127 | The logo is drawn exactly as in Appendix A.5. | import | active | N-p0-11 | easy | Visual design copied from the imported page on request (question-pages/39). |
| PR-p0-128 | Chinese pinyin tones have their own colours (tokens --t1…--t5 in Appendix A.1). | import | active | N-p0-11 | easy | Visual design copied from the imported page on request (question-pages/39). |


## Appendix A: visual design (copied from the imported page, 2026-10-20)

The exact values the imported page uses, after its three rounds of styling (2026-10-13 redesign, 2026-10-16 Grove look and step 2). PR-p0-115…128 refer to this appendix.

### A.1 Colour tokens

Night forest is the dark look, Pale birch the light one. Each look follows the device's setting by default (PR-p0-82).

| Token | Used for | Night forest (dark) | Pale birch (light) |
|---|---|---|---|
| `--bg` | page background | `#0A110E` | `#F3F0E8` |
| `--bgimg` | background glows | `radial-gradient(900px 520px at 8% -8%,rgba(98,140,80,.22),transparent 62%),radial-gradient(760px 480px at 105% 6%,rgba(199,154,100,.14),transparent 60%),radial-gradient(700px 520px at 50% 115%,rgba(60,110,90,.16),transparent 60%)` | `radial-gradient(900px 560px at 0% -10%,rgba(150,180,120,.30),transparent 62%),radial-gradient(760px 480px at 110% 0%,rgba(214,190,150,.38),transparent 60%),radial-gradient(700px 500px at 50% 120%,rgba(225,215,190,.55),transparent 60%)` |
| `--card` | card (frosted) | `rgba(255,255,255,.05)` | `rgba(255,255,255,.72)` |
| `--card2` | raised card, buttons, inputs | `rgba(255,255,255,.08)` | `rgba(255,255,255,.92)` |
| `--ink` | text | `#E8F0E9` | `#1E2A22` |
| `--muted` | secondary text | `#93A399` | `#626C61` |
| `--line` | lines and borders | `rgba(255,255,255,.09)` | `rgba(30,42,34,.10)` |
| `--accent` | accent (main green) | `#7FA866` | `#4A6B3A` |
| `--accent2` | accent, gradient end | `#A3C487` | `#6B8F55` |
| `--onacc` | text on accent | `#0C160A` | `#FFFFFF` |
| `--soft` | soft accent fill (selected chips, highlights) | `rgba(127,168,102,.16)` | `rgba(74,107,58,.11)` |
| `--ok` | right | `#76DB5E` | `#2F9A2A` |
| `--ok-bg` | right, background | `rgba(102,214,86,.15)` | `#E3F5DF` |
| `--bad` | wrong | `#EB8A62` | `#B4532A` |
| `--bad-bg` | wrong, background | `rgba(214,110,70,.17)` | `#F8E5DC` |
| `--amber` | amber (partly right, loops, alternative readings) | `#D9A55B` | `#B7791F` |
| `--wood` | wood (streak, retire check) | `#C79A64` | `#9A6B3E` |
| `--shadow` | card shadow | `0 12px 34px rgba(0,0,0,.45)` | `0 10px 30px rgba(70,60,40,.12)` |
| `--glow` | glow (main buttons, selected cards) | `0 0 0 1px rgba(127,168,102,.45),0 6px 22px rgba(127,168,102,.28)` | `0 0 0 1px rgba(74,107,58,.35),0 6px 20px rgba(74,107,58,.22)` |
| `--pbg` | pop-up background | `#121C16` | `#FFFFFF` |
| `--pink` | pop-up text | `#E8F0E9` | `#1C2130` |
| `--pbord` | pop-up border and header | `#7FA866` | `#4A6B3A` |
| `--phtx` | text on pop-up header | `#0C160A` | `#FFFFFF` |
| `--okb` | confirmation header | `#5FC54B` | `#3E9B35` |
| `--cw` | Heard words colour | `#7CB4FF` | `#2563EB` |
| `--rlc` | Reading list colour | `#D59BFF` | `#9333EA` |
| `--cb` | Heard + Reading list colour | `#4FD1C5` | `#0F8F86` |
| `--gpk` | grammar pattern colour | `#FF6FB0` | `#DB2777` |
| `--rw` | retired from Heard words | `#5E7697` | `#94A7C6` |
| `--rr` | retired from Reading list | `#83679A` | `#B89AC6` |
| `--rb` | retired from both | `#A08B6A` | `#A48A62` |
| `--t1` | pinyin tone 1 | `#FF8A80` | `#D0342C` |
| `--t2` | pinyin tone 2 | `#7FD68A` | `#2E8B3A` |
| `--t3` | pinyin tone 3 | `#8FB4FF` | `#2563C9` |
| `--t4` | pinyin tone 4 | `#D7A3E6` | `#8A3B9E` |
| `--t5` | pinyin neutral tone | `#A8A8A8` | `#7A7A7A` |
| `--cx` | (unused leftover) | `#FF6FB0` | `#DB2777` |
| `--cxs` | (unused leftover) | `#FDBA74` | `#C2410C` |

Fixed colours outside the tokens:
- **Listening player:** background `#070C0A` with `radial-gradient(800px 500px at 50% 0%, rgba(98,140,80,.22), transparent 60%)`; text `#E8EEF6`; secondary text `#93A399`; button borders `#2E3D33`; big buttons `linear-gradient(135deg, #7FA866, #A3C487)` with text `#0C160A` and shadow `0 0 0 1px rgba(127,168,102,.45), 0 8px 26px rgba(127,168,102,.32)`; wave rings `#A3C487`; progress fill `linear-gradient(90deg, #7FA866, #A3C487)`; track `#2A3548`.
- **Mastered:** underline `#D4A93A`; text and badge `#C99A2E` on `rgba(212,169,58,.16)`.
- **Overlays:** pop-up backdrop `rgba(5,8,14,.35)` with 12px blur; celebration backdrop `rgba(5,8,14,.55)` with 10px blur; explainer backdrop `rgba(4,8,6,.45)` with 8px blur.
- **Confetti:** `#7FA866`, `#A3C487`, `#C79A64`, `#E3C27A`, `#5FC54B`, `#D9A55B`.

### A.2 Type

- **Font:** Zen Kaku Gothic New from Google Fonts (weights 400, 500, 700), falling back to Hiragino Sans, Noto Sans JP, then the device's sans-serif.
- **Sizes:** body 15px, line height 1.6. App title 1.15rem; tagline 0.7rem. Section headings 1.05rem. Small text 0.82rem.
- **Text sizes that follow the size setting** (PR-p0-83, factor 0.8–1.6): passages 1.15rem (line height 1.9), question sentences 1.1rem (line height 2), tiles 1.12rem, single big words 2rem.
- **Readings:** 0.58em, in the secondary-text colour.
- **Translations:** 0.86rem, secondary-text colour, in the device's sans-serif.
- **Numbers** (levels, counts) use tabular figures.

### A.3 Shape, depth and layout

- **Layout:** one column, at most 560px wide, padding 0.7rem by 0.75rem, 6rem free at the bottom for the floating bar.
- **Top bar:** sticks to the top, with a background fading from the page colour, blurred 14px.
- **Corner radii:** sections and skill cards 22px; level cards 18px; pop-ups 22px; buttons 14px; answer options 16px; question cards 18px; tiles 12px; chips and pills fully round; celebration card 26px; explainer card 24px.
- **Frosted glass:** sections blur 18px with saturation 1.4; skill and level cards blur 18px; top-bar buttons blur 10px.
- **Depth:** cards use `--shadow`; main buttons, selected stages and the open level card use `--glow`.
- **Main buttons:** `linear-gradient(135deg, var(--accent), var(--accent2))`, text `--onacc`, weight 600. Every button shrinks to 97% while pressed.
- **Grids:** skill cards 2 columns (gap 0.6rem); level cards 4 columns (gap 0.4rem); stage buttons 3 columns (gap 0.5rem); mode buttons 1 column.
- **Progress bars:** 6px high, rounded, filled with `linear-gradient(90deg, var(--accent), var(--accent2))` and a soft glow of the accent colour.
- **Skill cards:** a 140px circular glow of the accent colour (35%) peeking from the top right corner.
- **Progress dots:** 11px leaves (two opposite corners rounded), gap 6px; right answers glow.
- **Result ring:** 76px, stroke 8, right colour (accent colour below 50%), filling over 0.9s.
- **Word underlines:** unsaved words have a 2px dotted underline in the secondary colour; patterns you ticked have a solid underline; another reading is marked by a small amber dot.
- **Explanation boxes:** a 3px bar down the left in the pattern colour (accent colour inside pop-ups), on the soft fill, 6px corners.

### A.4 Motion

All of this is reduced to short fades when the device asks for reduced motion (PR-p0-85).

- **Screens:** slide in from 18px right over 0.28s.
- **Listening player and quiz:** fade in over 0.2s.
- **Right answer:** a 3% bounce over 0.38s, with a check mark popping in.
- **Wrong answer:** shakes over 0.4s.
- **List buttons and streak:** bump to 128% when a word lands or a streak of 5 is reached.
- **Logo:** grows: the ground line draws in (0.35s), then the three trees rise one after another (0.75s each, 0.3s apart).
- **Pop-ups:** slide up 48px and fade over 0.25s; the tap bubble scales up from 60%.
- **Celebration:** 140 confetti pieces fall for 2.6s.
- **Retire:** stamps 'Retired' (rotated −12°), then folds the card away over 0.55s.
- **'Next item' button:** pulses while waiting.
- **Explainer card:** a 10-second bar empties.

### A.5 Logo

Three trees on a ground line, drawn with 2px rounded strokes in the accent colour (30px in the top bar, 64px on explainer cards):

```svg
<svg viewBox="0 0 32 32" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path class="gl" d="M3 27h26"/><g class="tr t1"><path d="M9 27V19M5 19l4-9 4 9z"/></g><g class="tr t2"><path d="M17 27V15M12 15l5-11 5 11z"/></g><g class="tr t3"><path d="M25 27v-6M22 21l3-7 3 7z"/></g></svg>
```
