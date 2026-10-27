# Research: Home, sessions and the new look (G-09)

Decisions for the plan. Background research for the owner's open questions is in [provisional decisions](../../docs/provisional-decisions.md) (PD-01…28, with sources); this file cites it as PD-nn.

## R1. Where a session lives

- **Decision**: on the server, in a `sessions` table: one row per session with its kind, length, parameters, the planned exercises as a JSON array, the index reached and a status (`going`, `finished`, `replaced`); a partial unique index allows one `going` session per account. Starting a session marks the going one `replaced` in the same transaction.
- **Rationale**: FR-904 says the session is kept on the server with no time limit and resumed from any device; the reviewer account is shared, and "last started wins" falls out of the unique index. A plan is small (at most about 60 exercises), so a JSON column keeps it in one read and write; nothing queries inside it.
- **Alternatives**: a row per exercise (more joins, no gain); browser storage (lost across devices, against FR-904).

## R2. The planner

- **Decision**: a pure function `plan({ kind, minutes, params, inventory, durations })` in `server/sessions/plan.mjs`, given an inventory read beforehand (`inventory.mjs`): drilled leaves with their strength (G-04's `schedule.mjs`), Master leaves (gap ≥ 2 days), texts with kind, word count, read or not, topic and known share now. FR-905's order: Review of fading then due leaves up to 40% of the length; one Discover text that fits what is left (new or unfinished; the kind done less in the last 7 days); Master to fill; then **(pending PD-28)** the fill rule below. Ties broken by id, so a plan is the same for the same data (tests).
- **Measured (2026-10-27, demo account: 4 texts, 2 unread; 6 drilled leaves, 4 due; 1 Master leaf)**, with throwaway code in the session scratchpad:

  | Length | FR-905 as written | With the fill rule (PD-28) |
  |---|---|---|
  | 3 min | 2.6 min ✓ | 2.6 min ✓ |
  | 5 min | 4.3 min ✓ | 4.3 min ✓ |
  | 10 min | 4.3 min ✗ | 8.0 min ✓ |
  | 20 min | 4.3 min ✗ | 16.6 min ✓ |
  | 30 min | 4.3 min ✗ | 18.0 min (short; says so) |

  FR-905 as written fails SC-001 at 10 and 20 minutes on the demo account: it has only so much due and new. **PD-28's fill rule**: after Master, fill with the next unread texts that fit, then re-reading texts already read (oldest first, no marking step), then listening to texts already read; stop at 80% of the length, never past 120%. Re-reading and listening again are comprehensible input the learner has already been through, which is what extensive reading recommends for easy input; they count as Discover in the banner.
- **Alternatives**: more Master items (the demo has one); reviewing leaves that aren't due (would change G-04's schedule logic, which sessions mustn't touch); a shorter plan that says so (kept for when even the fill runs out).

## R3. Durations

- **Decision**: FR-905's numbers as constants in `server/sessions/durations.mjs`: reading 100 words a minute (**70 below B1, pending PD-02**), listening 80, Review 20 s, Master 25 s, a marking step 30 s (only after a first reading). A text's words are counted from its sentences with G-02's tokenizer.
- **Rationale**: clarified on question-pages/75 (1); one file to change after SC-004's timed session.

## R4. Known share at planning time

- **Decision**: By skill's Short/Medium/Long (FR-906; **bands pending PD-04**) use each candidate text's share of known words **now**, counted with G-02's counter (`words.counterFor`) over its sentences, not the stored `texts.known_share` (only own texts have it, and it ages as the learner learns).
- **Measured**: the counter built in 3.2 ms (demo ground, about 400 words); 3,050 sentences counted in 54 ms, about 200 texts' worth. Only unread texts of the skill's kind are counted, so planning stays under 100 ms.

## R5. Running the exercises

- **Decision**: `GET /api/session` returns the going session and its current exercise; a Review or Master exercise carries its question, built when shown by G-04's question builder (so a word that fell or changed since planning still gets a valid question, FR-904); the answer goes to G-04's `POST /api/review` as today; then `POST /api/session/next {sessionId, index}` marks it done and moves on (idempotent by index, so a double tap or a second device can't skip one). A text exercise opens `/text?id=N&session=1`: the reading page shows the session bar and, at the text's end (after marking, or the end of listening), calls `/api/session/next` and returns to `/session`.
- **Rationale**: drill keeps every schedule rule; the reading page stays the one place texts are read (FR-904's one exercise at a time still holds: the reading page *is* the exercise).
- **Alternatives**: embedding the reading page in the session page (a 630-line page duplicated or iframed; worse on phones).

## R6. Just one mode as a session

- **Decision**: FR-908's lessons are sessions of kind `mode` with no length: Review takes the due and fading leaves (G-04's batch of 10), Master its 10, Discover the next unread text. They use the same session page and cards. `/review?mode=…` stays as a link target and opens the same.
- **Rationale**: "the same one-at-a-time cards" (FR-908) and one Resume for everything.

## R7. Tiles (pending PD-07, PD-08, PD-10, PD-11)

- **Decision**: each tile is a `<button aria-expanded aria-controls>` with an accessible name and an inline SVG icon; one panel element is moved after the last tile of the opened tile's row (row found from the grid's computed column count); opening moves focus to the panel's title; Esc, ✕ or the tile again closes it and returns focus to the tile. With `prefers-reduced-motion`, no height animation. Tiles and ☰ ≥ 44 px.
- **Rationale**: W3C's disclosure pattern; the panel sits after the row, not after the tile, so focus has to move (PD-07).

## R8. Help bubble

- **Decision**: ☰ → Help fetches grove's own `/how`, takes its `<main>` with `DOMParser` and shows it in a dialog with ✕ and the animation's Replay; `/how` stays the one source.
- **Alternatives**: a copy of the content in a module (two sources to keep equal).

## R9. Palette and contrast (pending PD-12, PD-13, PD-14)

- **Decision**: palette 14 as custom properties on `:root` and `[data-theme=dark]`/`prefers-color-scheme` in `grove.css`; no colour literal elsewhere in the CSS. A browser test visits every page in both looks, and for every element with its own text computes the WCAG ratio of its colour against its nearest opaque background (4.5:1; 3:1 for text ≥ 24 px or ≥ 18.66 px bold, and for chips). A unit test reads the tokens from `grove.css` and checks the named pairs (text on page, on card, muted, the mode colours on the card colour, white on the banner).
- **Rationale**: R-26; PD-12 found three of palette 14's chosen colours below 4.5:1 as chip text, so the test is needed, not just a one-off check.

## R10. Terms one section per screen

- **Decision**: `terms.html` shows G-01 FR-025's sections one at a time; Next enables after 3 s (a client timer; nothing to check on the server); the last screen's one Agree, labelled "I am 13 or over and agree to the terms", sends G-01's `{agreeTerms: true, confirmAge13: true}` to the existing route. **Pending PD-16**: storing a terms version with the agreement (a column on the agreement row) would be one more migration line.
- **Rationale**: no server change for constitution 3.1; the agreement still records both.

## R11. Texts page by topic

- **Decision**: `GET /api/topics` groups the learner's texts by `texts.topic`; own texts (topic empty) go under "My own texts". The prompting part (AI and version, tactic tabs, steps) moves from `home.mjs` to `texts.mjs` unchanged, calling the same G-02 routes. **Pending PD-17**: the library's texts per topic with a level filter come with the library.

## R12. Listening without a Swedish voice

- **Decision**: the session page sends `voice: true|false` when starting (the browser knows, the server doesn't); with no voice, the planner leaves listening texts and spoken reviews out, and By skill → Listening answers 409 `no_voice` so the tile can show the voice help (G-05 FR-501).
