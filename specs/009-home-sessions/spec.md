# Feature Specification: Home, sessions and the new look (G-09)

**Feature Branch**: `main` (no feature branch; spec folder `specs/009-home-sessions`)

**Created**: 2026-10-27

**Status**: Draft

**Input**: User description: "G-09 Home, sessions and the new look, from docs/addenda/004-home-and-sessions.md (RQ-419–428) and question-pages/74; mock-ups in docs/reviews/2026-10-26-home-v2/. Short name: home-sessions."

**Sources**: `docs/addenda/004-home-and-sessions.md` (RQ-419…428, R-24…26), `question-pages/74` (17 questions: the tile grid, sessions by time, topic and skill, the ☰ menu, palette 14, the mode banners, the order of work), `question-pages/64` (O-02, O-03, O-05, O-06), `docs/reviews/2026-10-26-home-v2/` (`p14-grid.png`, `p14-open-inplace.png`, `p14-session1.png`, `p14-modes-final2.png` B), `docs/needs.md`, `docs/glossary.md`, `.specify/memory/constitution.md`.

**Requirement numbers**: FR-901…

**Terms** (docs/glossary.md): **leaf**, **Leaves**, **ground**, **To remember**, **Discover / Review / Master** as in G-04. New here: a **session** is a planned run of exercises of a chosen length; an **exercise** is one item of a session (a text to read or hear, a word to review, a Master question); a **mode** is Discover, Review or Master.

**Changes to other goals** (each FR below names the rule it replaces): G-01 FR-011 (the terms' boxes), FR-014 (email and Sign out in the top bar), FR-026's colours (Appendix A.1); G-02 FR-201, FR-203, FR-223 (where the prompting lives on Home); G-03 FR-321 (the own-texts page joins Texts); G-04 FR-407 (Home's three stages), FR-414, FR-415 (level and minutes on Home); G-08 FR-802 (logo tap), FR-804 (the help page).

## Clarifications

### Session 2026-10-27

- Q: How long should grove count each kind of exercise for, when it plans a session? → A: The first guess (reading 100 words a minute, listening 80, a Review item 20 s, a Master item 25 s, a marking step 30 s); learning each learner's own times is for a later version.
- Q: How should grove fill a session's minutes with the three modes? → A: Review of the due and fading words first (fading first, at most 40% of the length), then one new or unfinished text that fits, then Master to fill (FR-905 as written).
- Q: A session left part-way — how long can it be resumed? → A: Until it is finished or another session is started; no time limit (FR-904).
- Q: Which session lengths should grove offer? → A: Practise: 3, 5, 10, 20 and 30 minutes, or a typed 3–60; By skill: Short 5, Medium 10, Long 20 minutes.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Find my way from a calm Home (Priority: P1)

The learner opens grove and sees a grid of square tiles, each with only an icon, under a top bar with the logo and a ☰ menu. Tapping a tile opens it across the grid, in place, with its title, a line about what it does and a way in; the tiles after it move down. Tapping it again or ✕ closes it. The ☰ menu holds Account, Settings, Help and Sign out. The logo always brings them back to Home.

**Why this priority**: Home was confusing (O-06); everything else is reached from here (RQ-419, RQ-420; N-34, N-19, N-39).

**Independent Test**: Sign in: Home shows the tiles (no Resume tile when no session is going); open each tile in turn and see its title, explanation and way in; open the menu and reach Account, Settings, Help (a bubble) and Sign out; tap the logo from any page and land on Home.

**Acceptance Scenarios**:

1. **Given** Home, **When** it opens, **Then** it shows square tiles with an icon each and no other text, in this order: Resume (only while a session is going), Practise for X min, Texts, By skill, Dictionary, Just one mode, Progress. (RQ-419)
2. **Given** a closed tile, **When** the learner taps it, **Then** it opens across the grid, below its row, showing its icon, title, a one-line explanation and its way in (a button, or the choices it needs); any other open tile closes; the tiles after it move down. Tapping it again or ✕ closes it. (RQ-419; question-pages/74, 12)
3. **Given** any page, **When** the learner taps the logo, **Then** Home opens. (RQ-420; O-02)
4. **Given** the ☰ menu, **When** opened, **Then** it shows Account, Settings, Help and Sign out; Help opens a bubble over the page with grove's terms and the animation's Replay, closed by ✕ or a tap outside. (RQ-420; O-05)
5. **Given** a new learner, **When** Home opens the first time, **Then** the welcome card shows above the grid until closed. (G-04 FR-416, kept)

---

### User Story 2 - Practise for as long as I have (Priority: P1)

The learner opens **Practise for X min**, picks 10 minutes and starts. grove plans a mix of Discover, Review and Master that fits, and shows one exercise at a time under "10-minute session · 3 of 8 · about 6 min left" and a bar. If they leave, a **Resume** tile on Home brings them back to the same exercise.

**Why this priority**: The owner's main way in (question-pages/74, 5, 6); a fixed length makes daily practice easy to fit in (N-19, N-39, N-32).

**Independent Test**: On the demo account, start 3, 5, 10 and 20 minutes: each plan's minutes add up to within 20% of the length; exercises show one at a time in grove's order; leaving and pressing Resume returns to the same exercise; at the end a summary shows.

**Acceptance Scenarios**:

1. **Given** the Practise tile open, **When** the learner picks 3, 5, 10, 20 or 30 minutes (or types 3–60) and presses Start, **Then** grove plans a session whose exercises' durations add up to within 20% of the length (or 2 minutes, whichever is more), mixing the modes, and shows the first exercise. (RQ-421)
2. **Given** a session, **When** it shows an exercise, **Then** only that exercise shows, in a card with the mode banner (FR-912), under "N-minute session · i of n · about m min left" and a progress bar; the learner can't reorder or skip ahead, only go on (Next, or the exercise's own end) or leave. (RQ-421; question-pages/74, 11)
3. **Given** a session left part-way, **When** the learner opens Home, **Then** a Resume tile is first in the grid; it opens the exercise they were on. Starting another session replaces it. (RQ-421)
4. **Given** the last exercise done, **When** the session ends, **Then** a short summary shows (minutes, texts read, words reviewed, words that fell) and the Resume tile goes. (RQ-421, N-29)

---

### User Story 3 - Texts on my topics (Priority: P1)

The learner opens **Texts**: their topics, each with its texts (new first), the shared library's texts on that topic when there are any, and **New texts**: two dropdowns for their AI and its version above a card that walks through the prompting steps (copy prompt, paste answer), or their own text. They can start a session on a topic.

**Why this priority**: Texts are grove's input (N-42, N-41); the prompting needs a home now that Home is tiles (question-pages/74, 2, 10).

**Independent Test**: Open Texts: the demo's topic lists its texts; choose AI and version, copy the prompt, paste a sample answer and see the new texts under the topic; add an own text; start a session on the topic and get its texts and words.

**Acceptance Scenarios**:

1. **Given** the Texts page, **When** it opens, **Then** it lists the learner's topics (from their packages and own texts), each with its texts, unread first, with kind (reading or listening), state and the Beta badge (G-02 FR-224). (RQ-422)
2. **Given** New texts, **When** the learner picks their AI and version from two dropdowns, **Then** below them a wizard card shows the current prompting step (the tactic's steps from G-02 FR-223: setup, copy prompt, paste answer, next part), one step at a time, inside the page (no pop-up window); the tactic tabs sit at the top of the card. (RQ-422; question-pages/74, 1, 2)
3. **Given** New texts, **When** the learner chooses their own text, **Then** the own-text form and list of G-03 FR-318 show (Beta). (RQ-422, RQ-418)
4. **Given** a topic, **When** the learner starts a session on it (with a length as FR-903), **Then** the plan takes Discover from that topic's unread texts and Review and Master from words met in its texts; with no unread text on it, the session says so and offers New texts with that topic filled in. (RQ-422)

---

### User Story 4 - Train one skill (Priority: P2)

The learner opens **By skill**, picks Listening and Medium, and starts: a session weighted to listening (listening texts, sentences played), still mixing the modes.

**Why this priority**: RQ-423; some days a learner wants one skill (N-37).

**Independent Test**: For each skill and each form, start a session on the demo account: its exercises lean to that skill; short picks texts with the lowest share of known words, long the highest.

**Acceptance Scenarios**:

1. **Given** By skill open, **When** the learner picks one of Reading, Listening, Words and phrases, Grammar and one of Short, Medium, Long, and starts, **Then** grove plans a session of that form's length whose exercises lean to the skill (FR-906). (RQ-423)
2. **Given** a form, **When** grove picks texts, **Then** short takes those with the lowest share of known words, long the highest, medium between (FR-906). (RQ-423; question-pages/74, 8)

---

### User Story 5 - One mode on its own (Priority: P2)

From **Just one mode**, the learner starts only Review (or only Discover, or only Master), as before the redesign.

**Acceptance Scenarios**:

1. **Given** Just one mode open, **When** the learner picks Discover, Review or Master, **Then** that mode runs alone as in G-04 (Review: due and fading leaves; Master: its exercises; Discover: the next unread text), in the same one-at-a-time cards. (RQ-424)

---

### User Story 6 - The new look and a clearer start (Priority: P2)

Every page uses palette 14 (spruce greens on sad beige; dark: deep green-black), and each exercise card's green banner carries two chips: the mode's icon and name, and its minutes, in the mode's colour. A new sign-in reads the terms one section per screen.

**Acceptance Scenarios**:

1. **Given** any page in either look, **When** shown, **Then** its colours are palette 14's (FR-913) and text meets contrast AA against its background. (RQ-426; R-26)
2. **Given** an exercise card, **When** shown, **Then** its banner is plain green with a chip holding the mode's icon (sprout, circle arrow, mountain) and name and a chip with its minutes, both in the mode's colour, in sentence case ("Review", "1 min"). (RQ-425)
3. **Given** a new sign-in, **When** the terms show, **Then** they come one section per screen; each Next unlocks after 3 seconds; the last screen has one Agree that records being 13 or over and agreeing to the terms. (RQ-428; O-03)
4. **Given** Settings, **When** opened, **Then** it holds speech speed and the voice help, Speak words, and Start the starting level again; Account holds the email and how to ask for an export or deletion. (RQ-427)

---

### Edge Cases

- No unread texts and no due words: a session by time plans Master and older texts to re-read; with nothing at all to do, the tile says so and offers New texts. (RQ-421)
- A text longer than the whole session: not picked; a shorter one is, or none (the session is then Review and Master only).
- The learner changes the session's length while one is going: starting a new one replaces it (the Resume tile shows the new one).
- A device without a Swedish voice: listening exercises aren't planned (G-05 FR-501); By skill → Listening says so and offers the voice help.
- The reviewer account (shared): one session at a time for the account; the last one started wins (as other shared data, question-pages/55).
- Reduced motion: tiles open and close without animation (G-08 FR-803).
- 360 px wide: three tiles per row; the open tile spans the row; nothing scrolls sideways (G-01 FR-005).

## Requirements *(mandatory)*

MUST for must-priority combined requirements, SHOULD for should-priority ones. Each requirement names the combined requirements (RQ-…) and needs (N-…) it comes from. Tests are named after the FR ID and its RQ IDs.

### Functional Requirements

**Home and navigation**

- **FR-901** (RQ-419; N-34, N-19, N-39): Home MUST be a grid of square tiles (three per row from 360 px), each showing only its icon, with an accessible name: Resume (only while a session is going), Practise for X min, Texts, By skill, Dictionary, Just one mode, Progress. Tapping a tile MUST open it in place across the grid, below its row, with its title, a one-line explanation and its way in, closing any other open tile and moving the tiles after it down; tapping it again or ✕ (or Esc) closes it. Replaces G-04 FR-407's stages and FR-414/FR-415's lines on Home (both move to Progress) and G-02 FR-201's package card on Home (it moves to Texts). The welcome card (G-04 FR-416) shows above the grid until closed.
- **FR-902** (RQ-420; N-34, N-17, N-25): Every signed-in page's top bar MUST show the logo (a link to Home; replaces G-08 FR-802's logo tap) and a ☰ button opening a menu with **Account**, **Settings**, **Help** and **Sign out** (replaces G-01 FR-014's email and Sign out in the bar). Help MUST open as a bubble over the page with How grove works' content and the animation's Replay (replaces G-08 FR-804's page link; `/how` stays for signed-out visitors and direct links).

**Sessions**

- **FR-903** (RQ-421; N-19, N-39, N-32, N-42): **Practise for X min** MUST offer 3, 5, 10, 20 and 30 minutes and a typed length of 3–60, and start a session planned by grove (FR-905) for that length.
- **FR-904** (RQ-421; N-19, N-32): A session MUST show one exercise at a time in grove's order, each in a card with its mode banner (FR-912), under "N-minute session · i of n · about m min left" and a progress bar of minutes done; the learner can only go on or leave. A session is kept for the learner on the server, with no time limit; while one is going, Home's first tile is **Resume**, opening the exercise they were on, until the session is finished or another is started (an old plan keeps its exercises; a Review word that is no longer due is still asked). Finishing shows a summary (minutes, texts, words reviewed, words that fell); starting another session replaces the one going.
- **FR-905** (RQ-421, RQ-422, RQ-423; N-39, N-42, N-12): grove MUST plan a session from exercises with known durations: a reading text its words ÷ 100 per minute, a listening text its words ÷ 80 per minute (time for replays), a Review item 20 s, a Master item 25 s, a marking step 30 s. The default plan for a length L: Review of the due and fading leaves first (at most 40% of L), then one Discover text that fits what is left (new or unfinished; reading or listening, whichever the learner did less of in the last 7 days), then Master items to fill; the planned minutes are within 20% of L or 2 minutes, whichever is more. An exercise is never longer than the session; with nothing to fill, the plan is shorter and says so.
- **FR-906** (RQ-423; N-37, N-13, N-44): **By skill** MUST offer Reading, Listening, Words and phrases, and Grammar, each Short (5 min), Medium (10 min) or Long (20 min). Discover then takes, among the learner's unread texts of the skill's kind (Grammar: texts with the most pattern places; Words and phrases: the shortest text), the one with the lowest share of known words for Short, the highest for Long and the one nearest the learner's target share (G-02) for Medium. The rest of the plan leans to the skill: Listening reviews play their sentence first; Words and phrases fills with Review and Master (phrases included); Grammar reviews the learner's pattern leaves first; Reading reviews show sentences (G-04 FR-406).
- **FR-907** (RQ-422; N-41, N-42): A session **by topic** (from Texts, FR-909) MUST take Discover from that topic's unread texts and Review and Master from leaves met in that topic's texts, planned as FR-905 for a chosen length.
- **FR-908** (RQ-424; N-07, N-39): **Just one mode** MUST offer Discover (the next unread text), Review (the due and fading leaves, G-04 FR-404) and Master (G-04 FR-407's exercises) on their own, shown in the same one-at-a-time cards; replaces G-04's Review and Master buttons on Home.

**Texts**

- **FR-909** (RQ-422, RQ-418; N-41, N-15, N-42): The **Texts** page MUST list the learner's topics (each package's topic; own texts under their title's topic or "My own texts"), each with its texts (unread first; kind, state, Beta badge as G-02 FR-219, FR-224), a **Start a session** on each topic (FR-907), and **New texts** with two parts: **From your AI** — two dropdowns, AI and version (G-02 FR-223's lists), above a wizard card whose steps are the prompting phases of the chosen tactic (setup, copy prompt, paste answer, next part), one step open at a time, inside the page, the tactic tabs at the top of the card — and **Your own text** (G-03 FR-318, FR-321). The library's texts per topic join this page when the library is built. Replaces G-02 FR-201's and FR-223's place on Home and G-03 FR-321's own page.

**Other pages**

- **FR-910** (RQ-427; N-19, N-17, N-20): **Settings** MUST hold speech speed with its note and the voice help (G-05 FR-502, FR-503), **Speak words** (G-03 FR-305) and **Start the starting level again** (G-06); **Account** MUST show the signed-in email, Sign out, and how to ask the owner for an export or deletion (G-01 FR-017). **Progress** keeps G-04 FR-415's contents and gains the level (FR-414) and today's minutes.
- **FR-911** (RQ-428; N-27, N-28, N-25; constitution 3.1): A new sign-in MUST read the terms one section per screen (the sections of G-01 FR-025), each with **Next** enabled after 3 seconds, and the last screen with one **Agree** that records both being 13 or over and agreeing (stated in its label: "I am 13 or over and agree to the terms"); replaces G-01 FR-011's two boxes. Already-agreed sessions are untouched.

**The look**

- **FR-912** (RQ-425; N-34): Every exercise card MUST have a plain green banner (`--accent`; dark `#2E5A40`) holding, at its left, a chip with the mode's icon (Discover a sprout, Review a circle arrow, Master a mountain) and name, and at its right a chip with its minutes ("1 min"), both chips in the card's colour with text and icon in the mode's colour, in sentence case, equal height, text centred (question-pages/74, 15 B).
- **FR-913** (RQ-426; N-34, N-11): grove's colours MUST be palette 14 (replacing Appendix A.1's colours; layout, radii and type stay): light — page `#ECE5DA`, cards `#EEEEE2`, raised `#F5F4EC`, text `#26241F`, muted `#74706A`, accent `#2F5A40` → `#5E8A66`; dark — page `#0F110E`, cards `#1A1F1A`, raised `#222822`, text `#E9EBE3`, muted `#9AA095`, accent `#6FA27E` → `#97C3A2`. Modes: light Discover `#C08552`, Review `#8C5A3C`, Master `#4B2E2B`; dark `#E3A46E`, `#C27A52`, `#9C5745`. The word colours (G-04 FR-413: To remember, fallen) and the ok, bad and Beta colours are re-picked from the same family, each meeting contrast AA where it is text. Every text colour MUST meet WCAG AA against its background in both looks (4.5:1; 3:1 for large text and chips).
- **FR-914** (RQ-419, RQ-155; N-20; constitution 2.3): Sessions MUST belong to one account; no account can read or change another's. A new migration keeps every learner's data (constitution 4.13).

### Key Entities

- **Session**: account, kind (time, topic, skill, one mode), length in minutes, its parameters (topic, skill and form, mode), the planned exercises in order, the index reached, started and finished times.
- **Exercise** (in a session): mode, what it is (a text, a leaf to review, a Master question, a marking step), its planned seconds, done or not.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: On the demo account, sessions of 3, 5, 10 and 20 minutes are planned within 20% of their length (or 2 minutes), checked by a test. (RQ-421; R-24)
- **SC-002**: From Home, any part of grove is reached in at most two taps after the tile opens (tile, then its way in). (RQ-419)
- **SC-003**: Every text colour in both looks meets WCAG AA against its background, checked by a test on every page. (RQ-426; R-26)
- **SC-004**: A timed 10-minute session on a phone takes 8–12 minutes for the owner (by hand, before the deploy). (RQ-421; R-24)
- **SC-005**: Opening a tile and starting a session answers within 0.5 s on the owner's computer (G-01 Q-05). (RQ-419, RQ-421)

## Assumptions

- Durations (FR-905) are fixed first guesses, confirmed in clarify, adjusted only if the timed session (SC-004) runs over or under: reading 100 words a minute and listening 80 (an A2 learner reading Swedish with help, listening with replays), 20 s a Review item, 25 s a Master item, 30 s a marking step. Learning each learner's own times is for a later version.
- The minute choices (3, 5, 10, 20, 30, typed 3–60) and the skill forms' lengths (Short 5, Medium 10, Long 20) were confirmed in clarify.
- The library (shared texts, question-pages/64, 7–8) isn't built yet; FR-909 leaves room for it per topic.
- G-04's Review and Master logic (schedules, falls) is unchanged; sessions only choose and order exercises.
- The help bubble reuses How grove works' content; the `/how` page stays public.
- Icons are drawn inline in the logo's stroke style (no icon font or outside files; G-01 FR-024).
