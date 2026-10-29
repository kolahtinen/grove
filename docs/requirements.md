# Combined requirements: grove

Phase 2 (`/pre.combine`, 2026-10-20). The requirements of p0 and p1 (neither rejected), combined. These are where the spec starts: `/speckit.specify` follows them unless they're changed in clarify, with the needs as context. IDs are never renumbered.

- **Sources:** the prototype requirements it came from.
- **Rewords or merges?** yes = merged, reworded or settled by a conflict decision (question-pages/44, 45): it needs its own feasibility check. 'wording only' = 'Claude' became 'the AI'.
- **Priority:** carried from the prototypes' scope drafts and answers; redone app-wide by `/pre.scope`.

| ID | Requirement | Sources | Rewords or merges? | Needs | Feasibility | Priority | Status |
|---|---|---|---|---|---|---|---|
| RQ-01 | Once per session, the learner sends their own AI a summary grove makes of what changed (what was done, ratings, marks, reports, explanations wanted) and pastes back the next set of texts and exercises. | PR-p0-04, PR-p0-07, PR-p1-24 | yes (conflict 1 (p0's way), X-p0-01; conflict 12: extra part prompts allowed, RQ-186) | N-15, N-39 | F-01: possible with limits, X-03 | must | active |
| RQ-02 | The summary for the AI and the answer pasted back are plain text: only what changed, never the whole learner data. | PR-p0-08 | yes (X-p0-01) | N-15 | F-02: easy | should | active |
| RQ-03 | Grove estimates one overall level from the words in the learner's ground. | PR-p1-64, PR-p1-210 | yes (conflict 2) (combine correction 2026-10-21 (question-pages/47)) | N-29 | F-03: possible with limits, X-p1-04 | should | active |
| RQ-04 | Each skill (listening, reading, writing, grammar) also has its own level, combining the learner's exercise results in that skill with the overall level (RQ-03). | PR-p0-20 | yes (conflict 2; how it moves: question-pages/45) | N-37 | F-04: easy | should | active |
| RQ-05 | The learner can drag a level to set where the AI pitches the next texts. | PR-p0-23 | yes (conflict 2) | N-13 | F-05: easy | should | active |
| RQ-06 | Practice comes in three stages: Discover (new texts and items), Review (exercises on the words being drilled, on the drilling schedule) and Master (the hardest exercises, e.g. grammar build). | PR-p0-24, PR-p1-36 | yes (conflict 3) | N-37, N-04 | F-06: easy | must | active |
| RQ-07 | From the word menu, the learner marks a word for drilling, as a Heard word (by ear) or on the Reading list (written). | PR-p0-62, PR-p1-90, PR-p1-174 | yes (conflict 4: lists = drilling) | N-11, N-04, N-12 | F-07: easy | must | active |
| RQ-08 | Heard words: the words the learner drills by ear, each with play, meaning and delete. | PR-p0-74 | yes (conflict 4) | N-38 | F-08: easy | should | active |
| RQ-09 | Reading list: the words the learner drills in writing, with flashcard practice (Show, Again, Got it). | PR-p0-75 | yes (conflict 4) | N-38 | F-09: easy | should | active |
| RQ-10 | After answering, and in texts, a translation shows under each sentence; a setting turns translations off. | PR-p0-41, PR-p0-104, PR-p1-75 | yes (conflict 5) | N-11, N-38, N-02 | F-10: easy | must | active |
| RQ-11 | The five-button rating after each text also goes to the AI with the session summary. | PR-p1-33, PR-p0-72 | yes (conflict 6) | N-13, N-44 | F-11: easy | must | active |
| RQ-12 | Grammar patterns are marked inside sentences in the pattern colour (one colour for all patterns); the pattern's name shows on tap. | PR-p1-184, PR-p0-102 | yes (conflict 8) (combine correction 2026-10-21 (question-pages/47)) | N-45, N-34 | F-12: easy | must | active |
| RQ-13 | Speech speed is set with a slider from 0.5× to 1.5×, starting at normal (1×). | PR-p0-31, PR-p1-93, PR-p1-205, PR-p1-76 | yes (conflict 9; range: question-pages/45) (combine correction 2026-10-21 (question-pages/47)) | N-37, N-03, N-13, N-02 | F-13: possible with limits, X-02 | must | active |
| RQ-14 | While listening, the learner can replay and sees how many times they've played it. | PR-p0-31 | yes (conflict 9: split from PR-p0-31) | N-37 | F-14: easy | must | active |
| RQ-15 | Every 20 answers, once the learner drills many words, grove asks about one drilled word: answer its meaning, then keep drilling it or retire it into the ground if they'd still know it a year from now. | PR-p0-80 | yes (conflict 10) | N-38 | F-15: easy | could | active |
| RQ-16 | A retired word joins the ground and stops being drilled; it can be drilled again later. | PR-p0-81 | yes (conflict 10) | N-38 | F-16: easy | could | active |
| RQ-17 | The AI writes texts (with questions); grove makes the exercises for listening, reading, writing and grammar from those texts' sentences. | PR-p0-30, PR-p1-28 | yes (conflict 11) | N-37, N-42 | F-17: easy | must | active |
| RQ-18 | One tap on a word plays it and opens its menu: its meaning here, its dictionary form, its status and the phrases and patterns it's part of. | PR-p0-61, PR-p1-45, PR-p1-218, PR-p1-219 | yes (duplicate) (combine correction 2026-10-21 (question-pages/47)) | N-11, N-45, N-29 | F-18: easy | must | active |
| RQ-19 | The learner picks a topic, and texts are about it; it's shown on Home. | PR-p1-05, PR-p0-10 | yes (duplicate) | N-41 | F-19: easy | must | active |
| RQ-20 | Read aloud only where the device has a voice for the language; otherwise grove says so once, with how to add one. | PR-p1-22, PR-p1-275, PR-p0-15 | yes (duplicate, X-p1-02) | N-03 | F-20: easy | must | active |
| RQ-21 | The sentence being read aloud is highlighted. | PR-p1-206, PR-p0-103 | yes (duplicate) (combine correction 2026-10-21 (question-pages/47)) | N-03, N-34 | F-21: easy | must | active |
| RQ-22 | Grammar patterns are introduced with a card: a short rule plus examples, then 'Got it'. | PR-p1-16, PR-p0-50 | yes (duplicate) | N-05 | F-22: easy | should | active |
| RQ-23 | A single centred column (about 560 px wide at most), made for phones first, that also works in a desktop browser. | PR-p0-92, PR-p1-185 | yes (duplicate) (combine correction 2026-10-21 (question-pages/47)) | N-19, N-05 | F-23: easy | should | active |
| RQ-24 | Grove serves adult self-learners. | PR-p1-01 | no | N-22 | F-24 (inherits F-p1-12: easy) | must | active |
| RQ-25 | Grove works for learners at any level, beginner to advanced. | PR-p1-02 | no | N-13 | F-25 (inherits F-p1-13: easy) | must | active |
| RQ-26 | Grove supports several target languages. | PR-p1-03 | no | N-30 | F-26 (inherits F-p1-04: possible with limits) | won't (this time): cut for now | active |
| RQ-27 | The learner sets objectives with weight sliders across skills (reading, listening, vocabulary, grammar, writing); the sliders steer what comes automatically. | PR-p1-04 | no | N-07 | F-27 (inherits F-p1-14: easy) | should | active |
| RQ-28 | Material the AI generates is mostly what the learner already knows, with at most 1 new word or phrase per sentence (the target; the exact number is still to be decided; PR-p1-130 sets how far an answer may miss it). | PR-p1-06 | no | N-11, N-13 | F-28 (inherits F-p1-16: easy) | must | active |
| RQ-29 | Grammar patterns are tracked as items, alongside words and phrases. | PR-p1-07 | no | N-05 | F-29 (inherits F-p1-17: easy) | must | active |
| RQ-30 | Items form a dependency tree: words unlock phrases, phrases unlock patterns. | PR-p1-08 | no | N-11 | F-30 (inherits F-p1-18: easy) | could | active |
| RQ-31 | The learner sees their knowledge as a growing tree/graph (visual map). | PR-p1-09 | no | N-29 | F-31 (inherits F-p1-19: easy) | should | active |
| RQ-32 | Known items reappear in new contexts, instead of plain flashcard review. | PR-p1-10 | no | N-11 | F-32 (inherits F-p1-20: easy) | must | active |
| RQ-33 | Difficulty rises automatically as knowledge grows. | PR-p1-11 | no | N-11, N-13 | F-33 (inherits F-p1-21: easy) | must | active |
| RQ-34 | A word or phrase counts as learned when it's in the learner's ground. | PR-p1-12 | no | N-04, N-12 | F-34 (inherits F-p1-22: easy) | must | active |
| RQ-35 | Learners can add items (words, phrases, patterns) themselves. | PR-p1-13 | no | N-11, N-21, N-42 | F-35 (inherits F-p1-23: easy) | must | active |
| RQ-36 | The AI (by copy-paste) generates reading texts. | PR-p1-15 | no | N-42, N-06 | F-36 (inherits F-p1-25: easy) | must | active |
| RQ-37 | Exercise types: flashcards, multiple choice, type the translation, build a sentence from word tiles, fill the gap, write your own sentence using a pattern. | PR-p1-18 | no | N-04, N-06 | F-37 (inherits F-p1-28: easy) | won't (this time): cut for now | active |
| RQ-38 | The app runs in a desktop web browser. | PR-p1-20 | no | N-16, N-19 | F-38 (inherits F-p1-02: possible with limits; X-p1-01) | must | active |
| RQ-39 | The learner can always choose which type of exercise to do from the home page, whatever the sliders say. | PR-p1-23 | no | N-07 | F-39 (inherits F-p1-31: easy) | should | active |
| RQ-40 | Each AI feature shows a 'Copy prompt' button and a paste box. | PR-p1-25 | no | N-15 | F-40 (inherits F-p1-01: possible with limits) | must | active |
| RQ-41 | When a pasted answer is malformed or breaks the rules, grove lists the problems. | PR-p1-26 | no | N-15, N-43 | F-41 (inherits F-p1-01: possible with limits) | must | active |
| RQ-42 | Optionally, if the owner sets their own API key on the server, grove sends the same prompts directly and retries with the fix-it message automatically. | PR-p1-27 | no | N-15 | F-42 (inherits F-p1-32: easy) | won't (this time): cut for now (question-pages/47: budget zero, the €20 plan dropped) | active |
| RQ-43 | Kinds of input: story series, the same story retold in variations, dialogues read with two voices, choose-your-path stories, and simplifying a text the learner pastes. | PR-p1-29 | no | N-42 | F-43 (inherits F-p1-33: easy) | won't (this time): cut for now | active |
| RQ-44 | One content package is about an hour of input. | PR-p1-30 | no | N-42 | F-44 (inherits F-p1-01: possible with limits) | must | active |
| RQ-45 | Story series: the AI invents the characters. | PR-p1-31 | no | N-42 | F-45 (inherits F-p1-34: easy) | should | active |
| RQ-46 | After a text, questions in simple Swedish check understanding. | PR-p1-32 | no | N-02 | F-46 (inherits F-p1-35: easy) | must | active |
| RQ-47 | Listening: the learner can listen first and see the text afterwards. | PR-p1-34 | no | N-03 | F-47 (inherits F-p1-03: possible with limits; X-p1-02) | must | active |
| RQ-48 | Grove tracks hours of input (reading and listening). | PR-p1-35 | no | N-29 | F-48 (inherits F-p1-37: easy) | should | active |
| RQ-49 | The drill exercises (PR-p1-18) stay. | PR-p1-37 | no | N-04, N-07 | F-49 (inherits F-p1-39: easy) | should | active |
| RQ-50 | Prompts ask the AI to reuse the learner's fading words in new texts. | PR-p1-38 | no | N-04 | F-50 (inherits F-p1-40: easy) | should | active |
| RQ-51 | Grove explains comprehensible input in a way that motivates learners and convinces them of the approach. | PR-p1-39 | no | N-25, N-26 | F-51 (inherits F-p1-41: easy) | should | active |
| RQ-52 | After new content arrives, the learner marks the words they don't know, only half know, or never remember. | PR-p1-40 | no | N-04, N-12 | F-52 (inherits F-p1-42: easy) | must | active |
| RQ-53 | A dictionary lists every word, phrase and grammar pattern the learner has met. | PR-p1-41 | no | N-29 | F-53 (inherits F-p1-43: easy) | must | active |
| RQ-54 | Sentences from accepted AI texts are saved and reused in later exercises. | PR-p1-42 | no | N-16 | F-54 (inherits F-p1-44: easy) | must | active |
| RQ-55 | Each sentence shows how many new words it has. | PR-p1-44 | no | N-11 | F-55 (inherits F-p1-45: easy) | must | active |
| RQ-56 | Character and place names have their own list and never count as new words. | PR-p1-47 | no | N-11 | F-56 (inherits F-p1-47: easy) | must | active |
| RQ-57 | Listening mode blurs the text until clicked. | PR-p1-48 | no | N-02, N-03 | F-57 (inherits F-p1-48: easy) | should | active |
| RQ-58 | Multiple choice asks for a word's meaning inside a sentence, not on its own. | PR-p1-50 | no | N-04 | F-58 (inherits F-p1-49: easy) | should | active |
| RQ-59 | Write with a pattern: grove checks for the pattern with a rule and lists words not in the tree, as a hint only. | PR-p1-51 | no | N-06 | F-59 (inherits F-p1-50: easy) | won't (this time): cut for now | active |
| RQ-60 | A drilled word joins the ground after a correct answer once its review interval reaches 4 days. | PR-p1-53 | no | N-04 | F-60 (inherits F-p1-51: easy) | must | active |
| RQ-61 | Meeting a grammar pattern in a text gives it a light review (patterns only). | PR-p1-54 | no | N-05 | F-61 (inherits F-p1-52: easy) | should | active |
| RQ-62 | Input time per text counts at most three times its estimated length and at least 30 seconds. | PR-p1-55 | no | N-29 | F-62 (inherits F-p1-53: easy) | could | active |
| RQ-63 | The fix-it message lists the exact sentences and words that broke the rules. | PR-p1-56 | no | N-15, N-43 | F-63 (inherits F-p1-54: easy) | must | active |
| RQ-64 | Prompts ask the AI for inflected forms of known words; grove learns them so they stop counting as unknown. | PR-p1-57 | no | N-11 | F-64 (inherits F-p1-55: easy) | must | active |
| RQ-65 | New words from an accepted text, grammar example or topic go straight into the tree as new, with the AI's meaning. | PR-p1-58 | no | N-12 | F-65 (inherits F-p1-56: easy) | must | active |
| RQ-66 | AI grammar explanations are saved with the pattern. | PR-p1-59 | no | N-05 | F-66 (inherits F-p1-57: easy) | should | active |
| RQ-67 | With an API key, the fix-it message is sent automatically, up to 3 tries. | PR-p1-60 | no | N-15 | F-67 (inherits F-p1-58: easy) | won't (this time): cut for now (question-pages/47: budget zero, the €20 plan dropped) | active |
| RQ-68 | A choose-your-path answer is accepted only with a start, valid links, every part reachable and at least one ending. | PR-p1-61 | no | N-42, N-43 | F-68 (inherits F-p1-59: easy) | won't (this time): cut for now | active |
| RQ-69 | Unit lengths: about 5 min per episode, 4 per retelling, 4 per dialogue, 6 per choose-your-path story. | PR-p1-62 | no | N-42 | F-69 (inherits F-p1-60: easy) | should | active |
| RQ-70 | Five preset series ideas to choose from, plus your own topic. | PR-p1-63 | no | N-41 | F-70 (inherits F-p1-61: easy) | should | active |
| RQ-71 | Progress shows minutes of input per day. | PR-p1-65 | no | N-29 | F-71 (inherits F-p1-62: easy) | should | active |
| RQ-72 | Locked items (parts not yet known) are shown with dashed outlines on the map. | PR-p1-66 | no | N-29 | F-72 (inherits F-p1-63: easy) | could | active |
| RQ-73 | A welcome screen on the first visit. | PR-p1-68 | no | N-25, N-26 | F-73 (inherits F-p1-65: easy) | should | active |
| RQ-74 | Texts the learner pastes are saved (without English). | PR-p1-71 | no | N-16 | F-74 (inherits F-p1-66: easy) | must | active |
| RQ-75 | The learner's data is saved after every change. | PR-p1-72 | no | N-16 | F-75 (inherits F-p1-67: easy) | should | active |
| RQ-76 | Each text shows its word count, its new words and their share. | PR-p1-73 | no | N-11 | F-76 (inherits F-p1-68: easy) | must | active |
| RQ-77 | Unknown words can be added from the inspector. | PR-p1-74 | no | N-12, N-32 | F-77 (inherits F-p1-69: easy) | must | active |
| RQ-78 | Write with a pattern: the AI's verdict (correct, and uses the pattern) grades the exercise. | PR-p1-77 | no | N-06 | F-78 (inherits F-p1-72: easy) | won't (this time): cut for now | active |
| RQ-79 | A drilled word counts as fading when its strength drops below 0.2. | PR-p1-78 | no | N-04 | F-79 (inherits F-p1-73: easy) | must | active |
| RQ-80 | Practice shows fading items first. | PR-p1-79 | no | N-04 | F-80 (inherits F-p1-74: easy) | must | active |
| RQ-81 | After a choose-your-path story, the reader offers 'Try another path'. | PR-p1-80 | no | N-42 | F-81 (inherits F-p1-75: easy) | won't (this time): cut for now | active |
| RQ-82 | Default package mix: 4 episodes, 2 retellings, 3 dialogues, 2 choose-your-path stories. | PR-p1-81 | no | N-42 | F-82 (inherits F-p1-76: easy) | should | active |
| RQ-83 | The whole package can be asked for in one prompt instead of in parts. | PR-p1-82 | no | N-42 | F-83 (inherits F-p1-01: possible with limits) | should | active |
| RQ-84 | A package can be cancelled. | PR-p1-83 | no | N-42 | F-84 (inherits F-p1-77: easy) | should | active |
| RQ-85 | A 'What your hours can bring' roadmap. | PR-p1-84 | no | N-29, N-25, N-26 | F-85 (inherits F-p1-78: easy) | won't (this time): cut for now | active |
| RQ-86 | Progress shows the ground over time (from daily snapshots). | PR-p1-85 | no | N-29 | F-86 (inherits F-p1-79: easy) | should | active |
| RQ-87 | Progress compares each skill's share of practice with its slider. | PR-p1-87 | no | N-29, N-07 | F-87 (inherits F-p1-80: easy) | should | active |
| RQ-88 | Tips. | PR-p1-88 | no | N-25, N-26 | F-88 (inherits F-p1-81: easy) | won't (this time): cut for now | active |
| RQ-89 | The server collects a large bank of words and grammar for each language. | PR-p1-89 | no | N-43 | F-89 (inherits F-p1-05: possible with limits) | should | active |
| RQ-90 | Several learners, each with an account and login. | PR-p1-91 | no | N-16, N-17 | F-90 (inherits F-p1-07: possible with limits) | must | active |
| RQ-91 | Teachers have accounts with their classes (see PR-p1-01). | PR-p1-92 | no | N-22 | F-91 (inherits F-p1-83: easy) | won't (this time): cut for now | active |
| RQ-92 | Bank entries come from the AI answers learners paste in. | PR-p1-94 | no | N-43 | F-92 (inherits F-p1-05: possible with limits) | should | active |
| RQ-93 | The bank (PR-p1-89) is shared by all learners on the server. | PR-p1-95 | no | N-43 | F-93 (inherits F-p1-84: easy) | should | active |
| RQ-94 | Grove uses the bank for word meanings without asking the AI each time. | PR-p1-96 | no | N-43 | F-94 (inherits F-p1-85: easy) | should | active |
| RQ-95 | New entries for the shared bank are checked by a background process; until checked, other learners don't get them. | PR-p1-97 | no | N-43, N-18 | F-95 (inherits F-p1-06: possible with limits; X-p1-01) | should | active |
| RQ-96 | The learner who pasted an answer can use its new words right away, marked 'unchecked' until the background check passes. | PR-p1-98 | no | N-18 | F-96 (inherits F-p1-86: easy) | should | active |
| RQ-97 | Anyone can sign up for an account. | PR-p1-99 | no | N-17 | F-97 (inherits F-p1-07: possible with limits) | should | active |
| RQ-98 | Teachers can see each student's progress. | PR-p1-100 | no | N-23 | F-98 (inherits F-p1-08: possible with limits; X-p1-03) | won't (this time): cut for now | active |
| RQ-99 | Teachers can correct entries in the shared bank (PR-p1-94). | PR-p1-101 | no | N-43, N-18 | F-99 (inherits F-p1-87: easy) | won't (this time): cut for now | active |
| RQ-100 | Teachers can choose the topics or texts their class works on. | PR-p1-102 | no | N-22 | F-100 (inherits F-p1-88: easy) | won't (this time): cut for now | active |
| RQ-101 | The background check (PR-p1-97) compares a new entry with an open dictionary imported into the bank (e.g. Wiktionary). | PR-p1-103 | no | N-43 | F-101 (inherits F-p1-05: possible with limits) | should | active |
| RQ-102 | Only the owner and content maintainers (RQ-373) can approve entries for everyone, in a review list; a teacher's approval stays within their class (PR-p1-105). | PR-p1-104 | yes (question-pages/51: content maintainers) | N-18 | F-102: easy | could | active |
| RQ-103 | A teacher can approve their own material; the students they invite see it straight away, but nobody else sees it until it passes the background check. | PR-p1-105 | no | N-22, N-18 | F-103 (inherits F-p1-89: easy) | won't (this time): cut for now | active |
| RQ-104 | A teacher's corrections to the shared bank go through the background check before other learners get them. | PR-p1-106 | no | N-43, N-18 | F-104 (inherits F-p1-90: easy) | won't (this time): cut for now | active |
| RQ-105 | A student joins a class with a class code from the teacher. | PR-p1-107 | no | N-24 | F-105 (inherits F-p1-08: possible with limits; X-p1-03) | won't (this time): cut for now | active |
| RQ-106 | A teacher can invite a student to a class; the student accepts. | PR-p1-108 | no | N-24 | F-106 (inherits F-p1-08: possible with limits; X-p1-03) | won't (this time): cut for now | active |
| RQ-107 | A student can leave a class; the teacher then stops seeing their progress. | PR-p1-109 | no | N-24 | F-107 (inherits F-p1-91: easy) | won't (this time): cut for now | active |
| RQ-108 | There is one bank per target language (PR-p1-03). | PR-p1-110 | no | N-43, N-30 | F-108 (inherits F-p1-04: possible with limits) | won't (this time): cut for now | active |
| RQ-109 | An entry that disagrees with the dictionary goes to the owner's review list; until the owner decides, only the learner who pasted it has it, marked 'unchecked'. | PR-p1-111 | no | N-43, N-18 | F-109 (inherits F-p1-06: possible with limits; X-p1-01) | could | active |
| RQ-110 | An entry the dictionary doesn't have goes to the owner's review list; until the owner decides, only the learner who pasted it has it, marked 'unchecked'. | PR-p1-112 | no | N-43, N-18 | F-110 (inherits F-p1-06: possible with limits; X-p1-01) | could | active |
| RQ-111 | Translations in the bank are into English only for now. | PR-p1-113 | no | N-43 | F-111 (inherits F-p1-05: possible with limits) | should | active |
| RQ-112 | When the owner rejects an entry, they can offer a correction or deletion. | PR-p1-114 | no | N-18 | F-112 (inherits F-p1-92: easy) | could | active |
| RQ-113 | A new learner can pick their CEFR level; grove adds the most common words for that level to their ground. | PR-p1-115 | no | N-12, N-13 | F-113 (inherits F-p1-09: possible with limits; X-p1-04) | must | active |
| RQ-114 | After picking a level, grove shows a sample of words from that level; the learner ticks the ones they don't know, and the rest of the level's words join the ground (known by default). | PR-p1-116 | no | N-12, N-13 | F-114 (inherits F-p1-09: possible with limits; X-p1-04) | must | active |
| RQ-115 | A learner who doesn't know their level takes a reading test: short texts that get harder, each rated on the five buttons (PR-p1-33); that sets their level. | PR-p1-117 | no | N-13 | F-115 (inherits F-p1-10: possible with limits; X-p1-05) | should | active |
| RQ-116 | The starting level also sets which grammar patterns count as known. | PR-p1-118 | no | N-13 | F-116 (inherits F-p1-93: easy) | should | active |
| RQ-117 | The list of words ranked by how common they are (frequency list) lives in the shared bank for each language (PR-p1-89, PR-p1-110). | PR-p1-119 | no | N-43 | F-117 (inherits F-p1-05: possible with limits) | should | active |
| RQ-118 | An 'Expand your grove' exercise, available any time: grove shows the next most common words not yet in the ground (from the frequency list, PR-p1-119); the learner ticks the ones they don't know, and the rest join the ground. | PR-p1-120 | no | N-12, N-13 | F-118 (inherits F-p1-94: easy) | should | active |
| RQ-119 | Grove offers 'Expand your grove' on its own when texts start having very few new words. | PR-p1-121 | no | N-13 | F-119 (inherits F-p1-95: easy) | should | active |
| RQ-120 | 'Expand your grove' mixes in a few words already in the ground; ticking one as unknown takes it out of the ground and starts drilling it (catches wrong guesses from the starting level). | PR-p1-122 | no | N-12 | F-120 (inherits F-p1-96: easy) | should | active |
| RQ-121 | Words not in the ground that the learner ticks as unknown in the starting check or in 'Expand your grove' stay 'new' and come up in texts; they aren't drilled. | PR-p1-123 | no | N-13 | F-121 (inherits F-p1-97: easy) | should | active |
| RQ-122 | Each grammar pattern's level (e.g. 'verb second' is A1) is stored with the pattern in the shared bank. | PR-p1-124 | no | N-05 | F-122 (inherits F-p1-11: easy) | should | active |
| RQ-123 | Now and then, texts below the learner's level are mixed in with normal ones. | PR-p1-125 | no | N-33, N-34, N-35, N-36 | F-123: easy | should | active |
| RQ-124 | The learner can ask for an easy read: a text below their level. | PR-p1-126 | no | N-33, N-34, N-35, N-36 | F-124: easy | should | active |
| RQ-125 | Grove's processing and storage run on the owner's own computer; a public relay server passes traffic between learners and it. | PR-p1-127 | no | N-15, N-20 | F-125: possible with limits, X-01 | must | active (dropped on page 46, restored on question-pages/47: budget zero, the €20 plan dropped) |
| RQ-126 | The owner can copy the review list as one prompt for their own AI and paste the verdicts back; grove applies them. | PR-p1-128 | no | N-43, N-18 | F-126 (inherits F-p1-108: easy) | should | active |
| RQ-127 | Grove accepts an AI answer without a fix-it round when at most about 1 sentence in 10 has 2 new words; the exact margin is set after testing with real answers. | PR-p1-130 | no | N-15, N-11 | F-127 (inherits F-p1-105: easy) | must | active |
| RQ-128 | Texts learners get from their AI are offered, after the background check, to other learners at a similar level (a shared library). | PR-p1-131 | no | N-15, N-19, N-42 | F-128 (inherits F-p1-102: possible with limits) | should | active |
| RQ-129 | The background check of a text for the shared library covers the whole text and all its words. | PR-p1-132 | no | N-43 | F-129 (inherits F-p1-106: easy) | should | active |
| RQ-130 | One prompt can ask the AI for a week's worth of texts, pasted back in parts; meant mainly for learners whose AI gives long answers in one go. | PR-p1-133 | no | N-15, N-19 | F-130 (inherits F-p1-103: possible with limits) | could | active |
| RQ-131 | The automatic check of bank entries also uses other free online dictionaries. | PR-p1-135 | no | N-43 | F-131 (inherits F-p1-100: possible with limits) | could | active |
| RQ-132 | The automatic check looks for the word in real use (example sentences) in open text collections (corpora, e.g. Språkbanken's). | PR-p1-136 | no | N-43 | F-132 (inherits F-p1-101: reduced, X-p1-07) | could | active |
| RQ-133 | Word tiles, fill the gap and type the translation work without AI, from saved sentences and the bank. | PR-p1-137 | no | N-15, N-04 | F-133 (inherits F-p1-107: easy) | should | active |
| RQ-134 | A text the learner pasted from elsewhere (not written by their AI) goes into the shared library only when the learner confirms it may be shared. | PR-p1-138 | no | N-27, N-28 | F-134 (inherits F-p1-109: easy) | should | active |
| RQ-135 | Grove keeps the source of every library text: who shared it, and where it came from. | PR-p1-139 | no | N-27, N-28 | F-135 (inherits F-p1-110: possible with limits) | should | active |
| RQ-136 | If a library text breaks copyright, the owner can delete it; the words it added to the bank stay. | PR-p1-140 | no | N-27, N-28 | F-136 (inherits F-p1-110: possible with limits) | should | active |
| RQ-137 | The learner chooses, for each text, whether it goes into the shared library. | PR-p1-141 | no | N-17, N-24 | F-137 (inherits F-p1-111: easy) | should | active |
| RQ-138 | Texts a learner shares get a higher priority in the background check, so they're confirmed sooner. | PR-p1-142 | no | N-32 | F-138 (inherits F-p1-112: easy) | should | active |
| RQ-139 | The learner who shared a text chooses whether it shows their name or stays anonymous. | PR-p1-143 | no | N-17, N-24 | F-139 (inherits F-p1-113: easy) | should | active |
| RQ-140 | Any learner can report a library text as breaking copyright, wrong or offensive. | PR-p1-144 | no | N-27, N-28, N-43 | F-140 (inherits F-p1-114: easy) | should | active |
| RQ-141 | Learners accept terms of use when they sign up; among other things, they may only share texts they have the right to share. | PR-p1-145 | no | N-27, N-28 | F-141 (inherits F-p1-115: easy) | should | active |
| RQ-142 | When a library text is deleted for copyright, the example sentences taken from it are deleted too; only its words stay in the bank. | PR-p1-146 | no | N-27, N-28 | F-142 (inherits F-p1-116: easy) | should | active |
| RQ-143 | The first time an account shares a text that breaks copyright, it is suspended for a fixed period (e.g. 30 days); the suspension then lifts by itself. | PR-p1-147 | no | N-27, N-28 | F-143 (inherits F-p1-117: easy) | should | active |
| RQ-144 | The second time, the account is banned. | PR-p1-148 | no | N-27, N-28 | F-144 (inherits F-p1-117: easy) | should | active |
| RQ-145 | Only copyright breaches lead to suspension or a ban; offensive or wrong texts are just deleted. | PR-p1-149 | no | N-18 | F-145 (inherits F-p1-117: easy) | should | active |
| RQ-146 | There is exactly one owner, set in grove's settings on the owner's computer; nobody can become owner through grove. | PR-p1-150 | no | N-18, N-20 | F-146 (inherits F-p1-118: easy) | must | active |
| RQ-147 | Everyone who signs up is a learner. | PR-p1-151 | no | N-24 | F-147 (inherits F-p1-119: easy) | must | active |
| RQ-148 | The owner doesn't see learners' progress inside courses. | PR-p1-152 | no | N-17, N-24 | F-148 (inherits F-p1-120: easy) | should | active |
| RQ-149 | A learner who creates a course becomes its creator, at first the only one in charge. | PR-p1-153 | no | N-22 | F-149 (inherits F-p1-121: easy) | won't (this time): cut for now | active |
| RQ-150 | The course creator decides the course material, approves their own material for it, invites students or hands out a class code, sees students' progress and can delete the course. | PR-p1-154 | no | N-22, N-23 | F-150 (inherits F-p1-122: easy) | won't (this time): cut for now | active |
| RQ-151 | The creator can add co-teachers; a co-teacher can add material and see progress, but can't change roles, remove students or delete the course. | PR-p1-155 | no | N-22 | F-151 (inherits F-p1-123: easy) | won't (this time): cut for now | active |
| RQ-152 | Only the creator gives or removes the co-teacher role. | PR-p1-156 | no | N-22 | F-152 (inherits F-p1-124: easy) | won't (this time): cut for now | active |
| RQ-153 | The creator can hand the course over to a co-teacher, who becomes the creator; the old creator becomes a co-teacher. | PR-p1-157 | no | N-22 | F-153 (inherits F-p1-125: easy) | won't (this time): cut for now | active |
| RQ-154 | Roles are per course: someone can be a student in one course and run another. | PR-p1-158 | no | N-22 | F-154 (inherits F-p1-126: easy) | won't (this time): cut for now | active |
| RQ-155 | Every request is checked on the server against who is asking and their role. | PR-p1-159 | no | N-20, N-24 | F-155 (inherits F-p1-127: easy) | must | active |
| RQ-156 | After 5 failed sign-ins in a row, the account is locked for 15 minutes. | PR-p1-160 | no | N-20 | F-156 (inherits F-p1-128: easy) | must | active |
| RQ-157 | Passwords are stored hashed (scrambled), never as written. (Firebase stores them hashed, RQ-366) | PR-p1-161 | no | N-20 | F-157 (inherits F-p1-129: easy) | must | active |
| RQ-158 | Each account can add only a limited number of new bank entries a day. | PR-p1-162 | no | N-18, N-43 | F-158 (inherits F-p1-130: easy) | should | active |
| RQ-159 | Every change to the shared bank is logged with who made it, when and what. | PR-p1-163 | no | N-18, N-43 | F-159 (inherits F-p1-131: easy) | should | active |
| RQ-160 | Sign-ups per hour from one place are limited. | PR-p1-164 | no | N-18 | F-160 (inherits F-p1-132: easy) | should | active |
| RQ-161 | A single paste has a maximum size. | PR-p1-165 | no | N-18 | F-161 (inherits F-p1-133: easy) | should | active |
| RQ-162 | Visitors who aren't signed in reach only the sign-in and sign-up pages and public information; everything else needs an account. | PR-p1-166 | no | N-20, N-18 | F-162 (inherits F-p1-134: easy) | must | active |
| RQ-163 | Grove serves students learning alongside a course. | PR-p1-167 | no | N-22 | F-163 (inherits F-p1-12: easy) | should | active |
| RQ-164 | Grove serves teachers who set material for a class. | PR-p1-168 | no | N-22 | F-164 (inherits F-p1-12: easy) | won't (this time): cut for now | active |
| RQ-165 | A topic brings its own new words into the learner's tree. | PR-p1-169 | no | N-41 | F-165 (inherits F-p1-15: easy) | must | active |
| RQ-166 | The learner can paste an article on a topic, if it isn't under copyright. | PR-p1-170 | no | N-41 | F-166 (inherits F-p1-15: easy) | should | active |
| RQ-167 | The share of known words in a text starts at 95%. | PR-p1-171 | no | N-11, N-13 | F-167 (inherits F-p1-16: easy) | must | active |
| RQ-168 | The share of known words moves with the learner's ratings, between 93% and 98%. | PR-p1-172 | no | N-11, N-13 | F-168 (inherits F-p1-16: easy) | must | active |
| RQ-169 | Ground items don't fade. | PR-p1-173 | no | N-04, N-12 | F-169 (inherits F-p1-22: easy) | must | active |
| RQ-170 | Only drilled items have a spaced-repetition strength and can fade. | PR-p1-175 | no | N-04, N-12 | F-170 (inherits F-p1-22: easy) | must | active |
| RQ-171 | Grammar patterns keep plain spaced repetition. | PR-p1-176 | no | N-04, N-12 | F-171 (inherits F-p1-22: easy) | must | active |
| RQ-172 | The AI generates items from what the learner knows. | PR-p1-177 | no | N-11, N-21, N-42 | F-172 (inherits F-p1-23: easy) | must | active |
| RQ-173 | Items are extracted from texts the learner pastes in. | PR-p1-178 | no | N-11, N-21, N-42 | F-173 (inherits F-p1-23: easy) | must | active |
| RQ-174 | The AI gives meanings for unknown words in pasted texts. | PR-p1-179 | no | N-42, N-06 | F-174 (inherits F-p1-25: easy) | must | active |
| RQ-175 | The AI gives starter vocabulary for topics. | PR-p1-180 | no | N-41, N-06 | F-175 (inherits F-p1-25: easy) | must | active |
| RQ-176 | The AI corrects the learner's free writing. | PR-p1-181 | no | N-42, N-06 | F-176 (inherits F-p1-25: easy) | won't (this time): cut for now | active |
| RQ-177 | The AI explains grammar. | PR-p1-182 | no | N-42, N-06 | F-177 (inherits F-p1-25: easy) | must | active |
| RQ-178 | There is no conversation partner in the first version. | PR-p1-183 | no | N-42, N-06 | F-178 (inherits F-p1-25: easy) | must | active |
| RQ-179 | The app works on phones (phone-friendly web). | PR-p1-185 | no | N-16, N-19 | inherits F-p1-02: possible with limits; X-p1-01 | must | dropped (duplicate: merged into RQ-23; combine correction 2026-10-21 (question-pages/47)) |
| RQ-180 | A small server stores the data; a database is fine. | PR-p1-186 | no | N-16, N-19 | F-179 (inherits F-p1-02: possible with limits; X-p1-01) | must | active |
| RQ-181 | AI isn't required on the server. | PR-p1-187 | no | N-16, N-19 | F-180 (inherits F-p1-02: possible with limits; X-p1-01) | must | active (restored on question-pages/47: budget zero, the €20 plan dropped) |
| RQ-182 | Learners copy a prompt from grove into their own AI chat and paste the answer back. | PR-p1-188 | no | N-15 | F-181 (inherits F-p1-01: possible with limits) | must | active |
| RQ-183 | The prompts work in any chat AI. | PR-p1-189 | no | N-15 | F-182 (inherits F-p1-01: possible with limits) | must | active |
| RQ-184 | The prompts ask for one JSON block (a fixed data format), which grove reads exactly. | PR-p1-190 | no | N-15 | F-183 (inherits F-p1-01: possible with limits) | must | active |
| RQ-185 | Grove gives a 'fix it' message to paste back into the same AI chat. | PR-p1-191 | no | N-15, N-43 | F-184 (inherits F-p1-01: possible with limits) | must | active |
| RQ-186 | Besides the session's summary exchange (RQ-01), the learner can ask for more texts in the same session with part prompts (about 10 minutes each by default; X-03 test, question-pages/52), without a summary. | PR-p1-192 | yes (conflict 12) | N-42 | F-185: possible with limits, X-03 | must | active |
| RQ-187 | Closely bound content (e.g. consecutive episodes) stays in the same part. | PR-p1-193 | no | N-42 | F-186 (inherits F-p1-01: possible with limits) | must | active |
| RQ-188 | Grove gives a 'next part' prompt until the package is complete. | PR-p1-194 | yes (conflict 12: extra parts within a session) | N-42 | F-187: easy | must | active |
| RQ-189 | The learner picks the mix of a package before copying the prompt. | PR-p1-195 | no | N-42 | F-188 (inherits F-p1-01: possible with limits) | must | active |
| RQ-190 | The learner asks for a series topic or chooses from options. | PR-p1-196 | no | N-41 | F-189 (inherits F-p1-34: easy) | should | active |
| RQ-191 | Each episode reuses the last episode's new words. | PR-p1-197 | no | N-42 | F-190 (inherits F-p1-34: easy) | should | active |
| RQ-192 | English is hidden completely above a level the learner chooses. | PR-p1-200 | no | N-02 | inherits F-p1-35: easy | must | dropped (conflict 5: p0's translation rule everywhere; combine correction 2026-10-21 (question-pages/47)) |
| RQ-193 | A rating of 'almost nothing' or 'a little' leads to fewer new words and shorter sentences. | PR-p1-201 | no | N-13 | F-191 (inherits F-p1-36: easy) | must | active |
| RQ-194 | After such a rating, grove offers a simpler retelling of the text. | PR-p1-202 | no | N-13 | F-192 (inherits F-p1-36: easy) | must | active |
| RQ-195 | Several 'most' or 'everything' ratings in a row lead to slightly more new words. | PR-p1-203 | no | N-13 | F-193 (inherits F-p1-36: easy) | must | active |
| RQ-196 | The sentence being read is highlighted. | PR-p1-206 | no | N-03 | inherits F-p1-03: possible with limits; X-p1-02 | must | dropped (duplicate: merged into RQ-21; combine correction 2026-10-21 (question-pages/47)) |
| RQ-197 | One sentence can be played on a loop. | PR-p1-207 | no | N-03 | F-194 (inherits F-p1-03: possible with limits; X-p1-02) | must | active |
| RQ-198 | A whole text can be played audio-only. | PR-p1-208 | no | N-03 | F-195 (inherits F-p1-03: possible with limits; X-p1-02) | must | active |
| RQ-199 | Grove shows an estimated CEFR level from the ground. | PR-p1-210 | no | N-29 | inherits F-p1-37: easy | should | dropped (duplicate: merged into RQ-03; combine correction 2026-10-21 (question-pages/47)) |
| RQ-200 | A drilled item joins the ground when drilling succeeds. | PR-p1-211 | no | N-04 | F-196 (inherits F-p1-38: easy) | must | active |
| RQ-201 | Meeting words in texts is counted and shown but doesn't change their schedule. | PR-p1-212 | no | N-04 | F-197 (inherits F-p1-38: easy) | must | active |
| RQ-202 | The sliders alone decide how much input and how much drilling the learner gets. | PR-p1-213 | no | N-04, N-07 | F-198 (inherits F-p1-39: easy) | should | active |
| RQ-203 | Marked words are drilled. | PR-p1-214 | no | N-04, N-12 | F-199 (inherits F-p1-42: easy) | must | active |
| RQ-204 | Unmarked words join the ground. | PR-p1-215 | no | N-04, N-12 | F-200 (inherits F-p1-42: easy) | must | active |
| RQ-205 | Each dictionary entry shows its translation. | PR-p1-216 | no | N-29 | F-201 (inherits F-p1-43: easy) | must | active |
| RQ-206 | The examples in AI grammar explanations are reused in exercises. | PR-p1-220 | no | N-05 | F-202 (inherits F-p1-57: easy) | should | active |
| RQ-207 | When adding an unknown word, grove gives an AI prompt for its meaning. | PR-p1-221 | no | N-12, N-32 | F-203 (inherits F-p1-69: easy) | should | active |
| RQ-208 | Settings hold the level above which English is hidden. | PR-p1-222 | no | N-02 | inherits F-p1-71: easy | should | dropped (conflict 5: p0's translation rule everywhere; combine correction 2026-10-21 (question-pages/47)) |
| RQ-209 | Bank entries have translations, examples and inflections. | PR-p1-223 | no | N-43 | F-204 (inherits F-p1-05: possible with limits) | should | active |
| RQ-210 | Bank entries come from open dictionaries such as Wiktionary (licences to check). | PR-p1-224 | no | N-43 | F-205 (inherits F-p1-05: possible with limits) | should | active |
| RQ-211 | The owner can write or correct bank entries. | PR-p1-225 | no | N-43 | F-206 (inherits F-p1-05: possible with limits) | should | active |
| RQ-212 | Grove uses the bank to recognise inflected forms, so they don't count as unknown. | PR-p1-226 | no | N-43 | F-207 (inherits F-p1-85: easy) | should | active |
| RQ-213 | Grove uses the bank to check AI answers. | PR-p1-228 | no | N-43 | F-208 (inherits F-p1-85: easy) | should | active |
| RQ-214 | The learner who pasted a rejected entry chooses: keep it marked 'rejected', or take what the owner offers. | PR-p1-229 | no | N-18 | F-209 (inherits F-p1-92: easy) | could | active |
| RQ-215 | Grove offers 'Expand your grove' on its own after a certain amount of input (e.g. every 2 hours). | PR-p1-230 | no | N-13 | inherits F-p1-95: easy | should | dropped (question-pages/43: Expand only when texts get easy, RQ-255; combine correction 2026-10-21 (question-pages/47)) |
| RQ-216 | Grove accepts an AI answer without a fix-it round when the text as a whole is within about 2 percentage points of the target share of known words; the exact margin is set after testing. | PR-p1-232 | no | N-15, N-11 | F-210 (inherits F-p1-105: easy) | should | active |
| RQ-217 | In the first version, only people the owner invites (the course reviewers, and the owner) can create an account; open sign-up (PR-p1-99) comes later. | PR-p1-233 | no | N-18, N-20 | F-211: easy | should | active |
| RQ-218 | Sign-up asks for an email address and a password. | PR-p1-234 | no | N-20 | F-212: easy | should | active |
| RQ-219 | A forgotten password can be reset by email. | PR-p1-235 | no | N-20 | F-213: possible with limits (through Firebase, F-354) | must (question-pages/49: free with Firebase) | active |
| RQ-220 | In the first version, the owner resets forgotten passwords by hand. | PR-p1-236 | no | N-20 | F-214: not needed (dropped) | should | dropped (question-pages/49: password resets by email through Firebase, RQ-219) |
| RQ-221 | A password needs at least 8 characters, with at least one letter, one digit and one symbol. | PR-p1-237 | no | N-20 | F-215 (inherits easy) | should | active |
| RQ-222 | An invitation code can let in several people; the owner sets how many. | PR-p1-238 | no | N-20 | F-216 (inherits easy) | should | active |
| RQ-223 | The owner's account is created with a setup command on the owner's computer; the sign-up page never creates an owner. | PR-p1-239 | yes (question-pages/50, T-03: anyone signing up first with the owner's email would have become owner) | N-18 | F-217: easy (own check: a command-line script that creates the Firebase account and marks it as owner) | should | active |
| RQ-224 | A sign-in lasts 30 days on that device. | PR-p1-240 | no | N-19 | F-218 (inherits easy) | should | active |
| RQ-225 | At most 10 sign-ups an hour from one internet address. | PR-p1-241 | no | N-18 | F-219 (inherits easy) | should | active |
| RQ-226 | The page header shows the signed-in email and a Sign out button. | PR-p1-242 | no | N-17 | F-220 (inherits easy) | should | active |
| RQ-227 | The owner is also a learner, with their own learner data. | PR-p1-243 | no | N-18 | F-221 (inherits easy) | should | active |
| RQ-228 | The terms of use say: 13 and over; share only texts you may share; the suspension and ban rule; what data is kept and why; ask the owner to export or delete your data. | PR-p1-244 | no | N-27, N-28 | F-222 (inherits easy) | should | active |
| RQ-229 | Learners ask the owner to export or delete their data (no button for it yet). | PR-p1-245 | no | N-20 | F-223 (inherits easy) | should | active |
| RQ-230 | Each account can add at most 500 new bank entries a day. | PR-p1-246 | no | N-18 | F-224 (inherits easy) | should | active |
| RQ-231 | A single paste or upload is at most 100 KB. | PR-p1-247 | no | N-18 | F-225 (inherits easy) | should | active |
| RQ-232 | The dictionary check counts a meaning as agreeing when it shares a content word with the dictionary's meaning. | PR-p1-248 | no | N-43 | F-226 (inherits easy) | should | active |
| RQ-233 | A word with the same meaning as an entry that's already checked isn't sent again; a different meaning is checked. | PR-p1-249 | no | N-43 | F-227 (inherits easy) | should | active |
| RQ-234 | A rejected entry shows a 'rejected' badge in the Dictionary, where the owner's offer and your choices open; not on Home. | PR-p1-250 | no | N-43 | F-228 (inherits easy) | should | active |
| RQ-235 | Your own unchecked words carry an 'unchecked' tag in the word inspector. | PR-p1-251 | no | N-43 | F-229 (inherits easy) | should | active |
| RQ-236 | A shared text counts as checked only when every word in it is a checked bank entry or a character name. | PR-p1-252 | no | N-43 | F-230 (inherits easy) | should | active |
| RQ-237 | A shared text's level is the lowest CEFR level that covers 95% of its words. | PR-p1-253 | no | N-13 | F-231 (inherits easy) | should | active |
| RQ-238 | The shared library shows texts up to one level above yours, with 'show all levels' to see the rest. | PR-p1-254 | no | N-13 | F-232 (inherits easy) | should | active |
| RQ-239 | 'Add to my library' copies a shared text into your own library. | PR-p1-255 | no | N-42 | F-233 (inherits easy) | should | active |
| RQ-240 | After new content arrives, you can tick which texts to share and whether your name shows. | PR-p1-256 | no | N-15 | F-234 (inherits easy) | should | active |
| RQ-241 | Report reasons are copyright, wrong or offensive, with a note. | PR-p1-257 | no | N-43 | F-235 (inherits easy) | should | active |
| RQ-242 | The owner's review list shows shared texts first, then entries. | PR-p1-258 | no | N-18 | F-236 (inherits easy) | should | active |
| RQ-243 | The owner can reject an entry with a corrected meaning, or (with none) offer to delete it. | PR-p1-259 | no | N-43 | F-237 (inherits easy) | should | active |
| RQ-244 | The owner's batch review prompt lists the entries and asks the AI for {verdicts: [id, approve or reject, correction]}. | PR-p1-260 | no | N-10 | F-238 (inherits easy) | should | active |
| RQ-245 | The owner sees the accounts with their strikes, suspensions and bans, but no learning progress. | PR-p1-261 | no | N-18 | F-239 (inherits easy) | should | active |
| RQ-246 | The owner sees the full log of bank changes, searchable by word, person and action. | PR-p1-262 | no | N-18 | F-240 (inherits easy) | should | active |
| RQ-247 | The suspension after a first copyright breach lasts exactly 30 days. | PR-p1-263 | no | N-27 | F-241 (inherits easy) | should | active |
| RQ-248 | A new account (other than a reviewer's, RQ-363) goes straight to the starting level, after the welcome. | PR-p1-264 | yes (question-pages/47: reviewers excepted) | N-13 | F-242: easy | should | active |
| RQ-249 | The starting check shows a sample of 30 of the level's words. | PR-p1-265 | no | N-12 | F-243 (inherits easy) | should | active |
| RQ-250 | The reading test has four texts (A1, A2, B1, B2); your level is the highest one you rated 'most' or 'everything'. | PR-p1-266 | no | N-13 | F-244 (inherits easy) | should | active |
| RQ-251 | The starting check also shows the level's grammar patterns, each with an example; you tick the ones you don't know, and the rest count as known. | PR-p1-267 | no | N-12 | F-245 (inherits easy) | should | active |
| RQ-252 | Home has a 'Set my starting level again' button. | PR-p1-268 | no | N-13 | F-246 (inherits easy) | should | active |
| RQ-253 | A level counts when it and every level below have 90% of their own words in your ground. | PR-p1-269 | no | N-36 | F-247 (inherits easy) | should | active |
| RQ-254 | Expand shows the next 20 most common new words plus 3 words you already know. | PR-p1-270 | no | N-12 | F-248 (inherits easy) | should | active |
| RQ-255 | Grove offers 'Expand your grove' on its own only after three texts in a row rated 'everything'. | PR-p1-271 | no | N-12 | F-249 (inherits easy) | should | active |
| RQ-256 | In a package of 4 or more texts, the last dialogue (or the last text) is an easy read. | PR-p1-272 | no | N-33 | F-250 (inherits easy) | should | active |
| RQ-257 | 'Get an easy read' asks for one dialogue made only of known words, on a topic you choose. | PR-p1-273 | no | N-34 | F-251 (inherits easy) | should | active |
| RQ-258 | 'A week's worth' asks for 7 times the chosen mix, pasted back part by part. | PR-p1-274 | no | N-19 | F-252 (inherits easy) | should | active |
| RQ-259 | A notifications bell in the header lists the owner's decisions about your entries and texts (rejected entries, approved shared texts). | PR-p1-276 | no | N-43 | F-253 (inherits easy) | should | active |
| RQ-260 | Tapping a rejected word anywhere shows the owner's offer and your choices. | PR-p1-277 | no | N-43 | F-254 (inherits easy) | should | active |
| RQ-261 | For listening, the learner picks a regional variety (e.g. Swedish from Sweden or Finland) and a voice. | PR-p0-14 | no | N-03 | F-255 (inherits F-p0-02: possible with limits) | should | active |
| RQ-262 | For languages with another script (e.g. Japanese, Chinese), each word can show its reading: hiragana above, rōmaji or pinyin below, pinyin with tone colours. | PR-p0-16 | no | N-11 | F-256 (inherits F-p0-03: possible with limits) | should | active |
| RQ-263 | The learner chooses which reading layers to show (in Settings). | PR-p0-17 | no | N-11 | F-257 (inherits F-p0-03: possible with limits) | should | active |
| RQ-264 | A Readings on/off switch under the text, remembered separately for listening and for reading. | PR-p0-18 | no | N-11 | F-258 (inherits F-p0-03: possible with limits) | should | active |
| RQ-265 | Japanese and Chinese get a separate 'Reading list' list for written words; other languages only have 'Heard words'. | PR-p0-19 | no | N-40 | F-259 (inherits F-p0-03: possible with limits) | should | active |
| RQ-266 | Home shows a card for each skill with its progress in each stage. | PR-p0-22 | no | N-37, N-29 | F-260 (inherits easy) | should | active |
| RQ-267 | Choosing a skill shows its stages and modes (e.g. Sentences, Passages, Long text, Drill) with how many items are left. | PR-p0-25 | no | N-37, N-39 | F-261 (inherits easy) | should | active |
| RQ-268 | Items are picked near the learner's level for that skill, with some easier and some harder ones mixed in. | PR-p0-26 | no | N-13 | F-262 (inherits easy) | should | active |
| RQ-269 | A short card explains each mode before it starts (10 seconds, tap to skip); it can be turned off. | PR-p0-29 | no | N-39 | F-263 (inherits easy) | should | active |
| RQ-270 | Listening passages: a short passage with comprehension questions. | PR-p0-32 | no | N-37 | F-264 (inherits easy) | should | active |
| RQ-271 | Long listening: a long text plays sentence by sentence, with a progress bar and time. | PR-p0-33 | no | N-37 | F-265 (inherits easy) | should | active |
| RQ-272 | In long listening, the learner can go back or forward by sentence and by section, and repeat the sentence or start over. | PR-p0-34 | no | N-37 | F-266 (inherits easy) | should | active |
| RQ-273 | After a long text, the learner can loop any stretch: tap its first and last word, and it repeats with 3 seconds between rounds. | PR-p0-36 | no | N-37 | F-267 (inherits easy) | should | active |
| RQ-274 | Reading sentences and passages with multiple-choice questions. | PR-p0-37 | no | N-37 | F-268 (inherits easy) | must | active |
| RQ-275 | Long reading: read at your own pace, tap 'Done reading', then answer. | PR-p0-38 | no | N-37 | F-269 (inherits easy) | should | active |
| RQ-276 | After answering, the full text is shown, with a play button that highlights each sentence as it's read. | PR-p0-39 | no | N-11 | F-270 (inherits easy) | must | active |
| RQ-277 | After answering, the text is replayed automatically (can be turned off). | PR-p0-40 | no | N-11 | F-271 (inherits easy) | should | active |
| RQ-278 | After a sentence, grove asks what individual words mean in that sentence, with wrong options taken from other words' meanings. | PR-p0-42 | no | N-37 | F-272 (inherits easy) | must | active |
| RQ-279 | 'Pick the best translation' questions for whole sentences. | PR-p0-43 | no | N-37 | F-273 (inherits easy) | should | active |
| RQ-280 | A 'Got lucky' button on a right answer: the answer then doesn't raise the level. | PR-p0-44 | no | N-11 | F-274 (inherits easy) | should | active |
| RQ-281 | Origins: pick the right character breakdown (Japanese, Chinese) or the word's origin. | PR-p0-46 | no | N-37 | F-275 (inherits easy) | could | active |
| RQ-282 | Writing: rebuild a sentence from word tiles, after listening to it or reading a short scene; two tries. | PR-p0-47 | no | N-37 | F-276 (inherits easy) | should | active |
| RQ-283 | Word tiles can have several forms (e.g. inflections); tapping a placed tile lets the learner pick its form. | PR-p0-48 | no | N-37 | F-277 (inherits easy) | should | active |
| RQ-284 | Writing: fill the gaps in a passage from tiles; two tries; partial credit. | PR-p0-49 | no | N-37 | F-278 (inherits easy) | should | active |
| RQ-285 | Grammar exercises: what a highlighted pattern means, the right form for a gap, and short dialogues. | PR-p0-51 | no | N-37 | F-279 (inherits easy) | should | active |
| RQ-286 | Grammar build: build sentences with a pattern from tiles; five all right masters the pattern. | PR-p0-52 | no | N-37 | F-280 (inherits easy) | could | active |
| RQ-287 | A streak counter (a flame) for right answers in a row, with a special sound every 5. | PR-p0-55 | no | N-29, N-34 | F-281 (inherits easy) | should | active |
| RQ-288 | Short sounds and a vibration for right and wrong answers; sounds can be turned off. | PR-p0-56 | no | N-34 | F-282 (inherits easy) | should | active |
| RQ-289 | Progress dots show how each question in an item went. | PR-p0-57 | no | N-29 | F-283 (inherits easy) | should | active |
| RQ-290 | After each item, a ring shows the score in percent and the level change counts up or down. | PR-p0-58 | no | N-29 | F-284 (inherits easy) | should | active |
| RQ-291 | Finishing a stage of a skill shows a celebration with confetti. | PR-p0-59 | no | N-29, N-34 | F-285 (inherits easy) | should | active |
| RQ-292 | A saved word flies to its list's button. | PR-p0-60 | no | N-34 | F-286 (inherits easy) | should | active |
| RQ-293 | A double tap or long press starts selecting several words of one sentence as a phrase, saved as one entry. | PR-p0-63 | no | N-11 | F-287 (inherits easy) | should | active |
| RQ-294 | Saved words and phrases are coloured in texts (heard, seen, both, retired, has another reading). | PR-p0-64 | no | N-38 | F-288 (inherits easy) | must | active |
| RQ-295 | A 'How tapping works' card explains the taps and the colours. | PR-p0-65 | no | N-11, N-39 | F-289 (inherits easy) | should | active |
| RQ-296 | Saving or removing shows a confirmation with Undo. | PR-p0-66 | no | N-11 | F-290 (inherits easy) | should | active |
| RQ-297 | 'Explain': flag a word or phrase for the AI to explain in the next pack, with a reason (why this form, why this word is here, a different meaning than I know, reading, other) and a note. | PR-p0-67 | wording only | N-45 | F-291 (inherits easy) | must | active |
| RQ-298 | the AI's explanations appear in the word's menu in the next pack. | PR-p0-68 | wording only | N-45 | F-292 (inherits easy) | must | active |
| RQ-299 | 'Pattern': flag that there's a grammar pattern in a word; the AI adds it and explains it in Patterns. | PR-p0-69 | wording only | N-45, N-05 | F-293 (inherits easy) | should | active |
| RQ-300 | Tick which of a word's grammar patterns apply in this sentence; ticked patterns are saved to Patterns with the sentence as an example. | PR-p0-70 | no | N-45, N-05 | F-294 (inherits easy) | should | active |
| RQ-301 | Report a question (wrong answer, bad translation, unnatural sentence, wrong reading, audio, other, with a note): it doesn't count, and the AI fixes it in the next pack. | PR-p0-71 | wording only | N-45, N-43 | F-295 (inherits easy) | must | active |
| RQ-302 | On a flashcard, tapping a character (kanji) asks the AI to explain it; it's saved under Characters. | PR-p0-76 | wording only | N-45, N-40 | F-296 (inherits easy) | could | active |
| RQ-303 | Patterns: the patterns and characters the learner marked, newest first, each use with its 5 newest examples and translations. | PR-p0-77 | no | N-05 | F-297 (inherits easy) | could | active |
| RQ-304 | In Patterns, the learner can search, add a note, remove a pattern or an example, and open the AI's explanation. | PR-p0-78 | wording only | N-05 | F-298 (inherits easy) | could | active |
| RQ-305 | 'Answered items': every answered item with its text, the right answers, play and marks. | PR-p0-79 | no | N-38 | F-299 (inherits easy) | should | active |
| RQ-306 | Two looks: Night forest (dark) and Pale birch (light), following the device's setting by default. | PR-p0-82 | no | N-11 | F-300 (inherits easy) | must | active |
| RQ-307 | Text size can be changed (A−/A+, from 0.8 to 1.6 times). | PR-p0-83 | no | N-11 | F-301 (inherits easy) | should | active |
| RQ-308 | Fewer animations when the device asks for reduced motion. | PR-p0-85 | no | N-11 | F-302 (inherits easy) | should | active |
| RQ-309 | The app is called Grove, with the tagline 'grow from what you know'. | PR-p0-86 | no | N-34 | F-303 (inherits easy) | should | active |
| RQ-310 | The logo is three small trees on a ground line. | PR-p0-87 | no | N-34 | F-304 (inherits easy) | should | active |
| RQ-311 | The logo grows (an animation) when a pack opens and on the mode explainer cards. | PR-p0-88 | no | N-34 | F-305 (inherits easy) | could | active |
| RQ-312 | A forest palette: greens with warm wood and amber accents. | PR-p0-89 | no | N-34 | F-306 (inherits easy) | should | active |
| RQ-313 | Soft coloured glows behind the content, staying put while the page scrolls. | PR-p0-90 | no | N-34 | F-307 (inherits easy) | should | active |
| RQ-314 | Content sits on rounded, frosted-glass cards (blurred, see-through panels with soft shadows). | PR-p0-91 | no | N-34 | F-308 (inherits easy) | should | active |
| RQ-315 | A top bar that stays at the top: logo and name on the left, icon buttons on the right (streak, home, patterns, reading list, heard words, settings), each list button showing its count. | PR-p0-93 | no | N-34 | F-309 (inherits easy) | should | active |
| RQ-316 | Buttons are rounded and dip slightly when pressed; main buttons have a green gradient and a soft glow. | PR-p0-94 | no | N-34 | F-310 (inherits easy) | should | active |
| RQ-317 | Home's skill cards sit in a 2×2 grid, each with an icon, the skill's level and thin glowing progress bars for its stages. | PR-p0-95 | no | N-29 | F-311 (inherits easy) | should | active |
| RQ-318 | A row of small level cards (one per skill) shows each level's number and name; tapping one opens its slider. | PR-p0-96 | no | N-29 | F-312 (inherits easy) | should | active |
| RQ-319 | Answer options are large rounded buttons: a right one turns green with a check mark and a small bounce; a wrong one turns red with a cross and shakes. | PR-p0-97 | no | N-34 | F-313 (inherits easy) | should | active |
| RQ-320 | Progress dots are leaf-shaped: green right, red wrong, amber partly right, grey reported. | PR-p0-98 | no | N-34 | F-314 (inherits easy) | could | active |
| RQ-321 | Listening opens a full-screen dark player, with sound-wave rings spreading from a speaker icon while it plays. | PR-p0-99 | no | N-34 | F-315 (inherits easy) | could | active |
| RQ-322 | Word menus are pop-up cards that slide up over a blurred background, with a coloured header strip. | PR-p0-100 | no | N-34 | F-316 (inherits easy) | should | active |
| RQ-323 | One tap shows a speech bubble pointing at the word (meaning and buttons), which closes by itself after 4 seconds. | PR-p0-101 | no | N-34 | F-317 (inherits easy) | should | active |
| RQ-324 | Readings appear in small grey text above or below each word. | PR-p0-105 | no | N-11 | F-318 (inherits easy) | should | active |
| RQ-325 | Word tiles look like small raised cards; placed tiles go into a dashed answer area, and tiles slide smoothly when moved. | PR-p0-106 | no | N-11 | F-319 (inherits easy) | should | active |
| RQ-326 | Gaps in a passage are shaded boxes with an underline, turning green or red when checked. | PR-p0-107 | no | N-34 | F-320 (inherits easy) | could | active |
| RQ-327 | Screens slide in from the right when opened. | PR-p0-108 | no | N-34, N-39 | F-321 (inherits easy) | should | active |
| RQ-328 | A 'Next question' bar floats at the bottom of the screen. | PR-p0-109 | no | N-34 | F-322 (inherits easy) | could | active |
| RQ-329 | The retire check has a wood-coloured card and banner; retiring stamps 'Retired' on the card and folds it away. | PR-p0-110 | no | N-29 | F-323 (inherits easy) | could | active |
| RQ-330 | The result ring fills in green, or in the accent colour below 50%. | PR-p0-111 | no | N-11 | F-324 (inherits easy) | should | active |
| RQ-331 | Text uses a sans-serif font that suits Japanese (Zen Kaku Gothic New, Hiragino or Noto Sans JP), falling back to the device's font. | PR-p0-112 | no | N-34 | F-325 (inherits easy) | should | active |
| RQ-332 | The AI's explanations appear in boxes with a coloured bar down the left side. | PR-p0-113 | no | N-05 | F-326 (inherits easy) | should | active |
| RQ-333 | Skill cards have a soft glow in one corner. | PR-p0-114 | no | N-34 | F-327 (inherits easy) | should | active |
| RQ-334 | Night forest (the dark look) uses the colour tokens in Appendix A.1. | PR-p0-115 | no | N-34 | F-328 (inherits easy) | should | active |
| RQ-335 | Pale birch (the light look) uses the colour tokens in Appendix A.1. | PR-p0-116 | no | N-34 | F-329 (inherits easy) | should | active |
| RQ-336 | The background glows, overlays, listening player, mastered marks and confetti use the fixed colours in Appendix A.1. | PR-p0-117 | no | N-34 | F-330 (inherits easy) | should | active |
| RQ-337 | Type follows Appendix A.2: Zen Kaku Gothic New (with fallbacks), the listed sizes, and text sizes that follow the size setting. | PR-p0-118 | no | N-34 | F-331 (inherits easy) | should | active |
| RQ-338 | Corner radii follow Appendix A.3. | PR-p0-119 | no | N-34 | F-332 (inherits easy) | should | active |
| RQ-339 | Cards are frosted glass with the blur, shadow and glow in Appendix A.3. | PR-p0-120 | no | N-34 | F-333 (inherits easy) | should | active |
| RQ-340 | Main buttons have the green gradient and glow in Appendix A.3, and every button shrinks slightly while pressed. | PR-p0-121 | no | N-34 | F-334 (inherits easy) | should | active |
| RQ-341 | The layout follows Appendix A.3: one column at most 560px wide, a sticky blurred top bar, and the listed grids. | PR-p0-122 | no | N-34 | F-335 (inherits easy) | should | active |
| RQ-342 | Progress bars, progress dots and the result ring look as in Appendix A.3. | PR-p0-123 | no | N-34 | F-336 (inherits easy) | should | active |
| RQ-343 | Word underlines and marks look as in Appendix A.3. | PR-p0-124 | no | N-34 | F-337 (inherits easy) | should | active |
| RQ-344 | Explanation boxes look as in Appendix A.3. | PR-p0-125 | no | N-34 | F-338 (inherits easy) | should | active |
| RQ-345 | Motion follows the timings in Appendix A.4. | PR-p0-126 | no | N-34 | F-339 (inherits easy) | should | active |
| RQ-346 | The logo is drawn exactly as in Appendix A.5. | PR-p0-127 | no | N-34 | F-340 (inherits easy) | should | active |
| RQ-347 | Chinese pinyin tones have their own colours (tokens --t1…--t5 in Appendix A.1). | PR-p0-128 | no | N-34 | F-341 (inherits easy) | should | active |
| RQ-348 | The learner chooses the size of an AI exchange from several sizes (e.g. a 20-minute part, a package, a week's worth), so they can control how long the AI takes and keep within its usage limits. | PR-p1-278 | yes (new, question-pages/45) | N-19, N-15 | F-342: possible with limits | should | active |
| RQ-349 | Grove runs on a rented server in Helsinki, reached through its own domain name. | PR-p1-279 | yes (new, question-pages/46) | N-18, N-20 | own check needed | must | dropped (question-pages/47: budget zero, the €20 plan dropped) |
| RQ-350 | For paid accounts, grove sends its prompts to the AI itself (Claude Sonnet 5.5) and pastes nothing by hand. | PR-p1-280 | yes (new, question-pages/46) | N-19, N-15 | own check needed | must | dropped (question-pages/47: budget zero, the €20 plan dropped) |
| RQ-351 | The owner marks an account as paid and sets its monthly AI cap; free accounts have a cap of 0. | PR-p1-281 | yes (new, question-pages/46) | N-15 | own check needed | must | dropped (question-pages/47: budget zero, the €20 plan dropped) |
| RQ-352 | When an account's monthly AI cap is used up, grove offers copy-paste with the learner's own AI instead. | PR-p1-282 | yes (new, question-pages/46) | N-15, N-19 | own check needed | must | dropped (question-pages/47: budget zero, the €20 plan dropped) |
| RQ-353 | Grove's total AI spending in a month stays within a budget the owner sets (about €9). | PR-p1-283 | yes (new, question-pages/46) | N-15 | own check needed | must | dropped (question-pages/47: budget zero, the €20 plan dropped) |
| RQ-354 | Learners pay for a paid account in grove itself. | PR-p1-284 | yes (new, question-pages/46) | N-15 | own check needed | won't (this time): payments later | dropped (question-pages/47: budget zero, the €20 plan dropped) |
| RQ-355 | A text counts as understood when rated 'most' or 'everything'. | PR-p1-204 | no (combine correction 2026-10-21 (question-pages/47): wrongly left out) | N-13 | F-343 (inherits F-p1-36: easy) | must | active |
| RQ-356 | Grove counts how many times the learner has met each word. | PR-p1-209 | no (combine correction 2026-10-21 (question-pages/47): wrongly left out) | N-29 | F-344 (inherits F-p1-37: easy) | should | active |
| RQ-357 | Each dictionary entry shows an example of where the learner met it. | PR-p1-217 | no (combine correction 2026-10-21 (question-pages/47): wrongly left out) | N-29 | F-345 (inherits F-p1-43: easy) | must | active |
| RQ-358 | Grove uses the bank for example sentences in exercises. | PR-p1-227 | no (combine correction 2026-10-21 (question-pages/47): wrongly left out) | N-43 | F-346 (inherits F-p1-85: easy) | should | active |
| RQ-359 | The AI suggests a pattern's level when it's first added. | PR-p1-231 | no (combine correction 2026-10-21 (question-pages/47): wrongly left out) | N-05 | F-347 (inherits F-p1-11: easy) | should | active |
| RQ-360 | The owner can mark an invitation as a reviewer invitation. | PR-p1-285 | yes (new, question-pages/47) | N-18 | F-348: easy | must | active |
| RQ-361 | A reviewer account starts with a set of ready-made Swedish texts (demo content), made in advance in the AI answer format. | PR-p1-286 | yes (new, question-pages/47) | N-18, N-15 | F-349: easy | must | active |
| RQ-362 | A reviewer account starts with a demo learner history: a ground of a few hundred words, some drilled words, ratings and progress. | PR-p1-287 | yes (new, question-pages/47) | N-18 | F-350: easy | must | active |
| RQ-363 | A reviewer account skips the starting level and lands on Home as the demo learner; 'Set my starting level again' replaces the demo ground with their own. | PR-p1-288 | yes (new, question-pages/47) | N-18 | F-351: easy | must | active |
| RQ-364 | The README of the GitHub repo the owner shares shows grove's current link; the owner's computer updates it by itself whenever the tunnel's address changes. | PR-p1-289 | yes (new, question-pages/48) | N-18 | F-352: easy | must | active |
| RQ-365 | Under the speech-speed slider, a short note says that how well it works depends on the device's voice. | PR-p1-290 | yes (new, question-pages/48) | N-03 | F-353: easy | should | active |
| RQ-366 | Accounts (sign-up, sign-in, stored passwords) are handled by Firebase Authentication with email and password; nobody needs a Google account. | PR-p1-291 | yes (new, question-pages/49) | N-20, N-18 | F-354: possible with limits | must | active |
| RQ-367 | The browser talks only to grove; grove's server talks to Firebase for sign-up, sign-in and password resets. | PR-p1-292 | yes (new, question-pages/49) | N-20, N-24 | F-355: easy | must | active |
| RQ-368 | The private repo's README holds one reviewer invitation code, valid for at most 5 sign-ups. | PR-p1-293 | yes (new, question-pages/49) | N-18 | F-356: easy | must | active |
| RQ-369 | When the device has no Swedish voice, grove says which browsers on which devices have one. | PR-p1-294 | yes (new, question-pages/49) | N-03 | F-357: easy | should | active |
| RQ-370 | A page explains grove's own terms (such as ground, drilling, CEFR), reachable from every screen. | PR-p1-295 | yes (new, question-pages/49) | N-25, N-26 | F-358: easy | should | active |
| RQ-371 | A security log records sign-ups (with the invitation used), sign-ins, lockouts, password resets and the owner's actions: who, when, what. | PR-p1-296 | yes (new, question-pages/50) | N-18 | F-359: easy | must | active |
| RQ-372 | Sign-in, sign-up and password reset give the same answer whether or not an email address has an account. | PR-p1-297 | yes (new, question-pages/50) | N-24 | F-360: easy | must | active |
| RQ-373 | The owner gives or removes the content maintainer role; the owner is always a content maintainer. | PR-p1-298 | yes (new, question-pages/51) | N-18, N-43 | F-361: easy | should | active |
| RQ-374 | Content maintainers check, in the review list, the sentences and entries the automatic check can't settle. | PR-p1-299 | yes (new, question-pages/51) | N-43 | F-362: easy | should | active |
| RQ-375 | A shared text reaches other learners only when every sentence has passed the automatic check or a content maintainer's check. | PR-p1-300 | yes (new, question-pages/51) | N-43 | F-363: easy | should | active |
| RQ-376 | The terms of use say that a learner's own texts get only automatic checks, and may contain mistakes. | PR-p1-301 | yes (new, question-pages/51) | N-25, N-43 | F-364: easy | should | active |
| RQ-377 | An easy read is accepted with at most 1 new word; with 2 or more, grove gives a fix-it prompt. | PR-p1-302 | yes (new, question-pages/52) | N-34, N-15 | F-365: easy | should | active |
| RQ-378 | A text with clearly fewer new words than the target is still accepted; grove's next prompt asks more firmly for new words. | PR-p1-303 | yes (new, question-pages/52) | N-15, N-11 | F-366: easy | should | active |
| RQ-379 | Grove finds new words in an AI answer itself; new words the AI didn't list are not a reason to reject it, and grove gives one short prompt for the meanings of those not in its dictionary. | PR-p1-304 | yes (new, question-pages/52) | N-15, N-12 | F-367: easy | must | active; changed 2026-10-26 (question-pages/66, addendum 002): the meanings prompt is withdrawn, replaced by RQ-396–398 and RQ-400 |

Requirements added after the freeze (RQ-380 on) are in the addenda: [001](addenda/001-requirements-without-rq.md) RQ-380…389, [002](addenda/002-prompts-and-meanings.md) RQ-390…402, [003](addenda/003-reading-and-word-menu.md), [004](addenda/004-home-and-sessions.md), [005](addenda/005-home-groups-libraries.md) RQ-429…439, [006](addenda/006-learning-tiles-and-way-back.md) RQ-440…447.

Requirements from sketches (`docs/sketching.md`; small UI changes need no addendum, question-pages/84, 39):

| ID | Requirement | Sources | Rewords or merges? | Needs | Feasibility | Priority | Status |
|---|---|---|---|---|---|---|---|
| RQ-448 | **Progress** shows, from the picked sketch (version B): the level started at against the level now, and today's minutes; four cards for minutes read and listened in the last 7 days (words underneath), the leaves being drilled now and the ground (words and grammar patterns apart); the last 7 days day by day, read and listened apart; and since the start: read, listened, ever picked up, and the ground with how many came from the starting level. Reading and listening minutes are recorded apart. | B-27; question-pages/85 (2), 87 | yes (RQ-48, RQ-71: Progress's 14 day bars, ground size and drilled count) | N-29, N-36, N-42 | easy | should | active |
| RQ-449 | Every row of both dictionaries (your dictionary and the common dictionary) has, at its right, one button showing only the action possible now: **Let it fall** on a leaf, **Pick up** on a word in the ground or not yet the learner's; it turns over after a tap, a message says what happened with **Undo** for a few seconds, and each row shows its state (leaf, ground, new). A wrong answer in Let it fall's meaning check offers **Let it fall anyway**. | B-28; question-pages/85 (3), 88 | yes (RQ-382, RQ-383, RQ-416: Let it fall and Pick up in the word menu and Dictionary; RQ-432's Add as a leaf) | N-12, N-04, N-38, N-32 | easy | should | active |

## Open: implicit requirements still undecided

None: every implicit requirement in p0 and p1 is decided.

## Not carried over

Corrected on 2026-10-21 (question-pages/47): last night's combine cited some p1 IDs one too low. PR-p1-204, 227 and 231 were wrongly listed here and are now RQ-355, 358, 359; PR-p1-200, 222 (conflict 5), PR-p1-230 (page 43) and PR-p1-187 (page 46) are dropped as RQ-192, 208, 215, 181.

| Source | Requirement | Why |
|---|---|---|
| PR-p0-01 | All of a learner's data (levels, saved words, progress, settings) is kept in a pack file on the learner's device, not on a server. | prototype detail, no need |
| PR-p0-02 | The learner starts by opening a pack file from their device. | prototype detail, no need |
| PR-p0-03 | A pack can also be loaded by pasting its code (text starting with 'LC2:'). | denied |
| PR-p0-05 | The learner saves progress by downloading the updated pack file; its name holds the language, the pack's title and the date. | prototype detail, no need |
| PR-p0-06 | The page warns before closing when there's unsaved progress. | prototype detail, no need |
| PR-p0-08 | The pack file's contents are compressed and scrambled, so they can't be read as plain text. | prototype detail, no need |
| PR-p0-09 | Opening a different pack asks for confirmation when there's unsaved progress. | prototype detail, no need |
| PR-p0-11 | A pack can be audio-free, which hides the listening skill. | denied |
| PR-p0-12 | grove works for many languages; the pack says which (Japanese if it doesn't). | prototype detail, no need |
| PR-p0-13 | Level names follow the language: JLPT N5–N1 for Japanese, CEFR A1–C2 for others; a pack can set its own scale. | prototype detail, no need |
| PR-p0-21 | Levels run from 1 to 6 (matching the six level names), shown with two decimals. | denied |
| PR-p0-27 | Each answered item moves the skill's level up or down, by how the score compares with what the level predicted. | denied |
| PR-p0-28 | Listening scores count for less when the learner replayed the audio many times or used slow speed. | denied |
| PR-p0-31 | While listening, the learner can replay, sees how many times they've played it, and can choose natural or slow speed. | conflict 9: speech speed is a slider (replay and play counter carried in RQ) |
| PR-p0-35 | Long listening can be left and continued later from the same place. | denied |
| PR-p0-45 | In context: what does this word mean here? (In listening, the sentence stays hidden until answered.) | denied |
| PR-p0-53 | Master drill: one word or pattern in five sentences; pick what each means; all five right counts, one miss moves on. | denied |
| PR-p0-54 | A word or pattern mastered in two different packs gets a 'mastered' badge. | denied |
| PR-p0-72 | Mark each item as too hard, just right or too easy, for Claude to use in the next pack. | conflict 6: p1's five-button rating replaces the three marks |
| PR-p0-73 | Home shows how many items are marked and questions reported for Claude. | denied |
| PR-p0-84 | Settings are saved in the pack file. | prototype detail, no need |
| PR-p1-14 | No paid tier in v1; a paid tier may come later. | no need: a constraint (the owner's budget; goes to constraints) |
| PR-p1-17 | Features: vocabulary list (add/see), phrase list, grammar pattern list, generated reading passages from known items, translation exercises, listening/text-to-speech, visual map, progress stats. | prototype detail, no need (feature list; covered by the needs of its parts) |
| PR-p1-19 | Left out for now: social features and a mobile app. | prototype detail, no need (scope note: what's left out) |
| PR-p1-21 | The first prototype has roughly everything in PR-p1-17 and PR-p1-18, seeded with Swedish sample content to try at once. | prototype detail, no need (about the first prototype) |
| PR-p1-43 | One learner per server: no accounts or login. | denied |
| PR-p1-46 | A 'Drill this' button wherever a known word appears (inspector, dictionary, map). | denied |
| PR-p1-49 | Speech plays at 0.9× speed by default. | denied |
| PR-p1-52 | 'Continue' (the automatic next activity) weighs reading and listening double. | denied |
| PR-p1-67 | Navigation: Home, Library, Practice, Dictionary, My grove, Progress, Topics, Why this works. | prototype detail, no need (screen names) |
| PR-p1-69 | Reset buttons: back to the demo learner, or start from zero. | denied |
| PR-p1-70 | Sample texts (an episode, a dialogue, a choose-your-path story) in the demo library. | denied |
| PR-p1-76 | Settings hold the speech speed. | conflict 9: speech speed is a slider |
| PR-p1-86 | Progress shows the words met most often, as drilling candidates. | denied |
| PR-p1-93 | Speech starts at normal speed (1×); the learner can change it in Settings (PR-p1-76). | conflict 9: speech speed is a slider, starting at 1× |
| PR-p1-129 | When the owner's computer is off, grove is unavailable until it's back. | no need: a constraint (hosting on the owner's computer, PR-p1-127) |
| PR-p1-134 | A browser extension copies the prompt into the learner's AI chat and the answer back into grove. | dropped |
| PR-p1-198 | New words are explained in simple Swedish. | conflict 5: English shows under each sentence (p0's rule everywhere) |
| PR-p1-199 | English is shown only on tap. | conflict 5: English shows under each sentence (p0's rule everywhere) |

## Conflicts resolved (question-pages/44, 45)

| Requirements | Conflict | Decision |
|---|---|---|
| PR-p0-04, 07 / PR-p1-24, 25, 30 | AI exchange: packs vs prompts per part | p0's way: one exchange per session, only changes (RQ-01, 02) |
| PR-p0-20, 23, 26, 58 / PR-p1-64, 269 | Levels per skill vs one level from known words | p1's level, plus per-skill levels, draggable (RQ-03…05) |
| PR-p0-24, 25 / PR-p1-36 | Stages vs drilling only | Stages, with Review = drilling (RQ-06) |
| PR-p0-62, 74, 75 / PR-p1-40, 41 | Saved lists vs ground | Lists = drilling (RQ-07…09) |
| PR-p0-41, 104 / PR-p1-198, 199 | Translations shown vs on tap | p0's rule everywhere (RQ-10) |
| PR-p0-72 / PR-p1-33 | Three marks vs five buttons | p1's five buttons (RQ-11) |
| PR-p0-67…69 / PR-p1-74, 230 | Flag for later vs ask now | Both |
| PR-p0-102 / PR-p1-219 | One pattern colour vs one per pattern | p0's single pink (RQ-12) |
| PR-p0-31 / PR-p1-93, 204 | 0.95×/0.7× vs 1×/slow | Neither: a slider (RQ-13) |
| PR-p0-80, 81 / PR-p1-173, 210 | Retire check vs drilling success | Retire = join the ground (RQ-15, 16) |
| PR-p0-30…52 / PR-p1-29…31 | Exercises vs texts | Texts first, exercises made from them (RQ-17) |
| RQ-01 / PR-p1-30, 192, 194 (RQ-44, 186, 188) | One exchange per session vs a package in prompt-per-part pieces (missed in the first run) | Both: the session starts with the summary exchange; extra part prompts, without a summary, for more texts in the same session; the learner chooses the exchange size (RQ-348) |
