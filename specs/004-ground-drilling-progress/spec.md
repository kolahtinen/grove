# Feature Specification: Ground, drilling and progress (G-04)

**Feature Branch**: `main` (no feature branch; spec folder `specs/004-ground-drilling-progress`)

**Created**: 2026-10-24

**Status**: Draft (clarified 2026-10-24, question-pages/59)

**Input**: User description: "G-04: Ground, drilling and progress. The feature description is the G-04 section of docs/middle-steps.md (Part 2: Feed for Spec Kit), with grove's terms (docs/glossary.md, question-pages/56). Follow the combined requirements as written; every spec requirement names its RQ and N IDs."

**Sources**: `docs/middle-steps.md` (G-04 feed), `docs/requirements.md`, `docs/needs.md`, `docs/glossary.md`, `question-pages/56` (leaves and ground, Let it fall), `docs/middle/` (quality Q-03, Q-07; risks R-06, R-12), `.specify/memory/constitution.md` v1.1.0. Builds on G-01…G-03.

**Terms** (docs/glossary.md, question-pages/56): a **leaf** is a saved word, phrase or grammar pattern not learned yet; all leaves are in **Leaves**; a leaf can be marked **To remember** (recall and use; p0's "Heard words") and/or **To read** (recognise when reading; p0's "Reading list"); learned items are in the **Ground**; a leaf **falls** to the ground automatically when drilling succeeds, or with **Let it fall** after a quick check; a ground word can be **picked up** to drill again. A leaf that came with a text but hasn't been marked yet is **unmarked**.

**Requirement numbers**: FR-401… so test names stay unique across goals.

## Clarifications

### Session 2026-10-24

- Q: In the quick step after each text, what can a mark on a new word say? → A: Two switches per word, **To read** and **To remember** (either or both), setting how it is drilled; unmarked words fall to the ground on Done (question-pages/59).
- Q: What are Master's exercises in the first build? → A: The reverse direction: a gapped sentence plus the English meaning, pick the Swedish word; for leaves with gaps of 2 days or more; counts like Review (question-pages/59).

### Combined requirements changed in clarify

| RQ | As written | In this spec |
|---|---|---|
| RQ-52 | The learner marks words they don't know, only half know, or never remember | The learner marks words To read and/or To remember (how they're drilled); the three levels are not used (FR-401) |
| RQ-06 | Master: the hardest exercises (e.g. grammar build) | Master: the reverse direction for strong leaves, until grammar exercises arrive (FR-407) |

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Mark what I don't know; the rest joins my ground (Priority: P1)

After reading a text and rating it, the learner sees its new words (with meanings) and, for each word they don't know, switches on **To remember**. The marked ones become drilled leaves; the unmarked ones fall to the ground. It takes seconds, not minutes. (One switch since addendum 003: **To read** is only for languages with their own writing system.)

**Why this priority**: This is how practice goes to what the learner doesn't know (N-12) and how the ground grows, which in turn makes new texts harder (G-02 FR-208).

**Independent Test**: Read a sample text, rate it, switch on To remember for 2 of its 6 new words, press Done; the 2 are drilled leaves, the 4 are in the ground, and the next prompt lists the 4 as known.

**Acceptance Scenarios**:

1. **Given** a finished text, **When** the learner marks some new words and leaves the rest, **Then** the marked ones are drilled and the rest join the ground. (RQ-52, RQ-203, RQ-204, RQ-06)
2. **Given** the marking step, **When** it is shown, **Then** each new word shows its meaning and one tap marks it; the step fits on one phone screen for a text's usual 4–8 new words, with Done at the end. (RQ-52, R-12)
3. **Given** the marking step, **When** the learner switches on **To remember** for a word, **Then** it is drilled, starting with a 1-day gap; a word not switched on falls to the ground on Done. (RQ-52, RQ-07, RQ-415; question-pages/59, addendum 003)
4. **Given** the learner skips the marking step, **When** they leave the text, **Then** its new words stay unmarked leaves and the step is offered again next time the text is opened. (R-12)

---

### User Story 2 - Drill my leaves at the right time, in real sentences (Priority: P1)

Home shows three stages: **Discover** (new texts), **Review** (drilled leaves that are due, fading ones first) and **Master** (the hardest exercises). Review shows each leaf in a sentence the learner has read, with a Play button, and asks what the word means there. A right answer pushes the next review further out; once the gap reaches 4 days and the answer is right, the leaf falls to the ground.

**Why this priority**: Drilling makes forgotten words stick (N-04); it is the learning loop's second half.

**Independent Test**: With drilled leaves of different ages, open Review: fading leaves come first; answer right repeatedly (with the clock moved forward) and see the gap grow 1 → 2.5 → 6 days and the leaf fall on the third right answer; answer wrong and see the gap shrink.

**Acceptance Scenarios**:

1. **Given** drilled leaves, **When** the learner opens Review, **Then** fading leaves (strength below 0.2) come first, then those due, each in a sentence from a text the learner has read. (RQ-79, RQ-80, RQ-32, RQ-06)
2. **Given** a drilled leaf, **When** it is reviewed, **Then** grove shows the sentence with a **Play** button that speaks it, and asks what the word means there (multiple choice). (RQ-07, RQ-32, RQ-415; question-pages/73)
3. **Given** a right answer, **When** the leaf's gap was already 4 days or more, **Then** the leaf falls to the ground. (RQ-60, RQ-200)
4. **Given** a wrong answer, **When** it is recorded, **Then** the gap shrinks and the leaf comes back sooner. (RQ-170)
5. **Given** a ground word or an unmarked leaf, **When** time passes, **Then** it never fades and has no schedule. (RQ-169, RQ-170)
6. **Given** a word met in a new text, **When** the text is added, **Then** its "times met" count goes up, but its schedule doesn't change. (RQ-201, RQ-356)
7. **Given** drilled leaves with gaps of 2 days or more, **When** the learner opens Master, **Then** each is shown as a sentence they've read with that word blanked out plus its English meaning, and they pick the Swedish word from 3–4; the answer counts like a Review answer. (RQ-06; question-pages/59)

---

### User Story 3 - Mark, drop and pick up words myself (Priority: P2)

From the word menu, the learner marks any word To remember (it becomes a drilled leaf), presses **Let it fall** on a leaf they are sure of (after answering its meaning once — a grammar pattern just asks "Are you sure?"), or **picks up** a ground word, or a grammar pattern of the sentence, to drill it again (also from the Dictionary for ground words). On **Leaves**, they see their drilled leaves, each with play, meaning and delete, and can add a word, phrase or pattern by typing it.

**Why this priority**: Learners steer their own practice (N-12, N-32); the marking step covers the main flow.

**Independent Test**: Pick up a ground word from the menu; Let it fall on a leaf answering right and on another answering wrong; pick up a ground word; add "kanelbulle" on Leaves; see each in the right state.

**Acceptance Scenarios**:

1. **Given** the word menu on a ground word or an unmarked leaf, **When** the learner taps ↑ Pick up, **Then** it becomes a drilled leaf; the menu has no To remember switch (FR-409 since question-pages/95). (RQ-07, RQ-415, RQ-456)
2. **Given** a leaf, **When** the learner presses Let it fall and answers its meaning right, **Then** it falls to the ground; answered wrong, it stays a leaf; a pattern asks "Are you sure?" instead. (question-pages/56)
3. **Given** a ground word, **When** the learner picks it up, **Then** it becomes a drilled leaf again, due now. (glossary)
4. **Given** Leaves, **When** it opens, **Then** it lists drilled leaves, each with play, meaning and delete; delete removes the leaf without putting it in the ground. (RQ-08, RQ-415)
5. **Given** Leaves, **When** the learner types a word, phrase or pattern and adds it, **Then** it becomes a drilled leaf with its meaning from grove's word list; a word the list doesn't have asks the learner for their own meaning ("your best guess is fine"), which the next request has the AI check. (RQ-35, RQ-77, RQ-207, RQ-396, RQ-398)

---

### User Story 4 - See my leaves in my texts (Priority: P2)

In texts, saved words are coloured: To remember, and fallen (retired) from To remember; words that fell while marked To read before addendum 003 keep their colours.

**Why this priority**: Colours remind the learner what they're learning while reading (N-38).

**Independent Test**: With leaves in each state, open a text and check each word's colour class.

**Acceptance Scenarios**:

1. **Given** a text, **When** it is shown, **Then** words are coloured by state: To remember `--cw`, fallen from To remember `--rw`, and fallen while marked To read or both before addendum 003 `--rr`, `--rb` (Appendix A.1); no word has a dot or other mark for another reading. (RQ-294, RQ-413, RQ-415)

---

### User Story 5 - See my level and progress (Priority: P2)

Home shows the learner's overall level (from their ground) and today's minutes of input; **Progress** shows minutes per day for the last 14 days, the ground's size, and leaves being drilled.

**Why this priority**: Feeling progress keeps learners going (N-29, N-36).

**Independent Test**: With a ground covering 90% of A1 and A2 word lists, see "A2" on Home; read for two minutes and see today's minutes go up; open Progress and see the bars.

**Acceptance Scenarios**:

1. **Given** a ground that has 90% of a level's own words and of every level below, **When** the learner opens Home, **Then** the overall level shows that level; with no level reached, it shows "below A1"; without level word lists (before G-06 imports them), it shows "Set your starting level". (RQ-03, RQ-253)
2. **Given** the learner reads or listens with the page in view, **When** a minute passes, **Then** a minute of input is counted for today (at most what really passed). (RQ-48, RQ-71)
3. **Given** Progress, **When** it opens, **Then** it shows minutes of input per day for the last 14 days, the ground's size and the number of drilled leaves. (RQ-71)

---

### User Story 6 - Welcome, and never lose anything (Priority: P3)

On their first visit a learner sees a short welcome explaining leaves and the ground; every change is saved on grove's server at once, so nothing is lost when they switch devices or grove restarts.

**Why this priority**: Confidence in the method and the tool (N-25, N-26); saving is already how grove works.

**Independent Test**: Sign in as a new account and see the welcome once; mark a word, restart grove, and see the mark kept.

**Acceptance Scenarios**:

1. **Given** an account's first visit to Home, **When** it opens, **Then** a welcome card explains in a few lines what leaves, the ground and the three stages are, and stays dismissed once closed. (RQ-73)
2. **Given** a change grove says is saved, **When** grove or the owner's computer restarts, **Then** the change is still there. (RQ-75, Q-03)
3. **Given** a data-format change between builds, **When** grove starts, **Then** every learner's data is kept. (Q-03, R-06; constitution 4.13)

---

### Edge Cases

- 30–50 new words after a whole part: marking is per text (4–8 words), so no step is long. (R-12)
- A text read again after its words were marked: no marking step (nothing unmarked).
- A starter word (G-02) never met in a text: stays an unmarked leaf until marked from Leaves or the menu; it doesn't fall by itself.
- Let it fall on a word with fewer than 2 other meanings available: grove asks "Are you sure?" instead of a question.
- A leaf deleted from Leaves that appears again in a later text: it comes back as a new, unmarked leaf.
- Review with nothing due: Review says when the next leaf is due.
- The shared reviewer account used on two devices at once: the last answer wins; nothing is corrupted. (question-pages/55)
- Input time while the page is hidden or idle for over 2 minutes: not counted.

## Requirements *(mandatory)*

### Functional Requirements

**Marking and the ground**

- **FR-401** (RQ-52, RQ-203, RQ-204, RQ-415; N-04, N-12): After a text is rated, grove MUST offer a **marking step** listing that text's unmarked leaves with their meanings; marked ones become drilled leaves; on **Done** the unmarked ones fall to the ground (they count as known from then on). Skipping the step leaves them unmarked, and it is offered again when the text is next opened. Each word has one switch, **To remember**; a marked word starts with a 1-day gap (question-pages/59; RQ-52's three levels are not used; **To read** is gone for Swedish, RQ-415, addendum 003).
- **FR-402** (RQ-34, RQ-204; N-11): Unmarked leaves MUST count as new (not known) until they fall; the ground is what counts as known for every count and prompt (G-02 FR-213, FR-208).

**Drilling**

- **FR-403** (RQ-170, RQ-169; N-04, N-12): Only drilled leaves MUST have a schedule: a gap (days), the time of the last review and a strength = 2^(−days since last review ÷ gap). Ground items and unmarked leaves never fade.
- **FR-404** (RQ-79, RQ-80; N-04, N-38): A drilled leaf MUST count as **fading** when its strength is below 0.2, and as **due** when its strength is 0.5 or less; Review shows fading leaves first (weakest first), then due ones.
- **FR-405** (RQ-60, RQ-200; N-04): A right answer MUST multiply the gap by 2.5 (a new drilled leaf starts at 1 day); a right answer when the gap is already 4 days or more makes the leaf fall to the ground. A wrong answer halves the gap (never below half a day).
- **FR-406** (RQ-32, RQ-07, RQ-415; N-11, N-37): Review MUST show each leaf in a sentence from a text the learner has read (never as a bare word): the sentence shown with "what does *X* mean here?" and a **Play** button that speaks it (G-05 FR-501; question-pages/73, 2). Options as G-03 FR-310 (the meaning here and 2–3 other words' meanings). A leaf with no sentence (added by hand, never met) is shown with its meaning to recall first and gets sentences once met.
- **FR-407** (RQ-06; N-37, N-04): Home MUST show three stages: **Discover** (new texts: the G-02 package card and unread texts), **Review** (count of fading and due leaves, a start button) and **Master** (count and a start button). Master's exercises: the reverse direction — a sentence the learner has read with the leaf blanked out and its English meaning; pick the Swedish word from 3–4 (the leaf's form in that sentence and 2–3 other leaves' or ground words' forms); for drilled leaves with a gap of 2 days or more; the answer updates the schedule like a Review answer (question-pages/59).
- **FR-408** (RQ-201, RQ-356; N-04, N-29): Each item's **times met** MUST count its appearances in accepted texts (G-02's `uses`) and show in the word menu and the dictionary; meeting an item never changes its schedule.

**Marks, Let it fall, pick up, Leaves**

- **FR-409** (RQ-07, RQ-415, RQ-456; N-11, N-04, N-12): The word menu MUST NOT offer **To remember** (question-pages/95, 1: it did what Pick up does); a word becomes a drilled leaf from the menu by **Pick up** (FR-411). The To remember switch stays in the marking step (FR-401) and on Leaves' Unmarked section (FR-412). *(was: the word menu switches To remember on or off.)*
- **FR-410** (RQ-382, question-pages/56; N-12, N-32): The word menu MUST offer **Let it fall** on a leaf: grove asks its meaning once (multiple choice as FR-406); right → it falls to the ground; wrong → the learner chooses **Keep it** (it stays a leaf) or **Let it fall anyway** (it falls; B-28, question-pages/88); a pattern, or a word with fewer than 2 other meanings available, gets "Are you sure?" instead.
- **FR-411** (RQ-383, RQ-414, RQ-416, RQ-449, RQ-456, glossary; N-04, N-05): **Pick up** MUST be offered in the word menu on a ground word, a new word and an unmarked leaf (as **↑ Pick up <word>**), on each phrase and grammar pattern the word is part of that isn't a drilled leaf (as **Pick up this phrase / this pattern**; G-03 FR-305), and in both dictionaries (G-03 FR-316, G-09 FR-917, FR-926; a word of the common dictionary or a grove text that is not yet the learner's is added and picked up): the item becomes a drilled leaf marked To remember, due now, gap 1 day (addendum 003, O-16, O-21; question-pages/95).
- **FR-412** (RQ-08, RQ-35, RQ-77, RQ-207, RQ-415; N-38, N-11, N-21, N-42, N-12, N-32): A **Leaves** page MUST list drilled leaves (To remember), each with play, meaning and delete (delete removes the leaf, not to the ground); and an **Unmarked** section (starter words, skipped marking steps) with the To remember switch; and let the learner add a word, phrase or pattern by typing it (≤ 80 characters), which becomes a drilled leaf marked To remember, with its meaning from grove's word list (G-02 FR-222); when the list doesn't have it, the learner MUST give a meaning (≤ 200 characters, saved as the learner's, `en_source = learner`), and the next request has the AI confirm or correct it (G-02 FR-207, meaning checks).

**Colours**

- **FR-413** (RQ-294, RQ-413, RQ-415, RQ-426; N-38, N-45, N-34): In the reading view, words marked To remember MUST show in `--cw` (teal-green: light `#2E6B5E`, dark `#7CC2B0`) **with a dotted underline**, so colour is not the only sign (WCAG 1.4.1); fallen words (in the ground) look like any known word, plain, whatever marks they had (PD-13, question-pages/76, 13; the colours for words that fell while marked To read or both are withdrawn). There is no dot or other mark for a form that may be more than one word.

**Level and progress**

- **FR-414** (RQ-03, RQ-253; N-29, N-36, N-16): Home MUST show one overall level: the highest CEFR level that has, with every level below it, 90% of its own words in the ground, using level word lists (filled by G-06 from the Kelly list); none reached → "below A1"; no lists yet → "Set your starting level".
- **FR-415** (RQ-48, RQ-71; N-29, N-42): Grove MUST count minutes of input: while a text is in view and the learner active (a tap or scroll within the last 2 minutes), the page reports each half minute and grove adds it to today; Home shows today's minutes; **Progress** is as G-09 FR-924 says, and the minutes are also recorded per kind (reading, listening, other) as G-09 FR-925 says (B-27, question-pages/87; was: minutes per day for the last 14 days, the ground's size and the number of drilled leaves).

**Welcome and saving**

- **FR-416** (RQ-73; N-25, N-26): On an account's first visit to Home, a welcome card MUST explain leaves, the ground and the three stages in a few lines, until dismissed (kept per account).
- **FR-417** (RQ-75; N-16; Q-03): Every change MUST be saved on the server when grove confirms it; nothing is kept only in the browser (G-01 FR-002 makes it survive restarts).
- **FR-418** (RQ-384, RQ-415, Q-03, R-06; N-16; constitution 4.13): The new data MUST come with a migration that keeps every learner's data. Addendum 003's migration turns every To read mark into To remember, keeping each leaf's gap and last review, and drops the translations and keeps a new speak-words setting (on) per learner.

**Safety**

- **FR-419** (RQ-155; N-12; constitution 2.3): Marks, schedules, reviews, input minutes and settings MUST belong to one account; no account can read or change another's.

### Key Entities *(include if feature involves data)*

- **Item schedule** (on each word, phrase or pattern): marks (to_remember, to_read), drilled (yes/no), gap in days, last review time, times reviewed, marks when it fell.
- **Review answer**: account, item, right or wrong, mode (To read / To remember / Master), time.
- **Input day**: account, date, seconds of input.
- **Level word lists**: level (A1…C2), dictionary forms (filled by G-06).
- **Learner settings** gain: welcome dismissed.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Marking a text's new words takes under 20 seconds for 6 words on a phone. (R-12)
- **SC-002**: A drilled leaf answered right on schedule falls to the ground on its third right answer (gaps 1 → 2.5 → 6.25 days).
- **SC-003**: Review shows every fading leaf before any merely due one.
- **SC-004**: After a restart, 100% of marks, schedules and minutes grove confirmed are still there. (Q-03)

## Assumptions

- Level word lists come with G-06 (the Kelly list, CC BY-SA 3.0); until then the level line says "Set your starting level".
- The retire check (RQ-15, RQ-16) is not in G-04's feed; leaves fall by drilling, the marking step and Let it fall.
- Review speaks the sentence only when Play is pressed, with the browser's Swedish voice (G-05 adds speed and the no-voice help); without a voice, Play isn't offered.
- The prompts' "words to reuse" (G-02 FR-210) become the fading and due leaves once drilling exists.
- Grammar patterns are drilled like words: their review shows a sentence with the pattern marked and asks which explanation fits.
