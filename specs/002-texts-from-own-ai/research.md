# Research: G-02 Texts from the learner's own AI

Phase 0 of `/speckit-plan`, 2026-10-24. Builds on G-01's stack (Node.js 22, built-in HTTP/SQLite/crypto/test, static client; `specs/001-platform-accounts-look/research.md`). Inputs: the X-03 test (`docs/middle/ai-test/`, question-pages/52), clarify answers (question-pages/57), risks R-01, R-03, R-04.

## R1. No new dependencies

- **Decision:** Everything in G-02 (prompt building, JSON extraction, word counting, inflection rules) is plain JavaScript on Node built-ins.
- **Rationale:** Constitution 2.6; no Swedish NLP library fits the size and licence needs (a stemmer like Snowball adds little over a short suffix list for what grove needs, R2).
- **Alternatives:** `snowball-stemmers` (stems are not dictionary forms; still needs the AI's lists); a Swedish dictionary import (comes with the Kelly list in G-06).

## R2. Counting new words (FR-213; R-03, Q-07)

- **Decision:** A small pipeline in `server/words/`:
  1. **Sentences:** split each line at `.`, `!`, `?` or `…` followed by space, closing quote or end; quotes (”, ", ») stay with their sentence.
  2. **Words:** `\p{L}+(?:[-’']\p{L}+)*` (Unicode letters, so å ä ö work), lower-cased; digits are skipped.
  3. **Names:** the answer's `names` list, and any capitalised word that is not the first word of its sentence, never count.
  4. **Phrases:** fixed phrases (the answer's `new_phrases` and the learner's phrase words) are matched first, longest first; a matched phrase is one item, and its words are not counted again.
  5. **Known form:** a form is known when it is a ground word's dictionary form, a form the learner has learned (word_forms), an inflected form the answer lists for a known word, or a **regular inflection**: removing one ending from the list `arna orna erna ande ende aste ast are heten het ens ets en et er ar or na de te dd tt t s a n e` (longest first) leaves a known dictionary form, or that stem plus `a` does (verbs: *läser* → *läs* + *a*), or the stem minus a doubled final consonant does.
  6. **Compounds:** a form of 6+ letters that splits into two known parts (each 2+ letters, optionally joined by `s`) is known.
- **Rationale:** Covers the X-03 cases (present-tense verbs, definite nouns, plurals, compounds) without a dictionary; irregulars (*böcker*, *gick*) come from the AI's `inflections` list (RQ-64) or, if missing, from the meanings answer (FR-207), after which they are learned.
- **Q-07:** a fixed test set of 50 real Swedish sentences (from the X-03 answers and hand-made for homographs like *var*, compounds and irregulars) with a known-word list and the expected new items per sentence; the test prints the score and fails if it drops below the stored baseline.
- **Alternatives:** Asking the AI to annotate every word (longer answers, the AIs' lists proved unreliable in X-03).

## R3. Finding and reading the JSON (FR-205; X-03)

- **Decision:** Candidates in order: every fenced block (```` ```json ```` or ```` ``` ````), then the text from the first `{` to the last `}`. The first candidate that parses and has a `texts` array is used. If no candidate parses and the text has an opening `{` with fewer closing braces (or ends inside a string), the problem is **cut off**; otherwise **not valid JSON**, with the parser's position turned into a line number.
- **Validation:** a hand-written nested schema check (as G-01's `checkSchema`, extended to arrays and objects) with the limits of FR-205; unknown fields are refused, except that the fields the X-03 answers added harmlessly (`kind`, `series`, `episode`, `speaker`, `nodes`) are dropped silently, as the AIs add them.

## R4. The prompt (FR-201, FR-203, FR-204, FR-208…FR-212; R-04)

- **Decision:** One template in `server/texts/prompt.mjs`, based on the X-03 prompt (which worked in all three free chats), with:
  - the part code (e.g. `K7QM-2`: four random letters, the part number), asked to be echoed in `"part"`;
  - 3 texts of ~130 words, one sentence per line, an English translation per line, 2–3 questions with 2–3 options in simple Swedish;
  - the rules: target share, at most one new word or fixed phrase per sentence, names in `names`, new words with dictionary form, meaning and a simple Swedish explanation, inflected forms of known words in `inflections`;
  - the known words as one comma-separated line of dictionary forms (at most 1,500), the leaves to reuse (at most 10), the topic and, for a new topic, a request for 10–15 starter words;
  - for part 1 of a package, the summary (text titles, ratings, questions right); for parts 2–3, "If this chat already has the earlier parts, continue their story and characters";
  - the nudges: "use more new words this time" (after too few) and "use shorter sentences" (after a low rating);
  - an empty ground: "I'm a complete beginner; build the texts from the starter words" instead of a known-word list.
- **Size:** 1,500 dictionary forms average ~7 characters plus separators ≈ 12,000 characters, plus ~2,500 of instructions: under SC-006's 16,000 (tested with a generated 5,000-word ground).
- **Choosing the 1,500:** topic and starter words first, then the most recently fallen, then by `uses` (how often the word appeared in the learner's accepted texts), then alphabetically.

## R5. Fix-it and meanings prompts (FR-206, FR-207)

- **Decision:** The fix-it prompt lists numbered problems in plain English: "Your answer was cut off after text 2 — please send the whole JSON block again, complete." / "Text 1, sentence 4: 'Hon köper en ny väska på marknaden.' has 3 new words (köper, väska, marknaden); rewrite it with at most one." It ends with "Reply with the whole corrected JSON block, in the same format, and nothing else." The meanings prompt lists the forms and asks for `{"meanings": [{"form", "lemma", "en", "explain_sv"}]}`.
- **Rationale:** X-03: the AIs follow precise, quoted instructions; one block back keeps parsing the same.

## R6. Packages and exchanges (FR-202, FR-203; question-pages/57)

- **Decision:** A `packages` row per package (3 parts); an `exchanges` row per prompt (kind `part`, `fix`, `meanings`). Asking for texts returns the open waiting exchange if there is one (the same prompt again), so double taps don't create two. A fix exchange points to the part it fixes and shares its part code. The answer hash (SHA-256 of the extracted JSON) prevents the same answer being added twice; a different part code gives "this answer is for another part".
- **Finished:** 3 accepted parts and every text rated → the next request starts a new package. **New package** closes the open one as `closed`.

## R7. Ratings and target share (FR-218)

- **Decision:** `learner_settings.target_share` (default 95, kept within 93–98); "almost nothing" +2 and `shorter = 1`; "a little" +1 and `shorter = 1`; "about half" no change; "most"/"everything" increase `high_streak`; at 3 the share goes −1 and the streak resets; any lower rating resets the streak. `shorter` is cleared after the next prompt that carries it.

## R8. Client

- **Decision:** Home (`public/index.html`, `home.mjs`) gets the topic card, the package card (progress, prompt with Copy prompt, paste box, Add texts, problems and fix-it/meanings prompts) and the text list; a new page `public/text.html` + `text.mjs` (`/text?id=N`) for reading, questions and rating. Copy uses `navigator.clipboard.writeText` with a select-all fallback. All values set with `textContent`.
