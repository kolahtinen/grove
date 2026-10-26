# Addendum 002: prompts sized for free AIs, and a meaning for every word

**Date:** 2026-10-26

A quick check made after the middle-steps document was frozen, for the owner's-test group "prompts and meanings" (O-07, O-09, O-10, O-11, O-13, O-20; [notes](../reviews/2026-10-25-owner-test.md); decisions on question-pages/64 and 66). No new needs: every requirement here meets needs that already exist. It is risky because it rests on two things grove doesn't control: what free AI chats accept, and an outside word list (Wiktionary) with a share-alike licence.

## Requirements

Same columns as [requirements.md](../requirements.md).

| ID | Requirement | Sources | Rewords or merges? | Needs | Feasibility | Priority | Status |
|---|---|---|---|---|---|---|---|
| RQ-390 | Each package starts in a new chat with a setup the AI keeps for the whole package: the rules, the answer format and the learner's known words, spread over as many prompts as the AI can take; later prompts ask only for the next texts and what changed. | question-pages/66 (1, 11), O-09 | yes (replaces question-pages/57's self-contained next-part prompts; RQ-01's summary goes in the setup) | N-15, N-42 | possible with limits (sizes from the probe test, RQ-392) | must | active |
| RQ-391 | An "I'm in a new chat" button resends the setup before the waiting request; grove suggests it when an answer looks like the AI has forgotten the setup. | question-pages/66 (11) | no | N-15 | easy | should | active |
| RQ-392 | How much goes in one prompt (words per setup prompt, texts per part, words per text) is a setting, set from the published free-tier limits and the owner's probe test, and tunable without a spec change. | question-pages/66 (2), O-09 | no | N-15 | easy (values pending the probe test) | must | active |
| RQ-393 | A part has reading texts and listening texts; listening texts are written to be heard (short sentences, spoken style) and open audio-first. | question-pages/64 (14), O-20 | no | N-37, N-42 | easy | must | active |
| RQ-394 | A learner can choose a whole-package prompt for an AI that can take one; grove remembers the choice. | question-pages/64 (13), O-13 | no | N-15, N-42 | easy | should | active |
| RQ-395 | When an answer fails grove's checks, the texts that pass are kept and each failed text is asked for again in its own prompt with its problems; after two failed answers in a row, the rest of the package comes one text per prompt, and a new package starts at the normal size. The same holds for a whole-package answer. | question-pages/66 (8, 9), O-09 | yes (changes FR-206's whole-answer fix-it for AI texts) | N-15, N-11 | easy | must | active |
| RQ-396 | Every word grove shows has a meaning: grove ships a Swedish–English word list made from Wiktionary (CC BY-SA, credited) and gives each word its dictionary meaning at once. | question-pages/66 (4, 5), O-10 | no | N-12, N-43 | easy (measured below) | must | active |
| RQ-397 | An AI answer is accepted only when every new word in it has a meaning, the AI's or the dictionary's; otherwise the fix-it prompt asks for just the missing ones. | question-pages/66 (5), O-10 | yes (RQ-379's unlisted new words still don't refuse an answer, but a missing meaning does) | N-43, N-15 | easy | must | active |
| RQ-398 | The next prompt asks the AI to confirm or correct dictionary meanings in the sentences where they were used. | question-pages/66 (5) | no | N-43 | easy | should | active |
| RQ-399 | grove's own content (demo, starting texts, ready lessons) has a meaning checked against its text and a simple Swedish explanation for every word, prepared when it is built. | question-pages/64 (5, 6), 66 (4, 5) | no | N-18, N-43 | easy | must | active |
| RQ-400 | Adding an own text gives an AI prompt that must be answered before the text can be read: each word's meaning in context, and whether the text looks copyrighted; a long text goes to the AI in pieces sized like other prompts. | question-pages/66 (6, 7, 10) | no | N-43, N-16 | easy | must | active |
| RQ-401 | An own text's AI answer is checked only for completeness (every word has a meaning), never for difficulty; the text shows its share of known words. | question-pages/66 (10) | no | N-13, N-16 | easy | should | active |
| RQ-402 | After copying a prompt, the button says "Copied to clipboard"; the prompt text itself is shown only when copying fails. | question-pages/64 (O-07, O-11), 66 | no | N-15 | easy | should | active |
| RQ-403 | The learner picks their AI and its product or plan from two menus; grove recommends a tactic for it from a table in grove, shown as tabs with the recommended one marked, and the learner may choose another. | question-pages/70 | yes (reverses question-pages/64, 13: a table of AIs) | N-15, N-42 | easy (the table's paid rows untested) | should | active |
| RQ-404 | There are three tactics: step by step (the setup in pieces, one part per request), one long prompt (every request carries the rules and known words itself) and whole package (the setup in pieces, then all parts at once). | question-pages/70 | yes (RQ-390 and RQ-394 become two of the tactics) | N-15, N-42 | easy | must | active |
| RQ-406 | Texts from the learner's own AI and own texts carry a "Beta" badge (on Home's two cards, in the texts list and on the reading page), since these flows won't be fully tested by 1 November; the demo's prepared texts don't. | the owner, 2026-10-26 (direct request) | no | N-43, N-18 | easy | should | active |
| RQ-405 | After two answers in a row with a failed text, grove offers the other main tactic (one long prompt from step by step, step by step from the others). | question-pages/70 | no | N-15, N-11 | easy | should | active |

**Changed:** RQ-379's "one short prompt for the meanings of those not in its dictionary" is withdrawn (question-pages/66, 3): the meanings prompt and own texts' Get meanings go, replaced by RQ-396–398 and RQ-400. The rest of RQ-379 stands.

## Why it's risky
Outside services and legal: the prompt sizes depend on free AI chats whose limits are unpublished or change without notice, and the word list comes from Wiktionary under CC BY-SA.

## Risks
| ID | Failure scenario | Cost | Likelihood | Technique |
|---|---|---|---|---|
| R-18 | A free AI refuses or cuts off a setup prompt or a part, because its limits are smaller than grove's sizes or change after the probe test, so a learner can't get texts. | high (learner) | high | Probe test before sizing (RQ-392); sizes as settings; passing texts kept and failed ones re-asked smaller (RQ-395). |
| R-19 | The AI forgets the setup partway through a package (free context is about 27K tokens on ChatGPT and 32K on Gemini; a 1,500-word setup is about 5–6K and each answer about 3K), so answers break the known-words rule. | medium (learner) | medium | New chat per package; "I'm in a new chat" button, suggested when an answer looks forgotten (RQ-391); round B6 of the probe test checks memory. |
| R-20 | The dictionary's first sense is wrong in context (homographs like *var* = where / was), so a learner learns a wrong meaning. | medium (learner) | medium | AI confirms or corrects in context (RQ-398); grove's own content checked at build (RQ-399); glosses trimmed to the first sense without notes. |
| R-21 | The word list's licence isn't honoured (no credit, or the share-alike terms ignored). | medium (owner) | low | Kept as a separate data file with its licence notice, like the Kelly list; named on the credits page (RQ-385). |
| R-22 | The AI calls a copyrighted own text free to use. | medium (owner) | medium | Shown only as "your AI thinks…"; sharing to the library still needs the owner's approval (question-pages/64, 8). |
| R-23 | This group, the probe test and the rest of the owner's-test changes don't fit before 1 November. | high (owner) | medium | The probe test runs alongside the spec work; the rest goes in order of value (question-pages/64, 16). |

## Feasibility
- **Technical:** published free-tier limits (2026, third-party summaries, unconfirmed by the vendors): ChatGPT Free about 27K tokens of context (earlier 16K), no fixed cap on text messages since August 2026; Gemini Free 32K tokens, a compute allowance per 5 hours; Claude Free about 15–40 messages per 5 hours, context unclear; Copilot and Le Chat not found. Today's prompt is about 14,000 characters (about 4–5K tokens), which fits these windows, so the owner's breakdown (O-09) may come from output length or model quality instead: the probe test tells. Wiktionary (kaikki.org's Swedish extract, 360 MB, from the English Wiktionary dump of 2026-10-01) has 57,962 Swedish headwords with a gloss and 248,673 inflected forms; it covers all 408 demo ground words and 97.1% of the Kelly list's 8,019 single words (232 missing, mostly rare and compound words, which the AI fills in).
- **Cost:** none (free data; the learner's own free AI).
- **Time:** about 1½ days for the spec changes and regenerations, plus the owner's 30-minute probe test.
- **Skills:** as for the Kelly list (build script, cleaned data file).
- **Legal:** Wiktionary's text is CC BY-SA 4.0 (and GFDL); the derived list stays a separate file under CC BY-SA with credit, as the Kelly list does (CC BY-SA 3.0). kaikki.org asks for a link back.
- **Rating:** possible with limits (the sizes); easy for the rest.
- **Reduced version of the requirement:** none; RQ-392 already makes the sizes settings.
- Sources: [ChatGPT limits (ai-toolbox)](https://www.ai-toolbox.co/chatgpt-models/chatgpt-context-window-token-limits-2026), [ChatGPT limits (izzedo)](https://www.izzedo.chat/blog/chatgpt-limits), [Gemini limits (datastudios)](https://www.datastudios.org/post/how-to-access-google-gemini-for-free-and-what-the-current-plans-offer), [Gemini context by plan (aionx)](https://aionx.co/gemini-advanced-reviews/gemini-2m-context-window/), [Claude free plan (fast.io)](https://fast.io/resources/claude-daily-limit/), [Free tiers compared (tech-insider)](https://tech-insider.org/chatgpt-vs-claude-vs-gemini-free-tier-2026/), [kaikki.org Swedish](https://kaikki.org/dictionary/Swedish/index.html), [wiktextract](https://github.com/tatuylonen/wiktextract).

## Probe test
[grove AI probe](https://claude.ai/artifact/4C2BN2nSxTghozQ9ZAsEZ7) (private to the owner): per AI, round A (today's prompt, 1,500 known words, 3 texts), round B (setup, the words in 3 messages of about 500, then 2 reading + 1 listening of about 90 words, a second part for memory, one small text), optional round D (3,000 words in 6 messages). The answers are saved on the page and run through grove's own checks; the results set RQ-392's values.

### Results so far (2026-10-26, checked with grove's own code)

| AI (free) | Round A: today's prompt (1,500 known words, 3 texts ~130 words) | Round B: setup in 3 messages of 500 words, then 2 reading + 1 listening of ~90 words |
|---|---|---|
| ChatGPT | answered; 2 of 3 texts pass; ~160 words each | setup replied OK; parts 1 and 2: 3 of 3 pass each; one text: passes. Its answers arrived markdown-escaped (question-pages/69) and are read since then |
| Copilot | answered; 3 of 3 pass; ~80 words | setup OK; 2 of 3 pass in each part; one text: passes |
| Gemini | answered; 1 of 3 passes (too many new words) | setup OK; 1 of 3 pass in each part, ~60 words; two words without a meaning |
| Le Chat | answered; 3 of 3 pass | setup OK; 0 of 3 pass in each part; one text: fails |

Le Chat (later the same day): one long prompt 3 of 3 pass; setup in pieces 0 of 3 in each part and 0 of 1 for one text: it ignored the word list sent in earlier messages (in part 2, 25 words outside it, 10 listed as new). So the best tactic depends on the AI (question-pages/70; RQ-403–405).

No AI broke on the long prompt or on the setup in pieces, and part 2 showed no forgetting for ChatGPT, Copilot and Gemini. The defaults (2 reading + 1 listening, 90 words, 500 words per setup message) hold; the per-text redo (RQ-395) covers Gemini's weaker texts. Still to try: Claude, Le Chat's requests, round D (3,000 known words).

## STRIDE (new components or connections)
| ID | Component | STRIDE | Threat | Mitigation | Goes to |
|---|---|---|---|---|---|
| T-21 | Word-list build (Wiktionary download) | Tampering | A changed or poisoned download puts wrong or harmful glosses into grove. | The build pins the download's SHA-256 and size limits, as the Kelly build does; the cleaned file is committed and reviewed as a diff. | requirement (build script) |
| T-22 | Dictionary glosses shown to learners | Tampering / Elevation | A gloss carries markup or a script. | Glosses are stored and shown as plain text only (constitution 4.6, RQ-380). | constitution 4.6 (already) |

No new run-time connections: the word list is built into grove, and own texts go only to the learner's own AI, by copy and paste, as every prompt does.

## Decision
question-pages/66 (11 questions). The sizes in RQ-392 wait for the probe test; everything else is decided and goes into the G-02 and G-03 specs.
