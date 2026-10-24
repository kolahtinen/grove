# Quickstart: validating G-03

Interfaces: [http-api](contracts/http-api.md); data: [data-model](data-model.md); decisions: [research](research.md).

## 1. Automated tests

```sh
npm test          # includes tests/reading/ and the extended texts/words/store tests
npm run test:e2e  # includes the word menu, practice, dictionary and own text
npm run check     # FR-301…FR-319 traced
```

## 2. Local run (`npm run dev`)

| Step | Expected |
|---|---|
| Add the sample answer `tests/texts/answers/good-patterns.json` (good.json plus patterns) | texts listed |
| Open "Olles väska" | English under each sentence; new-word counts; word count and share at the top; "har han glömt" marked in the pattern colour |
| Tap "kopparna", "säger", "Elsa" | menus: kopp / cup / leaf; säga / ground; Elsa / name — instantly |
| Turn translations off, reopen | no English; a line's English button still shows it |
| Explain "kopparna" (why this form); get the next part | the prompt lists E1 with the sentence and reason |
| Report question 2 as wrong answer | it stops counting; next prompt lists R1 |
| Practise a text | word questions inside sentences, then the passage questions, then the full text with Play highlighting each sentence |
| Dictionary | kopp (cup, leaf, example sentence); Elsa under Names |
| Paste an own text | saved without English; Save as leaf on a new word |
