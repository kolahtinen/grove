---
description: "Tasks for G-01: platform, accounts, security and the look's basics"
---

# Tasks: Platform, accounts, security and the look's basics (G-01)

**Input**: `specs/001-platform-accounts-look/` — [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/http-api.md](contracts/http-api.md), [contracts/owner-cli.md](contracts/owner-cli.md), [quickstart.md](quickstart.md)

**Tests**: Required. Constitution 1.3 and 1.4: tests are written from the spec before the code, one per acceptance criterion, and stay fixed. Every test name starts with its FR ID and lists its RQ IDs, e.g. `FR-020 RQ-156 RQ-372: sixth sign-in within 15 minutes is refused`. Write each story's tests first and see them fail before implementing.

**Organization**: Grouped by user story (US1…US6 from spec.md) so each story can be built and checked on its own.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: can run in parallel (different files, no dependency on an unfinished task)
- **[Story]**: the user story the task belongs to

## Path Conventions

One Node project at the repo root (plan.md "Project Structure"): `server/<module>/`, `tunnel/`, `public/`, `deploy/`, `scripts/`, `tests/<module>/`, `tests/e2e/`, `tests/fakes/`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project skeleton, scripts and tools

- [ ] T001 Create the folders of plan.md "Project Structure" (`server/{web,accounts,firebase,store/migrations,seclog,owner}`, `tunnel`, `public/{assets,fonts}`, `deploy`, `scripts`, `tests/{fakes,web,accounts,firebase,store,seclog,owner,tunnel,e2e}`)
- [ ] T002 Create `package.json` (`"type": "module"`, `"engines": {"node": ">=22.14"}`, `"private": true`) with scripts `test` (`node --test tests/`), `test:e2e` (`playwright test`), `check` (`npm audit --audit-level=high && gitleaks detect --no-banner && semgrep --config p/javascript --error server tunnel public scripts && node scripts/check-trace.mjs`), `dev`, `start`, `postinstall` (`node scripts/copy-fonts.mjs`) and the owner commands of contracts/owner-cli.md (`owner:setup`, `invite:set`, `invite:list`, `learner:export`, `learner:delete`, `log:show`, `backup:now`, `backup:restore`); add dependency `@fontsource/zen-kaku-gothic-new` and dev dependency `@playwright/test`; run `npm install` to create the lockfile
- [ ] T003 [P] Extend `.gitignore` with `test-results/`, `playwright-report/`, `public/fonts/` (copied at install) and `*.db*`
- [ ] T004 [P] Write `scripts/copy-fonts.mjs`: copy the woff2 files for weights 400, 500, 700 and the `@font-face` rules (with `unicode-range`) of `@fontsource/zen-kaku-gothic-new` into `public/fonts/`, rewriting URLs to `/fonts/…`, plus its `LICENSE` (OFL-1.1) as `public/fonts/OFL.txt`
- [ ] T005 [P] Write `scripts/check-trace.mjs`: read every `**FR-NNN**` ID from `specs/*/spec.md`, collect test names from `tests/**/*.test.mjs` and `tests/e2e/**/*.spec.mjs`, and exit 1 listing each FR with no test whose name starts with that ID (constitution 1.4)
- [ ] T006 [P] Write `playwright.config.mjs`: Chromium only, `webServer` = `node tests/fakes/dev-server.mjs` on 127.0.0.1:8788, projects for phone (360×780) and desktop (1440×900)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Config, database, logs, Firebase client, the web core and the page shell that every story needs

**⚠️ No user story work starts until this phase is done**

### Tests for the foundation (write first)

- [ ] T007 [P] Write `tests/fakes/fake-firebase.mjs`: a local HTTP server implementing `accounts:signUp` (returns `EMAIL_EXISTS` for a known address), `accounts:signInWithPassword` (returns an RS256 ID token signed with a test key, `INVALID_LOGIN_CREDENTIALS` otherwise), `accounts:sendOobCode` (records the request), admin `accounts:delete` and `accounts:lookup`, the OAuth token endpoint, and the `securetoken` certificates URL; switches to make it unreachable or slow; it records every request so tests can inspect them
- [ ] T008 [P] Write `tests/fakes/fake-github.mjs` (contents API: GET and PUT of one file, records paths written) and `tests/fakes/dev-server.mjs` (starts the fakes, a temp data folder and grove on 127.0.0.1:8788 with config pointed at the fakes; used by `npm run dev` on 8787 and Playwright on 8788)
- [ ] T009 [P] Tests in `tests/store/store.test.mjs`: `FR-002 RQ-180:` a change committed before a close is there after reopening; migrations run in order and set `user_version`; `FR-002 RQ-180: migration keeps data` (constitution 4.13: apply all migrations to a copy of a database at the previous version filled with rows, and check every row survives)
- [ ] T010 [P] Tests in `tests/firebase/firebase.test.mjs`: `FR-009 RQ-366 RQ-367:` sign-up, sign-in, reset and delete calls reach only the configured Firebase URLs with the server-side key; ID-token verification accepts a good token and rejects a forged signature, an expired token, the wrong `aud`, the wrong `iss` and an empty `sub` (T-10, constitution 4.5); unexpected answer shapes are rejected; an unreachable Firebase gives a `signin_unavailable` error
- [ ] T011 [P] Tests in `tests/seclog/seclog.test.mjs`: `FR-023 RQ-371:` entries hold time, event, who and only allow-listed detail fields; a password, token, invitation code or body text passed in is dropped; entries and app-log files older than 30 days are removed by the clean-up
- [ ] T012 [P] Tests in `tests/web/core.test.mjs`: `FR-001 RQ-125:` the server listens on 127.0.0.1 only (constitution 2.2); `FR-024 RQ-331 RQ-367:` every response has the CSP and other headers of contracts/http-api.md; `FR-022 RQ-161 RQ-231:` a 100 KB + 1 byte body gets `413 too_large` and the server answers the next request; malformed JSON and unknown fields get `400 bad_request` with no internal detail (constitution 2.5); a thrown handler error gives a plain 500 and no stack trace; non-GET without a valid CSRF token or with a foreign `Origin` gets `403 csrf`

### Implementation for the foundation

- [ ] T013 Write `server/config.mjs`: read `GROVE_PORT`, `GROVE_DATA_DIR`, `GROVE_BACKUP_DIR`, `FIREBASE_API_KEY`, `FIREBASE_PROJECT_ID`, `FIREBASE_SERVICE_ACCOUNT_FILE`, `FIREBASE_AUTH_URL`, `FIREBASE_TOKEN_URL`, `FIREBASE_CERTS_URL`, `GITHUB_TOKEN`, `GITHUB_REPO`; Google URLs default to the real ones, secrets have no default and grove refuses to start without them (constitution 2.1); export a frozen config object that never logs secret values
- [ ] T014 Write `server/store/db.mjs` (open `node:sqlite` `DatabaseSync` in WAL mode with foreign keys on; silence only the SQLite experimental warning; `transaction(fn)` helper) and `server/store/migrate.mjs` (apply `server/store/migrations/NNN-*.sql` in order inside transactions, tracking `PRAGMA user_version`)
- [ ] T015 Write `server/store/migrations/001-accounts.sql` with tables `accounts`, `invitations`, `sessions`, `settings` exactly as data-model.md: `accounts.firebase_uid TEXT UNIQUE NOT NULL`, `email TEXT UNIQUE NOT NULL`, `is_owner` with "at most one row with 1 (partial unique index)", `terms_agreed_at INTEGER NOT NULL`, `age_confirmed_at INTEGER NOT NULL`; `invitations.label TEXT UNIQUE NOT NULL`, `code_hash TEXT UNIQUE NOT NULL`, `uses_taken ≤ uses_allowed` as a CHECK; `sessions.account_id … ON DELETE CASCADE`
- [ ] T016 [P] Write `server/seclog/seclog.mjs`: `logSecurity(event, {accountId, email, ip, detail})` with the event list of data-model.md and an allow-list for `detail` (`invitation_label`, `reason`, `count`); `appLog(level, msg, fields)` writing JSON lines to `<data>/logs/YYYY-MM-DD.jsonl` through the same allow-list; `cleanUpLogs(now)` deleting rows and files older than 30 days; migration `server/store/migrations/002-security-log.sql` with table `security_log` as data-model.md
- [ ] T017 [P] Write `server/firebase/client.mjs` (REST calls `signUp`, `signInWithPassword`, `sendPasswordReset`, admin `deleteUser`, `lookupUser`, with timeouts and strict answer-shape checks; error mapping to `email_exists`, `wrong_credentials`, `unavailable`), `server/firebase/service-token.mjs` (RS256 JWT from the service-account file, exchanged for an access token, cached until 5 minutes before expiry) and `server/firebase/verify-token.mjs` (certificate cache by `max-age`; checks of research R4)
- [ ] T018 Write `server/web/http.mjs` (server bound to `127.0.0.1`, router by method and path, JSON body reader that stops at 100 KB, schema checker for declared fields that refuses unknown ones, error handler producing `{error, message}`), `server/web/headers.mjs` (headers of contracts/http-api.md on every response) and `server/web/static.mjs` (serves `public/` with correct content types and no directory listing)
- [ ] T019 Write `server/web/session.mjs`: create a session (32 random bytes, cookie `__Host-grove_session`, HttpOnly, Secure, SameSite=Lax, Path=/, Max-Age 2592000; store only the SHA-256 hash, `csrf_token`, `expires_at` = now + 30 days), look one up from a request (ignoring expired ones), delete one; pre-session CSRF cookie and check (double submit) for signed-out forms; CSRF check on every non-GET (`X-CSRF-Token` + same-origin `Origin`)
- [ ] T020 Write `server/web/guard.mjs`: route option `access: 'public' | 'signed_in' | 'owner'`; works out the role from the session only (never from the request body or URL); signed-out page requests → `303 /signin`, signed-out API → `401 signed_out`
- [ ] T021 Write `server/main.mjs`: load config, open and migrate the store, start the web server, run the hourly job (log clean-up, expired sessions, idle counters; backups added in US4)
- [ ] T022 [P] Write the page shell: `public/assets/grove.css` with the Appendix A.1 tokens for both looks as custom properties under `prefers-color-scheme`, the font faces from `public/fonts/`, body type of A.2, the 560 px column and the sticky top bar of A.3; `public/assets/logo.svg` copied from A.5; `public/assets/api.mjs` (fetch wrapper that sends the CSRF token and shows `message` from error answers as text)

**Checkpoint**: `npm test` passes T009–T012; grove starts with the fakes.

---

## Phase 3: User Story 1 - Sign up by invitation and get a private grove (Priority: P1) 🎯 MVP

**Goal**: An invited reviewer signs up with the code, signs in, stays signed in for 30 days and can sign out.

**Independent Test**: Fresh grove; sign up with a valid code, sign out, sign in again, close and reopen the browser; each step works and the code shows one use fewer.

### Tests for User Story 1 (write first)

- [ ] T023 [P] [US1] Tests in `tests/accounts/signup.test.mjs`: `FR-010 RQ-217 RQ-222 RQ-368:` a valid code with uses left creates an account with the learner and reviewer roles and takes one use; a used-up, wrong or missing code gives `400 invitation_invalid`, makes no account and takes no use; two sign-ups racing for the last use make exactly one account; `FR-011 RQ-218 RQ-221:` passwords under 8 characters or missing a letter, digit or symbol get `400 password_rule`; `FR-011 RQ-141 RQ-228:` missing `agreeTerms` or `confirmAge13` gets `400 agreement_needed` and no account; a created account has `terms_agreed_at` and `age_confirmed_at`; `FR-012 RQ-372:` a sign-up with an existing address answers `200 {result:"done"}` exactly like a new one, changes no account and takes no use; `FR-023 RQ-371:` a sign-up is logged with the invitation label and not the code
- [ ] T024 [P] [US1] Tests in `tests/accounts/signin.test.mjs`: `FR-009 RQ-366:` the right password gives `200 {result:"signed_in"}` and a session cookie, only after the ID token is verified; `FR-013 RQ-224:` the cookie has HttpOnly, Secure, SameSite=Lax, Path=/ and Max-Age 2592000, a session 29 days old still works and one 30 days old doesn't; `FR-014 RQ-226:` `POST /api/signout` deletes the session on the server and the old cookie no longer works; `GET /api/me` returns the email, roles and CSRF token; `FR-023 RQ-371:` sign-ins and sign-outs are logged
- [ ] T025 [P] [US1] Playwright test `tests/e2e/signup.spec.mjs`: `FR-012 FR-014 RQ-217 RQ-226:` sign up on `/signup` with the dev invitation, see "Done, now sign in", sign in on `/signin`, land on `/` with the email and a Sign out button in the header, sign out, land on `/signin`; `FR-011 RQ-228:` the sign-up button stays refused until both boxes are ticked and the terms link opens `/terms`

### Implementation for User Story 1

- [ ] T026 [US1] Write `server/accounts/invitations.mjs`: hash codes with SHA-256; `reserveUse(code)` in a transaction (only an `active` invitation with `uses_taken < uses_allowed`) returning the invitation or `invalid`; `releaseUse(id)`; `createInvitation({label, uses, reviewer})` returning a new random code (16 bytes, base32) once
- [ ] T027 [US1] Write `server/accounts/same-answer.mjs`: `holdUntil(startTime, 1200)` so sign-up, sign-in and reset answers take at least 1.2 s (research R5)
- [ ] T028 [US1] Write `server/accounts/signup.mjs` and route `POST /api/signup` (access `public`) with schema `{code: string ≤64, email: string ≤254, password: string 8–128, agreeTerms: true, confirmAge13: true}`: check the password rule, the two agreements and the code first; then reserve a use, call Firebase `signUp`; on success insert the account (`is_reviewer` from the invitation, both agreement times) and log `signup`; on `email_exists` release the use; answer `200 {result:"done"}` in both cases; Firebase unreachable → release the use and `503 signin_unavailable`
- [ ] T029 [US1] Write `server/accounts/signin.mjs` and routes `POST /api/signin` (access `public`, schema `{email, password}`), `POST /api/signout` (access `signed_in`), `GET /api/me` (access `signed_in`): sign-in calls Firebase, verifies the ID token, finds the account by `firebase_uid`, creates a session and logs `signin`; wrong password or unknown address → `401 wrong_credentials`; `GET /api/csrf` (access `public`) for the pre-session token
- [ ] T030 [P] [US1] Write `public/signup.html` + `public/assets/signup.mjs` (code, email, password with the rule shown, the two boxes with a link to `/terms`, the "Done, now sign in" screen) and `public/signin.html` + `public/assets/signin.mjs` (email, password, link to `/reset` and `/signup`); all user-visible values set with `textContent`, never HTML (constitution 4.6)
- [ ] T031 [P] [US1] Write `public/index.html` + `public/assets/home.mjs`: the top bar with logo, title, the signed-in email and a Sign out button, and an empty-grove card ("Your grove is empty for now")

**Checkpoint**: US1 tests pass; a reviewer can sign up, sign in and sign out locally.

---

## Phase 4: User Story 2 - My data stays mine (Priority: P1)

**Goal**: No account reaches another's data, signed-out visitors see only the public pages, and nothing but grove is contacted.

**Independent Test**: Authorisation tests for every endpoint × 4 roles, an ID-swap test, and a browser request recorder on every page.

### Tests for User Story 2 (write first)

- [ ] T032 [P] [US2] Tests in `tests/web/authz.test.mjs`: `FR-018 RQ-155:` a table of every route in the router × {signed-out visitor, learner, reviewer, owner} with the expected status, built from the router so a new route without an entry fails the test; adding an `accountId`, `id` or `email` field to any signed-in request is refused as an unknown field and never changes whose data is used; `FR-008 RQ-90 RQ-147:` two learners signed in at once each get their own account from `/api/me`, and every account created by sign-up has the learner role; `FR-019 RQ-162:` signed-out requests to `/` get `303 /signin`, and to signed-in API routes `401 signed_out`; `/signin`, `/signup`, `/reset`, `/terms` and their assets answer 200
- [ ] T033 [P] [US2] Tests in `tests/web/outbound.test.mjs`: `FR-006 RQ-181 RQ-367:` during a full run of sign-up, sign-in, reset, sign-out and an owner delete, the server's `fetch` reaches only the configured Firebase, OAuth and certificate URLs (constitution 4.2, 4.5); `FR-007 RQ-178:` no route or page offers a conversation partner (no `/chat` route, no chat element on any page)
- [ ] T034 [P] [US2] Playwright test `tests/e2e/privacy.spec.mjs`: `FR-024 RQ-331 RQ-367:` on every page, signed out and signed in, every request goes to grove's own origin and fonts load from `/fonts/` (Q-02, constitution 4.4); an email address containing `<b>` is shown as text in the header (constitution 4.6)

### Implementation for User Story 2

- [ ] T035 [US2] Add the route table export to `server/web/http.mjs` (method, path, access) used by the authz test, and make `server/web/guard.mjs` refuse any route registered without an `access` value at start-up
- [ ] T036 [US2] Wrap the server's outbound requests in `server/firebase/client.mjs` with an allow-list of the configured Firebase, OAuth and certificate hosts that throws on any other host

**Checkpoint**: US1 and US2 pass together; this is the MVP.

---

## Phase 5: User Story 3 - Get back in after forgetting my password (Priority: P2)

**Goal**: A reset email for an account, the same answer for any address.

**Independent Test**: Reset an existing account through the fake Firebase; set a new password; sign in with it; the old one fails.

### Tests for User Story 3 (write first)

- [ ] T037 [P] [US3] Tests in `tests/accounts/reset.test.mjs`: `FR-015 RQ-219:` a reset for an account's address sends a Firebase `PASSWORD_RESET` request and answers `200 {result:"sent_if_account"}`; `FR-015 RQ-372:` an unknown address gets the identical answer (body, status) and the response takes at least 1.2 s in both cases; `FR-023 RQ-371:` the request is logged as `reset_requested`; `FR-013 RQ-224 RQ-219:` an existing session still works after the password is changed in the fake Firebase (clarification 2)
- [ ] T038 [P] [US3] Playwright test `tests/e2e/reset.spec.mjs`: `FR-015 RQ-219:` the reset page sends and shows "If this address has an account, an email is on its way"

### Implementation for User Story 3

- [ ] T039 [US3] Write `server/accounts/reset.mjs` and route `POST /api/reset` (access `public`, schema `{email: string ≤254}`): call Firebase `sendPasswordReset` for every well-formed address (Firebase's enumeration protection hides unknown ones), log `reset_requested`, answer `200 {result:"sent_if_account"}`, held to 1.2 s; unreachable → `503 signin_unavailable`
- [ ] T040 [P] [US3] Write `public/reset.html` + `public/assets/reset.mjs`

**Checkpoint**: US3 passes on its own.

---

## Phase 6: User Story 4 - The owner sets up and runs grove safely (Priority: P2)

**Goal**: The owner's setup command, invitations in the README, the tunnel and link updater, start on boot, hourly backups, export and delete commands, the security log.

**Independent Test**: The quickstart §2 owner steps with the fakes; restart the tunnel supervisor and time the README update; export and delete a test learner and look for leftovers.

### Tests for User Story 4 (write first)

- [ ] T041 [P] [US4] Tests in `tests/owner/setup.test.mjs`: `FR-016 RQ-146 RQ-223 RQ-227:` `owner:setup` creates an account with the owner and learner roles; run again for another email it refuses and no second owner exists; sign-up never sets `is_owner`; `FR-023 RQ-371:` the setup is logged
- [ ] T042 [P] [US4] Tests in `tests/owner/invite.test.mjs`: `FR-010 RQ-222 RQ-368:` `invite:set --uses 5 --reviewer` prints a new code once, deactivates the previous code with that label, refuses `--uses` outside 1–5 for a reviewer code, and writes the code into the fake GitHub README between `<!-- grove-invite -->` markers; `invite:list` never prints codes
- [ ] T043 [P] [US4] Tests in `tests/owner/data.test.mjs`: `FR-017 RQ-229:` `learner:export` writes JSON with the account and every row that references it; `learner:delete` removes the account, its sessions and every row that references it in grove, and the user in the fake Firebase, and a signed-in session of that learner is then treated as signed out; both are logged; `log:show` prints entries filtered by event and hours
- [ ] T044 [P] [US4] Tests in `tests/store/backup.test.mjs`: `FR-003 RQ-180:` `backup:now` writes `grove-YYYYMMDD-HH.db` to the backup folder, opens it and finds the same row counts; only the last 48 are kept; `backup:restore` refuses while grove holds the database and otherwise replaces it
- [ ] T045 [P] [US4] Tests in `tests/tunnel/tunnel.test.mjs`: `FR-004 RQ-364:` given cloudflared output lines with a new `https://*.trycloudflare.com` address, the supervisor stores it and PUTs `README.md` to the fake GitHub with the link between `<!-- grove-link -->` markers within 2 minutes, retrying every 15 s while GitHub fails; it never writes any path but `README.md` (constitution 4.8); `FR-002 RQ-125:` the unit files in `deploy/` have `Restart=always`, `User=grove`, `WantedBy=multi-user.target`

### Implementation for User Story 4

- [ ] T046 [US4] Write `server/owner/cli.mjs` (argument parsing, plain error messages, non-zero exit) and `server/owner/setup.mjs`: ask the password twice without echo, call Firebase `signUp`, insert the account with `is_owner = 1`, refuse if an owner exists, log `owner_setup`
- [ ] T047 [US4] Write `server/owner/github-readme.mjs` (GET and PUT `README.md` through the contents API with the fine-grained token, replacing only the text between a given pair of markers) and `server/owner/invite.mjs` (`invite:set`, `invite:list`, logging `invitation_set`)
- [ ] T048 [US4] Write `server/owner/data.mjs`: `learner:export --email [--out]` and `learner:delete --email --yes` (delete in grove in one transaction, then Firebase `deleteUser`; log `export` / `delete`) and `server/owner/log.mjs` (`log:show`)
- [ ] T049 [US4] Write `server/store/backup.mjs` (`VACUUM INTO <backup dir>/grove-YYYYMMDD-HH.db`, open and count rows, keep 48; restore with a lock-file check) and add the hourly backup to the job in `server/main.mjs`; add `backup:now`, `backup:restore` to `server/owner/cli.mjs`
- [ ] T050 [US4] Write `tunnel/supervisor.mjs`: spawn `cloudflared tunnel --url http://127.0.0.1:<port>`, read its output, on a new address save `settings.tunnel_url` and update the README link through `server/owner/github-readme.mjs`, retry every 15 s, restart cloudflared when it exits; log failures without the token
- [ ] T051 [P] [US4] Write `deploy/grove.service`, `deploy/grove-tunnel.service` (`User=grove`, `EnvironmentFile=/etc/grove/grove.env`, `Restart=always`, `WantedBy=multi-user.target`) and `deploy/SETUP.md` (create user `grove`, secrets in `/etc/grove/` mode 600, enable units, disable sleep, full-disk encryption reminder, Firebase console settings of research R4, token settings of research R10)

**Checkpoint**: US4 passes; quickstart §2 owner steps work with the fakes.

---

## Phase 7: User Story 5 - Grove resists guessing and floods (Priority: P2)

**Goal**: Lockout per address, the same answers, sign-up limits per internet address, size limits.

**Independent Test**: Scripted attempts: 6 wrong passwords, 11 sign-ups from one address, a 101 KB body, known vs unknown addresses compared.

### Tests for User Story 5 (write first)

- [ ] T052 [P] [US5] Tests in `tests/accounts/lockout.test.mjs`: `FR-020 RQ-156:` after 5 failed sign-ins in a row for an address, a 6th within 15 minutes is refused even with the right password and Firebase isn't called; after 15 minutes the right password works; a success resets the count; `FR-020 RQ-372:` an address with no account locks the same way and the locked answer equals the wrong-password answer; `FR-023 RQ-371:` failed sign-ins and the lockout are logged
- [ ] T053 [P] [US5] Tests in `tests/accounts/same-answer.test.mjs`: `FR-012 RQ-372:` for sign-in, sign-up and reset, an address with an account and one without give identical status and body, and both responses take at least 1.2 s
- [ ] T054 [P] [US5] Tests in `tests/accounts/ratelimit.test.mjs`: `FR-021 RQ-160 RQ-225:` 10 sign-up attempts from one `CF-Connecting-IP` within an hour are handled and the 11th gets `429 too_many_signups`; another address isn't affected; without the header the socket address is used

### Implementation for User Story 5

- [ ] T055 [US5] Write migration `server/store/migrations/003-counters.sql` with `failed_signins` (`email TEXT PK`, `failures INTEGER NOT NULL`, `locked_until INTEGER NULL`, `updated_at INTEGER NOT NULL`) and `signup_attempts` (`ip TEXT NOT NULL`, `at INTEGER NOT NULL`) as data-model.md
- [ ] T056 [US5] Write `server/accounts/lockout.mjs` (count per normalised address; lock for 15 minutes on the 5th failure; log `signin_failed` and `lockout`) and use it in `server/accounts/signin.mjs` before calling Firebase
- [ ] T057 [US5] Write `server/accounts/ratelimit.mjs` (client address from `CF-Connecting-IP`, else the socket; >10 attempts in the last hour → `429 too_many_signups`, logged as `signup_refused`) and use it first in `server/accounts/signup.mjs`; add idle-row clean-up to the hourly job

**Checkpoint**: US5 passes; all accounts tests pass together.

---

## Phase 8: User Story 6 - A calm forest look on every screen (Priority: P3)

**Goal**: Night forest and Pale birch, frosted cards, buttons, type, layout and logo as Appendix A, on phone and desktop.

**Independent Test**: Playwright compares computed styles of the G-01 pages with Appendix A in dark and light at 360 px and 1440 px.

### Tests for User Story 6 (write first)

- [ ] T058 [P] [US6] Playwright test `tests/e2e/look.spec.mjs`: `FR-026 RQ-306 RQ-334 RQ-335:` with `colorScheme: 'dark'` the body background is `#0A110E` and text `#E8F0E9`; with `'light'` `#F3F0E8` and `#1E2A22`, and the other A.1 tokens resolve to their values; `FR-027 RQ-331 RQ-337:` the computed font family starts with Zen Kaku Gothic New, body is 15px with line height 1.6; `FR-005 FR-030 RQ-23 RQ-38 RQ-341:` at 360 px and 1440 px the main column is ≤ 560 px wide and centred with no horizontal scroll, and the top bar is sticky with a 14px backdrop blur and holds the logo; `FR-028 RQ-314 RQ-338 RQ-339:` cards have radius 22px, an 18px backdrop blur and the `--shadow` value; `FR-029 RQ-316 RQ-340:` buttons have radius 14px, main buttons the accent gradient, and pressing a button scales it to 0.97; `FR-031 RQ-314 R-15:` with reduced motion emulated, cards and top bar have no backdrop blur

### Implementation for User Story 6

- [ ] T059 [US6] Complete `public/assets/grove.css` from Appendix A: all A.1 tokens and the background glows for both looks; A.2 sizes with content text as `calc(<size> * var(--size-factor))` and `--size-factor: 1`; A.3 radii, frosted glass (blur 18px, saturate 1.4), shadows and glows, main-button gradient, `:active { transform: scale(.97) }`, top bar, progress bar and grid classes; `@media (prefers-reduced-motion: reduce), (prefers-reduced-transparency: reduce)` dropping blur and glows in favour of solid `--card2`
- [ ] T060 [P] [US6] Apply the look to every G-01 page (`public/index.html`, `signin.html`, `signup.html`, `reset.html`, `terms.html`): one card per form, main buttons for the main action, the logo and app title in the top bar

**Checkpoint**: all six stories pass.

---

## Phase 9: Polish & Cross-Cutting Concerns

- [ ] T061 [P] Write `public/terms.html` with every point of FR-025 (13 and over; share only texts you may share; the suspension and ban rule; each kind of data kept and why; Firebase (Google) and Cloudflare as processors; the learner's own AI's terms; own texts only auto-checked; ask the owner to export or delete) in plain language for the owner to review; test `tests/e2e/terms.spec.mjs` named `FR-025 RQ-141 RQ-228 RQ-376:` checking `/terms` is public and contains each point's key phrase
- [ ] T062 [P] Tests in `tests/web/errors.test.mjs`: `FR-009 RQ-366:` with the fake Firebase unreachable, sign-in, sign-up and reset answer `503 signin_unavailable` with a plain message, and a signed-in learner's `GET /api/me` still works; error pages and the app log contain no secret value from config (constitution 2.1)
- [ ] T063 [P] Test `tests/seclog/logscan.test.mjs`: `FR-023 RQ-371:` run sign-up, sign-in, a failed sign-in, a reset and a 100 KB+ request, then scan the security log and app-log files for the password, invitation code, ID token and body text used (constitution 3.6)
- [ ] T064 Run `npm run check` and fix what it finds through the spec and tasks, not by hand edits to generated code (constitution 1.1); confirm `check-trace` lists every FR-001…031 with a test
- [ ] T065 Walk through quickstart.md §1 and §2 and record the result in `docs/STATUS.md` (Implemented column for G-01)

---

## Dependencies & Execution Order

### Phase dependencies

- **Setup (Phase 1)** → **Foundational (Phase 2)** → user stories.
- **US1 (P1)** first: it creates accounts and sessions that the other stories test against.
- **US2 (P1)** after US1 (its tests need signed-in learners of each role).
- **US3, US4, US5 (P2)** after US1; independent of each other. US4's owner role is used by US2's authz table, so add the owner row to T032 once T046 exists (the table test starts with three roles until then).
- **US6 (P3)** after the pages exist (US1, US3); independent of US4 and US5.
- **Polish** last.

### Within each story

Tests first and failing → migrations and data → services → routes → pages → checkpoint.

### Parallel opportunities

- Phase 1: T003–T006 together.
- Phase 2: test tasks T007–T012 together; then T016, T017 and T022 alongside T014–T015.
- US1: T023–T025 together; T030 and T031 alongside T028–T029.
- After US1: US3, US4 and US5 can be worked on side by side; inside US4, T041–T045 together and T051 alongside T046–T050.
- Polish: T061–T063 together.

## Parallel Example: User Story 4

```text
Tests together: T041 setup · T042 invite · T043 data · T044 backup · T045 tunnel
Then: T046 → T047 → T048 (one CLI file chain), T049 and T050 alongside, T051 any time
```

## Implementation Strategy

### MVP first (US1 + US2)

1. Phases 1–2.
2. US1, then US2: a reviewer can sign up, sign in and out, and nothing leaks. **Stop and check** with quickstart §2.

### Then, in this order

3. US4 (the owner's setup, link and backups: needed before any reviewer can reach grove).
4. US5 (guessing and floods) and US3 (password reset).
5. US6 (the look) and Polish.

### If time runs short (constitution 4.3)

Cut SHOULD requirements before MUSTs. The core that stays: FR-001–010 (FR-005: desktop browser; FR-010: the reviewer code, RQ-368 is MUST), FR-011's recorded agreement and age confirmation (constitution 3.1), FR-012, FR-014's server-side sign-out, FR-015–020, FR-023, FR-024, FR-026. First to cut: FR-021, FR-022's message wording, FR-025's full text (a short version stays for 3.1), FR-027–031 (the look beyond the two colour sets).
