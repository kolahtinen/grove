# 72: Fixing the findings of test review 2 (2026-10-26)

Asked on 2026-10-26 in Claude Code, after `docs/reviews/2026-10-26-test-review-2.md` (the tests changed in `830050e`..`3875a00`).

## 1. Which findings should be fixed? (default: all)

Why asked: the review found 11 points; two are false passes (1, 2), three are MUST rules with no test (3–5), one is a fragile browser test (6), one is a spec question (7), three are smaller gaps (8–10) and one is only a note (11). The deadline is 2026-11-01.

- **A:** all: new tests for 1–6 and 8–10, a spec decision for 7, 11 only noted (about 1 day)
- **B:** only the serious ones, 1–5 (about half a day)
- **C:** only 1 and 2 (a couple of hours)
- **D:** none for now; go on with the probe-test sizes

**Answer:** A (the default).

## 2. FR-223: when a learner picks another AI or version, does the tactic in use switch to its recommended one? (default: yes)

Why asked: finding 7: the browser test expects the switch; FR-223 doesn't say.

- **A:** yes, switch: FR-223 says picking another AI or product uses its recommended tactic (the page already does this); the test is then exactly right
- **B:** no, keep the learner's choice; only the Recommended mark moves (spec change, `/regenerate client`, the test changes with its rule)

**Answer:** A (the default).
