# Feature Specification: Home, sessions and the new look (G-09)

**Feature Branch**: `main` (no feature branch; spec folder `specs/009-home-sessions`)

**Created**: 2026-10-27

**Status**: Draft

**Input**: User description: "G-09 Home, sessions and the new look, from docs/addenda/004-home-and-sessions.md (RQ-419–428) and question-pages/74; mock-ups in docs/reviews/2026-10-26-home-v2/. Short name: home-sessions."

**Sources**: `docs/addenda/004-home-and-sessions.md` (RQ-419…428, R-24…26), `docs/addenda/005-home-groups-libraries.md` (RQ-429…437, R-27…30; question-pages/76 and 77, 2026-10-29), `question-pages/74` (17 questions: the tile grid, sessions by time, topic and skill, the ☰ menu, palette 14, the mode banners, the order of work), `question-pages/64` (O-02, O-03, O-05, O-06), `docs/reviews/2026-10-26-home-v2/` (`p14-grid.png`, `p14-open-inplace.png`, `p14-session1.png`, `p14-modes-final2.png` B), `docs/needs.md`, `docs/glossary.md`, `.specify/memory/constitution.md`.

**Requirement numbers**: FR-901…

**Terms** (docs/glossary.md): **leaf**, **Leaves**, **ground**, **To remember**, **Discover / Review / Master** as in G-04. New here: a **session** is a planned run of exercises of a chosen length; an **exercise** is one item of a session (a text to read or hear, a word to review, a Master question); a **mode** is Discover, Review or Master.

**Changes to other goals** (each FR below names the rule it replaces): G-01 FR-011 (the terms' boxes), FR-014 (email and Sign out in the top bar), FR-026's colours (Appendix A.1); G-02 FR-201, FR-203, FR-223 (where the prompting lives on Home); G-03 FR-321 (the own-texts page joins Texts); G-04 FR-407 (Home's three stages), FR-414, FR-415 (level and minutes on Home); G-08 FR-802 (logo tap), FR-804 (the help page).

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

- No unread texts: FR-920's choice first; practising without a text plans Review, Master and practice reviews (FR-905); with nothing at all to do, the panel says so and offers Add a text. (RQ-421, RQ-434)
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

- **FR-901** (RQ-419, RQ-429; N-34, N-19, N-39): Home MUST be one page of square tiles (three per row from 360 px), each showing its icon with a one-word label under it and having that label as its accessible name, in three headed groups: **Learning** — Resume (only while a session is going, first), Practise for X min, By skill, Just one mode; **Library** — Common library (FR-916), Your library (FR-915); **Progress** — Progress. Tapping a tile MUST open it in place across the grid, below its row within its group, with its title, a one-line explanation and its way in, closing any other open tile and moving the tiles after it down; opening moves focus to the panel's title; tapping it again, ✕ or Esc closes it and returns focus to the tile (PD-07); tiles, ✕ and choices are at least 44 px (PD-10); with reduced motion the panel appears at once (PD-11). Replaces G-04 FR-407's stages and FR-414/FR-415's lines on Home (both move to Progress) and G-02 FR-201's package card on Home (it moves to Texts from your AI, FR-919). The welcome card (G-04 FR-416) shows above the groups until closed. (Was: one grid of seven icon-only tiles, addendum 004.)
- **FR-902** (RQ-420; N-34, N-17, N-25): Every signed-in page's top bar MUST show the logo (a link to Home; replaces G-08 FR-802's logo tap) and a ☰ button opening a menu with **Account**, **Settings**, **Help** and **Sign out** (replaces G-01 FR-014's email and Sign out in the bar). Help MUST open as a bubble over the page with How grove works' content and the animation's Replay (replaces G-08 FR-804's page link; `/how` stays for signed-out visitors and direct links).

**Sessions**

- **FR-903** (RQ-421; N-19, N-39, N-32, N-42): **Practise for X min** MUST offer 3, 5, 10, 20 and 30 minutes and a typed length of 3–60, and start a session planned by grove (FR-905) for that length.
- **FR-904** (RQ-421; N-19, N-32, N-29): A session MUST show one exercise at a time in grove's order, each in a card with its mode banner (FR-912), under "N-minute session · i of n · about m min left" and a progress bar of minutes done; the learner can only go on or leave. A session is kept for the learner on the server, with no time limit; while one is going, Home's first tile is **Resume**, opening the exercise they were on, until the session is finished or another is started (an old plan keeps its exercises; a Review word that is no longer due is still asked). Finishing shows a summary: minutes, texts, words reviewed, words that fell, and the days practised this week (Monday to Sunday); no streaks or goals (PD-05). Starting another session replaces the one going.
- **FR-905** (RQ-421, RQ-422, RQ-423; N-39, N-42, N-12, N-38): grove MUST plan a session from exercises with known durations: a reading text its words ÷ 70 per minute for a learner below B1 and ÷ 100 from B1 (the level of G-04 FR-414, else the one picked at the start, G-06 FR-605; no level counts as below B1) (PD-02), a listening text its words ÷ 80 per minute (time for replays), a Review item 20 s, a Master item 25 s, a marking step 30 s. The default plan for a length L: Review of the due and fading leaves first (at most 40% of L), then one Discover text that fits what is left (new or unfinished; reading or listening, whichever the learner did less of in the last 7 days), then Master items, then Master items. When that plan is under 80% of L, grove MUST first say so and offer a new text (FR-920's choices: Pick from the common library while it has texts, Add a text) or **Fill the time**; filling adds, while the plan is under 80% of L, a mix taken in turn from three kinds, each item at most once: **practice reviews** of leaves that aren't due yet (the soonest due first), **re-reading** a read reading text (the longest ago first, no marking step) and **listening again** to a read listening text (the longest ago first; only with a voice) (PD-28; question-pages/78, 3: "fill time with a mix"). A practice review is shown like a Review item, but its answer never changes the leaf's schedule, strength or falling, right or wrong (question-pages/76, F1). The planned minutes are within 20% of L or 2 minutes, whichever is more. An exercise is never longer than the session; with nothing to fill, the plan is shorter and says so.
- **FR-906** (RQ-423; N-37, N-13, N-44): **By skill** MUST offer Reading, Listening, Words and phrases, and Grammar, each Short (5 min), Medium (10 min) or Long (20 min). Discover then takes, among the learner's unread texts of the skill's kind (Grammar: texts with the most pattern places; Words and phrases: the shortest text), one by its share of known words now: Short one with 90–94%, Medium the one nearest the learner's target share (G-02, normally 95%), Long one with 98% or more; when none is in the band, the nearest, and the session line says so (PD-04). The rest of the plan leans to the skill: Listening reviews play their sentence first; Words and phrases fills with Review and Master (phrases included); Grammar reviews the learner's pattern leaves first; Reading reviews show sentences (G-04 FR-406).
- **FR-907** (RQ-422; N-41, N-42): A session **by topic** (from Your library, FR-915) MUST take Discover from that topic's unread texts and Review and Master from leaves met in that topic's texts, planned as FR-905 for a chosen length.
- **FR-908** (RQ-424; N-07, N-39): **Just one mode** MUST offer Discover (the next unread text), Review (the due and fading leaves, G-04 FR-404) and Master (G-04 FR-407's exercises) on their own, shown in the same one-at-a-time cards; replaces G-04's Review and Master buttons on Home.

**Texts**

- **FR-909** (RQ-422, RQ-418, RQ-430, RQ-435; N-41, N-15, N-42): The texts a learner has MUST be in **Your library** (FR-915) by topic; adding texts is the **Add a text** page (FR-918), which leads to **Texts from your AI** (FR-919) and **Your own text** (G-03 FR-318, FR-321 on its own page). The shared texts are in the **Common library** (FR-916). Replaces G-02 FR-201's and FR-223's place on Home. (Was: one Texts page with topics and New texts with both parts, addendum 004; B-04, B-05.)

**Other pages**

- **FR-910** (RQ-427; N-19, N-17, N-20): **Settings** MUST hold speech speed with its note and the voice help (G-05 FR-502, FR-503), **Speak words** (G-03 FR-305) and **Start the starting level again** (G-06); **Account** MUST show the signed-in email, Sign out, and how to ask the owner for an export or deletion (G-01 FR-017). **Progress** keeps G-04 FR-415's contents and gains the level (FR-414) and today's minutes.
- **FR-911** (RQ-428, RQ-437; N-27, N-28, N-25; constitution 3.1): When G-01 FR-011 asks for the terms (sign-up, a new device, a new terms version), the person MUST read them one section per screen (the sections of G-01 FR-025), each with **Next** enabled after 3 seconds and **Back**, and the last screen with one **Agree** labelled "I am 13 or over and agree to the terms", a link to the whole terms on one page, and Back; Agree records both being 13 or over and agreeing, with the terms' version (PD-16). Replaces G-01 FR-011's two boxes.

**The look**

- **FR-912** (RQ-425; N-34): Every exercise card MUST have a plain green banner (`--banner`: light `#2F5A40`, dark `#2E5A40`) holding, at its left, a chip with the mode's icon (Discover a sprout, Review a circle arrow, Master a mountain) and name, and at its right a chip with its minutes ("1 min"), both chips in the card's colour with text and icon in the mode's colour, in sentence case, equal height, text centred (question-pages/74, 15 B). A practice review (FR-905) shows as Review.
- **FR-913** (RQ-426; N-34, N-11): grove's colours MUST be palette 14 (replacing Appendix A.1's colours; layout, radii and type stay): light — page `#ECE5DA`, cards `#EEEEE2`, raised `#F5F4EC`, text `#26241F`, muted `#6A6761`, accent `#2F5A40` → `#5E8A66`; dark — page `#0F110E`, cards `#1A1F1A`, raised `#222822`, text `#E9EBE3`, muted `#9AA095`, accent `#6FA27E` → `#97C3A2`. Modes: light Discover `#92592C`, Review `#74432C`, Master `#4B2E2B`; dark `#F0C28F`, `#DE9A66`, `#CF7A5E` (PD-12: palette 14 adjusted for contrast; the owner's chosen browns failed as chip text; PD-12's muted `#6D6A64` passed on cards but not on the page, 4.31:1, so muted is 2 points darker, found by the contrast test). Right `#3C7738` / dark `#8FCB7E`, wrong `#A14646` / dark `#E07A6E`, Beta `#74432C` / dark `#DE9A66` (PD-14); To remember as G-04 FR-413 (PD-13). Every text colour MUST meet WCAG AA against its background in both looks (4.5:1; 3:1 for large text and chips). In the light look every main button (Appendix A.3's gradient) is flat `--accent` `#2F5A40` with white text (8.0:1), no fade (question-pages/78, 1: white on the gradient's end `#5E8A66` was 3.96:1); the dark look keeps the gradient.
- **FR-914** (RQ-419, RQ-155; N-20; constitution 2.3): Sessions MUST belong to one account; no account can read or change another's. A new migration keeps every learner's data (constitution 4.13).

**Libraries and adding texts** (addendum 005)

- **FR-915** (RQ-430, RQ-422; N-41, N-07, N-38): **Your library** (the Your library tile; `/texts`) MUST show the learner's texts by topic (each package's topic; own texts under "My own texts"), unread first, each with its kind, state and Beta badge (G-02 FR-219, FR-224), and a **Start a session** on each topic for 5, 10 or 20 minutes (FR-907); and the ways to **Add a text** (FR-918), **your dictionary** (G-03 FR-316, the words met in the learner's texts) and **your leaves** (G-04 FR-411).
- **FR-916** (RQ-431, RQ-438; N-41, N-13, N-01, N-14, N-43): The **Common library** (the Common library tile; `/library`) MUST show grove texts (RQ-438) by topic, each with its title, kind (reading or listening) and level (A1…C2), and a level filter that shows every level up to the chosen one, set to the learner's level by default (G-06 FR-605; no level yet: A1) (question-pages/76, 17); each text has **Add to your library**, or, once added, **Open** (the learner's copy); and the **common dictionary** (FR-917). Adding stores the text as the learner's own copy through G-02's accept path (its lines, questions, sentences, new words with the word list's meanings), under its topic, marked "grove text" and never Beta (B-11). grove texts are carried in the build (`server/library/grove-texts.json`, built by `scripts/build-library.mjs` from `content/library/texts/`, each checked by G-02's answer format) and imported at start-up into `library_texts` (migration 016) when missing or changed; they belong to no learner.
- **FR-917** (RQ-432; N-45, N-38, N-21): The **common dictionary** MUST search grove's whole Swedish word list (G-03's lexicon) as the learner types (from 2 letters, after a 0.3 s pause, older answers dropped, at most 50 results, words starting with the search first), showing each word's English meaning and its level when the level lists have it; each result can be added as a leaf (G-04's To remember), or shows that it is already a leaf or in the ground. Text from the word list is shown as text.
- **FR-918** (RQ-435, RQ-439; N-25, N-26, N-19): **Add a text** (`/add`) MUST show three ways side by side, each with a short explainer — **From the common library**: grove's own texts by topic and level, ready at once (B-10); **Texts from your AI**: grove gives prompts to paste into a free AI chat (ChatGPT, Claude, Gemini or another), you paste its answer back, grove checks it and adds texts at your level, about 5 minutes; **Your own text**: paste a Swedish text you choose (an article, a song), it stays private, your AI checks its words once — each leading to its own page (`/library`, `/add/ai`, `/own`).
- **FR-919** (RQ-436, RQ-403, RQ-404; N-26, N-25, N-15): **Texts from your AI** MUST be a wizard: a step list always visible at the top (Your AI; Setup, when the tactic has one; Copy the request; Paste the answer; Texts added), each step marked done ✓, now ● or next ○; below it only the current step, with one main button and Back; a confirmation after every action ("Copied. Now paste it into your AI chat and wait for its answer."; the answer's problems or fix-it prompt; "3 texts added:" with their titles linking to them). The step list follows G-02's prompting state, so leaving and coming back shows where the learner is. On the Your AI step, the three tactics (G-02 FR-223) are a list of choices, all always available, each with its one-line explanation, "Recommended" on the one grove recommends and the one in use selected; after two failed answers the recommendation moves and a line says so (question-pages/78, 2). Replaces addendum 004's tactic tabs and wizard card on the Texts page.
- **FR-920** (RQ-434; N-39, N-01, N-13): Starting a session by time or skill when the learner has no unread text MUST first show "You have no new texts" with **Pick from the common library** (opens the Common library at the learner's level; a text added there is the next session's new text), **Add a text** (FR-918) and **Practise without a text** (Review and Master, filled as FR-905 says). The same choice, with **Fill the time** in place of Practise without a text, comes when a session would run short (FR-905).
- **FR-921** (RQ-421; N-03, N-13): The speech speed (G-05 FR-502) MUST start at 0.9× for a learner below B1 and 1× from B1 (as FR-905 finds the level), until the learner sets it themselves (PD-03).

### Key Entities

- **Session**: account, kind (time, topic, skill, one mode), length in minutes, its parameters (topic, skill and form, mode), the planned exercises in order, the index reached, started and finished times.
- **Exercise** (in a session): mode, what it is (a text, a leaf to review, a Master question, a marking step), its planned seconds, done or not.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: On the demo account, sessions of 3, 5, 10 and 20 minutes, filled as FR-905 says, are planned within 20% of their length (or 2 minutes), checked by a test; where the account has too few leaves and read texts to fill a length even with the mix, the plan uses every one of them and says it is shorter; a plan that would be short first offers a new text (FR-905, FR-920). (RQ-421; R-24)
- **SC-002**: From Home, any part of grove is reached in at most three taps (tile, its way in, then a part of a library page). (RQ-419, RQ-429)
- **SC-003**: Every text colour in both looks meets WCAG AA against its background, checked by a test on every page. (RQ-426; R-26)
- **SC-004**: A timed 10-minute session on a phone takes 8–12 minutes for the owner (by hand, before the deploy). (RQ-421; R-24)
- **SC-005**: Opening a tile and starting a session answers within 0.5 s on the owner's computer (G-01 Q-05). (RQ-419, RQ-421)

## Assumptions

- Durations (FR-905) are fixed first guesses, confirmed in clarify, adjusted only if the timed session (SC-004) runs over or under: reading 100 words a minute from B1 (70 below, PD-02) and listening 80 (an A2 learner reading Swedish with help, listening with replays), 20 s a Review item, 25 s a Master item, 30 s a marking step. Learning each learner's own times is for a later version.
- The minute choices (3, 5, 10, 20, 30, typed 3–60) and the skill forms' lengths (Short 5, Medium 10, Long 20) were confirmed in clarify.
- The library's own data (shared texts, Publish to library for the owner's lessons; question-pages/64, 7–8; question-pages/76, 18) is a later feature; FR-916 shows its place and the common dictionary now. The drafted texts on branch `library-content` are not imported until the owner has read them.
- Durations below B1 use 70 words a minute (PD-02) until a better measurement per learner.
- G-04's Review and Master logic (schedules, falls) is unchanged; sessions only choose and order exercises, and practice reviews never touch a schedule (FR-905).
- The help bubble reuses How grove works' content; the `/how` page stays public.
- Icons are drawn inline in the logo's stroke style (no icon font or outside files; G-01 FR-024).
