# Feasibility: grove (p0)

Draft from the short pass after the import (2026-10-20). Checked on requirements; easy ones in one line.

## Easy

The other kept requirements (screens, exercises, lists, marks, settings and the look) are standard browser logic that already works in the imported page: easy. Listed by ID: PR-p0-06, PR-p0-07, PR-p0-09, PR-p0-10, PR-p0-12, PR-p0-13, PR-p0-20, PR-p0-22, PR-p0-23, PR-p0-24, PR-p0-25, PR-p0-26, PR-p0-29, PR-p0-30, PR-p0-31, PR-p0-32, PR-p0-33, PR-p0-34, PR-p0-36, PR-p0-37, PR-p0-38, PR-p0-39, PR-p0-40, PR-p0-41, PR-p0-42, PR-p0-43, PR-p0-44, PR-p0-46, PR-p0-47, PR-p0-48, PR-p0-49, PR-p0-50, PR-p0-51, PR-p0-52, PR-p0-55, PR-p0-56, PR-p0-57, PR-p0-58, PR-p0-59, PR-p0-60, PR-p0-61, PR-p0-62, PR-p0-63, PR-p0-64, PR-p0-65, PR-p0-66, PR-p0-67, PR-p0-68, PR-p0-69, PR-p0-70, PR-p0-71, PR-p0-72, PR-p0-74, PR-p0-75, PR-p0-76, PR-p0-77, PR-p0-78, PR-p0-79, PR-p0-80, PR-p0-81, PR-p0-82, PR-p0-83, PR-p0-84, PR-p0-85, PR-p0-86, PR-p0-87, PR-p0-88, PR-p0-89, PR-p0-90, PR-p0-91, PR-p0-92, PR-p0-93, PR-p0-94, PR-p0-95, PR-p0-96, PR-p0-97, PR-p0-98, PR-p0-99, PR-p0-100, PR-p0-101, PR-p0-102, PR-p0-103, PR-p0-104, PR-p0-105, PR-p0-106, PR-p0-107, PR-p0-108, PR-p0-109, PR-p0-110, PR-p0-111, PR-p0-112.

## Full checks

### F-p0-01 (PR-p0-01, 02, 04, 05, 08)
- **Why checked:** the whole design depends on the learner's own AI reading and writing the pack file.
- **Technical:** the pack is gzip-compressed, scrambled with a fixed key and base64-encoded (PR-p0-08). A chat AI can only read or write that by running code; plain chat replies can't decompress gzip reliably. p0 worked with Claude, which can run code. You reworded PR-p0-04 to 'whatever gen AI': AIs without code running couldn't use packs at all. Packs also grow with every session (lists now have no cap, PR-p0-74, 75), and chat AIs limit upload and reply sizes.
- **Cost:** free for grove; a learner's AI must run code and accept file uploads, which free tiers may limit.
- **Time:** fits.
- **Skills:** yes, by trying packs with Claude, ChatGPT and Gemini.
- **Legal:** none.
- **Rating:** possible with limits; reduction X-p0-01.
- **Reasoning:** works with code-running AIs; 'any AI' and 'scrambled' pull against each other.
- **Alternatives / reduced version:** X-p0-01: the pack is plain, compact text (JSON) that any AI can read and write; or grove gives a prompt with only what changed, as in p1. Settle in /pre.combine with p1's copy-paste flow.
- **Measured (pack 15, 2026-10-20):** 181 KB as a file; 583 KB of text once unpacked (206 items, 480 Heard words, 484 Reading list words, 36 patterns), roughly 150,000 tokens or more. No chat AI can rewrite that whole in one reply, so plain JSON alone (X-p0-01) doesn't solve it: the AI has to get and return only what changed.
- **Sources:** design reasoning from the imported code; the measured pack; to verify by trying packs with several AIs (topic 'Real AI answers').

### F-p0-02 (PR-p0-14, 15)
- **Why checked:** regional voices depend on the device.
- **Technical / Cost / Legal:** as F-p1-03: browser voices vary by device; a variety without an installed voice falls back to the standard one (p0 already says so, PR-p0-15).
- **Rating:** possible with limits (same reduction as X-p1-02).
- **Sources:** see F-p1-03.

### F-p0-03 (PR-p0-16…19)
- **Why checked:** readings (hiragana, pinyin) must come from the AI with each word.
- **Technical:** the page shows whatever readings the pack holds; accuracy depends on the AI. Not needed for Swedish (the first build is Swedish only, C-09).
- **Rating:** possible with limits.
- **Sources:** design reasoning.

## Reductions log

| ID | Original requirement | Reduced version | Reason | Revisit later? (when) | Confirmed |
|---|---|---|---|---|---|
| X-p0-01 | PR-p0-08: the pack file is compressed and scrambled | The AI gets and returns only what changed (a short, plain summary of the session and the new items), not the whole pack | Only AIs that run code can read the scrambled pack, and a whole pack is about 150,000 tokens (F-p0-01) | Yes, if all target AIs run code and take large files | yes (question-pages/42) |
