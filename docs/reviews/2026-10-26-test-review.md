# Test review: today's regenerations (2026-10-26)

Scope: the tests added or changed by the nine 2026-10-26 rows of `docs/regeneration-log.md` (commits `585cd21`..`e14bff3`, since `65b7b69`). For each test, three questions:

1. **Rule:** does it test exactly its spec rule, as named by its requirement IDs?
2. **False pass:** could it pass while the rule is broken?
3. **Gaps:** what in the rule is left untested?

Read-only review: no code or tests were changed. Each fix below goes through the normal path. A test changes only when its rule changes, so a weak test is strengthened by a new test or by a spec change, not by editing the old one in place.

## Summary

| # | Test | Rule | Verdict |
|---|---|---|---|
| 1 | `tests/web/core.test.mjs` FR-022 FR-018 (refused before body) | FR-022 | Sound. Over-specifies CSRF-before-access; misses a signed-in request refused by CSRF |
| 2 | `tests/texts/exchange.test.mjs` FR-216 (one transaction) | FR-216 | Sound for the case it covers; the meanings prompt and two side tables go unchecked |
| 3 | `tests/store/store.test.mjs` FR-207 (migration 009) | FR-207, data model | Weak: hand-written prompt, no lower-casing, no odd prompts |
| 4 | `tests/texts/fixit.test.mjs` FR-207 (match stored forms) | FR-207 | **Could pass while broken**: nothing checks that a form *not* asked about is ignored |
| 5 | `tests/reading/own.test.mjs` FR-318 FR-207 (Get meanings stores forms) | FR-207 via FR-318 | Storage is checked well; its final assertion checks nothing |
| 6 | `tests/tunnel/tunnel.test.mjs` FR-004 (only the current link) | FR-004 | Good regression test, but it doesn't cover the sentence tightened during the run |
| 7 | `tests/web/config.test.mjs` (3 FR-004 tests) | FR-004, R11 | Sound for `loadConfig`; the callers' roles are untested; one assertion is vacuous |
| 8 | `tests/tunnel/tunnel.test.mjs` FR-004 (env files per unit) | FR-004, R11 | **Could pass while broken**: a second `EnvironmentFile=` line goes unnoticed |
| 9 | `tests/tunnel/tunnel.test.mjs` FR-002 (edited) | FR-002 | Process note: an FR-002 test was edited without an FR-002 change |
| 10 | `tests/demo/content.test.mjs` FR-704 (ground built, no `docs/`) | FR-704 | The `docs/` scan is easy to get around; the build step itself is untested |

Most important: **4** and **8**, where a plausible regression would pass. Next come **1** (the case that matters most for FR-022 is missing) and **6** (the tightened sentence has no test).

---

## 1. FR-022 FR-018: a refused request is answered before its body is read

`tests/web/core.test.mjs`, `partialPost` + test at the FR-022 FR-018 block.

**Rule.** Matches FR-022's new sentence. A raw socket sends the headers and 10 bytes of a 50 KB body, and the test needs an answer *and* a closed socket within 3 s: `partialPost` resolves only on `close`. All three refusals therefore prove "answers and closes the connection", not just the first, whose `connection: close` header is the only one asserted. The test failed on the old code because `readBody` waited for the body.

**Naming.** FR-022's sentence cites FR-018 *and* FR-019; the signed-out case is FR-019's rule and the terms case is FR-011's. The name lists FR-018 only.

**False pass / over-specification.**
- The `noCsrf` case uses a **signed-out** visitor with no CSRF token and expects `403 csrf`. So the test requires CSRF to be checked *before* the access rule. FR-022 only says both are decided before the body. The contract line ("the CSRF check and the access rule come first") doesn't order them either. If the guard ran before CSRF, the spec would still be met, yet the test would fail with `401 signed_out`. The test fixes a detail the spec leaves open.
- The opposite problem: the case where CSRF alone refuses the request is never tested. That is a **signed-in, agreed** learner with a missing or wrong token, whom the access rule lets through. An implementation doing `guard → body → csrf` reads that learner's body before refusing it, which breaks FR-022. Today it would fail this test, but only by accident: the `noCsrf` case gets `401` instead of the expected `403`. Once the ordering assertion is relaxed, nothing would catch it.

**Gaps.**
- A signed-in, agreed learner with a bad CSRF token, on a partial body: expect `403 csrf` and a closed connection.
- A role refusal (a learner on an owner-only route) on a partial body. It's the same `guard.check` path, so this is low priority.
- An unknown route with a body (`404`): the code closes the connection (`bodyRead` is false in `catch`), but nothing tests it. Whether a 404 counts as "refused" under FR-022 is a spec question.

## 2. FR-216: a crash while marking the prompt answered leaves nothing stored

`tests/texts/exchange.test.mjs`.

**Rule.** Good. A temporary trigger aborts the `status = 'accepted'` update. That update comes after `acceptAnswer`, so on the old two-transaction code the texts stayed stored (the log confirms 3 did). The test then checks that nothing was kept, the prompt is still `waiting`, and pasting again stores the texts once with `parts_accepted = 1`. A SQL abort inside the transaction stands in for a crash. That's a fair stand-in, because SQLite gives a rolled-back transaction and a killed process the same atomicity.

**False pass.** FR-216 now names four things that must be atomic: the stored answer, the prompt marked answered *with its hash*, the package count, and *the meanings prompt it makes*. The test injects the failure at one point only, and it checks only some of what the transaction writes:
- **Meanings prompt:** before the regeneration, the meanings exchange was inserted outside the transaction. An implementation that left it outside again would pass this test. Nothing fails *after* the status update, and `good-in-prose.txt` lists its meanings, so it may make no meanings prompt at all.
- **Learned inflections:** the fixture has an `inflections` list, and `acceptAnswer` writes those to `word_forms`. After the crash the test counts `texts`, `sentences` and leaf `words`, but not `word_forms`. A learned form that survived the rollback would not be noticed.
- **`answer_hash`:** not asserted after the successful second paste. The hash is what makes the existing FR-205 duplicate check work, so FR-216's "never stored twice" depends on it.
- `learner_settings` (`firm_new`, `topics_used`) and the `replaced` update are inside the transaction but unchecked. They aren't named in FR-216, so this is minor.

**Gaps.**
- A crash *after* the status update, at the meanings-prompt insert, using an answer with unlisted new words (`unlisted-new.json`): nothing stored, and no meanings exchange.
- After the crash, a `word_forms` count for the account; after the retry, `answer_hash` is set.

## 3. FR-207: migration 009 adds asked_forms and fills it from existing prompts

`tests/store/store.test.mjs`.

**Rule.** It tests the data-model line: the column is added, an existing meanings exchange is filled from its prompt, the prompt is unchanged, and a part exchange stays `NULL`.

**False pass.**
- The prompt is **hand-written** (`'Intro line:\n\ntolv, pensionär, paraply\n\nFor each word…'`), not made by `buildMeaningsPrompt` (`server/texts/fixit.mjs:17`). It matches today's layout of four paragraphs with the list second. If the real layout differed, the migration would fill the column wrongly and this test would still pass. Using the real builder (or a prompt copied from a real exchange) ties the test to what's in the database.
- The words are already lower case, so the migration's `lower(...)` is never exercised, though the data model says "lower-case forms". Without `lower`, the migration would still pass.

**Gaps.**
- A meanings prompt with no blank line: the `WHERE` skips it and it stays `NULL`. Untested.
- A prompt whose list is the **last** paragraph: the inner `instr` returns 0, `substr(…, 1, -1)` gives `''`, and the column becomes `[""]`. No current prompt has this shape, but nothing checks it.
- An already-answered meanings exchange. It is also filled, which is harmless; the test has only a waiting one.

## 4. FR-207: a meanings answer is matched against the stored forms, not the prompt's wording

`tests/texts/fixit.test.mjs`.

**Rule.** Half of it. After an accepted answer, the test checks that `asked_forms` holds the three unlisted words, then **rewords** the stored prompt and answers one word. The answer still fills (`filled 1`, `missing = asked.length − 1`). On the old code, the reworded prompt made `prompt.split('\n\n')[1]` undefined, which threw, so the test did fail before. It proves the prompt's wording isn't *needed*.

**False pass: yes.** The rule's other half is "its answer is matched against those stored forms", and that is never tested. An implementation that **ignored `asked_forms`** and filled any of the account's leaves without a meaning would pass every assertion: `tolv` is a leaf without a meaning, so it's filled. `missing` would come out right too, because it is computed from `asked`. The earlier FR-207 test's `okänd` check doesn't cover this, because `okänd` is not a leaf at all.

**Gaps.**
- A negative case: a leaf without a meaning that is **not** in `asked_forms` is in the answer (for example, saved after the prompt was made, or a stored list with the form removed). It must stay without a meaning, and `filled` must not count it.
- `asked.includes(w)` checks only that the three words are present, not that the list is exact. A list holding every leaf would pass. The store and reading tests use `deepEqual`; this one could too.
- Case: the answer's `form` is lower-cased before matching (`m.form.toLowerCase()`). An answer with `"Tolv"` is untested. FR-207 doesn't state this, so it may be outside the rule.

## 5. FR-318 FR-207: Get meanings stores the forms it asks about

`tests/reading/own.test.mjs`.

**Rule.** The storage half is tested well. A leaf saved as `Semla` gives `asked_forms` equal to `['semla']`, an exact list, so lower-casing is checked. It failed before because the reading module didn't write the column.

**False pass.** The last assertion, `filled.body.result === 'meanings_added'`, checks nothing. `answerMeanings` returns `meanings_added` even when it fills **0** words (`server/texts/packages.mjs`, the `return` of `answerMeanings`). If the stored forms didn't match the answer, this line would still pass.

**Gaps.**
- Assert `filled === 1`, or check that the `semla` leaf's `en` is now `'cream bun'`.
- Rewording isn't tested for the FR-318 prompt. Both prompts share `answerMeanings`, so test 4 covers it once test 4 has its negative case.

## 6. FR-004: when the address changes while GitHub is failing, the older link is never written

`tests/tunnel/tunnel.test.mjs`.

**Rule.** A good regression test for finding 7. GitHub fails every request, the address changes during the retries, then GitHub recovers. No write may contain the older link, and the README must end with the newer one. With the old code's two loops, the older link was always written at least once, and the log confirms the test failed. The extra 100 ms wait after both promises settle also catches a stray late write. That matters, because the spec says "never sent", not just "not last".

**False pass: for the sentence tightened during the run.** The log says FR-004 was tightened because "an attempt that had already read the README could still send the older link". The fix reads the link inside `content()`, after the GET, and re-checks it after the PUT (`if (getSetting('tunnel_url') !== link) continue;`). The fake fails GETs and PUTs alike, so in this test the address always changes while the loop is **sleeping**, never between the GET and the PUT. So the test would still pass if:
- the link were read once at the top of each attempt, before the GET (the race the run found), or
- the re-check and `continue` were removed. Then a newer address that arrives while the PUT is in flight is never written: the loop returns and the README keeps the older link, breaking "the README always ends with the newest link".

**Gaps.**
- A fake that holds the GET (or the PUT) open until the test changes the address. Then check that the PUT sends the newer link (GET held), or that a second write follows with the newer link (PUT held).
- "One update loop at a time" is in the log and the code comment but not in FR-004's text, so it's not a rule gap. If it is meant as a rule, the GET count during the failing window would show it.

## 7. FR-004: the web and tunnel configs keep only their own settings; a config must name its role

`tests/web/config.test.mjs` (new; 3 tests).

**Rule.** Matches R11's `loadConfig(env, { role })`. Each role loads without the other's settings, drops them when they are present, and refuses when one of its own is missing. A missing role throws. Every test failed before.

**False pass.**
- `assert.ok(!JSON.stringify(given).includes('gh-token-secret'))` checks nothing. `makeConfig` always makes `token` non-enumerable, so the token never appears in JSON, whether it's kept or not. The real check is the line before it (`!given.github?.token`), so nothing is missed today. But the JSON line reads as extra protection when it isn't.
- **The callers' roles are untested.** The rule is met only if `server/main.mjs` and `server/owner/cli.mjs` pass `web` and `tunnel/supervisor.mjs` passes `tunnel`. The harness builds its config with `makeConfig`, so no test goes through those three calls. If the supervisor passed `role: 'web'`, every test would pass, and the tunnel would hold Firebase settings (or fail to start in production).

**Gaps.**
- The callers' roles. One option is a small test that runs each entry point's config step with a fake environment; another is a source check like the FR-704 `docs/` scan.
- The tunnel config keeping no `firebase.projectId`, and the web config keeping no `github.repo`. These aren't secrets, but "keeps only its role's settings" covers them. Low priority.
- An unknown role (`'owner'`) throwing. `Object.hasOwn(NEEDED, role)` handles it, but nothing tests it.

## 8. FR-004: each service loads its own environment file and cannot open the other's secrets

`tests/tunnel/tunnel.test.mjs`.

**Rule.** Matches the FR-004 sentence and R11. It checks each unit's `EnvironmentFile`, that `InaccessiblePaths` lists the other's file (and, for the tunnel, `service-account.json`), the two example files, and SETUP.md.

**False pass: yes.**
- `assert.match(web, /^EnvironmentFile=\/etc\/grove\/web\.env$/m)` only asks that *some* line names `web.env`. A unit with a second `EnvironmentFile=/etc/grove/tunnel.env` line would pass. systemd reads every `EnvironmentFile=` as root before the sandbox starts, so `InaccessiblePaths` wouldn't stop it, and the web server would hold the GitHub token. The tunnel unit has the same gap. The check should be that each unit has exactly one `EnvironmentFile=` line (also counting the `-/path` form).
- `blocked()` reads only the first `InaccessiblePaths=` line. A second line could only cause a false *failure*, not a false pass.

**Gaps.**
- Whether `InaccessiblePaths` actually works can't be shown by a unit test that reads text files. It needs systemd (`systemd-analyze verify`, or a check in SETUP.md that `sudo -u grove systemd-run -p InaccessiblePaths=… cat …` fails). This is worth a line in the owner checklist rather than a unit test.
- The web unit must still be able to read `service-account.json` (it is not in the web unit's `InaccessiblePaths`). This isn't checked, but a mistake there would break sign-in loudly.
- No positive check that `tunnel.env.example` has `GITHUB_TOKEN` or that `web.env.example` has the Firebase keys. A mistake there would show up at setup. Low priority.

## 9. FR-002: the service units test (edited)

`tests/tunnel/tunnel.test.mjs`. The `EnvironmentFile=/etc/grove/grove.env` assertion was removed.

**Process note.** CLAUDE.md says "a test changes only when its spec rule changes". FR-002 didn't change today, but its test did. The log explains why: the env-file path now belongs to FR-004's new sentence and is checked there (test 8). That's reasonable, because the assertion was never really about FR-002 (start on boot, restart, survive a power cut). But it is an edit to a fixed test without its rule changing. Either accept it as a one-time move of an assertion to the rule it belongs to and record it as such, or add a line to the rules that covers moving an assertion to another rule's test.

**Decided 2026-10-26 (question-pages/67):** accepted as a one-off; the exception is noted in the regeneration-log row.

## 10. FR-704: the demo ground is built into server/demo/, and nothing grove runs reads docs/

`tests/demo/content.test.mjs`.

**Rule.** It covers both halves of the new sentence. The committed `server/demo/demo-ground.txt` equals the X-03 known words minus the three practised words, `DEMO_GROUND` equals that file, and no `.mjs` under `server/` or `tunnel/` contains a `docs/` path. If `known.txt` changes, the test fails until the build is run again, which is the right behaviour.

**False pass.**
- The scan looks for `docs/` right after a quote or slash (`/['"\`/]docs\//`). A path built as `join(root, 'docs', 'middle', …)`, which is the style the old `apply.mjs` used for `root`, contains `'docs'` followed by a quote, not a slash, so it isn't matched. A regression written that way would pass. Matching `['"\`]docs['"\`/]` would catch both forms.
- Only `.mjs` files are scanned. A `.js`, `.cjs` or `.json` file that names a `docs/` path isn't. Low risk in this codebase.

**Gaps.**
- "Built … by `scripts/build-demo.mjs`" is checked only through the committed output. If the script's write step broke, the committed file would stay correct and the test would pass until the next real rebuild. Running the build into a temporary folder and comparing would close this. It means changing the script's output path into a parameter, which is a spec/plan decision.
- The test hard-codes `['glömma', 'granne', 'biljett']`, though `scripts/build-demo.mjs` exports `PRACTISING`. If the practised words ever change, the test has to change too. That fits "a test changes only when its rule changes" only if the practised words are part of FR-704's rule. FR-704 implies them ("six are drilled") but doesn't name them.

---

## Side observations (code, not tests)

The asked forms are now built in three places with three slightly different rules:
- `server/texts/packages.mjs` `askedForms`: `trim().toLowerCase()`
- `server/reading/own.mjs` `meaningsPrompt`: `toLowerCase()`, no trim
- `server/store/migrations/009-asked-forms.sql`: `lower()`, split on `', '`

Today's inputs make them agree. If FR-207 needs one rule ("lower-case forms, trimmed"), naming it in the data model would let one test cover all three.

## Status (2026-10-26, after question-pages/68)

- **Done:** new tests for findings 2, 3, 4, 5, 6, 7, 8 and the `docs/` scan of 10 (`e3389bb`); each was checked in a scratch copy to fail on the broken variant it targets. Finding 1: FR-022 names the order (`3e03d10`), new test, regen(web) (`86efa2c`). Finding 9: accepted as a one-off (question-pages/67).
- **On hold:** the asked-words rule (question-pages/68, question 3) and the demo build test (finding 10, question 2). Another session is rewriting `specs/002-texts-from-own-ai` (addendum 002: no separate meanings prompt, FR-222), and `/regenerate` needs a committed tree.
