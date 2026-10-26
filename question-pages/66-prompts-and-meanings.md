# 66: Prompts and meanings (O-07, O-09, O-10, O-11, O-13, O-20)

Asked on 2026-10-26 in Claude Code, for the owner's-test group "prompts and meanings" (question-pages/64, questions 5, 6, 13, 14). Settled without asking: "Copied to clipboard" after copying (O-07); the prompt text hidden behind the Copy button (O-11), shown only if copying fails (default).

## 1. With the short prompt, what's in one part? (default: 2 reading + 1 listening text, ~90 words each)

Why asked: question-pages/64/13 asked for smaller parts and 64/14 for separate reading and listening texts.

- **A:** 2 reading + 1 listening, ~90 words each (about 270 words per answer)
- **B:** 1 reading + 1 listening, ~100 words each
- **C:** 2 reading + 1 listening, ~130 words each (today's length)

**Answer:** none chosen; the owner's note: "prompts can carry different payloads and no longer need to be self-contained. for example, the ground may need to be delivered in many prompts. the risk here though is that we dont know what free versions of different AI's will allow, so we will need to investigate the right size and number of prompts."

This reverses question-pages/57 ("next-part prompts are self-contained"): a chat can be given the word list over several prompts and then be asked for texts, as long as the learner stays in the same chat.

## 2. Follow-up: how do we find out what free AIs allow? (default: research, then a probe test)

Why asked: the owner's note on question 1: the right size and number of prompts isn't known.

- **A:** research the published free-tier limits (ChatGPT, Gemini, Claude, Copilot, Le Chat), then a probe kit the owner runs (word list in 1, 2 and 4 chunks; parts of 1, 2, 3 texts; about 30 minutes); sizes become settings set from the results; recorded as an addendum
- **B:** research only
- **C:** guessed sizes as settings, tuned at the real-AI check (T141)

**Answer:** A (the default).

## 3. What happens to the separate meanings prompt? (default: it goes everywhere)

Why asked: question-pages/64/6 said missing AI meanings are asked for automatically in the next prompt.

- **A:** it goes everywhere: every prompt also asks for the meanings of leaves that have none (own texts' words too), up to a limit per prompt; until then the word shows "meaning coming with your next texts"
- **B:** keep it for own texts (Get meanings)
- **C:** both ways

**Answer:** A (the default). The meanings prompt and the own texts' Get meanings button go; the forms a prompt asks meanings for are still stored with its exchange (finding 6's `asked_forms`, now on part prompts).

## 4. Who writes meanings for the demo's 408 ground words? (default: Claude writes them, the owner spot-checks)

Why asked: the demo's ground words have no meanings, so tapping one says "meaning missing".

- **A:** Claude writes them; the owner checks a sample of 30
- **B:** the owner's AI writes them from a prompt
- **C:** an open dictionary (Wiktionary, CC BY-SA)

**Answer:** C, with the owner's note: "dictionary first, then AI confirms and fills in."

## 5. Follow-up: "dictionary first, then AI confirms": for the demo only, or for every word? (default: every word)

Why asked: the note on question 4 could mean the demo or a general way of getting meanings.

- **A:** every word: grove ships a Swedish–English list from Wiktionary (CC BY-SA, credited); grove's own content is checked against its texts and given Swedish explanations when built; a learner's new words get the dictionary meaning at once, and the next prompt asks their AI to confirm or correct it in context
- **B:** demo and grove's own content only
- **C:** demo only

**Answer:** none chosen; the owner's note: "'meaning missing' should not happen." Read as A, made strict: every word grove shows has a meaning at all times. So an AI answer is accepted only when each new word has a meaning (the AI's, or the dictionary's), and otherwise the fix-it prompt asks for the missing ones in the same chat.

## 6. Follow-up: a word saved from an own text isn't in the dictionary. How does it get a meaning at once? (default: the learner types one, the next prompt checks it)

Why asked: own texts have no AI answer behind them, and question 3 removed the meanings prompt, so question 5's rule had a gap.

- **A:** Save as leaf asks the learner for a meaning ("your best guess is fine"), saved as "your meaning"; the next prompt has the AI confirm or correct it in the sentence
- **B:** a one-word prompt to copy first; the leaf waits for the answer
- **C:** such words can't be saved

**Answer:** A, with the owner's note: "own text also gets a full AI copy paste round to check meanings and maybe copyright of text." So adding an own text gives a prompt of its own: the AI gives or confirms the meaning of every word in that text in context, and says whether the text looks copyrighted.

## 7. Follow-up: must the own-text AI round be done before reading? (default: offered, not required)

Why asked: the note on question 6 added a round for own texts.

- **A:** offered, not required; the text is readable at once with dictionary and own meanings; the AI's copyright view is shown on the text
- **B:** required before reading: the text opens only after the AI's answer is pasted back and checked
- **C:** required before sharing to the library only

**Answer:** B. Since every word of an own text then has an AI meaning before it is read (the answer is accepted only when each word has one), question 6's typed meaning is no longer needed for own texts: Save as leaf always has a meaning to use.

## 8. When an answer fails grove's checks, how does grove "ask for less"? (default: keep the texts that pass, re-ask the others one per prompt)

Why asked: question-pages/64/13: "divide the pack more, esp if ai fails checks".

- **A:** keep the texts that pass; ask for each failed text again in its own prompt; after two failed answers in a row, one text per prompt for the rest of the package
- **B:** today's fix-it for the whole answer, then smaller parts
- **C:** one fix-it try; smaller only if it fails again

**Answer:** none chosen; the owner's note: "there should be different rules for own texts." Asked again separately for AI texts and own texts (questions 9 and 10).

## 9. For texts the AI writes, which rule after a failed check? (default: keep passing texts, re-ask the others one by one)

Why asked: question 8's note asked for separate rules for own texts.

- **A:** texts that pass are kept at once; each failed text is asked for again in its own prompt with its problems; after two failed answers in a row, the rest of the package comes one text per prompt; a new package starts at the normal size
- **B:** today's fix-it for the whole answer, then smaller parts
- **C:** one fix-it try; smaller only on a second fail

**Answer:** A (the default). The same rule covers a whole-package answer (O-13): its passing texts are kept and the others re-asked (default).

## 10. For own texts, what does grove check in the AI's meanings answer? (default: only that every word got a meaning)

Why asked: question 8's note.

- **A:** completeness only: never refused for being hard; only missing or unreadable meanings are re-asked, in a small fix-it prompt with only the missing words
- **B:** as A, and the text shows its share of known words (e.g. "78% known: harder than your usual texts")
- **C:** as A, and long own texts go to the AI in pieces

**Answer:** B. Default used: a long own text is also sent in pieces sized like the other prompts (from the probe test), since free AIs may not take 20,000 characters at once.

## 11. Follow-up: prompts rely on the chat remembering earlier ones. What if the learner starts a new chat? (default: an "I'm in a new chat" button)

Why asked: a gap opened by question 1 (prompts no longer self-contained).

- **A:** an "I'm in a new chat" button next to Copy prompt resends the setup (rules, format, word list) before the request; grove suggests it when an answer looks like the AI forgot
- **B:** every package starts in a new chat with the full setup; no button
- **C:** both

**Answer:** C: each package starts in a new chat with the full setup, and the button is there for when the AI forgets mid-package.

## Decided so far

- Prompts are no longer self-contained (reverses question-pages/57): each package starts in a new chat with a setup (rules, format, known words, possibly over several prompts); later prompts only ask for the next part and what changed; an "I'm in a new chat" button resends the setup, and grove suggests it when an answer looks forgotten.
- Sizes (words per setup prompt, texts per part) are settings, set from published free-tier limits and the owner's probe test; recorded in an addendum.
- Parts have reading texts and listening texts (question-pages/64/14); how many of each waits for the probe test.
- "Meaning missing" never shows: grove ships a Swedish–English list from Wiktionary (CC BY-SA, credited); every word gets its dictionary meaning at once; an AI answer is accepted only when every new word has a meaning; the next prompt asks the AI to confirm or correct dictionary meanings in context. grove's own content (demo, starting texts, lessons) is checked against its texts and given Swedish explanations when built.
- The meanings prompt and Get meanings go. An own text has a required AI round before it can be read (each word's meaning in context, a copyright view), checked only for completeness, never for difficulty, and shows its share of known words; long own texts go in pieces.
- After a failed check, AI texts that pass are kept and each failed text is re-asked alone; after two failed answers in a row, one text per prompt until the package ends. The same for whole-package answers (O-13).
- "Copied to clipboard" (O-07); the prompt text is hidden unless copying fails (O-11).
