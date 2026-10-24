# 52: X-03 test of real AI answers (phase 2)

Asked in Claude Code on 2026-10-23, after trying one 20-minute part prompt in free ChatGPT, Gemini and Claude on the phone. Results: docs/middle/ai-test/results.md.

## 1. X-03: how big should one AI exchange (a 'part') be in the first build? (default: 20 minutes)

- **20 minutes** · **10 minutes** · **15 minutes**

**Answer:** 10 minutes.

## 2. Easy reads: none of the three AIs managed zero new words (1–2 each). What should grove do? (default: allow 1 new word)

- **Allow 1 new word** · **Keep zero, fix-it round** · **Accept whatever**

**Answer:** Allow 1 new word (the default). → RQ-377

## 3. Too easy: Claude's texts had almost no new words. What should grove do with a text well below the target? (default: accept, nudge the next prompt)

- **Accept, nudge next prompt** · **Fix-it round** · **Accept silently**

**Answer:** Accept, nudge next prompt (the default). → RQ-378

## 4. Unlisted new words: Gemini left ~10 new words out of its list; Claude listed none. What should grove do? (default: find them itself, ask only for meanings)

- **Find them, ask for meanings** · **Fix-it round** · **Show them without meanings**

**Answer:** Find them, ask for meanings (the default). → RQ-379
