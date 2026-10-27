# Addendum 004: a new Home, sessions and palette 14

**Date:** 2026-10-27

The owner's-test group "Home, pages, terms, help" (O-02, O-03, O-05, O-06; [notes](../reviews/2026-10-25-owner-test.md); decisions on question-pages/64 and 74; mock-ups in [reviews/2026-10-26-home-v2](../reviews/2026-10-26-home-v2/)). No new needs: every requirement here meets needs that already exist. It is risky because sessions are new behaviour (grove plans what the learner does for a given time), built in the last days before the deadline, and because it replaces the look's colours (Appendix A.1) and the Home of G-01…G-08.

Built as a new goal, **G-09 Home, sessions and the new look** (`specs/009-home-sessions`).

## Requirements

Same columns as [requirements.md](../requirements.md).

| ID | Requirement | Sources | Rewords or merges? | Needs | Feasibility | Priority | Status |
|---|---|---|---|---|---|---|---|
| RQ-419 | Home is a grid of square tiles, each showing only an icon; tapping one opens it in place across the grid with its title, a short explanation and a way in, pushing the rest down. The tiles are the navigation: Resume (only while a session is going), Practise for X min, Texts, By skill, Dictionary, Just one mode, Progress. | O-06; question-pages/74 (4, 11, 12) | yes (layout A of question-pages/64, 15; the Home of G-02 FR-201, G-04 FR-407, FR-414, FR-415) | N-34, N-19, N-39 | easy | must | active |
| RQ-420 | The header has the logo, which goes Home, and a ☰ menu with Account, Settings, Help and Sign out; help opens as a bubble over the page. | O-02, O-05; question-pages/64, 74 (9, 11) | yes (G-01 FR-014's email and Sign out in the header; G-08 FR-802's logo tap, FR-804's help page) | N-34, N-17, N-25 | easy | must | active |
| RQ-421 | **Practise for X min**: the learner picks a length and grove plans a session that fits it, mixing Discover (new texts), Review and Master from items whose durations it knows; grove sets the order; one exercise shows at a time, with "10-minute session · 3 of 8 · about 6 min left" and a progress bar; a session can be left and resumed. | question-pages/74 (5, 6, 11) | no | N-19, N-39, N-32, N-42 | medium (planning by duration is new) | must | active |
| RQ-422 | **Texts**: the learner's topics, each with its texts, and new texts from the learner's AI (two dropdowns, AI and version, above a wizard whose steps are the prompting phases) or their own; a session by topic mixes its texts and the words met in them. The shared library's texts are shown per topic when it comes. | question-pages/74 (2, 7, 10, 11) | yes (RQ-403's menus and tabs move into the Texts tile; RQ-418's own-texts page is part of it) | N-41, N-15, N-42, N-39 | medium | must | active |
| RQ-423 | **By skill**: reading, listening, words and phrases, or grammar, each in a short, medium or long form; the long form has the highest share of known words and the short form the lowest; the session still mixes the modes, weighted to the skill. | question-pages/74 (8) | no | N-37, N-13, N-44 | medium | must | active |
| RQ-424 | **Just one mode**: a lesson of only Discover, only Review or only Master, from its own tile. | question-pages/74 (6, 11) | no (G-04's Review and Master become this) | N-07, N-39 | easy | should | active |
| RQ-425 | Every exercise card in a session has a plain green banner with two chips in the card's colour: the mode's icon (sprout, circle arrow, mountain) and name, and its minutes, both in the mode's colour, in sentence case. | question-pages/74 (13–15) | no | N-34 | easy | should | active |
| RQ-426 | grove's colours are palette 14 in both looks (spruce greens on sad beige; modes warmer and darker from Discover to Master: caramel, chestnut, dark bark), replacing Appendix A.1's colours; the word colours (To remember, fallen) are matched to it. | question-pages/74 (13–15); the owner's colours | yes (Appendix A.1, RQ-306, RQ-312, RQ-334, RQ-335) | N-34, N-11 | easy | must | active |
| RQ-427 | Settings holds speech speed and the voice help, Speak words, and the starting level; the Account page holds the email and how to ask for an export or deletion. | question-pages/74 (1, 9) | no | N-19, N-17, N-20 | easy | should | active |
| RQ-428 | A new sign-in reads the terms one section per screen; each Next unlocks after about 3 seconds; one Agree at the end confirms being 13 or over and the terms. | O-03; question-pages/64 (2, 3) | yes (G-01 FR-011's two boxes and Agree) | N-27, N-28, N-25 | easy | must | active |

## Why it's risky

- **R-24:** a planned session runs well over or under its length because the durations are guesses (a text's minutes from its word count, a review's seconds). Test: plan 5, 10 and 20 minutes on the demo account and compare the planned minutes with the items' durations; time a real session by hand.
- **R-25:** the deadline: four parts of new behaviour plus the queued Dictionary and addendum 003 work don't fit in 5 days (question-pages/74, 17). Mitigation: the order of work decided there; the deploy moves after the Home.
- **R-26:** a new palette breaks contrast somewhere (mode colours on chips, muted text). Test: the look tests check contrast of text on its background in both looks (WCAG AA, 4.5:1 for body text, 3:1 for large text and chips).

## Decision

Accepted with the owner's answers (question-pages/74). Specified as G-09 with Spec Kit; Spec Kit's clarify step settles the details question-pages/74 left open (durations, minute choices, the known-word shares of short, medium and long, the Account page).
