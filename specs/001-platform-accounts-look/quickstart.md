# Quickstart: validating G-01

How to prove G-01 works, from tests to a real phone. Interfaces: [http-api](contracts/http-api.md), [owner-cli](contracts/owner-cli.md); data: [data-model](data-model.md).

## Prerequisites

- Node.js 22.14+ and npm.
- Checks: `gitleaks` and `semgrep` installed (free).
- Browser tests: `npx playwright install chromium` once.
- For the real deployment only: `cloudflared`, a Firebase project (Email/Password on, email enumeration protection on, service account key), a fine-grained GitHub token for the private repo's README, a second disk for backups.

## 1. Automated tests (no Firebase account needed)

```sh
npm ci
npm test          # node:test suites against a fake Firebase
npm run test:e2e  # Playwright: requests, redirects, the look
npm run check     # npm audit, gitleaks, semgrep, FR→test trace check
```

Expected: all pass; `check-trace` lists FR-001…031 each with at least one test.

## 2. Local run with the fake Firebase

```sh
npm run dev       # grove on 127.0.0.1:8787 with the fake Firebase and a temp data folder
npm run owner:setup -- --email owner@example.test
npm run invite:set -- --label reviewers --uses 5 --reviewer
```

Then in a browser at `http://localhost:8787`:

| Step | Expected |
|---|---|
| Open `/` signed out | sent to `/signin` |
| Sign up with the printed code, a valid password, both boxes ticked | "Done, now sign in"; `invite:list` shows 1/5 |
| Sign up again with the same email | the same "Done, now sign in"; still 1/5 |
| Sign in | home page with your email and Sign out in the header |
| 5 wrong passwords, then the right one | the right one is refused for 15 minutes; `log:show` lists the lockout |
| Device in dark, then light mode | Night forest, then Pale birch |

## 3. Real deployment on the owner's computer

1. Create user `grove`, put grove in its folder, secrets in `/etc/grove/` (research R11).
2. Install and enable `grove.service` and `grove-tunnel.service`; turn off sleep.
3. `owner:setup`, then `invite:set --label reviewers --uses 5 --reviewer`.
4. Check the README shows the link and the code; open the link on a phone over mobile data and sign up (SC-001: under 2 minutes).
5. Restart the tunnel service; time the README update (SC-004: under 2 minutes).
6. Reboot the computer; grove comes back with the test account (SC-005).
7. Wait for an hourly backup; restore it once by hand with `backup:restore` on a copy (SC-005).
8. `learner:export` and `learner:delete` the test reviewer; check Firebase's console shows no user left.
