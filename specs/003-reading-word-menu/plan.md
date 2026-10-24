# Implementation Plan: Reading and the word menu (G-03)

**Branch**: `main` (spec folder `003-reading-word-menu`) | **Date**: 2026-10-24 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/003-reading-word-menu/spec.md` (clarified 2026-10-24, question-pages/58)

## Summary

The reading page becomes the place for help: grove sends each text already split into sentences and tokens with their status, dictionary forms, meaning here, explanation, phrases and patterns, so a tap speaks the word and opens its menu instantly. English shows under each sentence unless turned off. The AI's answer format gains patterns (marked in the pattern colour and kept as items), explanations for Explain flags and fixes for reports. A Practise mode asks word meanings inside sentences, then the passage questions, then reads the text aloud with highlighting. A dictionary lists everything met, with names apart. Learners can paste their own texts. No new dependencies. Details: [research.md](research.md).

## Technical Context

**Language/Version**: JavaScript (ES modules) on Node.js 22.14+ (as G-01, G-02)

**Primary Dependencies**: none new; browser Web Speech API for speaking

**Storage**: migration `005-reading.sql` (rebuilds words, texts, exchanges with foreign keys off; 6 new tables; one new setting) ([data-model.md](data-model.md))

**Testing**: `node --test` (new `tests/reading/`; extended texts, words, store tests); Playwright for the reading page, practice, dictionary, own text

**Target Platform / Project Type**: as G-01 (web application)

**Performance Goals**: word menu opens ≤ 0.5 s (data sent with the text, FR-305)

**Constraints**: plain-text display (T-06); strict schemas for the new answer lists; own texts ≤ 20,000 characters; Swedish only (C-09)

**Scale/Scope**: 9 new API routes, 1 new page, 1 rebuilt page

## Constitution Check

*GATE: passed before Phase 0; re-checked after Phase 1: still passes.*

| Rule | How G-03 keeps it | Test or check |
|---|---|---|
| 1.3–1.5 tests first, named, IDs | Tests named `FR-3xx RQ-…` | `check-trace` |
| 1.8 modules.md | New module `reading`; store (migration marker), words (resolver), texts (answer lists), client changed | updated |
| 2.3 least privilege | All routes `agreed`; ids checked against the session's account | authz table gets the new routes; ID-swap tests |
| 2.4 strict input | Schemas for every body and the new answer lists, with limits | schema tests |
| 3.2, 3.3 export/delete | New tables have `account_id` | owner data test extended |
| 3.6 logs | Notes and own texts never logged (allow-list unchanged) | log scan extended with an own text |
| 4.6 plain text | Tokens rendered with `textContent`; no HTML from data | e2e with HTML in a title, line and note |
| 4.13 migrations | 005 keeps every row (rebuild keeps ids); `foreign_key_check` empty | migration test covers 4 → 5 |

No violations.

## Project Structure

```text
server/
├── store/migrate.mjs            # gains the '-- foreign-keys-off' marker
├── store/migrations/005-reading.sql
├── words/resolve.mjs            # token status and dictionary forms against all the learner's words
├── texts/                       # prompt, schema, accept: patterns, explanations, fixes; summary skips reported questions
└── reading/                     # module reading: view.mjs (reading payload), practice.mjs, flags.mjs (explain, report, codes),
                                 #   dictionary.mjs, own.mjs (own texts, save as leaf, meanings prompt), routes.mjs
public/
├── text.html, assets/reading.mjs   # rebuilt reading page: tokens, menu sheet, patterns, translations toggle, practice, play
└── dictionary.html, assets/dictionary.mjs
tests/
├── reading/                     # view, practice, flags, dictionary, own texts
└── e2e/reading.spec.mjs
```

**Structure Decision**: a new server module `reading` for everything shown on or done from the reading page; the answer-format additions stay in `texts`; token resolution joins `words`. `docs/modules.md` updated.

## Complexity Tracking

None.
