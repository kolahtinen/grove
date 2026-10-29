---
description: "Tasks for G-09: Home, sessions and the new look"
---

# Tasks: Home, sessions and the new look (G-09)

**Input**: `specs/009-home-sessions/` — [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/http-api.md](contracts/http-api.md), [quickstart.md](quickstart.md). Builds on G-01…G-08.

**Draft** (2026-10-27, written while the owner was away). Tasks that use a value still to confirm name it as **(PD-nn)** ([provisional decisions](../../docs/provisional-decisions.md); question-pages/76). Don't start a task whose PD is unconfirmed; update this file after the confirming session.

**Built so far** (2026-10-27, on branch `g09-sessions`, not in main): T818–T828: migration 014 (table `practice_sessions`, since `sessions` is G-01's sign-in table), the `sessions` module (planner as FR-905 says now; SC-001 is a to-do until PD-28), the routes (plus `GET /api/session?id=N`), Texts' topic data (T833's server part), the session page with the mode banner (FR-912 in FR-913's current mode colours), the shared question card, the reading page's session bar. Also T815, T816: the Settings and Account pages (`GET /api/settings`) and Progress's level and today's minutes, opened by address until the ☰ menu (T813). Not yet: Home's tiles (T814, T829), the ☰ menu and help bubble (T813), the terms screens (T817), the palette (Phase 2); so a session is started through the API in its browser test.

**Tests**: Required (constitution 1.3, 1.4). Names start with the FR ID (FR-901…FR-914) and list RQ IDs. Tests first in each story. A test of an earlier goal changes only where plan.md's "Tests whose spec rules change" says its rule is replaced, and in the same task as the rule's replacement.

**Order** (PD-27): the look (US6's colours) → Home and menu (US1) with Settings, Account and the terms screens → Practise (US2) → Texts (US3) → By skill (US4) → Just one mode (US5). Each phase ends with every test passing, so whatever is left on 1 November is whole phases.

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup

- [ ] T801 Create `server/sessions/`, `tests/sessions/`; a helper `tests/sessions/helpers.mjs` (a learner from the demo, `applyDemo`, with a mutable clock; an inventory builder for planner tests)
- [ ] T802 Add a shared helper `signInAndAgree(page, account)` in `tests/e2e/helpers.mjs` that signs in and agrees through whatever the terms page is; change only the setup steps of the 8 e2e files that tick "I agree to the terms" (privacy, demo, levels, drill, listening, reading, texts, look-extras) to call it, with no change to what any test checks (plan: Tests whose spec rules change; question-pages/76, 24). **`texts.spec.mjs` only after the other session's work in it is committed**

---

## Phase 2: The look (US6, colours) — PD-12, PD-13, PD-14

### Tests (write first)

- [x] T803 [P] [US6] Test in `tests/web/palette.test.mjs`: `FR-913 RQ-426 RQ-306:` reads the custom properties of `public/assets/grove.css` for both looks and checks each named pair meets its ratio: text, muted on page, card and raised (4.5:1); each mode colour on the card colour (4.5:1, **PD-12** values); white on the dark banner `#2E5A40`; To remember, ok, bad and Beta on cards (**PD-13, PD-14**); and that no other rule in `grove.css` uses a colour literal
- [x] T804 [P] [US6] Test in `tests/e2e/contrast.spec.mjs`: `FR-913 SC-003 RQ-426 R-26:` every page (signed out: sign-in, terms, how, credits, reset; signed in: Home with a tile open, texts, session, review, text, leaves, progress, dictionary, settings, account) in light and dark: every element with its own text meets 4.5:1 (3:1 at ≥ 24 px or ≥ 18.66 px bold) against its nearest opaque background
- [ ] T805 [US6] Change `tests/e2e/look.spec.mjs` FR-026 (tokens) and FR-029 (gradient values) to palette 14's values; `tests/e2e/drill.spec.mjs` FR-413 to the word colours of **PD-13**; `tests/e2e/look-extras.spec.mjs` FR-805 to **PD-14**'s colours (rules replaced by FR-913)

### Implementation

- [x] T806 [US6] Rewrite the colour tokens in `public/assets/grove.css` to palette 14 (spec FR-913 with **PD-12**'s adjusted muted and mode colours), add `--discover`, `--review`, `--master`, `--remember`, `--ok`, `--bad`, `--beta` for both looks, and replace every colour literal elsewhere in the file with a token; layout, radii and type unchanged
- [ ] T807 [US6] Mode banner and chips (FR-912): `.mode-banner`, `.chip` in `grove.css`; `public/assets/icons.mjs` exporting `icon(name)` that builds inline SVG with DOM calls (sprout, circle arrow, mountain; the tile icons of T810), stroke style as the logo (G-01 FR-024)
- [ ] T808 [US6] Word colours in `public/assets/reading.mjs`'s mark classes and `grove.css`: To remember in `--remember` with a dotted underline; fallen words plain (**PD-13**)

**Checkpoint**: T803–T805 pass with every earlier test; screenshots of Home, a text and Review in both looks sent to the owner.

---

## Phase 3: User Story 1 — Home, menu, Settings, Account, terms (P1)

**Goal**: the tile grid, the ☰ menu, help as a bubble, the logo going Home; Settings and Account pages; the terms one section per screen.

**Independent test**: quickstart steps 1, 2 and 8.

### Tests (write first)

- [x] T809 [P] [US1] Tests in `tests/e2e/home.spec.mjs`: `FR-901 RQ-419:` Home shows square tiles with icons only and accessible names in the spec's order, no Resume without a session; tapping a tile opens its panel below its row with title, line and way in, closes any other, Esc / ✕ / the tile again closes it and focus returns to the tile (**PD-07**); at 360 px three per row and no sideways scroll; with reduced motion no transition (**PD-11**); tiles, ☰ and ✕ ≥ 44 px (**PD-10**). `FR-901 RQ-73:` the welcome card shows above the grid until closed. `FR-902 RQ-420:` the top bar has the logo (a link to `/`) and ☰ with Account, Settings, Help, Sign out; Help shows a bubble with How grove works and Replay, closed by ✕ or a tap outside; Sign out signs out
- [ ] T810 [P] [US1] Tests in `tests/e2e/home.spec.mjs`: `FR-910 RQ-427:` Settings holds the speed slider with its note, the voice help, Speak words and Start the starting level again; Account shows the email (HTML in it shown as text), Sign out, and how to ask for an export or deletion
- [x] T811 [P] [US1] Tests in `tests/e2e/terms-screens.spec.mjs`: `FR-911 RQ-428 RQ-228:` a new sign-in sees the first section and a disabled Next that enables after 3 s; each section in turn; the last has one Agree labelled "I am 13 or over and agree to the terms" (with Back and a link to the whole terms, **PD-16**); after Agree, Home; the next sign-in on another device asks again (G-01's rule)
- [x] T812 [US1] Change the e2e tests whose rules FR-901, FR-902, FR-910, FR-911 replace (plan's table): `signin.spec.mjs` FR-011 FR-014 (terms screens; Sign out from ☰), `look.spec.mjs` FR-005 FR-030 (top bar: logo and ☰), `look-extras.spec.mjs` FR-801 FR-802 (`#stages-card` → the grid; the scene from Help's Replay, not a logo tap) and FR-807 (the ☰ button at 360 px), `privacy.spec.mjs` FR-024 (email shown as text on Account), `demo.spec.mjs` FR-704 FR-705 and `levels.spec.mjs` FR-606 (`#stages-card` → the grid), `drill.spec.mjs` FR-414 FR-415 (level and minutes on Progress)

### Implementation

- [x] T813 [US1] `public/assets/topbar.mjs`: the logo is a link to `/`; a ☰ button (accessible name "Menu") opens a menu of Account, Settings, Help, Sign out; Help fetches `/how`, takes its `<main>` with `DOMParser` and shows it in a dialog with ✕ and Replay (`grow.mjs`); every signed-in page's HTML gets the ☰ button instead of the email and Sign out (research R8)
- [x] T814 [US1] Rewrite `public/index.html` and `public/assets/home.mjs` as the tile grid (research R7): buttons with `aria-expanded` and `aria-controls`, one panel moved after the opened tile's row (row from the grid's computed column count), focus to the panel title, Esc closes; panels' ways in link to `/texts`, `/dictionary`, `/progress`, and (until US2, US4, US5) placeholders "coming" for Practise, By skill, Just one mode; the welcome card from G-04 FR-416 above the grid. Move the prompting code from `home.mjs` to `public/assets/texts.mjs` unchanged (used in US3)
- [ ] T815 [P] [US1] `public/settings.html`, `public/assets/settings.mjs` (speed, note, voice help, Speak words, Start the starting level again, from their current places) and `public/account.html`, `public/assets/account.mjs` (email via `textContent`, Sign out, export or deletion text from G-01 FR-017); add both to `server/web/static.mjs`'s pages
- [ ] T816 [US1] Progress gains the level line and today's minutes (FR-910; from `/api/stages`) in `public/assets/progress.mjs`
- [x] T817 [US1] Rewrite `public/terms.html` and `public/assets/terms.mjs` as one section per screen (research R10): Next enabled after 3 s, Back, the last screen's one Agree sending `{agreeTerms: true, confirmAge13: true}` to G-01's route; the full terms stay readable on one page for signed-out visitors (FR-025). **PD-16**'s stored terms version, if confirmed: one column in T822's migration and the agree route

**Checkpoint**: all tests pass; `docs/modules.md` client row lists the new pages.

---

## Phase 4: User Story 2 — Practise for X min (P1) — PD-02, PD-05, PD-06, PD-28

**Goal**: plan, run, leave, resume and finish a session.

**Independent test**: quickstart step 3; SC-001 on the demo inventory.

### Tests (write first)

- [ ] T818 [P] [US2] Test addition in `tests/store/store.test.mjs`: `FR-914 RQ-155:` migration 014 keeps every row and adds `sessions`; a second `going` session for the same account is refused by the index
- [ ] T819 [P] [US2] Tests in `tests/sessions/plan.test.mjs` (the pure planner): `FR-905 RQ-421:` durations (reading 100 words/min, **70 below B1, PD-02**; listening 80; Review 20 s; Master 25 s; marking 30 s after a first reading); fading then due Review up to 40% of L; one Discover text that fits, the kind done less in 7 days; Master to fill; then **PD-28**'s fill (next unread texts, re-reads oldest first, listen again; 80–120%); a text longer than L is never planned; nothing fits → Review and Master only with the reason; the same inventory gives the same plan. `FR-905 SC-001 RQ-421 R-24:` on the demo inventory, 3, 5, 10 and 20 minutes are within 20% or 2 minutes. `FR-905 RQ-421:` without a voice, no listening and no spoken reviews
- [ ] T820 [P] [US2] Tests in `tests/sessions/routes.test.mjs`: `FR-903 FR-904 RQ-421:` `POST /api/sessions` time with 3/5/10/20/30 and typed 3–60 (2 and 61 → 400; unknown fields → 400); `GET /api/session` shows label, index, total, minutes left and the current exercise with its question built when shown; `POST /api/session/next` moves on, a repeated index answers the current state, an old one 409 `stale`; a Review word answered elsewhere since planning is still asked; starting another session marks the first `replaced`; the last `next` finishes with the summary (minutes, texts read, words reviewed, words that fell; **PD-05**'s days this week). `FR-914 RQ-155:` another account's `sessionId` → 404; nothing to do at all → 409 `nothing_to_do`. Add the routes to `tests/web/authz.test.mjs`; `tests/owner/data.test.mjs` finds `sessions` in the export and none left after deletion
- [ ] T821 [P] [US2] Tests in `tests/e2e/sessions.spec.mjs`: `FR-903 FR-904 FR-912 RQ-421 RQ-425:` on the demo learner, Practise → 10 → Start shows "10-minute session · 1 of n · about m min left", a bar, one card with the mode banner's two chips; a Review card answered moves on; a text exercise opens the reading page with the session bar and comes back after the text's end; leaving to Home shows Resume first, which returns to the same exercise; the end shows the summary and Resume is gone

### Implementation

- [ ] T822 [US2] Write `server/store/migrations/014-sessions.sql` exactly as data-model.md: `sessions (id INTEGER PRIMARY KEY, account_id INTEGER NOT NULL → accounts ON DELETE CASCADE, kind TEXT NOT NULL CHECK IN ('time','topic','skill','mode'), minutes INTEGER CHECK BETWEEN 3 AND 60 (NULL for mode), params TEXT NOT NULL DEFAULT '{}', plan TEXT NOT NULL, at_index INTEGER NOT NULL DEFAULT 0, status TEXT NOT NULL CHECK IN ('going','finished','replaced'), started_at INTEGER NOT NULL, finished_at INTEGER)`, `UNIQUE (account_id) WHERE status = 'going'`, index `(account_id, started_at)`
- [ ] T823 [P] [US2] `server/sessions/durations.mjs` (research R3, **PD-02**) and `server/sessions/inventory.mjs`: drilled leaves with strength from `server/drill/schedule.mjs`, Master leaves (gap ≥ `MASTER_GAP`), texts with kind, topic, word count (G-02's tokenizer), read or not, reading/listening seconds in the last 7 days from `review_answers` and `texts.read_at`; known share now only when asked (research R4)
- [ ] T824 [US2] `server/sessions/plan.mjs`: the pure planner of research R2 for kind `time` (and the hooks for topic, skill, mode filled in US3–US5); exercises as data-model.md; ≤ 80 exercises
- [ ] T825 [US2] `server/sessions/store.mjs` (start = replace the going one and insert, in one transaction; get; next by index; finish) and `server/sessions/summary.mjs`; `server/drill/review.mjs` exports `question(accountId, item, mode)` for one leaf, used when an exercise is shown (research R5)
- [ ] T826 [US2] `server/sessions/routes.mjs` per contracts/http-api.md with strict schemas (2.4), registered in `server/web/app.mjs`
- [ ] T827 [US2] `public/session.html`, `public/assets/session.mjs`, and `public/assets/questions.mjs` (one review/Master question card, taken from `review.mjs`, which then uses it): the header line and bar, one card with its banner (T807), Next; text exercises go to `/text?id=N&session=1`; the summary
- [ ] T828 [US2] `public/assets/reading.mjs`: with `session=1`, the session bar on top, and at the text's end (after marking, or the end of listening) `POST /api/session/next` and back to `/session`
- [x] T829 [US2] Home: the Practise tile's panel (3, 5, 10, 20, 30 and a typed 3–60, Start with `voice` from `speech.mjs`) and the Resume tile while a session is going (`GET /api/session`) in `public/assets/home.mjs`; empty states of **PD-06**

**Checkpoint**: all tests pass; SC-001's test passes; the owner can try a 10-minute session (SC-004 by hand).

---

## Phase 5: User Story 3 — Texts by topic (P1) — PD-17

**Goal**: the Texts page with topics, New texts and sessions by topic.

**Independent test**: quickstart step 4.

### Tests (write first)

- [ ] T830 [P] [US3] Tests in `tests/sessions/topics.test.mjs`: `FR-909 RQ-422:` `GET /api/topics` groups texts by topic, unread first, own texts under "My own texts", with kind, read and Beta; another account's texts never appear. `FR-907 RQ-422:` a topic session takes Discover from that topic's unread texts and Review and Master from leaves met in its texts; with no unread text, the session says so
- [ ] T831 [US3] Change `tests/e2e/texts.spec.mjs`'s FR-201 FR-203 FR-219, FR-223 (3 tests), FR-224 and FR-218 to take the same steps on `/texts` instead of Home (rule replaced by FR-909); **only after the other session's work in that file is committed**
- [x] T832 [P] [US3] Tests in `tests/e2e/sessions.spec.mjs`: `FR-909 RQ-422 RQ-418:` Texts lists the demo topic and its texts; New texts shows the AI and version dropdowns above the wizard card, one step open at a time, tactic tabs on the card; Your own text shows G-03's form; Start a session on the topic starts one

### Implementation

- [ ] T833 [US3] `server/sessions/topics.mjs` and `GET /api/topics`; topic sessions in `plan.mjs` (FR-907)
- [x] T834 [US3] `public/texts.html` and `public/assets/texts.mjs`: topics (text titles via `textContent`), Start a session with a length, New texts (the prompting moved from Home in T814, laid out as two dropdowns over the wizard card), Your own text (G-03 FR-318, FR-321's page folded in); the Texts tile links here. **PD-17**'s library per topic only when the library is built

---

## Phase 6: User Story 4 — By skill (P2) — PD-04

- [x] T835 [P] [US4] Tests in `tests/sessions/plan.test.mjs`: `FR-906 RQ-423:` each skill and form: Short 5, Medium 10, Long 20 minutes; Discover picks among the skill's texts by known share now (**PD-04**: Short 90–94%, Medium nearest the target, Long ≥ 98%; nearest when none is in the band, and the session says so); Listening reviews spoken first; Words and phrases fills with Review and Master; Grammar reviews pattern leaves first; Listening without a voice → 409 `no_voice`. And in `tests/e2e/sessions.spec.mjs`: `FR-906 RQ-423:` By skill → Listening → Short starts a session whose first text is a listening text
- [ ] T836 [US4] Skill sessions in `server/sessions/plan.mjs` with the known share from `words.counterFor` (research R4); the By skill tile's panel (four skills × three forms) in `public/assets/home.mjs`

---

## Phase 7: User Story 5 — Just one mode (P2)

- [ ] T837 [P] [US5] Tests: `FR-908 RQ-424:` in `tests/sessions/routes.test.mjs`, a `mode` session: Review takes the due and fading leaves (≤ 10), Master its 10, Discover the next unread text; and in `tests/e2e/sessions.spec.mjs`, Just one mode → Review shows the same cards. Change `tests/e2e/drill.spec.mjs` FR-407 FR-406 (stages on Home) to reach Review through Just one mode (rule replaced by FR-908)
- [ ] T838 [US5] `mode` sessions in `plan.mjs`; the Just one mode tile's panel; `/review?mode=…` starts a mode session and opens `/session` (research R6)

---

## Phase 8: Polish

- [ ] T839 Update `docs/modules.md` (sessions built; client, drill, web rows), `docs/glossary.md` (session, exercise, mode), `docs/STATUS.md`
- [ ] T840 Run `npm test && npm run test:e2e && npm run check` (audit, gitleaks, semgrep, check-trace); a fresh session reviews the code (1.6)
- [ ] T841 Quickstart by hand, including SC-004's timed 10-minute session on a phone; screenshots of Home, a session card and Texts in both looks to the owner

## Dependencies

- Setup → Phase 2 (the look) → US1 → US2 → US3, US4, US5 (each needs US2's sessions module; they don't need each other).
- T802 and T831 wait for the other session's `texts.spec.mjs` commit.
- Within a phase: tests first; [P] tasks touch different files.

## Parallel examples

- Phase 2: T803 and T804 together.
- US1: T809, T810, T811 together; then T815 alongside T813/T814.
- US2: T818–T821 together; T823 alongside T822.

## Implementation strategy

MVP for 1 November: Phases 1–4 (the look, the new Home and Practise for X min). US3 next (the prompting must stay reachable: until T834, the Texts tile's way in shows the moved prompting code as is). US4 and US5 are should-priority and are cut first if time runs short (constitution 4.3).

## Branch progress (2026-10-29, `g09-sessions`, not in main)

Done and ticked above: T803, T804, T806, T809, T811–T814, T817, T829, T832, T834, T835 (and, from 2026-10-27, the sessions server, session page, Settings, Account and Progress: T801, T807, T810, T815, T816, T818–T828 built but not yet ticked). Partly done: T802 (`tests/e2e/helpers.mjs` `agreeTerms(page)` in every file but `texts.spec.mjs`), T805 (look.spec only; drill FR-413 and look-extras FR-805 test classes, not colours), T808 (the To remember colour, not yet PD-13's dotted underline), T836–T838 (the By skill and Just one mode panels start real sessions and the planner's skill tests pass; nothing else left there but PD-04's band). Waiting: T831 (the other session's `texts.spec.mjs` work; it also needs the setup prompts' new place, `#setup-steps`), PD-16's stored terms version, everything marked PD-nn.

Palette findings for the owner (T804): white text on the light end of the main buttons' gradient, `#5E8A66`, is 3.96:1, below AA; no text colour passes on both ends of FR-913's light gradient, so it joins PD-12's question (a `test.fixme` in `contrast.spec.mjs`, a to-do in `palette.test.mjs`). Fixed in `grove.css` without changing FR-913's values: text drawn in `--accent2` on light cards (links, "new" and "due" pills, the switches) now uses `--link`; muted text on the tinted pills uses `--muted-strong`; the light `--ok-bg` is lighter (#EAF2E4) so the green messages pass.
