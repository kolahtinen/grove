# grove p1: build requirements review (asked in Claude Code, 2026-10-20)

Tick-lists over PR-p1-237…275; ticked: 237, 238, 246, 250, 253, 262, 264, 267, 269, 270, 271. The other 28 kept.

- PR-p1-237 (password ≥ 8): *higher standard, more than just alphabet* → follow-up → *8 chars, at least one digit, symbol and characters* → at least 8 characters with a letter, a digit and a symbol.
- PR-p1-238 (invitation works once): **several uses** (the owner sets how many).
- PR-p1-246 (100 entries a day): **higher, e.g. 500**.
- PR-p1-250 (rejected entries on Home): **elsewhere, not Home** → follow-up: where? Options: in the Dictionary · a notifications list · in the word inspector. Answer: *all three* (PR-p1-250 narrowed to the Dictionary; PR-p1-276 bell, PR-p1-277 inspector).
- PR-p1-253 (text level = highest word level): **most words' level** (the lowest level covering 95% of its words).
- PR-p1-262 (last 30 bank changes): **full log, searchable**.
- PR-p1-264 (straight to the starting level): **keep as built**.
- PR-p1-267 (patterns up to the level count as known): **checked like words** (tick the unknown ones).
- PR-p1-269 (80% per level): **90%**.
- PR-p1-270 (Expand round size): asked *what is expand* → explained → **keep 20 + 3**.
- PR-p1-271 (Expand triggers): **only when texts are easy**.
  - Conflict with PR-p1-227 (offered after a certain amount of input): **drop PR-p1-227**.

Applied: 30 kept, 9 changed (not yet rebuilt), PR-p1-227 dropped, PR-p1-276, 277 added.
