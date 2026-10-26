# 70: Prompt style per AI (probe test, 2026-10-26)

Asked on 2026-10-26 in Claude Code, after the probe test's results for ChatGPT, Copilot, Gemini and Le Chat ([probe page](https://claude.ai/artifact/4C2BN2nSxTghozQ9ZAsEZ7); addendum 002). Share of texts passing grove's checks:

| AI (free) | One long prompt (round A) | Setup in pieces (round B, parts 1 and 2) |
|---|---|---|
| ChatGPT | 2 of 3 | 6 of 6 |
| Copilot | 3 of 3 | 4 of 6 |
| Gemini | 1 of 3 | 2 of 6 |
| Le Chat | 3 of 3 | 0 of 6 (it ignored the word list sent in earlier messages) |

## 1. What should grove do, given that the setup in pieces suits some AIs and not others? (default: pieces first, one long prompt when an AI keeps failing)

Why asked: RQ-390 made the setup in pieces the only way; the probe shows it depends on the AI.

- **A:** pieces first; after two answers in a row with a failed text, grove offers "Try one long prompt" (every request carries the rules and known words itself), remembered, and the learner can switch back
- **B:** one long prompt by default; pieces offered when an answer breaks
- **C:** a setting, no switching

**Answer:** A, with the owner's note: "recommend plan based on which AI is used and whether it is the paid version or not." This partly reverses question-pages/64, question 13, where a built-in table of AIs was not chosen.

## 2. Follow-up: how should grove recommend a plan from the learner's AI and free or paid? (default: ask once, set a starting plan, changeable)

Why asked: the note on question 1.

- **A:** asked on the first Get texts and in Settings: which AI, free or paid; a small table in grove sets a starting plan and says why; the learner can change it; the switch after two failed answers still applies
- **B:** only a tip
- **C:** as A, and the table sets sizes too

**Answer:** A, with the owner's note: "there should be two menus: model family and product (eg ChatGPT, pro) and then based on that offer an approach on tactic, but let the user choose other ones too, there should be a div with tabs for this."

So: two menus, the AI (ChatGPT, Gemini, Claude, Copilot, Le Chat, another) and its product or plan (listed per AI, e.g. ChatGPT Free, Go, Plus, Pro); grove then shows the tactics as tabs, with the recommended one open and marked, and the learner may pick another tab.

Defaults used: three tactics: **Step by step** (setup in pieces, one part at a time), **One long prompt** (every request carries the rules and known words itself, one part at a time) and **Whole package** (setup in pieces, then all 3 parts at once). The table: free ChatGPT and Copilot → Step by step; free Gemini and Le Chat → One long prompt; free Claude and "another" → Step by step (untested); every paid product → Whole package (a first guess until tried). The automatic offer after two failed answers suggests One long prompt from Step by step, and Step by step from the other two.
