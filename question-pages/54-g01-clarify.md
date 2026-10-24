# 54: G-01 clarify (phase 3)

Asked on 2026-10-24 during `/speckit-clarify` for G-01 (`specs/001-platform-accounts-look/spec.md`), in Claude Code from the phone (explanations in the chat message).

## 1. FR-012 / RQ-372: what happens when someone signs up with an email that already has an account? (default: A)

- **A: "Done, now sign in":** every sign-up ends with the same screen and doesn't sign the person in; a taken address changes nothing (no invitation use spent, no email); its owner uses the password reset. No outside page.
- **B: confirm by email:** every sign-up says "check your email"; new accounts click a Firebase confirmation link. Extra step for reviewers and a second outside page (constitution 4.4 would need a second exception).
- **C: say it's taken:** sign-up says "this address can't be used"; RQ-372 reduced for sign-up only; only holders of the invitation code could probe.

**Answer:** A.

## 2. After a password reset, do that account's existing grove sign-ins end? (default: A)

- **A: yes, within 15 minutes:** grove checks Firebase every 15 minutes; a changed password ends every grove sign-in of that account.
- **B: no:** sign-ins last 30 days or until Sign out, whatever happens to the password.

**Answer:** B. Accepted consequence: a reset doesn't lock out someone who already signed in; their sign-in ends after 30 days, on Sign out, or when the owner deletes the account.
