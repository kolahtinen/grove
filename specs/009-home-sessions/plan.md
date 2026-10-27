# Implementation Plan: Home, sessions and the new look (G-09)

**Branch**: `main` (spec folder `009-home-sessions`) | **Date**: 2026-10-27 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/009-home-sessions/spec.md` (clarified 2026-10-27, question-pages/75)

**Draft** written while the owner was away (2026-10-27). Values that depend on [provisional decisions](../../docs/provisional-decisions.md) still to confirm are marked **(pending PD-nn)**; PD-28 (how a session fills its minutes) came out of this plan and changes FR-905 if confirmed.

## Summary

Home becomes a grid of icon tiles that open in place (a disclosure pattern), with a ☰ menu for Account, Settings, Help and Sign out. A new server module `sessions` plans a session from what the learner has (due and fading leaves, Master leaves, unread and read texts) with fixed durations, keeps one going session per account with its plan and position, and serves one exercise at a time; review and Master answers still go through G-04's `/api/review`, texts open on the reading page with a session bar and come back. The prompting and own texts move from Home to a Texts page grouped by topic. Palette 14 replaces Appendix A.1's colours as CSS custom properties, with a contrast test over every page in both looks. The terms become one section per screen, sending G-01's agreement unchanged. No new dependencies. Details: [research.md](research.md).

## Technical Context

**Language/Version**: JavaScript (ES modules) on Node.js 22.14+

**Primary Dependencies**: none new

**Storage**: migration `013-sessions.sql` (table `sessions`; the next free number when built: 013 if G-03's 012 for the Dictionary is in by then, otherwise 012 and the Dictionary takes 013) ([data-model.md](data-model.md))

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
| 4.13 migrations | 013 adds a table; keeps every row | migration test covers 12 → 13 |

No violations.

## Project Structure

```text
server/
├── store/migrations/013-sessions.sql
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

## Complexity Tracking

None.
