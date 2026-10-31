# Contract: G-04 additions to grove's HTTP interface

All G-01 rules apply; every route is `access: agreed`; the account comes from the session. Items are named by `lemma` (+ `kind`, default `word`) as the reading payload shows them.

## Pages

| Path | Notes |
|---|---|
| `/` | Home gains the three stages (Discover, Review, Master), level, today's minutes, the welcome card, links to Leaves and Progress |
| `/review?mode=review` / `/review?mode=master` | Review and Master sessions |
| `/leaves` | drilled leaves by mark; add; delete |
| `/progress` | minutes per day (14 days), ground size, drilled count |
| `/text?id=N` | gains the marking step, colours, menu switches, Let it fall, Pick up, times met |

## API

| Method, path | Body | Responses |
|---|---|---|
| `GET /api/stages` | – | `200 {level: "A2" \| "below A1" \| null, todayMinutes, review: {fading, due}, master, nextDue: ms \| null, welcome: bool}` |
| `POST /api/welcome` | `{}` | `200 {result: "dismissed"}` |
| `GET /api/marking?textId=N` | – | `200 {words: [{lemma, kind, en}]}` (the text's unmarked leaves) |
| `POST /api/marking` | `{textId: integer, marks: [{lemma: string ≤80, kind?: enum, remember: boolean}] ≤ 60}` | `200 {drilled: n, fell: n}` — listed words marked To remember are drilled; listed words without fall; only the text's unmarked leaves count |
| `POST /api/marks` | `{lemma: string ≤80, kind?: enum, remember: boolean}` | `200 {state, drilled, remember}` — creates a leaf for a word grove hasn't got |
| `GET /api/fall-check?lemma=…&kind=…` | – | `200 {question: {sentence, word, options, right} \| null}` (null → "Are you sure?") |
| `POST /api/let-it-fall` | `{lemma, kind?, right?: boolean, confirmed?: boolean}` | `200 {fell: bool}` |
| `POST /api/pick-up` | `{lemma, kind?}` | `200 {result: "picked_up"}` · `409 already_drilled` (a drilled leaf) — RQ-456 (FR-411): a ground item, an unmarked leaf, or an item the learner hasn't got (a new word, phrase or pattern, added with the word list's meaning) becomes a drilled leaf To remember, due now (was: ground only, `409 not_ground`) |
| `GET /api/review?mode=review\|master` | – | `200 {items: [{lemma, kind, mode: "remember"\|"master"\|"recall", sentence?, word?, meaning?, options?, right?}] (≤ 10), nextDue}` |
| `POST /api/review` | `{lemma, kind?, mode: enum, right: boolean}` | `200 {gap, fell: bool}` |
| `GET /api/leaves` | – | `200 {remember: [item], unmarked: [item]}`, item = `{lemma, kind, en, gap, strength, due: bool}` |
| `POST /api/leaves` | `{text: string 1–80, kind?: enum}` | `200 {result: "added"}` |
| `POST /api/leaf-delete` | `{lemma, kind?}` | `200 {result: "deleted"}` |
| `GET /api/progress` | – | `200 {level, days: [{day, minutes}] (14), ground, drilled}` |
| `POST /api/input` | `{seconds: integer 1–60, day: "YYYY-MM-DD"}` | `200 {todayMinutes}` · `400` if day is more than a day off |

`kind` enum: `word | phrase | pattern`. Questions (`GET /api/review`, a session's Review exercise) add `sentenceEn`, the English of the sentence's line (G-09 FR-932: shown after answering), and a sentence never carries a closing quotation mark it doesn't open (FR-932). Review/Master `mode` in answers: `remember | master | recall`. **Addendum 003 (RQ-415):** To read is gone for Swedish: no `read` fields; a Review item shows its sentence with Play (FR-406); Pick up (`POST /api/pick-up`, also for a pattern, which is added as a leaf if missing) gives To remember (FR-411).

## Reading payload additions (G-03 `GET /api/reading`)

Word tokens gain `marks: {remember}`, `fell: "read"|"remember"|"both"|null`, `met` (times met), and the payload gains `marking: n` (unmarked leaves in this text).
