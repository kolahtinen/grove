# Feature Specification: Starting level (G-06)

**Feature Branch**: `main` (no feature branch; spec folder `specs/006-starting-level`)

**Created**: 2026-10-25

**Status**: Draft (clarified 2026-10-25, question-pages/60)

**Input**: User description: "G-06: Starting level. The feature description is the G-06 section of docs/middle-steps.md (Part 2: Feed for Spec Kit), with the Swedish Kelly list as the level word lists and grove's terms (docs/glossary.md). Follow the combined requirements as written; every spec requirement names its RQ and N IDs."

**Sources**: `docs/middle-steps.md` (G-06 feed), `docs/requirements.md`, `docs/needs.md`, `docs/glossary.md`, `docs/middle/constraints.md` (C-05 licences, C-09 Swedish only), `docs/middle/feasibility.md` (F-113, F-114, X-p1-04: a level's words are the Kelly-list words tagged up to that level), `.specify/memory/constitution.md` v1.1.0 (4.14: imported word data keeps its source and licence; a credits page). Builds on G-01…G-04 (G-04's level line and `level_words`).

**The Kelly list** (checked 2026-10-25 at https://spraakbanken.gu.se/en/resources/kelly): the Swedish Kelly list from Språkbanken, 8,425 entries, each with a dictionary form, part of speech, frequency (per million words) and CEFR level 1–6 (A1–C2, about 1,400 entries per level); licence CC BY-SA 3.0 and LGPL 3.0. It has **no English meanings**.

**Requirement numbers**: FR-601… so test names stay unique across goals.

## Clarifications

### Session 2026-10-25

- Q: In the starting check, what happens to the words ticked as unknown? → A: They become unmarked leaves (not in the ground), waiting on Leaves to be marked later (question-pages/60).
- Q: What does "Set my starting level again" do to the ground? → A: It replaces only the words the earlier starting check added; everything learned from texts, drilling and Let it fall stays (question-pages/60).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Start from about what I know (Priority: P1)

A new learner (not the reviewer account) closes the welcome and lands on **Starting level**. They pick a CEFR level, or "I'm a complete beginner". Grove shows 30 of that level's words; the learner ticks the ones they don't know and confirms. The level's other words, and every word of the levels below, join their ground; Home now shows their level.

**Why this priority**: Texts are written from the ground (G-02); without a starting ground, a learner who isn't a beginner gets texts far below their level (N-13).

**Independent Test**: As a new account, pick A2, tick 5 of the 30 words, confirm; the ground holds the A1 and A2 words minus those 5, Home shows "Level: A2", and the next prompt lists A1/A2 words as known.

**Acceptance Scenarios**:

1. **Given** a new learner, **When** they choose a level, **Then** grove shows a sample of 30 of that level's words to tick as unknown, and on confirming the rest of that level's words and all words of the levels below join the ground. (RQ-113, RQ-114, RQ-249)
2. **Given** ticked words, **When** the learner confirms, **Then** they stay out of the ground as unmarked leaves (without meanings), waiting under Leaves → Unmarked to be marked later. (RQ-114; question-pages/60)
3. **Given** "I'm a complete beginner", **When** the learner chooses it, **Then** the ground stays empty and the first texts are beginner texts (G-02's empty-ground prompt). (edge case)
4. **Given** a new account other than the reviewer's, **When** the welcome is closed, **Then** grove goes straight to Starting level; the reviewer account doesn't. (RQ-248)
5. **Given** the learner ticks 20 or more of the 30 as unknown, **When** they confirm, **Then** grove suggests trying the level below, without forcing it. (edge case)

---

### User Story 2 - Change my starting level later (Priority: P2)

Home has **Set my starting level again**. It runs the starting check again with a level the learner picks.

**Why this priority**: A first guess can be wrong either way (R-11); the learner can fix it.

**Independent Test**: After starting at A2, run it again at B1 and at A1, and check the ground each time.

**Acceptance Scenarios**:

1. **Given** Home, **When** the learner taps "Set my starting level again", **Then** the starting check runs again. (RQ-252)
2. **Given** a learner who has learned words from texts and drilling since, **When** the check runs again, **Then** only the words the earlier starting check added are replaced by the new level's words; everything learned from texts, drilling and Let it fall stays. (RQ-252; question-pages/60)
3. **Given** the reviewer account, **When** Home is shown, **Then** it has no "Set my starting level again" (question-pages/55: RQ-363 changed). (RQ-252)

---

### User Story 3 - Level word lists with their source and licence (Priority: P1)

Grove carries the Kelly list as a plain file in the build, imports it into its level word lists with its source and licence, and names it on a **Credits** page with the fonts and any other sources.

**Why this priority**: The starting level and the level line (G-04 FR-414) depend on it, and its licence requires credit (C-05; constitution 4.14).

**Independent Test**: After start-up the level lists hold the cleaned Kelly words per level, each with source "Swedish Kelly list (Språkbanken)" and licence "CC BY-SA 3.0"; the Credits page names it with a link and its licence.

**Acceptance Scenarios**:

1. **Given** the Kelly file in the build, **When** grove starts, **Then** its level word lists hold each cleaned dictionary form once, at its lowest level, with source and licence. (RQ-117, C-05)
2. **Given** an entry with a note ("vara (vardagl. va)") or a duplicate, **When** it is imported, **Then** the note is dropped and the form appears once. (Q-07)
3. **Given** the Credits page, **When** anyone opens it, **Then** it names the Swedish Kelly list (Språkbanken, CC BY-SA 3.0 / LGPL 3.0, with a link) and the font (Zen Kaku Gothic New, SIL Open Font Licence). (C-05; constitution 4.14)

---

### Edge Cases

- A complete beginner: an empty ground. (feed)
- The learner ticks every sample word as unknown: the rest of the level still joins the ground, and grove suggests the level below. (feed)
- A level with fewer than 30 words left to sample (after duplicates): show them all.
- Entries that are phrases (several words): imported as phrases.
- A ground word from the starting level later met in a text: it is simply known (no marking step for it).
- The Kelly file missing from the build: grove starts, logs it, and the level line keeps saying "Set your starting level"; Starting level says it isn't available.

## Requirements *(mandatory)*

### Functional Requirements

**Level word lists**

- **FR-601** (RQ-117; N-43; C-05; constitution 4.14): **Reduced for the first build:** the Swedish Kelly list MUST be carried as a plain file in the build (not in a shared bank) and imported into grove's level word lists at start-up when missing or changed: each entry's dictionary form, cleaned of notes in brackets, lower-cased, at its CEFR level (1–6 → A1–C2); a form listed more than once is kept once at its lowest level; multi-word forms are phrases. Every imported word keeps its source ("Swedish Kelly list, Språkbanken") and licence ("CC BY-SA 3.0, LGPL 3.0").
- **FR-602** (C-05; N-43; constitution 4.14): A public **Credits** page MUST name every outside source: the Swedish Kelly list (Språkbanken; CC BY-SA 3.0, LGPL 3.0; link to its page) and the Zen Kaku Gothic New font (SIL Open Font Licence 1.1); it is linked from the terms page and Home.

**The starting check**

- **FR-603** (RQ-113; N-12, N-13): A learner MUST be able to pick a CEFR level (A1–C2), or "I'm a complete beginner" (empty ground).
- **FR-604** (RQ-114, RQ-249; N-12): After a level is picked, grove MUST show a sample of 30 of that level's words (spread over the level from most to least common), each tickable as "I don't know this"; confirming puts every word of the levels below and the level's other words in the ground (known). Words ticked as unknown become unmarked leaves, without meanings (question-pages/60).
- **FR-605** (RQ-248; N-13): A new account other than the reviewer's MUST go straight to the starting check after closing the welcome (G-04 FR-416), until it has made a choice; the reviewer account never does.
- **FR-606** (RQ-252; N-13): Home MUST show **Set my starting level again** (not for the reviewer account), running the check again. It replaces only what the earlier check added: starting-check words still untouched (never drilled, never met in a text, never fallen from a leaf) are removed, then the new choice is applied; everything else stays (question-pages/60).
- **FR-607** (R-11; N-13): When 20 or more of the 30 are ticked as unknown, grove MUST suggest the level below (one tap to switch), without forcing it.
- **FR-608** (RQ-03, RQ-253; N-13): After the check, G-04's level line MUST show the level from the ground (G-04 FR-414), now that level word lists exist.

**Safety and data**

- **FR-609** (RQ-155; N-12; constitution 2.3): The starting check MUST change only the learner's own words; level word lists are shared reference data that no learner can change.
- **FR-610** (Q-03; N-12; constitution 4.13): New data MUST come with a migration that keeps every learner's data.

### Key Entities *(include if feature involves data)*

- **Level word**: level (A1–C2), dictionary form, kind (word or phrase), source, licence (G-04's `level_words`, extended).
- **Source**: name, licence, link (for the Credits page).
- **Starting choice** (learner settings): the level chosen (or beginner), when, and whether the check is done.
- **Word origin**: whether a ground word came from the starting level (so a new starting level can tell it apart from words learned in texts).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new learner finishes the starting check in under 2 minutes.
- **SC-002**: After choosing A2 and ticking none, the ground holds every cleaned A1 and A2 word of the Kelly list (about 2,700).
- **SC-003**: The Credits page names every outside source, checked by a test. (constitution 4.14)
- **SC-004**: The Q-07 score does not drop with the Kelly forms in the ground. (Q-07)

## Assumptions

- The Kelly list's English meanings don't exist; ground words from it show "meaning missing" until a meanings prompt (G-03) fills them in.
- "The most common words for that level" (RQ-113) is read with X-p1-04: the Kelly words tagged up to that level.
- The reviewer account's starting ground is G-07's demo history.
- The shared bank (RQ-117 as written) is second build.
