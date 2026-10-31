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
| `GET /api/home` | – | `200 {topic, plan: {family, product, tactic, recommended, families: [{id, name, products: [{id, name, paid}]}]}, offer: "long" \| "steps" \| null, package: {id, part, of, status, oneText} \| null, waiting: {exchangeId, kind, part, of, steps: [string], prompt, newChatSuggested: bool} \| null, texts: [{id, title, kind: "reading"\|"listening", partNo, state: "new"\|"read"\|"rated", createdAt}]}` — `steps` are the setup prompts to copy before `prompt` (the request) |
| `POST /api/topic` | `{topic: string 1–80}` | `200 {topic}` |
| `POST /api/prompt` | `{action: "next" \| "new_package" \| "new_chat"}` | `200 {exchangeId, kind: "part"\|"package"\|"redo", code, part, of, steps: [string], prompt, carriesSummary}` — `next` returns the waiting request if one is open, else the next request (part 1, with the setup, of a new package when none is open or the last is finished; the whole package after the setup with the whole-package tactic; with one long prompt, `steps` is empty and the request carries everything); without a chosen AI the tactic is step by step (Home asks for the AI before the first Get texts, FR-223); `new_package` closes the open package and starts a new one; `new_chat` gives the waiting request again with the setup in `steps` (`409 nothing_waiting` without one) · `409 package_waiting` when `next` is asked while the package's texts are not all rated and all 3 parts are in (message says to rate them or start a new package) |
| `POST /api/answer` | `{exchangeId: integer, answer: string 1–80000}` (80,000 characters keeps the request under G-01's 100 KB limit with å/ä/ö and JSON escaping; the page warns before sending a longer paste) | `200 {result: "accepted" \| "partly_accepted", texts: [{id, title, kind}], newWords: n, problems: [string], next: {exchangeId, kind: "redo"\|"meanings_fix", prompt} \| null, newChatSuggested: bool}` — `partly_accepted` when some texts failed or wait for meanings · `200 {result: "needs_fix", problems: [string], fix: {exchangeId, prompt}, newChatSuggested: bool}` (the answer couldn't be read) · `409 duplicate` (that part is already accepted) · RQ-461 (FR-919): an answer sent to an exchange grove refused (status `needs_fix`) is read as the answer to its waiting fix-it request (the newest waiting `fix` of the same code), so a correct answer pasted after a failed one is read normally and never refused as already added; an answer grove can't use at all (no JSON, cut off, a refusal such as "Sorry, I cannot do that") always answers `needs_fix` with its problem and the fix-it request · `409 wrong_part` (the answer's part code is another part's) · `404 not_found` (no such exchange for this account) |
| `GET /api/text?id=N` | – | `200 {id, title, topic, lines: [{sv, en}], questions: [{q, options}], answered: [{position, option, right}], rating \| null}` · `404 not_found` |
| `POST /api/question` | `{textId: integer, position: integer 0–5, option: integer 0–2}` | `200 {right: bool, rightOption}` |
| `POST /api/plan` | `{family: enum, product: string 1–30, tactic?: "steps" \| "long" \| "whole"}` | `200 {family, product, tactic, recommended}` — without `tactic` the recommended one is used; a product that isn't the family's is `400` (FR-223) |
| `POST /api/rating` | `{textId: integer, value: "almost_nothing" \| "a_little" \| "about_half" \| "most" \| "everything"}` | `200 {result: "rated", targetShare}` |

Integers in JSON bodies are checked as safe positive integers; the schema module gains an `integer` type (G-01's `checkSchema`, extended).

## The AI answer format (given in the setup; asked for by every request and fix-it prompt)

```json
{
  "part": "K7QM-2",
  "texts": [
    {
      "kind": "reading",
      "part": 1,
      "title": "…",
      "lines": [{ "sv": "…", "en": "…" }],
      "questions": [{ "q": "…", "options": ["…", "…"], "answer": 0 }]
    }
  ],
  "new_words": [{ "form": "…", "lemma": "…", "en": "…", "explain_sv": "…" }],
  "new_phrases": [{ "sv": "…", "en": "…", "explain_sv": "…" }],
  "inflections": [{ "form": "…", "lemma": "…" }],
  "names": ["…"],
  "meaning_checks": [{ "form": "…", "lemma": "…", "en": "…", "explain_sv": "…" }],
  "starter_words": [{ "lemma": "…", "en": "…", "explain_sv": "…" }]
}
```

`part` at the top is the request's code: a part code (`K7QM-2`), or the package code (`K7QM`) for a whole package, whose texts then each name their `part` (1–3). `kind` is `reading` or `listening`.

Limits (FR-205): 1–4 texts (1–12 for a whole package); 1–60 lines per text; `sv`/`en` ≤ 400 characters; 0–6 questions with 2–3 options and a valid answer index; ≤ 200 entries in each list, ≤ 100 meaning checks. Fields the X-03 answers added (`series`, `episode`, `speaker`, `nodes`) are dropped; any other unknown field is a problem.

Meanings fix-it answer: `{"meanings": [{"form", "lemma", "en", "explain_sv"}]}`, ≤ 200 entries; only the forms stored with the fix-it count.

## Settings (environment, FR-202)

`GROVE_PART_READING` (2), `GROVE_PART_LISTENING` (1), `GROVE_TEXT_WORDS` (90), `GROVE_SETUP_CHUNK_WORDS` (500), `GROVE_SETUP_MAX_WORDS` (3000), `GROVE_CHECK_MEANINGS` (20), `GROVE_OWN_PIECE_CHARS` (2500): positive integers in `web.env`, read by `loadConfig` (role `web`); a missing value takes the default, a bad one stops grove at start with the setting's name.
