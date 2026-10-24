# 45: Combining p0 and p1, follow-up

Asked in Claude Code on 2026-10-21, finishing `/pre.combine` (the first run's answers are on page 44).

## 1. Needs merges from p0 and p1: tick the ones that need your input (unticked are accepted as merged)

- **N-01**: p1 'lots of understandable reading and listening on things that interest them' (N-p1-03) + p0 'material on topics that interest them' (N-p0-23)
- **N-11**: p1 'new material mostly familiar words, phrases and patterns' (N-p1-35) + p0 'understand most words they meet' (N-p0-19) + 'material they can read comfortably' (N-p0-21)
- **N-14**: p1 'the language they learn from is correct' (N-p1-39) + p0 'trust what they learn from' (N-p0-12)
- **N-31**: p1 'help with input and practice above their level' (N-p1-64) + p0 'help with what they don't understand' (N-p0-18)

**Answer:** N-01, N-14, N-31 (N-11 accepted as merged)

## 2. N-01: how should these be kept? (default: one merged need)

- **Keep both separate**
- **Merged as worded** (p1's wording)
- **Merged, reworded**

**Answer:** Merged as worded. Note: "learners need material on topics that interest them."

## 3. N-14: how should these be kept? (default: one merged need)

- **Keep both separate**
- **Merged as worded** (p1's wording)
- **Merged, both parts**

**Answer:** Merged as worded. Note: "p0s version." → merged in p0's wording: 'Learners need to trust what they learn from.' (N-43)

## 4. N-31: how should these be kept? (default: one merged need)

- **Keep both separate**
- **Merged, p1's words**
- **Merged, p0's words**

**Answer:** Keep both separate (N-44, N-45)

## 5. RQ-04: how should a skill's level move? (default: from the session's results)

- **Session results**: once per session, from that skill's exercise scores
- **Ratings + scores**: session scores plus the five-button text ratings
- **From known words**: like the overall level, but per skill
- **The AI judges**: the AI sets them in each exchange

**Answer:** From known words

## 6. N-01: your note said p0's wording. Which do you mean?

- **p0's words only**
- **Split into two**: p0's words, plus 'a lot of understandable input' as its own need
- **p1's words, as is**

**Answer:** Split into two (N-41, N-42)

## 7. RQ-04: where does the writing level come from? (default: words written correctly)

- **Words written right**
- **Same as reading**
- **No writing level**

**Answer:** Words written right. Note: "general language level comes from size of ground, specific language levels come as a combo of exercise results and general language level." → RQ-04: each skill's level combines that skill's exercise results with the overall level.

## 8. RQ-13: slider range? (default: 0.5× to 1.5×)

- **0.5× to 1.5×**
- **0.5× to 1×**
- **0.7× to 1.2×**

**Answer:** 0.5× to 1.5× (the default)

## 9. Conflict 12: one exchange per session (RQ-01) vs packages in 20-minute parts with a prompt each (RQ-44, 83, 186, 188, 130, 258). (default: a session's exchange returns one package)

- **Exchange = package**
- **Exchange = part**
- **Both**: one summary exchange per session, plus extra part prompts without a summary

**Answer:** Both. Note: "AI exchange size can be chosen from different sizes so users can control generation time and adjust to rate limits of gen ai." → PR-p1-278 / RQ-348 added.
