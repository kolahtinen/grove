# Quickstart: validating G-02

Interfaces: [http-api](contracts/http-api.md); data: [data-model](data-model.md); decisions: [research](research.md).

## 1. Automated tests

```sh
npm test          # includes tests/words/ and tests/texts/ (fake Firebase; sample AI answers in tests/texts/answers/)
npm run test:e2e  # includes the home exchange and reading page
npm run check     # FR-201…FR-221 each have a test
```

Expected: all pass; the Q-07 test prints its score on the 50-sentence set and passes at or above the baseline.

## 2. Local run

`npm run dev` (fake Firebase). The dev server gives the reviewer a ground of the X-03 known words (`docs/middle/ai-test/known.txt`).

| Step | Expected |
|---|---|
| Sign in as the reviewer, agree, set topic "a small café in Stockholm" | topic on Home |
| Get texts | prompt "part 1 of 3", Copy prompt works, the prompt lists known words and asks for starter words |
| Paste `tests/texts/answers/good.json` wrapped in prose | 3 texts added within 2 s; new words in Leaves |
| Paste the same again | "already added" |
| Next part, paste `cut-off.txt` | "cut off" problem and a fix-it prompt |
| Paste `too-many-new.json` | problems naming sentences and words; fix-it prompt |
| Open a text, show English, answer questions, rate "a little" | right/wrong shown; next prompt asks for shorter sentences and a higher share |

## 3. With real AIs (Q-04, SC-001, SC-002, SC-005)

On a phone, with free ChatGPT, Claude and Gemini: for each, start a package and paste the answer; count accepted first try, fix-it rounds, and minutes to the first text. Record the counts in `docs/STATUS.md` (Verified for G-02); if fewer than 4 of 5 pass first try, tune the margins (FR-214) through the spec.
