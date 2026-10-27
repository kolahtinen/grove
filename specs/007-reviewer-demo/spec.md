# Feature Specification: Demo content for reviewers (G-07)

**Feature Branch**: `main` (no feature branch; spec folder `specs/007-reviewer-demo`)

**Created**: 2026-10-25

**Status**: Draft (clarified 2026-10-25, question-pages/61)

**Input**: User description: "G-07: Demo content for reviewers. The feature description is the G-07 section of docs/middle-steps.md (Part 2: Feed for Spec Kit), built from the X-03 Claude answer (docs/middle/ai-test/answer-claude.json), with the shared reviewer account of question-pages/55. Follow the combined requirements as written; every spec requirement names its RQ and N IDs."

**Sources**: `docs/middle-steps.md` (G-07 feed), `docs/requirements.md`, `docs/needs.md`, `docs/middle/ai-test/` (results.md, answer-claude.json, known.txt), `question-pages/55` (one shared reviewer account; RQ-360, RQ-363 changed), `docs/middle/constraints.md` (C-07, C-11), `.specify/memory/constitution.md` v1.1.0. Builds on G-01…G-06.

**Requirement numbers**: FR-701… so test names stay unique across goals.

## Clarifications

### Session 2026-10-25

- Q: Add an owner command to reset the shared reviewer account to the demo? → A: No; the demo is put in once when the reviewer account is created, and reviewers see each other's changes (question-pages/61).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Try grove fully before using an AI (Priority: P1)

A reviewer signs in to the shared reviewer account for the first time and lands on Home as a demo learner: a ground of a few hundred words, four ready-made Swedish texts (two of them read and rated), some drilled leaves (one fading, a few due today, one ready for Master), a few days of input minutes, and a finished package — so Review, Master, the word menu, the dictionary, Progress and the next prompt's summary all have something to show.

**Why this priority**: Reviewers (at most 5, C-11) should judge grove without first learning the copy-paste exchange (N-18); the demo makes every page meaningful from the first minute.

**Independent Test**: Create the reviewer account with the owner command and sign in: Home shows level "below A1" or higher, Review has due words, Master has one, the texts list has four texts (two rated), Progress shows minutes on earlier days, and the next prompt starts a new package with a summary of the two rated texts.

**Acceptance Scenarios**:

1. **Given** a reviewer account just created by the owner, **When** the reviewer first signs in, **Then** they skip the starting level and land on Home with the demo ground, drilled words, ratings and texts. (RQ-360, RQ-361, RQ-362, RQ-363)
2. **Given** the demo texts, **When** they are checked with grove's own checks against the demo ground, **Then** each passes (as an AI answer would). (RQ-361; edge case of the feed)
3. **Given** the demo history, **When** the reviewer opens Review and Master, **Then** Review has a fading leaf first and some due leaves, and Master has at least one leaf. (RQ-362)
4. **Given** the demo package is finished, **When** the reviewer asks for texts, **Then** the prompt is part 1 of a new package with a summary of the demo texts they rated. (RQ-362; G-02 FR-203)
5. **Given** the reviewer account, **When** Home is shown, **Then** it has no "Set my starting level again" (question-pages/55: RQ-363 changed). (RQ-363)

---

### Edge Cases

- The demo texts must pass grove's own checks against the demo ground. (feed)
- The X-03 answer's choose-your-path story: text kinds aren't in the first build, so it is turned into a plain text along one path (start → ask the neighbour → found it).
- The X-03 answer's dialogue: speaker names go at the start of each line ("Anna: …").
- The Swedish slips recorded in results.md ("har glömt … igår", "Den borta nyckeln", "Vem heter Olle?") are corrected in the demo.
- Demo dates are relative to the moment the demo is put in (creation or reset), so "due today" stays true.
- The demo is never shown to non-reviewer accounts.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-701** (RQ-360; N-18; question-pages/55): The reviewer account MUST be the one account created by the owner's `reviewer:setup` (G-01 FR-010), marked as the reviewer's when created — this is how RQ-360's "reviewer invitation" is met after page 55.
- **FR-702** (RQ-361; N-18, N-15; C-07): Grove MUST carry demo content in the AI answer format (G-02 FR-204), made in advance from the X-03 Claude answer: four texts — "En kall morgon", "Brevet i väskan", "Lördag på torget" (a dialogue, speaker names at line starts) and "Den borttappade nyckeln" (the choose-your-path story along one path) — with their questions, new words with meanings, new phrases, inflections and names; the recorded Swedish slips corrected. "Lördag på torget" is a **listening** text, the other three are **reading** texts (G-02 FR-202; 2026-10-26). AI-written content is used under the provider's terms (C-07).
- **FR-703** (RQ-361; N-18): The demo texts MUST pass grove's own answer checks (G-02 FR-205, FR-213, FR-214) against the demo ground, checked by a test.
- **FR-704** (RQ-362; N-18): The demo learner history MUST include: the demo ground (the X-03 known words, about 400); the four texts accepted as one finished package of grove's format; ratings on two texts ("most" and "a little") and answers to some of their questions; the texts' new words as leaves, of which six are drilled — one fading, three due, one with a gap of 2.5 days (for Master), one fresh — all marked To remember (To read is gone for Swedish: G-04 FR-401, addendum 003, RQ-415; until 2026-10-27 "with both kinds of marks"); input minutes on three of the last five days; the welcome not yet dismissed. All dates are relative to when the demo is put in. Every demo word, ground words included, MUST have an English meaning checked against the demo texts and a simple Swedish explanation (RQ-399, addendum 002): the build takes each ground word's meaning from grove's word list (G-02 FR-222), and `scripts/demo-meanings.json` confirms or corrects it and adds the explanation; the build fails if any demo word lacks either. Everything the demo reads while grove runs (the demo answer and the demo ground) MUST be built into `server/demo/` by `scripts/build-demo.mjs`; nothing grove runs reads a file in `docs/` (first-build review, finding 10).
- **FR-705** (RQ-363; N-18): The reviewer account MUST get the demo when it is created, skip the starting level, and have no "Set my starting level again" (G-06 FR-605, FR-606).
- **FR-706** *Withdrawn* (question-pages/61): an owner command to reset the demo; the demo is put in once, at creation, and reviewers see each other's changes on the shared account.
- **FR-707** (RQ-388, T-06; N-18; constitution 4.6): Demo content MUST be shown as plain text like any AI text.

### Key Entities *(include if feature involves data)*

- **Demo content**: a file in grove's AI answer format (the four texts and their lists).
- **Demo history**: a description (ratings, question answers, drilled leaves with ages and marks, input minutes) applied to the reviewer account relative to "now".

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A reviewer's first visit shows something on every page (Home stages, Review, Master, texts, dictionary, Progress) with no AI exchange.
- **SC-002**: The demo texts pass grove's checks with no fix-it round.
- **SC-003**: Creating the reviewer account with its demo takes under 2 seconds, once grove's start-up loads have run (G-01 FR-032; question-pages/71).

## Assumptions

- The demo ground is the X-03 known-word list (411 words), the ground the X-03 prompt was written for.
- Starting-check words and level lists (G-06) don't apply to the reviewer; its level line shows the level its demo ground reaches (likely "below A1").
- Demo content is English-explained Swedish only (C-09).
