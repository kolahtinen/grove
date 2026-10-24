# Implementation Plan: Texts from the learner's own AI (G-02)

**Branch**: `main` (spec folder `002-texts-from-own-ai`) | **Date**: 2026-10-24 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/002-texts-from-own-ai/spec.md` (clarified 2026-10-24, question-pages/57)

## Summary

The copy-paste exchange with the learner's own chat AI: grove builds a prompt (packages of 3 parts; 3 texts of ~130 words per part; the learner's known words, target share, topic and, once per package, a summary of what changed), finds and strictly validates the JSON in the pasted answer, counts new words itself (sentences, Unicode words, names, phrases, regular Swedish inflections and compounds), accepts within the margins or lists the problems with a fix-it prompt, then stores texts, sentences and new leaves, asks for missing meanings, and lets the learner read, answer questions and rate, which tunes the next prompt. No new dependencies. Details: [research.md](research.md).

## Technical Context

**Language/Version**: JavaScript (ES modules) on Node.js 22.14+ (as G-01)

**Primary Dependencies**: none new (G-01's: `@fontsource/zen-kaku-gothic-new`; dev `@playwright/test`)

**Storage**: the G-01 SQLite database; migration `004-texts.sql` adds 11 tables ([data-model.md](data-model.md))

**Testing**: `node --test` (words and texts modules, with sample answers from X-03 and made-up broken ones); Playwright for Home and the reading page; the Q-07 50-sentence set with a stored baseline

**Target Platform**: as G-01

**Project Type**: web application (server + static client)

**Performance Goals**: check and show a one-part answer in ≤ 2 s (FR-215, Q-05); prompt < 16,000 characters with a 5,000-word ground (SC-006)

**Constraints**: no AI calls from grove (C-01, C-08); answers ≤ 100 KB (RQ-231); strict answer schema (T-07); plain-text display (T-06); Swedish only (C-09)

**Scale/Scope**: up to 6 accounts; ~9 texts per package; 7 new API routes, 1 new page

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design: still passes.*

| Rule | How G-02 keeps it | Test or check |
|---|---|---|
| 1.3–1.5 tests first, named, IDs | Tests from the spec's scenarios, named `FR-2xx RQ-…` | `check-trace` |
| 1.8 modules.md | New modules `words`, `texts`; web and client extended | updated |
| 2.3 least privilege | Every G-02 route `access: agreed`; every query filters by the session's account; ids from the client are checked to belong to it | authz table test covers the new routes; ID-swap tests for text, exchange, rating, question |
| 2.4 strict input | Body schemas (with a new `integer` type) and the nested AI-answer schema with limits; unknown fields refused | schema tests with malformed, oversized and extra-field answers |
| 2.5 safe errors | Problems listed in plain words; parser internals not shown | malformed-answer tests |
| 2.6 few deps | None added | `npm audit` |
| 3.2, 3.3 export/delete | Every new table has `account_id` | G-02 test: export lists texts and words; delete leaves none |
| 3.6 logs | No answer text or prompt in logs (allow-list unchanged) | log scan test extended with an answer paste |
| 4.1, 4.2 zero budget, no AI from grove | Copy-paste only | outbound test unchanged (no new hosts) |
| 4.6 plain text | All text set with `textContent`; HTML in answers shown literally | e2e test pastes an answer with `<script>` and `<b>` |
| 4.13 migrations | `004-texts.sql` | migration test (G-01's, now covering 004) |
| 4.3 scope | Only G-02's FRs plus RQ-188 (moved in on page 57) | process |

No violations.

## Project Structure

### Documentation (this feature)

```text
specs/002-texts-from-own-ai/
├── spec.md, plan.md, research.md, data-model.md, quickstart.md
├── contracts/http-api.md
├── checklists/requirements.md
└── tasks.md             # /speckit-tasks
```

### Source Code (repository root)

```text
server/
├── words/               # module words: sentences.mjs, tokens.mjs, inflect.mjs, count.mjs, store.mjs (words, forms, ground/leaves)
├── texts/               # module texts: schema.mjs (answer format), extract.mjs, prompt.mjs, check.mjs, packages.mjs, accept.mjs, ratings.mjs, routes.mjs
├── web/                 # app.mjs registers the texts routes; http.mjs gains the integer schema type
└── store/migrations/004-texts.sql
public/
├── index.html, assets/home.mjs     # Home: topic, package card, texts list
└── text.html, assets/text.mjs      # reading, questions, rating
tests/
├── words/               # counting, inflections, Q-07 set (q07-sentences.json, q07-baseline.json)
├── texts/               # prompt, extract, check, exchange flow, ratings; answers/ (sample answers)
└── e2e/texts.spec.mjs
```

**Structure Decision**: two new server modules: `words` (counting and the learner's words, reused by G-03 and G-04) and `texts` (the exchange and texts). `docs/modules.md` updated.

## Complexity Tracking

None.
