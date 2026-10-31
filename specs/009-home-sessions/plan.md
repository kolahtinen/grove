# Implementation Plan: Home, sessions and the new look (G-09)

**Branch**: `main` (spec folder `009-home-sessions`) | **Date**: 2026-10-27 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/009-home-sessions/spec.md` (clarified 2026-10-27, question-pages/75)

**Draft** written while the owner was away (2026-10-27). Values that depend on [provisional decisions](../../docs/provisional-decisions.md) still to confirm are marked **(pending PD-nn)**; PD-28 (how a session fills its minutes) came out of this plan and changes FR-905 if confirmed.

## Summary

Home becomes a grid of icon tiles that open in place (a disclosure pattern), with a ☰ menu for Account, Settings, Help and Sign out. A new server module `sessions` plans a session from what the learner has (due and fading leaves, Master leaves, unread and read texts) with fixed durations, keeps one going session per account with its plan and position, and serves one exercise at a time; review and Master answers still go through G-04's `/api/review`, texts open on the reading page with a session bar and come back. The prompting and own texts move from Home to a Texts page grouped by topic. Palette 14 replaces Appendix A.1's colours as CSS custom properties, with a contrast test over every page in both looks. The terms become one section per screen, sending G-01's agreement unchanged. No new dependencies. Details: [research.md](research.md).

## Technical Context

**Language/Version**: JavaScript (ES modules) on Node.js 22.14+

**Primary Dependencies**: none new

**Storage**: migration `014-sessions.sql` (table `sessions`; 012 is the Dictionary's and 013 addendum 003's, both built 2026-10-27) ([data-model.md](data-model.md))

**Testing**: `node --test` (new `tests/sessions/`: the planner as a pure function with fixed inventories, the store, the routes; an injectable clock); Playwright for the tile grid, menu, help bubble, sessions, Texts, By skill, Just one mode, terms screens and contrast in both looks

**Target Platform / Project Type**: as G-01 (web application)

**Performance Goals**: opening a tile is client-only; planning a session < 100 ms on the server at 2,000 words and 200 texts (SC-005's 0.5 s end to end)

**Constraints**: plain-text display (4.6); no outside hosts (4.4: icons are inline SVG built with DOM calls); strict schemas (2.4); one going session per account (the reviewer account's "last started wins")

**Scale/Scope**: 5 new API routes, 4 new pages (texts, session, settings, account), Home and the terms page rewritten, the top bar, the reading page's session bar, the CSS colours

## Constitution Check

*GATE: passed before Phase 0; re-checked after Phase 1: still passes.*

| Rule | How G-09 keeps it | Test or check |
|---|---|---|
| 1.3–1.5 tests first, named, IDs | Tests named `FR-9xx RQ-…`; G-01/02/03/04/08 tests whose rules FR-901…913 replace change with their rules (listed in tasks) | `check-trace` |
| 1.8 modules.md | New module `sessions`; client, drill (question builder exported), web (routes) changed | updated |
| 2.3 least privilege | All new routes `agreed`; a session is found by the session cookie's account only; `sessionId` from another account → 404 | authz table gains the routes; ID-swap test |
| 2.4 strict input | Schemas for `POST /api/sessions` (enums, minutes 3–60 integer, topic ≤ 120) and `POST /api/session/next` | schema tests |
| 3.1 terms and 13+ | One Agree sends G-01's `{agreeTerms: true, confirmAge13: true}`; the server rule is unchanged | sign-in tests (G-01) still pass; new terms-screens e2e |
| 3.2, 3.3 export/delete | `sessions` has `account_id`, so `owner data` exports and deletes it like every per-account table | owner data test lists `sessions` |
| 4.4 no outside hosts | Icons inline SVG; help bubble loads grove's own `/how` | request-recording browser test covers the new pages |
| 4.6 plain text | Text titles, topics and sentences in the session page via `textContent` | the HTML-paste test extended to Texts and the session card |
| 4.13 migrations | 014 adds a table; keeps every row | migration test covers 13 → 14 |

No violations.

## Project Structure

```text
server/
├── store/migrations/014-sessions.sql
├── sessions/                    # module sessions: durations.mjs (FR-905's numbers, pending PD-02),
│                                #   inventory.mjs (what the learner has: due/fading/master leaves, texts with
│                                #   word counts and known share now), plan.mjs (pure planner: time, topic,
│                                #   skill, one mode), store.mjs (one going session per account), summary.mjs,
│                                #   topics.mjs (Texts page data), routes.mjs
├── drill/questions.mjs          # unchanged logic; review.mjs exports a question for one item
└── web/app.mjs                  # registers the sessions routes
public/
├── index.html, assets/home.mjs  # tile grid (rewritten); prompting moves out
├── texts.html, assets/texts.mjs # topics, New texts (AI + version dropdowns, wizard card), own text
├── session.html, assets/session.mjs
├── settings.html, account.html, assets/settings.mjs, assets/account.mjs
├── assets/topbar.mjs            # ☰ menu, help bubble; logo links Home
├── assets/icons.mjs             # inline SVG icons (tiles, mode chips)
├── assets/questions.mjs         # one review/Master question card, shared by review.mjs and session.mjs
├── assets/reading.mjs           # session bar and "back to the session" when opened from a session
├── terms.html, assets/terms.mjs # one section per screen
└── assets/grove.css             # palette 14 tokens, tiles, chips, banners
tests/
├── sessions/
└── e2e/home.spec.mjs, e2e/sessions.spec.mjs, e2e/contrast.spec.mjs
```

**Structure Decision**: a new server module `sessions` that reads the learner's words and texts and plans; it never changes a word's schedule (G-04's `/api/review` still does), so drill's rules stay where they are. The prompting code moves from `home.mjs` to `texts.mjs` unchanged in behaviour. `docs/modules.md` updated.

## Order of building (pending PD-27)

Palette and contrast → grid, menu, Account, Settings, help bubble, terms screens → Practise for X min (sessions module, session page) → Texts with topics and sessions by topic → By skill → Just one mode. Each part is regenerated and tested on its own.

## Tests whose spec rules change

Found by searching `tests/e2e/` (2026-10-27). Each changes only because the rule it names is replaced (constitution 1.3); the tasks list them per part.

| Test (file: rule) | Replaced by | Change |
|---|---|---|
| The sign-in steps in 9 files (privacy, demo, levels, drill, listening, reading, texts, look-extras, and signin itself) tick "I agree to the terms" and the age box | FR-911 | the setup steps go through the terms screens; what each test checks is unchanged. Proposed: one shared `signInAndAgree` helper in `tests/e2e/`, so the next change to the terms touches one file |
| signin: FR-011 FR-014 | FR-911, FR-902 | the terms screens; Sign out from ☰ |
| look: FR-005 FR-030 (top bar contents), FR-026 (tokens), FR-029 (accent gradient values) | FR-902, FR-913 | logo + ☰; palette 14's values (pending PD-12) |
| look-extras: FR-801 FR-802 (logo tap plays the scene; `#stages-card`), FR-807 (Sign out on one line at 360 px) | FR-902, FR-901 | the scene from Help's Replay; Home's grid; the ☰ button at 360 px |
| look-extras: FR-805 (right/wrong colours) | FR-913 | only if PD-14 is confirmed |
| privacy: FR-024 (email with HTML shown as text in the header) | FR-902, FR-910 | the email is on the Account page; same check there |
| demo: FR-704 FR-705, levels: FR-606 (`#stages-card` on Home) | FR-901, FR-908 | Home's grid; Review and Master under Just one mode |
| drill: FR-407 (three stages on Home), FR-414 FR-415 (level and minutes on Home) | FR-908, FR-910 | Just one mode; Progress |
| drill: FR-413 (word colours) | FR-913 | only if PD-13 is confirmed |
| texts: FR-201 FR-203 FR-219, FR-223 (3 tests), FR-224 (`#package-card` on Home), FR-218 ("rated on Home") | FR-909 | the same steps on `/texts`. **`texts.spec.mjs` has uncommitted work from another session**; change it only after that is committed |

## Complexity Tracking

None.

## B-24…B-26 (2026-10-29; question-pages/85, 89): the Options page, ticked skills, Words and Grammar

- **New module `learning`** (`server/learning/`, `scripts/build-learning.mjs`): builds `server/learning/learning-content.json` from the approved `content/learning/` files (FR-930), imports it at start-up into `learning_items` (migration 020) like the library's texts (`importLearningContent`, called from `server/main.mjs` next to `importGroveTexts`), answers the learner's what-to-show-next (`learningInventory`: next words, phrases, the pattern of the day and earlier patterns, FR-928, FR-929), the cards' answers and Report (`/api/learning/*`), the ladder patterns of a sentence for the word menu (`ladderFor`), and the owner's list of reports (`listReports`, used by `npm run reports:show` in the owner module).
- **sessions**: `plan.mjs` takes the ticked skills (`params.skills`; an old row's single skill as one ticked, Mix = all); each skill has a queue of exercises (texts per kind, Words and phrase exercises, Grammar exercises) and the shares are filled in turns, a skill with too little giving its time to the others (texts count as plenty until the offer is answered with Practise without). `inventory.mjs` adds `learning` from the learning module; `store.mjs` shows Words, phrase and Grammar exercises with their content. Durations in `durations.mjs`.
- **reading**: the text payload adds the ladder patterns of each sentence (`ladderFor`), for FR-305's Patterns section.
- **web**: registers `/api/learning/*` and `/options`.
- **client**: `options.html` + `assets/options.mjs` (the sheet), `home.mjs` (Options… is a link; "Last time in Options"), `session.mjs` + `assets/learning.mjs` (the Words, phrase and Grammar cards and Report), `reading.mjs` (Patterns section), `grove.css` (sheet, chips, segmented control, split bar, spot text).
- **store**: migration 020.
- **owner**: `reports:show`.

## The four sketches (2026-10-31; question-pages/91…95): word menu A, exercises B, adding texts A, Home C

- **store**: migration 021 (`reports` takes `not_a_name`; `learner_settings.start_offered`).
- **reading**: `REPORT_REASONS` adds `not_a_name`; the payload adds `phrases` (with state, for the menu's phrase rows) and `readAt` (G-03 FR-305, FR-315; G-09 FR-933).
- **drill**: Pick up also on a new word or an unmarked leaf (`409 already_drilled` on a drilled leaf; G-04 FR-411); questions add `sentenceEn` and drop an unopened closing quotation mark (FR-932).
- **texts**: an answer to a refused exchange is read by its waiting fix-it (FR-919: the next paste answers the fix-it).
- **sessions**: each exercise's `skill` and `seconds`, the plan's list for the start screen and the session bar; an exercise frozen when first shown and its answer kept (`POST /api/session/next`'s `answer`), `GET /api/session/exercise` for looking again; `POST /api/session/leave` (an unplanned offer isn't kept); the summary's new lines; `GET /api/overview` for Home's counts (FR-901, FR-904, FR-932, FR-933).
- **levels**: the starting level offered once (`start_offered`, `POST /api/start/offered`, `startOpen`; G-06 FR-605).
- **library**: unchanged (the level filter already uses FR-905's level; the preview reads `GET /api/library/text`).
- **web**: no code change (the new routes are registered by their modules); its route table test lists them.
- **client**: `home.mjs` (the map, `/api/overview`), `session.mjs` with `frame.mjs` (the slim session bar, the card, the bottom bar, the start screen, the summary, looking again), `questions.mjs` (one more try, ✓/✗, the sentence's English), `learning.mjs` (Words, phrase and Grammar in the frame), `sessiontext.mjs` (a text inside the session, FR-933), `wordmenu.mjs` (the word menu as version A, shared by the reading page and a session's texts), `textview.mjs` (a text's tappable lines, shared), `add.mjs` (the chooser with Under way), `ai.mjs` (one step per screen), `own.mjs` (three steps on one page), `library.mjs` (the preview sheet, Added with Read now, the level line), `start.mjs` (calls `/api/start/offered`), `way.mjs` (‹ Add a text from Add a text), `grove.css`.

## The library's lengths, patterns and meanings (2026-10-31; question-pages/97): RQ-464…RQ-466

- **store**: migration 022 (`words.level`, `words.ladder`: a grammar pattern's CEFR level and its grove ladder ID, for a pattern from a grove text; NULL for every other row; data-model.md).
- **lexicon** (G-02 FR-222, RQ-466): `scripts/build-lexicon.mjs --corrections` builds `server/lexicon/corrections.tsv` (form, lemma, meaning) from the `*` rows of `content/library/meanings.tsv`; `meaning(form)` answers a corrected form from it before the word list; `search` shows a corrected headword's meaning (and finds a corrected headword the list lacks). Every user of `meaning` (words, texts, reading, drill, demo, prompts) gets the corrections with no change; a meaning already stored on a learner's word is read before the list, so it stays.
- **library** (G-09 FR-916, RQ-464…RQ-466): the checker `scripts/check-library.mjs` takes the word ranges A1 25–160, A2 40–240, B1 60–360, B2 70–500, C1 120–700, C2 130–800; the 12 texts in `content/library/texts-pending/` move into `content/library/texts/` (the build never reads `texts-pending/`). `scripts/build-library.mjs` adds to each text in `grove-texts.json` its `patterns` from `content/library/patterns/<level>.json` (name, explain_en, places, level, ladder; checked by G-02's answer format and every place's words found in a row in its line, else the build stops) and its `meanings` (form, lemma, en) from the rows of `meanings.tsv` that name it. The import stores both in `library_texts.data`. Adding a copy passes the patterns through G-02's accept path (`answer.patterns`, so they are stored as the copy's pattern places and the learner's pattern items, as for an AI text), then sets each pattern item's `level` and `ladder` where it has none, and stores the meanings as the copy's `text_meanings` (G-03 FR-306's first choice; the learner's word rows are not touched).
- **reading** (G-03 FR-305, RQ-465): the payload's `patterns` carry `level` and `ladder` (NULL for an AI text's pattern); ladder patterns already among the text's patterns by name stay out of `ladder`, as before.
- **client** (G-03 FR-305): the word menu shows a level chip on a text's pattern that has one, as on a ladder pattern; a text's pattern is still picked up by name (`/api/pick-up`), a ladder-only pattern by its ID (`/api/learning/answer`).
