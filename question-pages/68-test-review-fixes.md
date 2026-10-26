# 68: Fixing the test-review findings (test review 2026-10-26)

Asked on 2026-10-26 in Claude Code, after `docs/reviews/2026-10-26-test-review.md` and question-pages/67. The owner chose to fix all findings ("all"). Settled without asking: an unknown route with a body (`404`) is not a refused request under FR-022 and gets no test (default); migration 009 is tested with the real meanings-prompt layout and an upper-case word only, since grove isn't deployed and the prompt's layout hasn't changed since it was built (default).

## 1. FR-022: must the CSRF check come before the access rule? (default: yes, write it into FR-022)

Why asked: finding 1: the FR-022 FR-018 test demands CSRF first; the spec only says both come before the body.

- **A:** yes, CSRF first: FR-022 names the order; a new test for a signed-in learner with a bad token, whose body is never read
- **B:** no, either order; the test stays stricter than its rule

**Answer:** A (the default), after the owner asked what CSRF is (explained: a token proving the request came from grove's own page, so another website can't act in the learner's name).

## 2. FR-704: should a test run the demo build itself? (default: yes, the build takes an output folder)

Why asked: finding 10: the test checks only the committed `server/demo/demo-ground.txt`, not that `scripts/build-demo.mjs` writes it.

- **A:** yes: the plan lets the build write into a named folder (default `server/demo/`); a test builds into a temporary folder and compares; `/regenerate demo`
- **B:** no, leave it

**Answer:** A (the default).

## 3. FR-207: should the data model name one rule for how the asked words are stored? (default: yes: trimmed, lower case, no repeats)

Why asked: side observation of the review: the asked forms are built in three places with slightly different rules.

- **A:** yes: the data model says trimmed, lower case, no repeats; texts and reading use one helper; a test checks it; migration 009 stays as is
- **B:** no, leave it

**Answer:** A (the default).
