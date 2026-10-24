# Constitution: __APP__

Project-wide rules Claude must always follow. Each rule is either a **code rule** (checked by a test or tool) or a **process rule** (can't be tested in code; kept by discipline and review).

## 1. Spec as source

1.1 *(process)* The spec is the only source of truth. Generated code is never edited by hand, including while debugging. Every change, however small, goes into the spec first.
1.2 *(process)* Code is regenerated per module with `/regenerate <module>`: the module's code is deleted and rebuilt from its spec and plan.
1.3 *(process)* Tests are written from the spec before the code (one test per acceptance criterion, named by requirement ID) and stay fixed during regeneration; a test changes only when its spec rule changes.
1.4 *(code)* Every spec requirement has at least one test. Checked by: a script that matches requirement IDs in the spec to test names.
1.5 *(process)* Every requirement names the combined requirements (RQ-…) and need IDs (N-…) it comes from.
1.6 *(process)* The session that writes code doesn't review it; a fresh session does.

## 2. Security defaults

2.1 *(code)* No secrets in code or in the repository; secrets come from environment variables or a secret store. Checked by: a secret scanner or Semgrep rule.
2.2 *(code)* Personal and sensitive data is encrypted in transit (HTTPS/TLS only) and at rest. Checked by: configuration tests.
2.3 *(code)* Least privilege: each component, user role and service account gets only the access it needs. Checked by: authorization tests per role.
2.4 *(code)* All input from users and outside systems is validated; database queries are parameterised. Checked by: Semgrep and input-validation tests.
2.5 *(code)* Errors shown to users don't reveal internal details. Checked by: error-handling tests.
2.6 *(code)* Dependencies have no known high-severity vulnerabilities. Checked by: a dependency audit.
2.7 *(code)* Every STRIDE mitigation in `docs/middle/threats.md` that's a requirement has a test.

## 3. Personal data (GDPR)

*Keep this section only if the app holds personal data.*

3.1 *(code)* Personal data is collected only with the user's consent, recorded with its time. Checked by: consent tests.
3.2 *(code)* A user can delete their account and all their data. Checked by: deletion tests that look for leftover data.
3.3 *(code)* A user can export their data in a common format. Checked by: export tests.
3.4 *(process)* Only the personal data the app needs is collected.

## 4. App-specific rules

*Added by `/pre.middle-doc`: the budget, other constraints, and project-wide threat mitigations.*
