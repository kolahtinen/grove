# Feature Specification: Reading and the word menu (G-03)

**Feature Branch**: `main` (no feature branch; spec folder `specs/003-reading-word-menu`)

**Created**: 2026-10-24

**Status**: Draft (clarified 2026-10-24, question-pages/58)

**Input**: User description: "G-03: Reading and the word menu. The feature description is the G-03 section of docs/middle-steps.md (Part 2: Feed for Spec Kit), with grove's terms (docs/glossary.md). Follow the combined requirements as written; every spec requirement names its RQ and N IDs."

**Sources**: `docs/middle-steps.md` (G-03 feed), `docs/requirements.md`, `docs/needs.md`, `docs/glossary.md` (question-pages/56), `docs/middle/` (constraints, quality, threats), `.specify/memory/constitution.md` v1.1.0. Builds on G-01 (accounts, the look) and G-02 (`specs/002-texts-from-own-ai`: the exchange, texts, sentences, leaves, the reading page).

**Terms** (docs/glossary.md): **leaf**, **Leaves**, **Ground**, **known**, **new** as in G-02. Marking leaves (To remember / To read), colouring them in texts, "Let it fall" and drilling are G-04's; listening options (speed, replay, voice help) are G-05's. G-03's word menu shows a word's status but doesn't change it.

**Requirement numbers**: FR-301… so test names stay unique across goals.

## Clarifications

### Session 2026-10-24

- Q: Should the English version show under each Swedish sentence? → A: Yes, by default; a setting turns it off, and one line can still be peeked at with its English button (question-pages/58). This changes G-02's reading page, where English was tap-to-show.
- Q: How many "what does this word mean here?" questions per text in Practise? → A: Up to 8 (question-pages/58).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Read with help exactly where I'm stuck (Priority: P1)

A learner opens a text. Each sentence has its translation under it (unless they turned translations off) and a small count of its new words; the text shows its word count, its new words and their share. One tap on any word speaks it and opens its menu: its meaning here, its dictionary form, its status (new, leaf, ground or name) and the phrases and grammar patterns it is part of.

**Why this priority**: The word menu is grove's main help while reading (N-45); without it texts above the learner's level are frustrating.

**Independent Test**: Open a text from the G-02 sample answer, tap "kopparna", "säger" and "Elsa", and see the right dictionary form, meaning and status for each within 0.5 s; turn translations off and reopen the text.

**Acceptance Scenarios**:

1. **Given** a text, **When** the learner taps a word, **Then** it is spoken (where the device has a Swedish voice) and its menu opens within 0.5 s with its meaning here, dictionary form, status, and the phrases and patterns it is part of. (RQ-18, Q-05)
2. **Given** a text, **When** it is shown, **Then** each sentence has its translation under it and a count of its new words, and the text shows its word count, how many new words it has and their share. (RQ-10, RQ-55, RQ-76)
3. **Given** translations turned off in the settings, **When** a text opens, **Then** no translations show until they are turned on again; a single line's translation can still be shown with its English button. (RQ-10)
4. **Given** a character or place name, **When** it is tapped, **Then** its status is "name"; names are listed in their own list and never count as new words. (RQ-56)
5. **Given** a word that is new, a leaf or in the ground, **When** its menu opens, **Then** the status says which. (RQ-18)
6. **Given** any text from an AI or a paste, **When** it is shown, **Then** it is shown as plain text, never as HTML. (T-06)

---

### User Story 2 - Notice and learn grammar patterns (Priority: P1)

The AI marks the grammar patterns it used (e.g. "har + supine: past action", "adjective -a after den/det/de"), with a short explanation. Grove shows them inside sentences in the pattern colour; one tap shows the pattern's name and explanation. Patterns are tracked as items, alongside words and phrases.

**Why this priority**: Understanding patterns lets learners build their own sentences (N-05); the AI explains grammar (RQ-177).

**Independent Test**: Paste an answer with two patterns marked; see their spans coloured in the right sentences; tap one and see its name and explanation; see both in the dictionary.

**Acceptance Scenarios**:

1. **Given** an answer whose texts use grammar patterns, **When** it is added, **Then** each pattern is stored as an item (a leaf until it falls) with its name and the AI's explanation, and each place it was used is marked. (RQ-29, RQ-177)
2. **Given** a sentence with a pattern, **When** it is shown, **Then** the pattern's words are marked in the pattern colour (one colour for all patterns), and a tap shows the pattern's name and explanation. (RQ-12)
3. **Given** a text with no patterns, **When** it is shown, **Then** nothing is marked and nothing breaks. (edge case)

---

### User Story 3 - Practise reading a text (Priority: P1)

After reading, the learner can practise the text: grove goes sentence by sentence, asking what a word means in that sentence (multiple choice, wrong options taken from other words' meanings), then the AI's questions on the passage; after answering, the full text is shown with a play button that reads it aloud, highlighting each sentence as it's read.

**Why this priority**: Reading practice with multiple choice is the first build's reading exercise (RQ-274; RQ-17 reduced).

**Independent Test**: Practise a sample text: get word-meaning questions inside sentences with plausible wrong options, then the passage questions, then the full text with play-and-highlight.

**Acceptance Scenarios**:

1. **Given** a text, **When** the learner practises it, **Then** for each sentence with a leaf (up to 8 per text), grove shows the sentence and asks what that word means in it, with 3–4 options whose wrong ones are other words' meanings. (RQ-58, RQ-274, RQ-278)
2. **Given** the word questions are done, **When** practice goes on, **Then** the AI's passage questions follow, as in G-02. (RQ-274)
3. **Given** all questions are answered, **When** the learner continues, **Then** the full text is shown with translations (per the setting) and a play button that reads it sentence by sentence, highlighting the sentence being read. (RQ-276)
4. **Given** a word with fewer than 3 other meanings available, **When** a question is made for it, **Then** grove skips that question rather than show fewer than 3 options. (edge case)

---

### User Story 4 - Ask for an explanation, report a mistake (Priority: P2)

The learner flags a word or phrase with **Explain**, choosing a reason (why this form, why this word here, a different meaning than I know, reading, other) and an optional note. The next prompt asks the AI to explain it, and the answer's explanation appears in that word's menu. The learner can also **Report** a question or sentence (wrong answer, bad translation, unnatural sentence, wrong reading, audio, other, with a note): a reported question doesn't count, and the next prompt asks the AI to fix it; the fix replaces it.

**Why this priority**: Puzzles and mistakes get sorted out in the next exchange (N-45, N-43); the learning loop works without them.

**Independent Test**: Flag "kopparna" with "why this form"; see the next prompt ask for it; paste an answer with the explanation; see it in the menu. Report a question as "wrong answer"; see it excluded from the score and listed in the next prompt; paste a fix; see the question replaced.

**Acceptance Scenarios**:

1. **Given** a word flagged with Explain (reason and note), **When** the next prompt is made, **Then** it asks for an explanation of that word in its sentence, giving the reason and note. (RQ-297)
2. **Given** an answer with that explanation, **When** it is added, **Then** the explanation appears in the word's menu, and the flag is cleared. (RQ-298)
3. **Given** a reported question, **When** scores and summaries are made, **Then** it doesn't count; **When** the next prompt is made, **Then** it lists the report (text, question or sentence, reason, note) and asks for a fix. (RQ-301)
4. **Given** an answer with a fix for a report, **When** it is added, **Then** the fixed question or sentence replaces the reported one and the report is closed. (RQ-301)

---

### User Story 5 - My dictionary (Priority: P2)

The learner opens **Dictionary**: every word, phrase and grammar pattern they have met, with its translation, status and an example of where they met it; and a separate list of names.

**Why this priority**: Seeing what they've met shows progress (N-29) and helps remembering (N-38).

**Independent Test**: After adding the sample answer, open the dictionary and find "kopp" with "cup", status leaf and an example sentence; find "Elsa" in the names list, not among the words.

**Acceptance Scenarios**:

1. **Given** texts have been added, **When** the learner opens the dictionary, **Then** it lists every word, phrase and pattern they have met (ground and leaves), each with its translation, status and one example sentence where they met it. (RQ-53, RQ-205, RQ-357)
2. **Given** names in the texts, **When** the dictionary is shown, **Then** names are in their own list and not among the words. (RQ-56)

---

### User Story 6 - Read my own texts (Priority: P3)

The learner pastes a Swedish text of their own (an article, a song) with a title. Before it can be read, grove gives a prompt (in pieces for a long text) asking the learner's AI for the meaning of every word in it, in context, and whether the text looks copyrighted; the learner pastes the answer back. Then grove shows it like other texts: word menu, new-word counts, the text's share of known words, and the AI's copyright view. Unknown words show as "new" with a **Save as leaf** button.

**Why this priority**: Own texts widen the input (RQ-74); AI texts already cover the learning loop.

**Independent Test**: Paste a short Swedish paragraph; open it; tap a known and an unknown word; save the unknown one as a leaf and see it in the dictionary.

**Acceptance Scenarios**:

1. **Given** a pasted Swedish text with a title, **When** the learner saves it, **Then** it is stored without English, its sentences are saved, it appears in the texts list as the learner's own, waiting, and grove gives its AI prompt; it can't be opened yet. (RQ-74, RQ-400)
2. **Given** the AI's answer gives a meaning for every word, **When** it is pasted, **Then** the text opens, showing its share of known words (e.g. "78% known: harder than your usual texts") and the AI's copyright view; an answer missing some words gets a fix-it prompt for just those, and the text is never refused for being hard. (RQ-400, RQ-401)
3. **Given** an own text, **When** a new word is tapped, **Then** its status is "new", it shows the AI's meaning, and **Save as leaf** adds it to Leaves with that meaning. (RQ-74, RQ-18, RQ-396)

---

### Edge Cases

- A word with several readings or meanings in one text: the menu shows the meaning given for that sentence where the AI listed one, else the word's meaning; a homograph (*var*) shows each dictionary form it may belong to. (feed)
- A text with no pattern marks: shown normally. (feed)
- A very long sentence on a narrow phone: it wraps; the menu opens as a sheet from the bottom of the screen, never off-screen. (feed)
- A pattern span the AI gives that isn't in the sentence word for word: the pattern is stored but not marked there.
- A word tapped in a device without a Swedish voice: the menu opens without sound (G-05 adds the voice help).
- An Explain flag on a word that then falls to the ground (G-04): the flag stays until answered.
- A report on a question already answered: the answer stops counting from then on.
- An own text over 20,000 characters: refused with a plain message.
- A long own text: its AI prompt comes in pieces of at most `GROVE_OWN_PIECE_CHARS` characters, split between sentences, each answered on its own; the text opens when every piece is in. (RQ-400, R-18)

## Requirements *(mandatory)*

MUST for must-priority combined requirements, SHOULD for should-priority ones. Each requirement names its RQ and N IDs; other sources are added where they shape it. Tests are named after the FR ID and its RQ IDs.

### Functional Requirements

**Reading view**

- **FR-301** (RQ-10; N-11, N-38, N-02): In texts, and after answering a question, each sentence MUST show its translation under it. A setting turns translations off; while off, no translations show, except a single line's when its English button is tapped. The setting is kept for the learner.
- **FR-302** (RQ-55, RQ-76; N-11): Each sentence MUST show how many new words it has; each text MUST show its word count, its number of new words and their share, counted as in G-02 FR-213 against the learner's ground now.
- **FR-303** (RQ-56; N-11): Character and place names MUST be kept in their own list (from the answers' names and the name rule of G-02 FR-213) and never count as new words.
- **FR-304** (RQ-381, T-06; N-43; constitution 4.6): Every text MUST be shown as plain text.

**Word menu**

- **FR-305** (RQ-18; N-11, N-45, N-29; Q-05): One tap on a word MUST speak it (with the device's Swedish voice, where there is one) and open its menu within 0.5 s, showing: its meaning here; its dictionary form; its status (new, leaf, ground or name); the phrases and grammar patterns of that sentence it is part of; its explanation, if the AI gave one; and an **Explain** button.
- **FR-306** (RQ-18; N-45): The meaning here MUST be the AI's meaning for that word in that text where one exists, else the word's stored meaning, else its meaning in grove's word list (G-02 FR-222); grove never shows "meaning missing" (RQ-396). The dictionary form comes from the word itself, a learned form, the common irregular forms, or the regular endings (G-02 research R2); a form that may belong to several dictionary forms lists each.

**Grammar patterns**

- **FR-307** (RQ-29, RQ-177; N-05, N-42, N-06): Every part prompt MUST ask the AI to list the grammar patterns its texts use, each with a short name, a short English explanation and the places it is used (text, line, and the exact words). Each pattern is stored as an item of kind **pattern**, a leaf until it falls (glossary), with its name and explanation; repeated patterns are one item.
- **FR-308** (RQ-12; N-45, N-34): Pattern places MUST be marked inside their sentences in the pattern colour (one colour for all patterns); a tap on a marked span shows the pattern's name and explanation. A place whose words aren't found in the line is not marked.
- **FR-309** (RQ-171; N-04, N-12): Patterns MUST be able to take plain spaced repetition like other items; scheduling itself is G-04's.

**Reading practice**

- **FR-310** (RQ-274, RQ-278, RQ-58; N-37, N-04): **Practise** on a text MUST go through its sentences that contain a leaf (at most 8 per text) and, for each, show the sentence and ask what that leaf means in it, with 3 or 4 options: the right meaning and 2–3 meanings of other words the learner has met. A word with fewer than 2 other meanings available is skipped.
- **FR-311** (RQ-274; N-37): After the word questions, practice MUST ask the AI's passage questions (G-02 FR-218).
- **FR-312** (RQ-276; N-11): After answering, practice MUST show the full text with translations (per FR-301) and a **Play** button that reads it aloud sentence by sentence with the device's Swedish voice, highlighting the sentence being read; Stop ends it.

**Explain and report**

- **FR-313** (RQ-297; N-45): From the word menu, **Explain** MUST flag a word or phrase in its sentence, with a reason (why this form, why this word here, a different meaning than I know, reading, other) and an optional note (≤ 200 characters). The next part prompt asks the AI to explain each open flag (word, sentence, reason, note), and its answer format gains `explanations`.
- **FR-314** (RQ-298; N-45): An explanation in an accepted answer MUST be stored with its word and shown in the word's menu from then on; its flag is closed. A flag without an explanation stays open for the next prompt.
- **FR-315** (RQ-301; N-45, N-43): A question, or a sentence, MUST be reportable with a reason (wrong answer, bad translation, unnatural sentence, wrong reading, audio, other) and an optional note (≤ 200 characters). A reported question's answer doesn't count in scores or summaries. The next part prompt lists open reports with a short code (R1, R2…) and asks for fixes; the answer format gains `fixes` (report code, and the corrected question, options and answer, or corrected sentence and translation). An accepted fix replaces the reported item and closes the report.

**Dictionary**

- **FR-316** (RQ-53, RQ-205, RQ-357, RQ-409, RQ-410; N-29, N-38, N-34): A **Dictionary** page MUST list every word, phrase and pattern the learner has met (ground and leaves), with its translation (the stored meaning, else the word list's; G-02 FR-207), its status and one example sentence where the learner met it (ground words from the starting level without a sentence show none). It has four tabs, **Words**, **Phrases**, **Grammar patterns** and **Names** (FR-317), each showing 100 entries at a time, A to Ö, with a **More** button for the next 100 and a count ("100 of 2,140"). A search box searches on the server 0.3 s after the learner stops typing: the open tab's entries whose form or meaning contains the text, and each tab's number of matches; an answer to an older search is dropped once a newer one is sent. The example is stored, not searched for: when a text's sentences are stored (G-02 accepting an answer, an own text), each of the learner's words, phrases and patterns in them without an example gets the first sentence it appears in; a word added without a sentence (a leaf, the starting level) gets the first earlier sentence it appears in, if any; words met before this rule get theirs once, as a G-01 FR-032 start-up load in steps (question-pages/72). There is no cache of searches.
- **FR-317** (RQ-56, RQ-409; N-11): The dictionary MUST show names in their own tab (FR-316), paged and searched like the others.

**Own texts**

- **FR-318** (RQ-74, RQ-400, RQ-401; N-16, N-43, N-13): The learner MUST be able to paste a Swedish text of their own (title ≤ 120 characters, text ≤ 20,000 characters); it is saved without English, split into sentences, marked as their own, and **waiting**: it can't be opened until its AI round is complete. The AI round is one `own` exchange per piece of at most `GROVE_OWN_PIECE_CHARS` characters (split between sentences), each asking for the dictionary form, English meaning in context and a simple Swedish explanation of every word in the piece (names listed as names), and whether the text looks free to use, maybe copyrighted or copyrighted, with a short reason. The answer is checked only for completeness: every word of the piece (except names and numbers) needs a meaning; missing ones get a fix-it prompt listing just them; the text is never refused for being hard. When every piece is in, the text opens like other texts, showing its share of known words ("78% known: harder than your usual texts" when below the learner's target share) and the AI's copyright view ("Your AI thinks this may be copyrighted: …"). Unknown words show status "new" with **Save as leaf**, which adds the word to Leaves with the AI's meaning. There is no separate meanings prompt (G-02 FR-207).

**Safety**

- **FR-319** (RQ-155; N-12; constitution 2.3): Flags, reports, patterns, explanations and own texts MUST belong to one account; no account can read or change another's.

### Key Entities *(include if feature involves data)*

- **Pattern item**: a word entry of kind `pattern`: name (as its dictionary form), English explanation, state (leaf or ground).
- **Pattern place**: account, pattern, text, line, the exact words.
- **Name**: account, name (as written), first text met.
- **Explain flag**: account, word or phrase, text and sentence, reason, note, status (open, answered), created time.
- **Explanation**: account, word, text it was asked from, the AI's explanation, time.
- **Report**: account, text, question position or sentence, reason, note, code (R1…), status (open, fixed), created time.
- **Own text**: a text with `own = true`, no exchange, no English.
- **Learner settings** gain: translations shown (yes/no).
- **Word meaning in a text**: the AI's meaning for a word as used in a given text (from new_words), so the menu can show the meaning here.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The word menu opens within 0.5 s of a tap on a mid-range phone (all menu data comes with the text). (Q-05)
- **SC-002**: In the G-02 sample answer, every name shows status "name" and none counts as new; every pattern place given word for word is marked. (RQ-56, RQ-12)
- **SC-003**: A word flagged with Explain gets its explanation into the menu after one exchange.
- **SC-004**: A reported question never counts in scores or summaries after it is reported.
- **SC-005**: For a learner with 2,000 words and 5,000 sentences, the server answers a Dictionary page or search within 100 ms, timed by a test on the owner's computer. (RQ-410; question-pages/72)

## Assumptions

- G-02's answer format grows three optional lists (`patterns`, `explanations`, `fixes`); answers without them still work.
- Speaking a word or a text uses the browser's built-in voices (C-03); speed, replay and the no-voice help are G-05's.
- "After answering" (RQ-10, RQ-276) is read as: after the questions of a practice or a text.
- Marking leaves for drilling, colouring them, Let it fall and drilling are G-04's; G-03's menu shows the status.
- Spaced repetition for patterns (RQ-171) is scheduled by G-04; G-03 makes patterns items that can be drilled.
- The own-text check is best effort (RQ-376); own texts stay private (constitution 4.16).
