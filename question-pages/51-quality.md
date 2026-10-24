# 51: Quality attributes review (phase 2)

Asked in Claude Code on 2026-10-21 (`/pre.quality`). Draft: docs/middle/quality.md (Q-01…08).

## 1. Q-04: p1 says 'at most one fix-it round in 4 of 5 tries', p0 says 'opens on the first try in 4 of 5 tries'. Which? (default: p1's)

- **p1: ≤1 fix-it** · **p0: first try** · **Both**

**Answer:** p0: first try.

## 2. Quality 1/2: tick the ones that need your input (Q-01 security, Q-02 privacy, Q-03 data, Q-04 AI exchange)

**Answer:** none ticked (accepted).

## 3. Quality 2/2 (Q-05 speed, Q-06 availability, Q-07 word counting, Q-08 shared bank; dropped ones listed)

**Answer:** Q-07. Note: "why would any be wrong when counting words?" Answered: it's about deciding which words are new to the learner; inflected forms, homographs and compounds make that hard.

## 4. Q-07: what should happen to the word-counting target? (default: keep as drafted)

- **Keep as drafted** · **Keep, lower bar** · **Drop it**

**Answer:** Other: "the correctness is not guaranteed for the user themselves but before any others use the texts they must be verified. sentences that can't fully be auto checked go through manual checks. content maintainers will do the checking. for the first version no content checking platform is necessary, as there will only be automatic checks."

## 5. Q-07: so what happens to the 48-of-50 target? (default: measured, no bar)

- **Measure, no bar** · **Drop Q-07** · **Keep the bar**

**Answer:** Measure, no bar (the default).

## 6. Who are content maintainers? (default: accounts the owner appoints; the owner is one too)

- **Owner appoints** · **Owner only for now**

**Answer:** Owner appoints (the default). → PR-p1-298…300 / RQ-373…375 (second build); RQ-102 changed; PR-p1-301 / RQ-376 (terms: own texts are only auto-checked; first build).
