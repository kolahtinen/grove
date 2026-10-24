# Modules: grove

Read by `/regenerate`. Built from the Spec Kit plans (first from `specs/001-platform-accounts-look/plan.md`, then `specs/002-texts-from-own-ai/plan.md` `specs/003-reading-word-menu/plan.md` `specs/004-ground-drilling-progress/plan.md` `specs/006-starting-level/plan.md` `specs/007-reviewer-demo/plan.md` and `specs/005-listening/plan.md` and `specs/008-look-extras-help/plan.md`, 2026-10-24/25; confirmed by the owner 2026-10-24 at the first `/regenerate`); updated whenever a plan adds or changes modules, test commands or dependencies.

**Run all tests:** `npm test && npm run test:e2e && npm run check`
**Run end-to-end tests:** `npm run test:e2e`

**Dependencies:** runtime `@fontsource/zen-kaku-gothic-new` (OFL-1.1); dev `@playwright/test` (Apache-2.0). Node.js 22.14+ built-ins (`node:http`, `node:sqlite`, `node:crypto`, `node:test`). Outside tools: `cloudflared`, `gitleaks`, `semgrep` (`pipx install semgrep`). Local test servers run on `http://localhost`.

| Module | Code folders | Test folders | Test command | Built from (spec files) | Depended on by |
|---|---|---|---|---|---|
| store | `server/store/` | `tests/store/` | `node --test "tests/store/*.test.mjs"` | specs/001-platform-accounts-look (FR-002, FR-003; data-model); specs/003-reading-word-menu (migration 005, foreign-keys-off marker); specs/004-ground-drilling-progress (migration 006); specs/006-starting-level (migration 007); specs/005-listening (migration 008) | seclog, firebase, accounts, web, owner, tunnel, words, texts, reading, drill, levels |
| seclog | `server/seclog/` | `tests/seclog/` | `node --test "tests/seclog/*.test.mjs"` | specs/001-platform-accounts-look (FR-023) | accounts, web, owner, tunnel |
| firebase | `server/firebase/` | `tests/firebase/` | `node --test "tests/firebase/*.test.mjs"` | specs/001-platform-accounts-look (FR-006, FR-009) | accounts, owner |
| accounts | `server/accounts/` | `tests/accounts/` | `node --test "tests/accounts/*.test.mjs"` | specs/001-platform-accounts-look (FR-009, FR-011…FR-015, FR-020) | web |
| web | `server/web/`, `server/main.mjs`, `server/config.mjs`, `server/jobs.mjs` | `tests/web/` | `node --test "tests/web/*.test.mjs"` | specs/001-platform-accounts-look (FR-001, FR-005, FR-007, FR-013, FR-014, FR-018, FR-019, FR-022, FR-024; registers G-02's routes) | client (e2e) |
| words | `server/words/` | `tests/words/` | `node --test "tests/words/*.test.mjs"` | specs/002-texts-from-own-ai (FR-207, FR-213, FR-216); specs/003-reading-word-menu (FR-303, FR-306: resolver) | texts, reading |
| texts | `server/texts/` | `tests/texts/` | `node --test "tests/texts/*.test.mjs"` | specs/002-texts-from-own-ai (FR-201…FR-221); specs/003-reading-word-menu (FR-307, FR-313…FR-315: answer lists); specs/004-ground-drilling-progress (reuse list, research R7) | reading, web, client (e2e) |
| reading | `server/reading/` | `tests/reading/` | `node --test "tests/reading/*.test.mjs"` | specs/003-reading-word-menu (FR-301…FR-319); specs/004-ground-drilling-progress (FR-408, FR-413: payload marks); specs/005-listening (FR-502, FR-503: settings) | drill, web, client (e2e) |
| drill | `server/drill/` | `tests/drill/` | `node --test "tests/drill/*.test.mjs"` | specs/004-ground-drilling-progress (FR-401…FR-419) | texts, reading, web, client (e2e) |
| owner | `server/owner/` | `tests/owner/` | `node --test "tests/owner/*.test.mjs"` | specs/001-platform-accounts-look (FR-008, FR-010, FR-016, FR-017, FR-023); specs/007-reviewer-demo (FR-705: reviewer:setup applies the demo) | – |
| tunnel | `tunnel/`, `deploy/` | `tests/tunnel/` | `node --test "tests/tunnel/*.test.mjs"` | specs/001-platform-accounts-look (FR-001, FR-002, FR-004; README updater and hourly availability check) | – |
| levels | `server/levels/`, `scripts/build-kelly.mjs` | `tests/levels/` | `node --test "tests/levels/*.test.mjs"` | specs/006-starting-level (FR-601…FR-610) | drill (level), web, client (e2e) |
| demo | `server/demo/`, `scripts/build-demo.mjs` | `tests/demo/` | `node --test "tests/demo/*.test.mjs"` | specs/007-reviewer-demo (FR-701…FR-707) | owner |
| client | `public/`, `scripts/copy-fonts.mjs` | `tests/e2e/` | `npx playwright test` | specs/001-platform-accounts-look (FR-005, FR-011, FR-014, FR-015, FR-019, FR-024…FR-031); specs/002-texts-from-own-ai (FR-201, FR-218, FR-219, FR-221); specs/003-reading-word-menu (FR-301, FR-304, FR-305, FR-308, FR-310…FR-312, FR-316…FR-318); specs/004-ground-drilling-progress (FR-401, FR-406, FR-407, FR-409…FR-416); specs/006-starting-level (FR-602, FR-604…FR-606); specs/005-listening (FR-501…FR-508: speech.mjs, listening mode); specs/008-look-extras-help (FR-801…FR-807: grow.mjs, topbar.mjs, how page, motion) | web (its tests open the pages and files) |
