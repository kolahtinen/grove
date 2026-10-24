# Research: G-01 Platform, accounts, security and the look's basics

Phase 0 of `/speckit-plan`, 2026-10-24. Each decision lists what was chosen, why, and what else was considered. Constraints that drive most choices: zero budget (C-01, constitution 4.1), few dependencies (constitution 2.6), no outside requests from the page (C-12, 4.4), the owner's own Linux computer (C-06), a build by Sunday 25 October (C-02).

## R1. Language and runtime

- **Decision:** Node.js 22 LTS (22.14 installed), ES modules, no build step.
- **Rationale:** Already installed; one language for server, client and tests; built-in `node:test`, `node:sqlite`, `node:crypto` and `fetch` cover most needs without dependencies.
- **Alternatives:** Python + FastAPI (more dependencies, second language for the client anyway); Go (a single binary, but slower to build in the time left).

## R2. HTTP server

- **Decision:** `node:http` with a small hand-written router; no web framework.
- **Rationale:** About ten endpoints in G-01; a framework adds dozens of transitive packages to audit (2.6). Security headers, size limits, cookies and CSRF are each a few lines and get their own tests anyway.
- **Alternatives:** Express (≈30 transitive packages), Fastify (≈50).

## R3. Storage, migrations and backups

- **Decision:** Built-in `node:sqlite` (`DatabaseSync`), one database file in grove's data folder, WAL mode. Migrations are numbered SQL files applied in order and tracked with `PRAGMA user_version`. Hourly backups with `VACUUM INTO` to a file on the second disk, keeping the last 48; a backup is opened and checked after writing (4.12).
- **Rationale:** No dependency; transactions make the last-invitation-use race safe; `VACUUM INTO` gives a consistent copy while grove runs. RQ-180 allows a database.
- **Alternatives:** `better-sqlite3` (native build, a dependency); JSON files (no transactions, harder migrations).
- **Note:** `node:sqlite` prints an "experimental" warning on Node 22; it is silenced only for that warning. Pin Node 22.14+.

## R4. Firebase Authentication without the Admin SDK

- **Decision:** Call Firebase Authentication's REST API (Identity Toolkit v1) with `fetch` from the server only:
  - sign-up `accounts:signUp`, sign-in `accounts:signInWithPassword`, reset email `accounts:sendOobCode` (`PASSWORD_RESET`), all with the project's Web API key kept on the server;
  - owner-only actions (delete an account, look one up) with a service-account access token: grove signs a JWT (RS256, `node:crypto`) and exchanges it at Google's OAuth token endpoint;
  - ID tokens returned by sign-in are verified before trust (4.5): RS256 signature against Google's published `securetoken` certificates (cached by their `max-age`), `aud` = project ID, `iss` = `https://securetoken.google.com/<project>`, `exp`/`iat`, non-empty `sub`.
- **Rationale:** `firebase-admin` pulls in well over 100 transitive packages; grove needs five calls. Base URLs are configurable so tests run against a local fake.
- **Alternatives:** `firebase-admin` (heavy); Firebase JS SDK in the browser (breaks RQ-367 and C-12).
- **Setup notes:** In the Firebase console, enable Email/Password and **email enumeration protection** (so Firebase itself doesn't reveal addresses). Firebase's free tier covers 6 accounts.

## R5. Same answer for known and unknown addresses (RQ-372, FR-012, FR-020)

- **Decision:** Sign-in, sign-up and reset handlers each return one fixed response shape per outcome class, and every response is held until at least 1.2 s after the request arrived (longer if Firebase is slower). Sign-up: reserve an invitation use in a transaction, call Firebase; `EMAIL_EXISTS` releases the use and returns the same "Done, now sign in" answer. Failed sign-ins are counted per normalised address (trimmed, lower-cased) whether or not it has an account; the 6th try within the 15-minute lock gets the ordinary "wrong email or password" answer without calling Firebase.
- **Rationale:** Covers text, status and timing; the lock answer is indistinguishable from a wrong password.
- **Alternatives:** Random delays (noisier, still leaks averages).

## R6. Sessions and CSRF (FR-013, FR-014; constitution 4.7)

- **Decision:** Grove's own sessions in SQLite: a 32-byte random ID sent as cookie `__Host-grove_session` (HttpOnly, Secure, SameSite=Lax, Path=/, Max-Age 30 days); only a SHA-256 hash of the ID is stored. Each session has its own CSRF token, given to the page by `GET /api/me`; every non-GET request needs it in an `X-CSRF-Token` header and a same-origin `Origin` header. Signed-out forms (sign-in, sign-up, reset) use a pre-session CSRF cookie with a matching header (double submit). Sign-out deletes the session row. A password reset doesn't end sessions (clarification 2).
- **Rationale:** Firebase ID tokens last one hour; grove's own session gives the 30 days and server-side sign-out without refresh tokens in the browser.
- **Alternatives:** Firebase session cookies (need the Admin SDK).

## R7. Client and the look

- **Decision:** Static HTML, CSS and vanilla JS modules served by grove; one stylesheet with Appendix A tokens as CSS custom properties, switched by `prefers-color-scheme`. `prefers-reduced-transparency` and `prefers-reduced-motion` drop blur and glows (FR-031). The logo is inline SVG. Text sizes use `calc(<size> * var(--size-factor))` with `--size-factor: 1`.
- **Font:** `@fontsource/zen-kaku-gothic-new` (OFL-1.1, no dependencies) copied into grove's static files at install, served from grove with its `unicode-range` subsets so only needed files load.
- **Rationale:** No build step, no framework; CSP stays strict (`script-src 'self'`, `style-src 'self'`, no inline styles).
- **Alternatives:** A framework (Preact, Svelte) adds a build and dependencies; later goals can decide if the client grows enough to need one.

## R8. Input validation (constitution 2.4)

- **Decision:** A small hand-written schema module: each endpoint declares its fields (type, length, pattern); unknown fields are rejected; bodies over 100 KB are refused with 413 while streaming, before parsing. Firebase answers are checked against expected shapes too. All SQL uses prepared statements.
- **Alternatives:** `zod` (one dependency, fine too); kept out to stay at minimum.

## R9. Rate limits and client address (FR-021)

- **Decision:** grove binds to 127.0.0.1 and only cloudflared reaches it, so the visitor's address is taken from the `CF-Connecting-IP` header; if missing (local tests), the socket address. Sign-up attempts per address are counted in SQLite over a sliding hour.
- **Alternatives:** In-memory counters (lost on restart; acceptable but no simpler).

## R10. Tunnel and README link (FR-001, FR-004; RQ-364)

- **Decision:** `cloudflared tunnel --url http://127.0.0.1:<port>` (a free quick tunnel) run by a small Node supervisor that reads cloudflared's output, picks out the `https://<name>.trycloudflare.com` address, and on each new address updates `README.md` in the private repo through GitHub's REST contents API (`PUT /repos/<owner>/<repo>/contents/README.md`) between two marker comments, retrying every 15 s until it succeeds. Token: fine-grained, one repository, Contents read/write, with an expiry (4.8).
- **Services:** two systemd system units (`grove.service`, `grove-tunnel.service`), `Restart=always`, running as user `grove`, enabled at boot (4.9, 4.10). Sleep disabled (owner's setup step).
- **Alternatives:** A named Cloudflare tunnel (needs a domain, C-01); `gh` CLI (not installed, adds a tool).

## R11. Secrets (constitution 2.1)

- **Decision:** Secrets (Firebase Web API key, service-account JSON, GitHub token) live in `/etc/grove/` readable only by user `grove`, loaded by systemd `EnvironmentFile=` and a path to the service-account file. Never sent to the browser; logs redact by allow-listing fields.

## R12. Logs (FR-023; constitution 3.6)

- **Decision:** Security log in a SQLite table, read by the owner with a CLI command. The app log is JSON lines written by grove to its data folder, one file per day; files and security-log rows older than 30 days are deleted by the hourly job. Log entries are built from an allow-list of fields, so passwords, tokens, invitation codes and request bodies never get in.

## R13. Testing

- **Decision:**
  - `node --test` for unit and integration tests, against an in-process grove with a **fake Firebase** (a local HTTP server implementing the five REST calls and a test signing key, with the certificates URL pointed at it).
  - `@playwright/test` (dev dependency) with Chromium for browser tests: every-request recording (Q-02), redirects, the look's computed styles in dark and light, phone and desktop widths.
  - Test names start with the FR ID and list the RQ IDs (constitution 1.3, 1.4), e.g. `FR-020 RQ-156 RQ-372: sixth sign-in within 15 minutes is refused`. `scripts/check-trace.mjs` fails if any FR in the spec has no test.
  - Checks in `npm run check`: `npm audit --audit-level=high` (2.6), `gitleaks` (2.1) and `semgrep --config p/javascript` (2.4), both free tools installed on the owner's computer.
- **Alternatives:** Firebase Auth emulator (needs Java and firebase-tools); Jest/Vitest (dependencies for what `node:test` does).
