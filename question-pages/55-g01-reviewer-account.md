# 55: G-01 reviewer accounts (phase 3)

Asked on 2026-10-24 after `/speckit-analyze` for G-01, in Claude Code from the phone (explanations in the chat message). The question came from the owner: "can we just make an account for the reviewers? would that simplify".

## 1. How do reviewers get accounts in the first build? (default: B)

- **A: keep sign-up + code:** sign-up page, reviewer code in the README, 5 uses. No requirement or constitution change.
- **B: owner adds each one:** a command makes each reviewer's account; they set the password via "forgot password"; terms agreed at first sign-in. About 10 tasks fewer; changes RQ-218, 222, 160, 225, 368 and constitution 3.1.
- **C: one shared account:** one sign-in in the README for all reviewers. Fewest tasks, but reviewers share and overwrite one grove.

**Answer:** C. No sign-up page in the first build. The owner creates the owner account and one shared reviewer account by command; the README holds the reviewer account's email and password. Changed for the first build: RQ-217 (accounts only by owner command), RQ-360 (the reviewer account is marked as such when created, instead of an invitation), RQ-368 (README holds the reviewer sign-in, not a code); not in the first build: RQ-218, RQ-222, RQ-160, RQ-225 (no sign-up). Clarification 1 of page 54 (sign-up with a taken address) no longer applies.

## 2. With one shared reviewer account, how are the terms and the 13+ confirmation agreed? (default: A)

- **A: per device, in grove:** each new sign-in shows the terms with both boxes first; agreement recorded with time for that sign-in; nothing else opens until ticked.
- **B: owner agrees, README says so:** no step in grove.

**Answer:** A. Constitution 3.1 amended (v1.1.0): agreement and age confirmation are recorded per sign-in before the account can be used, instead of at sign-up. RQ-141 and RQ-228 now apply at sign-in.

## 3. RQ-363 on a shared reviewer account: "Set my starting level again" would wipe the demo for everyone. What then? (default: A)

- **A: keep + owner restore:** button stays; an owner command restores the demo learner.
- **B: hide the button:** the reviewer account can't replace the demo; no starting-level try there.
- **C: decide in G-07.**

**Answer:** B. For G-07: RQ-363 changes to "the reviewer account lands on Home as the demo learner and has no 'Set my starting level again'".

## 4. If the shared reviewer password leaks, how do you throw out people already signed in? (default: A)

- **A: owner command:** ends every sign-in of one account.
- **B: nothing extra:** sign-ins last up to 30 days unless the account is deleted.

**Answer:** B. Accepted: after a leak, sign-ins already made last up to 30 days (or until the owner deletes and re-creates the reviewer account).

Also accepted as consequences of answer 1 (not asked separately): reviewers using the account at the same time see and change the same data (last save wins, nothing corrupted); anyone with the link and the reviewer email can lock the shared account for 15 minutes with 5 wrong passwords (RQ-156), locking out all reviewers.
