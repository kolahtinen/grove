# Feature Specification: The look's extras and help (G-08)

**Feature Branch**: `main` (no feature branch; spec folder `specs/008-look-extras-help`)

**Created**: 2026-10-25

**Status**: Draft

**Input**: User description: "G-08: The look's extras and help. The feature description is the G-08 section of docs/middle-steps.md (Part 2), with Appendix A (motion, logo), the leaves-and-ground animation and its placements decided on question-pages/56, grove's terms (docs/glossary.md), and the phone header defect noted after G-02/G-04. Follow the combined requirements as written; every spec requirement names its RQ and N IDs."

**Sources**: `docs/middle-steps.md` (G-08 feed; Appendix A.3–A.5), `docs/requirements.md`, `docs/needs.md`, `question-pages/56` (slogan kept; the animation's storyboard and placements; built in G-08), `docs/glossary.md`, `docs/STATUS.md` (phone header: the Dictionary button overlaps the tagline and "Sign out" wraps at 360–390 px), `.specify/memory/constitution.md` v1.1.0.

**Requirement numbers**: FR-801…

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Understand leaves and the ground at a glance (Priority: P1)

Right after agreeing to the terms on a new sign-in, at the top of Home, the learner sees a 10-second animation drawn like the logo: a ground line draws, a tree rises, leaves with words bud, a ripe leaf falls to the ground, the ground thickens and the tree grows, then the three trees and "grove · grow from what you know". It can be skipped, replayed on the help page, and played by tapping the logo. With reduced motion, it shows four still frames with captions.

**Why this priority**: The method is grove's promise (N-25, N-26); the picture explains it faster than text (question-pages/56).

**Independent Test**: Agree on a new sign-in: the animation plays with its captions and ends on Home; Skip ends it at once; the help page's Replay plays it; a logo tap plays it; with reduced motion the four frames show instead.

**Acceptance Scenarios**:

1. **Given** a new sign-in that has just agreed to the terms, **When** Home opens, **Then** the animation plays once in a card at the top of Home, with Skip; when it ends or is skipped, the card goes away. It doesn't cover Home, so nothing is blocked. (RQ-311; question-pages/56)
2. **Given** the animation, **When** it plays, **Then** its five steps show in order with the captions "Every word you save is a leaf.", "When you know it, it falls to the ground.", "Your ground feeds everything you read next." and "grove · grow from what you know", drawn with 2px rounded strokes in the accent colour. (RQ-311, RQ-310; question-pages/56)
3. **Given** the help page or a tap on the logo, **When** chosen, **Then** the animation plays (Replay on the help page). (question-pages/56)
4. **Given** a device asking for reduced motion, **When** the animation would play, **Then** four still frames with their captions show instead. (RQ-308; question-pages/56)

---

### User Story 2 - A page that explains grove's terms (Priority: P1)

From every screen a "?" in the top bar opens **How grove works**: the animation (with Replay) and grove's terms — leaf, Leaves, To read, To remember, ground, fall, Let it fall, pick up, drill, Discover / Review / Master, the marking step, CEFR and levels, comprehensible input and the target share — in plain words.

**Why this priority**: RQ-370; learners trust a method they understand (N-25, N-26).

**Acceptance Scenarios**:

1. **Given** any page, **When** the learner taps "?", **Then** the help page opens and explains every term of docs/glossary.md plus the stages, CEFR and the share of known words. (RQ-370)

---

### User Story 3 - Finishing touches (Priority: P2)

Answer options are large rounded buttons: a right one turns green with a check mark and a small bounce, a wrong one red with a cross and a shake. The word menu slides up over a blurred background with a coloured header strip. With reduced motion, these become short fades. The top bar fits a phone: nothing overlaps or wraps at 360 px.

**Why this priority**: RQ-319, RQ-322 and the calm feel (N-34); the header defect looks broken on phones.

**Acceptance Scenarios**:

1. **Given** an answer, **When** it is right, **Then** its button turns green with a check mark and bounces (3% over 0.38 s); **when** wrong, red with a cross and a shake (0.4 s). (RQ-319; Appendix A.4)
2. **Given** a word tap, **When** the menu opens, **Then** it slides up 48 px and fades in over 0.25 s over a backdrop blurred 12 px, with a header strip in the pop-up border colour. (RQ-322; Appendix A.1, A.4)
3. **Given** reduced motion, **When** these happen, **Then** they are short fades only. (RQ-308)
4. **Given** a 360 px wide phone, **When** any signed-in page shows, **Then** the top bar's logo, name, tagline, buttons and email don't overlap and "Sign out" stays on one line. (RQ-309, RQ-341)
5. **Given** any page, **When** it opens, **Then** the top bar shows the logo drawn as in Appendix A.5 and the name grove with the tagline. (RQ-309, RQ-310, RQ-346)

---

### Edge Cases

- An older phone where blur and glows lag (R-15): reduced transparency or motion drops them (G-01 FR-031).
- The animation started twice (logo tapped while playing): the second tap is ignored.
- Skipping mid-way removes the card (Home) or closes the pop-up (logo tap).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-801** (RQ-311, RQ-310; N-34, N-25, N-26; question-pages/56): Grove MUST have the leaves-and-ground animation of question-pages/56 (about 10 s): (1) the ground line draws and one tree rises; (2) leaves with short word labels (hej, bok, läsa) bud, caption "Every word you save is a leaf."; (3) one leaf ripens (green → amber) and drifts down onto the ground line, caption "When you know it, it falls to the ground."; (4) more leaves fall, the ground line thickens into soil and the tree grows, caption "Your ground feeds everything you read next."; (5) the logo's three trees with "grove · grow from what you know". Drawn as an inline drawing with 2px rounded strokes in the accent colour, in both looks; a Skip button.
- **FR-802** (question-pages/56; N-25, N-26): The animation MUST play once after a new sign-in agrees to the terms (in a card at the top of Home that goes away when it ends or is skipped), on the help page (with Replay), and when the top-bar logo is tapped (in a pop-up with Skip; not while already playing).
- **FR-803** (RQ-308; N-11): With reduced motion, the animation MUST show four still frames with their captions instead, and grove's other motion (answer feedback, the menu) MUST be reduced to short fades (Appendix A.4).
- **FR-804** (RQ-370; N-25, N-26): A **How grove works** page MUST explain, in plain words, every term in docs/glossary.md and the three stages, the marking step, CEFR levels, and the share of known words in new texts; it shows the animation with Replay; a "?" button in the top bar of every page links to it (public, so it can be read before signing in too).
- **FR-805** (RQ-319; N-34): Answer options MUST be large rounded buttons (16px corners, Appendix A.3); a right answer turns green (`--ok`, `--ok-bg`) with a check mark and bounces 3% over 0.38 s; a wrong one turns red (`--bad`, `--bad-bg`) with a cross and shakes over 0.4 s (Appendix A.4) — on the reading page, practice, Review and Master.
- **FR-806** (RQ-322; N-34): The word menu MUST slide up 48 px and fade in over 0.25 s over a backdrop of `rgba(5,8,14,.35)` blurred 12 px, with a header strip in `--pbord` and its text in `--phtx` (Appendix A.1, A.4).
- **FR-807** (RQ-309, RQ-310, RQ-346, RQ-341; N-34): Every page's top bar MUST show the logo exactly as Appendix A.5 and the name grove with its tagline (RQ-309; the lower-case wordmark of the first build); at 360 px nothing in it overlaps and "Sign out" stays on one line (the tagline and email give way first).

### Key Entities

- **Animation due** (per browser tab): set when the terms are agreed and cleared once Home has shown it; kept in the browser only (nothing on the server). If the browser keeps nothing, the animation simply doesn't play after agreeing.

## Success Criteria *(mandatory)*

- **SC-001**: The animation runs 9–11 s, and Skip ends it within 0.3 s.
- **SC-002**: At 360 px, no two top-bar items overlap on any signed-in page (checked by a browser test).
- **SC-003**: Every glossary term appears on the help page (checked by a test).

## Assumptions

- The name is shown as the lower-case wordmark "grove" (as built since G-01 and on question-pages/56); RQ-309's "Grove" is the app's name in prose.
- The animation uses the browser's own animation features (no library), so the content security policy stays strict.
