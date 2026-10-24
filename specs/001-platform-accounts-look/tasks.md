---
description: "Tasks for G-01: platform, accounts, security and the look's basics"
---

# Tasks: Platform, accounts, security and the look's basics (G-01)

**Input**: `specs/001-platform-accounts-look/` — [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/http-api.md](contracts/http-api.md), [contracts/owner-cli.md](contracts/owner-cli.md), [quickstart.md](quickstart.md)

**Tests**: Required. Constitution 1.3 and 1.4: tests are written from the spec before the code, one per acceptance criterion, and stay fixed. Every test name starts with its FR ID and lists its RQ IDs, e.g. `FR-020 RQ-156 RQ-372: sixth sign-in within 15 minutes is refused`. Write each story's tests first and see them fail before implementing.

**Organization**: Grouped by user story (US1…US6 from spec.md) so each story can be built and checked on its own. Accounts: the owner's and one shared reviewer account, both made by owner commands; no sign-up (question-pages/55).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: can run in parallel (different files, no dependency on an unfinished task)
- **[Story]**: the user story the task belongs to

## Path Conventions

One Node project at the repo root (plan.md "Project Structure"): `server/<module>/`, `tunnel/`, `public/`, `deploy/`, `scripts/`, `tests/<module>/`, `tests/e2e/`, `tests/fakes/`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project skeleton, scripts and tools

- [X] T001 Create the folders of plan.md "Project Structure" (`server/{web,accounts,firebase,store/migrations,seclog,owner}`, `tunnel`, `public/{assets,fonts}`, `deploy`, `scripts`, `tests/{fakes,web,accounts,firebase,store,seclog,owner,tunnel,e2e}`)
- [X] T002 Create `package.json` (`"type": "module"`, `"engines": {"node": ">=22.14"}`, `"private": true`) with scripts `test` (`node --test tests/`), `test:e2e` (`playwright test`), `check` (`npm audit --audit-level=high && gitleaks detect --no-banner && semgrep --config p/javascript --error server tunnel public scripts && node scripts/check-trace.mjs`), `dev` (`node tests/fakes/dev-server.mjs --port 8787`), `start` (`node server/main.mjs`), `tunnel` (`node tunnel/supervisor.mjs`), `postinstall` (`node scripts/copy-fonts.mjs`) and the owner commands of contracts/owner-cli.md (`owner:setup`, `reviewer:setup`, `learner:export`, `learner:delete`, `log:show`, `availability:show`, `backup:now`, `backup:restore`, each `node server/owner/cli.mjs <name>`); add dependency `@fontsource/zen-kaku-gothic-new` and dev dependency `@playwright/test`; run `npm install` to create the lockfile
- [X] T003 [P] Extend `.gitignore` with `test-results/`, `playwright-report/`, `public/fonts/` (copied at install) and `*.db*`
- [X] T004 [P] Write `scripts/copy-fonts.mjs`: copy the woff2 files for weights 400, 500, 700 and the `@font-face` rules (with `unicode-range`) of `@fontsource/zen-kaku-gothic-new` into `public/fonts/`, rewriting URLs to `/fonts/…`, plus its `LICENSE` (OFL-1.1) as `public/fonts/OFL.txt`
- [X] T005 [P] Write `scripts/check-trace.mjs`: read every `**FR-NNN**` ID from `specs/*/spec.md`, skipping those marked `*Withdrawn*`, collect test names from `tests/**/*.test.mjs` and `tests/e2e/**/*.spec.mjs`, and exit 1 listing each FR with no test whose name starts with that ID (constitution 1.4)
- [X] T006 [P] Write `playwright.config.mjs`: Chromium only, `webServer` = `node tests/fakes/dev-server.mjs --port 8788`, `baseURL` `http://localhost:8788` (localhost, so the Secure cookie works without HTTPS, research R13), projects for phone (360×780) and desktop (1440×900)
- [X] T007 [P] Install the check tools on the owner's computer: `gitleaks` (release binary into `~/.local/bin`) and `semgrep` (`pipx install semgrep`), and `npx playwright install chromium`; note the versions in `deploy/SETUP.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Config, database, logs, Firebase client, the web core and the page shell that every story needs

**⚠️ No user story work starts until this phase is done**

### Tests for the foundation (write first)

- [X] T008 [P] Write `tests/fakes/fake-firebase.mjs`: a local HTTP server implementing `accounts:signUp` (returns `EMAIL_EXISTS` for a known address), `accounts:signInWithPassword` (returns an RS256 ID token signed with a test key, `INVALID_LOGIN_CREDENTIALS` otherwise), `accounts:sendOobCode` (records the request), admin `accounts:delete` and `accounts:lookup`, the OAuth token endpoint, and the `securetoken` certificates URL; a helper to change a user's password; switches to make it unreachable or slow; it records every request so tests can inspect them
- [X] T009 [P] Write `tests/fakes/fake-github.mjs` (contents API: GET and PUT of one file, records paths written) and `tests/fakes/dev-server.mjs` (starts the fakes, a temp data folder and grove on `localhost:<--port>` with config pointed at the fakes; used by `npm run dev` on 8787 and Playwright on 8788)
- [X] T010 [P] Tests in `tests/store/store.test.mjs`: `FR-002 RQ-180:` a change committed before a close is there after reopening; the database runs with `journal_mode = wal` and `synchronous = FULL` (2); migrations run in order and set `user_version`; `FR-002 RQ-180: migration keeps data` (constitution 4.13: apply all migrations to a copy of a database at the previous version filled with rows, and check every row survives)
- [X] T011 [P] Tests in `tests/firebase/firebase.test.mjs`: `FR-009 RQ-366 RQ-367:` sign-up (owner commands), sign-in, reset and delete calls reach only the configured Firebase URLs with the server-side key; ID-token verification accepts a good token and rejects a forged signature, an expired token, the wrong `aud`, the wrong `iss` and an empty `sub` (T-10, constitution 4.5); unexpected answer shapes are rejected; an unreachable Firebase gives a `signin_unavailable` error
- [X] T012 [P] Tests in `tests/seclog/seclog.test.mjs`: `FR-023 RQ-371:` entries hold time, event, who and only allow-listed detail fields; a password, token or body text passed in is dropped; entries, availability checks and app-log files older than 30 days are removed by the clean-up
- [X] T013 [P] Tests in `tests/web/core.test.mjs`: `FR-001 RQ-125:` the server listens on 127.0.0.1 only (constitution 2.2); `FR-024 RQ-331 RQ-367:` every response has the CSP and other headers of contracts/http-api.md; `FR-022 RQ-161 RQ-231:` a 100 KB + 1 byte body gets `413 too_large` and the server answers the next request; malformed JSON and unknown fields get `400 bad_request` with no internal detail (constitution 2.5); a thrown handler error gives a plain 500 and no stack trace; non-GET without a valid CSRF token or with a foreign `Origin` gets `403 csrf`; `GET /health` answers `200 ok`

### Implementation for the foundation

- [X] T014 Write `server/config.mjs`: read `GROVE_PORT`, `GROVE_DATA_DIR`, `GROVE_BACKUP_DIR`, `FIREBASE_API_KEY`, `FIREBASE_PROJECT_ID`, `FIREBASE_SERVICE_ACCOUNT_FILE`, `FIREBASE_AUTH_URL`, `FIREBASE_TOKEN_URL`, `FIREBASE_CERTS_URL`, `GITHUB_TOKEN`, `GITHUB_REPO`; Google URLs default to the real ones, secrets have no default and grove refuses to start without them (constitution 2.1); export a frozen config object that never logs secret values
- [X] T015 Write `server/store/db.mjs` (open `node:sqlite` `DatabaseSync` with `PRAGMA journal_mode = WAL`, `PRAGMA synchronous = FULL`, `PRAGMA foreign_keys = ON`; silence only the SQLite experimental warning; `transaction(fn)` helper) and `server/store/migrate.mjs` (apply `server/store/migrations/NNN-*.sql` in order inside transactions, tracking `PRAGMA user_version`)
- [X] T016 Write `server/store/migrations/001-accounts.sql` with tables `accounts`, `sessions`, `settings` exactly as data-model.md: `accounts.firebase_uid TEXT UNIQUE NOT NULL`, `email TEXT UNIQUE NOT NULL`, `is_owner` and `is_reviewer` each with "at most one row with 1 (partial unique index)" and a CHECK that they are never both 1; `sessions.account_id … ON DELETE CASCADE`, `terms_agreed_at INTEGER NULL`, `age_confirmed_at INTEGER NULL`
- [X] T017 [P] Write `server/seclog/seclog.mjs`: `logSecurity(event, {accountId, email, ip, detail})` with the event list of data-model.md and an allow-list for `detail` (`role`, `reason`, `count`); `appLog(level, msg, fields)` writing JSON lines to `<data>/logs/YYYY-MM-DD.jsonl` through the same allow-list; `cleanUpLogs(now)` deleting rows and files older than 30 days; migration `server/store/migrations/002-logs.sql` with tables `security_log` and `availability_checks` as data-model.md
- [X] T018 [P] Write `server/firebase/client.mjs` (REST calls `signUp`, `signInWithPassword`, `sendPasswordReset`, admin `deleteUser`, `lookupUser`, with timeouts and strict answer-shape checks; error mapping to `email_exists`, `wrong_credentials`, `unavailable`), `server/firebase/service-token.mjs` (RS256 JWT from the service-account file, exchanged for an access token, cached until 5 minutes before expiry) and `server/firebase/verify-token.mjs` (certificate cache by `max-age`; checks of research R4)
- [X] T019 Write `server/web/http.mjs` (server bound to `127.0.0.1`, router by method and path, JSON body reader that stops at 100 KB, schema checker for declared fields that refuses unknown ones, error handler producing `{error, message}`, `GET /health`), `server/web/headers.mjs` (headers of contracts/http-api.md on every response) and `server/web/static.mjs` (serves `public/` with correct content types and no directory listing)
- [X] T020 Write `server/web/session.mjs`: create a session (32 random bytes, cookie `__Host-grove_session`, HttpOnly, Secure, SameSite=Lax, Path=/, Max-Age 2592000; store only the SHA-256 hash, `csrf_token`, `expires_at` = now + 30 days, terms fields NULL), look one up from a request (ignoring expired ones), record the agreement, delete one; pre-session CSRF cookie and check (double submit) for signed-out forms; CSRF check on every non-GET (`X-CSRF-Token` + same-origin `Origin`)
- [X] T021 Write `server/web/guard.mjs`: route option `access: 'public' | 'signed_in' | 'agreed' | 'owner'`; works out the role from the session only (never from the request body or URL); signed-out page requests → `303 /signin`, signed-out API → `401 signed_out`; a session without `terms_agreed_at` reaching an `agreed` route → page `303 /terms`, API `403 terms_needed`; refuse at start-up any route registered without an `access` value
- [X] T022 Write `server/main.mjs`: load config, open and migrate the store, start the web server, run the hourly job (log clean-up, expired sessions, idle counters; backups added in US4)
- [X] T023 [P] Write the page shell: `public/assets/grove.css` with the Appendix A.1 tokens for both looks as custom properties under `prefers-color-scheme`, the font faces from `public/fonts/`, body type of A.2, the 560 px column and the sticky top bar of A.3; `public/assets/logo.svg` copied from A.5; `public/assets/api.mjs` (fetch wrapper that sends the CSRF token and shows `message` from error answers as text)

**Checkpoint**: `npm test` passes T010–T013; grove starts with the fakes.

---

## Phase 3: User Story 1 - Sign in as a reviewer and agree to the terms (Priority: P1) 🎯 MVP

**Goal**: A reviewer signs in with the shared account, agrees to the terms on that sign-in, stays signed in for 30 days and can sign out.

**Independent Test**: With the reviewer account in the fake Firebase and grove, sign in, agree, sign out, sign in again (asked to agree again), close and reopen the browser; each step works.

### Tests for User Story 1 (write first)

- [X] T024 [P] [US1] Tests in `tests/accounts/signin.test.mjs`: `FR-009 RQ-366:` the right password gives `200 {result:"signed_in", termsNeeded:true}` and a session cookie, only after the ID token is verified; `FR-012 RQ-372:` a wrong password and an unknown address give the same `401 wrong_credentials`; `FR-013 RQ-224:` the cookie has HttpOnly, Secure, SameSite=Lax, Path=/ and Max-Age 2592000, a session 29 days old still works and one 30 days old doesn't; `FR-014 RQ-226:` `POST /api/signout` deletes the session on the server and the old cookie no longer works; `GET /api/me` returns the email, roles, `termsAgreed` and CSRF token; `FR-023 RQ-371:` sign-ins and sign-outs are logged
- [X] T025 [P] [US1] Tests in `tests/accounts/agree.test.mjs`: `FR-011 RQ-141 RQ-228:` a new session gets `403 terms_needed` from every `agreed` route and `303 /terms` for `/`; `POST /api/agree` with both `true` records `terms_agreed_at` and `age_confirmed_at` on that session and opens every `agreed` route; either field missing or `false` gives `400 agreement_needed` and records nothing; a second sign-in of the same account starts unagreed; `FR-023 RQ-371:` the agreement is logged as `terms_agreed`
- [X] T026 [P] [US1] Playwright test `tests/e2e/signin.spec.mjs`: `FR-011 FR-014 RQ-228 RQ-226:` sign in on `/signin` as the reviewer, land on `/terms` with the two boxes, Agree stays disabled until both are ticked, after Agree land on `/` with the reviewer email and a Sign out button in the header, sign out, land on `/signin`; sign in again and land on `/terms` again

### Implementation for User Story 1

- [X] T027 [US1] Write `server/accounts/same-answer.mjs`: `holdUntil(startTime, 1200)` so sign-in and reset answers take at least 1.2 s (research R5)
- [X] T028 [US1] Write `server/accounts/signin.mjs` and routes `POST /api/signin` (access `public`, schema `{email: string ≤254, password: string ≤128}`), `POST /api/signout` (access `signed_in`), `GET /api/me` (access `signed_in`), `GET /api/csrf` (access `public`): sign-in calls Firebase, verifies the ID token, finds the account by `firebase_uid`, creates a session and logs `signin`; wrong password, unknown address, or a Firebase user with no grove account → `401 wrong_credentials`; held with `holdUntil`; unreachable → `503 signin_unavailable`
- [X] T029 [US1] Write `server/accounts/agree.mjs` and route `POST /api/agree` (access `signed_in`, schema `{agreeTerms: true, confirmAge13: true}`): record both times on the session, log `terms_agreed`
- [X] T030 [P] [US1] Write `public/signin.html` + `public/assets/signin.mjs` (email, password, link to `/reset`) and `public/terms.html` + `public/assets/terms.mjs` (a placeholder terms text, completed in T066; for a signed-in session that hasn't agreed, the two boxes "I agree to the terms of use and privacy notice" and "I am 13 or over" and an Agree button enabled only when both are ticked); all user-visible values set with `textContent`, never HTML (constitution 4.6)
- [X] T031 [P] [US1] Write `public/index.html` + `public/assets/home.mjs`: the top bar with logo, title, the signed-in email and a Sign out button, and an empty-grove card ("Your grove is empty for now")

**Checkpoint**: US1 tests pass; a reviewer can sign in, agree and sign out locally.

---

## Phase 4: User Story 2 - My data stays mine (Priority: P1)

**Goal**: No account reaches another's data, signed-out visitors see only the public pages, and nothing but grove is contacted.

**Independent Test**: Authorisation tests for every endpoint × 4 roles, an ID-swap test, and a browser request recorder on every page.

### Tests for User Story 2 (write first)

- [X] T032 [P] [US2] Tests in `tests/web/authz.test.mjs`: `FR-018 RQ-155:` a table of every route in the router × {signed-out visitor, learner session not agreed, reviewer, owner} with the expected status, built from the router so a new route without an entry fails the test; adding an `accountId`, `id` or `email` field to any signed-in request is refused as an unknown field and never changes whose data is used; `FR-008 RQ-90 RQ-147:` the owner and the reviewer signed in at once each get their own account from `/api/me`, and both have the learner role; `FR-019 RQ-162:` signed-out requests to `/` get `303 /signin`, and to signed-in API routes `401 signed_out`; `/signin`, `/reset`, `/terms`, `/health` and their assets answer 200
- [X] T033 [P] [US2] Tests in `tests/web/outbound.test.mjs`: `FR-006 RQ-181 RQ-367:` during a full run of owner and reviewer setup, sign-in, agreement, reset, sign-out and an owner delete, the server's `fetch` reaches only the configured Firebase, OAuth and certificate URLs (constitution 4.2, 4.5); `FR-007 RQ-178:` no route or page offers a conversation partner (no `/chat` route, no chat element on any page)
- [X] T034 [P] [US2] Playwright test `tests/e2e/privacy.spec.mjs`: `FR-024 RQ-331 RQ-367:` on every page, signed out and signed in, every request goes to grove's own origin and fonts load from `/fonts/` (Q-02, constitution 4.4); an account email containing `<b>` is shown as text in the header (constitution 4.6)

### Implementation for User Story 2

- [X] T035 [US2] Add the route table export to `server/web/http.mjs` (method, path, access) used by the authz test
- [X] T036 [US2] Wrap the server's outbound requests in `server/firebase/client.mjs` with an allow-list of the configured Firebase, OAuth and certificate hosts that throws on any other host

**Checkpoint**: US1 and US2 pass together; this is the MVP.

---

## Phase 5: User Story 3 - Get back in after forgetting a password (Priority: P2)

**Goal**: A reset email for an account, the same answer for any address.

**Independent Test**: Reset an existing account through the fake Firebase; set a new password; sign in with it; the old one fails.

### Tests for User Story 3 (write first)

- [X] T037 [P] [US3] Tests in `tests/accounts/reset.test.mjs`: `FR-015 RQ-219:` a reset for an account's address sends a Firebase `PASSWORD_RESET` request and answers `200 {result:"sent_if_account"}`; `FR-015 RQ-372:` an unknown address gets the identical answer (body, status) and the response takes at least 1.2 s in both cases; `FR-023 RQ-371:` the request is logged as `reset_requested`; `FR-013 RQ-224 RQ-219:` an existing session still works after the password is changed in the fake Firebase (clarification 2)
- [X] T038 [P] [US3] Playwright test `tests/e2e/reset.spec.mjs`: `FR-015 RQ-219:` the reset page sends and shows "If this address has an account, an email is on its way"

### Implementation for User Story 3

- [X] T039 [US3] Write `server/accounts/reset.mjs` and route `POST /api/reset` (access `public`, schema `{email: string ≤254}`): call Firebase `sendPasswordReset` for every well-formed address (Firebase's enumeration protection hides unknown ones), log `reset_requested`, answer `200 {result:"sent_if_account"}`, held to 1.2 s; unreachable → `503 signin_unavailable`
- [X] T040 [P] [US3] Write `public/reset.html` + `public/assets/reset.mjs`

**Checkpoint**: US3 passes on its own.

---

## Phase 6: User Story 4 - The owner sets up and runs grove safely (Priority: P2)

**Goal**: The owner and reviewer setup commands, the tunnel and link updater, the hourly availability check, start on boot, hourly backups, export and delete commands, the security log.

**Independent Test**: The quickstart §2 owner steps with the fakes; restart the tunnel supervisor and time the README update; export and delete a test account and look for leftovers.

### Tests for User Story 4 (write first)

- [ ] T041 [P] [US4] Tests in `tests/owner/setup.test.mjs`: `FR-016 RQ-146 RQ-223 RQ-227:` `owner:setup` creates an account with the owner and learner roles; run again for another email it refuses and no second owner exists; `FR-010 RQ-217 RQ-360 RQ-221:` `reviewer:setup` creates one account with the reviewer and learner roles, refuses a password breaking the rule, and refuses a second reviewer account; no route creates accounts; `FR-023 RQ-371:` both setups are logged as `owner_setup` / `account_created`
- [ ] T042 [P] [US4] Tests in `tests/owner/data.test.mjs`: `FR-017 RQ-229:` `learner:export` writes JSON with the account and every row that references it; `learner:delete` removes the account, its sessions and every row that references it in grove, and the user in the fake Firebase, and a signed-in session of that account is then treated as signed out; both are logged; `log:show` prints entries filtered by event and hours
- [ ] T043 [P] [US4] Tests in `tests/store/backup.test.mjs`: `FR-003 RQ-180:` `backup:now` writes `grove-YYYYMMDD-HH.db` to the backup folder, opens it and finds the same row counts; only the last 48 are kept; `backup:restore` refuses while grove holds the database and otherwise replaces it
- [ ] T044 [P] [US4] Tests in `tests/tunnel/tunnel.test.mjs`: `FR-004 RQ-364:` given cloudflared output lines with a new `https://*.trycloudflare.com` address, the supervisor stores it and PUTs `README.md` to the fake GitHub with the link between `<!-- grove-link -->` markers within 2 minutes, retrying every 15 s while GitHub fails; it never writes any path but `README.md` (constitution 4.8); the hourly check requests `<link>/health` and records `ok` 1 or 0 in `availability_checks`, and `availability:show` prints the share per day; `FR-002 RQ-125:` the unit files in `deploy/` have `Restart=always`, `User=grove`, `WantedBy=multi-user.target`, and `deploy/journald-grove.conf` sets `MaxRetentionSec=30day` (constitution 3.6)

### Implementation for User Story 4

- [ ] T045 [US4] Write `server/owner/cli.mjs` (argument parsing, plain error messages, non-zero exit) and `server/owner/setup.mjs`: `owner:setup --email` and `reviewer:setup --email` ask the password twice without echo (reviewer password checked against the rule of FR-010), call Firebase `signUp`, insert the account with `is_owner = 1` or `is_reviewer = 1`, refuse if one exists, log `owner_setup` / `account_created`; `reviewer:setup` ends by reminding the owner to write the email and password into the README
- [ ] T046 [US4] Write `server/owner/data.mjs`: `learner:export --email [--out]` and `learner:delete --email --yes` (delete in grove in one transaction, then Firebase `deleteUser`; log `export` / `delete`) and `server/owner/log.mjs` (`log:show`, `availability:show`)
- [ ] T047 [US4] Write `server/store/backup.mjs` (`VACUUM INTO <backup dir>/grove-YYYYMMDD-HH.db`, open and count rows, keep 48; restore with a lock-file check) and add the hourly backup to the job in `server/main.mjs`; add `backup:now`, `backup:restore` to `server/owner/cli.mjs`
- [ ] T048 [US4] Write `tunnel/github-readme.mjs` (GET and PUT `README.md` through the contents API with the fine-grained token, replacing only the text between a given pair of markers) and `tunnel/supervisor.mjs`: spawn `cloudflared tunnel --url http://127.0.0.1:<port>`, read its output, on a new address save `settings.tunnel_url` and update the README link, retry every 15 s, restart cloudflared when it exits; every hour request `<link>/health` (10 s timeout) and insert into `availability_checks`; log failures without the token
- [ ] T049 [P] [US4] Write `deploy/grove.service`, `deploy/grove-tunnel.service` (`User=grove`, `EnvironmentFile=/etc/grove/grove.env`, `Restart=always`, `WantedBy=multi-user.target`), `deploy/journald-grove.conf` (`[Journal]` `MaxRetentionSec=30day`) and `deploy/SETUP.md` (create user `grove`, secrets in `/etc/grove/` mode 600, install the units and the journald drop-in, disable sleep, full-disk encryption reminder, Firebase console settings of research R4, token settings of research R10, the README block with `<!-- grove-link -->` markers and the reviewer sign-in written by hand)

**Checkpoint**: US4 passes; quickstart §2 owner steps work with the fakes.

---

## Phase 7: User Story 5 - Grove resists guessing and floods (Priority: P2)

**Goal**: Lockout per address and the same answers for known and unknown addresses (size limits are in the foundation, T013).

**Independent Test**: Scripted attempts: 6 wrong passwords, known vs unknown addresses compared.

### Tests for User Story 5 (write first)

- [ ] T050 [P] [US5] Tests in `tests/accounts/lockout.test.mjs`: `FR-020 RQ-156:` after 5 failed sign-ins in a row for an address, a 6th within 15 minutes is refused even with the right password and Firebase isn't called; after 15 minutes the right password works; a success resets the count; sessions already signed in keep working during a lockout; `FR-020 RQ-372:` an address with no account locks the same way and the locked answer equals the wrong-password answer; `FR-023 RQ-371:` failed sign-ins and the lockout are logged
- [ ] T051 [P] [US5] Tests in `tests/accounts/same-answer.test.mjs`: `FR-012 RQ-372:` for sign-in and reset, an address with an account and one without give identical status and body, and both responses take at least 1.2 s

### Implementation for User Story 5

- [ ] T052 [US5] Write migration `server/store/migrations/003-counters.sql` with `failed_signins` (`email TEXT PK`, `failures INTEGER NOT NULL`, `locked_until INTEGER NULL`, `updated_at INTEGER NOT NULL`) as data-model.md
- [ ] T053 [US5] Write `server/accounts/lockout.mjs` (count per normalised address; lock for 15 minutes on the 5th failure; log `signin_failed` and `lockout`) and use it in `server/accounts/signin.mjs` before calling Firebase; add idle-row clean-up to the hourly job

**Checkpoint**: US5 passes; all accounts tests pass together.

---

## Phase 8: User Story 6 - A calm forest look on every screen (Priority: P3)

**Goal**: Night forest and Pale birch, frosted cards, buttons, type, layout and logo as Appendix A, on phone and desktop.

**Independent Test**: Playwright compares computed styles of the G-01 pages with Appendix A in dark and light at 360 px and 1440 px.

### Tests for User Story 6 (write first)

- [ ] T054 [P] [US6] Playwright test `tests/e2e/look.spec.mjs`: `FR-026 RQ-306 RQ-334 RQ-335:` with `colorScheme: 'dark'` the body background is `#0A110E` and text `#E8F0E9`; with `'light'` `#F3F0E8` and `#1E2A22`, and the other A.1 tokens resolve to their values; `FR-027 RQ-331 RQ-337:` the computed font family starts with Zen Kaku Gothic New, body is 15px with line height 1.6; `FR-005 FR-030 RQ-23 RQ-38 RQ-341:` at 360 px and 1440 px the main column is ≤ 560 px wide and centred with no horizontal scroll, and the top bar is sticky with a 14px backdrop blur and holds the logo; `FR-028 RQ-314 RQ-338 RQ-339:` cards have radius 22px, an 18px backdrop blur and the `--shadow` value; `FR-029 RQ-316 RQ-340:` buttons have radius 14px, main buttons the accent gradient, and pressing a button scales it to 0.97; `FR-031 RQ-314 R-15:` with reduced motion emulated, cards and top bar have no backdrop blur

### Implementation for User Story 6

- [ ] T055 [US6] Complete `public/assets/grove.css` from Appendix A: all A.1 tokens and the background glows for both looks; A.2 sizes with content text as `calc(<size> * var(--size-factor))` and `--size-factor: 1`; A.3 radii, frosted glass (blur 18px, saturate 1.4), shadows and glows, main-button gradient, `:active { transform: scale(.97) }`, top bar, progress bar and grid classes; `@media (prefers-reduced-motion: reduce), (prefers-reduced-transparency: reduce)` dropping blur and glows in favour of solid `--card2`
- [ ] T056 [P] [US6] Apply the look to every G-01 page (`public/index.html`, `signin.html`, `reset.html`, `terms.html`): one card per form, main buttons for the main action, the logo and app title in the top bar

**Checkpoint**: all six stories pass.

---

## Phase 9: Polish & Cross-Cutting Concerns

- [ ] T057 [P] Complete the text of `public/terms.html` with every point of FR-025 (13 and over; share only texts you may share; the suspension and ban rule; each kind of data kept and why; Firebase (Google) and Cloudflare as processors; the learner's own AI's terms; own texts only auto-checked; the reviewer account is shared; ask the owner to export or delete) in plain language for the owner to review; test `tests/e2e/terms.spec.mjs` named `FR-025 RQ-141 RQ-228 RQ-376:` checking `/terms` is public and contains each point's key phrase
- [ ] T058 [P] Tests in `tests/web/errors.test.mjs`: `FR-009 RQ-366:` with the fake Firebase unreachable, sign-in and reset answer `503 signin_unavailable` with a plain message, and a signed-in session's `GET /api/me` still works; error pages and the app log contain no secret value from config (constitution 2.1)
- [ ] T059 [P] Test `tests/seclog/logscan.test.mjs`: `FR-023 RQ-371:` run owner and reviewer setup, sign-in, a failed sign-in, an agreement, a reset and a 100 KB+ request, then scan the security log, the app-log files and grove's standard output for the passwords, ID token and body text used (constitution 3.6)
- [ ] T060 Run `npm test`, `npm run test:e2e` and `npm run check`; fix what they find through the spec and tasks, not by hand edits to generated code (constitution 1.1); confirm `check-trace` lists every FR except the withdrawn FR-021 with a test
- [ ] T061 Walk through quickstart.md §1 and §2 and record the result in `docs/STATUS.md` (Implemented column for G-01)

---

## Phase 10: Deploy and verify on the owner's computer

**Purpose**: The real deployment of quickstart §3, needed before any reviewer can reach grove (SC-001, SC-004, SC-005; constitution 4.9–4.12). Steps marked (owner) need the owner at the computer or in the Firebase/GitHub consoles.

- [ ] T062 (owner) Create the Firebase project: Email/Password on, email enumeration protection on, a service-account key; create the fine-grained GitHub token (one repo, Contents read/write, with an expiry); put both and the Web API key in `/etc/grove/` as `deploy/SETUP.md` says
- [ ] T063 Install `cloudflared`; create user `grove`; install grove in its folder with `npm ci --omit=dev`; install `deploy/grove.service`, `deploy/grove-tunnel.service` and `deploy/journald-grove.conf`; enable both units; turn off sleep; confirm full-disk encryption on the computer and the backup disk
- [ ] T064 (owner) Run `owner:setup` and `reviewer:setup` with an address the owner controls; add the `<!-- grove-link -->` block and the reviewer email and password to the private repo's README
- [ ] T065 Verify and record in `docs/STATUS.md` (Verified column for G-01): the README shows the link; signing in as the reviewer and agreeing on a phone over mobile data takes under 1 minute (SC-001); after `systemctl restart grove-tunnel` the README shows the new link within 2 minutes (SC-004); after a reboot grove is back with both accounts (SC-005); an hourly backup restored once by hand into a copy with `backup:restore` opens with the same data (SC-005, constitution 4.12); a throwaway account made, exported and deleted leaves nothing in Firebase; after a day `availability:show` shows the hourly checks (SC-004)
- [ ] T066 Have the owner review the terms text of T057 and adjust it through the spec if needed

---

## Dependencies & Execution Order

### Phase dependencies

- **Setup (Phase 1)** → **Foundational (Phase 2)** → user stories.
- **US1 (P1)** first: sign-in, sessions and the terms gate that the other stories test against. Its tests create accounts directly through the store and the fake Firebase until US4's commands exist.
- **US2 (P1)** after US1.
- **US3, US4, US5 (P2)** after US1; independent of each other.
- **US6 (P3)** after the pages exist (US1, US3); independent of US4 and US5.
- **Polish (Phase 9)** after the stories; **Deploy (Phase 10)** last. T062 (owner's console work) can be done any time, from the phone.

### Within each story

Tests first and failing → migrations and data → services → routes → pages → checkpoint.

### Parallel opportunities

- Phase 1: T003–T007 together.
- Phase 2: test tasks T008–T013 together; then T017, T018 and T023 alongside T015–T016.
- US1: T024–T026 together; T030 and T031 alongside T028–T029.
- After US1: US3, US4 and US5 side by side; inside US4, T041–T044 together and T049 alongside T045–T048.
- Polish: T057–T059 together.

## Parallel Example: User Story 4

```text
Tests together: T041 setup · T042 data · T043 backup · T044 tunnel
Then: T045 → T046 (one CLI file chain), T047 and T048 alongside, T049 any time
```

## Implementation Strategy

### MVP first (US1 + US2)

1. Phases 1–2.
2. US1, then US2: the reviewer can sign in, agree, sign out, and nothing leaks. **Stop and check** with quickstart §2.

### Then, in this order

3. US4 (setup commands, link and backups: needed before any reviewer can reach grove).
4. US5 (guessing) and US3 (password reset).
5. US6 (the look), Polish, then Deploy and verify.

### If time runs short (constitution 4.3)

Cut SHOULD requirements before MUSTs. The core that stays: FR-001–012 (FR-005: desktop browser), FR-014's server-side sign-out, FR-015–020, FR-023, FR-024, FR-026. First to cut: FR-022's message wording, FR-025's full text (a short version stays for FR-011), FR-027–031 (the look beyond the two colour sets).
