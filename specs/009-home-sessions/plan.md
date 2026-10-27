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
