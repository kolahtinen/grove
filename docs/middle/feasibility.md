# Feasibility: grove (app-wide)

Phase 2 (`/pre.feasibility`, 2026-10-21; question-pages/48). Checked on **requirements**, never on needs. Every active combined requirement (RQ-…) has an F-ID; F-NN numbers follow the order of docs/requirements.md. A requirement copied unchanged inherits its prototype rating (F-p0-…, F-p1-…, see docs/discovery/*/feasibility.md); merged, reworded and new ones were checked here. Budget: zero (C-01). Time: first build by Sunday 25 October 2026 (C-02).

## Easy, or inherited (one line each)

| ID | Requirement | Why easy (or: inherited from) |
|---|---|---|
| F-02 | RQ-02: The summary for the AI and the answer pasted back are plain text: only what changed, never the whole learner d… | Plain-text summary built from local data; no outside service. |
| F-04 | RQ-04: Each skill (listening, reading, writing, grammar) also has its own level, combining the learner's exercise res… | Local calculation from exercise results and the overall level (question-pages/45). |
| F-05 | RQ-05: The learner can drag a level to set where the AI pitches the next texts. | A slider whose value goes into the next prompt. |
| F-06 | RQ-06: Practice comes in three stages: Discover (new texts and items), Review (exercises on the words being drilled, … | Local grouping of exercises into stages. |
| F-07 | RQ-07: From the word menu, the learner marks a word for drilling, as a Heard word (by ear) or on the Reading list (wr… | A button in the word menu; local data. |
| F-08 | RQ-08: Heard words: the words the learner drills by ear, each with play, meaning and delete. | A list screen over local data. |
| F-09 | RQ-09: Reading list: the words the learner drills in writing, with flashcard practice (Show, Again, Got it). | A flashcard screen over local data. |
| F-10 | RQ-10: After answering, and in texts, a translation shows under each sentence; a setting turns translations off. | The AI answer carries a translation per sentence (prompt rule); shown under each sentence. Doubles the answer length: covered by F for RQ-01. |
| F-11 | RQ-11: The five-button rating after each text also goes to the AI with the session summary. | The rating is added to the summary text. |
| F-12 | RQ-12: Grammar patterns are marked inside sentences in the pattern colour (one colour for all patterns); the pattern'… | The AI answer marks pattern spans (prompt rule); grove colours them; one colour. |
| F-14 | RQ-14: While listening, the learner can replay and sees how many times they've played it. | Replay button and a counter. |
| F-15 | RQ-15: Every 20 answers, once the learner drills many words, grove asks about one drilled word: answer its meaning, t… | Local rule over drilled words. |
| F-16 | RQ-16: A retired word joins the ground and stops being drilled; it can be drilled again later. | Local status change. |
| F-17 | RQ-17: The AI writes texts (with questions); grove makes the exercises for listening, reading, writing and grammar fr… | Exercises built locally from the sentences, translations and pattern marks in the AI answer; grammar gaps use the other forms the AI lists (RQ-64). |
| F-18 | RQ-18: One tap on a word plays it and opens its menu: its meaning here, its dictionary form, its status and the phras… | Word menu over local data; plays the word with the browser voice (X-p1-02). |
| F-19 | RQ-19: The learner picks a topic, and texts are about it; it's shown on Home. | The topic goes into the prompt and onto Home. |
| F-20 | RQ-20: Read aloud only where the device has a voice for the language; otherwise grove says so once, with how to add o… | Inherits X-p1-02 (F-p1-03): voice check with speechSynthesis.getVoices(). |
| F-22 | RQ-22: Grammar patterns are introduced with a card: a short rule plus examples, then 'Got it'. | A card from the AI answer's pattern explanation. |
| F-23 | RQ-23: A single centred column (about 560 px wide at most), made for phones first, that also works in a desktop brows… | CSS layout. |
| F-24 | RQ-24: Grove serves adult self-learners. | inherited from F-p1-12: easy |
| F-25 | RQ-25: Grove works for learners at any level, beginner to advanced. | inherited from F-p1-13: easy |
| F-26 | RQ-26: Grove supports several target languages. | inherited from F-p1-04: possible with limits |
| F-27 | RQ-27: The learner sets objectives with weight sliders across skills (reading, listening, vocabulary, grammar, writin… | inherited from F-p1-14: easy |
| F-28 | RQ-28: Material the AI generates is mostly what the learner already knows, with at most 1 new word or phrase per sent… | inherited from F-p1-16: easy |
| F-29 | RQ-29: Grammar patterns are tracked as items, alongside words and phrases. | inherited from F-p1-17: easy |
| F-30 | RQ-30: Items form a dependency tree: words unlock phrases, phrases unlock patterns. | inherited from F-p1-18: easy |
| F-31 | RQ-31: The learner sees their knowledge as a growing tree/graph (visual map). | inherited from F-p1-19: easy |
| F-32 | RQ-32: Known items reappear in new contexts, instead of plain flashcard review. | inherited from F-p1-20: easy |
| F-33 | RQ-33: Difficulty rises automatically as knowledge grows. | inherited from F-p1-21: easy |
| F-34 | RQ-34: A word or phrase counts as learned when it's in the learner's ground. | inherited from F-p1-22: easy |
| F-35 | RQ-35: Learners can add items (words, phrases, patterns) themselves. | inherited from F-p1-23: easy |
| F-36 | RQ-36: The AI (by copy-paste) generates reading texts. | inherited from F-p1-25: easy |
| F-37 | RQ-37: Exercise types: flashcards, multiple choice, type the translation, build a sentence from word tiles, fill the … | inherited from F-p1-28: easy |
| F-38 | RQ-38: The app runs in a desktop web browser. | inherited from F-p1-02: possible with limits; X-p1-01 |
| F-39 | RQ-39: The learner can always choose which type of exercise to do from the home page, whatever the sliders say. | inherited from F-p1-31: easy |
| F-40 | RQ-40: Each AI feature shows a 'Copy prompt' button and a paste box. | inherited from F-p1-01: possible with limits |
| F-41 | RQ-41: When a pasted answer is malformed or breaks the rules, grove lists the problems. | inherited from F-p1-01: possible with limits |
| F-42 | RQ-42: Optionally, if the owner sets their own API key on the server, grove sends the same prompts directly and retri… | inherited from F-p1-32: easy |
| F-43 | RQ-43: Kinds of input: story series, the same story retold in variations, dialogues read with two voices, choose-your… | inherited from F-p1-33: easy |
| F-44 | RQ-44: One content package is about an hour of input. | inherited from F-p1-01: possible with limits |
| F-45 | RQ-45: Story series: the AI invents the characters. | inherited from F-p1-34: easy |
| F-46 | RQ-46: After a text, questions in simple Swedish check understanding. | inherited from F-p1-35: easy |
| F-47 | RQ-47: Listening: the learner can listen first and see the text afterwards. | inherited from F-p1-03: possible with limits; X-p1-02 |
| F-48 | RQ-48: Grove tracks hours of input (reading and listening). | inherited from F-p1-37: easy |
| F-49 | RQ-49: The drill exercises (PR-p1-18) stay. | inherited from F-p1-39: easy |
| F-50 | RQ-50: Prompts ask the AI to reuse the learner's fading words in new texts. | inherited from F-p1-40: easy |
| F-51 | RQ-51: Grove explains comprehensible input in a way that motivates learners and convinces them of the approach. | inherited from F-p1-41: easy |
| F-52 | RQ-52: After new content arrives, the learner marks the words they don't know, only half know, or never remember. | inherited from F-p1-42: easy |
| F-53 | RQ-53: A dictionary lists every word, phrase and grammar pattern the learner has met. | inherited from F-p1-43: easy |
| F-54 | RQ-54: Sentences from accepted AI texts are saved and reused in later exercises. | inherited from F-p1-44: easy |
| F-55 | RQ-55: Each sentence shows how many new words it has. | inherited from F-p1-45: easy |
| F-56 | RQ-56: Character and place names have their own list and never count as new words. | inherited from F-p1-47: easy |
| F-57 | RQ-57: Listening mode blurs the text until clicked. | inherited from F-p1-48: easy |
| F-58 | RQ-58: Multiple choice asks for a word's meaning inside a sentence, not on its own. | inherited from F-p1-49: easy |
| F-59 | RQ-59: Write with a pattern: grove checks for the pattern with a rule and lists words not in the tree, as a hint only… | inherited from F-p1-50: easy |
| F-60 | RQ-60: A drilled word joins the ground after a correct answer once its review interval reaches 4 days. | inherited from F-p1-51: easy |
| F-61 | RQ-61: Meeting a grammar pattern in a text gives it a light review (patterns only). | inherited from F-p1-52: easy |
| F-62 | RQ-62: Input time per text counts at most three times its estimated length and at least 30 seconds. | inherited from F-p1-53: easy |
| F-63 | RQ-63: The fix-it message lists the exact sentences and words that broke the rules. | inherited from F-p1-54: easy |
| F-64 | RQ-64: Prompts ask the AI for inflected forms of known words; grove learns them so they stop counting as unknown. | inherited from F-p1-55: easy |
| F-65 | RQ-65: New words from an accepted text, grammar example or topic go straight into the tree as new, with the AI's mean… | inherited from F-p1-56: easy |
| F-66 | RQ-66: AI grammar explanations are saved with the pattern. | inherited from F-p1-57: easy |
| F-67 | RQ-67: With an API key, the fix-it message is sent automatically, up to 3 tries. | inherited from F-p1-58: easy |
| F-68 | RQ-68: A choose-your-path answer is accepted only with a start, valid links, every part reachable and at least one en… | inherited from F-p1-59: easy |
| F-69 | RQ-69: Unit lengths: about 5 min per episode, 4 per retelling, 4 per dialogue, 6 per choose-your-path story. | inherited from F-p1-60: easy |
| F-70 | RQ-70: Five preset series ideas to choose from, plus your own topic. | inherited from F-p1-61: easy |
| F-71 | RQ-71: Progress shows minutes of input per day. | inherited from F-p1-62: easy |
| F-72 | RQ-72: Locked items (parts not yet known) are shown with dashed outlines on the map. | inherited from F-p1-63: easy |
| F-73 | RQ-73: A welcome screen on the first visit. | inherited from F-p1-65: easy |
| F-74 | RQ-74: Texts the learner pastes are saved (without English). | inherited from F-p1-66: easy |
| F-75 | RQ-75: The learner's data is saved after every change. | inherited from F-p1-67: easy |
| F-76 | RQ-76: Each text shows its word count, its new words and their share. | inherited from F-p1-68: easy |
| F-77 | RQ-77: Unknown words can be added from the inspector. | inherited from F-p1-69: easy |
| F-78 | RQ-78: Write with a pattern: the AI's verdict (correct, and uses the pattern) grades the exercise. | inherited from F-p1-72: easy |
| F-79 | RQ-79: A drilled word counts as fading when its strength drops below 0.2. | inherited from F-p1-73: easy |
| F-80 | RQ-80: Practice shows fading items first. | inherited from F-p1-74: easy |
| F-81 | RQ-81: After a choose-your-path story, the reader offers 'Try another path'. | inherited from F-p1-75: easy |
| F-82 | RQ-82: Default package mix: 4 episodes, 2 retellings, 3 dialogues, 2 choose-your-path stories. | inherited from F-p1-76: easy |
| F-83 | RQ-83: The whole package can be asked for in one prompt instead of in parts. | inherited from F-p1-01: possible with limits |
| F-84 | RQ-84: A package can be cancelled. | inherited from F-p1-77: easy |
| F-85 | RQ-85: A 'What your hours can bring' roadmap. | inherited from F-p1-78: easy |
| F-86 | RQ-86: Progress shows the ground over time (from daily snapshots). | inherited from F-p1-79: easy |
| F-87 | RQ-87: Progress compares each skill's share of practice with its slider. | inherited from F-p1-80: easy |
| F-88 | RQ-88: Tips. | inherited from F-p1-81: easy |
| F-89 | RQ-89: The server collects a large bank of words and grammar for each language. | inherited from F-p1-05: possible with limits |
| F-90 | RQ-90: Several learners, each with an account and login. | inherited from F-p1-07: possible with limits |
| F-91 | RQ-91: Teachers have accounts with their classes (see PR-p1-01). | inherited from F-p1-83: easy |
| F-92 | RQ-92: Bank entries come from the AI answers learners paste in. | inherited from F-p1-05: possible with limits |
| F-93 | RQ-93: The bank (PR-p1-89) is shared by all learners on the server. | inherited from F-p1-84: easy |
| F-94 | RQ-94: Grove uses the bank for word meanings without asking the AI each time. | inherited from F-p1-85: easy |
| F-95 | RQ-95: New entries for the shared bank are checked by a background process; until checked, other learners don't get t… | inherited from F-p1-06: possible with limits; X-p1-01 |
| F-96 | RQ-96: The learner who pasted an answer can use its new words right away, marked 'unchecked' until the background che… | inherited from F-p1-86: easy |
| F-97 | RQ-97: Anyone can sign up for an account. | inherited from F-p1-07: possible with limits |
| F-98 | RQ-98: Teachers can see each student's progress. | inherited from F-p1-08: possible with limits; X-p1-03 |
| F-99 | RQ-99: Teachers can correct entries in the shared bank (PR-p1-94). | inherited from F-p1-87: easy |
| F-100 | RQ-100: Teachers can choose the topics or texts their class works on. | inherited from F-p1-88: easy |
| F-101 | RQ-101: The background check (PR-p1-97) compares a new entry with an open dictionary imported into the bank (e.g. Wikt… | inherited from F-p1-05: possible with limits |
| F-102 | RQ-102: Only the owner and content maintainers (RQ-373) can approve entries for everyone, in a review list; a teacher's appr… | Own check (2026-10-23; reworded on question-pages/51): easy. The review list (F-p1-06) opened to a role checked on the server (RQ-373, F-361); X-p1-01, which made F-p1-06 'possible with limits', is not needed (grove runs on a server). |
| F-103 | RQ-103: A teacher can approve their own material; the students they invite see it straight away, but nobody else sees … | inherited from F-p1-89: easy |
| F-104 | RQ-104: A teacher's corrections to the shared bank go through the background check before other learners get them. | inherited from F-p1-90: easy |
| F-105 | RQ-105: A student joins a class with a class code from the teacher. | inherited from F-p1-08: possible with limits; X-p1-03 |
| F-106 | RQ-106: A teacher can invite a student to a class; the student accepts. | inherited from F-p1-08: possible with limits; X-p1-03 |
| F-107 | RQ-107: A student can leave a class; the teacher then stops seeing their progress. | inherited from F-p1-91: easy |
| F-108 | RQ-108: There is one bank per target language (PR-p1-03). | inherited from F-p1-04: possible with limits |
| F-109 | RQ-109: An entry that disagrees with the dictionary goes to the owner's review list; until the owner decides, only the… | inherited from F-p1-06: possible with limits; X-p1-01 |
| F-110 | RQ-110: An entry the dictionary doesn't have goes to the owner's review list; until the owner decides, only the learne… | inherited from F-p1-06: possible with limits; X-p1-01 |
| F-111 | RQ-111: Translations in the bank are into English only for now. | inherited from F-p1-05: possible with limits |
| F-112 | RQ-112: When the owner rejects an entry, they can offer a correction or deletion. | inherited from F-p1-92: easy |
| F-113 | RQ-113: A new learner can pick their CEFR level; grove adds the most common words for that level to their ground. | inherited from F-p1-09: possible with limits; X-p1-04 |
| F-114 | RQ-114: After picking a level, grove shows a sample of words from that level; the learner ticks the ones they don't kn… | inherited from F-p1-09: possible with limits; X-p1-04 |
| F-115 | RQ-115: A learner who doesn't know their level takes a reading test: short texts that get harder, each rated on the fi… | inherited from F-p1-10: possible with limits; X-p1-05 |
| F-116 | RQ-116: The starting level also sets which grammar patterns count as known. | inherited from F-p1-93: easy |
| F-117 | RQ-117: The list of words ranked by how common they are (frequency list) lives in the shared bank for each language (P… | inherited from F-p1-05: possible with limits |
| F-118 | RQ-118: An 'Expand your grove' exercise, available any time: grove shows the next most common words not yet in the gro… | inherited from F-p1-94: easy |
| F-119 | RQ-119: Grove offers 'Expand your grove' on its own when texts start having very few new words. | inherited from F-p1-95: easy |
| F-120 | RQ-120: 'Expand your grove' mixes in a few words already in the ground; ticking one as unknown takes it out of the gro… | inherited from F-p1-96: easy |
| F-121 | RQ-121: Words not in the ground that the learner ticks as unknown in the starting check or in 'Expand your grove' stay… | inherited from F-p1-97: easy |
| F-122 | RQ-122: Each grammar pattern's level (e.g. 'verb second' is A1) is stored with the pattern in the shared bank. | inherited from F-p1-11: easy |
| F-123 | RQ-123: Now and then, texts below the learner's level are mixed in with normal ones. | Own check (2026-10-23; PR-p1-125 was never rated): easy. A local rule puts a lower level into some prompts; the package rule is RQ-256 (F-250: easy). |
| F-124 | RQ-124: The learner can ask for an easy read: a text below their level. | Own check (2026-10-23; PR-p1-126 was never rated): easy. A button that asks for a lower level in the prompt; detail in RQ-257 (F-251: easy); built and tried in the p1 prototype. |
| F-126 | RQ-126: The owner can copy the review list as one prompt for their own AI and paste the verdicts back; grove applies t… | inherited from F-p1-108: easy |
| F-127 | RQ-127: Grove accepts an AI answer without a fix-it round when at most about 1 sentence in 10 has 2 new words; the exa… | inherited from F-p1-105: easy |
| F-128 | RQ-128: Texts learners get from their AI are offered, after the background check, to other learners at a similar level… | inherited from F-p1-102: possible with limits |
| F-129 | RQ-129: The background check of a text for the shared library covers the whole text and all its words. | inherited from F-p1-106: easy |
| F-130 | RQ-130: One prompt can ask the AI for a week's worth of texts, pasted back in parts; meant mainly for learners whose A… | inherited from F-p1-103: possible with limits |
| F-131 | RQ-131: The automatic check of bank entries also uses other free online dictionaries. | inherited from F-p1-100: possible with limits |
| F-132 | RQ-132: The automatic check looks for the word in real use (example sentences) in open text collections (corpora, e.g.… | inherited from F-p1-101: reduced, X-p1-07 |
| F-133 | RQ-133: Word tiles, fill the gap and type the translation work without AI, from saved sentences and the bank. | inherited from F-p1-107: easy |
| F-134 | RQ-134: A text the learner pasted from elsewhere (not written by their AI) goes into the shared library only when the … | inherited from F-p1-109: easy |
| F-135 | RQ-135: Grove keeps the source of every library text: who shared it, and where it came from. | inherited from F-p1-110: possible with limits |
| F-136 | RQ-136: If a library text breaks copyright, the owner can delete it; the words it added to the bank stay. | inherited from F-p1-110: possible with limits |
| F-137 | RQ-137: The learner chooses, for each text, whether it goes into the shared library. | inherited from F-p1-111: easy |
| F-138 | RQ-138: Texts a learner shares get a higher priority in the background check, so they're confirmed sooner. | inherited from F-p1-112: easy |
| F-139 | RQ-139: The learner who shared a text chooses whether it shows their name or stays anonymous. | inherited from F-p1-113: easy |
| F-140 | RQ-140: Any learner can report a library text as breaking copyright, wrong or offensive. | inherited from F-p1-114: easy |
| F-141 | RQ-141: Learners accept terms of use when they sign up; among other things, they may only share texts they have the ri… | inherited from F-p1-115: easy |
| F-142 | RQ-142: When a library text is deleted for copyright, the example sentences taken from it are deleted too; only its wo… | inherited from F-p1-116: easy |
| F-143 | RQ-143: The first time an account shares a text that breaks copyright, it is suspended for a fixed period (e.g. 30 day… | inherited from F-p1-117: easy |
| F-144 | RQ-144: The second time, the account is banned. | inherited from F-p1-117: easy |
| F-145 | RQ-145: Only copyright breaches lead to suspension or a ban; offensive or wrong texts are just deleted. | inherited from F-p1-117: easy |
| F-146 | RQ-146: There is exactly one owner, set in grove's settings on the owner's computer; nobody can become owner through g… | inherited from F-p1-118: easy |
| F-147 | RQ-147: Everyone who signs up is a learner. | inherited from F-p1-119: easy |
| F-148 | RQ-148: The owner doesn't see learners' progress inside courses. | inherited from F-p1-120: easy |
| F-149 | RQ-149: A learner who creates a course becomes its creator, at first the only one in charge. | inherited from F-p1-121: easy |
| F-150 | RQ-150: The course creator decides the course material, approves their own material for it, invites students or hands … | inherited from F-p1-122: easy |
| F-151 | RQ-151: The creator can add co-teachers; a co-teacher can add material and see progress, but can't change roles, remov… | inherited from F-p1-123: easy |
| F-152 | RQ-152: Only the creator gives or removes the co-teacher role. | inherited from F-p1-124: easy |
| F-153 | RQ-153: The creator can hand the course over to a co-teacher, who becomes the creator; the old creator becomes a co-te… | inherited from F-p1-125: easy |
| F-154 | RQ-154: Roles are per course: someone can be a student in one course and run another. | inherited from F-p1-126: easy |
| F-155 | RQ-155: Every request is checked on the server against who is asking and their role. | inherited from F-p1-127: easy |
| F-156 | RQ-156: After 5 failed sign-ins in a row, the account is locked for 15 minutes. | inherited from F-p1-128: easy |
| F-157 | RQ-157: Passwords are stored hashed (scrambled), never as written. | inherited from F-p1-129: easy |
| F-158 | RQ-158: Each account can add only a limited number of new bank entries a day. | inherited from F-p1-130: easy |
| F-159 | RQ-159: Every change to the shared bank is logged with who made it, when and what. | inherited from F-p1-131: easy |
| F-160 | RQ-160: Sign-ups per hour from one place are limited. | inherited from F-p1-132: easy |
| F-161 | RQ-161: A single paste has a maximum size. | inherited from F-p1-133: easy |
| F-162 | RQ-162: Visitors who aren't signed in reach only the sign-in and sign-up pages and public information; everything else… | inherited from F-p1-134: easy |
| F-163 | RQ-163: Grove serves students learning alongside a course. | inherited from F-p1-12: easy |
| F-164 | RQ-164: Grove serves teachers who set material for a class. | inherited from F-p1-12: easy |
| F-165 | RQ-165: A topic brings its own new words into the learner's tree. | inherited from F-p1-15: easy |
| F-166 | RQ-166: The learner can paste an article on a topic, if it isn't under copyright. | inherited from F-p1-15: easy |
| F-167 | RQ-167: The share of known words in a text starts at 95%. | inherited from F-p1-16: easy |
| F-168 | RQ-168: The share of known words moves with the learner's ratings, between 93% and 98%. | inherited from F-p1-16: easy |
| F-169 | RQ-169: Ground items don't fade. | inherited from F-p1-22: easy |
| F-170 | RQ-170: Only drilled items have a spaced-repetition strength and can fade. | inherited from F-p1-22: easy |
| F-171 | RQ-171: Grammar patterns keep plain spaced repetition. | inherited from F-p1-22: easy |
| F-172 | RQ-172: The AI generates items from what the learner knows. | inherited from F-p1-23: easy |
| F-173 | RQ-173: Items are extracted from texts the learner pastes in. | inherited from F-p1-23: easy |
| F-174 | RQ-174: The AI gives meanings for unknown words in pasted texts. | inherited from F-p1-25: easy |
| F-175 | RQ-175: The AI gives starter vocabulary for topics. | inherited from F-p1-25: easy |
| F-176 | RQ-176: The AI corrects the learner's free writing. | inherited from F-p1-25: easy |
| F-177 | RQ-177: The AI explains grammar. | inherited from F-p1-25: easy |
| F-178 | RQ-178: There is no conversation partner in the first version. | inherited from F-p1-25: easy |
| F-179 | RQ-180: A small server stores the data; a database is fine. | inherited from F-p1-02: possible with limits; X-p1-01 |
| F-180 | RQ-181: AI isn't required on the server. | inherited from F-p1-02: possible with limits; X-p1-01 |
| F-181 | RQ-182: Learners copy a prompt from grove into their own AI chat and paste the answer back. | inherited from F-p1-01: possible with limits |
| F-182 | RQ-183: The prompts work in any chat AI. | inherited from F-p1-01: possible with limits |
| F-183 | RQ-184: The prompts ask for one JSON block (a fixed data format), which grove reads exactly. | inherited from F-p1-01: possible with limits |
| F-184 | RQ-185: Grove gives a 'fix it' message to paste back into the same AI chat. | inherited from F-p1-01: possible with limits |
| F-186 | RQ-187: Closely bound content (e.g. consecutive episodes) stays in the same part. | inherited from F-p1-01: possible with limits |
| F-187 | RQ-188: Grove gives a 'next part' prompt until the package is complete. | Prompt text generated from the package state. |
| F-188 | RQ-189: The learner picks the mix of a package before copying the prompt. | inherited from F-p1-01: possible with limits |
| F-189 | RQ-190: The learner asks for a series topic or chooses from options. | inherited from F-p1-34: easy |
| F-190 | RQ-191: Each episode reuses the last episode's new words. | inherited from F-p1-34: easy |
| F-191 | RQ-193: A rating of 'almost nothing' or 'a little' leads to fewer new words and shorter sentences. | inherited from F-p1-36: easy |
| F-192 | RQ-194: After such a rating, grove offers a simpler retelling of the text. | inherited from F-p1-36: easy |
| F-193 | RQ-195: Several 'most' or 'everything' ratings in a row lead to slightly more new words. | inherited from F-p1-36: easy |
| F-194 | RQ-197: One sentence can be played on a loop. | inherited from F-p1-03: possible with limits; X-p1-02 |
| F-195 | RQ-198: A whole text can be played audio-only. | inherited from F-p1-03: possible with limits; X-p1-02 |
| F-196 | RQ-200: A drilled item joins the ground when drilling succeeds. | inherited from F-p1-38: easy |
| F-197 | RQ-201: Meeting words in texts is counted and shown but doesn't change their schedule. | inherited from F-p1-38: easy |
| F-198 | RQ-202: The sliders alone decide how much input and how much drilling the learner gets. | inherited from F-p1-39: easy |
| F-199 | RQ-203: Marked words are drilled. | inherited from F-p1-42: easy |
| F-200 | RQ-204: Unmarked words join the ground. | inherited from F-p1-42: easy |
| F-201 | RQ-205: Each dictionary entry shows its translation. | inherited from F-p1-43: easy |
| F-202 | RQ-206: The examples in AI grammar explanations are reused in exercises. | inherited from F-p1-57: easy |
| F-203 | RQ-207: When adding an unknown word, grove gives an AI prompt for its meaning. | inherited from F-p1-69: easy |
| F-204 | RQ-209: Bank entries have translations, examples and inflections. | inherited from F-p1-05: possible with limits |
| F-205 | RQ-210: Bank entries come from open dictionaries such as Wiktionary (licences to check). | inherited from F-p1-05: possible with limits |
| F-206 | RQ-211: The owner can write or correct bank entries. | inherited from F-p1-05: possible with limits |
| F-207 | RQ-212: Grove uses the bank to recognise inflected forms, so they don't count as unknown. | inherited from F-p1-85: easy |
| F-208 | RQ-213: Grove uses the bank to check AI answers. | inherited from F-p1-85: easy |
| F-209 | RQ-214: The learner who pasted a rejected entry chooses: keep it marked 'rejected', or take what the owner offers. | inherited from F-p1-92: easy |
| F-210 | RQ-216: Grove accepts an AI answer without a fix-it round when the text as a whole is within about 2 percentage points… | inherited from F-p1-105: easy |
| F-211 | RQ-217: In the first version, only people the owner invites (the course reviewers, and the owner) can create an accoun… | Own check (2026-10-23; PR-p1-233 was never rated): easy. Grove's server checks the invitation code (RQ-222, F-216) before it asks Firebase to create the account; Firebase itself is covered by F-354. |
| F-212 | RQ-218: Sign-up asks for an email address and a password. | Own check (2026-10-23; PR-p1-234 was never rated): easy. A sign-up form; Firebase's email-and-password sign-in is free and covered by F-354. |
| F-213 | RQ-219: A forgotten password can be reset by email. | possible with limits: through Firebase, see F-354 (question-pages/49). |
| F-214 | RQ-220: In the first version, the owner resets forgotten passwords by hand. | not needed: RQ-220 dropped (question-pages/49). |
| F-215 | RQ-221: A password needs at least 8 characters, with at least one letter, one digit and one symbol. | inherited from easy |
| F-216 | RQ-222: An invitation code can let in several people; the owner sets how many. | inherited from easy |
| F-217 | RQ-223: The owner's account is created with a setup command on the owner's computer | Own check (question-pages/50): a command-line script that creates the Firebase account through the Admin API and marks it as owner. |
| F-218 | RQ-224: A sign-in lasts 30 days on that device. | inherited from easy |
| F-219 | RQ-225: At most 10 sign-ups an hour from one internet address. | inherited from easy |
| F-220 | RQ-226: The page header shows the signed-in email and a Sign out button. | inherited from easy |
| F-221 | RQ-227: The owner is also a learner, with their own learner data. | inherited from easy |
| F-222 | RQ-228: The terms of use say: 13 and over; share only texts you may share; the suspension and ban rule; what data is k… | inherited from easy |
| F-223 | RQ-229: Learners ask the owner to export or delete their data (no button for it yet). | inherited from easy |
| F-224 | RQ-230: Each account can add at most 500 new bank entries a day. | inherited from easy |
| F-225 | RQ-231: A single paste or upload is at most 100 KB. | inherited from easy |
| F-226 | RQ-232: The dictionary check counts a meaning as agreeing when it shares a content word with the dictionary's meaning. | inherited from easy |
| F-227 | RQ-233: A word with the same meaning as an entry that's already checked isn't sent again; a different meaning is check… | inherited from easy |
| F-228 | RQ-234: A rejected entry shows a 'rejected' badge in the Dictionary, where the owner's offer and your choices open; no… | inherited from easy |
| F-229 | RQ-235: Your own unchecked words carry an 'unchecked' tag in the word inspector. | inherited from easy |
| F-230 | RQ-236: A shared text counts as checked only when every word in it is a checked bank entry or a character name. | inherited from easy |
| F-231 | RQ-237: A shared text's level is the lowest CEFR level that covers 95% of its words. | inherited from easy |
| F-232 | RQ-238: The shared library shows texts up to one level above yours, with 'show all levels' to see the rest. | inherited from easy |
| F-233 | RQ-239: 'Add to my library' copies a shared text into your own library. | inherited from easy |
| F-234 | RQ-240: After new content arrives, you can tick which texts to share and whether your name shows. | inherited from easy |
| F-235 | RQ-241: Report reasons are copyright, wrong or offensive, with a note. | inherited from easy |
| F-236 | RQ-242: The owner's review list shows shared texts first, then entries. | inherited from easy |
| F-237 | RQ-243: The owner can reject an entry with a corrected meaning, or (with none) offer to delete it. | inherited from easy |
| F-238 | RQ-244: The owner's batch review prompt lists the entries and asks the AI for {verdicts: [id, approve or reject, corre… | inherited from easy |
| F-239 | RQ-245: The owner sees the accounts with their strikes, suspensions and bans, but no learning progress. | inherited from easy |
| F-240 | RQ-246: The owner sees the full log of bank changes, searchable by word, person and action. | inherited from easy |
| F-241 | RQ-247: The suspension after a first copyright breach lasts exactly 30 days. | inherited from easy |
| F-242 | RQ-248: A new account (other than a reviewer's, RQ-363) goes straight to the starting level, after the welcome. | Routing after the welcome screen. |
| F-243 | RQ-249: The starting check shows a sample of 30 of the level's words. | inherited from easy |
| F-244 | RQ-250: The reading test has four texts (A1, A2, B1, B2); your level is the highest one you rated 'most' or 'everythin… | inherited from easy |
| F-245 | RQ-251: The starting check also shows the level's grammar patterns, each with an example; you tick the ones you don't … | inherited from easy |
| F-246 | RQ-252: Home has a 'Set my starting level again' button. | inherited from easy |
| F-247 | RQ-253: A level counts when it and every level below have 90% of their own words in your ground. | inherited from easy |
| F-248 | RQ-254: Expand shows the next 20 most common new words plus 3 words you already know. | inherited from easy |
| F-249 | RQ-255: Grove offers 'Expand your grove' on its own only after three texts in a row rated 'everything'. | inherited from easy |
| F-250 | RQ-256: In a package of 4 or more texts, the last dialogue (or the last text) is an easy read. | inherited from easy |
| F-251 | RQ-257: 'Get an easy read' asks for one dialogue made only of known words, on a topic you choose. | inherited from easy |
| F-252 | RQ-258: 'A week's worth' asks for 7 times the chosen mix, pasted back part by part. | inherited from easy |
| F-253 | RQ-259: A notifications bell in the header lists the owner's decisions about your entries and texts (rejected entries,… | inherited from easy |
| F-254 | RQ-260: Tapping a rejected word anywhere shows the owner's offer and your choices. | inherited from easy |
| F-255 | RQ-261: For listening, the learner picks a regional variety (e.g. Swedish from Sweden or Finland) and a voice. | inherited from F-p0-02: possible with limits |
| F-256 | RQ-262: For languages with another script (e.g. Japanese, Chinese), each word can show its reading: hiragana above, rō… | inherited from F-p0-03: possible with limits |
| F-257 | RQ-263: The learner chooses which reading layers to show (in Settings). | inherited from F-p0-03: possible with limits |
| F-258 | RQ-264: A Readings on/off switch under the text, remembered separately for listening and for reading. | inherited from F-p0-03: possible with limits |
| F-259 | RQ-265: Japanese and Chinese get a separate 'Reading list' list for written words; other languages only have 'Heard wo… | inherited from F-p0-03: possible with limits |
| F-260 | RQ-266: Home shows a card for each skill with its progress in each stage. | inherited from easy |
| F-261 | RQ-267: Choosing a skill shows its stages and modes (e.g. Sentences, Passages, Long text, Drill) with how many items a… | inherited from easy |
| F-262 | RQ-268: Items are picked near the learner's level for that skill, with some easier and some harder ones mixed in. | inherited from easy |
| F-263 | RQ-269: A short card explains each mode before it starts (10 seconds, tap to skip); it can be turned off. | inherited from easy |
| F-264 | RQ-270: Listening passages: a short passage with comprehension questions. | inherited from easy |
| F-265 | RQ-271: Long listening: a long text plays sentence by sentence, with a progress bar and time. | inherited from easy |
| F-266 | RQ-272: In long listening, the learner can go back or forward by sentence and by section, and repeat the sentence or s… | inherited from easy |
| F-267 | RQ-273: After a long text, the learner can loop any stretch: tap its first and last word, and it repeats with 3 second… | inherited from easy |
| F-268 | RQ-274: Reading sentences and passages with multiple-choice questions. | inherited from easy |
| F-269 | RQ-275: Long reading: read at your own pace, tap 'Done reading', then answer. | inherited from easy |
| F-270 | RQ-276: After answering, the full text is shown, with a play button that highlights each sentence as it's read. | inherited from easy |
| F-271 | RQ-277: After answering, the text is replayed automatically (can be turned off). | inherited from easy |
| F-272 | RQ-278: After a sentence, grove asks what individual words mean in that sentence, with wrong options taken from other … | inherited from easy |
| F-273 | RQ-279: 'Pick the best translation' questions for whole sentences. | inherited from easy |
| F-274 | RQ-280: A 'Got lucky' button on a right answer: the answer then doesn't raise the level. | inherited from easy |
| F-275 | RQ-281: Origins: pick the right character breakdown (Japanese, Chinese) or the word's origin. | inherited from easy |
| F-276 | RQ-282: Writing: rebuild a sentence from word tiles, after listening to it or reading a short scene; two tries. | inherited from easy |
| F-277 | RQ-283: Word tiles can have several forms (e.g. inflections); tapping a placed tile lets the learner pick its form. | inherited from easy |
| F-278 | RQ-284: Writing: fill the gaps in a passage from tiles; two tries; partial credit. | inherited from easy |
| F-279 | RQ-285: Grammar exercises: what a highlighted pattern means, the right form for a gap, and short dialogues. | inherited from easy |
| F-280 | RQ-286: Grammar build: build sentences with a pattern from tiles; five all right masters the pattern. | inherited from easy |
| F-281 | RQ-287: A streak counter (a flame) for right answers in a row, with a special sound every 5. | inherited from easy |
| F-282 | RQ-288: Short sounds and a vibration for right and wrong answers; sounds can be turned off. | inherited from easy |
| F-283 | RQ-289: Progress dots show how each question in an item went. | inherited from easy |
| F-284 | RQ-290: After each item, a ring shows the score in percent and the level change counts up or down. | inherited from easy |
| F-285 | RQ-291: Finishing a stage of a skill shows a celebration with confetti. | inherited from easy |
| F-286 | RQ-292: A saved word flies to its list's button. | inherited from easy |
| F-287 | RQ-293: A double tap or long press starts selecting several words of one sentence as a phrase, saved as one entry. | inherited from easy |
| F-288 | RQ-294: Saved words and phrases are coloured in texts (heard, seen, both, retired, has another reading). | inherited from easy |
| F-289 | RQ-295: A 'How tapping works' card explains the taps and the colours. | inherited from easy |
| F-290 | RQ-296: Saving or removing shows a confirmation with Undo. | inherited from easy |
| F-291 | RQ-297: 'Explain': flag a word or phrase for the AI to explain in the next pack, with a reason (why this form, why thi… | inherited from easy |
| F-292 | RQ-298: the AI's explanations appear in the word's menu in the next pack. | inherited from easy |
| F-293 | RQ-299: 'Pattern': flag that there's a grammar pattern in a word; the AI adds it and explains it in Patterns. | inherited from easy |
| F-294 | RQ-300: Tick which of a word's grammar patterns apply in this sentence; ticked patterns are saved to Patterns with the… | inherited from easy |
| F-295 | RQ-301: Report a question (wrong answer, bad translation, unnatural sentence, wrong reading, audio, other, with a note… | inherited from easy |
| F-296 | RQ-302: On a flashcard, tapping a character (kanji) asks the AI to explain it; it's saved under Characters. | inherited from easy |
| F-297 | RQ-303: Patterns: the patterns and characters the learner marked, newest first, each use with its 5 newest examples an… | inherited from easy |
| F-298 | RQ-304: In Patterns, the learner can search, add a note, remove a pattern or an example, and open the AI's explanation… | inherited from easy |
| F-299 | RQ-305: 'Answered items': every answered item with its text, the right answers, play and marks. | inherited from easy |
| F-300 | RQ-306: Two looks: Night forest (dark) and Pale birch (light), following the device's setting by default. | inherited from easy |
| F-301 | RQ-307: Text size can be changed (A−/A+, from 0.8 to 1.6 times). | inherited from easy |
| F-302 | RQ-308: Fewer animations when the device asks for reduced motion. | inherited from easy |
| F-303 | RQ-309: The app is called Grove, with the tagline 'grow from what you know'. | inherited from easy |
| F-304 | RQ-310: The logo is three small trees on a ground line. | inherited from easy |
| F-305 | RQ-311: The logo grows (an animation) when a pack opens and on the mode explainer cards. | inherited from easy |
| F-306 | RQ-312: A forest palette: greens with warm wood and amber accents. | inherited from easy |
| F-307 | RQ-313: Soft coloured glows behind the content, staying put while the page scrolls. | inherited from easy |
| F-308 | RQ-314: Content sits on rounded, frosted-glass cards (blurred, see-through panels with soft shadows). | inherited from easy |
| F-309 | RQ-315: A top bar that stays at the top: logo and name on the left, icon buttons on the right (streak, home, patterns,… | inherited from easy |
| F-310 | RQ-316: Buttons are rounded and dip slightly when pressed; main buttons have a green gradient and a soft glow. | inherited from easy |
| F-311 | RQ-317: Home's skill cards sit in a 2×2 grid, each with an icon, the skill's level and thin glowing progress bars for … | inherited from easy |
| F-312 | RQ-318: A row of small level cards (one per skill) shows each level's number and name; tapping one opens its slider. | inherited from easy |
| F-313 | RQ-319: Answer options are large rounded buttons: a right one turns green with a check mark and a small bounce; a wron… | inherited from easy |
| F-314 | RQ-320: Progress dots are leaf-shaped: green right, red wrong, amber partly right, grey reported. | inherited from easy |
| F-315 | RQ-321: Listening opens a full-screen dark player, with sound-wave rings spreading from a speaker icon while it plays. | inherited from easy |
| F-316 | RQ-322: Word menus are pop-up cards that slide up over a blurred background, with a coloured header strip. | inherited from easy |
| F-317 | RQ-323: One tap shows a speech bubble pointing at the word (meaning and buttons), which closes by itself after 4 secon… | inherited from easy |
| F-318 | RQ-324: Readings appear in small grey text above or below each word. | inherited from easy |
| F-319 | RQ-325: Word tiles look like small raised cards; placed tiles go into a dashed answer area, and tiles slide smoothly w… | inherited from easy |
| F-320 | RQ-326: Gaps in a passage are shaded boxes with an underline, turning green or red when checked. | inherited from easy |
| F-321 | RQ-327: Screens slide in from the right when opened. | inherited from easy |
| F-322 | RQ-328: A 'Next question' bar floats at the bottom of the screen. | inherited from easy |
| F-323 | RQ-329: The retire check has a wood-coloured card and banner; retiring stamps 'Retired' on the card and folds it away. | inherited from easy |
| F-324 | RQ-330: The result ring fills in green, or in the accent colour below 50%. | inherited from easy |
| F-325 | RQ-331: Text uses a sans-serif font that suits Japanese (Zen Kaku Gothic New, Hiragino or Noto Sans JP), falling back … | inherited from easy |
| F-326 | RQ-332: The AI's explanations appear in boxes with a coloured bar down the left side. | inherited from easy |
| F-327 | RQ-333: Skill cards have a soft glow in one corner. | inherited from easy |
| F-328 | RQ-334: Night forest (the dark look) uses the colour tokens in Appendix A.1. | inherited from easy |
| F-329 | RQ-335: Pale birch (the light look) uses the colour tokens in Appendix A.1. | inherited from easy |
| F-330 | RQ-336: The background glows, overlays, listening player, mastered marks and confetti use the fixed colours in Appendi… | inherited from easy |
| F-331 | RQ-337: Type follows Appendix A.2: Zen Kaku Gothic New (with fallbacks), the listed sizes, and text sizes that follow … | inherited from easy |
| F-332 | RQ-338: Corner radii follow Appendix A.3. | inherited from easy |
| F-333 | RQ-339: Cards are frosted glass with the blur, shadow and glow in Appendix A.3. | inherited from easy |
| F-334 | RQ-340: Main buttons have the green gradient and glow in Appendix A.3, and every button shrinks slightly while pressed… | inherited from easy |
| F-335 | RQ-341: The layout follows Appendix A.3: one column at most 560px wide, a sticky blurred top bar, and the listed grids… | inherited from easy |
| F-336 | RQ-342: Progress bars, progress dots and the result ring look as in Appendix A.3. | inherited from easy |
| F-337 | RQ-343: Word underlines and marks look as in Appendix A.3. | inherited from easy |
| F-338 | RQ-344: Explanation boxes look as in Appendix A.3. | inherited from easy |
| F-339 | RQ-345: Motion follows the timings in Appendix A.4. | inherited from easy |
| F-340 | RQ-346: The logo is drawn exactly as in Appendix A.5. | inherited from easy |
| F-341 | RQ-347: Chinese pinyin tones have their own colours (tokens --t1…--t5 in Appendix A.1). | inherited from easy |
| F-343 | RQ-355: A text counts as understood when rated 'most' or 'everything'. | inherited from F-p1-36: easy |
| F-344 | RQ-356: Grove counts how many times the learner has met each word. | inherited from F-p1-37: easy |
| F-345 | RQ-357: Each dictionary entry shows an example of where the learner met it. | inherited from F-p1-43: easy |
| F-346 | RQ-358: Grove uses the bank for example sentences in exercises. | inherited from F-p1-85: easy |
| F-347 | RQ-359: The AI suggests a pattern's level when it's first added. | inherited from F-p1-11: easy |
| F-348 | RQ-360: The owner can mark an invitation as a reviewer invitation. | A flag on the invitation (RQ-222). |
| F-351 | RQ-363: A reviewer account skips the starting level and lands on Home as the demo learner; 'Set my starting level agai… | Routing plus the existing "set my starting level again" action (RQ-252). |
| F-352 | RQ-364: The README of the shared (private) GitHub repo shows grove's current link, updated by the owner's computer | cloudflared prints the new address when the tunnel starts; a small script writes it to the README through GitHub's API with a fine-grained token limited to that one repo (free). The token is a secret on the owner's computer: see /pre.threats. |
| F-353 | RQ-365: A note under the speed slider | Static text. |
| F-355 | RQ-367: The browser talks only to grove; grove's server talks to Firebase | Firebase Auth's REST API (sign-up, sign-in with password, password-reset email) is called from the server; grove gives the browser its own sign-in cookie. |
| F-356 | RQ-368: One reviewer invitation code in the private README, at most 5 sign-ups | An invitation with a use counter (RQ-222, RQ-360). |
| F-357 | RQ-369: Without a Swedish voice, grove names the browsers and devices that have one | Static text, written from current browser and OS documentation when the spec is written. |
| F-358 | RQ-370: A page explains grove's terms | Static page and a link in the header. |
| F-359 | RQ-371: A security log of account events and owner actions | Rows in grove's database, written by the server. |
| F-360 | RQ-372: The same answer whether or not an email has an account | Fixed response texts on the server. |
| F-361 | RQ-373: The owner gives or removes the content maintainer role; the owner is always a content maintainer. | A role flag set only by the owner, checked on the server (RQ-155). |
| F-362 | RQ-374: Content maintainers check, in the review list, the sentences and entries the automatic check can't settle. | The existing review list (RQ-102), open to maintainers. |
| F-363 | RQ-375: A shared text reaches other learners only when every sentence has passed the automatic check or a content maintainer's check. | A state per sentence (auto-checked / maintainer-checked), checked before sharing. |
| F-364 | RQ-376: The terms of use say that a learner's own texts get only automatic checks, and may contain mistakes. | A line in the terms text (RQ-228). |
| F-365 | RQ-377: An easy read is accepted with at most 1 new word; with 2 or more, grove gives a fix-it prompt. | Tolerance on the easy-read rule; local count. |
| F-366 | RQ-378: A text with clearly fewer new words than the target is still accepted; grove's next prompt asks more firmly fo… | A local count and one extra line in the next prompt. |
| F-367 | RQ-379: Grove finds new words in an AI answer itself; new words the AI didn't list are not a reason to reject it, and … | Grove already compares every word with the known words; the meanings prompt is like RQ-207's (F-203: easy). |

## Full checks

### F-01, F-185, F-342 (RQ-01, RQ-186, RQ-348): exchanges with the learner's own free AI chat
- **Why checked:** depends on outside services (free AI chats) whose limits change; answers have never been tried with a real AI (p1 records, rounds 1–3).
- **Technical:** copy-paste works with any chat AI (F-p1-01). The risk is answer length: a 20-minute part with an English translation under every sentence (RQ-10), questions and pattern marks is a long JSON answer, and free chats may cut long answers short or switch to a smaller model.
- **Cost:** zero for grove; the learner uses their own free or paid AI.
- **Time:** fits; the prompts exist in p1.
- **Skills:** verifiable only by trying real answers from the main free chats.
- **Legal:** the learner's text goes to their own AI under that AI's terms (C-04 privacy notice).
- **Rating:** possible with limits.
- **Reasoning:** vendors now meter usage instead of publishing fixed caps. Reports for 2026: ChatGPT Free has unlimited everyday text chat on a smaller model after about 10 flagship messages per 5 hours; Claude Free about 15–40 messages per 5 hours; Gemini Free uses compute-based allowances. One summary exchange per session plus a few fix-it rounds fits all of these; long answers are the uncertain part.
- **Alternatives / reduced version:** X-03 (test real answers before the build; set the part size from the test). The size choice (RQ-348) is in the second build.
- **Sources:** [tech-insider.org: free-tier caps 2026](https://tech-insider.org/?p=18958); [theaicareerlab.com: usage limits compared 2026](https://theaicareerlab.com/blog/ai-usage-limits-compared-2026); [morphllm.com: ChatGPT vs Claude tiers](https://www.morphllm.com/chatgpt-vs-claude).

### F-03 (RQ-03): one overall level from the ground
- **Why checked:** merges PR-p1-64 and PR-p1-210 (corrected source); depends on the Kelly list.
- **Technical / Legal:** as F-p1-05 and X-p1-04: a level's words are the Kelly-list words tagged up to that level (CC BY-SA 3.0, credits page, C-05).
- **Rating:** possible with limits (X-p1-04, confirmed on page 25).
- **Sources:** see F-p1-05.

### F-13 (RQ-13): speech-speed slider from 0.5× to 1.5×
- **Why checked:** depends on browser voices, which differ by device.
- **Technical:** SpeechSynthesisUtterance.rate allows 0.1–10, but engines and voices may narrow it. Developers report 0.1–2 as the safe range, and that Chrome won't speak network voices above 2; Safari keeps an old rate if it is lowered below 0.5 after speaking at 0.5 or above. 0.5–1.5 sits inside the safe range.
- **Cost / Time / Legal:** none.
- **Skills:** testable on the owner's own phone and computer; other devices unknown.
- **Rating:** possible with limits.
- **Alternatives / reduced version:** X-02.
- **Sources:** [MDN: SpeechSynthesisUtterance.rate](https://developer.mozilla.org/docs/Web/API/SpeechSynthesisUtterance/rate); [codersblock.com: text-to-speech quirks](https://codersblock.com/blog/javascript-text-to-speech-and-its-many-quirks/).

### F-21 (RQ-21): the sentence being read aloud is highlighted
- **Why checked:** merges PR-p1-206 and PR-p0-103 (corrected source).
- **Technical:** the 'boundary' event (word timing) doesn't fire in Chrome or Firefox on Android, so word-by-word highlighting isn't possible there. Sentence highlighting works everywhere by speaking one utterance per sentence and highlighting on its 'start' event.
- **Rating:** easy (sentence level, as the requirement says).
- **Sources:** [codersblock.com: text-to-speech quirks](https://codersblock.com/blog/javascript-text-to-speech-and-its-many-quirks/).

### F-125 (RQ-125): hosting on the owner's computer behind a free quick tunnel
- **Why checked:** hosting and an outside service; restored after the budget went back to zero (question-pages/47).
- **Technical:** Cloudflare quick tunnels (trycloudflare.com) need no account or domain. Limits: at most 200 requests in flight (more get HTTP 429), no Server-Sent Events, a random address that ends when the tunnel stops. With 1–3 reviewers, 200 in-flight requests is ample; grove must not use streaming responses.
- **Cost:** zero.
- **Time:** fits; one command.
- **Skills:** easy to check from a phone on mobile data.
- **Legal:** Cloudflare says quick tunnels are for testing and development only, with no uptime promise, under its Online Services Terms. A course review by invited reviewers is a test use; opening grove to the public would need a named tunnel (free, but it needs a domain on Cloudflare, which costs money: C-01).
- **Rating:** possible with limits.
- **Alternatives / reduced version:** X-01.
- **Sources:** [Cloudflare docs: Quick Tunnels](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/do-more-with-tunnels/trycloudflare/); [flaviocopes.com: Quick Tunnels guide](https://flaviocopes.com/cloudflare-quick-tunnels.md).

### F-349, F-350 (RQ-361, RQ-362): demo texts and demo learner for reviewers
- **Why checked:** new (question-pages/47); content made with an outside AI.
- **Technical:** the demo texts are AI answers in grove's own format, made once and loaded like any pasted answer; the demo learner is a fixed data file copied into a reviewer account.
- **Cost:** zero (the owner's Claude Pro).
- **Time:** about 1–2 hours of the owner's time before Sunday, plus checking the Swedish.
- **Legal:** under Anthropic's consumer terms the user owns Claude's outputs and may use them commercially, subject to the Acceptable Use Policy. Purely AI-written text has no copyright protection, which doesn't matter here.
- **Rating:** easy.
- **Sources:** [terms.law: Claude output ownership](https://terms.law/ai-output-rights/anthropic/); [terms.law: AI platform terms FAQ 2026](https://terms.law/FAQ/ai-tools/ai-platform-terms-comparison-faq.html).

### F-354 (RQ-366, with RQ-219 and RQ-367): accounts through Firebase Authentication
- **Why checked:** an outside service holding personal data (question-pages/49).
- **Technical:** Firebase Authentication supports plain email-and-password accounts (no Google account needed for users) and sends password-reset emails. Its REST API can be called from grove's server, so the browser never contacts Google (RQ-367, C-12). Invitation-only sign-up stays in grove: grove's server only creates a Firebase account after checking the invitation code. Lockout, the password rule and the 30-day sign-in stay grove's own (RQ-156, RQ-221, RQ-224).
- **Cost:** free for email-and-password at this size (reported free up to about 50,000 monthly users); the owner needs a Google account for the Firebase project.
- **Time:** a few hours, within the first build.
- **Skills:** testable with the Firebase emulator and one real project.
- **Legal:** Google processes the email address and the hashed password, mostly outside the EU, under Firebase's data processing terms; the privacy notice names it (C-04). Firebase's password-reset page is on a Google address, so it is the one place where the browser contacts Google (C-12 exception).
- **Rating:** possible with limits.
- **Reasoning:** free and standard, but it adds a processor and an exception to C-12.
- **Alternatives / reduced version:** none needed; alternatives considered on question-pages/49 (Cloudflare's email PIN in front, Supabase in the EU, Clerk).
- **Sources:** [merginit.com: free auth providers 2026](https://merginit.com/blog/13062026-free-auth-identity-providers-comparison); [ssojet.com: Firebase Authentication compared](https://ssojet.com/ciam-vendors/comparison/firebase-auth-vs-auth0); [Cloudflare docs: Quick Tunnels (email PIN option)](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/do-more-with-tunnels/trycloudflare/).

## Reductions log

App-wide reductions; the prototype reductions X-p0-01 and X-p1-01…07 still apply where their requirements were carried (see docs/discovery/*/feasibility.md).

| ID | Original requirement | Reduced version | Reason | Revisit later? (when) | Confirmed |
|---|---|---|---|---|---|
| X-01 | RQ-125: grove is reached through a public relay | The first version is a test deployment for invited reviewers through a quick tunnel; no streaming responses; when the tunnel restarts, the current link appears in the shared GitHub repo's README by itself (RQ-364) | Quick tunnels are for testing only, max 200 in-flight requests, no SSE (F-125) | Yes: before opening grove to anyone beyond reviewers (needs a domain, so a budget) | yes, with the README link (question-pages/48) |
| X-02 | RQ-13: speech speed from 0.5× to 1.5× | The slider sets the speed where the device's voice allows it; grove doesn't promise the exact speed on every device; a note under the slider says so (RQ-365) | Voices may narrow or ignore the rate (F-13) | No | yes, with a note (question-pages/48) |
| X-03 | RQ-01, RQ-186: an exchange returns a part of about 20 minutes | Before the build, the prompts are tried with the free ChatGPT, Claude and Gemini; the part size is set from that test (about 20 minutes if answers come back whole, shorter if they get cut) | Free chats' answer length is unknown; no real answers tried yet (F-01) | Yes: with RQ-348 (exchange sizes) in the second build | yes (question-pages/48). Tested 2026-10-23 (question-pages/52): free ChatGPT and Claude wrote a full 20-minute part, free Gemini about half; part size set to **10 minutes**. |
