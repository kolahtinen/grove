# 50: Threat model review (phase 2)

Asked in Claude Code on 2026-10-21 (`/pre.threats`). Draft: docs/middle/threats.md (T-01…20, STRIDE).

## 1. T-03: RQ-223 lets whoever signs up first with the owner's email become the owner. How should the owner's account be made? (default: a setup command on your computer)

- **Setup command** · **Verified email**

**Answer:** Setup command (the default). → RQ-223 changed.

## 2. Threats 1/4: tick the ones that need your input (T-01/02 sign-in, T-04 code leaks, T-05 who has an account, T-06/07 pastes)

**Answer:** T-04. Note: "assume no code leaks from reviewers" → T-04 accepted; the proposed 'switch the code off' requirement not added.

## 3. Threats 2/4 (T-08/09 others' data, T-10 Firebase, T-11 secrets, T-12/13 logs)

**Answer:** none ticked (accepted). → RQ-371 (security log).

## 4. Threats 3/4 (T-14 your computer, T-15 disk encryption, T-16/17 tunnel, T-18 packages)

**Answer:** none ticked (accepted).

## 5. Threats 4/4, second build (T-19 shared bank, T-20 shared library)

**Answer:** none ticked (accepted).

Also added from the accepted T-05: RQ-372 (the same answer whether or not an email has an account).
