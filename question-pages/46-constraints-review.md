# 46: Constraints review (phase 2)

Asked in Claude Code on 2026-10-21 (`/pre.constraints`). Draft: docs/middle/constraints.md.

## 1. C-04/C-06: in which country are you, and the computer grove runs on? (default: Sweden, as drafted)

- **Sweden** · **Finland** · **Somewhere else**

**Answer:** Finland (age of consent online is 13 there too: Data Protection Act, section 5).

## 2. Review 1/3: tick the ones that need your input

- C-01 Budget · C-02 Time · C-03 Platform · C-04 GDPR

**Answer:** C-01, C-02 (C-03, C-04 accepted)

## 3. Review 2/3: tick the ones that need your input (C-05 Licences, C-06 Hosting, C-07 Copyright, C-08 Outside AI)

**Answer:** none in the form; answered later in text: "no" (accepted). C-06 and C-08 were later changed by the budget answers.

## 4. C-01 Budget: what should change?

- **Allow a small budget** · **Learners may pay** · **Different dev tools**

**Answer:** Allow a small budget. Note: "20€ a month".

## 5. C-02 Time: what should change?

- **Fewer hours now** · **Later date** · **Different contents**

**Answer:** Different contents.

## 6. C-02: what should the Sunday version hold differently?

- Shared bank in · Shared library in · Accounts out · Loop smaller

**Answer:** none in the form; in text: "we can look at exclusions later" (settled in /pre.scope).

## 7. C-01: what can the €20 a month go to? (domain, a paid AI API, a cheap host)

**Answer** (in text): "all of them, research this for me". Researched: a .com at Cloudflare about $10.50 a year ([domainoffer.net](https://domainoffer.net/tld/com/cloudflare)); Hetzner shared cloud servers from €6.49 a month before VAT ([hetzner.com/cloud](https://www.hetzner.com/cloud)); a named Cloudflare tunnel needs a domain ([flaviocopes.com](https://flaviocopes.com/cloudflare-tunnel/)); Claude API prices from the claude-api reference (Haiku 5.5 $0.10/$0.50, Sonnet 5.5 $2/$10 per million tokens).

## 8. C-01: what should the €20 a month go to? (default: domain + AI API, keep your computer)

- **Domain + AI API** (about €5) · **All three** (about €13) · **Better AI model** (domain + Sonnet 5.5, capped) · **Domain only**

**Answer:** All three. Note: "there are 1-3 reviewers".

## 9. C-01: with 1–3 reviewers, which AI model? (default: Sonnet 5.5 with a monthly cap)

- **Sonnet 5.5, capped** · **Haiku 5.5** · **Try both, then pick**

**Answer:** Sonnet 5.5, capped (the default).

## 10. C-08: what happens to copy-paste with the learner's own AI? (default: kept as the fallback when the cap is reached)

- **Fallback at cap** · **Learner chooses** · **Grove's AI only**

**Answer:** Fallback at cap (the default). Note: "cap is 0 for non paid accounts, higher for paid accounts."

## 11. Paid accounts: how does an account become 'paid' in the first version? (default: you mark by hand; real payments later)

- **You mark by hand** · **Real payments now** · **Later, not designed now**

**Answer:** You mark by hand (the default).

## 12. C-06: on the rented server, how are backups kept? (default: hourly copies to your computer + Hetzner's daily backups)

- **Hourly to you + daily** · **Hourly to you only** · **Hourly to storage box**

**Answer:** Hourly to you + daily (the default). The preview's total was miscalculated (said about €15 + AI cap); the correct figure is about €10.50 + an AI cap of about €9 = €20.

Applied: C-01, C-04, C-06, C-08 rewritten; C-02 noted; C-12, C-13 added. PR-p1-127 / RQ-125 dropped; RQ-42 and RQ-67 back in (must); PR-p1-279…284 / RQ-349…354 added.
