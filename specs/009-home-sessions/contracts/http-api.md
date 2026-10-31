# Contract: G-09 additions to grove's HTTP interface

All G-01 rules apply; every route is `access: agreed`; the account comes from the session. A `sessionId` of another account answers 404 `not_found`.

## Pages

| Path | Notes |
|---|---|
| `/` | Home: the map (RQ-463, FR-901): three bands of rows (Learn: Discover, Review, Mix; Your texts: Your library, Common library; How you're doing: Progress) with their lines and live counts from `GET /api/overview`; Resume at the very top while a session with a plan is going (`total > 0`); the welcome card above until closed. (Was: the tile grid.) |
| `/texts` | topics with their texts and Start a session; New texts (AI and version, the wizard card, own text) |
| `/options?tile=discover\|review\|mix` | B-24 (FR-903): the tile's Options page, a sheet over Home with ‹ Home and ✕; Start calls `POST /api/sessions`; an unknown tile goes to Home |
| `/session`, `/session?id=N` | the going session in the shared frame (FR-932): its start screen until Start, then its current exercise; a text of the session inside the frame (FR-933); a finished exercise looked at again by its segment (`GET /api/session/exercise`); that session's summary when it is finished. ✕ calls `POST /api/session/leave` and opens Home |
| `/settings` | speech speed and voice help, Speak words, Start the starting level again |
| `/profile` | the Account page: email, Sign out, how to ask for an export or deletion (not `/account`: G-01 FR-010's test keeps "account" out of every route, as no route may create one) |
| `/terms` | one section per screen, Next after 3 s, one Agree (G-01's route unchanged) |
| `/text?id=N&session=S&index=I` | old links only: opens `/session?id=S` (a session's texts open inside the session since FR-933) |
| `/add` | Add a text (FR-918, RQ-460): the chooser; "Under way: step i of n" with Continue from `GET /api/home`'s `waiting` (Texts from your AI) and `GET /api/own-texts` (an own text waiting for its word check) |
| `/library?from=add` | the Common library opened from Add a text: its back link reads "‹ Add a text" (FR-918, FR-922); the title opens the preview sheet from `GET /api/library/text` (FR-916) |
| `/add/ai`, `/own` | one step per screen (FR-919, G-03 FR-318); `/own?id=N` opens an own text's step 2 (its word check) |
| `/review?mode=review\|master` | kept for old links: starts a 10-minute Review (Harder questions only for `master`) and opens `/session` |

Every signed-in page's top bar: the logo (a link to `/`) and ☰ (Account, Settings, Help as a bubble from `/how`, Sign out).

## API

| Method, path | Body | Responses |
|---|---|---|
| `POST /api/sessions` | addendum 006: `{kind: "time"\|"topic", tile: "discover"\|"review"\|"mix" (topic: mix only), skill?: "mix"\|"reading"\|"listening"\|"words"\|"grammar" (old pages; B-25: `skills` instead), skills?: ["reading"\|"listening"\|"words"\|"grammar"] (≤ 4, each once; none or `[]` = all four), minutes: 5\|10\|20\|30, hardOnly?: boolean (Review only), topic?: string ≤ 120 (topic only), voice: boolean, fill?: boolean, asIs?: boolean}` | `200 {session}`: planned; or, for Mix and Discover whose new texts cover under 80% of the text target and without `fill`, a going session with an empty plan and its `offer` (FR-920; stored on the row, FR-923) · `409 short` (a Review plan under 80% without `fill` or `asIs`: the page offers Fill the time, `fill: true`, or Start shorter, `asIs: true`) · `409 nothing_to_do` (still no exercise) · `409 no_voice` (only Listening ticked, or skill listening, without a voice) · `400` (both `skill` and `skills`, a skill twice, a field the kind or tile doesn't take, one it needs missing, or minutes not 5, 10, 20 or 30) |
| `POST /api/session/plan` | `{sessionId: integer, fill: boolean}` | answers the going session's offer: `fill: true` is Practise without (FR-905's filling), `fill: false` is ▶ Start your session (plans again with the texts there are now). `200 {session}` planned, its offer cleared; or, `fill: false` and still short, the same session with its offer (missing minutes and `at` unchanged) · `409 nothing_to_do` · `409 stale` (no offer: already planned, finished or replaced) · `404` |
| `GET /api/session` | – | `200 {session \| null}` (the going one) |
| `GET /api/session?id=N` | – | `200 {session}` one of the learner's sessions, with its summary once finished (the session page after a text that ended it) · `404` |
| `POST /api/session/next` | `{sessionId: integer, index: integer ≥ 0, answer?: Answer}` | `200 {session}` (index done; `answer` kept on the exercise for looking again; a repeated index answers the current state) · `409 stale` (index not the current one or older) · `404` |
| `GET /api/session/exercise?id=S&index=I` | – | RQ-459 (FR-904): a finished exercise looked at again: `200 {index, exercise, answer}` — the exercise as it was first shown (its question frozen then) and the learner's `answer` (or `null`) · `404` (not the learner's session, or `I` not a finished exercise of it) |
| `POST /api/session/leave` | `{sessionId: integer}` | FR-904: ✕ on a session. A going session whose plan was never started (its short-session offer not answered by Practise without and the learner not sent to Add a text by it, so `plan` is empty) is not kept: `200 {kept: false}` and the row is deleted; any other session is kept as it is: `200 {kept: true}` · `404` |
| `GET /api/overview` | – | RQ-463 (FR-901): Home's live counts: `200 {newTexts, due, leaves, yourTexts, commonTexts, level, startOpen, todayMinutes, weekMinutes, week: [7 whole minutes, Monday to Sunday of this week], brandNew}` — `newTexts` the learner's unread ready texts; `due` the due and fading drilled leaves; `leaves` the drilled leaves; `yourTexts` the learner's texts; `commonTexts` the grove texts in `library_texts`; `level` as FR-905 finds it (null for none); `startOpen` the starting level not yet chosen (G-06 FR-605; never for the reviewer); `brandNew` no texts, no drilled leaves and no session ever |
| `GET /api/settings` | – | `200 {speakWords, speechRate}` for the Settings page (FR-910) |
| `GET /api/topics` | – | `200 {topics: [{topic, label, texts: [{id, title, kind, read, beta, own}]}]}` (unread first; own texts under `label: "My own texts"`) |

`session` = `{id, kind, tile, skill, skills: [ticked skills; [] = all] (B-25; an old row: `[]` for mix, else `[skill]`), hardOnly, topic, minutes, label: "10-minute Mix" \| "5-minute Review" \| "10-minute Mix: Food and drink" …, index, total, minutesLeft, secondsLeft, seconds (the plan's), exercises: [{skill, type, seconds, done, title?}] (the start screen's list and the session bar's segments, RQ-457), short: bool (planned below the length, with the reason), status, offer: Offer \| null, exercise: Exercise \| null, summary: Summary \| null}` (addendum 006; old sessions: tile and skill as migration 017 filled them; the label is the tile's name when they had no length)

`Offer` = `{needs: ["reading" \| "listening"], missing: {reading, listening}, added: {reading, listening}, full: boolean}`: whole minutes (missing rounded up, added down) of new texts missing per kind at the offer, and of the learner's texts of each kind created since it, wherever they were added, at FR-905's durations; `needs` lists the kinds the skill uses that were missing; `full` when every needed kind's added reaches its missing (FR-920). A page reached from the offer (`?from=session`) asks `GET /api/session` and shows "‹ Back to your session" (to `/session`) only while that session has an offer (FR-923).

`Exercise` = `{mode: "discover"\|"review", type, skill, minutes, seconds, textId?, title?, textKind?, again?, question?}`, where `question` is G-04's review item shape (`{lemma, kind, mode, sentence?, word?, meaning?, options?, right?}`). A harder question is `mode: "review", type: "master"`; an old plan's `mode: "master"` shows as review. B-26 (FR-928, FR-929), all `mode: "discover"`:
- `type: "words"`, `words: [{id, lemma, pos, en, level, example: {sv, en}}]` (1–4 cards);
- `type: "phrase"`, `phrase: {id, phrase, en, note, level, examples: [{sv, en}], choices: [3 strings], right: index}`;
- `type: "grammar"`, `learn: boolean` (true: the pattern of the day, Learn then Spot it; false: Spot it of an earlier pattern), `pattern: {id, level, name, explain, howToSpot, examples: [{sv, en, mark}], text: {title, lines: [{sv, en}]}, spot: [{line, mark}]}`.
An item no longer in the content is left out of its exercise; an exercise left with nothing shows Next only.

RQ-457…RQ-459 (FR-904, FR-912, FR-932, FR-933): every exercise names its `skill` (`review` for Review items, harder questions and practice reviews; `reading` / `listening` for a text by its kind, `type: "reread"` and `"listen"` with `again: true`; `words` for Words and phrase exercises; `grammar`), and its `seconds` (FR-905's duration; the kicker shows seconds under a minute, half minutes above). A text exercise adds `textKind`; its words, questions and rating come from G-03's `GET /api/reading` and G-02's `/api/question` and `/api/rating` as on the text page. The `question` of a Review item adds `sentenceEn` (the English of the sentence's line, shown after answering; G-04's question builder). The exercise is **frozen when first shown**: the first `GET /api/session` that shows it stores it on the plan, so looking again shows the same question.

`Answer` (kept on the exercise by `POST /api/session/next`, ≤ 2 KB): `{picks?: [integer 0–3] (≤ 2: the first pick and, after a wrong one, the second), cards?: ["know" \| "pick"] (≤ 4, a Words exercise's cards in order), picked?: boolean (the phrase picked up), taps?: [integer 0–999] (≤ 100, Spot it's tapped words by their place in the text), knew?: boolean (a recall card)}`; unknown fields `400`. **One more try** (FR-932 (5)): the client sends Review and harder questions to G-04's `POST /api/review` once, after the second pick, with `right: false` whenever the first pick was wrong.

`Summary` = `{minutes, textsRead, textsHeard, wordsReviewed, pickedUp, patternsMet, wordsFell, daysThisWeek}` (RQ-457, FR-904): `textsRead` / `textsHeard` the session's new reading / listening texts done (read again and listen again never count, FR-933); `pickedUp` the words and phrases first drilled between the session's start and end (`words.picked_at`); `patternsMet` the patterns first met then (`learning_seen`); the page shows only the lines above 0.

Answers to Review and Master questions go to G-04's `POST /api/review` unchanged.

## Progress (B-27; FR-924, FR-925)

| Method, path | Body | Responses |
|---|---|---|
| `POST /api/input` | `{seconds: 30, day: "YYYY-MM-DD", kind?: "reading"\|"listening"\|"other"}` (G-04's route; `kind` defaults to `other`) | `200 {todayMinutes}` |
| `GET /api/progress` | – | `200 {today: {minutes}, level: {start, startAt, now, coverage: [[level, percent]]}, week: [{day, read, listen, readWords, listenWords}] (7, ending today), last7: {read, listen, readWords, listenWords}, leaves: {words, patterns, weekWords, weekPatterns, everWords, everPatterns, recent: [{lemma, en, kind, at}]}, ground: {words, patterns, weekWords, weekPatterns, fromStart, fromReading, fell, recent: [{lemma, en, kind, at}]}, ever: {read, listen, readWords, listenWords, since}}` — minutes whole, words whole; `recent` at most 10 |


## Words and Grammar (B-26; FR-928…FR-931)

`item` is a `learning_items` ID (`G-A1-01`, `P-A1-01`, `W-<dictionary form>`), a string of 1–80 characters; any other is `404 not_found` (T-24). All change only the signed-in learner's data and pass the CSRF check.

| Method, path | Body | Responses |
|---|---|---|
| `POST /api/learning/answer` | `{item, action: "know"\|"pick"}` | a word or phrase (and, `pick` only, a grammar pattern from the word menu, FR-305, picked up by its name with its explanation, not marked met): `know` adds it to the learner's ground (a word only; `400` for a phrase), `pick` makes it a drilled leaf To remember, due now (G-04 FR-411); both mark it shown. `200 {state: "ground"\|"leaf"}` · `404` (not a word or phrase item) |
| `POST /api/learning/seen` | `{item}` | a phrase shown (Next), or a pattern met (Spot it checked). `200 {}` |
| `POST /api/learning/report` | `{item, reason: "wrong_meaning"\|"bad_translation"\|"unnatural"\|"wrong_mark"\|"audio"\|"other", note?: string ≤ 200}` | `200 {}`; kept for the owner (`npm run reports:show`) |

The reading payload of `GET /api/reading` (G-03) adds `ladder: [{id, level, name, explain, state, drilled}]` and, on each word token, `ladder: [ids]` (FR-305's Patterns section; a pattern is picked up as `kind: "pattern"` with its name, as the text's patterns are).
