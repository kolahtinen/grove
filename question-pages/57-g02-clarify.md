# 57: G-02 clarify (phase 3)

Asked on 2026-10-24 during `/speckit-clarify` for G-02 (`specs/002-texts-from-own-ai/spec.md`), in Claude Code from the phone (explanations in the chat message).

## 1. When does a new session start (so the prompt carries the summary)? (default: A)

- **A:** the first exchange of each calendar day (device date)
- **B:** the first exchange after a 4-hour gap
- **C:** every exchange carries what changed since the last one; no sessions

**Answer (Other):** "one package at a time until finished, or new one requested". Asked how big a package is:

- **A:** one part (two texts, ~10 min); every new part carries the summary; one open at a time
- **B:** several parts; the summary with the first; the others without; a new package when done or asked

**Answer:** B.

## 2. How many parts in a package? (default: A)

- **A:** 3 parts (~30 minutes)
- **B:** 2 parts (~20 minutes)
- **C:** 5 parts (~50 minutes)

**Answer:** A. Brings RQ-188 ('next part' prompts until the package is complete) from the second build into the first.

## 3. What does a 'next part' prompt look like? (default: A)

- **A:** self-contained: known words, rules and format every time, plus "continue part 1's story if this chat has it"; works in any chat
- **B:** short continuation ("part 2 of 3, same as before"); only works in the same chat

**Answer:** A.

## 4. What's in one part (~10 minutes)? (default: A)

- **A:** 2 texts of ~200 words, 2–3 questions each
- **B:** 1 text of ~400 words, 4–5 questions
- **C:** 3 texts of ~130 words

**Answer:** C. Each text keeps 2–3 questions.
