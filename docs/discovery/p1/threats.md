# Threat model (STRIDE): grove (p1)

Draft from round 4's short pass (2026-10-20), for p1 with accounts, the shared bank and hosting on the owner's computer. Reviewed in round 5 (question-pages/35): all mitigations agreed; T-p1-08 uses the role scheme; T-p1-09 added.

## Components and connections

```
learner / course roles / owner ── browser ──HTTPS── relay ──tunnel── grove on the owner's computer ── database (learner data, shared bank)
                               │                    │
          learner's own AI chat (outside;           ├── open dictionaries and word lists (imported once)
          answers pasted back into grove)           └── optional AI API (owner's key, PR-p1-27)
```

## Trust boundaries

- Browser ↔ server: everything from the browser is untrusted, including pasted AI answers and texts.
- Server ↔ outside AI API: the key stays on the server.
- Imported dictionaries: trusted after import checks.

## Threats

S = spoofing (authenticity) · T = tampering (integrity) · R = repudiation (non-repudiation) · I = information disclosure (confidentiality) · D = denial of service (availability) · E = elevation of privilege (authorization)

| ID | Component or connection | STRIDE | Threat | Handling (redesign / mitigate / accept) | Mitigation | Goes to (constitution rule / requirement with test) | Needs, requirements, risks |
|---|---|---|---|---|---|---|---|
| T-p1-01 | Login | S | Someone guesses a learner's password. | mitigate | Lock for 15 minutes after 5 failed attempts; passwords hashed. | requirement with test | N-p1-17, PR-p1-91 |
| T-p1-02 | Pasted AI answers and texts, shown to others (bank, class material) | T | A paste contains HTML or script that runs in other people's browsers. | mitigate | Treat every paste as untrusted; escape all text when shown. | constitution rule | N-p1-21, PR-p1-71, 95, 105 |
| T-p1-03 | Shared bank | T | Someone floods the bank with wrong entries on purpose. | mitigate | Background check and review list (exist); per-account limits on new entries. | requirement with test | N-p1-22, PR-p1-97, R-p1-10 |
| T-p1-04 | Bank changes | R | Nobody can tell who approved or corrected an entry. | mitigate | Log every bank change: who, when, what. | requirement with test | N-p1-22, PR-p1-101, 104 |
| T-p1-05 | Class progress | I | A teacher sees a student who isn't in their class, or after the student left. | mitigate | Check class membership on every request. | requirement with test | N-p1-20, PR-p1-100, 109 |
| T-p1-06 | Owner's API key | I | The key leaks from code or logs. | mitigate | Key only in an environment variable; never logged or sent to the browser. | constitution rule | PR-p1-27 |
| T-p1-07 | Sign-up and pastes | D | Mass sign-ups or huge pastes fill the free database. | mitigate | Rate limits on sign-up; size limits on pastes. | requirement with test | N-p1-13, PR-p1-99, R-p1-10 |
| T-p1-08 | Roles | E | A learner makes themselves a course creator or co-teacher of someone else's course, or the owner. | mitigate | The role scheme (PR-p1-150…158): one owner fixed in settings; per-course creator, co-teacher, student; only the creator changes roles; every request checked on the server (PR-p1-159). | requirements with tests | N-p1-55, N-p1-57, PR-p1-150…159 |
| T-p1-09 | The owner's computer (PR-p1-127) | E | Someone breaks in through grove and reaches the rest of the owner's computer or home network. | mitigate | No open ports at home (only the outgoing relay tunnel); grove runs as its own limited user or in a container, touching only its own folder; regular updates; nothing attackable is reachable without signing in (PR-p1-166). | constitution rule, and requirement with test (PR-p1-166) | N-p1-53, N-p1-51, PR-p1-127 |

## Accepted threats

| ID | Why accepted |
|---|---|
| — | The learner's own AI chat is outside grove; grove only reads the pasted JSON and checks it. |
