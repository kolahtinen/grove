# Contract: G-03 additions to grove's HTTP interface

All G-01 rules apply; every route below is `access: agreed`, the account comes from the session.

## Pages

| Path | Notes |
|---|---|
| `/text?id=N` | rebuilt: sentences with tokens, translations per setting, pattern marks, word menu, Explain, Report, Practise |
| `/dictionary` | words, phrases and patterns met; names |

## API

| Method, path | Body | Responses |
|---|---|---|
| `GET /api/reading?id=N` | – | `200 {id, title, own, showTranslations, stats: {words, newWords, share}, lines: [{position, en, sentences: [{id, sv, newCount, tokens: [{t, word?, status?: "new"\|"leaf"\|"ground"\|"name", lemmas?: [string], meaning?, explanation?, phrases?: [string], patterns?: [id]}]}], reported: bool}], patterns: [{id, name, explain}], questions: [{position, q, options, reported}], answered, rating}` · `404` — `t` is the token's text; tokens without `word` are spaces and punctuation |
| `GET /api/practice?id=N` | – | `200 {questions: [{sentence, word, options: [string], right: index}]}` (≤ 8) |
| `POST /api/settings` | `{showTranslations: boolean}` | `200 {showTranslations}` |
| `POST /api/explain` | `{sentenceId: integer, form: string 1–80, reason: enum, note?: string ≤200}` | `200 {code}` |
| `POST /api/report` | `{textId: integer, questionPosition?: integer 0–5, linePosition?: integer 0–59, reason: enum, note?: string ≤200}` (exactly one position) | `200 {code}` |
| `GET /api/dictionary` | – | `200 {items: [{lemma, kind, en, state, example}], names: [string]}` |
| `POST /api/own-text` | `{title: string 1–120, text: string 1–20000}` | `200 {id}` |
| `POST /api/leaf` | `{textId: integer, form: string 1–80}` | `200 {result: "saved"}` |
| `POST /api/meanings-prompt` | `{}` | `200 {exchangeId, prompt}` · `409 nothing_missing` |

Enums: Explain reason `why_form | why_here | other_meaning | reading | other`; Report reason `wrong_answer | bad_translation | unnatural | wrong_reading | audio | other`.

## Answer format additions (all optional)

```json
{
  "patterns": [{ "name": "har + supine", "explain_en": "past action: has done", "places": [{ "text": 2, "line": 9, "words": "har han glömt" }] }],
  "explanations": [{ "code": "E1", "explain_en": "…" }],
  "fixes": [{ "code": "R1", "q": "…", "options": ["…", "…"], "answer": 1 }, { "code": "R2", "sv": "…", "en": "…" }]
}
```

Limits: ≤ 20 patterns (name ≤ 80, explain ≤ 300, ≤ 20 places, text 1–4, line 1–60, words ≤ 80); ≤ 20 explanations (≤ 500); ≤ 20 fixes (q ≤ 300, 2–3 options ≤ 200, valid answer; or sv/en ≤ 400).
