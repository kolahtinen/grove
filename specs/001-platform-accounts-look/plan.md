# Implementation Plan: Platform, accounts, security and the look's basics (G-01)

**Branch**: `main` (spec folder `001-platform-accounts-look`) | **Date**: 2026-10-24 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/001-platform-accounts-look/spec.md` (clarified 2026-10-24, question-pages/54 and 55)

## Summary

The walking skeleton every later goal builds on: grove runs on the owner's computer behind a free quick tunnel, with the current link kept in the private repo's README; the owner creates their own account and one shared reviewer account by command, and reviewers sign in through grove's server (which talks to Firebase Authentication) and agree to the terms on each new sign-in; every request is checked on the server; and every page is in the forest look. Approach: a dependency-light Node.js 22 server (built-in HTTP, SQLite, crypto and test runner), Firebase reached over its REST API, a static vanilla-JS client with Appendix A as CSS tokens, and owner commands for setup, export, deletion, logs, availability and backups. Details and alternatives: [research.md](research.md).

## Technical Context

**Language/Version**: JavaScript (ES modules) on Node.js 22.14+ LTS

**Primary Dependencies**: none at runtime except `@fontsource/zen-kaku-gothic-new` (font files, OFL-1.1); dev: `@playwright/test`. Built-ins: `node:http`, `node:sqlite`, `node:crypto`, `node:test`, `fetch`. Outside tools: `cloudflared` (quick tunnel), `gitleaks`, `semgrep`.

**Storage**: one SQLite file via `node:sqlite` (WAL, `synchronous=FULL`), numbered SQL migrations, hourly `VACUUM INTO` backups to a second disk ([data-model.md](data-model.md))

**Testing**: `node --test` with a fake Firebase server; Playwright (Chromium) for browser tests; `npm audit`, gitleaks, semgrep and an FR→test trace script in `npm run check`

**Target Platform**: server on the owner's always-on Linux computer (x86_64, systemd); clients are current phone and desktop browsers

**Project Type**: web application (one server serving a static client)

**Performance Goals**: G-01 pages usable on a mid-range phone over mobile data through the tunnel; sign-in and agreement under 1 minute for a person (SC-001). Q-05's timings apply to later goals.

**Constraints**: zero budget; no outside requests from the page; server talks only to Firebase (and GitHub from the tunnel supervisor); bind to 127.0.0.1; 100 KB request limit; responses for sign-in and reset held to ≥ 1.2 s; quick-tunnel limits (no SSE, 200 in-flight requests, X-01)

**Scale/Scope**: the owner and at most 5 reviewers sharing one account; 4 pages + health, 6 API endpoints, 8 owner commands, 6 tables

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design: still passes.*

| Rule | How G-01 keeps it | Test or check |
|---|---|---|
| 1.1–1.3 spec as source, tests first and fixed | Tests written from the spec's FRs and scenarios before code; modules in `docs/modules.md` for `/regenerate` | process |
| 1.4 every requirement tested | Test names start with the FR ID and list RQ IDs | `scripts/check-trace.mjs` in `npm run check` |
| 1.5 IDs on requirements | All FR-001…031 cite RQ and N IDs | done in spec |
| 1.6 fresh-session review | Review of the build in a new session | process |
| 1.7 no prototype code | Nothing copied from `prototypes/` | process |
| 1.8 modules.md | Updated with this plan | done |
| 2.1 no secrets in repo, browser or logs | `/etc/grove/` env files; allow-listed log fields | gitleaks; test that error pages and logs hold no secret |
| 2.2 HTTPS, localhost only | Tunnel HTTPS; bind 127.0.0.1; Firebase over HTTPS | config test: server address is 127.0.0.1 |
| 2.3 least privilege per role | Account only from session; role guard per route | authorisation tests for every endpoint × 4 roles, ID-swap test |
| 2.4 strict input | Schema per endpoint, unknown fields refused, 100 KB cap, prepared SQL | schema/size tests per endpoint; semgrep |
| 2.5 safe errors | Plain JSON errors; handler errors caught | malformed and oversized input tests |
| 2.6 few deps, audit | 1 runtime + 1 dev dependency, lockfile | `npm audit --audit-level=high` |
| 2.7 threat mitigations tested | T-01, T-03, T-05, T-07, T-08, T-09, T-13 map to FR-020, FR-016, FR-012, FR-022, FR-018, FR-010/016/018, FR-023; T-16 (floods) was partly carried by FR-021, withdrawn with sign-up; the rest stays accepted | their FR tests |
| 3.1 terms + age before use (v1.1.0) | FR-011: per sign-in agreement; guard blocks everything else until agreed | sign-in and agreement tests |
| 3.2, 3.3 delete / export commands | `learner:delete`, `learner:export` | deletion test looks for leftovers incl. the fake Firebase; export test |
| 3.4, 3.5 data minimisation, processors named | Terms page content (FR-025) | review of `/terms` text |
| 3.6 logs clean, 30 days | Allow-listed fields; hourly clean-up; journald limited to 30 days | log test runs sign-in, a failed sign-in, a reset and a large request and scans logs; journald drop-in checked by the deploy test |
| 4.1, 4.3 zero budget, scope | Free tools only; only G-01's FRs | process |
| 4.2, 4.5 no AI; only Firebase; tokens verified | Outbound hosts limited to configured Firebase/Google URLs | outbound-allowlist test; forged/expired/other-project token tests |
| 4.4 no outside hosts from page | Fonts and assets served by grove | Playwright request recorder on every page |
| 4.6 plain text, CSP | No HTML from data; strict CSP header | CSP header test; G-01 shows the email as text (test with an HTML-like address) |
| 4.7 cookies, CSRF, sign-out | `__Host-` cookie, CSRF header + Origin, server-side sign-out | cookie-attribute and CSRF tests |
| 4.8 least-rights tokens | Fine-grained GitHub token, README only | test that the updater writes only `README.md`; token settings reviewed |
| 4.9–4.11 limited user, boot start, disk encryption | systemd units as `grove`; owner setup steps | process (quickstart §3) |
| 4.12 hourly backups, restore tried | Hourly `VACUUM INTO`, checked after writing; restore by hand in the deploy phase | backup test: file made and readable; deploy task records the restore |
| 4.13 migrations keep data | Numbered migrations from the first table on | migration test on a copied database |
| 4.14 licences and credits | No imported word data in G-01; font licence file shipped | N/A in G-01 (credits page comes with the Kelly list) |
| 4.15 library licences | Font OFL-1.1; Playwright Apache-2.0 | process |
| 4.16 pasted texts private | No pastes in G-01 | N/A |

No violations; Complexity Tracking stays empty.

## Project Structure

### Documentation (this feature)

```text
specs/001-platform-accounts-look/
├── spec.md
├── plan.md              # this file
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── http-api.md
│   └── owner-cli.md
├── checklists/requirements.md
└── tasks.md             # /speckit-tasks
```

### Source Code (repository root)

```text
server/
├── main.mjs             # starts grove: config, store, web, hourly jobs
├── config.mjs           # reads environment; no defaults for secrets
├── web/                 # module web: router, static files, headers/CSP, body limit, errors, sessions, CSRF, role guard
├── accounts/            # module accounts: sign-in/out, terms agreement, reset, lockout, same-answer timing
├── firebase/            # module firebase: REST client, service-account token, ID-token verification
├── store/               # module store: database, migrations/, backups, clean-up job
│   └── migrations/
├── seclog/              # module seclog: security log and app log with allow-listed fields
└── owner/               # module owner: CLI commands of contracts/owner-cli.md
tunnel/                  # module tunnel: cloudflared supervisor, README updater, hourly availability check
public/                  # module client: HTML pages, styles (Appendix A tokens), JS modules, logo; fonts copied at install
deploy/                  # systemd units, journald drop-in and setup notes
scripts/                 # check-trace.mjs, copy-fonts.mjs
tests/
├── fakes/               # fake Firebase, fake GitHub
├── web/ accounts/ firebase/ store/ seclog/ owner/ tunnel/
└── e2e/                 # Playwright
```

**Structure Decision**: one Node project at the repository root; the server is split into small modules with one folder each so `/regenerate` can rebuild one at a time, and the client is static files in `public/`. Module list, test commands and dependencies are in `docs/modules.md`.

## Complexity Tracking

None.
