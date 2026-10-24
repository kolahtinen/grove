# Threat model (STRIDE): grove (app-wide)

Phase 2 (`/pre.threats`, 2026-10-21; question-pages/50). Redone for the combined app: hosting on the owner's computer behind a Cloudflare quick tunnel (C-06, X-01), accounts in Firebase Authentication reached only from grove's server (RQ-366, RQ-367), a private GitHub repo whose README holds the link and the reviewer invitation code (C-11, RQ-364, RQ-368), and AI by copy-paste (C-08). Reuses T-p1-01…09 and T-p0-01, 02 where they still apply (named in each row).

## Components and connections

```
reviewer / learner / owner
   │
browser ──HTTPS── Cloudflare quick tunnel (edge) ──outgoing tunnel── cloudflared ─┐
   │  (clipboard)                                                                  │ owner's computer
learner's own AI chat (outside grove)                                              │ (grove's own limited user)
                                                                                   ▼
                                   grove server ── database and data folder ── hourly backup to a second disk
                                     │   │
                     HTTPS (server only) │ reads once: Kelly list file (imported)
                                     ▼   │
                     Firebase Authentication (Google): email, hashed password, reset emails
                                         │
   README updater script (owner's computer) ──HTTPS + GitHub token── private GitHub repo (README: link + invitation code)
                                                                          ▲
                                                         reviewers (GitHub collaborators)
```

## Trust boundaries

- **Browser ↔ grove server:** everything from the browser is untrusted: form fields, cookies, pasted AI answers and texts, IDs in requests.
- **Internet ↔ owner's computer:** the tunnel brings traffic from anyone who has the link; Cloudflare's edge terminates HTTPS and can see the traffic.
- **Grove server ↔ Firebase:** an outside processor; its answers come over HTTPS and its tokens are verified.
- **Owner's computer ↔ GitHub:** the GitHub token is a secret on the owner's computer; the README is readable by every collaborator.
- **Learner's own AI chat:** outside grove entirely; grove only sees what's pasted back.
- **Imported data (Kelly list):** trusted after the import checks.

## Threats

S = spoofing (authenticity) · T = tampering (integrity) · R = repudiation (non-repudiation) · I = information disclosure (confidentiality) · D = denial of service (availability) · E = elevation of privilege (authorization)

| ID | Component or connection | STRIDE | Threat | Handling (redesign / mitigate / accept) | Mitigation | Goes to (constitution rule / requirement with test) | Needs, requirements, risks |
|---|---|---|---|---|---|---|---|
| T-01 | Sign-in (T-p1-01) | S | Someone guesses a reviewer's password. | mitigate | Lockout for 15 minutes after 5 failed sign-ins, counted by grove's server (RQ-156); the password rule (RQ-221); Firebase's own throttling on top. | requirement with test (RQ-156, RQ-221) | N-20 · RQ-156, 221, 366 · R-17 |
| T-02 | Sign-in cookie | S | A stolen or forged cookie lets someone act as a reviewer; another site makes the reviewer's browser send requests (cross-site request forgery). | mitigate | Grove's own session cookie: random, HttpOnly, Secure, SameSite=Lax; state-changing requests need a CSRF token; sign-out ends the session on the server. | constitution rule | N-20 · RQ-224, 226, 367 · R-07 |
| T-03 | Owner account (RQ-223) | E | Someone who knows the owner's email address signs up with it first and gets the owner's rights, since that email needs no invitation. | redesign | The owner's account is created on the owner's computer with a setup command, never through grove's sign-up page; RQ-223 changed (question-pages/50). | requirement with test | N-18, N-20 · RQ-146, 223 · R-07 |
| T-04 | Invitation code in the README (RQ-368) | S, E | The code leaks (a reviewer forwards it) and strangers create accounts. | accept | At most 5 sign-ups (RQ-368) and the private repo (C-11) already limit it; the security log shows which accounts used the code (RQ-371). | requirement with test (RQ-368) | N-18 · RQ-217, 222, 368 · R-17 |
| T-05 | Password reset (RQ-219) | I | The sign-up, sign-in or reset answer tells whether an email address has an account, so someone can find out who the reviewers are. | mitigate | The same answer whether or not the address has an account (RQ-372). | requirement with test | N-24 · RQ-219, 366, 372 |
| T-06 | Pasted AI answers and texts, demo texts (T-p1-02, T-p0-01) | T | A paste contains HTML or script that runs in the learner's (or later another learner's) browser. | mitigate | Every pasted or AI-made text is shown as plain text, never as HTML; a Content-Security-Policy with no inline scripts. | constitution rule | N-20 · RQ-40, 182, 361 · R-07 |
| T-07 | Pasted answers and every request body | T, D | A malformed or huge paste crashes or slows the server, or smuggles in unexpected fields. | mitigate | Size limit (RQ-231); every input is parsed strictly and checked against its schema before use; errors are answered, never crash the server. | constitution rule; requirement with test (RQ-231) | N-42 · RQ-41, 161, 184, 231 · R-01 |
| T-08 | Learner data on the server (T-p1-05) | I, E | A signed-in learner reads or changes another learner's data by changing an ID in a request. | mitigate | Every request is checked on the server against who is asking and what they own (RQ-155), with a test for each endpoint. | constitution rule; requirement with test (RQ-155) | N-17, N-20 · RQ-155, 162 · R-07 |
| T-09 | Roles (T-p1-08) | E | A learner gives themselves the owner's or a reviewer's rights. | mitigate | One owner, set on the owner's computer (RQ-146, T-03); 'reviewer' is set only by the invitation (RQ-360); 'content maintainer' (second build) only by the owner (RQ-373, question-pages/51); roles checked on every request (RQ-155). Course roles (RQ-149…154) come later with their own checks. | requirement with test | N-18 · RQ-146, 147, 155, 360 |
| T-10 | Firebase connection | S, T | Grove trusts a forged or tampered Firebase answer, or a token from another Firebase project. | mitigate | Only grove's server talks to Firebase, over HTTPS (RQ-367); ID tokens are verified (signature, project, expiry) before grove trusts them. | constitution rule | N-20 · RQ-366, 367 |
| T-11 | Secrets: Firebase credentials, GitHub token (T-p1-06) | I | A secret leaks through the code, the repo, logs or an error page. | mitigate | Secrets live only in environment variables or files outside the repo, never in code, logs or the browser; the GitHub token is fine-grained: one repo, README contents only, with an expiry date. | constitution rule | N-20 · RQ-364, 366 |
| T-12 | Logs | I | Logs keep passwords, tokens, invitation codes or learners' texts. | mitigate | Never log passwords, tokens, codes or pasted texts; logs kept 30 days. | constitution rule | N-20, N-24 |
| T-13 | Account and owner actions | R | Nobody can tell who signed up with the code, who was locked out, or what the owner changed. | mitigate | A security log of sign-ups (with the invitation used), sign-ins, lockouts, password resets and owner actions: who, when, what (RQ-371). Bank changes are logged in the second build (RQ-159, T-p1-04). | requirement with test | N-18 · RQ-159, 371 |
| T-14 | The owner's computer (T-p1-09) | E | Someone breaks in through grove and reaches the rest of the owner's computer or home network. | mitigate | No open ports at home (only the outgoing tunnel); grove and cloudflared run as their own limited user, touching only grove's folder; system updates; nothing but sign-in reachable without an account (RQ-162). | constitution rule | N-20, N-28 · RQ-125, 162 · R-07 |
| T-15 | Database, data folder and backups | I | The computer or the backup disk is lost or stolen and learners' data is read. | mitigate | Full-disk encryption on the computer and the backup disk; grove's files readable only by grove's user. | constitution rule (process) | N-20 · C-06 · R-06 |
| T-16 | Tunnel (open to anyone with the link) | D | Someone floods grove, or keeps requests open, so reviewers can't use it. | mitigate | Rate limits per address on sign-in and sign-up (RQ-156, RQ-225); request size and time limits; the quick tunnel's own cap of 200 in-flight requests. The rest is accepted (see below). | requirement with test (RQ-225) | N-18 · RQ-125, 160, 225 · R-05 |
| T-17 | Tunnel (Cloudflare's edge) | I | Cloudflare terminates HTTPS and could see passwords and texts in transit. | accept | Cloudflare is named as a processor in the privacy notice (C-04). | — | N-20 · C-04 |
| T-18 | Dependencies | T | A compromised or malicious package in grove's code. | mitigate | Few dependencies, a lockfile, a dependency audit before each build. | constitution rule | N-20 |
| T-19 | Shared bank (second build; T-p1-03, T-p1-04) | T, R | Someone floods the bank with wrong entries; nobody can tell who approved or corrected one. | mitigate | Per-account limits (RQ-158, RQ-230); the dictionary check and review list; every bank change logged (RQ-159, RQ-246). | requirements with tests | N-43 · RQ-95, 158, 159, 230, 246 · R-13 |
| T-20 | Shared library (second build) | I, T | A shared text reveals who shared it, or breaks copyright. | mitigate | Name or anonymous by choice (RQ-139); copyright reports, deletion, suspension and ban (RQ-140…145). | requirements with tests | N-24, N-27 · RQ-134…145 |

**Constitution rules from these mitigations:** (1) every pasted or AI-made text is shown as plain text, with a CSP that forbids inline scripts; (2) every input is parsed strictly against a schema and a size limit; (3) every request is authorised on the server, with a test per endpoint; (4) session cookies are random, HttpOnly, Secure and SameSite, and state-changing requests need a CSRF token; (5) no secrets in code, the repo, logs or the browser, and tokens get the least rights and an expiry date; (6) no passwords, tokens, codes or pasted texts in logs, and logs are kept 30 days; (7) only grove's server talks to outside services, and their tokens are verified; (8) grove runs as its own limited user with no open ports; (9) full-disk encryption on the computer and the backup disk; (10) few dependencies, a lockfile and an audit before each build. C-12 (the page contacts no outside service) stays as it is.

**New requirements (each with a test):** RQ-371 (security log), RQ-372 (the same answer whether or not an email has an account); RQ-223 changed (the owner's account is created by a setup command). All mitigations and accepted threats were agreed on question-pages/50.

## Accepted threats

| ID | Why accepted |
|---|---|
| T-04 | Reviewers are assumed not to pass on the code (question-pages/50); the 5-use limit and the private repo bound the damage. |
| T-16 (in part) | A determined flood through the quick tunnel can't be stopped without paid protection; with a private link and at most 5 reviewers it's unlikely, and the cost is a short outage. |
| T-17 | Cloudflare must see the traffic to pass it on; it's a known processor named in the privacy notice. |
| — | The learner's own AI chat is outside grove; grove only reads the pasted JSON and checks it (T-p1 accepted threat). |
| T-p0-02 | No longer applies: there are no pack files on the device. |
