# Feature Specification: Home, sessions and the new look (G-09)

**Feature Branch**: `main` (no feature branch; spec folder `specs/009-home-sessions`)

**Created**: 2026-10-27

**Status**: Draft

**Input**: User description: "G-09 Home, sessions and the new look, from docs/addenda/004-home-and-sessions.md (RQ-419–428) and question-pages/74; mock-ups in docs/reviews/2026-10-26-home-v2/. Short name: home-sessions."

**Sources**: `docs/addenda/004-home-and-sessions.md` (RQ-419…428, R-24…26), `docs/addenda/005-home-groups-libraries.md` (RQ-429…437, R-27…30; question-pages/76 and 77, 2026-10-29), `docs/addenda/006-learning-tiles-and-way-back.md` (N-46, RQ-440…447, R-32…37, T-23, T-24; question-pages/79, 80, 81, 2026-10-29), `question-pages/74` (17 questions: the tile grid, sessions by time, topic and skill, the ☰ menu, palette 14, the mode banners, the order of work), `question-pages/64` (O-02, O-03, O-05, O-06), `docs/reviews/2026-10-26-home-v2/` (`p14-grid.png`, `p14-open-inplace.png`, `p14-session1.png`, `p14-modes-final2.png` B), `docs/needs.md`, `docs/glossary.md`, `.specify/memory/constitution.md`.

**Requirement numbers**: FR-901…

**Terms** (docs/glossary.md): **leaf**, **Leaves**, **ground**, **To remember**, **Discover / Review / Master** as in G-04. New here: a **session** is a planned run of exercises of a chosen length; an **exercise** is one item of a session (a text to read or hear, a word to review, a harder question); a **mode** is Discover or Review (addendum 006: Master's harder questions are part of Review); a **session tile** is Discover, Review or Mix; a **skill** is Mix, Reading, Listening, Words or Grammar.

**Changes to other goals** (each FR below names the rule it replaces; addendum 006 also changes G-06 FR-603): G-01 FR-011 (the terms' boxes), FR-014 (email and Sign out in the top bar), FR-026's colours (Appendix A.1); G-02 FR-201, FR-203, FR-223 (where the prompting lives on Home); G-03 FR-321 (the own-texts page joins Texts); G-04 FR-407 (Home's three stages), FR-414, FR-415 (level and minutes on Home); G-08 FR-802 (logo tap), FR-804 (the help page).

## Clarifications

### Session 2026-10-27

- Q: How long should grove count each kind of exercise for, when it plans a session? → A: The first guess (reading 100 words a minute, listening 80, a Review item 20 s, a Master item 25 s, a marking step 30 s); learning each learner's own times is for a later version.
- Q: How should grove fill a session's minutes with the three modes? → A: Review of the due and fading words first (fading first, at most 40% of the length), then one new or unfinished text that fits, then Master to fill (FR-905 as written).
- Q: A session left part-way — how long can it be resumed? → A: Until it is finished or another session is started; no time limit (FR-904).
- Q: Which session lengths should grove offer? → A: Practise: 3, 5, 10, 20 and 30 minutes, or a typed 3–60; By skill: Short 5, Medium 10, Long 20 minutes.

### Session 2026-10-29 (the provisional decisions confirmed, question-pages/76; the branch test, question-pages/77; addendum 005)

- Q: A session runs out of things before its time: what fills it? → A: Reviews of leaves that aren't due yet (PD-28), as practice only: right or wrong, the leaf's schedule doesn't change (F1); then (question-pages/78, 3) a session that would run short first offers a new text, and filling mixes early reviews, re-reading and listening again. (FR-905)
- Q: Light-mode main buttons? → A: Flat dark green, no fade (question-pages/78, 1). (FR-913)
- Q: The tactics after switching? → A: All three always available, the recommended one labelled; after failures grove says which it now recommends (question-pages/78, 2; G-02 FR-223). (FR-919)
- Q: Reading speed for planning? → A: 70 words a minute below B1, 100 from B1, for now; a better measurement later (PD-02). The voice starts at 0.9× below B1 (PD-03). (FR-905, FR-921)
- Q: By skill's known shares? → A: Short 90–94%, Medium the target (95%), Long 98%+; the nearest when none is in the band, and the session says so (PD-04). (FR-906)
- Q: The summary? → A: Minutes, texts, words reviewed, words that fell, days practised this week; no streaks or goals (PD-05). (FR-904)
- Q: Tiles? → A: Icons with a one-word label from the start (PD-08), focus to the panel (PD-07), targets ≥ 44 px and no animation with reduced motion (PD-10, PD-11); Home in three headed groups, Learning, Library, Progress (B-04). (FR-901)
- Q: Colours? → A: PD-12's adjusted mode and muted colours; ok, bad and Beta as PD-14; To remember teal-green with a dotted underline (PD-13, G-04 FR-413). (FR-912, FR-913)
- Q: Texts and the library? → A: Your library (own texts by topic, Add a text, your dictionary, your leaves) and the Common library (shared texts by topic, level shown, a filter for every level up to a chosen one; the common dictionary over grove's whole word list) (B-04, PD-17, PD-18); the 50 approved grove texts fill the Common library (B-11). Add a text is one page with a third way, From the common library (B-10), leading to Texts from your AI (a wizard with a step list) and Your own text (B-05…B-09). With no unread text, Practise first offers the common library, Add a text or practising without a text (B-03). (FR-909, FR-915…FR-920)
- Q: Terms? → A: At sign-up, on each new device and when the terms change, with the version stored (B-01, PD-16; G-01 FR-011, constitution 3.1 2.0.0). (FR-911)

### Session 2026-10-29, later (the branch test's round 2, question-pages/79–81; addendum 006)

- Q: The Learning tiles? → A: Three, **Discover**, **Review**, **Mix**; each offers **Start** (10 minutes, skill Mix) and **Options…** (skill: Mix · Reading · Listening · Words · Grammar; length 5 · 10 · 20 · 30 minutes). They replace Practise for X min, By skill (with its Short, Medium and Long known-share bands, PD-04) and Just one mode (B-12…B-14). (FR-901, FR-903, FR-906, FR-908)
- Q: Master? → A: Inside Review: its harder questions come in Review sessions for well-known words, under a Review banner; Review's Options… also offer **Harder questions only**, built now (question-pages/79, 2; question-pages/81, 2). (FR-905, FR-912)
- Q: Resume? → A: A bar above the Learning tiles while a session is going (question-pages/79, 4). (FR-901, FR-904)
- Q: Topic sessions? → A: **Practise this topic** on each topic in Your library and the Common library: a 10-minute Mix on that topic (question-pages/79, 5). (FR-907, FR-915, FR-916)
- Q: A short session and the common library? → A: The offer has two choices, Add a text (its three ways include the common library) and Practise without (B-20); fill bars, Listening and Reading, only those the session's skill uses, filling as texts are added, turning into Start; the list showing only the kinds still needed, no Show all, and Texts from your AI asking only for them (B-23, question-pages/83); the bars stay on a text opened in full (question-pages/80, 1–3, 6; question-pages/81, 4). (FR-920)
- Q: Adding from the common library? → A: **+ Add** on each row and on the full text; each text shows its kind and minutes (question-pages/80, 3, 4). (FR-916)
- Q: Progress (B-27, sketch picked 2026-10-29, question-pages/85 (2), 87)? → A: Version B: the level card (started → now, today's minutes), four cards (read and listened in the last 7 days, leaves, ground), the last 7 days as bars, since you started; minutes first with words underneath; "this week" is the last 7 days; leaves are the ones drilled now; the ground counts the starting level's words, with that number shown. (FR-910, FR-924, FR-925)
- Q: Back? → A: A link at the top naming the page it belongs under; "‹ Back to your session" when a session sent the learner; the phone's Back as usual; Back, Esc or ✕ close overlays first; in a wizard, Back is the previous step (question-pages/80, 5). (FR-922, FR-923)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Find my way from a calm Home (Priority: P1)

The learner opens grove and sees a grid of square tiles, each with only an icon, under a top bar with the logo and a ☰ menu. Tapping a tile opens it across the grid, in place, with its title, a line about what it does and a way in; the tiles after it move down. Tapping it again or ✕ closes it. The ☰ menu holds Account, Settings, Help and Sign out. The logo always brings them back to Home.

**Why this priority**: Home was confusing (O-06); everything else is reached from here (RQ-419, RQ-420; N-34, N-19, N-39).

**Independent Test**: Sign in: Home shows the tiles (no Resume bar when no session is going); open each tile in turn and see its title, explanation and way in; open the menu and reach Account, Settings, Help (a bubble) and Sign out; tap the logo from any page and land on Home.

**Acceptance Scenarios**:

1. **Given** Home, **When** it opens, **Then** it shows labelled icon tiles in three headed groups: **Learning** (Discover, Review, Mix; the Resume bar above them only while a session is going), **Library** (Common library, Your library) and **Progress**. (RQ-429, RQ-440, RQ-442)
2. **Given** a closed tile, **When** the learner taps it, **Then** it opens across the grid, below its row, showing its icon, title, a one-line explanation and its way in (a button, or the choices it needs); any other open tile closes; the tiles after it move down. Tapping it again or ✕ closes it. (RQ-419; question-pages/74, 12)
3. **Given** any page, **When** the learner taps the logo, **Then** Home opens. (RQ-420; O-02)
4. **Given** the ☰ menu, **When** opened, **Then** it shows Account, Settings, Help and Sign out; Help opens a bubble over the page with grove's terms and the animation's Replay, closed by ✕ or a tap outside. (RQ-420; O-05)
5. **Given** a new learner, **When** Home opens the first time, **Then** the welcome card shows above the grid until closed. (G-04 FR-416, kept)

---

### User Story 2 - Discover, Review or Mix, for as long as I have (Priority: P1)

The learner taps **Mix** and presses **Start**: grove plans a 10-minute session of new texts and reviews, and shows one exercise at a time under "10-minute Mix · 3 of 8 · about 6 min left" and a bar. Or they tap **Review**, open **Options…**, choose Listening and 5 minutes, and start. If they leave, a **Resume** bar above the tiles brings them back to the same exercise.

**Why this priority**: The owner's design for a simpler Learning (B-14; question-pages/79); a fixed length makes daily practice easy to fit in (N-19, N-39, N-32).

**Independent Test**: On the demo account, start each tile with Start, and with each length and skill from Options…: each plan's minutes add up to within 20% of the length or the short-session offer comes; Discover plans only new texts, Review only reviews and harder questions, Mix both; exercises show one at a time; leaving and pressing Resume returns to the same exercise; at the end a summary shows.

**Acceptance Scenarios**:

1. **Given** a Learning tile open, **When** the learner presses **Start**, **Then** grove plans a 10-minute session of that tile with skill Mix (FR-905) and shows the first exercise. (RQ-440)
2. **Given** a Learning tile open, **When** the learner presses **Options…**, chooses a skill (Mix, Reading, Listening, Words, Grammar) and a length (5, 10, 20, 30 minutes) and starts, **Then** the session is that tile's, of that length, leaning to that skill (FR-906). On Review, Options… also offer **Harder questions only**. (RQ-440, RQ-441)
3. **Given** a session, **When** it shows an exercise, **Then** only that exercise shows, in a card with the mode banner (FR-912), under "N-minute <tile> · i of n · about m min left" and a progress bar; the learner can't reorder or skip ahead, only go on (Next, or the exercise's own end) or leave. (RQ-421; question-pages/74, 11)
4. **Given** a session left part-way, **When** the learner opens Home, **Then** a Resume bar sits above the Learning tiles ("▶ Resume: 10-minute Mix · 3 of 9"); it opens the exercise they were on. Starting another session replaces it. (RQ-442)
5. **Given** the last exercise done, **When** the session ends, **Then** a short summary shows (minutes, texts read, words reviewed, words that fell) and the Resume bar goes. (RQ-421, N-29)

---

### User Story 3 - Texts on my topics (Priority: P1)

The learner opens **Texts**: their topics, each with its texts (new first), the shared library's texts on that topic when there are any, and **New texts**: two dropdowns for their AI and its version above a card that walks through the prompting steps (copy prompt, paste answer), or their own text. They can start a session on a topic.

**Why this priority**: Texts are grove's input (N-42, N-41); the prompting needs a home now that Home is tiles (question-pages/74, 2, 10).

**Independent Test**: Open Texts: the demo's topic lists its texts; choose AI and version, copy the prompt, paste a sample answer and see the new texts under the topic; add an own text; start a session on the topic and get its texts and words.

**Acceptance Scenarios**:

1. **Given** the Texts page, **When** it opens, **Then** it lists the learner's topics (from their packages and own texts), each with its texts, unread first, with kind (reading or listening), state and the Beta badge (G-02 FR-224). (RQ-422)
2. **Given** New texts, **When** the learner picks their AI and version from two dropdowns, **Then** below them a wizard card shows the current prompting step (the tactic's steps from G-02 FR-223: setup, copy prompt, paste answer, next part), one step at a time, inside the page (no pop-up window); the tactic tabs sit at the top of the card. (RQ-422; question-pages/74, 1, 2)
3. **Given** New texts, **When** the learner chooses their own text, **Then** the own-text form and list of G-03 FR-318 show (Beta). (RQ-422, RQ-418)
4. **Given** a topic in Your library or the Common library, **When** the learner presses **Practise this topic**, **Then** a 10-minute Mix on that topic starts (FR-907): new texts from that topic, reviews and harder questions from words met in its texts; with no unread text on it, the short-session offer (FR-920) comes. (RQ-443)

---

### User Story 4 - Train one skill (Priority: P2)

From any Learning tile's **Options…**, the learner picks Listening: the session leans to listening (listening texts, reviews that play their sentence first).

**Why this priority**: RQ-440; some days a learner wants one skill (N-37). (Was: a By skill tile with Short, Medium and Long forms, replaced by addendum 006.)

**Independent Test**: For each tile and each skill, start a session on the demo account: its exercises lean to that skill (FR-906).

**Acceptance Scenarios**:

1. **Given** Options… on a tile, **When** the learner picks Reading, Listening, Words or Grammar and starts, **Then** grove plans that tile's session leaning to the skill (FR-906). (RQ-440)

---

### User Story 5 - Harder questions in Review (Priority: P2)

The learner's well-known words come back in Review as harder, reversed questions (what was Master's); from Review's Options…, **Harder questions only** gives a session of just those.

**Why this priority**: RQ-441; Master is no longer a choice of its own (B-14), but what it practised stays (N-35).

**Acceptance Scenarios**:

1. **Given** a Review or Mix session, **When** grove plans it, **Then** it includes harder questions for well-known words after the due and fading ones, each under a Review banner (FR-905, FR-912). (RQ-441)
2. **Given** Review's Options… with Harder questions only, **When** the learner starts, **Then** the session holds only harder questions; with too few well-known words, it says so and offers Start shorter (FR-905). (RQ-441)

---

### User Story 6 - The new look and a clearer start (Priority: P2)

Every page uses palette 14 (spruce greens on sad beige; dark: deep green-black), and each exercise card's green banner carries two chips: the mode's icon and name, and its minutes, in the mode's colour. A new sign-in reads the terms one section per screen.

**Acceptance Scenarios**:

1. **Given** any page in either look, **When** shown, **Then** its colours are palette 14's (FR-913) and text meets contrast AA against its background. (RQ-426; R-26)
2. **Given** an exercise card, **When** shown, **Then** its banner is plain green with a chip holding the mode's icon (sprout, circle arrow) and name and a chip with its minutes, both in the mode's colour, in sentence case ("Review", "1 min"); a harder question shows as Review. (RQ-425, RQ-441)
3. **Given** a new sign-in, **When** the terms show, **Then** they come one section per screen; each Next unlocks after 3 seconds; the last screen has one Agree that records being 13 or over and agreeing to the terms. (RQ-428; O-03)
4. **Given** Settings, **When** opened, **Then** it holds speech speed and the voice help, and Start the starting level again (Speak words withdrawn, question-pages/86); Account holds the email and how to ask for an export or deletion. (RQ-427)

---

### User Story 7 - Fill a short session from the common library (Priority: P1)

The learner starts a 10-minute Mix, but there aren't enough new texts. grove offers **Add a text** or **Practise without**. They choose Add a text, then From the common library; the library opens showing what is still needed, with two bars at the bottom, "Listening 0 of 4 min" and "Reading 0 of 3 min". Each text shows its kind and minutes and has **+ Add**. Adding fills the bars; when both are full they become **▶ Start your session**.

**Why this priority**: The owner lost the session going to the library (B-15) and lost the list opening a text (B-16) (RQ-444, RQ-445; N-46, N-39).

**Independent Test**: On an account with no unread texts, start a 10-minute Mix, pick the common library, add texts until the bars are full, press Start: the session plans its full length.

**Acceptance Scenarios**:

1. **Given** the short-session offer, **When** shown, **Then** it has two choices, Add a text and Practise without (B-20). **Given** Add a text from the offer, **When** the learner picks From the common library, **Then** it lists only the kinds still needed (no Show all) with a bar for each kind the session's skill uses (Reading: Reading; Listening: Listening; Mix, Words, Grammar: both), each "m of n min". (RQ-444)
2. **Given** the bars, **When** the learner presses + Add on a row, **Then** the text is added without leaving the list, the row shows Added, and its bar fills by the text's minutes; a full bar shows ✓ and the list drops its kind. (RQ-444, RQ-445)
3. **Given** all bars full, **When** shown, **Then** they turn into **▶ Start your session**, which plans the session (FR-905) at its full length. Tapping the bars earlier returns to the session, which plans with what there is. (RQ-444; R-34)
4. **Given** the bars, **When** the learner taps a text's title, **Then** the full text opens with ‹ Common library at the top, + Add, and the bars still at the bottom; ‹ Common library returns to the list, still filtered, at the same place. (RQ-444, RQ-445)
5. **Given** the Common library opened from Home, **When** shown, **Then** there are no bars and no filter by kind; each row still shows its kind, minutes and + Add. (RQ-445)

---

### User Story 8 - Always know the way back (Priority: P2)

On every page, a link at the top names where it goes ("‹ Your library"); when a session sent the learner somewhere, it says "‹ Back to your session". The phone's Back works as usual, and closes an open menu or sheet first.

**Why this priority**: B-17 ("how do you know what back means"); RQ-446; N-46.

**Independent Test**: Visit every signed-in page: the top link names its parent from the page map (FR-922) and goes there; open the ☰ menu and press Back or Esc: the menu closes and the page stays; in the AI wizard, ‹ Back is the previous step.

**Acceptance Scenarios**:

1. **Given** any signed-in page but Home, **When** shown, **Then** its top bar has "‹ <parent>" from FR-922's page map, going there. (RQ-446)
2. **Given** a page reached from a session's offer (FR-920), **When** shown, **Then** the link reads "‹ Back to your session" and returns to it; after the session ends or another starts, the page shows its parent link again. (RQ-446; T-23)
3. **Given** an open menu, sheet or bubble, **When** the learner presses the phone's Back, Esc or ✕, **Then** it closes and the page stays. (RQ-446)

---

### User Story 9 - See how far I've come (Priority: P2)

The learner opens **Progress**: the level they started at beside their level now, with today's minutes; four cards (read and listened in the last 7 days, the leaves they are drilling, their ground); the last 7 days as bars, read and listened apart; and what they have done since they started. Each card opens its details.

**Why this priority**: B-27; feeling progress keeps a learner going (N-29, N-36). Picked from the sketch (question-pages/87: version B).

**Independent Test**: On the demo account, open Progress: every number matches the account's data (texts read and listened by day, leaves, ground and its starting-level share, starting level and level now).

**Acceptance Scenarios**:

1. **Given** Progress, **When** it opens, **Then** the first card shows "Progress", today's minutes ("today 19 min"), and two boxes, **Started** (the starting level and the day it was set) → **Now** (FR-414's level and since when), with "How your level is found ›". (RQ-448)
2. **Given** Progress, **When** shown, **Then** four cards follow, two per row on a phone and four in a row on a wide screen: **Read** and **Listened** in the last 7 days (minutes, words underneath), **Leaves (drilling)** (words, grammar patterns underneath) and **In your ground** (words, grammar patterns underneath); each opens its details (the days; the words and patterns on its tab). (RQ-448)
3. **Given** Progress, **When** shown, **Then** "Last 7 days, each day" shows one bar per day ending today, read and listened stacked and told apart by a legend and a pattern as well as colour; tapping a bar gives that day's minutes and words. (RQ-448)
4. **Given** Progress, **When** shown, **Then** "Since you started (date)" lists read and listened (minutes, words), words and patterns ever picked up, and the ground with "N of them from your starting level". (RQ-448)
5. **Given** a brand-new learner, **When** Progress opens, **Then** the numbers are 0, the bars say nothing yet with a way to Discover, and a beginner's level reads "below A1". (RQ-448)

---

### Edge Cases

- No unread texts: FR-920's two choices first (Add a text, Practise without); practising without a text plans reviews, harder questions and practice reviews (FR-905); with nothing at all to do, the panel says so and offers Add a text. (RQ-421, RQ-434)
- A text longer than the whole session: not picked; a shorter one is, or none (the session is then reviews and harder questions only).
- The learner changes the session's length while one is going: starting a new one replaces it (the Resume bar shows the new one).
- A device without a Swedish voice: listening exercises aren't planned (G-05 FR-501); a Listening skill in Options… says so and offers the voice help; the fill bars show only Reading.
- Fill bars and a text added elsewhere (another device, Add a text): the bars count every text added to the learner's library since the offer, wherever it was added.
- Every common-library text of the needed kinds already added: the list says so and offers Texts from your AI (asking for those kinds).
- Harder questions only with few or no well-known words: the Review plan says so and offers Fill the time (more harder questions only when there are any) or Start shorter; with none at all, it says so and offers a Review session instead.
- A page opened directly (bookmark, reload) without a session's offer: it shows its parent link.
- The reviewer account (shared): one session at a time for the account; the last one started wins (as other shared data, question-pages/55).
- Reduced motion: tiles open and close without animation (G-08 FR-803).
- 360 px wide: three tiles per row; the open tile spans the row; nothing scrolls sideways (G-01 FR-005).

## Requirements *(mandatory)*

MUST for must-priority combined requirements, SHOULD for should-priority ones. Each requirement names the combined requirements (RQ-…) and needs (N-…) it comes from. Tests are named after the FR ID and its RQ IDs.

### Functional Requirements

**Home and navigation**

- **FR-901** (RQ-419, RQ-429, RQ-440, RQ-442; N-34, N-19, N-39): Home MUST be one page of square tiles (three per row from 360 px), each showing its icon with a one-word label under it and having that label as its accessible name, in three headed groups: **Learning** — Discover (the sprout), Review (the circle arrow), Mix (a sprout and a circle arrow together), with the **Resume** bar above them only while a session is going (FR-904) (addendum 006; was Resume, Practise for X min, By skill, Just one mode); **Library** — Common library (FR-916), Your library (FR-915); **Progress** — Progress. Tapping a tile MUST open it in place across the grid, below its row within its group, with its title, a one-line explanation and its way in, closing any other open tile and moving the tiles after it down; opening moves focus to the panel's title; tapping it again, ✕ or Esc closes it and returns focus to the tile (PD-07); tiles, ✕ and choices are at least 44 px (PD-10); with reduced motion the panel appears at once (PD-11). Replaces G-04 FR-407's stages and FR-414/FR-415's lines on Home (both move to Progress) and G-02 FR-201's package card on Home (it moves to Texts from your AI, FR-919). The welcome card (G-04 FR-416) shows above the groups until closed. (Was: one grid of seven icon-only tiles, addendum 004.)
- **FR-902** (RQ-420; N-34, N-17, N-25): Every signed-in page's top bar MUST show the logo (a link to Home; replaces G-08 FR-802's logo tap) and a ☰ button opening a menu with **Account**, **Settings**, **Help** and **Sign out** (replaces G-01 FR-014's email and Sign out in the bar). Help MUST open as a bubble over the page with How grove works' content and the animation's Replay (replaces G-08 FR-804's page link; `/how` stays for signed-out visitors and direct links).

**Sessions**

- **FR-903** (RQ-440, RQ-441; N-19, N-39, N-32, N-42, N-07): Each Learning tile (**Discover**, **Review**, **Mix**) MUST open with a one-line explanation, **Start** and **Options…**. Start begins a 10-minute session of that tile with skill Mix. Options… MUST show the skill (Mix default · Reading · Listening · Words · Grammar) and the length (5 · 10 default · 20 · 30 minutes), and on Review only a **Harder questions only** switch (off by default), then Start. grove plans the session as FR-905 for that tile, skill and length. The last options used on a tile are shown next time, not applied by Start. (Addendum 006; was Practise for X min with 3, 5, 10, 20, 30 or a typed 3–60.)
- **FR-904** (RQ-421, RQ-442; N-19, N-32, N-29, N-46): A session MUST show one exercise at a time in grove's order, each in a card with its mode banner (FR-912), under "N-minute <tile> · i of n · about m min left" (e.g. "10-minute Mix", "5-minute Review"; a topic session "10-minute Mix: Food and drink") and a progress bar of minutes done; the learner can only go on or leave. A session is kept for the learner on the server, with no time limit; while one is going, a **Resume** bar sits above the Learning tiles ("▶ Resume: 10-minute Mix · 3 of 9"), opening the exercise they were on, until the session is finished or another is started (an old plan keeps its exercises; a Review word that is no longer due is still asked). Finishing shows a summary: minutes, texts, words reviewed, words that fell, and the days practised this week (Monday to Sunday); no streaks or goals (PD-05). Starting another session replaces the one going.
- **FR-905** (RQ-421, RQ-422, RQ-440, RQ-441; N-39, N-42, N-12, N-38, N-35): grove MUST plan a session from exercises with known durations: a reading text its words ÷ 70 per minute for a learner below B1 and ÷ 100 from B1 (the level of G-04 FR-414, else the one picked at the start, G-06 FR-605; no level counts as below B1) (PD-02), a listening text its words ÷ 80 per minute (time for replays), a Review item 20 s, a harder question 25 s, a marking step 30 s. These durations are the only estimate: the plan, the minutes shown on texts (FR-916) and the fill bars (FR-920) all use them (R-34). A **harder question** is G-04 FR-407's reverse-direction exercise (Master's), asked of a **well-known word**: a drilled leaf with a gap of 2 days or more; it is part of Review and answers like a Review item (addendum 006, RQ-441). The **text kinds** a skill uses: Reading → reading texts; Listening → listening texts (only with a voice); Mix, Words, Grammar → both, half each (all reading without a voice). The plan for a tile, skill and length L (addendum 006; was one default plan for Practise for X min):
  - **Mix**: Review first, at most 40% of L: the due and fading leaves (fading first), then harder questions; then **new texts** (new or unfinished, of the skill's kinds, as FR-906 chooses them) for the rest; the **text target** is L minus that Review, split between the kinds.
  - **Discover**: new texts only; the text target is L.
  - **Review**: the due and fading leaves (fading first), then harder questions, at most a third of L while due or fading leaves remain (R-33); no texts. With **Harder questions only**: harder questions only, the most overdue gap first.
  When the new texts the learner has cover less than 80% of the text target (Mix, Discover), grove MUST first make the short-session offer (FR-920). When a Review plan is under 80% of L, grove MUST say so and offer **Fill the time** or **Start shorter**. Filling (the offer's Practise without, or a Review plan's Fill the time) adds, while the plan is under 80% of L, a mix taken in turn from three kinds, each item at most once: **practice reviews** of leaves that aren't due yet (the soonest due first), **re-reading** a read reading text (the longest ago first, no marking step) and **listening again** to a read listening text (the longest ago first; only with a voice) (PD-28; question-pages/78, 3: "fill time with a mix"); a Discover session fills only with re-reading and listening again, a Harder questions only session with more harder questions only. A practice review is shown like a Review item, but its answer never changes the leaf's schedule, strength or falling, right or wrong (question-pages/76, F1). The planned minutes are within 20% of L or 2 minutes, whichever is more. An exercise is never longer than the session; with nothing to fill, the plan is shorter and says so.
- **FR-906** (RQ-440, RQ-423; N-37, N-13, N-44): The **skill** chosen in Options… (FR-903) MUST shape the plan. New texts: of the skill's kinds (FR-905), unfinished first, then the one nearest the learner's target share of known words (G-02, normally 95%); Grammar prefers texts with the most pattern places, Words the shortest. Reviews: Listening plays each sentence first; Reading shows sentences (G-04 FR-406); Grammar takes the learner's pattern leaves first; Words takes words and phrases only; Mix as G-04. (Addendum 006: By skill's tile and its Short, Medium and Long known-share bands, PD-04, are gone.)
- **FR-907** (RQ-443, RQ-422; N-41, N-42, N-07): **Practise this topic** (on each topic in Your library, FR-915, and the Common library, FR-916) MUST start a 10-minute Mix on that topic, planned as FR-905: new texts from the learner's unread texts on that topic, reviews and harder questions from leaves met in that topic's texts (then any due or fading leaves when those run out). The short-session offer (FR-920) opens the Common library on that topic.
- **FR-908** (RQ-424; N-07, N-39): *Withdrawn* by addendum 006 (RQ-440, RQ-441): Just one mode is replaced by the Discover and Review tiles (FR-903) and Master by harder questions inside Review (FR-905). The Master route and its exercises stay only as Review's harder questions.

**Texts**

- **FR-909** (RQ-422, RQ-418, RQ-430, RQ-435; N-41, N-15, N-42): The texts a learner has MUST be in **Your library** (FR-915) by topic; adding texts is the **Add a text** page (FR-918), which leads to **Texts from your AI** (FR-919) and **Your own text** (G-03 FR-318, FR-321 on its own page). The shared texts are in the **Common library** (FR-916). Replaces G-02 FR-201's and FR-223's place on Home. (Was: one Texts page with topics and New texts with both parts, addendum 004; B-04, B-05.)

**Other pages**

- **FR-910** (RQ-427; N-19, N-17, N-20): **Settings** MUST hold speech speed with its note and the voice help (G-05 FR-502, FR-503) and **Start the starting level again** (Speak words withdrawn with RQ-412, question-pages/86) (G-06); **Account** MUST show the signed-in email, Sign out, and how to ask the owner for an export or deletion (G-01 FR-017). **Progress** is as FR-924 says (B-27; was G-04 FR-415's contents with the level and today's minutes).
- **FR-911** (RQ-428, RQ-437; N-27, N-28, N-25; constitution 3.1): When G-01 FR-011 asks for the terms (sign-up, a new device, a new terms version), the person MUST read them one section per screen (the sections of G-01 FR-025), each with **Next** enabled after 3 seconds and **Back**, and the last screen with one **Agree** labelled "I am 13 or over and agree to the terms", a link to the whole terms on one page, and Back; Agree records both being 13 or over and agreeing, with the terms' version (PD-16). Replaces G-01 FR-011's two boxes.

**The look**

- **FR-912** (RQ-425, RQ-441; N-34): Every exercise card MUST have a plain green banner (`--banner`: light `#2F5A40`, dark `#2E5A40`) holding, at its left, a chip with the mode's icon (Discover a sprout, Review a circle arrow) and name, and at its right a chip with its minutes ("1 min"), both chips in the card's colour with text and icon in the mode's colour, in sentence case, equal height, text centred (question-pages/74, 15 B). A practice review and a harder question (FR-905) show as Review (addendum 006; Master's mountain is no longer a banner).
- **FR-913** (RQ-426; N-34, N-11): grove's colours MUST be palette 14 (replacing Appendix A.1's colours; layout, radii and type stay): light — page `#ECE5DA`, cards `#EEEEE2`, raised `#F5F4EC`, text `#26241F`, muted `#6A6761`, accent `#2F5A40` → `#5E8A66`; dark — page `#0F110E`, cards `#1A1F1A`, raised `#222822`, text `#E9EBE3`, muted `#9AA095`, accent `#6FA27E` → `#97C3A2`. Modes: light Discover `#92592C`, Review `#74432C`, Master `#4B2E2B`; dark `#F0C28F`, `#DE9A66`, `#CF7A5E` (PD-12: palette 14 adjusted for contrast; the owner's chosen browns failed as chip text; PD-12's muted `#6D6A64` passed on cards but not on the page, 4.31:1, so muted is 2 points darker, found by the contrast test). Right `#3C7738` / dark `#8FCB7E`, wrong `#A14646` / dark `#E07A6E`, Beta `#74432C` / dark `#DE9A66` (PD-14); To remember as G-04 FR-413 (PD-13). Every text colour MUST meet WCAG AA against its background in both looks (4.5:1; 3:1 for large text and chips). In the light look every main button (Appendix A.3's gradient) is flat `--accent` `#2F5A40` with white text (8.0:1), no fade (question-pages/78, 1: white on the gradient's end `#5E8A66` was 3.96:1); the dark look keeps the gradient.
- **FR-914** (RQ-419, RQ-155; N-20; constitution 2.3): Sessions MUST belong to one account; no account can read or change another's. A new migration keeps every learner's data (constitution 4.13).

**Libraries and adding texts** (addendum 005)

- **FR-915** (RQ-430, RQ-422, RQ-443; N-41, N-07, N-38): **Your library** (the Your library tile; `/texts`) MUST show the learner's texts by topic (each package's topic; own texts under "My own texts"), unread first, each with its kind, state and Beta badge (G-02 FR-219, FR-224), and **Practise this topic** on each topic (FR-907; was Start a session for 5, 10 or 20 minutes); and the ways to **Add a text** (FR-918), **your dictionary** (G-03 FR-316, the words met in the learner's texts) and **your leaves** (G-04 FR-411).
- **FR-916** (RQ-431, RQ-438, RQ-443, RQ-445; N-41, N-13, N-01, N-14, N-43, N-46): The **Common library** (the Common library tile; `/library`) MUST show grove texts (RQ-438) by topic, each with its title, kind (reading or listening), level (A1…C2) and its **minutes** for this learner (FR-905's durations), and a level filter that shows every level up to the chosen one, set to the learner's level by default (G-06 FR-605; no level yet: A1) (question-pages/76, 17); each row has **+ Add**, which adds the text without leaving the list or moving it (the row then shows **Added ✓**); tapping the title opens the full text (‹ Common library at the top), which also has + Add (or Added ✓, with Open your copy); each topic has **Practise this topic** (FR-907) (addendum 006; was Add to your library, then Open, which left the list); and the **common dictionary** (FR-917). Adding stores the text as the learner's own copy through G-02's accept path (its lines, questions, sentences, new words with the word list's meanings), under its topic, marked "grove text" and never Beta (B-11). grove texts are every text in `content/library/texts/` (one file per level, A1…C2): the first 50 approved by the owner (B-11) and those Claude adds at the owner's word (B-19), each passing `scripts/check-library.mjs`; their number is not fixed. They are carried in the build (`server/library/grove-texts.json`, built by `scripts/build-library.mjs` from `content/library/texts/`, the same texts in the same order, each checked by G-02's answer format) and imported at start-up into `library_texts` (migration 016) when missing or changed; they belong to no learner. + Add MUST accept only the ID of a grove text in `library_texts`; any other ID is refused and adds nothing (T-24); it changes data, so it passes G-01 FR-022's CSRF check.
- **FR-917** (RQ-432; N-45, N-38, N-21): The **common dictionary** MUST search grove's whole Swedish word list (G-03's lexicon) as the learner types (from 2 letters, after a 0.3 s pause, older answers dropped, at most 50 results, words starting with the search first), showing each word's English meaning and its level when the level lists have it; each result can be added as a leaf (G-04's To remember), or shows that it is already a leaf or in the ground. Text from the word list is shown as text.
- **FR-918** (RQ-435, RQ-439; N-25, N-26, N-19): **Add a text** (`/add`) MUST show three ways side by side, each with a short explainer — **From the common library**: grove's own texts by topic and level, ready at once (B-10); **Texts from your AI**: grove gives prompts to paste into a free AI chat (ChatGPT, Claude, Gemini or another), you paste its answer back, grove checks it and adds texts at your level, about 5 minutes; **Your own text**: paste a Swedish text you choose (an article, a song), it stays private, your AI checks its words once — each leading to its own page (`/library`, `/add/ai`, `/own`).
- **FR-919** (RQ-436, RQ-403, RQ-404; N-26, N-25, N-15): **Texts from your AI** MUST be a wizard: a step list always visible at the top (Your AI; Setup, when the tactic has one; Copy the request; Paste the answer; Texts added), each step marked done ✓, now ● or next ○; below it only the current step, with one main button and Back; a confirmation after every action ("Copied. Now paste it into your AI chat and wait for its answer."; the answer's problems or fix-it prompt; "3 texts added:" with their titles linking to them). The step list follows G-02's prompting state, so leaving and coming back shows where the learner is. On the Your AI step, the three tactics (G-02 FR-223) are a list of choices, all always available, each with its one-line explanation, "Recommended" on the one grove recommends and the one in use selected; after two failed answers the recommendation moves and a line says so (question-pages/78, 2). Replaces addendum 004's tactic tabs and wizard card on the Texts page.
- **FR-920** (RQ-434, RQ-444; B-20, B-23; N-39, N-01, N-13, N-46): The **short-session offer** (FR-905: a Mix or Discover session whose new texts cover less than 80% of its text target, including a learner with no unread text) MUST say how many minutes of new texts are missing, per kind, and offer two choices (B-20): **Add a text** (FR-918, whose three ways include From the common library) and **Practise without** (FR-905's filling: the session goes on with what there is, filled). Add a text MUST show the fill bars too; its From the common library MUST open the Common library at the learner's level (and the topic, for a topic session), showing only the kinds still needed (no Show all while a session sent the learner; B-23, question-pages/83), with a **fill bar** at the bottom for each kind the skill uses (FR-905): its name, "m of n min" (n the minutes missing of that kind, m the minutes of that kind added to the learner's library since the offer, wherever they were added) and a filling bar; a full bar shows ✓ and the list drops its kind. Add a text's other ways follow the same kinds: **Texts from your AI** asks only for the kinds still needed (G-02 FR-202); **Your own text** is a reading text, so when only Listening is needed it says it won't fill the Listening bar. The bars MUST stay on Add a text, on the Common library, on a common-library text opened in full, and on Texts from your AI and Your own text reached from there. When every bar is full they MUST turn into **▶ Start your session**, which plans the session again (FR-905) with the same tile, skill, length and topic; tapping the bars before that returns to the session's offer, which shows the same two choices again with what there is. The bars belong to the session (FR-923); they show only when a session's offer sent the learner. (Addendum 006 and B-20; was "You have no new texts" with Pick from the common library, Add a text and Practise without a text.)
- **FR-921** (RQ-421; N-03, N-13): The speech speed (G-05 FR-502) MUST start at 0.9× for a learner below B1 and 1× from B1 (as FR-905 finds the level), until the learner sets it themselves (PD-03).

**Progress** (B-27; sketch picked on question-pages/87)

- **FR-924** (RQ-448, RQ-03; N-29, N-36, N-42): **Progress** (`/progress`) MUST show, in this order (the picked sketch, version B, `prototypes/sketches/2026-10-29-progress/`): (1) a card with "Progress", today's minutes ("today N min", all input as G-04 FR-415 counts it), and two boxes, **Started** (the starting level, or "Beginner", and the day it was set) → **Now** (FR-414's level, or "below A1", and the day it was reached), with "How your level is found ›" opening the level details (each level's share of words in the ground and the 90% rule); (2) four cards, two per row up to 600 px and four in a row above, each a button opening its details: **Read this week** and **Listened this week** (minutes in the last 7 days ending today, with the words of the texts read or heard underneath), **Leaves (drilling)** (the drilled leaves now: words and phrases, with grammar patterns underneath) and **In your ground** (words and phrases in the ground, with grammar patterns underneath); (3) "Last 7 days, each day": one bar per day ending today, read and listened stacked, told apart by a legend and a pattern on listening as well as by colour, a tap on a bar showing that day's minutes and words; (4) "Since you started (date)": read and listened (minutes, words), ever picked up (words, patterns: every leaf ever drilled, fallen ones included) and the ground (words, patterns) with "N of them from your starting level". The details are: the days (each of the 7 days, read and listened, minutes and words); words and patterns, with Leaves and Ground tabs (counts, "+N in the last 7 days", the latest picked up or fallen, and for the ground a bar of where its words came from: the starting level, known when read, fell from leaves); the level. Words are counted as each text's words once, when it is first finished; minutes as FR-925 records them. A new learner sees zeros and "Nothing yet" with a way to Discover. Replaces G-04 FR-415's Progress part (the 14 day bars, the ground's size and the drilled count). The Progress tile's line is "What you've read and heard, your words, and your level since you started."
- **FR-925** (RQ-448, RQ-48; N-29, N-42): Input minutes (G-04 FR-415) MUST be recorded per kind as well as in total: **reading** while a reading text is in view (or a listening text shown as text), **listening** while a listening text is in listening mode or a session plays a text, and **other** (reviews, harder questions, the starting check) otherwise; the page reports the kind with each half minute. A leaf's **picked up** time is when it was first drilled. A migration keeps every learner's data: existing minutes count as reading, a leaf's picked-up time is its added time, and the starting level's day is the one already kept (constitution 4.13).

**The way back** (addendum 006)

- **FR-922** (RQ-446; N-46, N-34): Every signed-in page but Home MUST show, at the left of the top bar under the logo row, a link "‹ <parent>" naming the page it belongs under and going there, from this page map: Session, Your library, Common library, Progress, Settings, Account → **Home**; Add a text, your dictionary (`/dictionary`), your leaves (`/leaves`), a text of the learner's (`/text`, Review) → **Your library**; a grove text not yet added and the common dictionary → **Common library**; Texts from your AI and Your own text → **Add a text**; the starting level (`/start`) → **Settings** (or **Home** before a level is chosen). The phone's or browser's Back MUST go to the previous page as the browser does; an open ☰ menu, help bubble, Options… panel or open tile MUST close first on Back, Esc or ✕, and the page stays. In a wizard (Texts from your AI, the terms, the starting level), ‹ Back MUST be the previous step. (Android's Up and Back; Apple's back button named after its page; addendum 006's sources.)
- **FR-923** (RQ-446, RQ-444; N-46; T-23): When the short-session offer (FR-920) sends the learner to another page, that page's top link MUST read **‹ Back to your session** instead of its parent, and lead back to the session's offer. The return MUST be held on the server with the session (its ID and the offer's minutes per kind), never as an address in the page; the server builds the link and shows it only while that session belongs to the signed-in learner and is neither finished nor replaced; a reload keeps it; a page opened any other way shows its parent link.

### Key Entities

- **Session**: account, tile (Discover, Review, Mix), skill, Harder questions only, length in minutes, topic (if any), the planned exercises in order, the index reached, started and finished times, and, after a short-session offer, the minutes missing per text kind and the time of the offer (FR-920, FR-923). (Was: kind time, topic, skill, one mode.)
- **Exercise** (in a session): mode, what it is (a text, a leaf to review, a harder question, a marking step), its planned seconds, done or not.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: On the demo account, Mix, Discover and Review sessions of 5, 10, 20 and 30 minutes with each skill, filled as FR-905 says, are planned within 20% of their length (or 2 minutes), checked by a test; where the account has too few leaves and read texts to fill a length even with the mix, the plan uses every one of them and says it is shorter; a plan that would be short first offers a new text (FR-905, FR-920). (RQ-421; R-24)
- **SC-002**: From Home, any part of grove is reached in at most three taps (tile, its way in, then a part of a library page). (RQ-419, RQ-429)
- **SC-003**: Every text colour in both looks meets WCAG AA against its background, checked by a test on every page. (RQ-426; R-26)
- **SC-004**: A timed 10-minute session on a phone takes 8–12 minutes for the owner (by hand, before the deploy). (RQ-421; R-24)
- **SC-005**: Opening a tile and starting a session answers within 0.5 s on the owner's computer (G-01 Q-05). (RQ-419, RQ-421)
- **SC-006**: After the fill bars are filled exactly (FR-920), ▶ Start your session plans a session whose new texts cover at least 80% of its text target, checked by a test for each skill. (RQ-444; R-34)
- **SC-007**: Every signed-in page's top link matches FR-922's page map, and "‹ Back to your session" shows only while its session is open and the learner's own, checked by a test over every page. (RQ-446; R-35, T-23)
- **SC-008**: A Review session on the demo account never leaves a due or fading leaf out for a harder question, and Harder questions only holds only harder questions of well-known words. (RQ-441; R-33)
- **SC-009**: On the demo account, every number Progress shows equals the count taken straight from the account's data, checked by a test. (RQ-448)

## Assumptions

- Durations (FR-905) are fixed first guesses, confirmed in clarify, adjusted only if the timed session (SC-004) runs over or under: reading 100 words a minute from B1 (70 below, PD-02) and listening 80 (an A2 learner reading Swedish with help, listening with replays), 20 s a Review item, 25 s a Master item, 30 s a marking step. Learning each learner's own times is for a later version.
- The lengths are 5, 10, 20 and 30 minutes with 10 by default, and the skill Mix by default (question-pages/79, 3; addendum 006); the earlier typed length and the skill forms are gone.
- The library's own data (shared texts, Publish to library for the owner's lessons; question-pages/64, 7–8; question-pages/76, 18) is a later feature; FR-916 shows its place and the common dictionary now. The drafted texts on branch `library-content` are not imported until the owner has read them.
- Durations below B1 use 70 words a minute (PD-02) until a better measurement per learner.
- G-04's Review and Master logic (schedules, falls) is unchanged (Master's exercises are Review's harder questions); sessions only choose and order exercises, and practice reviews never touch a schedule (FR-905).
- The help bubble reuses How grove works' content; the `/how` page stays public.
- Icons are drawn inline in the logo's stroke style (no icon font or outside files; G-01 FR-024).
