# Feature Specification: Texts from the learner's own AI (G-02)

**Feature Branch**: `main` (no feature branch; spec folder `specs/002-texts-from-own-ai`)

**Created**: 2026-10-24

**Status**: Draft (clarified 2026-10-24, question-pages/57)

**Input**: User description: "G-02: Texts from the learner's own AI. The feature description is the G-02 section of docs/middle-steps.md (Part 2: Feed for Spec Kit), with the X-03 test (docs/middle/ai-test/) and grove's terms (docs/glossary.md). Follow the combined requirements as written; every spec requirement names its RQ and N IDs."

**Sources**: `docs/middle-steps.md` (G-02 feed), `docs/requirements.md`, `docs/needs.md`, `docs/middle/ai-test/` (the tested prompt and answers, question-pages/52), `docs/glossary.md` (question-pages/56), `docs/middle/` (constraints C-…, quality Q-…, threats T-…, risks R-…), `.specify/memory/constitution.md` v1.1.0. Builds on G-01 (`specs/001-platform-accounts-look`): accounts, sessions, the terms gate, the forest look.

**Terms** (docs/glossary.md): a **leaf** is a saved word, phrase or grammar pattern that isn't learned yet; all leaves are in **Leaves**; learned ones are in the **Ground**. In this spec, a word is **known** when it is in the learner's ground (RQ-34), and **new** otherwise. Marking leaves (To remember / To read), drilling and falling come in G-03 and G-04.

## Clarifications

### Session 2026-10-24

- Q: When does a new session start, so the prompt carries the summary? → A: Not by time: grove works on one **package** at a time; a new package (whose first prompt carries the summary) starts when the current one is finished or the learner asks for a new one (question-pages/57).
- Q: How big is a package? → A: Several parts: **3 parts** of about 10 minutes, about 30 minutes in all (question-pages/57).
- Q: What does a "next part" prompt look like? → A: Self-contained (known words, rules and format every time) with a hint to continue part 1's story if the chat has it (question-pages/57).
- Q: What's in one part? → A: **3 texts of about 130 words** each, with 2–3 questions each (question-pages/57).

### Combined requirements changed in clarify

| RQ | As written for the first build | In this spec |
|---|---|---|
| RQ-01 | Once per session, a summary exchange | Once per package: the package's first prompt carries the summary (FR-203) |
| RQ-186 | Reduced: each exchange returns one part; 'more texts' asks for another part; packages later | Packages of 3 parts; a part is 3 texts of ~130 words; sizes to choose from (RQ-348) still later (FR-202) |
| RQ-188 | 'Next part' prompt until the package is complete (second build in docs/middle/scope.md; not in G-02's feed) | Moved into the first build: grove gives the next part's prompt until the package's 3 parts are in (FR-203) |

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Get a part of texts from my own AI (Priority: P1)

A learner on Home sees their topic and taps **Get texts**. Grove shows a prompt for part 1 of a package: about 10 minutes of reading (three short texts) on that topic, made from the words in their ground, with a **Copy prompt** button. The learner pastes it into their own chat AI (free ChatGPT, Claude, Gemini or another), copies the whole answer, pastes it into grove's paste box and taps **Add texts**. Grove checks it and, if it's within the margins, adds the texts and shows them.

**Why this priority**: Texts are grove's input; without this exchange nothing else in the learning loop has material (C-08).

**Independent Test**: With a learner whose ground has a few hundred words, copy the prompt, paste a valid answer (the X-03 Claude answer adapted to the format), and see the texts added and listed within 2 seconds.

**Acceptance Scenarios**:

1. **Given** a signed-in learner with a ground of known words and a topic, **When** they ask for texts, **Then** grove shows a prompt for about 10 minutes of texts, with their known words, the topic, the target share of known words, the per-sentence rule and the answer format, and a Copy prompt button and a paste box. (RQ-01, RQ-19, RQ-28, RQ-40, RQ-182, RQ-186)
2. **Given** a pasted answer that is valid and within the margins, **When** grove checks it, **Then** the texts are added and shown within 2 seconds. (RQ-41, RQ-127, RQ-216, Q-05)
3. **Given** an accepted answer, **When** it is added, **Then** its sentences are saved for later exercises, and its new words (with the AI's meanings) are added to the learner's Leaves. (RQ-54, RQ-65)
4. **Given** the answer is wrapped in other text or in a code block, **When** it is pasted, **Then** grove finds the JSON block and reads it. (RQ-41, RQ-184)
5. **Given** an answer that has already been added, or that belongs to another prompt, **When** it is pasted again, **Then** grove says so and adds nothing twice. (edge case of the feed)

---

### User Story 2 - A bad answer costs one more paste at most (Priority: P1)

The AI's answer is cut off, isn't valid JSON, or has too many new words. Grove tells the learner exactly what's wrong, naming the sentences and words, and gives a short **fix-it prompt** to paste back into the same chat. The corrected answer goes into the same paste box.

**Why this priority**: Free chats cap messages; every extra round costs the learner (C-08, R-01, Q-04).

**Independent Test**: Paste a cut-off answer, an answer that isn't JSON, and an answer where some sentences have three new words; each time grove lists the problems and offers a fix-it prompt; pasting a corrected answer adds the texts.

**Acceptance Scenarios**:

1. **Given** an answer that is cut off, isn't valid JSON or breaks a rule beyond the margins, **When** it is pasted, **Then** grove lists the problems, naming the sentences and the words, and gives a fix-it prompt. (RQ-41, RQ-63, RQ-184, RQ-185)
2. **Given** a fix-it prompt was given, **When** the learner pastes the corrected answer, **Then** grove checks it like a first answer and adds the texts when it passes. (RQ-185)
3. **Given** an answer with new words the AI didn't list, **When** grove checks it, **Then** grove finds them itself, doesn't reject the answer for that, and gives one short prompt for the meanings it lacks. (RQ-379)
4. **Given** a text with clearly fewer new words than the target, **When** it is pasted, **Then** it is accepted, and the next prompt asks more firmly for new words. (RQ-378)
5. **Given** an answer containing HTML or script, **When** it is added, **Then** it is shown as plain text and nothing runs. (T-06; constitution 4.6)

---

### User Story 3 - Read, answer and rate, and the next texts adapt (Priority: P1)

The learner opens a text, reads it line by line (with the English translation one tap away), answers its questions in simple Swedish, and rates how much they understood with one of five buttons. Low ratings make the next texts easier; several high ratings in a row make them a little harder.

**Why this priority**: The rating keeps texts at the learner's level (N-13), and the questions check understanding (RQ-46).

**Independent Test**: Read an added text, answer its questions, rate it "a little", and see the next prompt ask for fewer new words and shorter sentences; rate three texts "most" or "everything" and see the next prompt ask for slightly more.

**Acceptance Scenarios**:

1. **Given** an added text, **When** the learner opens it, **Then** they see its title and lines in Swedish, can show each line's English translation, and after the text get its questions with their options. (RQ-36, RQ-46)
2. **Given** the learner has read a text, **When** they choose one of the five ratings (almost nothing, a little, about half, most, everything), **Then** the rating is saved; "most" or "everything" counts the text as understood. (RQ-11, RQ-355)
3. **Given** a rating of "almost nothing" or "a little", **When** the next prompt is made, **Then** it asks for a higher share of known words (fewer new words) and shorter sentences. (RQ-168, RQ-193)
4. **Given** three "most" or "everything" ratings in a row, **When** the next prompt is made, **Then** it asks for a slightly lower share of known words (slightly more new words). (RQ-168, RQ-195)
5. **Given** any number of ratings, **When** the target share changes, **Then** it stays between 93% and 98%, starting at 95%. (RQ-167, RQ-168)

---

### User Story 4 - Pick a topic (Priority: P2)

The learner picks a topic (their own words, e.g. "a small café in Stockholm"). Grove shows it on Home, and the next prompt asks for texts on it and for the topic's starter vocabulary, which joins the learner's Leaves.

**Why this priority**: Topics keep the input interesting (N-41); texts work without a chosen topic by using a default one.

**Independent Test**: Set a topic, see it on Home and in the next prompt, paste an answer with starter words, and see them in Leaves.

**Acceptance Scenarios**:

1. **Given** a learner on Home, **When** they set a topic, **Then** it is shown on Home and used in the next prompt. (RQ-19)
2. **Given** a new topic, **When** the next prompt is made, **Then** it asks the AI for starter vocabulary for that topic, and the starter words from the accepted answer join the learner's Leaves as new words with their meanings. (RQ-165, RQ-175)

---

### User Story 5 - A package at a time, starting with what changed (Priority: P2)

Grove works on one package of 3 parts at a time. The package's first prompt carries a short summary of what changed since the last summary: the texts read, their ratings, question results, and (once those goals exist) marks, reports and explanations wanted. Parts 2 and 3 are asked for with **Next part** prompts without a summary. When the package is finished, or the learner asks for a new one, the next prompt starts a new package with a new summary.

**Why this priority**: The summary lets the learner's AI adapt between packages without grove storing or sending the whole learner data (RQ-01, RQ-02).

**Independent Test**: Finish a package, then see the next prompt carry a summary listing exactly the texts read since the last summary with their ratings and question results; ask for part 2 within a package and see a prompt without a summary; ask for a new package early and see the summary come with it.

**Acceptance Scenarios**:

1. **Given** no package is open (none yet, or the last one is finished), **When** the learner asks for texts, **Then** the prompt is part 1 of 3 of a new package and carries a plain-text summary of only what changed since the last summary: texts done with their ratings and question results. (RQ-01, RQ-02, RQ-11)
2. **Given** an open package with parts left, **When** the learner asks for the next part, **Then** the prompt asks for part 2 (or 3) of 3, is self-contained (known words, rules, format) with a hint to continue the earlier parts' story if the chat has them, and carries no summary. (RQ-186, RQ-188)
3. **Given** an open package with parts left, **When** the learner asks for a new package instead, **Then** the open package is closed as it stands and the new package's first prompt carries the summary. (RQ-01)

---

### Edge Cases

- The answer is wrapped in prose or several code blocks: grove takes the block that parses as the expected JSON; if several do, the first. (RQ-41)
- The answer is cut off mid-JSON: grove says it was cut off and gives a fix-it prompt asking for the rest as a complete JSON block. (RQ-41, R-01)
- The AI writes several sentences on one line: grove splits lines into sentences itself before checking the per-sentence rule (X-03, question-pages/52).
- Inflected forms, homographs ("var") and compounds: counted against known words' dictionary forms and the forms grove has learned, not as new. (R-03, Q-07, RQ-64)
- Names of people and places: never new (listed by the AI in "names"); numbers are never new.
- A large ground (thousands of words) would make the prompt too long for a free chat: the prompt lists at most 1,500 known words, chosen as described in FR-208. (R-04)
- The learner's ground is empty: the prompt asks for absolute-beginner texts built from the topic's starter vocabulary, and the first answer's words all join Leaves.
- The learner pastes the answer into the wrong box or twice: grove notices from the part code and doesn't add texts twice. (feed)
- The paste is larger than 100 KB: refused with the G-01 message. (RQ-231, T-07)
- The answer has extra fields, wrong types or absurd sizes (e.g. 500 texts): refused as not matching the format, with a fix-it prompt; nothing is stored. (T-07; constitution 2.4)
- A meanings prompt's answer lists a word grove didn't ask about: ignored.
- The learner changes topic in the middle of a package: the remaining parts use the new topic; the summary of the next package says the topic changed.
- Several devices of the shared reviewer account paste at once: each answer is checked against its own part code; the last save wins for the topic and target share. (question-pages/55)

## Requirements *(mandatory)*

MUST for must-priority combined requirements, SHOULD for should-priority ones, as in the G-02 feed; reduced versions as reduced. Each requirement names the combined requirements (RQ-…) and needs (N-…) it comes from; other sources (C-, Q-, R-, T-, constitution) are added where they shape it. Tests are named after the FR ID and its RQ IDs. G-02's requirements are numbered FR-201… so test names stay unique across goals.

### Functional Requirements

**The exchange**

- **FR-201** (RQ-182, RQ-183, RQ-40, RQ-36; N-15, N-42, N-06; C-01, C-08): Every AI feature MUST show a prompt, a **Copy prompt** button and a paste box. The learner copies the prompt into their own chat AI and pastes the answer back; grove never calls an AI itself. The prompts MUST work in any chat AI: plain English instructions, no tool use, no file upload.
- **FR-202** (RQ-186; N-42): A **part** MUST be about 10 minutes of reading: three texts of about 130 words each, each with 2–3 questions. A **package** is 3 parts. **Reduced for the first build:** every exchange returns one part; the package size is fixed; mixes and sizes to choose from come later (RQ-348).
- **FR-203** (RQ-01, RQ-02, RQ-11, RQ-186, RQ-188; N-15, N-39, N-13, N-44, N-42): Grove MUST work on one package at a time. The first prompt of a package carries a plain-text summary of only what changed since the last summary: each text done (title, rating, questions right out of asked); later goals add marks, reports and explanations wanted. It never carries the whole learner data. Grove then gives a **Next part** prompt for parts 2 and 3, without a summary; each is self-contained (known words, rules, format) and asks the AI to continue the earlier parts' story and characters if the chat has them. A package is **finished** when its 3 parts are accepted and every text in it is rated; the next prompt then starts a new package. The learner can also ask for a **New package** early, which closes the open one as it stands.
- **FR-204** (RQ-184; N-15): Every prompt MUST ask for exactly one JSON block in a fixed format: a part code (echoed from the prompt), texts (title, lines with Swedish and English, questions with options and the index of the right one), new words (form, dictionary form, English meaning, simple Swedish explanation), new fixed phrases, inflected forms of known words, names, and, for a new topic, starter vocabulary. Lines hold one sentence each.
- **FR-205** (RQ-41, RQ-184; N-15, N-43; T-07; constitution 2.4): Grove MUST find the JSON block in the pasted answer (inside prose or code fences), parse it strictly against the format with size limits (at most 4 texts, 60 lines per text, 400 characters per line, 6 questions per text, 200 new words), and refuse anything else with the problems listed. Nothing from a refused answer is stored.
- **FR-206** (RQ-185, RQ-63; N-15, N-43): When an answer is refused, grove MUST give a **fix-it prompt** to paste into the same chat, listing each problem: cut off, not valid JSON, missing or wrong fields, or, for rule breaks, the exact sentences quoted with the new words that broke the rule. It asks for the whole corrected JSON block again. The paste box takes the corrected answer for the same part.
- **FR-207** (RQ-379; N-15, N-12): Grove MUST find the new words in an accepted answer itself (every word not known and not explained as an inflection, name or number). New words the AI didn't list are not a reason to refuse an answer. For new words without a meaning, grove gives one short **meanings prompt**; its answer (one JSON block of form, dictionary form, English meaning, simple Swedish explanation) fills them in. Words still without a meaning show "meaning missing".

**What the prompt asks for**

- **FR-208** (RQ-28, RQ-172, RQ-33, RQ-64; N-11, N-13, N-21, N-42; R-04): The prompt MUST list the learner's known words in dictionary form, at most 1,500: first the words of the topic and its starter vocabulary, then the most recently learned, then the most common (by how often they appear in the learner's accepted texts). It asks the AI to use mostly these words (any inflection), to list inflected forms of known words that aren't spelled as listed, and to keep names in "names". As the ground grows, the list grows with it, so texts get harder by themselves.
- **FR-209** (RQ-28, RQ-167, RQ-168; N-11, N-13): The prompt MUST state the target share of known words for each text (starting at 95%, kept between 93% and 98%) and the per-sentence rule: at most 1 new word or fixed phrase per sentence.
- **FR-210** (RQ-50; N-04): The prompt SHOULD ask the AI to reuse up to 10 of the learner's leaves, the most recently added first (later replaced by the fading words of G-04).
- **FR-211** (RQ-19, RQ-165, RQ-175; N-41, N-06): The prompt MUST name the learner's topic; for a topic not used before, it asks for 10–15 starter words for it, which join the learner's Leaves from the accepted answer.
- **FR-212** (RQ-378, RQ-193, RQ-195; N-15, N-11, N-13): After an accepted text with clearly fewer new words than the target (more than 2 percentage points above the target share of known words), the next prompt MUST ask more firmly for new words. After a low rating it asks for shorter sentences (FR-218).

**Checking an answer**

- **FR-213** (RQ-28, RQ-127, RQ-216; N-15, N-11; Q-07; R-03): Grove MUST split each line into sentences and each sentence into words (Unicode-aware, å ä ö), and count a word as known when its form is known: a known word's dictionary form, an inflected form listed by the AI or learned before, or a regular Swedish inflection of a known word (recognised by its ending); compounds made only of known words count as known. Names and numbers are never counted. A fixed phrase listed as new counts as one new item.
- **FR-214** (RQ-127, RQ-216, RQ-28; N-15, N-11): An answer MUST be accepted without a fix-it round when, in every text: no sentence has 3 or more new items; at most 1 sentence in 10 (rounded up) has 2 new items; and the share of known words is no more than 2 percentage points below the target. The margins are settings, set after testing with real answers. Fewer new words than the target is never a reason to refuse (RQ-378).
- **FR-215** (RQ-41, Q-05; N-15, N-43): Checking a pasted answer of one part and showing its texts MUST take at most 2 seconds on the owner's computer (measured by an automated timing test).

**After an accepted answer**

- **FR-216** (RQ-54, RQ-65, RQ-64, RQ-165; N-16, N-12, N-11): For an accepted answer grove MUST save its texts and their sentences (for later exercises); add each new word and phrase to the learner's Leaves with the AI's meaning, simple Swedish explanation and the text it came from; and learn every listed inflected form of a known word, so it no longer counts as new.
- **FR-217** (RQ-17; N-37, N-42): The AI writes the texts and their questions; grove keeps each text's sentences so the exercises can be made from them. **Reduced for the first build:** exercises for reading (the AI's questions, here), listening (G-05) and word meanings (G-04); writing and grammar exercises later.

**Reading, questions and ratings**

- **FR-218** (RQ-36, RQ-46, RQ-11, RQ-355, RQ-193, RQ-195, RQ-167, RQ-168; N-42, N-02, N-13, N-44): A text MUST be readable line by line in Swedish, with each line's English translation shown on tap; after it, its questions in simple Swedish with their options, showing right or wrong after each answer; then a five-button rating: almost nothing, a little, about half, most, everything. "Most" or "everything" counts the text as understood. The target share of known words moves with the ratings: "almost nothing" +2 points and shorter sentences, "a little" +1 point and shorter sentences, "about half" no change, three "most" or "everything" in a row −1 point; always between 93% and 98%.
- **FR-219** (RQ-19, RQ-188; N-41, N-42): Home MUST show the learner's topic with a way to change it; the package's progress (e.g. "part 2 of 3"); a **Get texts** button (starting a package), **Next part** (within a package) and **New package**; the waiting prompt if one is open; and the learner's texts, newest first, each marked new, read or rated.

**Data and safety**

- **FR-220** (RQ-54, RQ-155; N-16, N-17; constitution 2.3): Texts, sentences, leaves, ratings and prompts MUST belong to one account; no account can read or change another's (as FR-018 of G-01).
- **FR-221** (T-06; N-43; constitution 4.6): Everything from a pasted answer MUST be shown as plain text only.

### Key Entities *(include if feature involves data)*

- **Package**: account, number of parts (3), parts accepted, status (open, finished, closed early), created time, and whether its first prompt carried the summary.
- **Exchange**: one prompt and its answer: account, package and part number, kind (part, fix-it, meanings), part code, whether it carries the summary, the prompt text, status (waiting, needs fix, accepted), created and answered times. A fix-it exchange belongs to the part it fixes.
- **Text**: an accepted text: account, exchange, title, topic, created time; its **lines** (Swedish, English) and **questions** (question, options, right option).
- **Sentence**: one sentence of a text's line, kept for exercises: text, position, Swedish, and its new items when added.
- **Word entry**: a word or fixed phrase grove has met: dictionary form, kind (word or phrase), English meaning, simple Swedish explanation (may be missing until a meanings answer); and its **forms** (inflected forms learned).
- **Learner word**: a word entry for one account, with its state (**leaf** or **ground**), when it was added and the text it came from. Ground words are the learner's known words.
- **Rating**: account, text, value (one of five), time; and **question answers** (right or wrong).
- **Learner settings**: topic, topics used before, target share of known words, the "ask more firmly for new words" flag, the time of the last summary.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A reviewer gets their first AI text into grove within 5 minutes of starting an exchange. (Q-04)
- **SC-002**: Of answers from free ChatGPT, Claude and Gemini to grove's prompt, 4 out of 5 are accepted on the first try, with no fix-it round, when tried by hand. (Q-04)
- **SC-003**: Checking a one-part answer and showing its texts takes at most 2 seconds. (Q-05)
- **SC-004**: Grove's count of new words is reported on a fixed test set of 50 real Swedish sentences (inflected forms, homographs, compounds); no minimum in the first build, and a lower score fails the test run. (Q-07)
- **SC-005**: A refused answer needs at most one fix-it paste to be accepted in 4 out of 5 cases, when tried by hand. (R-01, C-08)
- **SC-006**: With a ground of 5,000 words, the prompt stays under 16,000 characters. (R-04)

## Assumptions

- The learner's ground comes from the starting level (G-06) or, for the reviewer account, the demo history (G-07); until then a learner has an empty ground and gets beginner texts (edge case).
- Text kinds (series, retellings, dialogues, choose-your-path, easy reads; RQ-43, RQ-256, RQ-257) are not in the first build; a part is three plain texts.
- Word marks (To remember / To read), the word menu and colours in texts come in G-03; drilling, fading words and falling in G-04; listening in G-05. G-02 stores what they need.
- The five rating labels are p1's: almost nothing, a little, about half, most, everything.
- The starting values of the margins (FR-214) and the rating steps (FR-218) are settings, to be tuned after trying real answers (RQ-127, RQ-216).
- English is the learner's own language for meanings and translations in the first build (C-09).
- A simpler retelling after a low rating (RQ-194) is not in G-02's feed and is left out.
