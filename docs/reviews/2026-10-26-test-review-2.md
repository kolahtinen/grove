# Test review 2: the tests changed since the first test review (2026-10-26)

Scope: the tests added or changed in commits `830050e`..`3875a00`, since `b299bf5` (the first test review's status update): addendum 002 (setup, reading/listening, a meaning for every word, own-text AI round), FR-205 (escaped copies), FR-223/FR-224 (tactics, Beta) and FR-032 (start-up loads). 42 test files. For each test, three questions:

1. **Rule:** does it test exactly its spec rule, as named by its requirement IDs?
2. **False pass:** could it pass while the rule is broken?
3. **Gaps:** what in the rule is left untested?

Read-only review: no code or tests were changed. A test changes only when its rule changes, so a weak test is strengthened by a new test or by a spec change, not by editing the old one in place.

## Summary

| # | Test or rule | Verdict |
|---|---|---|
| 1 | `tests/texts/fixit.test.mjs` FR-207 RQ-397 (meanings fix-it) | **Could pass while broken**: an answer for a word not asked about could overwrite that word's meaning. The first review's finding 4 test was removed with the meanings prompt, and its replacement checks less |
| 2 | FR-202: sizes come from the environment | **Could pass while broken**: nothing checks that the settings reach the prompts |
| 3 | `tests/texts/fixit.test.mjs` FR-206 RQ-395 (two failed answers in a row) | "In a row" is untested; one of its assertions checks nothing |
| 4 | FR-203: grove suggests **I'm in a new chat** | No test (`newChatSuggested`) |
| 5 | FR-205: a text of the wrong kind, or more texts than asked for | No test |
| 6 | `tests/e2e/texts.spec.mjs` FR-224 (Beta badge) | Depends on the earlier tests in its file; it fails when run alone |
| 7 | `tests/e2e/texts.spec.mjs` FR-223 (menus and tabs) | Over-specified: picking another AI changes the tactic in use, which FR-223 doesn't say |
| 8 | FR-223, RQ-405: what's left untested | The first Get texts asks for the AI; the whole package waits for the next package; the offer "step by step from the others" |
| 9 | FR-602: the credits name Wiktionary | Rule changed, no test |
| 10 | FR-032: what's left untested | `/fonts/*` while starting; the body never read (only `Connection: close` is checked); the hourly job waits for ready; SC-008's 0.5 s |
| 11 | Edits to tests of unchanged rules | Acceptable: each follows a changed rule; one note on FR-310 and one on FR-412 |

Most important: **1** and **2**, where a plausible regression would pass. Next come **3** to **5** (MUST sentences with no test, or one that checks less than its name says) and **6** (a fragile test).

Sound, with nothing to add: the migration 010 and 011 tests, `tests/lexicon/*` (the stepped load really builds new maps, so its "same meanings" check is real), `tests/levels/steps.test.mjs`, `tests/web/startup.test.mjs` for the gate and progress, the whole-package and one-long-prompt tests in `package.test.mjs`, `plans.test.mjs`, the own-text round in `tests/reading/own.test.mjs` and `reading.spec.mjs`, the escaped-copy tests in `extract.test.mjs`, the FR-509 listening test, the demo meaning tests, and `tests/words/asked.test.mjs`.

---

## 1. FR-207: a meanings fix-it answer for a word not asked about is ignored

`tests/texts/fixit.test.mjs`, "a new word in neither the answer nor the word list holds its text back …".

**Rule.** FR-207: "its answer is matched against those stored forms, never against the prompt's wording", and the edge case: "A fix-it answer for meanings … lists a word grove didn't ask about: ignored."

**False pass.** The answer has an extra entry `{form: 'banan', lemma: 'okänd', en: 'not asked'}`, and the test checks only that no word with lemma `okänd` was created. `banan` is in the learner's ground (`docs/middle/ai-test/known.txt`). An implementation that applies every entry whose form matches an existing word would overwrite `banan`'s meaning with "not asked", and this test would still pass.

**History.** This is the first review's finding 4 again. `e3389bb` added a test for exactly this ("a meanings prompt stores exactly the new words it asks about, and its answer fills only those"). Addendum 002 removed the meanings prompt and rewrote that test, so the guard is gone for the meanings fix-it. The meaning-check test does keep a guard (`kaffe`'s meaning is checked as unchanged), which is the stronger form.

**Fix.** A new FR-207 test: a meanings fix-it answer that names a ground or leaf word not asked about leaves that word's `en`, `explain_sv` and `en_source` unchanged.

## 2. FR-202: the sizes are read from the environment, and used

`tests/web/config.test.mjs` "the prompt sizes come from the environment …" checks `loadConfig` only.

**False pass.** `server/texts/routes.mjs` and `server/reading/routes.mjs` default `sizes` to `DEFAULT_SIZES`. If `server/web/app.mjs` stopped passing `config.sizes`, every test would still pass, because all of them run with the defaults. FR-202 says the sizes "MUST be settings read from grove's environment, so they can be tuned without a spec change", which is exactly what the probe test needs.

**Fix.** A new FR-202 test: a test grove started with, say, `GROVE_PART_READING=1` and `GROVE_TEXT_WORDS=70` gives a request asking for "1 reading text and 1 listening text, about 70 words"; and one with a small `GROVE_OWN_PIECE_CHARS` splits an own text into more pieces. The harness would have to pass the settings through.

## 3. FR-206: one text per request after two failed answers *in a row*

`tests/texts/fixit.test.mjs` "after two answers in a row with a failed text …".

**Rule.** Covered well: after the second failed answer, `one_text` is set, the next part asks for "1 reading text", and a new package starts at the normal size.

**Gaps.**
- "In a row" is never tested: a failed answer, then a good one, then a failed one should *not* switch to one text. An implementation that counts every failed answer in the package would pass.
- `assert.match(redo.prompt, /one new reading text/)` checks nothing about `one_text`: a redo always asks for one text.

## 4. FR-203: grove suggests "I'm in a new chat"

**Rule.** FR-203: "grove suggests it when an answer can't be read or a text is more than 10 percentage points below the target share". The contract has `newChatSuggested` on `/api/answer` and in `waiting`.

**Gap.** No test reads `newChatSuggested`. `texts.spec.mjs` checks `#new-chat-note` ("Open a new chat"), but that note belongs to the start of a package, not to this suggestion. Neither trigger, nor its absence on a good answer, is tested.

## 5. FR-205: texts of the wrong kind, or more texts than asked for

**Rule.** FR-205's new sentence: "Texts of the wrong kind or more texts than asked for count as format problems."

**Gap.** `schema.test.mjs` checks that `kind` must be `reading` or `listening`, and the 4/12 limits. Nothing checks the answer against what the request asked for: e.g. 3 reading texts when 2 reading and 1 listening were asked, or 4 texts for a part of 3. An implementation that stores them all would pass.

## 6. FR-224: the Beta badge in the browser depends on test order

`tests/e2e/texts.spec.mjs` "texts from the AI and own texts carry a Beta badge …".

**Problem.** It opens the first `#texts a` with "reading ·" and expects a Beta badge. Playwright's server starts fresh with the reviewer account's demo, whose four texts carry **no** badge (FR-224, tested in `tests/demo/history.test.mjs`). The test only passes because the earlier tests in the file added AI texts, which are newer and so listed first. Run alone (`--grep FR-224`) or in another order, it opens a demo text and fails. It also doesn't check the other half of the rule on the page: a demo text has no badge.

**Fix.** A new test that adds its own AI text first (as `addSample` does elsewhere) and checks one demo text without a badge. The old test then stays as it is until FR-224 changes; the review can only flag that it's fragile.

## 7. FR-223: the menus pin a detail the spec leaves open

`tests/e2e/texts.spec.mjs` "the AI and version menus recommend a tactic in tabs …".

After **Use this way** on Whole package and a reload, the test picks ChatGPT and expects the first tab to say "Recommended · In use". So picking another AI **changes the tactic in use** to the recommended one. FR-223 says the recommended tab is shown "open" and marked; it doesn't say that a new AI replaces a tactic the learner chose. The contract's `POST /api/plan` ("without `tactic` the recommended one is used") makes it likely, but it's the page's choice to omit `tactic`. This is the same kind of over-specification as the first review's finding 1.

**Fix.** Either FR-223 says that picking another AI or product uses its recommended tactic (then the test is right), or the test is too strict.

## 8. FR-223 and RQ-405: what's left untested

- "The first **Get texts** asks for the AI first": `freshPrompt` sets the AI through the API, so the page's question is never shown in a test.
- "The whole package applies from the next package": the switching test covers step by step ↔ one long prompt only.
- RQ-405's offer: only "one long prompt from step by step" is tested (`offer: 'long'`), not "step by step from the others", and not the offer on Home's page.

## 9. FR-602: the credits name the word list

FR-602 now names the Swedish–English word list from Wiktionary through kaikki.org (CC BY-SA 4.0). `tests/levels/credits.test.mjs` checks the sources in the `sources` table (the Kelly list) and the font only; `public/credits.html` does name Wiktionary today, but no test would notice it going. It's a licence obligation (C-05).

## 10. FR-032: what's left untested

`tests/web/startup.test.mjs` and `tests/e2e/starting.spec.mjs` cover the gate, the progress and the loading page well. Not covered:
- `/fonts/*` served while starting (only `/assets/*` is checked).
- "so no body is read": the test checks `Connection: close` only. FR-022's test proves it with a partly sent body (`partialPost`), which would be the stronger form here.
- "The hourly job starts once grove is ready."
- SC-008: "the loading page appears within 0.5 s of grove starting to listen".

## 11. Edits to tests whose rule didn't change

Most edits follow a changed rule: the summary and known words moved into the setup (FR-203), texts have kinds (FR-202), the meanings prompt is gone (FR-207, FR-318), and `addSample` always starts a new package because `next` may now give a waiting redo (FR-206). These are in the regeneration log. Two notes:

- `tests/reading/practice.test.mjs` (FR-310, unchanged) was edited: leaves without a stored meaning now take the word list's (FR-306 changed), so more leaves can be asked about, and the test keeps one other meaning instead of two. FR-310's rule is still what's tested. Like the first review's finding 9, it's an edit to a test whose rule didn't change, but with a cause in a changed rule.
- `tests/drill/leaves.test.mjs` FR-412: `if (missing.status === 400)` makes the phrase case pass either way, so "a phrase gets the word list's meaning" isn't checked. The made-up word covers the `needs_meaning` path. FR-412's 200-character limit for the learner's meaning is untested.

## Side observation: the flaky browser tests

The three flaky browser tests (drill FR-401, reading FR-316, look-extras FR-805) are in the three spec files whose `addSample` helper changed in `305394f`: it used to ask for `next` and fall back to `new_package` on 409, and now always asks for `new_package`. The flakiness was first logged in the next client regeneration after that commit. That's a lead worth checking first, not a finding.
