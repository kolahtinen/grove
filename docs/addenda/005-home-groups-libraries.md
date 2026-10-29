# Addendum 005: Home in three groups, the two libraries, a clearer start

**Date:** 2026-10-29

The owner's test of the G-09 branch ([notes B-01…B-09](../reviews/2026-10-29-branch-test.md); decisions on [question-pages/77](../../question-pages/77-branch-test-notes.md)) and the confirmed provisional decisions ([question-pages/76](../../question-pages/76-provisional-decisions.md); background in [provisional-decisions.md](../provisional-decisions.md)). No new needs: every requirement here meets needs that already exist. It is risky because it changes how a learner signs in (the constitution's rule 3.1) and reshapes Home and Texts again three days before the deadline.

Built inside **G-09** (`specs/009-home-sessions`), with changes to G-01 FR-011, G-04 FR-413 and G-06 (the starting level).

## Requirements

Same columns as [requirements.md](../requirements.md).

| ID | Requirement | Sources | Rewords or merges? | Needs | Feasibility | Priority | Status |
|---|---|---|---|---|---|---|---|
| RQ-429 | Home is one page of labelled icon tiles in three headed groups: **Learning** (Practise for X min, By skill, Just one mode; Resume first while a session is going), **Library** (Common library, Your library) and **Progress**. | B-04; question-pages/77 (3, 8); question-pages/76 (2) | yes (RQ-419's single grid with icons only) | N-34, N-39, N-19 | easy | must | active |
| RQ-430 | **Your library** holds the learner's own texts by topic (with Start a session), **Add a text**, **your dictionary** (the words met in the learner's texts) and **your leaves**. | B-04, B-05; question-pages/77 (6, 8, F1) | yes (RQ-422's Texts page; the Dictionary and Leaves links of Home) | N-41, N-07, N-38 | easy | must | active |
| RQ-431 | The **Common library** holds grove's shared texts by topic, each showing its level, with a level filter that shows every level up to the chosen one (the learner's level by default), and the **common dictionary**. | B-04; question-pages/76 (17, 18); question-pages/77 (8) | yes (RQ-422's "shared library per topic when it comes") | N-41, N-13, N-01, N-14 | medium | must | active |
| RQ-432 | The **common dictionary** searches grove's whole Swedish word list with each word's English meaning and level; a word can be added as a leaf. | B-04; question-pages/77 (4) | no | N-45, N-38, N-21 | easy | should | active |
| RQ-433 | A new learner gets a level at sign-up: they **pick one** (A1…C1, each with a one-line description) or **take the starting check**; either can be redone from Settings. | B-02; question-pages/77 (2) | yes (RQ-248's starting check offered once) | N-13, N-16, N-36 | easy | must | active |
| RQ-434 | Starting a session with no unread text first offers **Pick from the common library** (the learner's level first), **Add a text** or **Practise without a text**; a picked text joins the learner's library and the session starts with it. | B-03; question-pages/77 (5) | no | N-39, N-01, N-13 | medium | should | active |
| RQ-435 | **Add a text** is one page with the two ways side by side, each with a short explainer (what it does, how long it takes, what grove does with the text), each leading to its own page: **Texts from your AI** and **Your own text**. | B-05, B-07; question-pages/77 (6) | yes (RQ-422's New texts on the Texts page; RQ-418's own-text page) | N-25, N-26, N-19 | easy | must | active |
| RQ-436 | **Texts from your AI** is a wizard: an always-visible step list (done ✓, now ●, next ○), one step per screen with one main button and Back, a confirmation after every action (copied, answer read, texts added with their titles); grove chooses the tactic from the learner's AI and offers another only after failures. | B-06, B-08, B-09; question-pages/77 (7) | yes (RQ-403's tactic tabs, RQ-422's wizard card) | N-26, N-25, N-15 | medium | must | active |
| RQ-437 | The terms are agreed at sign-up, at the first sign-in on each new device, and again when the terms change; grove stores which version each agreement was to. | B-01; question-pages/77 (1); question-pages/76 (16) | yes (RQ-228 "at each new sign-in"; RQ-428 keeps the screens) | N-27, N-28, N-24 | medium | must | active |
| RQ-438 | The common library holds **grove texts**: texts grove provides, approved by the owner, belonging to no learner, each with its topic and level; a learner adds one to Your library, where it is marked "grove text", never Beta. The first 50 (A1–C1, ten per level, written by Claude) were approved by the owner as they stand. | B-11; question-pages/76 (17, 18) | yes (RQ-431's "texts coming") | N-41, N-13, N-01, N-14, N-43 | easy | must | active |
| RQ-439 | **Add a text** has a third way, **From the common library**, beside Texts from your AI and Your own text. | B-10 | yes (RQ-435's two ways) | N-41, N-19, N-15 | easy | must | active |

The confirmed provisional decisions (PD-02…PD-05, PD-07, PD-10…PD-14, PD-16, PD-28 with F1) set values inside existing requirements (RQ-421, RQ-423, RQ-425, RQ-426, RQ-428) and need no new ID.

## Why it's risky

- **R-27:** a learner signs in on a device that grove wrongly takes as known, and uses grove without having agreed (constitution 3.1). Test: a sign-in without the device cookie, with another account's cookie, with a forged cookie, and after the terms version changes all show the terms screens.
- **R-28:** the device cookie is a lasting identifier in the learner's browser. Mitigation: it holds only a random value, is HttpOnly and SameSite=Lax, is stored hashed with the agreement, and the privacy notice says so; clearing it only means agreeing again.
- **R-29:** searching the whole word list (57,961 headwords) is slow on the owner's computer. Test: a search answers within G-01 Q-05's 0.5 s.
- **R-30:** the deadline (R-25 again): Home and Texts change a second time. Mitigation: Publish to library (the owner's lessons) stays a later feature; the 50 approved grove texts are imported as data (B-11).
- **R-31:** the 50 grove texts were approved without a Swedish speaker's line-by-line read (B-11), so some may have mistakes. Mitigation: they are marked "grove text"; G-03's Report on the reading page reaches the owner; the owner's later reading fixes them in `content/library/`.

## Feasibility

Everything reuses what exists: the tiles and panels (FR-901), the sessions planner (FR-905), the lexicon (G-03), the starting check (G-06), the terms screens (FR-911). New: one table for device agreements (migration 015), a terms version constant, a level-pick page, a search route over the lexicon. Medium for RQ-431, RQ-434, RQ-436 and RQ-437; easy otherwise.

## Decision

Accepted with the owner's answers (question-pages/76, 77). Specified in G-09 (FR-901, FR-904, FR-905, FR-906, FR-909, FR-911…FR-913, new FR-915…FR-921; FR-916, FR-918, FR-920 again for RQ-438, RQ-439 after B-10, B-11), G-01 FR-011, G-04 FR-413 and G-06 FR-605; constitution 3.1 amended (2.0.0).
