# Contract: G-09 additions to grove's HTTP interface

All G-01 rules apply; every route is `access: agreed`; the account comes from the session. A `sessionId` of another account answers 404 `not_found`.

## Pages

| Path | Notes |
|---|---|
| `/` | Home: the tile grid (Resume while a session is going, Practise for X min, Texts, By skill, Dictionary, Just one mode, Progress); the welcome card above it until closed |
| `/texts` | topics with their texts and Start a session; New texts (AI and version, the wizard card, own text) |
| `/session`, `/session?id=N` | the going session's current exercise, or that session's summary when it is finished |
| `/settings` | speech speed and voice help, Speak words, Start the starting level again |
| `/profile` | the Account page: email, Sign out, how to ask for an export or deletion (not `/account`: G-01 FR-010's test keeps "account" out of every route, as no route may create one) |
| `/terms` | one section per screen, Next after 3 s, one Agree (G-01's route unchanged) |
| `/text?id=N&session=S&index=I` | the reading page with the session bar; Done (or the marking step) moves the session on and returns to `/session?id=S` |
| `/review?mode=review\|master` | kept: starts a Just one mode session and opens `/session` |

Every signed-in page's top bar: the logo (a link to `/`) and ☰ (Account, Settings, Help as a bubble from `/how`, Sign out).

## API

| Method, path | Body | Responses |
|---|---|---|
| `POST /api/sessions` | `{kind: "time"\|"topic"\|"skill"\|"mode", minutes?: integer 3–60, topic?: string ≤ 120, skill?: "reading"\|"listening"\|"words"\|"grammar", form?: "short"\|"medium"\|"long", mode?: "discover"\|"review"\|"master", voice: boolean}` | `200 {session}` · `409 nothing_to_do` (no exercise at all; the page offers New texts) · `409 no_voice` (skill listening without a voice) · `400` (a field the kind doesn't take, or one it needs missing) |
| `GET /api/session` | – | `200 {session \| null}` (the going one) |
| `GET /api/session?id=N` | – | `200 {session}` one of the learner's sessions, with its summary once finished (the session page after a text that ended it) · `404` |
| `POST /api/session/next` | `{sessionId: integer, index: integer ≥ 0}` | `200 {session}` (index done; a repeated index answers the current state) · `409 stale` (index not the current one or older) · `404` |
| `GET /api/settings` | – | `200 {speakWords, speechRate}` for the Settings page (FR-910) |
| `GET /api/topics` | – | `200 {topics: [{topic, label, texts: [{id, title, kind, read, beta, own}]}]}` (unread first; own texts under `label: "My own texts"`) |

`session` = `{id, kind, minutes, label: "10-minute session" \| "Review" …, index, total, minutesLeft, short: bool (planned below the length, with the reason), status, exercise: Exercise \| null, summary: Summary \| null}`

`Exercise` = `{mode: "discover"\|"review"\|"master", type, minutes, textId?, title?, question?}`, where `question` is G-04's review item shape (`{lemma, kind, mode, sentence?, word?, meaning?, options?, right?}`).

`Summary` = `{minutes, textsRead, wordsReviewed, wordsFell}` (pending PD-05: `daysThisWeek`).

Answers to Review and Master questions go to G-04's `POST /api/review` unchanged.
