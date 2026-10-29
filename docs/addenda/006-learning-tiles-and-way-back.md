# Addendum 006: Learning as Discover, Review, Mix; the way back to what you were doing

**Date:** 2026-10-29

The owner's second test of the G-09 branch ([notes B-12…B-18](../reviews/2026-10-29-branch-test.md), round 2), decided on [question-pages/79](../../question-pages/79-learning-tiles.md) (B-12…B-14) and [question-pages/80](../../question-pages/80-library-return-and-back.md) (B-15…B-17); B-18 was decided in the note itself. It is risky because it reshapes Learning a third time, changes what the sessions planner is asked for, and lands two days before the deadline (R-25, R-30).

Built inside **G-09** (`specs/009-home-sessions`), with a change to G-06 (the starting level).

## Need

**N-46**: Learners need to find their way around grove and back to what they were doing without getting lost.

From B-15, B-16 and B-17: the owner lost the session when going to the common library, and the text when opening one ("how do you know what back means"). No existing need covers it; N-19 (flexibility) and N-34 (enjoyable) touch it only from the side. Every other requirement here meets needs that already exist.

## Requirements

Same columns as [requirements.md](../requirements.md).

| ID | Requirement | Sources | Rewords or merges? | Needs | Feasibility | Priority | Status |
|---|---|---|---|---|---|---|---|
| RQ-440 | **Learning** has three labelled tiles: **Discover** (new texts), **Review** (what is being drilled) and **Mix** (both). Tapping one offers **Start** (10 minutes, all skills mixed) and **Options…**: skill (Mix · Reading · Listening · Words · Grammar) and length (5 · 10 · 20 · 30 minutes). | B-12, B-13, B-14; question-pages/79 (1, 3) | yes (replaces RQ-421's Practise for X min, RQ-423's By skill with its short, medium and long forms, RQ-424's Just one mode and RQ-429's Learning tiles) | N-39, N-07, N-19, N-37 | medium | must | active |
| RQ-441 | **Master is part of Review**: its harder, reversed questions come in Review sessions for words the learner knows well; Review's Options… also offer **Harder questions only**. The exercise card's banner says Review. | B-14; question-pages/79 (2, 3) | yes (RQ-06's Master stage is no longer chosen on its own; RQ-424, RQ-425) | N-35, N-04, N-38 | medium | must | active |
| RQ-442 | While a session is going, a **Resume** bar sits above the Learning tiles ("▶ Resume: 10-minute Mix · 3 of 9"). | B-14; question-pages/79 (4) | yes (RQ-419's and RQ-429's Resume tile) | N-19, N-46 | easy | must | active |
| RQ-443 | Each topic in **Your library** and the **Common library** has **Practise this topic**, which starts a 10-minute Mix on that topic. | B-14; question-pages/79 (5) | yes (RQ-422's and RQ-430's Start a session per topic) | N-41, N-07 | easy | should | active |
| RQ-444 | When a session is short of material and the learner goes to the common library, two bars, **Listening** and **Reading**, show how many minutes of each are still needed (only the bars the session's skill uses: Reading → Reading, Listening → Listening, Mix, Words and Grammar → both) and fill as texts are added; the list opens showing the kinds still needed (✕ Show all). When both are full they turn into **▶ Start your session**; tapping them earlier returns to the session. The bars stay on a text opened in full. They appear only when a session sent the learner. | B-15; question-pages/80 (1, 2, 3, 6) | yes (RQ-434's short-session offer) | N-39, N-37, N-19, N-46 | medium | should | active |
| RQ-445 | Every common-library text shows its kind (listening or reading) and its **length in minutes**; each row has **+ Add**, which adds the text to Your library without leaving the list. Tapping the title opens the full text, which also has + Add. | B-16; question-pages/80 (3, 4, 6) | yes (RQ-431's and RQ-438's list, where opening a text left the list) | N-41, N-13, N-19, N-46 | easy | must | active |
| RQ-446 | **The way back**: every page except Home has a link at the top naming the page it belongs under ("‹ Library", "‹ Learning", "‹ Home"), always going there; when a task sent the learner elsewhere, the link is "‹ Back to your session" (or to the task) instead; the phone's or browser's Back goes to the previous page; Back, Esc or ✕ close an open menu, sheet or bubble before leaving a page; in a wizard, ‹ Back is the previous step. | B-17; question-pages/80 (5) | no | N-46, N-34 | easy | should | active |
| RQ-447 | The starting level first asks **Pick my level** or **Assess my level**. Assess starts the starting check. Pick lists the levels (A1…C1, each with one line); tapping one highlights it without applying it, and two buttons below offer **Choose** (applies it) and **Not sure, assess** (starts the check). | B-18 | yes (RQ-433's per-level "Use this level / Check my level") | N-13, N-16, N-36 | easy | must | active |

## Why it's risky

Other: the deadline (two days left), and a third change to Learning and the sessions planner. No new outside service, cost, personal data or legal question.

## Risks

| ID | Failure scenario | Cost | Likelihood | Technique |
|---|---|---|---|---|
| R-32 | A Discover, Review or Mix session at some skill and length plans much less than its length (as the planner did before PD-28's fill rule), for example a 20-minute Listening Discover on an account with few listening texts. | high | medium | Test: every tile × skill × length on the demo account fills within SC-001's margin or gives the short-session offer (RQ-444). |
| R-33 | With Master inside Review, well-known words never get the harder questions, or Review fills up with them and due words wait. | medium | medium | Test: a Review session on the demo account has its harder questions only for well-known words and never at the cost of a due word; Harder questions only has only those. |
| R-34 | The fill bars count minutes differently from the planner: the bars are full, Start is tapped, and the session is still short (or the other way round). | medium | medium | The bars and the planner use one duration estimate. Test: after filling the bars exactly, Start plans the full length. |
| R-35 | "‹ Back to your session" stays after the session ended or was left, or is lost on reload, so the link goes to a dead or wrong place. | medium | medium | The return is tied to the session on the server, not stored in the page. Test: reload keeps it; ending or abandoning the session removes it; every page's parent link matches the page map. |
| R-36 | The deadline (R-25, R-30 again): Learning is not done by 1 November and the deploy slips. | high | high | Accepted by the owner (question-pages/81, 3): all of addendum 006 is built before the deploy, even past 1 November. The replaced tiles stay working until the new ones pass their tests. |
| R-37 | A learner picks a level well above their own and gets texts that are too hard. | low | medium | Each level has its one-line description; Not sure, assess is always beside Choose; the level can be changed or checked again from Settings (RQ-433). |

## Feasibility

- **Technical:** Everything reshapes what exists: the tiles and panels (FR-901), the planner with its skill weighting and modes (FR-905, FR-906), the common library list and import (FR-916, FR-918), the short-session offer (FR-920), the starting check (G-06). New: a session's "return" link on the server, the bars (a sum of the added texts' minutes against the planner's shortfall), and a page map for the parent links. Master inside Review changes the planner's mode choice, not its exercises.
- **Cost:** none (no outside service).
- **Time:** about a day and a half of build and test in G-09 and G-06; the deadline leaves two. Tight.
- **Skills:** the same as the first build.
- **Legal:** nothing new; the bars and the return link hold no personal data beyond the session that already exists.
- **Rating:** medium (RQ-440, RQ-441, RQ-444); easy otherwise.
- **Reduced version of the requirement:** proposed: RQ-441 without **Harder questions only**, as it needs its own planner path and tests. Not used: the owner chose to build it now (question-pages/81, 2).
- **Sources:**
  - Android, "Principles of navigation" (checked 2026-10-29): "Within your app's task, the Up and Back buttons behave identically"; "the Up button never exits the app. The Back button, however, is shown and does exit the app." https://developer.android.com/guide/navigation/principles
  - MDN, manifest `display` (checked 2026-10-29): in `standalone` mode (grove installed on a home screen) "the browser will exclude UI elements such as a URL bar"; only `minimal-ui` "typically include[s] navigation controls like back". So an installed grove can't rely on a browser Back button: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/display
  - Apple Human Interface Guidelines, "Toolbars" (formerly "Navigation bars"): the back button carries the previous screen's title. Not re-checked today (the page needs scripts to load); from the earlier research for B-17. https://developer.apple.com/design/human-interface-guidelines/toolbars

## STRIDE (new components or connections)

| ID | Component | STRIDE | Threat | Mitigation | Goes to |
|---|---|---|---|---|---|
| T-23 | The session return link ("‹ Back to your session", the fill bars) | Tampering, spoofing | A crafted link carries a return address that sends the learner to another site (open redirect) or to another learner's session. | The return holds a session ID, never a URL; the server checks the session belongs to the signed-in learner and is still open, and builds the link itself. | requirement (FR in G-09) |
| T-24 | + Add from the common library list | Elevation of privilege | A request to + Add with the ID of another learner's own text copies it into the attacker's library. | + Add accepts only IDs of grove texts in the common library (RQ-438); every other ID is refused. Same CSRF check as every changing request (FR-022). | requirement (FR in G-09) |

## Decision

Accepted with the owner's answers ([question-pages/81](../../question-pages/81-addendum-006.md)): N-46 added; RQ-440…447 active; Harder questions only built now; only the fill bars the session's skill uses; all of it before the deploy, even past 1 November. Specified 2026-10-29 in G-09 (FR-901, FR-903…FR-908, FR-912, FR-915, FR-916, FR-920, new FR-922, FR-923; SC-001, new SC-006…SC-008) and G-06 FR-603 (Assess asks for a guess first, question-pages/82). B-20 (the short-session offer has two choices, Add a text and Practise without) applied to FR-920 with it.
