# 72 — The Dictionary in pages

Found while looking into flaky browser tests (2026-10-26): G-03's Dictionary page (FR-316) failed to load within the test's 5 s. Timed on the demo account grown to 5,000 sentences: `/api/dictionary` took 7.5 s (2.7 s at 500 sentences); every other page's data took at most 0.65 s (reading page), most under 0.25 s. The cause is every word being tested against every sentence for its example.

## 1. What speed rule should the spec add? (default: every page within 1 s)

- Every page within 1 s (Recommended): a rule for all pages at a big learner's size (2,000 words, 5,000 sentences), timed by a test.
- Dictionary only, within 1 s: the same target, only for the Dictionary.
- **Dictionary in pages**: show the dictionary 100 words at a time, with search on the server.

**Answer:** Dictionary in pages (confirmed again in the chat).

## 2. Dictionary search on the server: when does it search? (default: as you type, after a short pause)

- **As you type, after a pause**: searches 0.3 s after the learner stops typing.
- On Enter or a Search button: searches only when asked.

**Answer:** As you type, after a pause. Note: "server might need cache of frequently searched or recently accessed words or both in addition to other possible tactics to reduce latency on most searches. research this and present to me what you find."

### Research (2026-10-26, measured on the owner's computer with throwaway code in the session scratchpad)

The demo account grown to a big learner (5,000 sentences, 2,000 words) and a very big one (50,000 sentences, 20,000 words):

| What | 5,000 / 2,000 | 50,000 / 20,000 |
|---|---|---|
| Today's whole dictionary | 73.8 s | not run |
| A page of 100 words, examples found as today (each word tested against every sentence) | 746 ms | 7,340 ms |
| A page of 100, each word's example sentence stored (one join) | 1.8 ms | 1.6 ms |
| A search, first 100 matches on the word or its meaning (SQL `LIKE`) | 3.7 ms | 30.8 ms |
| Finding every word's example in one pass over all sentences | 84 ms | 851 ms |

Findings:
- The time goes into finding example sentences, not into searching. Paging alone cuts it 100-fold but still leaves 0.75 s at a year's reading and 7 s at ten years'.
- Storing each word's example sentence when the word is first met (and filling it once for existing words) makes a page or a search take 2–30 ms at any size.
- With that, a cache of frequent or recent searches has little left to save (it would save 2–30 ms) and brings the risk of showing stale words after a change; an in-memory cache is also empty after every restart. Not worth it now.
- Other latency on a phone is the network (the tunnel), which no server cache removes; on the page, the 0.3 s pause and dropping answers to older searches when a newer one is sent keep typing smooth.

## 3. How should the Dictionary find example sentences fast? (default: store each word's example)

- **Store each word's example (Recommended)**: saved when a word is first met; filled once for existing words.
- Store examples and add a cache: as above, plus a cache of recent searches.
- One pass per request: no stored examples; each request scans all sentences once.

**Answer:** Store each word's example (the default).

## 4. How should the 100-at-a-time pages work with the three sections? (default: each section pages on its own)

- Each section on its own: each section shows its first 100, with its own More button.
- **Tabs, one section at a time**: Words / Phrases / Patterns as tabs, one list with More; a search searches the open tab, each tab showing its number of matches.
- One mixed list: all kinds A to Ö together, each marked with its kind.

**Answer:** Tabs, one section at a time.

## 5. Where do Names go with the tabs? (default: a fourth tab)

- **A fourth tab**: Words / Phrases / Patterns / Names, all paged and searched alike.
- Card below, as now: names stay in their own card under the tabs, all shown.

**Answer:** A fourth tab (the default).

## Applied

RQ-409, RQ-410 in addendum 002; G-03 FR-316 and FR-317 rewritten, SC-005 (100 ms on the server at 2,000 words and 5,000 sentences), the HTTP contract's `GET /api/dictionary`, data model (migration 012: `words.example_sentence_id`), research R9. The fill for words met before migration 012 is a start-up load (G-01 FR-032, question-pages/71).
