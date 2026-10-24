# Modules: grove

Read by `/regenerate`. Built from the Spec Kit plans (first from `specs/001-platform-accounts-look/plan.md`, 2026-10-24; to be confirmed by me the first time `/regenerate` runs); updated whenever a plan adds or changes modules, test commands or dependencies.

**Run all tests:** `npm test && npm run test:e2e && npm run check`
**Run end-to-end tests:** `npm run test:e2e`

**Dependencies:** runtime `@fontsource/zen-kaku-gothic-new` (OFL-1.1); dev `@playwright/test` (Apache-2.0). Node.js 22.14+ built-ins (`node:http`, `node:sqlite`, `node:crypto`, `node:test`). Outside tools: `cloudflared`, `gitleaks`, `semgrep` (`pipx install semgrep`). Local test servers run on `http://localhost`.

| Module | Code folders | Test folders | Test command | Built from (spec files) | Depended on by |
|---|---|---|---|---|---|
| store | `server/store/` | `tests/store/` | `node --test tests/store/` | specs/001-platform-accounts-look (FR-002, FR-003; data-model) | seclog, firebase, accounts, web, owner, tunnel |
| seclog | `server/seclog/` | `tests/seclog/` | `node --test tests/seclog/` | specs/001-platform-accounts-look (FR-023) | accounts, web, owner, tunnel |
| firebase | `server/firebase/` | `tests/firebase/` | `node --test tests/firebase/` | specs/001-platform-accounts-look (FR-006, FR-009) | accounts, owner |
| accounts | `server/accounts/` | `tests/accounts/` | `node --test tests/accounts/` | specs/001-platform-accounts-look (FR-009, FR-011…FR-015, FR-020) | web |
| web | `server/web/`, `server/main.mjs`, `server/config.mjs` | `tests/web/` | `node --test tests/web/` | specs/001-platform-accounts-look (FR-001, FR-005, FR-007, FR-013, FR-014, FR-018, FR-019, FR-022, FR-024) | client (e2e) |
| owner | `server/owner/` | `tests/owner/` | `node --test tests/owner/` | specs/001-platform-accounts-look (FR-008, FR-010, FR-016, FR-017, FR-023) | – |
| tunnel | `tunnel/`, `deploy/` | `tests/tunnel/` | `node --test tests/tunnel/` | specs/001-platform-accounts-look (FR-001, FR-002, FR-004; README updater and hourly availability check) | – |
| client | `public/`, `scripts/copy-fonts.mjs` | `tests/e2e/` | `npx playwright test` | specs/001-platform-accounts-look (FR-005, FR-011, FR-014, FR-015, FR-019, FR-024…FR-031) | – |
