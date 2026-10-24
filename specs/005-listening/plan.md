# Implementation Plan: Listening (G-05)

**Branch**: `main` (spec folder `005-listening`) | **Date**: 2026-10-25 | **Spec**: [spec.md](spec.md)

## Summary

A shared browser module for speech (`public/assets/speech.mjs`): picks a Swedish voice when the voices arrive (also late, `voiceschanged`; `sv`, `sv-SE`, `sv_SE`), never speaks with another language, applies the learner's rate. The reading page gains a listening mode: the text blurred until tapped or played through, Play/Pause of the whole text with highlighting, per-sentence replay with a count and a loop, the speed slider with its note, the one-time voice help, then the questions. Everywhere grove speaks (word menu, practice Play, Review, Leaves) uses the shared module. The server keeps the rate and "voice help shown" in learner settings (migration 008) and returns them with the reading payload. No new dependencies.

## Technical Context

**Language/Version**: JavaScript (ES modules), browser Web Speech API; Node.js 22.14+ server

**Storage**: migration `008-listening.sql`: `learner_settings.speech_rate REAL NOT NULL DEFAULT 1 CHECK (speech_rate BETWEEN 0.5 AND 1.5)`, `voice_help_shown INTEGER NOT NULL DEFAULT 0`

**API**: `POST /api/settings` (G-03) accepts optional `speechRate` (number 0.5–1.5) and `voiceHelpShown` (boolean) besides `showTranslations` (now optional); `GET /api/reading` and `GET /api/stages` return `speechRate` and `voiceHelpShown`

**Testing**: `node --test` for the settings; Playwright with a fake speech engine (one Swedish voice, or none, or voices arriving late) for the listening mode

## Constitution Check

| Rule | How G-05 keeps it | Test or check |
|---|---|---|
| 1.3–1.5 | Tests named `FR-5xx RQ-…` | `check-trace` |
| 1.8 | client and reading changed; no new module | modules.md |
| 2.4 | Rate checked as a number in range; schema type `number` added | settings test |
| 4.13 | 008 adds columns only | migration test |
| G-04 FR-417 | Rate and "help shown" kept on the server | settings test |

No violations.

## Project Structure

```text
server/store/migrations/008-listening.sql
server/reading/routes.mjs, view.mjs        # settings and payload fields
public/assets/speech.mjs                   # shared speech: voice choice, rate, speak, cancel
public/assets/reading.mjs, review.mjs, leaves.mjs   # use speech.mjs; listening mode in reading.mjs
public/text.html, assets/grove.css         # listening controls, blur, help box
tests/reading/listening.test.mjs, tests/e2e/listening.spec.mjs
```

## Complexity Tracking

None.
