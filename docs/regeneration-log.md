# Regeneration log

One entry per `/regenerate` run.

| Date | Module | Spec change | Tests changed | Tests run | Passed | Failed | Outcome |
|---|---|---|---|---|---|---|---|
| 2026-10-24 | client | specs/001-platform-accounts-look FR-030: the top bar shows the tagline 'grow from what you know' (RQ-309, question-pages/56) | `tests/e2e/look.spec.mjs` FR-030 test also checks the tagline (changed with its spec rule, before the regeneration) | client: `npx playwright test` (26); dependent web: `node --test "tests/web/*.test.mjs"` (15) | 41 | 0 | rebuilt `public/` and `scripts/copy-fonts.mjs`; module list confirmed and web recorded as depending on client |
| 2026-10-25 | firebase | specs/001-platform-accounts-look FR-017: deleting a Firebase user that no longer exists counts as done (first-build review finding 1; question-pages/63) | `tests/firebase/firebase.test.mjs` new FR-017 test; `tests/fakes/fake-firebase.mjs` answers USER_NOT_FOUND for an unknown user, like the real API (both before the regeneration) | firebase (9); dependents accounts (25), owner (10) | 44 | 0 | rebuilt `server/firebase/` |
