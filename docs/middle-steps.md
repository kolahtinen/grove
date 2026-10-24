# Middle-steps document: grove

**Frozen:** 2026-10-23 (user goals, order and constitution confirmed on question-pages/53)

The record of why things were decided before the spec. Frozen at the end of phase 2: reopened only when tools or budget change, to revisit reductions. Risky new needs get addenda in `docs/addenda/`.

Sources: [requirements](requirements.md) (RQ-01…379), [needs](needs.md) (N-01…45), and `docs/middle/`: [constraints](middle/constraints.md), [scope](middle/scope.md), [feasibility](middle/feasibility.md), [risks](middle/risks.md), [threats](middle/threats.md), [quality](middle/quality.md), [AI test](middle/ai-test/results.md). Decisions are on `question-pages/01…53`.

---

# Part 1: Why

Only this document holds this part.

## Prototypes

Neither prototype was rejected. Both fed the combined requirements (`/pre.combine`, question-pages/44, 45); their needs are merged in [needs](needs.md).

| Prototype | What it tried | Rounds | Requirements | Outcome |
|---|---|---|---|---|
| [p0](../prototypes/p0/requirements.md) | An earlier grove (imported from a single HTML file): Claude made 'pack files' of exercises for four skills (listening, reading, writing, grammar); the learner sent the updated pack back; many languages, including Japanese and Chinese; a polished forest look. | import; tried with pack 15 (2026-10-20) | PR-p0-01…128: 118 active, 10 denied | Kept: the four skills and their exercises, the word menu, saved words, the look (Appendix A). Dropped: whole-pack exchange (583 KB pack: X-p0-01 → only what changed). |
| [p1](../prototypes/p1/requirements.md) | A tree of known words, phrases and patterns (the ground) with comprehensible input: texts mostly from known words, AI by copy-paste with the learner's own chat, story series, dialogues, choose-your-path, starting level, accounts by invitation, a shared bank and library with checks. | 5 rounds + implicit checks + one build (2026-10-20) | PR-p1-01…304: 289 active or changed, 15 denied or dropped | Kept as the learning loop. No paid AI (round 2); hosting moved from the owner's computer to the plan of page 46 and back (page 47); accounts moved to Firebase (page 49). |

Conflicts between them were decided on question-pages/44 (12 conflicts; e.g. RQ-01: one summary exchange per session plus part prompts).

## Risks

Summary of [risks](middle/risks.md) (17 risks, ranked; reviewed on question-pages/49; R-01 and R-13 updated on 2026-10-23).

| Rank | ID | Risk | Cost / likelihood | Main techniques |
|---|---|---|---|---|
| 1 | R-01 | Free AI answers are cut short, malformed or break the new-word rules, so fix-it rounds pile up | high / medium | X-03 tested (docs/middle/ai-test/); 10-minute parts (RQ-186); margins (RQ-127, RQ-216, RQ-378; RQ-377 with easy reads in the second build); grove finds unlisted words (RQ-379); fix-it prompt names sentences (RQ-63) |
| 2 | R-02 | The first build isn't finished and tested by Sunday (158 requirements) | high / high | Build in user-goal order with a walking skeleton first; cut shoulds before musts |
| 3 | R-03 | Inflections, homographs and compounds are counted as new words | high / high | Dictionary forms from the AI (RQ-64); Unicode word splitting; Q-07 test set |
| 4 | R-04 | The known-word list makes prompts too long for free chats | high / medium | Compact format; only relevant words; measure with a large ground |
| 5 | R-05 | The owner's computer or tunnel is down, or the README link is stale | high / medium | Services start on boot; no sleep; README updater (RQ-364); Q-06 |
| 6 | R-06 | Data loss or corruption | high / medium | Hourly backups with a tried restore; migrations tested (Q-03) |
| 7 | R-07 | A flaw exposes other learners' data or the owner's computer | high / low | Server-side authorisation per endpoint; Firebase; limited user; no open ports (T-01…18) |
| 8 | R-08 | The AI's Swedish has mistakes that reach learners | medium / medium | Kelly-list meanings; report button (RQ-301); the X-03 test found tense slips in Gemini and Claude |
| 9 | R-10 | No Swedish voice, or speed ignored | medium / medium | Voice check and help (RQ-20, RQ-369, X-02) |
| 10 | R-11 | The starting level guesses wrong | medium / medium | Untick unknown sample words (RQ-114); ratings lower difficulty (RQ-193) |
| 11 | R-12 | Marking 30–50 new words after a part feels like a chore | medium / medium | Mark only unknown words (RQ-204); test with a real part |
| 12 | R-13 | A wrong entry spreads through the shared bank, or the review list outgrows the owner and maintainers (second build) | high / medium | Unchecked entries private; dictionary check; batch review; content maintainers (RQ-373…375) |
| 13 | R-14 | Licences of the Kelly list or Wiktionary not respected | medium / medium | Licence field and credits page (C-05) |
| 14 | R-15 | The frosted-glass look lags on older phones | low / medium | Reduced motion (RQ-308); drop blur on slow devices |
| 15 | R-09 | Copy-pasting feels tedious | medium / low | Demo content (RQ-361…363); one exchange per session |
| 16 | R-16 | Someone under 13 signs up | high / low | Invitation only (RQ-217); terms (RQ-228); X-p1-03 |
| 17 | R-17 | Strangers get the link and code, or guess sign-ins | medium / low | Private repo; 5-use code (RQ-368); lockout (RQ-156) |

## Feasibility

Summary of [feasibility](middle/feasibility.md) (`/pre.feasibility`, question-pages/48; gaps closed on 2026-10-23). Every active RQ has an F-ID (F-01…367): most are easy or inherit a prototype rating (F-p0-…, F-p1-… in docs/discovery/*/feasibility.md). Budget zero (C-01); time to Sunday 25 October 2026 (C-02).

| Full check | Requirements | Rating | Sources |
|---|---|---|---|
| F-01, F-185, F-342 | RQ-01, RQ-186, RQ-348: exchanges with the learner's own free AI chat | possible with limits (X-03; tested 2026-10-23) | tech-insider.org free-tier caps 2026; theaicareerlab.com usage limits 2026; morphllm.com ChatGPT vs Claude; the X-03 test |
| F-03 | RQ-03: one overall level from the ground | possible with limits (X-p1-04) | see F-p1-05 (Kelly list, CC BY-SA 3.0) |
| F-13 | RQ-13: speech speed 0.5×–1.5× | possible with limits (X-02) | MDN SpeechSynthesisUtterance.rate; codersblock.com text-to-speech quirks |
| F-21 | RQ-21: the sentence being read is highlighted | easy | codersblock.com text-to-speech quirks |
| F-125 | RQ-125: hosting on the owner's computer behind a free quick tunnel | possible with limits (X-01) | Cloudflare docs: Quick Tunnels; flaviocopes.com Quick Tunnels guide |
| F-349, F-350 | RQ-361, RQ-362: demo texts and demo learner | easy | terms.law: Claude output ownership; terms.law: AI platform terms FAQ 2026 |
| F-354 | RQ-366 (with RQ-219, RQ-367): accounts through Firebase Authentication | possible with limits | merginit.com free auth providers 2026; ssojet.com Firebase Authentication compared |
| F-102, F-123, F-124, F-211, F-212 | RQ-102, 123, 124, 217, 218 | easy (own checks, 2026-10-23) | — |
| F-365…367 | RQ-377…379 (after the X-03 test) | easy | the X-03 test |

The prototype full checks (F-p1-01 copy-paste AI, F-p1-03 browser voices, F-p1-05 Kelly list and Wiktionary, F-p1-07 open sign-up, F-p1-98 home hosting, F-p1-105 margins, and others) are kept in docs/discovery/p1/feasibility.md with their sources.

## Reductions log

| ID | Original requirement | Reduced version | Reason | Revisit later? | Confirmed |
|---|---|---|---|---|---|
| X-01 | RQ-125: grove is reached through a public relay | A test deployment for invited reviewers through a quick tunnel; no streaming; the current link appears in the private repo's README by itself (RQ-364) | Quick tunnels are for testing: 200 in-flight requests, no SSE (F-125) | Yes: before opening grove beyond reviewers (needs a domain, so a budget) | question-pages/48 |
| X-02 | RQ-13: speech speed 0.5×–1.5× | The speed where the device's voice allows it, with a note (RQ-365) | Voices may narrow or ignore the rate (F-13) | No | question-pages/48 |
| X-03 | RQ-01, RQ-186: a part of about 20 minutes | Real answers tried before the build; part size set from the test: **10 minutes** | Free chats' answer length was unknown (F-01) | Yes: with RQ-348 (exchange sizes), second build | question-pages/48; result question-pages/52 |
| X-p0-01 | PR-p0-08: the pack file is compressed and scrambled | The AI gets and returns only what changed (a short plain summary and the new items), not the whole pack | The pack was 583 KB unpacked | Yes, if all target AIs run code and take large files | question-pages/42 |
| X-p1-01 | PR-p1-97: new bank entries are checked by a background process | The check runs when the server is awake: right after a paste, or when the owner opens the review list | — | Yes, if hosting is ever paid | not needed: the owner's computer is always on (page 31) |
| X-p1-02 | PR-p1-22: sentences read with browser voices | Read aloud only where the device has a voice for the language; otherwise grove says so and how to install one | Voices differ by device | No | page 25 |
| X-p1-03 | PR-p1-99, PR-p1-107: anyone can sign up; students join classes | Accounts and classes for learners aged 13 and over only, for now | Parental consent under 13 is too heavy now (N-09) | Yes, if schools with younger children ask | page 25 |
| X-p1-04 | PR-p1-64, PR-p1-115: CEFR levels from word counts | A level's words are the Kelly-list words tagged up to that level; beyond the list (8,425 words), the AI supplies further words | Open, graded data exists | Yes, if a bigger tagged list is found | page 25 (changed: Kelly list first, then AI) |
| X-p1-05 | PR-p1-117: a reading test sets the level | A fixed set of graded texts per language, made once and checked by the owner | Making texts per learner is costly | No | page 25 |
| X-p1-06 | PR-p1-134: a browser extension copies the prompt and answer | The extension acts only on the learner's click | — | — | withdrawn: the extension was dropped instead (page 32) |
| X-p1-07 | PR-p1-136: the automatic check searches the web for the word in real use | Real-use examples come from open text collections (corpora) instead of web search | No free web search | Yes, if a free search option appears | page 32 |

## Threat model

Summary of [threats](middle/threats.md) (STRIDE, question-pages/50). Trust boundaries: browser ↔ grove server (everything from the browser is untrusted, including pasted AI answers); internet ↔ owner's computer (the Cloudflare quick tunnel); grove server ↔ Firebase; owner's computer ↔ GitHub (README updater token); the learner's own AI chat (outside grove); imported data (Kelly list).

| Where the mitigation went | Threats |
|---|---|
| Constitution rules (section 4 of the [constitution draft](constitution-draft.md)) | T-02 (cookies, CSRF), T-06 (plain text, CSP), T-07 (strict schemas), T-08 (server-side authorisation), T-10 (verified Firebase tokens), T-11 (secrets), T-12 (logs), T-14 (limited user, no open ports), T-15 (disk encryption), T-18 (dependencies) |
| Requirements with tests (in the feed) | T-01 (RQ-156, RQ-221), T-03 (RQ-223), T-05 (RQ-372), T-07 (RQ-231), T-08 (RQ-155), T-09 (RQ-146, 147, 155, 360), T-13 (RQ-371), T-16 (RQ-225) |
| Second build | T-19 (shared bank), T-20 (shared library), content maintainer role (T-09) |
| Accepted | T-04 (the code may leak: 5 uses, private repo), T-16 in part (floods through the quick tunnel), T-17 (Cloudflare sees the traffic; named as a processor), the learner's own AI chat, T-p0-02 (no longer applies) |

## Dropped quality attributes

From [quality](middle/quality.md) (question-pages/51). Kept: Q-01 security, Q-02 privacy, Q-03 data reliability, Q-04 AI exchange, Q-05 responsiveness, Q-06 availability during the review, Q-07 word-counting accuracy, Q-08 shared content (second build).

| Attribute | Why dropped |
|---|---|
| Accessibility (Q-p1-06) | Its need was withdrawn (page 27); dropped on question-pages/35 |
| Scalability | At most 5 reviewers on one computer (C-11) |
| Availability around the clock | The owner's computer and a free quick tunnel (C-06, X-01); Q-06 covers the review only |
| Portability to native apps | No mobile app (C-03) |
| Performance on older phones | Covered by Q-05 and reduced motion (RQ-308) |
| Maintainability | Handled by the process and the constitution (C-10) |
| Security of the pack file (Q-p0) | No pack files any more |

## Open

No implicit requirements are undecided (p0: all decided on question-pages/38; p1: on question-pages/13–19, 40, 43).

---

# Part 2: Feed for Spec Kit

Goes into `/speckit.specify`, one user goal at a time. The combined requirements are where the spec starts; specify follows them unless they're changed in clarify. The needs are context for building the system. Every item keeps its IDs. Only the first build's scope is here (158 requirements, docs/middle/scope.md); the second build's requirements stay in [requirements](requirements.md).

## User goals

| ID | Goal | Combined requirements | Needs | Order | Shared? |
|---|---|---|---|---|---|
| G-01 | Platform, accounts, security and the look's basics | 51 (22 must): RQ-23, RQ-24, RQ-25, RQ-38, RQ-90, RQ-125, RQ-141, RQ-146, RQ-147, RQ-155, RQ-156, RQ-157, RQ-160, RQ-161, RQ-162, RQ-163, RQ-178, RQ-180, RQ-181, RQ-217, RQ-218, RQ-219, RQ-221, RQ-222, RQ-223, RQ-224, RQ-225, RQ-226, RQ-227, RQ-228, RQ-229, RQ-231, RQ-306, RQ-312, RQ-314, RQ-316, RQ-331, RQ-334, RQ-335, RQ-337, RQ-338, RQ-339, RQ-340, RQ-341, RQ-364, RQ-366, RQ-367, RQ-368, RQ-371, RQ-372, RQ-376 | N-05, N-06, N-11, N-13, N-15, N-16, N-17, N-18, N-19, N-20, N-22, N-24, N-25, N-27, N-28, N-34, N-42, N-43 | 1 | yes |
| G-02 | Texts from the learner's own AI | 33 (29 must): RQ-01, RQ-02, RQ-11, RQ-17, RQ-19, RQ-28, RQ-33, RQ-36, RQ-40, RQ-41, RQ-46, RQ-50, RQ-54, RQ-63, RQ-64, RQ-65, RQ-127, RQ-165, RQ-167, RQ-168, RQ-172, RQ-175, RQ-182, RQ-183, RQ-184, RQ-185, RQ-186, RQ-193, RQ-195, RQ-216, RQ-355, RQ-378, RQ-379 | N-02, N-04, N-06, N-11, N-12, N-13, N-15, N-16, N-21, N-37, N-39, N-41, N-42, N-43, N-44 | 2 | no |
| G-03 | Reading and the word menu | 20 (19 must): RQ-10, RQ-12, RQ-18, RQ-29, RQ-53, RQ-55, RQ-56, RQ-58, RQ-74, RQ-76, RQ-171, RQ-177, RQ-205, RQ-274, RQ-276, RQ-278, RQ-297, RQ-298, RQ-301, RQ-357 | N-02, N-04, N-05, N-06, N-11, N-12, N-16, N-29, N-34, N-37, N-38, N-42, N-43, N-45 | 3 | no |
| G-04 | Ground, drilling and progress | 26 (17 must): RQ-03, RQ-06, RQ-07, RQ-08, RQ-32, RQ-34, RQ-35, RQ-48, RQ-52, RQ-60, RQ-71, RQ-73, RQ-75, RQ-77, RQ-79, RQ-80, RQ-169, RQ-170, RQ-200, RQ-201, RQ-203, RQ-204, RQ-207, RQ-253, RQ-294, RQ-356 | N-04, N-11, N-12, N-16, N-21, N-25, N-26, N-29, N-32, N-36, N-37, N-38, N-42 | 4 | no |
| G-05 | Listening | 11 (7 must): RQ-13, RQ-14, RQ-20, RQ-21, RQ-47, RQ-57, RQ-197, RQ-198, RQ-270, RQ-365, RQ-369 | N-02, N-03, N-13, N-34, N-37 | 5 | no |
| G-06 | Starting level | 6 (2 must): RQ-113, RQ-114, RQ-117, RQ-248, RQ-249, RQ-252 | N-12, N-13, N-43 | 6 | no |
| G-07 | Demo content for reviewers | 4 (4 must): RQ-360, RQ-361, RQ-362, RQ-363 | N-15, N-18 | 7 | no |
| G-08 | The look's extras and help | 7 (0 must): RQ-308, RQ-309, RQ-310, RQ-319, RQ-322, RQ-346, RQ-370 | N-11, N-25, N-26, N-34 | 8 | no |

## G-01: Platform, accounts, security and the look's basics

From the scope groups: Platform and hosting, Accounts and security, Terms and privacy. The look's basics (colour tokens, the two looks, fonts, type, shapes, cards, buttons, layout: RQ-306, 312, 314, 316, 331, 334, 335, 337–341) are built here, so every screen is built in the forest look from the start (question-pages/53).

**Needs (context)**
- N-05: A learner needs to understand the grammar patterns behind sentences so that they can build sentences of their own.
- N-06: A learner needs to practise producing the language so that they can write as well as understand.
- N-11: A language learner needs to have new reading and listening material consist mostly of familiar words, phrases and grammar patterns so that they can follow it.
- N-13: A learner needs to get practice and input at their own level so that it's neither too easy nor too hard.
- N-15: A learner needs learning to be affordable, costing only as much as they're willing to pay for language learning.
- N-16: A learner benefits from following their language level and getting input and practice at that level.
- N-17: A learner needs to keep their information private and share only what's necessary with the parties that need it.
- N-18: The owner needs clients to trust the product.
- N-19: A learner needs flexibility in where, how and how long they practise.
- N-20: A learner needs their personal data protected at all times.
- N-22: Teachers need control over the content of their teaching materials and over who has access to them.
- N-24: Users need their information to be minimally exposed to others.
- N-25: The owner needs users to have confidence in the methods grove uses.
- N-27: The owner needs to be free of licence-related legal issues.
- N-28: The owner needs the product to comply with the law.
- N-34: Learners need learning to feel enjoyable, not only hard work.
- N-42: A learner needs to get a lot of understandable reading and listening so that they pick up the language naturally.
- N-43: Learners need to trust what they learn from.

**User stories**
- As an invited reviewer, I want to sign up with the README's invitation code, my email and a password, so that I get my own private grove.
- As a learner, I want to stay signed in on my phone for 30 days and sign out from the header, so that grove is quick to open and safe to leave.
- As a learner who forgot my password, I want a reset email, so that I can get back in without asking the owner.
- As the owner, I want my account created by a setup command and a security log of sign-ups, sign-ins, lockouts and my own actions, so that nobody can take over grove and I can see what happened.
- As a learner, I want to read the terms and privacy notice and agree at sign-up, so that I know what grove keeps and why.
- As a learner, I want grove to look calm and forest-like in a dark or light look that follows my device, so that it's pleasant to come back to.

**Acceptance scenarios**
- **Given** a valid reviewer invitation code with uses left, **When** someone signs up with it, an email and a password that meets the rule, **Then** an account with the reviewer role is created through Firebase and the code has one use fewer. (RQ-217, RQ-218, RQ-221, RQ-222, RQ-360, RQ-366, RQ-368)
- **Given** an invitation code with no uses left, or no code, **When** someone tries to sign up, **Then** no account is created. (RQ-217, RQ-368)
- **Given** 5 failed sign-ins for one account, **When** a sixth is tried within 15 minutes, **Then** it is refused, and the lockout is in the security log. (RQ-156, RQ-371)
- **Given** any email address, **When** it is used for sign-in, sign-up or password reset, **Then** the answer is the same whether or not it has an account. (RQ-372)
- **Given** a signed-in learner, **When** they request another learner's data by changing an ID, **Then** the server refuses. (RQ-155, Q-01)
- **Given** a signed-out visitor, **When** they open any page but sign-in, sign-up, password reset or the terms, **Then** they are sent to sign-in. (RQ-162, Q-01)
- **Given** any page of grove, **When** it loads, **Then** the browser contacts no host but grove's own, and its fonts come from grove. (C-12, Q-02, RQ-331)
- **Given** a device set to dark mode, **When** grove opens, **Then** it uses Night forest; light mode uses Pale birch, with the colour tokens of Appendix A.1. (RQ-306, RQ-334, RQ-335)

**Requirements** (MUST for must-priority, SHOULD for should-priority; reduced versions as reduced)
- SHOULD (RQ-23; N-19, N-05): A single centred column (about 560 px wide at most), made for phones first, that also works in a desktop browser.
- MUST (RQ-24; N-22): Grove serves adult self-learners.
- MUST (RQ-25; N-13): Grove works for learners at any level, beginner to advanced.
- MUST (RQ-38; N-16, N-19): The app runs in a desktop web browser.
- MUST (RQ-90; N-16, N-17): Several learners, each with an account and login.
- MUST (RQ-125; N-15, N-20): Grove's processing and storage run on the owner's own computer; a public relay server passes traffic between learners and it.
- SHOULD (RQ-141; N-27, N-28): Learners accept terms of use when they sign up; among other things, they may only share texts they have the right to share.
- MUST (RQ-146; N-18, N-20): There is exactly one owner, set in grove's settings on the owner's computer; nobody can become owner through grove.
- MUST (RQ-147; N-24): Everyone who signs up is a learner.
- MUST (RQ-155; N-20, N-24): Every request is checked on the server against who is asking and their role.
- MUST (RQ-156; N-20): After 5 failed sign-ins in a row, the account is locked for 15 minutes.
- MUST (RQ-157; N-20): Passwords are stored hashed (scrambled), never as written. (Firebase stores them hashed, RQ-366)
- SHOULD (RQ-160; N-18): Sign-ups per hour from one place are limited.
- SHOULD (RQ-161; N-18): A single paste has a maximum size.
- MUST (RQ-162; N-20, N-18): Visitors who aren't signed in reach only the sign-in and sign-up pages and public information; everything else needs an account.
- SHOULD (RQ-163; N-22): Grove serves students learning alongside a course.
- MUST (RQ-178; N-42, N-06): There is no conversation partner in the first version.
- MUST (RQ-180; N-16, N-19): A small server stores the data; a database is fine.
- MUST (RQ-181; N-16, N-19): AI isn't required on the server.
- SHOULD (RQ-217; N-18, N-20): In the first version, only people the owner invites (the course reviewers, and the owner) can create an account; open sign-up (PR-p1-99) comes later.
- SHOULD (RQ-218; N-20): Sign-up asks for an email address and a password.
- MUST (RQ-219; N-20): A forgotten password can be reset by email.
- SHOULD (RQ-221; N-20): A password needs at least 8 characters, with at least one letter, one digit and one symbol.
- SHOULD (RQ-222; N-20): An invitation code can let in several people; the owner sets how many.
- SHOULD (RQ-223; N-18): The owner's account is created with a setup command on the owner's computer; the sign-up page never creates an owner.
- SHOULD (RQ-224; N-19): A sign-in lasts 30 days on that device.
- SHOULD (RQ-225; N-18): At most 10 sign-ups an hour from one internet address.
- SHOULD (RQ-226; N-17): The page header shows the signed-in email and a Sign out button.
- SHOULD (RQ-227; N-18): The owner is also a learner, with their own learner data.
- SHOULD (RQ-228; N-27, N-28): The terms of use say: 13 and over; share only texts you may share; the suspension and ban rule; what data is kept and why; ask the owner to export or delete your data.
- SHOULD (RQ-229; N-20): Learners ask the owner to export or delete their data (no button for it yet).
- SHOULD (RQ-231; N-18): A single paste or upload is at most 100 KB.
- MUST (RQ-306; N-11): Two looks: Night forest (dark) and Pale birch (light), following the device's setting by default.
- SHOULD (RQ-312; N-34): A forest palette: greens with warm wood and amber accents.
- SHOULD (RQ-314; N-34): Content sits on rounded, frosted-glass cards (blurred, see-through panels with soft shadows).
- SHOULD (RQ-316; N-34): Buttons are rounded and dip slightly when pressed; main buttons have a green gradient and a soft glow.
- SHOULD (RQ-331; N-34): Text uses a sans-serif font that suits Japanese (Zen Kaku Gothic New, Hiragino or Noto Sans JP), falling back to the device's font.
- SHOULD (RQ-334; N-34): Night forest (the dark look) uses the colour tokens in Appendix A.1.
- SHOULD (RQ-335; N-34): Pale birch (the light look) uses the colour tokens in Appendix A.1.
- SHOULD (RQ-337; N-34): Type follows Appendix A.2: Zen Kaku Gothic New (with fallbacks), the listed sizes, and text sizes that follow the size setting.
- SHOULD (RQ-338; N-34): Corner radii follow Appendix A.3.
- SHOULD (RQ-339; N-34): Cards are frosted glass with the blur, shadow and glow in Appendix A.3.
- SHOULD (RQ-340; N-34): Main buttons have the green gradient and glow in Appendix A.3, and every button shrinks slightly while pressed.
- SHOULD (RQ-341; N-34): The layout follows Appendix A.3: one column at most 560px wide, a sticky blurred top bar, and the listed grids.
- MUST (RQ-364; N-18): The README of the GitHub repo the owner shares shows grove's current link; the owner's computer updates it by itself whenever the tunnel's address changes.
- MUST (RQ-366; N-20, N-18): Accounts (sign-up, sign-in, stored passwords) are handled by Firebase Authentication with email and password; nobody needs a Google account.
- MUST (RQ-367; N-20, N-24): The browser talks only to grove; grove's server talks to Firebase for sign-up, sign-in and password resets.
- MUST (RQ-368; N-18): The private repo's README holds one reviewer invitation code, valid for at most 5 sign-ups.
- MUST (RQ-371; N-18): A security log records sign-ups (with the invitation used), sign-ins, lockouts, password resets and the owner's actions: who, when, what.
- MUST (RQ-372; N-24): Sign-in, sign-up and password reset give the same answer whether or not an email address has an account.
- SHOULD (RQ-376; N-25, N-43): The terms of use say that a learner's own texts get only automatic checks, and may contain mistakes.

**Quality attributes:** Q-01, Q-02, Q-03, Q-05, Q-06

**Constraints for specify:** C-01, C-03, C-04, C-05, C-06, C-11, C-12, C-13

**Threat mitigations:** T-01, T-02, T-03, T-04, T-05, T-08, T-09, T-10, T-11, T-12, T-13, T-14, T-15, T-16, T-17, T-18

**Edge cases:**
- The tunnel restarts and its address changes: the README shows the new link within 2 minutes (RQ-364, Q-06).
- The owner's computer restarts: grove and the tunnel start again by themselves; nothing confirmed as saved is lost (Q-03).
- Firebase is unreachable: sign-in and sign-up say so plainly; nothing internal is shown (constitution 2.5).
- A paste or request is larger than 100 KB: refused with a clear message (RQ-231, T-07).
- 11th sign-up from one address within an hour: refused (RQ-225).
- An older phone where the frosted-glass blur and glows lag: fewer effects there (R-15).

---

## G-02: Texts from the learner's own AI

From the scope groups: Texts from the AI, Copy-paste AI, Session exchange size.

**Needs (context)**
- N-02: A learner needs to understand texts without translating so that they learn to think in the language.
- N-04: A learner needs to have the words they keep forgetting practised until they stick so that gaps don't stay gaps.
- N-06: A learner needs to practise producing the language so that they can write as well as understand.
- N-11: A language learner needs to have new reading and listening material consist mostly of familiar words, phrases and grammar patterns so that they can follow it.
- N-12: A learner needs to focus practice on what they don't know yet rather than on what they already know so that their time goes where it helps.
- N-13: A learner needs to get practice and input at their own level so that it's neither too easy nor too hard.
- N-15: A learner needs learning to be affordable, costing only as much as they're willing to pay for language learning.
- N-16: A learner benefits from following their language level and getting input and practice at that level.
- N-21: Learners need to be exposed to material above their level, ideally with some help.
- N-37: Learners need practice in listening, reading, writing and grammar.
- N-39: Learners need guidance on what to practise next.
- N-41: Learners need material on topics that interest them.
- N-42: A learner needs to get a lot of understandable reading and listening so that they pick up the language naturally.
- N-43: Learners need to trust what they learn from.
- N-44: Learners need help with input and practice that are above their level.

**User stories**
- As a learner, I want grove to give me a prompt I can copy into my own AI chat, and to take the answer I paste back, so that I get new texts without paying for an AI.
- As a learner, I want texts made mostly of words I know, on a topic I pick, so that I can follow them and pick up new words.
- As a learner, I want grove to tell me exactly what's wrong with an answer and give me a short fix-it prompt, so that a bad answer costs one more paste at most.
- As a learner, I want my ratings of texts to tune how hard the next ones are, so that texts stay at my level.

**Acceptance scenarios**
- **Given** a signed-in learner with a ground of known words, **When** they ask for a part, **Then** grove shows a prompt for about 10 minutes of texts, with their known words, the topic, the target share of known words and the answer format. (RQ-01, RQ-19, RQ-28, RQ-186, RQ-182)
- **Given** a pasted answer that is valid and within the margins, **When** grove checks it, **Then** the texts are added and shown within 2 seconds. (RQ-41, RQ-127, RQ-216, Q-05)
- **Given** an answer that is cut off, isn't valid JSON or breaks a rule beyond the margins, **When** it is pasted, **Then** grove lists the problems, naming the sentences, and gives a fix-it prompt. (RQ-41, RQ-63, RQ-184, RQ-185)
- **Given** an answer with new words the AI didn't list, **When** grove checks it, **Then** grove finds them itself, doesn't reject the answer for it, and gives one short prompt for the meanings it lacks. (RQ-379)
- **Given** a text with clearly fewer new words than the target, **When** it is pasted, **Then** it is accepted and the next prompt asks more firmly for new words. (RQ-378)

**Requirements** (MUST for must-priority, SHOULD for should-priority; reduced versions as reduced)
- MUST (RQ-01; N-15, N-39): Once per session, the learner sends their own AI a summary grove makes of what changed (what was done, ratings, marks, reports, explanations wanted) and pastes back the next set of texts and exercises.
- SHOULD (RQ-02; N-15): The summary for the AI and the answer pasted back are plain text: only what changed, never the whole learner data.
- MUST (RQ-11; N-13, N-44): The five-button rating after each text also goes to the AI with the session summary.
- MUST (RQ-17; N-37, N-42): The AI writes texts (with questions); grove makes the exercises for listening, reading, writing and grammar from those texts' sentences. **Reduced for the first build:** exercises for reading, listening and word meanings; writing and grammar later.
- MUST (RQ-19; N-41): The learner picks a topic, and texts are about it; it's shown on Home.
- MUST (RQ-28; N-11, N-13): Material the AI generates is mostly what the learner already knows, with at most 1 new word or phrase per sentence (the target; the exact number is still to be decided; PR-p1-130 sets how far an answer may miss it).
- MUST (RQ-33; N-11, N-13): Difficulty rises automatically as knowledge grows.
- MUST (RQ-36; N-42, N-06): The AI (by copy-paste) generates reading texts.
- MUST (RQ-40; N-15): Each AI feature shows a 'Copy prompt' button and a paste box.
- MUST (RQ-41; N-15, N-43): When a pasted answer is malformed or breaks the rules, grove lists the problems.
- MUST (RQ-46; N-02): After a text, questions in simple Swedish check understanding.
- SHOULD (RQ-50; N-04): Prompts ask the AI to reuse the learner's fading words in new texts.
- MUST (RQ-54; N-16): Sentences from accepted AI texts are saved and reused in later exercises.
- MUST (RQ-63; N-15, N-43): The fix-it message lists the exact sentences and words that broke the rules.
- MUST (RQ-64; N-11): Prompts ask the AI for inflected forms of known words; grove learns them so they stop counting as unknown.
- MUST (RQ-65; N-12): New words from an accepted text, grammar example or topic go straight into the tree as new, with the AI's meaning.
- MUST (RQ-127; N-15, N-11): Grove accepts an AI answer without a fix-it round when at most about 1 sentence in 10 has 2 new words; the exact margin is set after testing with real answers.
- MUST (RQ-165; N-41): A topic brings its own new words into the learner's tree.
- MUST (RQ-167; N-11, N-13): The share of known words in a text starts at 95%.
- MUST (RQ-168; N-11, N-13): The share of known words moves with the learner's ratings, between 93% and 98%.
- MUST (RQ-172; N-11, N-21, N-42): The AI generates items from what the learner knows.
- MUST (RQ-175; N-41, N-06): The AI gives starter vocabulary for topics.
- MUST (RQ-182; N-15): Learners copy a prompt from grove into their own AI chat and paste the answer back.
- MUST (RQ-183; N-15): The prompts work in any chat AI.
- MUST (RQ-184; N-15): The prompts ask for one JSON block (a fixed data format), which grove reads exactly.
- MUST (RQ-185; N-15, N-43): Grove gives a 'fix it' message to paste back into the same AI chat.
- MUST (RQ-186; N-42): Besides the session's summary exchange (RQ-01), the learner can ask for more texts in the same session with part prompts (about 10 minutes each by default; X-03 test, question-pages/52), without a summary. **Reduced for the first build:** each exchange returns one part of about 10 minutes (X-03 test, question-pages/52); 'more texts' asks for another part. Packages, mixes and sizes come later.
- MUST (RQ-193; N-13): A rating of 'almost nothing' or 'a little' leads to fewer new words and shorter sentences.
- MUST (RQ-195; N-13): Several 'most' or 'everything' ratings in a row lead to slightly more new words.
- SHOULD (RQ-216; N-15, N-11): Grove accepts an AI answer without a fix-it round when the text as a whole is within about 2 percentage points of the target share of known words; the exact margin is set after testing.
- MUST (RQ-355; N-13): A text counts as understood when rated 'most' or 'everything'.
- SHOULD (RQ-378; N-15, N-11): A text with clearly fewer new words than the target is still accepted; grove's next prompt asks more firmly for new words.
- MUST (RQ-379; N-15, N-12): Grove finds new words in an AI answer itself; new words the AI didn't list are not a reason to reject it, and grove gives one short prompt for the meanings of those not in its dictionary.

**Quality attributes:** Q-04, Q-05, Q-07

**Constraints for specify:** C-01, C-08, C-09

**Threat mitigations:** T-06, T-07

**Edge cases:**
- The answer is wrapped in prose or several code blocks: grove takes the JSON block (RQ-41).
- Inflected forms, homographs ('var') and compounds: counted against dictionary forms, not as new (R-03, Q-07).
- A large ground (thousands of words) makes the prompt too long for a free chat (R-04).
- The learner pastes the answer into the wrong part, or twice: grove notices and doesn't add texts twice.

---

## G-03: Reading and the word menu

From the scope groups: Reading and the word menu, Grammar basics, Explain and report.

**Needs (context)**
- N-02: A learner needs to understand texts without translating so that they learn to think in the language.
- N-04: A learner needs to have the words they keep forgetting practised until they stick so that gaps don't stay gaps.
- N-05: A learner needs to understand the grammar patterns behind sentences so that they can build sentences of their own.
- N-06: A learner needs to practise producing the language so that they can write as well as understand.
- N-11: A language learner needs to have new reading and listening material consist mostly of familiar words, phrases and grammar patterns so that they can follow it.
- N-12: A learner needs to focus practice on what they don't know yet rather than on what they already know so that their time goes where it helps.
- N-16: A learner benefits from following their language level and getting input and practice at that level.
- N-29: A learner needs to feel they're making progress.
- N-34: Learners need learning to feel enjoyable, not only hard work.
- N-37: Learners need practice in listening, reading, writing and grammar.
- N-38: Learners need help remembering what they learned.
- N-42: A learner needs to get a lot of understandable reading and listening so that they pick up the language naturally.
- N-43: Learners need to trust what they learn from.
- N-45: Learners need help with what they don't understand.

**User stories**
- As a learner, I want to read a text with a translation under each sentence that I can turn off, so that I understand without stopping.
- As a learner, I want one tap on a word to play it and open its menu (meaning here, dictionary form, status), so that I get help exactly where I'm stuck.
- As a learner, I want grammar patterns marked in sentences, so that I notice them.
- As a learner, I want to flag a word for the AI to explain, or report a wrong question, so that mistakes and puzzles get sorted out in the next exchange.

**Acceptance scenarios**
- **Given** a text, **When** the learner taps a word, **Then** it plays and its menu opens within 0.5 s with its meaning here, dictionary form and status. (RQ-18, Q-05)
- **Given** translations turned off, **When** a text opens, **Then** no translations show until turned on again. (RQ-10)
- **Given** a word flagged with 'Explain', **When** the next exchange is made, **Then** the prompt asks for its explanation, and the answer's explanation appears in the word's menu. (RQ-297, RQ-298)
- **Given** any text from an AI or a paste, **When** it is shown, **Then** it is shown as plain text, never as HTML. (T-06)

**Requirements** (MUST for must-priority, SHOULD for should-priority; reduced versions as reduced)
- MUST (RQ-10; N-11, N-38, N-02): After answering, and in texts, a translation shows under each sentence; a setting turns translations off.
- MUST (RQ-12; N-45, N-34): Grammar patterns are marked inside sentences in the pattern colour (one colour for all patterns); the pattern's name shows on tap.
- MUST (RQ-18; N-11, N-45, N-29): One tap on a word plays it and opens its menu: its meaning here, its dictionary form, its status and the phrases and patterns it's part of.
- MUST (RQ-29; N-05): Grammar patterns are tracked as items, alongside words and phrases.
- MUST (RQ-53; N-29): A dictionary lists every word, phrase and grammar pattern the learner has met.
- MUST (RQ-55; N-11): Each sentence shows how many new words it has.
- MUST (RQ-56; N-11): Character and place names have their own list and never count as new words.
- SHOULD (RQ-58; N-04): Multiple choice asks for a word's meaning inside a sentence, not on its own.
- MUST (RQ-74; N-16): Texts the learner pastes are saved (without English).
- MUST (RQ-76; N-11): Each text shows its word count, its new words and their share.
- MUST (RQ-171; N-04, N-12): Grammar patterns keep plain spaced repetition.
- MUST (RQ-177; N-42, N-06): The AI explains grammar.
- MUST (RQ-205; N-29): Each dictionary entry shows its translation.
- MUST (RQ-274; N-37): Reading sentences and passages with multiple-choice questions.
- MUST (RQ-276; N-11): After answering, the full text is shown, with a play button that highlights each sentence as it's read.
- MUST (RQ-278; N-37): After a sentence, grove asks what individual words mean in that sentence, with wrong options taken from other words' meanings.
- MUST (RQ-297; N-45): 'Explain': flag a word or phrase for the AI to explain in the next pack, with a reason (why this form, why this word is here, a different meaning than I know, reading, other) and a note.
- MUST (RQ-298; N-45): the AI's explanations appear in the word's menu in the next pack.
- MUST (RQ-301; N-45, N-43): Report a question (wrong answer, bad translation, unnatural sentence, wrong reading, audio, other, with a note): it doesn't count, and the AI fixes it in the next pack.
- MUST (RQ-357; N-29): Each dictionary entry shows an example of where the learner met it.

**Quality attributes:** Q-05, Q-07

**Constraints for specify:** C-09

**Threat mitigations:** T-06

**Edge cases:**
- A word with several readings or meanings in one text.
- A text with no pattern marks.
- A very long sentence on a narrow phone screen.

---

## G-04: Ground, drilling and progress

From the scope groups: Ground and drilling, Progress basics, Saving.

**Needs (context)**
- N-04: A learner needs to have the words they keep forgetting practised until they stick so that gaps don't stay gaps.
- N-11: A language learner needs to have new reading and listening material consist mostly of familiar words, phrases and grammar patterns so that they can follow it.
- N-12: A learner needs to focus practice on what they don't know yet rather than on what they already know so that their time goes where it helps.
- N-16: A learner benefits from following their language level and getting input and practice at that level.
- N-21: Learners need to be exposed to material above their level, ideally with some help.
- N-25: The owner needs users to have confidence in the methods grove uses.
- N-26: A user needs confidence in grove, to believe their efforts are worthwhile.
- N-29: A learner needs to feel they're making progress.
- N-32: Learners need to focus their efforts on activities that increase their language skills and confidence.
- N-36: Learners need an idea of their level and how much progress they've made.
- N-37: Learners need practice in listening, reading, writing and grammar.
- N-38: Learners need help remembering what they learned.
- N-42: A learner needs to get a lot of understandable reading and listening so that they pick up the language naturally.

**User stories**
- As a learner, I want words I don't mark to join my ground of known words, and the ones I mark to be drilled, so that practice goes to what I don't know.
- As a learner, I want to see my overall level and input minutes, so that I feel progress.
- As a learner, I want everything I do saved on grove's server, so that nothing is lost when I switch devices or grove restarts.

**Acceptance scenarios**
- **Given** a finished text, **When** the learner marks some new words and leaves the rest, **Then** the marked ones are drilled and the rest join the ground. (RQ-06, RQ-204)
- **Given** a change grove says is saved, **When** grove or the owner's computer restarts, **Then** the change is still there. (RQ-73, Q-03)
- **Given** a ground that covers a level's words, **When** the learner opens Home, **Then** the overall level shows it. (RQ-03, RQ-253)

**Requirements** (MUST for must-priority, SHOULD for should-priority; reduced versions as reduced)
- SHOULD (RQ-03; N-29): Grove estimates one overall level from the words in the learner's ground.
- MUST (RQ-06; N-37, N-04): Practice comes in three stages: Discover (new texts and items), Review (exercises on the words being drilled, on the drilling schedule) and Master (the hardest exercises, e.g. grammar build). **Reduced for the first build:** Discover and Review; Master later.
- MUST (RQ-07; N-11, N-04, N-12): From the word menu, the learner marks a word for drilling, as a Heard word (by ear) or on the Reading list (written).
- SHOULD (RQ-08; N-38): Heard words: the words the learner drills by ear, each with play, meaning and delete.
- MUST (RQ-32; N-11): Known items reappear in new contexts, instead of plain flashcard review.
- MUST (RQ-34; N-04, N-12): A word or phrase counts as learned when it's in the learner's ground.
- MUST (RQ-35; N-11, N-21, N-42): Learners can add items (words, phrases, patterns) themselves.
- SHOULD (RQ-48; N-29): Grove tracks hours of input (reading and listening).
- MUST (RQ-52; N-04, N-12): After new content arrives, the learner marks the words they don't know, only half know, or never remember.
- MUST (RQ-60; N-04): A drilled word joins the ground after a correct answer once its review interval reaches 4 days.
- SHOULD (RQ-71; N-29): Progress shows minutes of input per day.
- SHOULD (RQ-73; N-25, N-26): A welcome screen on the first visit.
- SHOULD (RQ-75; N-16): The learner's data is saved after every change.
- MUST (RQ-77; N-12, N-32): Unknown words can be added from the inspector.
- MUST (RQ-79; N-04): A drilled word counts as fading when its strength drops below 0.2.
- MUST (RQ-80; N-04): Practice shows fading items first.
- MUST (RQ-169; N-04, N-12): Ground items don't fade.
- MUST (RQ-170; N-04, N-12): Only drilled items have a spaced-repetition strength and can fade.
- MUST (RQ-200; N-04): A drilled item joins the ground when drilling succeeds.
- MUST (RQ-201; N-04): Meeting words in texts is counted and shown but doesn't change their schedule.
- MUST (RQ-203; N-04, N-12): Marked words are drilled.
- MUST (RQ-204; N-04, N-12): Unmarked words join the ground.
- SHOULD (RQ-207; N-12, N-32): When adding an unknown word, grove gives an AI prompt for its meaning.
- SHOULD (RQ-253; N-36): A level counts when it and every level below have 90% of their own words in your ground.
- MUST (RQ-294; N-38): Saved words and phrases are coloured in texts (heard, seen, both, retired, has another reading).
- SHOULD (RQ-356; N-29): Grove counts how many times the learner has met each word.

**Quality attributes:** Q-03, Q-07

**Constraints for specify:** —

**Threat mitigations:** —

**Edge cases:**
- 30–50 new words after one part: marking must not feel like a chore (R-12).
- A data-format change between builds keeps every learner's data (Q-03, R-06).

---

## G-05: Listening

From the scope groups: Listening.

**Needs (context)**
- N-02: A learner needs to understand texts without translating so that they learn to think in the language.
- N-03: A learner needs to hear the language spoken so that they learn pronunciation and listening.
- N-13: A learner needs to get practice and input at their own level so that it's neither too easy nor too hard.
- N-34: Learners need learning to feel enjoyable, not only hard work.
- N-37: Learners need practice in listening, reading, writing and grammar.

**User stories**
- As a learner, I want sentences read aloud with my device's Swedish voice, with replay and a speed slider, so that I learn to hear the language.
- As a learner without a Swedish voice, I want grove to tell me once how to add one, so that I'm not left with silence or an English voice.

**Acceptance scenarios**
- **Given** a device with a Swedish voice, **When** the learner plays a text, **Then** each sentence is read and highlighted while it's read. (RQ-20, RQ-21)
- **Given** no Swedish voice, **When** listening is first used, **Then** grove says so once, with how to add one, and doesn't read with another language's voice. (RQ-20, RQ-369)
- **Given** the speed slider, **When** the learner sets it between 0.5× and 1.5×, **Then** the voice uses it where the device allows, and a note says it depends on the device. (RQ-13, X-02, RQ-365)

**Requirements** (MUST for must-priority, SHOULD for should-priority; reduced versions as reduced)
- MUST (RQ-13; N-37, N-03, N-13, N-02): Speech speed is set with a slider from 0.5× to 1.5×, starting at normal (1×).
- MUST (RQ-14; N-37): While listening, the learner can replay and sees how many times they've played it.
- MUST (RQ-20; N-03): Read aloud only where the device has a voice for the language; otherwise grove says so once, with how to add one.
- MUST (RQ-21; N-03, N-34): The sentence being read aloud is highlighted.
- MUST (RQ-47; N-03): Listening: the learner can listen first and see the text afterwards.
- SHOULD (RQ-57; N-02, N-03): Listening mode blurs the text until clicked.
- MUST (RQ-197; N-03): One sentence can be played on a loop.
- MUST (RQ-198; N-03): A whole text can be played audio-only.
- SHOULD (RQ-270; N-37): Listening passages: a short passage with comprehension questions.
- SHOULD (RQ-365; N-03): Under the speech-speed slider, a short note says that how well it works depends on the device's voice.
- SHOULD (RQ-369; N-03): When the device has no Swedish voice, grove says which browsers on which devices have one.

**Quality attributes:** Q-05

**Constraints for specify:** C-03

**Threat mitigations:** —

**Edge cases:**
- The browser loads voices late (after page load).
- A voice ignores the rate setting.

---

## G-06: Starting level

From the scope groups: Starting level.

**Needs (context)**
- N-12: A learner needs to focus practice on what they don't know yet rather than on what they already know so that their time goes where it helps.
- N-13: A learner needs to get practice and input at their own level so that it's neither too easy nor too hard.
- N-43: Learners need to trust what they learn from.

**User stories**
- As a new learner, I want to pick a starting level and untick the sample words I don't know, so that my ground starts close to what I really know.

**Acceptance scenarios**
- **Given** a new learner, **When** they choose a level, **Then** grove shows a sample of 30 of that level's words to tick as unknown, and the rest join the ground. (RQ-113, RQ-114, RQ-249)
- **Given** Home, **When** the learner taps 'Set my starting level again', **Then** the starting check runs again. (RQ-252)

**Requirements** (MUST for must-priority, SHOULD for should-priority; reduced versions as reduced)
- MUST (RQ-113; N-12, N-13): A new learner can pick their CEFR level; grove adds the most common words for that level to their ground.
- MUST (RQ-114; N-12, N-13): After picking a level, grove shows a sample of words from that level; the learner ticks the ones they don't know, and the rest of the level's words join the ground (known by default).
- SHOULD (RQ-117; N-43): The list of words ranked by how common they are (frequency list) lives in the shared bank for each language (PR-p1-89, PR-p1-110). **Reduced for the first build:** the Kelly list as a plain file, not in a shared bank.
- SHOULD (RQ-248; N-13): A new account (other than a reviewer's, RQ-363) goes straight to the starting level, after the welcome.
- SHOULD (RQ-249; N-12): The starting check shows a sample of 30 of the level's words.
- SHOULD (RQ-252; N-13): Home has a 'Set my starting level again' button.

**Quality attributes:** Q-07

**Constraints for specify:** C-05, C-09

**Threat mitigations:** —

**Edge cases:**
- A complete beginner: an empty ground.
- The learner ticks every sample word as unknown.

---

## G-07: Demo content for reviewers

From the scope groups: Demo content for reviewers.

**Needs (context)**
- N-15: A learner needs learning to be affordable, costing only as much as they're willing to pay for language learning.
- N-18: The owner needs clients to trust the product.

**User stories**
- As a reviewer, I want to land on Home as a demo learner with ready-made Swedish texts and some history, so that I can try grove fully before using an AI.

**Acceptance scenarios**
- **Given** a new account made with a reviewer invitation, **When** the reviewer first signs in, **Then** they skip the starting level and land on Home with the demo ground, drilled words, ratings and texts. (RQ-360…363)
- **Given** a reviewer, **When** they choose 'Set my starting level again', **Then** the demo ground is replaced with their own. (RQ-363)

**Requirements** (MUST for must-priority, SHOULD for should-priority; reduced versions as reduced)
- MUST (RQ-360; N-18): The owner can mark an invitation as a reviewer invitation.
- MUST (RQ-361; N-18, N-15): A reviewer account starts with a set of ready-made Swedish texts (demo content), made in advance in the AI answer format.
- MUST (RQ-362; N-18): A reviewer account starts with a demo learner history: a ground of a few hundred words, some drilled words, ratings and progress.
- MUST (RQ-363; N-18): A reviewer account skips the starting level and lands on Home as the demo learner; 'Set my starting level again' replaces the demo ground with their own.

**Quality attributes:** Q-04

**Constraints for specify:** C-07, C-11

**Threat mitigations:** T-06

**Edge cases:**
- The demo texts must pass grove's own checks against the demo ground (built from the X-03 answer in docs/middle/ai-test/).

---

## G-08: The look's extras and help

From the scope groups: The look (basics), Help. Its basics moved to G-01 (question-pages/53); the extras stay here.

**Needs (context)**
- N-11: A language learner needs to have new reading and listening material consist mostly of familiar words, phrases and grammar patterns so that they can follow it.
- N-25: The owner needs users to have confidence in the methods grove uses.
- N-26: A user needs confidence in grove, to believe their efforts are worthwhile.
- N-34: Learners need learning to feel enjoyable, not only hard work.

**User stories**
- As a learner, I want grove's name, logo and finishing touches (answer buttons, word-menu cards), so that it feels like one calm product.
- As a learner, I want a page explaining grove's terms (ground, drilling and so on), so that I understand the method.

**Acceptance scenarios**
- **Given** the header, **When** any page opens, **Then** it shows the logo drawn as in Appendix A.5 and the name Grove. (RQ-309, RQ-310, RQ-346)
- **Given** a device asking for reduced motion, **When** grove animates, **Then** it uses fewer animations. (RQ-308)
- **Given** the help page, **When** a learner opens it, **Then** it explains grove's terms (ground, drilling and so on). (RQ-370)

**Requirements** (MUST for must-priority, SHOULD for should-priority; reduced versions as reduced)
- SHOULD (RQ-308; N-11): Fewer animations when the device asks for reduced motion.
- SHOULD (RQ-309; N-34): The app is called Grove, with the tagline 'grow from what you know'.
- SHOULD (RQ-310; N-34): The logo is three small trees on a ground line.
- SHOULD (RQ-319; N-34): Answer options are large rounded buttons: a right one turns green with a check mark and a small bounce; a wrong one turns red with a cross and shakes.
- SHOULD (RQ-322; N-34): Word menus are pop-up cards that slide up over a blurred background, with a coloured header strip.
- SHOULD (RQ-346; N-34): The logo is drawn exactly as in Appendix A.5.
- SHOULD (RQ-370; N-25, N-26): A page explains grove's own terms (such as ground, drilling, CEFR), reachable from every screen.

**Quality attributes:** Q-05

**Constraints for specify:** C-03

**Threat mitigations:** —

**Edge cases:**
- An older phone where blur and glows lag (R-15).

---

## Traceability

Filled in during phase 3.

| Combined requirement | Goal | Needs | Spec requirements (spec folder, FR-…) | Tests |
|---|---|---|---|---|
| RQ-01 | G-02 | N-15, N-39 | | |
| RQ-02 | G-02 | N-15 | | |
| RQ-03 | G-04 | N-29 | | |
| RQ-06 | G-04 | N-37, N-04 | | |
| RQ-07 | G-04 | N-11, N-04, N-12 | | |
| RQ-08 | G-04 | N-38 | | |
| RQ-10 | G-03 | N-11, N-38, N-02 | | |
| RQ-11 | G-02 | N-13, N-44 | | |
| RQ-12 | G-03 | N-45, N-34 | | |
| RQ-13 | G-05 | N-37, N-03, N-13, N-02 | | |
| RQ-14 | G-05 | N-37 | | |
| RQ-17 | G-02 | N-37, N-42 | | |
| RQ-18 | G-03 | N-11, N-45, N-29 | | |
| RQ-19 | G-02 | N-41 | | |
| RQ-20 | G-05 | N-03 | | |
| RQ-21 | G-05 | N-03, N-34 | | |
| RQ-23 | G-01 | N-19, N-05 | | |
| RQ-24 | G-01 | N-22 | | |
| RQ-25 | G-01 | N-13 | | |
| RQ-28 | G-02 | N-11, N-13 | | |
| RQ-29 | G-03 | N-05 | | |
| RQ-32 | G-04 | N-11 | | |
| RQ-33 | G-02 | N-11, N-13 | | |
| RQ-34 | G-04 | N-04, N-12 | | |
| RQ-35 | G-04 | N-11, N-21, N-42 | | |
| RQ-36 | G-02 | N-42, N-06 | | |
| RQ-38 | G-01 | N-16, N-19 | | |
| RQ-40 | G-02 | N-15 | | |
| RQ-41 | G-02 | N-15, N-43 | | |
| RQ-46 | G-02 | N-02 | | |
| RQ-47 | G-05 | N-03 | | |
| RQ-48 | G-04 | N-29 | | |
| RQ-50 | G-02 | N-04 | | |
| RQ-52 | G-04 | N-04, N-12 | | |
| RQ-53 | G-03 | N-29 | | |
| RQ-54 | G-02 | N-16 | | |
| RQ-55 | G-03 | N-11 | | |
| RQ-56 | G-03 | N-11 | | |
| RQ-57 | G-05 | N-02, N-03 | | |
| RQ-58 | G-03 | N-04 | | |
| RQ-60 | G-04 | N-04 | | |
| RQ-63 | G-02 | N-15, N-43 | | |
| RQ-64 | G-02 | N-11 | | |
| RQ-65 | G-02 | N-12 | | |
| RQ-71 | G-04 | N-29 | | |
| RQ-73 | G-04 | N-25, N-26 | | |
| RQ-74 | G-03 | N-16 | | |
| RQ-75 | G-04 | N-16 | | |
| RQ-76 | G-03 | N-11 | | |
| RQ-77 | G-04 | N-12, N-32 | | |
| RQ-79 | G-04 | N-04 | | |
| RQ-80 | G-04 | N-04 | | |
| RQ-90 | G-01 | N-16, N-17 | | |
| RQ-113 | G-06 | N-12, N-13 | | |
| RQ-114 | G-06 | N-12, N-13 | | |
| RQ-117 | G-06 | N-43 | | |
| RQ-125 | G-01 | N-15, N-20 | | |
| RQ-127 | G-02 | N-15, N-11 | | |
| RQ-141 | G-01 | N-27, N-28 | | |
| RQ-146 | G-01 | N-18, N-20 | | |
| RQ-147 | G-01 | N-24 | | |
| RQ-155 | G-01 | N-20, N-24 | | |
| RQ-156 | G-01 | N-20 | | |
| RQ-157 | G-01 | N-20 | | |
| RQ-160 | G-01 | N-18 | | |
| RQ-161 | G-01 | N-18 | | |
| RQ-162 | G-01 | N-20, N-18 | | |
| RQ-163 | G-01 | N-22 | | |
| RQ-165 | G-02 | N-41 | | |
| RQ-167 | G-02 | N-11, N-13 | | |
| RQ-168 | G-02 | N-11, N-13 | | |
| RQ-169 | G-04 | N-04, N-12 | | |
| RQ-170 | G-04 | N-04, N-12 | | |
| RQ-171 | G-03 | N-04, N-12 | | |
| RQ-172 | G-02 | N-11, N-21, N-42 | | |
| RQ-175 | G-02 | N-41, N-06 | | |
| RQ-177 | G-03 | N-42, N-06 | | |
| RQ-178 | G-01 | N-42, N-06 | | |
| RQ-180 | G-01 | N-16, N-19 | | |
| RQ-181 | G-01 | N-16, N-19 | | |
| RQ-182 | G-02 | N-15 | | |
| RQ-183 | G-02 | N-15 | | |
| RQ-184 | G-02 | N-15 | | |
| RQ-185 | G-02 | N-15, N-43 | | |
| RQ-186 | G-02 | N-42 | | |
| RQ-193 | G-02 | N-13 | | |
| RQ-195 | G-02 | N-13 | | |
| RQ-197 | G-05 | N-03 | | |
| RQ-198 | G-05 | N-03 | | |
| RQ-200 | G-04 | N-04 | | |
| RQ-201 | G-04 | N-04 | | |
| RQ-203 | G-04 | N-04, N-12 | | |
| RQ-204 | G-04 | N-04, N-12 | | |
| RQ-205 | G-03 | N-29 | | |
| RQ-207 | G-04 | N-12, N-32 | | |
| RQ-216 | G-02 | N-15, N-11 | | |
| RQ-217 | G-01 | N-18, N-20 | | |
| RQ-218 | G-01 | N-20 | | |
| RQ-219 | G-01 | N-20 | | |
| RQ-221 | G-01 | N-20 | | |
| RQ-222 | G-01 | N-20 | | |
| RQ-223 | G-01 | N-18 | | |
| RQ-224 | G-01 | N-19 | | |
| RQ-225 | G-01 | N-18 | | |
| RQ-226 | G-01 | N-17 | | |
| RQ-227 | G-01 | N-18 | | |
| RQ-228 | G-01 | N-27, N-28 | | |
| RQ-229 | G-01 | N-20 | | |
| RQ-231 | G-01 | N-18 | | |
| RQ-248 | G-06 | N-13 | | |
| RQ-249 | G-06 | N-12 | | |
| RQ-252 | G-06 | N-13 | | |
| RQ-253 | G-04 | N-36 | | |
| RQ-270 | G-05 | N-37 | | |
| RQ-274 | G-03 | N-37 | | |
| RQ-276 | G-03 | N-11 | | |
| RQ-278 | G-03 | N-37 | | |
| RQ-294 | G-04 | N-38 | | |
| RQ-297 | G-03 | N-45 | | |
| RQ-298 | G-03 | N-45 | | |
| RQ-301 | G-03 | N-45, N-43 | | |
| RQ-306 | G-01 | N-11 | | |
| RQ-308 | G-08 | N-11 | | |
| RQ-309 | G-08 | N-34 | | |
| RQ-310 | G-08 | N-34 | | |
| RQ-312 | G-01 | N-34 | | |
| RQ-314 | G-01 | N-34 | | |
| RQ-316 | G-01 | N-34 | | |
| RQ-319 | G-08 | N-34 | | |
| RQ-322 | G-08 | N-34 | | |
| RQ-331 | G-01 | N-34 | | |
| RQ-334 | G-01 | N-34 | | |
| RQ-335 | G-01 | N-34 | | |
| RQ-337 | G-01 | N-34 | | |
| RQ-338 | G-01 | N-34 | | |
| RQ-339 | G-01 | N-34 | | |
| RQ-340 | G-01 | N-34 | | |
| RQ-341 | G-01 | N-34 | | |
| RQ-346 | G-08 | N-34 | | |
| RQ-355 | G-02 | N-13 | | |
| RQ-356 | G-04 | N-29 | | |
| RQ-357 | G-03 | N-29 | | |
| RQ-360 | G-07 | N-18 | | |
| RQ-361 | G-07 | N-18, N-15 | | |
| RQ-362 | G-07 | N-18 | | |
| RQ-363 | G-07 | N-18 | | |
| RQ-364 | G-01 | N-18 | | |
| RQ-365 | G-05 | N-03 | | |
| RQ-366 | G-01 | N-20, N-18 | | |
| RQ-367 | G-01 | N-20, N-24 | | |
| RQ-368 | G-01 | N-18 | | |
| RQ-369 | G-05 | N-03 | | |
| RQ-370 | G-08 | N-25, N-26 | | |
| RQ-371 | G-01 | N-18 | | |
| RQ-372 | G-01 | N-24 | | |
| RQ-376 | G-01 | N-25, N-43 | | |
| RQ-378 | G-02 | N-15, N-11 | | |
| RQ-379 | G-02 | N-15, N-12 | | |

## Appendix A: visual design

Carried with RQ-306…347 (copied from p0's requirements, where it was recorded from the imported page on 2026-10-20; design values, not code).


The exact values the imported page uses, after its three rounds of styling (2026-10-13 redesign, 2026-10-16 Grove look and step 2). PR-p0-115…128 refer to this appendix.

### A.1 Colour tokens

Night forest is the dark look, Pale birch the light one. Each look follows the device's setting by default (PR-p0-82).

| Token | Used for | Night forest (dark) | Pale birch (light) |
|---|---|---|---|
| `--bg` | page background | `#0A110E` | `#F3F0E8` |
| `--bgimg` | background glows | `radial-gradient(900px 520px at 8% -8%,rgba(98,140,80,.22),transparent 62%),radial-gradient(760px 480px at 105% 6%,rgba(199,154,100,.14),transparent 60%),radial-gradient(700px 520px at 50% 115%,rgba(60,110,90,.16),transparent 60%)` | `radial-gradient(900px 560px at 0% -10%,rgba(150,180,120,.30),transparent 62%),radial-gradient(760px 480px at 110% 0%,rgba(214,190,150,.38),transparent 60%),radial-gradient(700px 500px at 50% 120%,rgba(225,215,190,.55),transparent 60%)` |
| `--card` | card (frosted) | `rgba(255,255,255,.05)` | `rgba(255,255,255,.72)` |
| `--card2` | raised card, buttons, inputs | `rgba(255,255,255,.08)` | `rgba(255,255,255,.92)` |
| `--ink` | text | `#E8F0E9` | `#1E2A22` |
| `--muted` | secondary text | `#93A399` | `#626C61` |
| `--line` | lines and borders | `rgba(255,255,255,.09)` | `rgba(30,42,34,.10)` |
| `--accent` | accent (main green) | `#7FA866` | `#4A6B3A` |
| `--accent2` | accent, gradient end | `#A3C487` | `#6B8F55` |
| `--onacc` | text on accent | `#0C160A` | `#FFFFFF` |
| `--soft` | soft accent fill (selected chips, highlights) | `rgba(127,168,102,.16)` | `rgba(74,107,58,.11)` |
| `--ok` | right | `#76DB5E` | `#2F9A2A` |
| `--ok-bg` | right, background | `rgba(102,214,86,.15)` | `#E3F5DF` |
| `--bad` | wrong | `#EB8A62` | `#B4532A` |
| `--bad-bg` | wrong, background | `rgba(214,110,70,.17)` | `#F8E5DC` |
| `--amber` | amber (partly right, loops, alternative readings) | `#D9A55B` | `#B7791F` |
| `--wood` | wood (streak, retire check) | `#C79A64` | `#9A6B3E` |
| `--shadow` | card shadow | `0 12px 34px rgba(0,0,0,.45)` | `0 10px 30px rgba(70,60,40,.12)` |
| `--glow` | glow (main buttons, selected cards) | `0 0 0 1px rgba(127,168,102,.45),0 6px 22px rgba(127,168,102,.28)` | `0 0 0 1px rgba(74,107,58,.35),0 6px 20px rgba(74,107,58,.22)` |
| `--pbg` | pop-up background | `#121C16` | `#FFFFFF` |
| `--pink` | pop-up text | `#E8F0E9` | `#1C2130` |
| `--pbord` | pop-up border and header | `#7FA866` | `#4A6B3A` |
| `--phtx` | text on pop-up header | `#0C160A` | `#FFFFFF` |
| `--okb` | confirmation header | `#5FC54B` | `#3E9B35` |
| `--cw` | Heard words colour | `#7CB4FF` | `#2563EB` |
| `--rlc` | Reading list colour | `#D59BFF` | `#9333EA` |
| `--cb` | Heard + Reading list colour | `#4FD1C5` | `#0F8F86` |
| `--gpk` | grammar pattern colour | `#FF6FB0` | `#DB2777` |
| `--rw` | retired from Heard words | `#5E7697` | `#94A7C6` |
| `--rr` | retired from Reading list | `#83679A` | `#B89AC6` |
| `--rb` | retired from both | `#A08B6A` | `#A48A62` |
| `--t1` | pinyin tone 1 | `#FF8A80` | `#D0342C` |
| `--t2` | pinyin tone 2 | `#7FD68A` | `#2E8B3A` |
| `--t3` | pinyin tone 3 | `#8FB4FF` | `#2563C9` |
| `--t4` | pinyin tone 4 | `#D7A3E6` | `#8A3B9E` |
| `--t5` | pinyin neutral tone | `#A8A8A8` | `#7A7A7A` |
| `--cx` | (unused leftover) | `#FF6FB0` | `#DB2777` |
| `--cxs` | (unused leftover) | `#FDBA74` | `#C2410C` |

Fixed colours outside the tokens:
- **Listening player:** background `#070C0A` with `radial-gradient(800px 500px at 50% 0%, rgba(98,140,80,.22), transparent 60%)`; text `#E8EEF6`; secondary text `#93A399`; button borders `#2E3D33`; big buttons `linear-gradient(135deg, #7FA866, #A3C487)` with text `#0C160A` and shadow `0 0 0 1px rgba(127,168,102,.45), 0 8px 26px rgba(127,168,102,.32)`; wave rings `#A3C487`; progress fill `linear-gradient(90deg, #7FA866, #A3C487)`; track `#2A3548`.
- **Mastered:** underline `#D4A93A`; text and badge `#C99A2E` on `rgba(212,169,58,.16)`.
- **Overlays:** pop-up backdrop `rgba(5,8,14,.35)` with 12px blur; celebration backdrop `rgba(5,8,14,.55)` with 10px blur; explainer backdrop `rgba(4,8,6,.45)` with 8px blur.
- **Confetti:** `#7FA866`, `#A3C487`, `#C79A64`, `#E3C27A`, `#5FC54B`, `#D9A55B`.

### A.2 Type

- **Font:** Zen Kaku Gothic New from Google Fonts (weights 400, 500, 700), falling back to Hiragino Sans, Noto Sans JP, then the device's sans-serif.
- **Sizes:** body 15px, line height 1.6. App title 1.15rem; tagline 0.7rem. Section headings 1.05rem. Small text 0.82rem.
- **Text sizes that follow the size setting** (PR-p0-83, factor 0.8–1.6): passages 1.15rem (line height 1.9), question sentences 1.1rem (line height 2), tiles 1.12rem, single big words 2rem.
- **Readings:** 0.58em, in the secondary-text colour.
- **Translations:** 0.86rem, secondary-text colour, in the device's sans-serif.
- **Numbers** (levels, counts) use tabular figures.

### A.3 Shape, depth and layout

- **Layout:** one column, at most 560px wide, padding 0.7rem by 0.75rem, 6rem free at the bottom for the floating bar.
- **Top bar:** sticks to the top, with a background fading from the page colour, blurred 14px.
- **Corner radii:** sections and skill cards 22px; level cards 18px; pop-ups 22px; buttons 14px; answer options 16px; question cards 18px; tiles 12px; chips and pills fully round; celebration card 26px; explainer card 24px.
- **Frosted glass:** sections blur 18px with saturation 1.4; skill and level cards blur 18px; top-bar buttons blur 10px.
- **Depth:** cards use `--shadow`; main buttons, selected stages and the open level card use `--glow`.
- **Main buttons:** `linear-gradient(135deg, var(--accent), var(--accent2))`, text `--onacc`, weight 600. Every button shrinks to 97% while pressed.
- **Grids:** skill cards 2 columns (gap 0.6rem); level cards 4 columns (gap 0.4rem); stage buttons 3 columns (gap 0.5rem); mode buttons 1 column.
- **Progress bars:** 6px high, rounded, filled with `linear-gradient(90deg, var(--accent), var(--accent2))` and a soft glow of the accent colour.
- **Skill cards:** a 140px circular glow of the accent colour (35%) peeking from the top right corner.
- **Progress dots:** 11px leaves (two opposite corners rounded), gap 6px; right answers glow.
- **Result ring:** 76px, stroke 8, right colour (accent colour below 50%), filling over 0.9s.
- **Word underlines:** unsaved words have a 2px dotted underline in the secondary colour; patterns you ticked have a solid underline; another reading is marked by a small amber dot.
- **Explanation boxes:** a 3px bar down the left in the pattern colour (accent colour inside pop-ups), on the soft fill, 6px corners.

### A.4 Motion

All of this is reduced to short fades when the device asks for reduced motion (PR-p0-85).

- **Screens:** slide in from 18px right over 0.28s.
- **Listening player and quiz:** fade in over 0.2s.
- **Right answer:** a 3% bounce over 0.38s, with a check mark popping in.
- **Wrong answer:** shakes over 0.4s.
- **List buttons and streak:** bump to 128% when a word lands or a streak of 5 is reached.
- **Logo:** grows: the ground line draws in (0.35s), then the three trees rise one after another (0.75s each, 0.3s apart).
- **Pop-ups:** slide up 48px and fade over 0.25s; the tap bubble scales up from 60%.
- **Celebration:** 140 confetti pieces fall for 2.6s.
- **Retire:** stamps 'Retired' (rotated −12°), then folds the card away over 0.55s.
- **'Next item' button:** pulses while waiting.
- **Explainer card:** a 10-second bar empties.

### A.5 Logo

Three trees on a ground line, drawn with 2px rounded strokes in the accent colour (30px in the top bar, 64px on explainer cards):

```svg
<svg viewBox="0 0 32 32" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path class="gl" d="M3 27h26"/><g class="tr t1"><path d="M9 27V19M5 19l4-9 4 9z"/></g><g class="tr t2"><path d="M17 27V15M12 15l5-11 5 11z"/></g><g class="tr t3"><path d="M25 27v-6M22 21l3-7 3 7z"/></g></svg>
```
