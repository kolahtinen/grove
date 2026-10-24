# Constitution: grove

**Draft** (`/pre.middle-doc`, 2026-10-23), from `docs/templates/base-constitution.md`. Goes into `/speckit.constitution` once confirmed.

Project-wide rules Claude must always follow. Each rule is either a **code rule** (checked by a test or tool) or a **process rule** (can't be tested in code; kept by discipline and review). Sources in brackets: constraints (C-…), threats (T-…), quality attributes (Q-…), risks (R-…).

## 1. Spec as source

1.1 *(process)* The spec is the only source of truth. Generated code is never edited by hand, including while debugging. Every change, however small, goes into the spec first.
1.2 *(process)* Code is regenerated per module with `/regenerate <module>`: the module's code is deleted and rebuilt from its spec and plan.
1.3 *(process)* Tests are written from the spec before the code (one test per acceptance criterion, named by requirement ID) and stay fixed during regeneration; a test changes only when its spec rule changes.
1.4 *(code)* Every spec requirement has at least one test. Checked by: a script that matches requirement IDs in the spec to test names.
1.5 *(process)* Every requirement names the combined requirements (RQ-…) and need IDs (N-…) it comes from.
1.6 *(process)* The session that writes code doesn't review it; a fresh session does.
1.7 *(process)* `prototypes/` is read-only and nothing is copied from it into the build.
1.8 *(process)* Whenever a plan adds or changes modules, test commands or dependencies, `docs/modules.md` is updated.

## 2. Security defaults

2.1 *(code)* No secrets in code or in the repository; secrets come from environment variables or files outside the repo, never reach the browser or the logs. Checked by: a secret scanner over the repo and a test that error pages and logs contain no secret. (T-11)
2.2 *(code)* Personal data is encrypted in transit: the browser reaches grove only over HTTPS through the tunnel, grove listens only on localhost, and grove talks to Firebase only over HTTPS. At rest: see 4.11. Checked by: a configuration test that the server binds to 127.0.0.1 only. (T-14, T-17)
2.3 *(code)* Least privilege: each role (signed-out visitor, learner, reviewer, owner) gets only the access it needs, checked on the server for every request. Checked by: authorisation tests for every endpoint and every role, including a test that another learner's IDs are refused. (T-08, T-09, Q-01)
2.4 *(code)* All input from browsers and outside systems (form fields, cookies, pasted AI answers, Firebase answers) is parsed strictly against a schema and a size limit before use; unknown fields are rejected; database queries are parameterised. Checked by: schema and size tests per endpoint; Semgrep. (T-07)
2.5 *(code)* Errors shown to users don't reveal internal details, and a bad request never crashes the server. Checked by: error-handling tests with malformed and oversized input. (T-07)
2.6 *(code)* Few dependencies, a lockfile, and no known high-severity vulnerabilities: a dependency audit before each build. Checked by: the audit in the test command. (T-18)
2.7 *(code)* Every STRIDE mitigation in `docs/middle/threats.md` that's a requirement has a test.

## 3. Personal data (GDPR)

Grove holds personal data: email addresses, hashed passwords (in Firebase), learning history and pasted texts (C-04).

3.1 *(code)* Sign-up records the learner's agreement to the terms and privacy notice, with its time, and their confirmation that they are 13 or over; without both, no account is made. Checked by: sign-up tests. (C-04, X-p1-03, RQ-228)
3.2 *(code)* The owner can delete a learner's account and all their data with one command (on request, RQ-229; no button yet). Checked by: a deletion test that looks for leftover data, including in Firebase.
3.3 *(code)* The owner can export a learner's data in JSON with one command (on request, RQ-229). Checked by: an export test.
3.4 *(process)* Only the personal data grove needs is collected; each kind has a stated purpose in the privacy notice.
3.5 *(process)* The privacy notice names Firebase (Google) and Cloudflare as processors, and says that what learners paste into their own AI is governed by that AI's terms. (C-04, T-17)
3.6 *(code)* Logs never hold passwords, tokens, invitation codes or pasted texts, and are deleted after 30 days. Checked by: a log test that runs a sign-up, sign-in and paste and scans the log. (T-12)

## 4. App-specific rules

### Budget, time and scope

4.1 *(process)* **Zero budget:** nothing that costs money to run: no paid AI API, hosting, domain or service beyond the owner's existing Claude Pro. Any paid step needs the owner's decision and an addendum. (C-01, C-13)
4.2 *(code)* Grove never calls an AI service itself: all AI work goes through the learner's own chat by copy-paste. Checked by: the outbound-host test of 4.5 (only Firebase is allowed from the server). (C-01, C-08)
4.3 *(process)* The first build is the first-build scope in `docs/middle/scope.md`, built goal by goal in the order of the middle-steps document; when time runs short, shoulds are cut before musts, and nothing outside the scope is added. (C-02, C-10, R-02)

### Third parties and the browser

4.4 *(code)* The page contacts no host but grove's own: no outside fonts, scripts, analytics or images; fonts are served by grove. The one exception is Firebase's password-reset page reached from the reset email. Checked by: a browser test that records every request on every page. (C-12, Q-02)
4.5 *(code)* Only grove's server talks to outside services, and only to Firebase Authentication; Firebase ID tokens are verified (signature, project, expiry) before they're trusted. Checked by: a test with forged, expired and other-project tokens; an outbound-host allowlist test. (T-10, RQ-367)
4.6 *(code)* Every text from an AI, a paste or the demo content is shown as plain text, never as HTML; a Content-Security-Policy forbids inline scripts and outside sources. Checked by: a test that pastes HTML and script and finds them shown as text; a header test for the CSP. (T-06)

### Sessions and accounts

4.7 *(code)* Grove's session cookie is random, HttpOnly, Secure and SameSite=Lax; every state-changing request needs a CSRF token; sign-out ends the session on the server. Checked by: cookie-attribute and CSRF tests. (T-02)
4.8 *(code)* Tokens get the least rights and an expiry date: the GitHub token is fine-grained to one repo's README contents. Checked by: process review of the token's settings, and a test that the README updater touches only the README. (T-11)

### The owner's computer and the data

4.9 *(process)* Grove and cloudflared run as their own limited user, touching only grove's folder; no ports are open at home (only the outgoing tunnel); system updates are applied. (T-14, C-06)
4.10 *(process)* Grove and the tunnel start on boot; the computer doesn't sleep; the README updater posts the new link after every tunnel restart. (R-05, Q-06, RQ-364)
4.11 *(process)* Full-disk encryption on the computer and the backup disk. (T-15)
4.12 *(code)* Hourly backups to the second disk; a restore is tried once by hand before reviewers are invited. Checked by: a test that a backup file is made and can be read back. (C-06, Q-03, R-06)
4.13 *(code)* Every change to the data format comes with a migration that keeps every learner's data. Checked by: a migration test on a copy of real data. (Q-03, R-06)

### Content, licences and copyright

4.14 *(code)* Imported word data (the Kelly list) keeps its source and licence, and a credits page names every source. Checked by: an import test for the licence field and a test that the credits page lists each source. (C-05, R-14)
4.15 *(process)* Code libraries and fonts are used only under licences that allow it (e.g. Zen Kaku Gothic New under the SIL Open Font Licence); checked when a dependency is added. (C-05)
4.16 *(process)* Texts a learner pastes from elsewhere stay private to them (sharing comes in the second build, only when confirmed). (C-07)
