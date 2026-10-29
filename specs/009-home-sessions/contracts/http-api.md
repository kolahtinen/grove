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
| `/review?mode=review\|master` | kept for old links: starts a 10-minute Review (Harder questions only for `master`) and opens `/session` |

Every signed-in page's top bar: the logo (a link to `/`) and ☰ (Account, Settings, Help as a bubble from `/how`, Sign out).

## API

| Method, path | Body | Responses |
|---|---|---|
| `POST /api/sessions` | addendum 006: `{kind: "time"\|"topic", tile: "discover"\|"review"\|"mix" (topic: mix only), skill: "mix"\|"reading"\|"listening"\|"words"\|"grammar", minutes: 5\|10\|20\|30, hardOnly?: boolean (Review only), topic?: string ≤ 120 (topic only), voice: boolean, fill?: boolean, asIs?: boolean}` | `200 {session}`: planned; or, for Mix and Discover whose new texts cover under 80% of the text target and without `fill`, a going session with an empty plan and its `offer` (FR-920; stored on the row, FR-923) · `409 short` (a Review plan under 80% without `fill` or `asIs`: the page offers Fill the time, `fill: true`, or Start shorter, `asIs: true`) · `409 nothing_to_do` (still no exercise) · `409 no_voice` (skill listening without a voice) · `400` (a field the kind or tile doesn't take, one it needs missing, or minutes not 5, 10, 20 or 30) |
| `POST /api/session/plan` | `{sessionId: integer, fill: boolean}` | answers the going session's offer: `fill: true` is Practise without (FR-905's filling), `fill: false` is ▶ Start your session (plans again with the texts there are now). `200 {session}` planned, its offer cleared; or, `fill: false` and still short, the same session with its offer (missing minutes and `at` unchanged) · `409 nothing_to_do` · `409 stale` (no offer: already planned, finished or replaced) · `404` |
| `GET /api/session` | – | `200 {session \| null}` (the going one) |
| `GET /api/session?id=N` | – | `200 {session}` one of the learner's sessions, with its summary once finished (the session page after a text that ended it) · `404` |
| `POST /api/session/next` | `{sessionId: integer, index: integer ≥ 0}` | `200 {session}` (index done; a repeated index answers the current state) · `409 stale` (index not the current one or older) · `404` |
| `GET /api/settings` | – | `200 {speakWords, speechRate}` for the Settings page (FR-910) |
| `GET /api/topics` | – | `200 {topics: [{topic, label, texts: [{id, title, kind, read, beta, own}]}]}` (unread first; own texts under `label: "My own texts"`) |

`session` = `{id, kind, tile, skill, hardOnly, topic, minutes, label: "10-minute Mix" \| "5-minute Review" \| "10-minute Mix: Food and drink" …, index, total, minutesLeft, short: bool (planned below the length, with the reason), status, offer: Offer \| null, exercise: Exercise \| null, summary: Summary \| null}` (addendum 006; old sessions: tile and skill as migration 017 filled them; the label is the tile's name when they had no length)

`Offer` = `{needs: ["reading" \| "listening"], missing: {reading, listening}, added: {reading, listening}, full: boolean}`: whole minutes (missing rounded up, added down) of new texts missing per kind at the offer, and of the learner's texts of each kind created since it, wherever they were added, at FR-905's durations; `needs` lists the kinds the skill uses that were missing; `full` when every needed kind's added reaches its missing (FR-920). A page reached from the offer (`?from=session`) asks `GET /api/session` and shows "‹ Back to your session" (to `/session`) only while that session has an offer (FR-923).

`Exercise` = `{mode: "discover"\|"review", type, minutes, textId?, title?, question?}`, where `question` is G-04's review item shape (`{lemma, kind, mode, sentence?, word?, meaning?, options?, right?}`). A harder question is `mode: "review", type: "master"`; an old plan's `mode: "master"` shows as review.

`Summary` = `{minutes, textsRead, wordsReviewed, wordsFell}` (pending PD-05: `daysThisWeek`).

Answers to Review and Master questions go to G-04's `POST /api/review` unchanged.

## Progress (B-27; FR-924, FR-925)

| Method, path | Body | Responses |
|---|---|---|
| `POST /api/input` | `{seconds: 30, day: "YYYY-MM-DD", kind?: "reading"\|"listening"\|"other"}` (G-04's route; `kind` defaults to `other`) | `200 {todayMinutes}` |
| `GET /api/progress` | – | `200 {today: {minutes}, level: {start, startAt, now, coverage: [[level, percent]]}, week: [{day, read, listen, readWords, listenWords}] (7, ending today), last7: {read, listen, readWords, listenWords}, leaves: {words, patterns, weekWords, weekPatterns, everWords, everPatterns, recent: [{lemma, en, kind, at}]}, ground: {words, patterns, weekWords, weekPatterns, fromStart, fromReading, fell, recent: [{lemma, en, kind, at}]}, ever: {read, listen, readWords, listenWords, since}}` — minutes whole, words whole; `recent` at most 10 |

