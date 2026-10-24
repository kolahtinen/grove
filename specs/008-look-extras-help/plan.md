# Implementation Plan: The look's extras and help (G-08)

**Branch**: `main` (spec folder `008-look-extras-help`) | **Date**: 2026-10-25 | **Spec**: [spec.md](spec.md)

## Summary

Browser-only work in the client module, plus one public page route. A shared `public/assets/grow.mjs` builds the leaves-and-ground scene as an inline SVG (DOM calls, no HTML strings) and steps it through five classes on a timer; CSS keyframes in `grove.css` do the motion, so the reduced-motion rule (which turns animations off) leaves each frame's end state, and the reduced-motion version shows four frames side by side. `public/assets/topbar.mjs`, loaded on every page, makes the logo tap open the scene in a pop-up. Home shows it in a card once after agreeing (`terms.mjs` sets a sessionStorage flag). A new public page `/how` ("How grove works") holds the terms and the scene with Replay; every page's top bar gets a "?" link. CSS adds the answer-button feedback, the menu slide-up and header strip, screen slide-in, reduced-motion fades, and the top-bar fit at 360 px. No server data, no new dependencies.

## Technical Context

**Language/Version**: JavaScript (ES modules) in the browser; CSS keyframes; Node.js 22.14+ server (one static route)

**Storage**: none on the server; `sessionStorage['grove-grow-due']` in the browser (wrapped in try/catch)

**Content security**: CSP stays `style-src 'self'; script-src 'self'`; the scene is built with `createElementNS` and classes, never `innerHTML`

**Testing**: `node --test` for the public route and for the help page covering every glossary term; Playwright for the scene (steps, captions, Skip, Replay, logo tap, reduced motion), the answer feedback classes, the menu strip, and top-bar overlap at 360 px

## Constitution Check

| Rule | How G-08 keeps it | Test or check |
|---|---|---|
| 1.3–1.5 | Tests named `FR-8xx RQ-…` | `check-trace` |
| 1.8 | client module only, plus a static route in web | modules.md |
| 4.6 | Scene and help text set with textContent / static HTML | review; no innerHTML (semgrep) |
| C-12 | No outside requests | CSP unchanged |

No violations.

## Project Structure

```text
public/how.html, public/assets/how.mjs        # How grove works (public)
public/assets/grow.mjs                         # the leaves-and-ground scene
public/assets/topbar.mjs                       # logo tap → scene pop-up (every page)
public/assets/home.mjs, terms.mjs              # once after agreeing
public/*.html                                  # "?" link, A.5 logo classes, topbar.mjs
public/assets/grove.css                        # scene, answers, menu, screens, reduced motion, 360 px top bar
server/web/static.mjs                          # /how route (public)
tests/web/how.test.mjs, tests/e2e/look-extras.spec.mjs
```

## Complexity Tracking

None.
