# Quickstart: checking G-09

## Prerequisites

`npm install`; Playwright's Chromium (`npx playwright install chromium`); the word list and Kelly list in place (G-02, G-06).

## Automated

```sh
node --test "tests/sessions/*.test.mjs"   # planner, store, routes, summary
npx playwright test tests/e2e/home.spec.mjs tests/e2e/sessions.spec.mjs tests/e2e/contrast.spec.mjs
npm test && npm run test:e2e && npm run check   # everything, before calling a part done
```

Expected: every test named `FR-901`…`FR-914` passes; `check-trace` finds a test for each; SC-001's planner test passes for 3, 5, 10 and 20 minutes on the demo inventory.

## By hand (`npm run dev`, http://localhost:8787, reviewer `reviewer@example.test` / `Forest-walk-42`)

1. Home shows icon tiles only; tap each: it opens across the grid with title, line and way in; Esc closes it. Narrow the window to 360 px: three per row, no sideways scroll.
2. ☰: Account, Settings, Help (a bubble), Sign out. The logo goes Home from every page.
3. Practise for X min → 10 → Start: "10-minute session · 1 of n · about m min left"; one card at a time with the banner chips; leave to Home: Resume is the first tile and returns to the same exercise; finish: the summary.
4. Texts: the demo topic and its texts; a session on it; New texts walks the prompt steps in the card.
5. By skill → Listening → Short; Just one mode → Review.
6. Switch the system to dark: every page readable; mode chips distinct.
7. SC-004: on a phone through the tunnel, time a real 10-minute session (8–12 minutes expected).
8. Sign in as a new account: terms one screen at a time; Next waits 3 s; one Agree.
