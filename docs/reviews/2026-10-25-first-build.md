# Review: first build (G-01…G-08)

Fresh-session review as constitution 1.6 asks, 2026-10-25 (question-pages/62). Read: all of `server/`, `tunnel/`, `deploy/`, the browser's API helper and HTML sinks, the trace check, the specs' FR lines. Ran the full test command as a baseline.

**Baseline:** all green — 220 unit tests, 86 browser tests, npm audit 0 vulnerabilities, gitleaks no leaks, semgrep clean, check-trace "all 120 requirements have tests".

## What holds

- **Authorisation (2.3, FR-018):** every route has an access rule; every route that takes a text, sentence, exchange or word looks it up with the session's `account_id`, so another learner's IDs give 404. The reviewer refusal sits in the starting check, as G-06 says.
- **Sessions and CSRF (4.7):** random cookie stored as a hash, `__Host-`, HttpOnly, Secure, SameSite=Lax; Origin check plus token on every change; sign-out deletes the row.
- **Firebase (4.5):** ID tokens checked for RS256, key, signature, audience, issuer, expiry, issue time and subject; outbound calls limited to the three configured origins.
- **Plain text (4.6) and no outside hosts (4.4):** no `innerHTML`-style sinks in `public/assets/`; CSP forbids inline scripts and outside sources; the only outside URLs are links on the credits page.
- **Logs (3.6):** fields are allow-listed, bodies never logged, 30-day clean-up.
- **Migrations (4.13), backups (4.12):** numbered, transactional, foreign-key check after table rebuilds; backups checked by table counts, 48 kept.
- **Process:** nothing references `prototypes/`; `docs/modules.md` lists every module, test command and dependency.

## Findings

Ranked. Each fix goes through the spec and `/regenerate <module>` (1.1).

### Medium

1. **Deletion can leave the Firebase account behind** (owner, constitution 3.2). `learner:delete` deletes grove's rows first and calls Firebase after. If Firebase fails, the command errors, but the account is already gone from grove, so it can't be run again: the Firebase account (with the email) stays. *Fix:* delete in Firebase first (a missing Firebase user counts as done), then grove's rows.
2. **A Firebase answer grove can't read counts as a wrong password** (accounts, FR-012, FR-020). In sign-in, every error that isn't `unavailable` — including a token that fails verification after a certificate change, or a misconfigured project ID — is logged as `signin_failed`, counted toward the lockout and answered "Wrong email or password". During such a fault every learner is told their password is wrong and gets locked out after 5 tries. *Fix:* only `wrong_credentials` counts; `bad_answer` is answered like `unavailable` (503) and logged as `firebase_unreachable` or a new event.
3. **10 requirements don't name a combined requirement** (process, constitution 1.5). FR-221, FR-304, FR-410, FR-411, FR-418, FR-602, FR-607, FR-610, FR-707, FR-802 cite threats, constraints, question pages or the glossary but no RQ — because no RQ exists for them (they come from the threat model, constraints and later decisions). The rule as written can't be met without editing the frozen requirements. *Needs your decision* (see below). **Decided and fixed 2026-10-25** (question-pages/63): RQ-380…389 added in [addendum 001](../addenda/001-requirements-without-rq.md); the 10 requirements name them; 1.5 unchanged.

### Low

4. **The access rule is checked after the body is read** (web, FR-018, FR-022). `http.mjs` reads the request body (up to 100 KB, draining up to 10 MB) before `guard.check`, though its comment and the G-02 changelog say the rule decides first. A signed-out visitor can make grove read bodies on every protected route. *Fix:* check access (and CSRF, which needs no body) before reading.
5. **Accepting a part is two transactions** (texts, FR-216, FR-217). `acceptAnswer` stores texts and words in one; the exchange becomes `accepted` (with its answer hash) in a second. A crash between them leaves the texts stored and the prompt still waiting, so the same paste is accepted again and the texts doubled. *Fix:* one transaction.
6. **The meanings answer re-reads its prompt's wording** (texts). `answerMeanings` gets the asked forms from `prompt.split('\n\n')[1]`; changing the meanings prompt's layout silently breaks it. *Fix:* store the asked forms with the exchange.
7. **A stale link can win in the README** (tunnel, FR-004, SC-004). Each new link starts its own retry loop; an older loop keeps retrying after a newer link arrives. If GitHub is down across a tunnel restart, the old link can be written last. *Fix:* each attempt publishes the current `tunnel_url` and stops when its link is no longer current.
8. **Both services get every secret** (deploy, constitution 2.1, 4.8). `grove.service` and `grove-tunnel.service` load the same `grove.env`, so the web server holds the GitHub token and the tunnel the Firebase keys; the tunnel's config also demands the Firebase settings it never uses. *Fix:* two env files, and `loadConfig` asks only for what each process needs.
9. **Reviewer setup isn't all-or-nothing** (owner, demo, FR-010, FR-705). Firebase account, grove row and demo are three steps; if the demo fails, the reviewer exists without it and `reviewer:setup` refuses to run again. *Fix:* grove row and demo in one transaction; on failure delete the Firebase account again.
10. **The demo reads a `docs/` file at run time** (demo, FR-704). `server/demo/apply.mjs` loads `docs/middle/ai-test/known.txt` when imported, and every owner command imports it. It works because `deploy/SETUP.md` clones the whole repo, but the build depends on a document. *Fix:* `scripts/build-demo.mjs` writes the demo ground into `server/demo/` as it does the demo answer.

## Your decision

- **Finding 3:** amend constitution 1.5 so a requirement may name a threat, constraint, quality attribute or question page instead of an RQ when no RQ exists (still with its need IDs) — a MINOR amendment — or keep the rule and record these 10 as violations.
- **Fixes 1–2, 4–10:** apply them now through spec changes and `/regenerate`, before the deploy. **Decided** (question-pages/63): all 9 now.
