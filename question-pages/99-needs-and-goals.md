# 99 — Needs and goals

Answer page: https://claude.ai/artifact/KzV5fKiAucpBKxCGB7i5Nv (published 2026-10-31)

**Date:** 2026-10-31

**Purpose:** a big needs-and-goals round for the course report (`docs/report/report.md`, template sections 1.1, 2.1, 2.2 and 7), now that the requirements are close to finished. It settles the stakeholders and which are primary, the core need and grove's vision in the owner's words, a review of every active need (still right? met by the first build fully, partly, not, or later?), overlapping needs to withdraw, needs revealed since the freeze (addenda, B-01…B-33), plain learner-side names for the user goals G-01…G-09 and which needs each serves, and the 3–5 needs that matter most with how each is checked (validation).

**How it is answered:** on an answer page (`question-pages/99-needs-and-goals.html`, published as an artifact; answers saved to its database, doc `answers/round1`), as in question-pages/84. A blank answer means the named default. Tick-lists: tick the items that need input; unticked items are accepted as drafted. Every question has an optional note. Needs are never edited or deleted: a wrong need is withdrawn with a reason, and a new wording becomes a new need (N-47 on).

**Questions:** 70 (Stakeholders: 7; The core need and the vision: 4; Needs review: 22; Needs found since the freeze: 12; User goals: 13; Priorities and how they are checked: 10; For the reflections: 2). Q60–Q67 show only for the needs picked in Q59.

Sources: `docs/needs.md`, `docs/middle-steps.md` (User goals), `specs/009-home-sessions/spec.md`, `docs/requirements.md`, `docs/middle/constraints.md`, `docs/addenda/001…006`, `docs/reviews/2026-10-29-branch-test.md` (B-01…B-33), `docs/report/owner-notes.md`, `docs/report/report.md`.

## Terms used on the page

- **Leaf**: a word, phrase or grammar pattern you have met but don't know yet; **picking it up** makes grove drill it.
- **Ground**: what you know; new texts are written mostly from it. A leaf you know **falls** to the ground.
- **Discover / Review / Mix**: sessions with new texts and words / drilling the leaves that are due / both.
- **Common library / your library**: grove's own texts / the texts you added.
- **Word menu**: what opens when you tap a word in a text (meaning, dictionary form, patterns).
- **First build / second build**: what is built now (G-01…G-09) / what was planned for right after.
- **Withdrawn**: a need that stays in the table, marked wrong, with the reason.

## Stakeholders

For the report's section 2.1. A stakeholder is anyone affected by grove or able to affect it: the people who use it, build it, judge it, or whose work it uses. The report's table lists six today: the learner, the owner (you), the course reviewers, the authors of open data (Wiktionary, the Kelly word list), teachers and parents of under-13s (left out of the first build), and outside AI chats. Here you confirm them, add missing ones and say which are primary.

### Q01. How should the report describe the learner? (learner)

One choice.

- **A** Adults learning a language on their own — Grown-ups who learn without a teacher. Swedish is only the first language grove carries; the learner is not defined by it.
- **B** Adults learning Swedish on their own — Narrower: matches the first build exactly (Swedish texts, English explanations, C-09).
- **C** Anyone learning a language, alone or in a class — Wider: school students and class learners too, which makes teachers close stakeholders.

**Default:** A: Adults learning a language on their own

### Q02. The report says the first build "allows adults only", but the terms allow ages 13 and over (C-04). Which is right for the report? (C-04, report 2.1)

One choice.

- **A** 13 and over by the terms; invited adults in practice — The terms allow 13+ (Finland's age of consent online). The first build has no sign-up: only you and the course reviewers, all adults, have accounts.
- **B** Adults only (18+) — Change the stated rule to adults. This is a change to C-04 and the terms, not only the report.
- **C** Don't mention age in 2.1 — Leave it to the privacy part of the report.

**Default:** A: 13 and over by the terms; invited adults in practice

### Q03. Which stakeholders are primary? Tick all that are. (default: Learner and Owner) (report 2.1)

Tick all that apply.

- **learner** Learner — Uses grove to learn; most needs are theirs.
- **owner** Owner (you) — Builds, runs and pays for grove alone, on your own computer.
- **reviewers** Course reviewers — At most five people who try the first version by invitation (C-11) and judge it.
- **authors** Authors of open data — The people behind Wiktionary and the Kelly word list, whose licences grove must respect (N-08).

**Default:** learner (Learner), owner (Owner (you))

### Q04. How should the report describe you as a stakeholder? Tick all that apply. (default: builder and runner, course student, first learner) (owner)

Tick all that apply.

- **builder** Builder and runner — You specify, build, host and maintain grove alone (C-10).
- **student** Course student — Your course result depends on the project, so the report and its deadline are your needs too.
- **learner** First and main learner — You tested every build as a learner (the O- and B-notes); your notes are the main validation.

**Default:** builder (Builder and runner), student (Course student), learner (First and main learner)

### Q05. Teachers and parents of under-13s: how do they appear in 2.1? (N-09, N-22, N-23)

One choice.

- **A** In the table, marked "left out of the first build" — Their needs stay recorded (N-09, N-22, N-23); the table says they are not served yet. This is how the report has it now.
- **B** Below the table, as future stakeholders — The table holds only those the first build serves; a line below names these for later builds.
- **C** Leave them out of the report — Only the needs file keeps them.

**Default:** A: In the table, marked "left out of the first build

### Q06. Outside AI chats (ChatGPT, Claude, Gemini, Le Chat) are not people. How should the report treat them and other outside services? (C-08, C-04, C-12)

One choice.

- **A** A separate line: "systems grove depends on" — Below the table: AI chats (they write texts from grove's prompts), Firebase (holds passwords), Cloudflare (the tunnel that makes grove reachable) and the device's voices. Not stakeholders, but outside parties grove relies on.
- **B** Keep AI chats in the stakeholder table — As now: grove depends on how they answer, so they are listed with the people.
- **C** Leave them out of 2.1 — Mention them only in the technology part (2.4).

**Default:** A: A separate line: "systems grove depends on

### Q07. Are any stakeholders missing? Tick the ones to add. (default: none) (missing stakeholders)

Tick all that apply.

- **checker** A Swedish speaker who checks the texts — Nobody has read the library texts and drafted learning content yet as a Swedish speaker (B-26). Such a person would be the one who makes the content trustworthy (N-43).
- **examiner** The course teacher who grades the report — If they are not the same people as the course reviewers who try the app.
- **authority** The data protection authority — Finland's Data Protection Ombudsman, who supervises how grove handles personal data (C-04).
- **aiproviders** The AI companies — Their terms govern the texts their chats write and what learners paste into them (C-07, C-08).
- **none** None: the list is complete

**Default:** None: the list is complete

## The core need and the vision

For the report's section 1.1. The core need is the one need grove exists for; the vision is one line saying what grove is. Both in your words: pick the closest draft and change it in the note. Terms: comprehensible input is reading and listening you can almost fully understand. Your ground is what you know; a leaf is a word, phrase or grammar pattern you have met and picked up to learn; picking it up means grove drills it until you let it fall to the ground.

### Q08. Which draft is closest to grove's core need? (core need)

One choice.

- **A** "A learner needs a lot of reading and listening they can almost fully understand, on things that interest them, so that they pick up the language naturally." — Input only: the practice part (drilling words) is a means, not the core.
- **B** "A learner needs to grow from what they already know: texts they can follow, and the new words they choose made to stick." — Input and practice together, as the report's 1.1 describes grove: each feeds the other.
- **C** "A learner needs a way to learn a language mostly by reading and listening, at their own level and pace, without paying for it." — Puts level, pace and cost into the core.

**Default:** B: A learner needs to grow from what they already know: texts they can follow, and the new words they choose made to stick.

### Q09. Which line says best what grove is? (vision)

One choice.

- **A** "grove grows a language from what you already know." — Close to the tagline "grow from what you know" (RQ-309): every text is mostly words you know, and the new ones you pick up become part of your ground.
- **B** "Free, understandable reading and listening at any level, with the words you choose drilled until they stick." — Says what you get, plainly; longer.
- **C** "A calm place to read and listen your way into a language." — About the feel; says less about how it works.

**Default:** A: grove grows a language from what you already know.

### Q10. Where does cost go: in the core need, or beside it? (N-15, C-01)

One choice.

- **A** Beside it — Free learning is a learner need of its own (N-15), named next to the core; your zero budget is a constraint (C-01), not a need.
- **B** Inside the core need — Being free is part of what grove is for, so it goes into the core statement (as in draft C of Q08).
- **C** Only as a constraint — The report mentions cost only with the constraints.

**Default:** A: Beside it

### Q11. How do reading/listening and practice relate in grove? (input vs practice)

One choice.

- **A** Input first; practice serves it — Reading and listening are the main thing; drilling makes the words you chose stick so the next texts stay understandable.
- **B** Two equal halves — As the report says now: two complementary parts that feed each other.
- **C** Practice first; texts supply it — The drilled words are the core; texts are where they come from.

**Default:** A: Input first; practice serves it

## Needs review

Every active need, in groups of up to four. Tick the ones that need your input; everything left unticked is accepted as worded, with the first-build status drafted next to it. A ticked need opens two small questions: is it still right, and how far does the first build meet it (fully, partly, not, or later = planned for the second build)? Needs are never edited: a wrong one is withdrawn with a reason, and a better wording becomes a new need. N-01, N-14 and N-31 were withdrawn earlier (page 45). The report's 1.1 still cites N-01; it will cite N-42 instead.

### Q12. Reading and listening

Tick the needs that need your input (or "none"). For each ticked need: **still right?** Keep as worded / Withdraw and replace / Withdraw (default: keep); **met by the first build?** Fully / Partly / Not / Later (default: as drafted).

| Need | Wording | First build (drafted) |
|---|---|---|
| N-42 | A learner needs to get a lot of understandable reading and listening so that they pick up the language naturally. | Fully: the common library (100 texts, A1–C2) and texts from your own AI |
| N-41 | Learners need material on topics that interest them. | Fully: the library by topic; your AI writes on the topics you choose |
| N-11 | A language learner needs to have new reading and listening material consist mostly of familiar words, phrases and grammar patterns so that they can follow it. | Fully: new texts start at 95% known words (RQ-167) |
| N-02 | A learner needs to understand texts without translating so that they learn to think in the language. | Partly: texts are in Swedish only, but meanings and sentence translations are one tap away. Is this a need, or a teaching method? |

**Default:** none ticked: all accepted as worded, first-build status as drafted

### Q13. Level

Tick the needs that need your input (or "none"). For each ticked need: **still right?** Keep as worded / Withdraw and replace / Withdraw (default: keep); **met by the first build?** Fully / Partly / Not / Later (default: as drafted).

| Need | Wording | First build (drafted) |
|---|---|---|
| N-13 | A learner needs to get practice and input at their own level so that it's neither too easy nor too hard. | Partly: one overall level; levels per skill are in the second build |
| N-16 | A learner benefits from following their language level and getting input and practice at that level. | Partly: "benefits from" is not a need; see the overlap question Q23 |
| N-21 | Learners need to be exposed to material above their level, ideally with some help. | Partly: harder library texts can be chosen; help through the word menu |
| N-44 | Learners need help with input and practice that are above their level. | Partly: close to N-21; see Q24 |

**Default:** none ticked: all accepted as worded, first-build status as drafted

### Q14. Help, sound and languages

Tick the needs that need your input (or "none"). For each ticked need: **still right?** Keep as worded / Withdraw and replace / Withdraw (default: keep); **met by the first build?** Fully / Partly / Not / Later (default: as drafted).

| Need | Wording | First build (drafted) |
|---|---|---|
| N-45 | Learners need help with what they don't understand. | Fully: the word menu: tap a word for its meaning, dictionary form and grammar patterns; Explain asks your AI |
| N-03 | A learner needs to hear the language spoken so that they learn pronunciation and listening. | Fully: listening with the device's Swedish voice, when the device has one |
| N-30 | A learner needs to learn the language they choose. | Later: Swedish only in the first build (C-09) |
| N-40 | Learners of languages with characters, such as Chinese, need help learning to recognise and use the characters. | Later: no such language in the first build |

**Default:** none ticked: all accepted as worded, first-build status as drafted

### Q15. Remembering

Tick the needs that need your input (or "none"). For each ticked need: **still right?** Keep as worded / Withdraw and replace / Withdraw (default: keep); **met by the first build?** Fully / Partly / Not / Later (default: as drafted).

| Need | Wording | First build (drafted) |
|---|---|---|
| N-04 | A learner needs to have the words they keep forgetting practised until they stick so that gaps don't stay gaps. | Fully: Review drills your leaves until you let them fall |
| N-38 | Learners need help remembering what they learned. | Fully: Review, spaced over days |
| N-35 | Learners need what they know to become automatic. | Partly: Review's harder questions; no practice of speed |
| N-12 | A learner needs to focus practice on what they don't know yet rather than on what they already know so that their time goes where it helps. | Fully: only the leaves you pick up are drilled; your ground is left alone |

**Default:** none ticked: all accepted as worded, first-build status as drafted

### Q16. Skills and effort

Tick the needs that need your input (or "none"). For each ticked need: **still right?** Keep as worded / Withdraw and replace / Withdraw (default: keep); **met by the first build?** Fully / Partly / Not / Later (default: as drafted).

| Need | Wording | First build (drafted) |
|---|---|---|
| N-37 | Learners need practice in listening, reading, writing and grammar. | Partly: no writing practice in the first build |
| N-05 | A learner needs to understand the grammar patterns behind sentences so that they can build sentences of their own. | Partly: patterns in the word menu and Discover with Grammar; grammar exercises in the second build |
| N-06 | A learner needs to practise producing the language so that they can write as well as understand. | Later: writing practice is in the second build |
| N-32 | Learners need to focus their efforts on activities that increase their language skills and confidence. | Partly: sessions plan useful work; close to N-12 (Q31) |

**Default:** none ticked: all accepted as worded, first-build status as drafted

### Q17. Choice, guidance and finding your way

Tick the needs that need your input (or "none"). For each ticked need: **still right?** Keep as worded / Withdraw and replace / Withdraw (default: keep); **met by the first build?** Fully / Partly / Not / Later (default: as drafted).

| Need | Wording | First build (drafted) |
|---|---|---|
| N-07 | A learner needs to decide what to work on so that practice matches their goals. | Partly: Options… lets you tick skills and the length; topics in the library |
| N-39 | Learners need guidance on what to practise next. | Fully: Discover, Review and Mix plan what to do for the time you have |
| N-19 | A learner needs flexibility in where, how and how long they practise. | Partly: phone or computer, sessions of different lengths; only while your computer is on (C-06) |
| N-46 | Learners need to find their way around grove and back to what they were doing without getting lost. | Fully: labelled back links and "Back to your session" (addendum 006) |

**Default:** none ticked: all accepted as worded, first-build status as drafted

### Q18. Progress and enjoyment

Tick the needs that need your input (or "none"). For each ticked need: **still right?** Keep as worded / Withdraw and replace / Withdraw (default: keep); **met by the first build?** Fully / Partly / Not / Later (default: as drafted).

| Need | Wording | First build (drafted) |
|---|---|---|
| N-29 | A learner needs to feel they're making progress. | Fully: the Progress page: read and heard this week, words in your ground (B-27) |
| N-36 | Learners need an idea of their level and how much progress they've made. | Fully: your starting level next to your current level |
| N-33 | Learners need confidence in their learning outcomes. | Partly: progress is shown, but nothing tests what you can do outside grove |
| N-34 | Learners need learning to feel enjoyable, not only hard work. | Partly: calm look, your topics; game feel is in the second build |

**Default:** none ticked: all accepted as worded, first-build status as drafted

### Q19. Trust

Tick the needs that need your input (or "none"). For each ticked need: **still right?** Keep as worded / Withdraw and replace / Withdraw (default: keep); **met by the first build?** Fully / Partly / Not / Later (default: as drafted).

| Need | Wording | First build (drafted) |
|---|---|---|
| N-43 | Learners need to trust what they learn from. | Partly: library texts are checked by a program but not yet read by a Swedish speaker; texts can be reported |
| N-26 | A user needs confidence in grove, to believe their efforts are worthwhile. | Partly: help pages say why the method works (G-08) |
| N-25 | The owner needs users to have confidence in the methods grove uses. | Partly: the owner's side of N-26; see Q25 |
| N-18 | The owner needs clients to trust the product. | Partly: "clients" means learners: nobody pays |

**Default:** none ticked: all accepted as worded, first-build status as drafted

### Q20. Privacy and cost

Tick the needs that need your input (or "none"). For each ticked need: **still right?** Keep as worded / Withdraw and replace / Withdraw (default: keep); **met by the first build?** Fully / Partly / Not / Later (default: as drafted).

| Need | Wording | First build (drafted) |
|---|---|---|
| N-17 | A learner needs to keep their information private and share only what's necessary with the parties that need it. | Fully: only an email and learning data; the privacy notice names who sees what |
| N-20 | A learner needs their personal data protected at all times. | Fully: data on your computer, hourly backups, passwords held by Firebase |
| N-24 | Users need their information to be minimally exposed to others. | Fully: same as N-17? see Q28 |
| N-15 | A learner needs learning to be affordable, costing only as much as they're willing to pay for language learning. | Fully: grove is free; texts come from your own AI chat, free or paid, or the free library |

**Default:** none ticked: all accepted as worded, first-build status as drafted

### Q21. The owner, the law and licences

Tick the needs that need your input (or "none"). For each ticked need: **still right?** Keep as worded / Withdraw and replace / Withdraw (default: keep); **met by the first build?** Fully / Partly / Not / Later (default: as drafted).

| Need | Wording | First build (drafted) |
|---|---|---|
| N-10 | The owner needs to be able to run and check grove alone in little time so that it stays maintainable. | Partly: it runs by itself, but checking it takes long (your notes: your own code gets harder to understand) |
| N-27 | The owner needs to be free of licence-related legal issues. | Fully: every entry records its source and licence; a credits page |
| N-28 | The owner needs the product to comply with the law. | Fully: terms, privacy notice, export and deletion on request (GDPR basics) |
| N-08 | People who wrote the open dictionaries and word lists needs to have their licences respected (credit, same licence for shared data) so that their work can be reused legally. | Fully: credits page; share-alike data is shared only under the same licence |

**Default:** none ticked: all accepted as worded, first-build status as drafted

### Q22. Left out of the first build

Tick the needs that need your input (or "none"). For each ticked need: **still right?** Keep as worded / Withdraw and replace / Withdraw (default: keep); **met by the first build?** Fully / Partly / Not / Later (default: as drafted).

| Need | Wording | First build (drafted) |
|---|---|---|
| N-09 | A parent of a child under 13 needs to consent before the child's data is used so that the child is protected. | Not: met by not allowing under-13s at all (a reduced requirement, not a reduced need) |
| N-22 | Teachers need control over the content of their teaching materials and over who has access to them. | Later: teachers and classes were cut for now |
| N-23 | Teachers need information on how their students are doing. | Later: teachers and classes were cut for now |

**Default:** none ticked: all accepted as worded, first-build status as drafted

### Overlaps

### Q23. N-16 ("A learner benefits from following their language level…") overlaps N-13 and N-36. Withdraw it? (N-13, N-16, N-36)

One choice.

- **A** Withdraw N-16 — Reason: "benefits from" is not a need, and the content is N-13 (input at your level) plus N-36 (knowing your level). Its requirements move to N-13 and N-36.
- **B** Keep both — N-16 is about following your level as it changes; N-13 about the material matching it.

**Default:** A: Withdraw N-16

### Q24. N-21 (material above your level, with some help) and N-44 (help with input above your level) say nearly the same. Which stays? (N-21, N-44, N-45)

One choice.

- **A** Withdraw N-44 — Reason: N-21 already says both parts (being given harder material, and help with it); help with anything you don't understand is N-45.
- **B** Withdraw N-21 — Keep N-44 as the one about harder material.
- **C** Keep both — N-21 is about meeting harder material at all; N-44 about the help.

**Default:** A: Withdraw N-44

### Q25. N-25 (the owner needs users to have confidence in grove's methods) is the owner's side of N-26. Withdraw it? (N-25, N-26, N-18)

One choice.

- **A** Withdraw N-25 — Reason: the learner's confidence is N-26; the owner's interest in being trusted is N-18.
- **B** Keep both — They belong to different stakeholders, so both stay.

**Default:** A: Withdraw N-25

### Q26. N-26 (confidence that the effort is worthwhile) and N-33 (confidence in learning outcomes): one need or two? (N-26, N-33, N-36)

One choice.

- **A** Two: keep both — N-26: trusting the method before results show. N-33: seeing that you really can do more.
- **B** Withdraw N-33 into N-26 — Reason: both are about believing the work pays off.
- **C** Withdraw N-33 into N-36 — Reason: confidence in outcomes comes from knowing your level and progress.

**Default:** A: Two: keep both

### Q27. N-27 (free of licence issues) is part of N-28 (comply with the law). Withdraw N-27? (N-27, N-28, N-08)

One choice.

- **A** Withdraw N-27 — Reason: licences are part of the law (N-28); the data authors' side is N-08.
- **B** Keep both — Licences are the most likely legal trouble for grove and worth naming on their own.

**Default:** A: Withdraw N-27

### Q28. N-24 (information minimally exposed) repeats N-17 (private, shared only as necessary). Withdraw N-24? (N-17, N-24, N-20)

One choice.

- **A** Withdraw N-24 — Reason: same as N-17. N-20 stays: it is about keeping data safe from harm (security), not about who sees it (privacy).
- **B** Keep all three — N-24 is for all users, N-17 for learners.
- **C** Withdraw N-24 and N-20 into N-17 — One privacy need for the report.

**Default:** A: Withdraw N-24

### Q29. N-04 (forgotten words practised until they stick), N-38 (help remembering) and N-35 (what you know becomes automatic): keep all three? (N-04, N-38, N-35)

One choice.

- **A** Keep all three — N-04: the words that keep slipping; N-38: remembering anything learned; N-35: using it without thinking.
- **B** Withdraw N-04 into N-38 — Reason: N-38 is broader and less tied to drilling. The report then cites N-38 where it cites N-04.

**Default:** A: Keep all three

### Q30. N-29 (feel you are making progress) and N-36 (an idea of your level and progress): keep both? (N-29, N-36)

One choice.

- **A** Keep both — Feeling progress (motivation) is not the same as knowing your level (information).
- **B** Withdraw N-29 into N-36 — Reason: the feeling comes from seeing the progress.

**Default:** A: Keep both

### Q31. N-12 (practise what you don't know yet) and N-32 (effort on what increases skills and confidence): keep both? (N-12, N-32)

One choice.

- **A** Keep both — N-12 is about what you practise; N-32 about which kinds of activity are worth the time.
- **B** Withdraw N-32 into N-12 — Reason: both say "spend the time where it helps".

**Default:** A: Keep both

### Q32. N-37 (practice in listening, reading, writing and grammar) is the sum of N-03, N-05, N-06 and N-42. Keep it? (N-37, N-03, N-05, N-06)

One choice.

- **A** Keep it — It says the skills belong together; the others say why each one matters.
- **B** Withdraw N-37 — Reason: each skill has its own need already.

**Default:** A: Keep it

### Q33. N-07 (decide what to work on) and N-39 (guidance on what next) pull against each other. How does the report treat that? (N-07, N-39)

One choice.

- **A** Keep both; name it as a balance — grove plans a session for you (Start), and lets you choose (Options…). The report says so.
- **B** Keep both; guidance wins by default — Same, but the report says grove's plan comes first and choice is the exception.
- **C** Keep both; choice wins — The learner decides; grove only suggests.

**Default:** A: Keep both; name it as a balance

## Needs found since the freeze

The needs were frozen on 23 October. Since then the addenda and your notes (B-01…B-33) showed things the needs don't quite say. Each draft is in the plain "who needs what" form, without a solution. Adding one means a new N-ID (N-47 on), not a change to the frozen documents.

### Q34. Course reviewers have no need of their own. Add: "Course reviewers need to try grove and judge it in a short time, without setting anything up." (C-11, G-07)

One choice.

- **A** Add it — G-07 (the demo account with ready texts and words) then serves a real need instead of only N-15 and N-18.
- **B** Don't add: it is a constraint — Keep it as C-11 (the course context) only.

**Default:** A: Add it

### Q35. Add: "The owner needs the project to meet the course's requirements in time." (owner, C-02)

One choice.

- **A** Add it — Explains choices made for the course: the report, the reviewers' demo, the Spec Kit process.
- **B** Don't add: it is a constraint — The deadline (C-02) and the course context (C-11) already say it.

**Default:** A: Add it

### Q36. Add: "A learner needs to know what is happening, what they have already done and what comes next." (B-05, B-06, B-08, B-09, B-15)

One choice.

- **A** Add it — Your notes on the AI text wizard ("hard to get confirmation on what has already happened") and the session's way back show it was missing.
- **B** Don't add: covered by N-46 — Finding your way back (N-46) is close enough.

**Default:** A: Add it

### Q37. Add: "A learner needs to start learning straight away, without first making many choices." (B-13, B-14, B-01)

One choice.

- **A** Add it — Behind "simplify the learning part" (B-13), the one-tap Start (B-14) and agreeing to the terms only once (B-01).
- **B** Don't add: covered by N-34 and N-39 — Enjoyable learning and guidance on what next already cover it.

**Default:** A: Add it

### Q38. Add: "A learner needs something suitable to read or listen to whenever they have time to learn." (B-03, B-10, B-20, B-30)

One choice.

- **A** Add it — Your notes on empty sessions ("there is nothing to practise right now") show the gap: lots of input (N-42) is not the same as having it there when you want it.
- **B** Don't add: covered by N-42 and N-19 — Lots of input plus flexibility in when you practise.

**Default:** A: Add it

### Q39. Add: "A learner needs to focus on one thing at a time, without distractions." (B-21, B-31, B-32, B-33)

One choice.

- **A** Add it — Behind removing the "2 new" count and the Listen button from reading sessions, and the long sentence list in listening.
- **B** Don't add: covered by N-34 — Learning that feels enjoyable covers it.

**Default:** A: Add it

### Q40. Add: "A learner needs reading and listening to feel like real reading and listening, not like an exercise sheet." (B-22, B-33)

One choice.

- **A** Add it — Behind one continuous text instead of a sentence per row (B-22).
- **B** Don't add: covered by N-34 and the new focus need — Q39's need and enjoyable learning cover it.

**Default:** B: Don't add: covered by N-34 and the new focus need

### Q41. Add: "A learner needs what they have learned and done to be kept, so that their work is never lost." (C-06, G-01 FR-002, FR-003)

One choice.

- **A** Add it — Hourly backups and saving through restarts serve it today, under N-20 (data protected), which is about others, not loss.
- **B** Don't add: covered by N-20 — Protecting data includes not losing it.

**Default:** A: Add it

### Q42. Accessibility: "Learners with poor sight or other impairments need to be able to learn with grove as well as anyone." You withdrew a similar need as wrong on page 27. (N-p1-46 (page 27))

One choice.

- **A** Add it now — grove already tests contrast (readable colours in both looks); the need would explain why.
- **B** Don't add — Stay with page 27.

**Default:** B: Don't add

### Q43. Add: "The owner needs to understand how grove works well enough to change it safely." (owner notes)

One choice.

- **A** Add it — Your report notes say your own code gets harder to understand as new tools come in; this would make it a need the process must serve (spec as the source).
- **B** Don't add: covered by N-10 — Running and checking grove alone (N-10) covers it.

**Default:** B: Don't add: covered by N-10

### Q44. Speaking is in no need. Add: "A learner needs to practise speaking so that they can talk, not only understand." (N-37)

One choice.

- **A** Add it, marked "not met" — A real need of learners; grove doesn't serve it, and the report says so.
- **B** Don't add — Never raised; grove is about understanding.

**Default:** B: Don't add

### Q45. Is any other need missing? (default: no) (anything else)

One choice.

- **A** No — The list with this round's additions is complete.
- **B** Yes: written in the note — Write it as "A learner needs …" or "[Who] needs …".

**Default:** A: No

## User goals

A user goal is something a person wants to get done with grove. G-01…G-08 were made from the frozen requirements (page 53) and G-09 later (addendum 004); they were also the order of the build, so some read as technical work packages ("Platform, accounts, security…"). For the report they could read from the learner's side. Terms: Discover = a session with new texts and words; Review = drilling your leaves that are due; Mix = both; the common library = grove's own texts; your library = texts you added.

### Q46. How should the report present the goals? (G-01…G-09)

One choice.

- **A** Keep G-01…G-09, with plain names — Same nine goals and IDs; only the names change (the next nine questions).
- **B** Regroup into 5–6 learner goals — For example: start, get texts, read and listen, remember, see progress, find my way; the G-IDs vanish from the report.
- **C** Both — Plain-named G-01…G-09 in 2.2 (they are how the build was done), with the needs each serves; 1.1 tells them as the learner's story.

**Default:** C: Both

### Q47. G-01 "Platform, accounts, security and the look's basics". Plain name? (G-01)

One choice.

- **A** "Learn in my own private place, on my phone or computer" — Serves N-17, N-20, N-19: an account only you use, safe data, works on a phone.
- **B** "Sign in safely and know my data is safe" — Closer to what G-01 builds (sign-in, terms, privacy).
- **C** Keep the name — It is the platform; the report says it is technical.

**Default:** A: Learn in my own private place, on my phone or computer

### Q48. G-02 "Texts from the learner's own AI". Plain name? (G-02)

One choice.

- **A** "Get new texts on my topics, at my level, for free" — The goal behind it (N-42, N-41, N-11, N-15); your own AI chat is how.
- **B** "Get texts written for me by my own AI chat" — Keeps the how in the name.
- **C** Keep the name

**Default:** A: Get new texts on my topics, at my level, for free

### Q49. G-03 "Reading and the word menu". Plain name? (G-03)

One choice.

- **A** "Read texts I can follow, with help on any word" — The word menu (tap a word for its meaning, form and patterns) is the help. N-42, N-45, N-05.
- **B** "Read and get help right where I'm stuck"
- **C** Keep the name

**Default:** A: Read texts I can follow, with help on any word

### Q50. G-04 "Ground, drilling and progress". Plain name? (G-04)

One choice.

- **A** "Make the new words I choose stick" — Picking up leaves and Review; progress then moves to G-09's Progress page. N-04, N-38, N-12.
- **B** "Remember what I learn and see what I know" — Keeps progress in this goal. N-04, N-38, N-29, N-36.
- **C** Keep the name — "Ground" and "drilling" need explaining in the report.

**Default:** A: Make the new words I choose stick

### Q51. G-05 "Listening". Plain name? (G-05)

One choice.

- **A** "Hear my texts and learn to follow them by ear" — N-03: the device's voice reads texts, sentence by sentence, again and in a loop.
- **B** Keep "Listening" — Already plain.

**Default:** A: Hear my texts and learn to follow them by ear

### Q52. G-06 "Starting level". Plain name? (G-06)

One choice.

- **A** "Start at the right level from day one" — Pick your level or let grove assess it (B-18). N-13, N-36.
- **B** "Find out my level"
- **C** Keep the name

**Default:** A: Start at the right level from day one

### Q53. G-07 "Demo content for reviewers" is the reviewers' goal, not the learner's. How should it read? (G-07)

One choice.

- **A** "Reviewers can try grove at once, with texts and words ready" — A goal of the course reviewers, serving their new need (Q34).
- **B** Fold it into G-01 as "Start learning on the first visit" — Ready content helps any new learner, not only reviewers.
- **C** Keep the name

**Default:** A: Reviewers can try grove at once, with texts and words ready

### Q54. G-08 "The look's extras and help". Plain name? (G-08)

One choice.

- **A** "Enjoy grove and understand why it works" — The extras (the look, the animations) and the help pages. N-34, N-26.
- **B** "Understand how grove works" — Only the help part; the extras are left out of the name.
- **C** Keep the name

**Default:** A: Enjoy grove and understand why it works

### Q55. G-09 "Home, sessions and the new look". Plain name? (G-09)

One choice.

- **A** "Learn for as long as I have, and always know what to do next" — Discover, Review and Mix sessions of a chosen length; Home and the way back. N-39, N-19, N-07, N-46.
- **B** "Find my way and choose what to do next" — Puts Home and finding your way first.
- **C** Keep the name

**Default:** A: Learn for as long as I have, and always know what to do next

### Q56. Which needs each goal serves (the main ones, drafted). Tick the goals whose list is wrong.

Tick the goals whose list is wrong and give the right needs in the note.

| Goal | Main needs (drafted) |
|---|---|
| G-01 Private place / accounts | N-17, N-20, N-19, N-28, N-18 |
| G-02 New texts | N-42, N-41, N-11, N-13, N-15 |
| G-03 Reading with help | N-42, N-45, N-02, N-05, N-11 |
| G-04 Words that stick | N-04, N-38, N-12, N-29, N-36 |
| G-05 Listening | N-03, N-37, N-42 |
| G-06 Starting level | N-13, N-36 |
| G-07 Reviewers' demo | the reviewers' new need (Q34), N-18 |
| G-08 Enjoy and understand | N-34, N-26, N-43 |
| G-09 Sessions and finding your way | N-39, N-07, N-19, N-46, N-41, and the new needs of Q36–Q38 |

**Default:** none ticked: all as drafted

### Q57. How far the first build meets each goal (drafted). Tick the goals whose status is wrong.

Tick the goals whose drafted status is wrong; for each, pick Fully / Partly / Not / Later.

| Goal | Drafted |
|---|---|
| G-01 Private place / accounts | Fully: invited accounts only, no sign-up yet |
| G-02 New texts | Partly: the check with a real AI chat is not done yet |
| G-03 Reading with help | Fully |
| G-04 Words that stick | Fully |
| G-05 Listening | Fully: B-33 (the sentence list) still open |
| G-06 Starting level | Fully |
| G-07 Reviewers' demo | Fully |
| G-08 Enjoy and understand | Partly: the oak animation and your lessons are still to come |
| G-09 Sessions and finding your way | Fully: both rebuilds merged on 31 October |

**Default:** none ticked: all as drafted

### Q58. Which goals that the first build doesn't have should the report name as later goals? (default: the first two) (missing goals)

Tick all that apply.

- **write** Write and use grammar — Writing and grammar exercises, planned for the second build (N-05, N-06).
- **languages** Learn another language — Other languages and writing systems (N-30, N-40).
- **teachers** Teach a class with grove — Teachers' materials and their students' progress (N-22, N-23); cut for now.
- **speak** Speak — Only if the speaking need is added (Q44).
- **none** None

**Default:** write (Write and use grammar), languages (Learn another language)

## Priorities and how they are checked

For the report: the few needs that matter most, and how each is checked. Checking that the right thing was built (does grove really meet the need?) is validation; checking that it was built right (do the tests pass?) is verification. Pick 3–5 needs; a question on how to check each one you pick then appears.

### Q59. Which 3–5 needs matter most? (default: N-42, N-11, N-04, N-45, N-15) (top needs)

Tick all that apply (at most 5).

- **N-42** Lots of understandable reading and listening
- **N-11** New material mostly in familiar words
- **N-13** Input and practice at your own level
- **N-04** Forgotten words practised until they stick
- **N-45** Help with what you don't understand
- **N-29** Feeling of progress
- **N-15** Affordable learning
- **N-43** Trust in what you learn from

**Default:** N-42, N-11, N-04, N-45, N-15

### Q60. How is N-42 (lots of understandable input) checked? Tick all. (default: A, B) (N-42)

*Shown only if N-42 is picked in Q59.*

Tick all that apply.

- **A** Your own use, measured — You use grove for two weeks; the Progress page counts minutes read and heard. Target to set in the note (e.g. 3 hours).
- **B** Enough texts at every level — Count the common library: at least 10 texts at each level A1–C2.
- **C** Reviewers' feedback — Ask the course reviewers whether they found enough to read that they could follow.
- **D** A small trial with learners — 3–5 real learners for a week, after 1 November.

**Default:** A (Your own use, measured), B (Enough texts at every level)

### Q61. How is N-11 (new material in familiar words) checked? (default: A, B) (N-11)

*Shown only if N-11 is picked in Q59.*

Tick all that apply.

- **A** Measured on every text — grove counts the share of a new text's words that are in your ground; at least 95% (RQ-167). Already a test.
- **B** Your own reading — You read 10 new texts at your level and mark the words you didn't know; fewer than 1 in 20 is the target.
- **C** Learners rate texts — Too easy / just right / too hard after each text; most should be "just right".

**Default:** A (Measured on every text), B (Your own reading)

### Q62. How is N-13 (at your own level) checked? (default: A, B) (N-13)

*Shown only if N-13 is picked in Q59.*

Tick all that apply.

- **A** The starting level feels right — You and the reviewers say whether the assessed level matches what you can do.
- **B** Texts feel "just right" — Most texts at your level are neither too easy nor too hard, by your own judgement over two weeks.
- **C** The level moves — Your current level on Progress rises as your ground grows.

**Default:** A (The starting level feels right), B (Texts feel "just right")

### Q63. How is N-04 (forgotten words stick) checked? (default: A) (N-04)

*Shown only if N-04 is picked in Q59.*

Tick all that apply.

- **A** Still known a week later — Of the words you picked up and let fall, the share you still get right in Review a week later.
- **B** Words reaching your ground — How many leaves fall to the ground (you know them) each week.
- **C** Your own sense — A weekly line in a diary: do the words stick?

**Default:** A (Still known a week later)

### Q64. How is N-45 (help with what you don't understand) checked? (default: A, B) (N-45)

*Shown only if N-45 is picked in Q59.*

Tick all that apply.

- **A** Every word has help — A tap on any word gives a meaning within half a second (tested, FR-305); count the words with no meaning stored.
- **B** Help that actually helps — Over 10 texts you note each time the help didn't make the word or sentence clear.
- **C** Reviewers' feedback — Ask the reviewers whether they got stuck anywhere.

**Default:** A (Every word has help), B (Help that actually helps)

### Q65. How is N-29 (feeling of progress) checked? (default: A, B) (N-29)

*Shown only if N-29 is picked in Q59.*

Tick all that apply.

- **A** Progress shows what you did — The Progress page's numbers (read, heard, words in your ground, starting vs current level) match what you remember doing.
- **B** A weekly feeling — Once a week: "do I feel I'm getting better?" yes / somewhat / no.
- **C** Reviewers' feedback — Ask the reviewers.

**Default:** A (Progress shows what you did), B (A weekly feeling)

### Q66. How is N-15 (affordable learning) checked? (default: A, B) (N-15)

*Shown only if N-15 is picked in Q59.*

Tick all that apply.

- **A** The whole loop with a free AI — Get texts with a free AI chat's free tier, read, review: nothing asks for money (the real-AI check).
- **B** Running costs stay zero — Nothing is paid beyond your Claude subscription (C-01).
- **C** Works with no AI at all — The common library alone gives enough to learn from.

**Default:** A (The whole loop with a free AI), B (Running costs stay zero)

### Q67. How is N-43 (trust in what you learn from) checked? (default: A, B) (N-43)

*Shown only if N-43 is picked in Q59.*

Tick all that apply.

- **A** A Swedish speaker reads a sample — For example 10 library texts across the levels; count the mistakes.
- **B** The program checks every text — grove's checker runs on every library and AI text (known words, level, form).
- **C** Reports from learners — Count the texts and sentences reported as wrong.

**Default:** A (A Swedish speaker reads a sample), B (The program checks every text)

### Q68. How does the report describe validation overall? (validation)

One choice.

- **A** Your own tests as the main learner — Your notes after each build (O-01…O-22, B-01…B-33) are the validation, done by the first real user; the checks above are next steps.
- **B** Your tests plus the reviewers' feedback — The reviewers' views are added when they come.
- **C** Your tests now; a learner trial as future work — The report plans a small trial with real learners after the course.

**Default:** A: Your own tests as the main learner

## For the reflections

For the report's section 7: what this way of finding needs taught you. grove found its needs after the prototypes ("prototype first, needs after"), froze them, and then kept finding more through your tests.

### Q69. How did deriving the needs after the prototypes work? Tick all that are true. (default: A, C) (report 7)

Tick all that apply.

- **A** It found needs a plain list would have missed — For example free learning (N-15) came from asking who pays for p1's AI.
- **B** The needs came out too many and too close — 43 active needs with many overlaps, as this round shows.
- **C** Using the build showed needs late — Clarity, simplicity and the way back (N-46, Q36–Q39) came only from your tests after the freeze.
- **D** The needs rarely steered decisions — Decisions were made on screens and requirements; the needs were traced afterwards.

**Default:** A (It found needs a plain list would have missed), C (Using the build showed needs late)

### Q70. Which lesson about needs goes into 7.3? Tick all. (default: A, C) (report 7.3)

Tick all that apply.

- **A** Review the needs after each test of a build — Not only once before the freeze.
- **B** Keep the needs fewer and broader — About 15–25, each clearly different.
- **C** Name the core need early and test every feature against it — Your notes: with cheap prototypes the core of the app can get lost.

**Default:** A (Review the needs after each test of a build), C (Name the core need early and test every feature against it)

## Answers

