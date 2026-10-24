# Contract: G-02 additions to grove's HTTP interface

All rules of G-01's contract apply (headers, 100 KB limit, strict schemas, CSRF, plain errors). Every route below needs a signed-in session that has agreed to the terms (`access: agreed`); the account always comes from the session.

## Pages

| Path | Notes |
|---|---|
| `/` | Home: topic, package card (prompt, Copy prompt, paste box, problems), texts list |
| `/text` | Reading page; the text id is in the query (`/text?id=12`) |

## API

| Method, path | Body | Responses |
|---|---|---|
| `GET /api/home` | – | `200 {topic, package: {id, part, of, status} \| null, waiting: {exchangeId, kind, part, of, prompt} \| null, texts: [{id, title, partNo, state: "new"\|"read"\|"rated", createdAt}]}` |
| `POST /api/topic` | `{topic: string 1–80}` | `200 {topic}` |
| `POST /api/prompt` | `{action: "next" \| "new_package"}` | `200 {exchangeId, kind: "part", part, of, prompt, carriesSummary}` — `next` returns the waiting prompt if one is open, else the next part (or part 1 of a new package when none is open or the last is finished); `new_package` closes the open package and starts a new one · `409 package_waiting` when `next` is asked while the package's texts are not all rated and all 3 parts are in (message says to rate them or start a new package) |
| `POST /api/answer` | `{exchangeId: integer, answer: string 1–80000}` (80,000 characters keeps the request under G-01's 100 KB limit with å/ä/ö and JSON escaping; the page warns before sending a longer paste) | `200 {result: "accepted", texts: [{id, title}], newWords: n, meanings: {exchangeId, prompt} \| null}` · `200 {result: "needs_fix", problems: [string], fix: {exchangeId, prompt}}` · `200 {result: "meanings_added", filled: n, missing: n}` (for a meanings exchange) · `409 duplicate` (already added) · `409 wrong_part` (the answer's part code is another part's) · `404 not_found` (no such exchange for this account) |
| `GET /api/text?id=N` | – | `200 {id, title, topic, lines: [{sv, en}], questions: [{q, options}], answered: [{position, option, right}], rating \| null}` · `404 not_found` |
| `POST /api/question` | `{textId: integer, position: integer 0–5, option: integer 0–2}` | `200 {right: bool, rightOption}` |
| `POST /api/rating` | `{textId: integer, value: "almost_nothing" \| "a_little" \| "about_half" \| "most" \| "everything"}` | `200 {result: "rated", targetShare}` |

Integers in JSON bodies are checked as safe positive integers; the schema module gains an `integer` type (G-01's `checkSchema`, extended).

## The AI answer format (asked for by every part and fix-it prompt)

```json
{
  "part": "K7QM-2",
  "texts": [
    {
      "title": "…",
      "lines": [{ "sv": "…", "en": "…" }],
      "questions": [{ "q": "…", "options": ["…", "…"], "answer": 0 }]
    }
  ],
  "new_words": [{ "form": "…", "lemma": "…", "en": "…", "explain_sv": "…" }],
  "new_phrases": [{ "sv": "…", "en": "…", "explain_sv": "…" }],
  "inflections": [{ "form": "…", "lemma": "…" }],
  "names": ["…"],
  "starter_words": [{ "lemma": "…", "en": "…", "explain_sv": "…" }]
}
```

Limits (FR-205): 1–4 texts; 1–60 lines per text; `sv`/`en` ≤ 400 characters; 0–6 questions with 2–3 options and a valid answer index; ≤ 200 entries in each list. Fields the X-03 answers added (`kind`, `series`, `episode`, `speaker`, `nodes`) are dropped; any other unknown field is a problem.

Meanings answer: `{"meanings": [{"form", "lemma", "en", "explain_sv"}]}`, ≤ 200 entries.
