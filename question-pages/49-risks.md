# 49: Risks review (phase 2)

Asked in Claude Code on 2026-10-21 (`/pre.risks`). Draft: docs/middle/risks.md (R-01…17).

## 1. Risks 1/4: tick the ones that need your input (R-01 AI answers, R-02 not by Sunday, R-03 word counting, R-04 prompt too long)

**Answer:** R-02. Note: "new requiements allowed, but to be avoided".

## 2. Risks 2/4 (R-05 grove down, R-06 data lost, R-07 break-in, R-08 Swedish errors)

**Answer:** R-07, R-08. Note: "only logged in users, outsource login service if free. language errors in demo are not a big risk."

## 3. R-07: which way to outsource the login? (default: Cloudflare's email PIN in front, grove's own accounts behind)

- **PIN gate + accounts** · **PIN gate only** · **Login service** (Supabase, Clerk or Firebase)

**Answer:** Login service.

## 4. Which login service? (default: Supabase in an EU region)

- **Supabase (EU)** · **Clerk** · **Firebase Auth**

**Answer:** Firebase Auth.

## 5. C-12 vs Firebase: how should sign-in reach Firebase? (default: grove's server talks to it)

**Answer:** Other: "do a user need a google account? if so im not interested". Answered: no; email and password work with any address; only the owner needs a Google account for the Firebase project.

## 6. Same question, asked again

**Answer:** Other: "how do i get the reviewers unique access? just a hash on github?". Answered: nothing secret in a public repo; access goes to reviewers privately.

## 7. How does each reviewer get access? (default: a personal invitation code sent privately)

- **Personal code** · **You create accounts** · **Code in README**

**Answer:** Other: "but does it need to be a public repo tho".

## 8. Should the GitHub repo be private? (default: private, reviewers as collaborators)

- **Private** · **Public**

**Answer:** Other: "but does hosting require it go be public? if not, we can use that route." Answered: hosting doesn't need it; the README update works on a private repo. → private (C-11).

## 9. With a private repo, how does each reviewer get an account? (default: a personal one-use code)

- **Personal code** · **You create accounts** · **Code in the README**

**Answer:** Other: "code to create email password based account in readme, multiple use, max 5 uses". → PR-p1-293 / RQ-368.

## 10. How should sign-in reach Firebase? (default: grove's server talks to it)

- **Server talks to it** · **Allow it for sign-in**

**Answer:** Server talks to it (the default). → PR-p1-292 / RQ-367.

## 11. Risks 3/4 (R-09 copy-paste, R-10 voices, R-11 starting level, R-12 marking chore)

**Answer:** R-09, R-10. Note: "reviewers won't stop because it is tedious. check voices, tell which browsers (on which device) support voice's. also new requirement: explain terminology to user somewhere." → R-09 likelihood low; PR-p1-294 / RQ-369; PR-p1-295 / RQ-370.

## 12. Risks 4/4 (R-13 shared bank, R-14 licences, R-15 slow look, R-16/17 access)

**Answer:** none ticked (accepted).

## 13. With Firebase, bring back 'reset a forgotten password by email' (RQ-219)? (default: yes)

- **Yes, by email** · **Yes, grove's own page** · **No, by hand**

**Answer:** Yes, by email (the default). → RQ-219 must, first build; RQ-220 dropped; Firebase's reset page is the one C-12 exception.
