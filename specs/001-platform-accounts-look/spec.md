# Feature Specification: Platform, accounts, security and the look's basics (G-01)

**Feature Branch**: `main` (no feature branch; spec folder `specs/001-platform-accounts-look`)

**Created**: 2026-10-24

**Status**: Draft

**Input**: User description: "G-01: Platform, accounts, security and the look's basics. The feature description is the G-01 section of docs/middle-steps.md (Part 2: Feed for Spec Kit), with Appendix A (colour tokens, type, shape/layout, logo) for the look's basics. Follow the combined requirements as written; every spec requirement names its RQ and N IDs."

**Sources**: `docs/middle-steps.md` (G-01 feed; Appendix A), `docs/requirements.md`, `docs/needs.md`, `docs/middle/` (constraints C-…, quality Q-…, threats T-…, risks R-…), `.specify/memory/constitution.md` v1.0.0. Named outside services (Firebase Authentication, the quick tunnel, the GitHub README) are decisions already made in the combined requirements and constraints, not design choices of this spec.

## Clarifications

### Session 2026-10-24

- Q: What happens when someone signs up with an email that already has an account? → A: Every sign-up ends with the same "Done, now sign in" screen; a taken address changes nothing (no invitation use spent, no email), and its owner uses the password reset (question-pages/54).
- Q: After a password reset, do that account's existing grove sign-ins end? → A: No; grove sign-ins last 30 days or until Sign out, whatever happens to the password (question-pages/54).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Sign up by invitation and get a private grove (Priority: P1)

An invited course reviewer finds grove's current link and the reviewer invitation code in the private repo's README. They open the link on their phone, sign up with the code, their email and a password, agree to the terms and privacy notice and confirm they are 13 or over. Sign-up ends with "Done, now sign in"; they sign in with the password they just chose and land in their own, empty grove, see their email and a Sign out button in the header, and stay signed in on that device for 30 days.

**Why this priority**: Nothing else in grove can be used or reviewed without an account; this is the walking skeleton every later goal builds on.

**Independent Test**: With a fresh grove, a tester signs up with a valid code, signs out, signs in again, and closes and reopens the browser; each step works and the code shows one use fewer.

**Acceptance Scenarios**:

1. **Given** a valid reviewer invitation code with uses left, **When** someone signs up with it, an email, a password that meets the rule, agreement to the terms and confirmation of being 13 or over, **Then** an account with the learner and reviewer roles is created through Firebase, the code has one use fewer, the sign-up is in the security log with the invitation's label, and the screen says "Done, now sign in". (RQ-217, RQ-218, RQ-221, RQ-222, RQ-366, RQ-368, RQ-371)
2. **Given** an invitation code with no uses left, a wrong code, or no code, **When** someone tries to sign up, **Then** no account is created and the code's uses don't change. (RQ-217, RQ-368)
3. **Given** a sign-up without agreement to the terms or without the age confirmation, **When** it is sent, **Then** no account is created. (RQ-141, RQ-228; constitution 3.1)
4. **Given** a password shorter than 8 characters or missing a letter, a digit or a symbol, **When** someone signs up with it, **Then** sign-up is refused with the rule shown. (RQ-221)
5. **Given** a signed-in learner, **When** they look at any page, **Then** the header shows their email and a Sign out button; **When** they press Sign out, **Then** their session ends on the server and they are on the sign-in page. (RQ-226; constitution 4.7)
6. **Given** a learner who signed in on a device 29 days ago and hasn't signed out, **When** they open grove there, **Then** they are still signed in; after 30 days they must sign in again. (RQ-224)

---

### User Story 2 - My data stays mine (Priority: P1)

A learner trusts that nobody else can see or change their grove, that nothing but grove is contacted when they use it, and that signed-out visitors see only the public pages.

**Why this priority**: Grove holds other people's personal data on the owner's computer (Q-01, Q-02, C-04); a leak would end the review and break the law.

**Independent Test**: Automated tests for every server endpoint and every role (signed-out visitor, learner, reviewer, owner), a test that changes IDs in requests, and a browser test that records every network request on every page.

**Acceptance Scenarios**:

1. **Given** a signed-in learner, **When** they request another learner's data by changing an ID, **Then** the server refuses. (RQ-155, Q-01)
2. **Given** a signed-out visitor, **When** they open any page but sign-in, sign-up, password reset or the terms and privacy notice, **Then** they are sent to sign-in. (RQ-162, Q-01)
3. **Given** any page of grove, **When** it loads, **Then** the browser contacts no host but grove's own, and its fonts come from grove. (C-12, Q-02, RQ-331, RQ-367)
4. **Given** any request to grove's server, **When** it is handled, **Then** the server talks to no outside service except Firebase Authentication, and to that only for sign-up, sign-in and password resets. (RQ-181, RQ-367; constitution 4.2, 4.5)

---

### User Story 3 - Get back in after forgetting my password (Priority: P2)

A learner who forgot their password asks for a reset, gets an email, sets a new password on the reset page the email links to, and signs in.

**Why this priority**: Without it, a forgotten password locks a reviewer out for good, and the owner has no way to reset passwords by hand (RQ-220 dropped).

**Independent Test**: A tester asks for a reset for an existing account, follows the email, sets a new password and signs in with it; the old password no longer works.

**Acceptance Scenarios**:

1. **Given** an account, **When** its email is entered on the password-reset page, **Then** a reset email is sent, the page says that if the address has an account an email is on its way, and the request is in the security log. (RQ-219, RQ-371, RQ-372)
2. **Given** an email with no account, **When** it is entered on the password-reset page, **Then** the page shows exactly the same answer, and no email is sent. (RQ-372)

---

### User Story 4 - The owner sets up and runs grove safely (Priority: P2)

The owner creates their own account with a setup command on their computer, sets how many people the reviewer code lets in, and leaves the computer running. Grove and the tunnel start by themselves after a restart, the README always shows the current link, backups are made every hour, and the owner can read a security log, and export or delete a learner's data on request.

**Why this priority**: Reviewers can only reach grove if it is running and its link is current (Q-06); the owner must stay the only owner (T-03) and answer data requests (C-04).

**Independent Test**: Run the setup command on a fresh install; restart the tunnel and time the README update; restart the computer and check that grove comes back with its data; run the export and delete commands for a test learner and look for leftovers, including in Firebase.

**Acceptance Scenarios**:

1. **Given** a fresh install, **When** the owner runs the setup command with their email, **Then** the owner account exists with the owner and learner roles and its own learner data, and the action is in the security log. (RQ-146, RQ-223, RQ-227, RQ-371)
2. **Given** an owner already exists, **When** the setup command is run again for another email, or anyone uses sign-up, **Then** no second owner is created. (RQ-146, RQ-147, RQ-223)
3. **Given** the owner, **When** they create or change the reviewer invitation code with a number of uses (at most 5 for the reviewer code), **Then** the README shows that code and the uses take effect. (RQ-222, RQ-368)
4. **Given** the tunnel restarts and its address changes, **When** 2 minutes have passed, **Then** the README shows the new link. (RQ-364, Q-06)
5. **Given** the owner's computer restarts, **When** it is back up, **Then** grove and the tunnel are running without anyone signing in at the computer, and every change grove had confirmed as saved is still there. (RQ-125, Q-03)
6. **Given** grove is running, **When** an hour passes, **Then** a backup is written to the second disk and can be read back. (RQ-180, Q-03; constitution 4.12)
7. **Given** a learner asks for their data, **When** the owner runs the export command for that learner, **Then** all their data is written as JSON; **When** the owner runs the delete command, **Then** the account and all its data are gone from grove and Firebase, and the action is in the security log. (RQ-229, RQ-371; constitution 3.2, 3.3)

---

### User Story 5 - Grove resists guessing and floods (Priority: P2)

Someone who got hold of the link tries to guess passwords, find out which emails have accounts, sign up many times, or send huge pastes. Grove refuses calmly and logs what matters.

**Why this priority**: Grove is reachable from the whole internet through the tunnel (R-17, T-01, T-05, T-16).

**Independent Test**: Scripted attempts: 6 wrong passwords in a row, 11 sign-ups from one address in an hour, a 101 KB request, and sign-in/sign-up/reset with known and unknown emails compared answer by answer.

**Acceptance Scenarios**:

1. **Given** 5 failed sign-ins in a row for one email address, **When** a sixth is tried within 15 minutes, **Then** it is refused even with the right password, and the lockout is in the security log. (RQ-156, RQ-371)
2. **Given** an email that already has an account and a valid invitation code, **When** someone signs up with them, **Then** they see the same "Done, now sign in" screen as a new sign-up, the existing account is unchanged and the code keeps its uses. (RQ-372, RQ-368)
3. **Given** any email address, **When** it is used for sign-in, sign-up or password reset, **Then** the answer (text, status and timing within normal variation) is the same whether or not it has an account, including while it is locked. (RQ-372)
4. **Given** 10 sign-up attempts from one internet address within an hour, **When** an 11th is tried, **Then** it is refused with a plain message. (RQ-160, RQ-225)
5. **Given** a paste, upload or other request larger than 100 KB, **When** it is sent, **Then** it is refused with a clear message, and the server keeps running. (RQ-161, RQ-231; constitution 2.4, 2.5)

---

### User Story 6 - A calm forest look on every screen (Priority: P3)

A learner opens grove and sees the forest look: Night forest on a dark device, Pale birch on a light one, frosted-glass cards, rounded green buttons that dip when pressed, the three-tree logo in a sticky blurred top bar, all in one centred column that fits the phone and works on a desktop.

**Why this priority**: The look's basics are built here so every later screen is built in it from the start (question-pages/53); grove works without them, so they come after the musts.

**Independent Test**: Open the sign-in page and the signed-in home page with the device in dark and light mode, on a phone-width and a desktop-width window, and compare the computed colours, fonts, radii and widths with Appendix A.

**Acceptance Scenarios**:

1. **Given** a device set to dark mode, **When** grove opens, **Then** it uses Night forest; light mode uses Pale birch, with the colour tokens of Appendix A.1. (RQ-306, RQ-312, RQ-334, RQ-335)
2. **Given** a phone 360 px wide or a desktop window 1440 px wide, **When** any G-01 page is shown, **Then** the content is one centred column at most 560 px wide with no sideways scrolling, under a sticky blurred top bar with the logo. (RQ-23, RQ-38, RQ-341)
3. **Given** any G-01 page, **When** it is shown, **Then** text uses Zen Kaku Gothic New served by grove (falling back to Hiragino Sans, Noto Sans JP, then the device's sans-serif) at the sizes of Appendix A.2. (RQ-331, RQ-337)
4. **Given** any button, **When** it is pressed, **Then** it shrinks to 97%; main buttons have the green gradient and glow of Appendix A.3, and cards are frosted glass with its radii, blur, shadow and glow. (RQ-314, RQ-316, RQ-338, RQ-339, RQ-340)

---

### Edge Cases

- The tunnel restarts and its address changes: the README shows the new link within 2 minutes. (RQ-364, Q-06)
- The owner's computer restarts: grove and the tunnel start again by themselves; nothing confirmed as saved is lost. (Q-03)
- The GitHub README can't be updated (network down, token expired): grove keeps running, retries, and logs the failure without the token. (RQ-364; constitution 2.1)
- Firebase is unreachable: sign-in, sign-up and password reset say plainly that signing in isn't possible right now; nothing internal is shown, and already signed-in learners keep working. (RQ-366; constitution 2.5)
- Firebase returns something unexpected or a forged, expired or other-project token: it is rejected. (T-10; constitution 4.5)
- A paste or request is larger than 100 KB: refused with a clear message. (RQ-231, T-07)
- 11th sign-up from one address within an hour: refused. (RQ-225)
- Two people sign up with the last use of a code at the same moment: only one account is created. (RQ-222, RQ-368)
- Sign-up with an email that already has an account: the same "Done, now sign in" screen as any sign-up; the existing account, the invitation's uses and the security log's account records are unchanged (the attempt is logged against the address entered); signing in with the newly typed password fails like any wrong password. (RQ-372)
- A learner resets their password while signed in on other devices: those sign-ins stay valid until they expire or are signed out; only new sign-ins need the new password. (RQ-224, RQ-219; accepted on question-pages/54)
- A learner's account is deleted while they are signed in: their next request is treated as signed out. (RQ-229, RQ-155)
- An older phone where the frosted-glass blur and glows lag: fewer effects when the device asks for reduced transparency or reduced motion. (R-15)
- A device with no Japanese fonts and the bundled font not yet loaded: text shows in the device's sans-serif until it loads. (RQ-331)

## Requirements *(mandatory)*

MUST for must-priority combined requirements, SHOULD for should-priority ones, as in the G-01 feed. Each requirement names the combined requirements (RQ-…) and needs (N-…) it comes from; other sources (C-, Q-, T-, constitution) are added where they shape it. Tests are named after the FR ID and its RQ IDs.

### Functional Requirements

**Platform and hosting**

- **FR-001** (RQ-125, RQ-180; N-15, N-20, N-16, N-19; C-06): Grove's processing and data storage MUST run on the owner's own computer, reached by learners only through a public relay (a quick tunnel; reduction X-01: a test deployment for invited reviewers), with no ports open at home. A small server with a database stores the data.
- **FR-002** (RQ-125, RQ-180; N-20; Q-03, R-05): Grove and the tunnel MUST start by themselves when the owner's computer starts; a change grove has confirmed as saved MUST survive a restart of grove or the computer.
- **FR-003** (RQ-180; N-20; Q-03; constitution 4.12): Grove MUST write a backup of all data to a second disk every hour, so at most one hour of data is lost if the database is lost.
- **FR-004** (RQ-364; N-18; Q-06): The README of the owner's private GitHub repo MUST show grove's current link; the owner's computer MUST update it by itself within 2 minutes whenever the tunnel's address changes, touching nothing in the repo but the README.
- **FR-005** (RQ-38, RQ-23; N-16, N-19, N-05; C-03): Grove MUST run in a current desktop browser and SHOULD work on phones first: a single centred column at most 560 px wide, with no sideways scrolling from 360 px wide up.
- **FR-006** (RQ-181, RQ-367; N-16, N-19, N-20, N-24; C-01): Grove's server MUST NOT call any AI service, and MUST NOT contact any outside service except Firebase Authentication.
- **FR-007** (RQ-178; N-42, N-06): Grove MUST NOT offer a conversation partner in the first version.

**Accounts**

- **FR-008** (RQ-90, RQ-147; N-16, N-17, N-24): Grove MUST support several learners, each with their own account, sign-in and separate learner data. Everyone who signs up MUST be a learner.
- **FR-009** (RQ-366, RQ-157, RQ-367; N-20, N-18, N-24): Accounts (sign-up, sign-in, stored passwords) MUST be handled by Firebase Authentication with email and password, reached only from grove's server; passwords are stored hashed by Firebase and never by grove; nobody needs a Google account.
- **FR-010** (RQ-217, RQ-368, RQ-222; N-18, N-20; C-11): Sign-up SHOULD need a valid invitation code with uses left; in the first build, the reviewer invitation code (shown in the private repo's README) lets in at most 5 people and gives the reviewer role, and the owner sets how many uses a code has. Each successful sign-up uses up one use; a failed one uses none.
- **FR-011** (RQ-218, RQ-221, RQ-141, RQ-228; N-20, N-27, N-28; C-04; constitution 3.1): Sign-up SHOULD ask for an email address and a password of at least 8 characters with at least one letter, one digit and one symbol, and MUST record the learner's agreement to the terms of use and privacy notice (with its time) and their confirmation that they are 13 or over; without both, no account is made.
- **FR-012** (RQ-372; N-24): Sign-in, sign-up and password reset MUST give the same answer (text, status, and timing within normal variation) whether or not an email address has an account. Every accepted sign-up ends with the same "Done, now sign in" screen and does not sign the person in. If the address already has an account, nothing changes: no account is made or altered, no invitation use is spent, and no email is sent; the person's new password simply won't work, and they can use the password reset (FR-015).
- **FR-013** (RQ-224; N-19; constitution 4.7): A sign-in SHOULD last 30 days on that device unless the learner signs out or the account is deleted; a password reset does not end existing sign-ins; the session cookie is random, HttpOnly, Secure and SameSite=Lax, and every state-changing request needs a CSRF token.
- **FR-014** (RQ-226; N-17): Every signed-in page SHOULD show the signed-in email and a Sign out button in the header; signing out MUST end the session on the server.
- **FR-015** (RQ-219, RQ-372; N-20, N-24): A forgotten password MUST be resettable by email: the learner enters their email, the same answer is shown either way, and an account's address gets a reset email linking to Firebase's password-reset page (the one allowed outside page, C-12).
- **FR-016** (RQ-146, RQ-223, RQ-227; N-18, N-20; T-03): There MUST be exactly one owner, set in grove's settings on the owner's computer. The owner's account SHOULD be created by a setup command on that computer; sign-up never creates an owner, and nobody can become owner through grove. The owner SHOULD also be a learner with their own learner data.
- **FR-017** (RQ-229; N-20; C-04; constitution 3.2, 3.3): Learners SHOULD ask the owner to export or delete their data (no button for it yet); the owner MUST be able to export one learner's data as JSON with one command, and delete one learner's account and all their data, including in Firebase, with one command.

**Security**

- **FR-018** (RQ-155; N-20, N-24; Q-01; constitution 2.3): Every request MUST be checked on the server against who is asking and their role (signed-out visitor, learner, reviewer, owner); no account can read or change another learner's data.
- **FR-019** (RQ-162; N-20, N-18; Q-01): Signed-out visitors MUST reach only the sign-in, sign-up, password-reset and terms-and-privacy pages (and the files those pages need); every other page sends them to sign-in, and every other request is refused.
- **FR-020** (RQ-156, RQ-372; N-20, N-24; T-01): After 5 failed sign-ins in a row for an email address, sign-in for that address MUST be refused for 15 minutes, even with the right password. Failures are counted per address entered, whether or not it has an account, so the lockout doesn't reveal which addresses have accounts.
- **FR-021** (RQ-160, RQ-225; N-18; T-16): Grove SHOULD accept at most 10 sign-up attempts an hour from one internet address; further attempts are refused with a plain message.
- **FR-022** (RQ-161, RQ-231; N-18; T-07; constitution 2.4, 2.5): A single paste, upload or request body SHOULD be at most 100 KB; anything larger is refused with a clear message, without crashing the server.
- **FR-023** (RQ-371; N-18; T-13; constitution 3.6): Grove MUST keep a security log of sign-ups (with the label of the invitation used, never the code), sign-ins, failed sign-ins, lockouts, password-reset requests and the owner's actions (setup, invitation changes, exports, deletions): who, when, what. The log MUST NOT hold passwords, tokens, invitation codes or pasted texts, and entries are deleted after 30 days.
- **FR-024** (RQ-331, RQ-367; N-20, N-24; C-12, Q-02; constitution 4.4, 4.6): The pages MUST NOT load anything from another host: fonts, styles, scripts and images are served by grove, and a content security policy forbids inline scripts and outside sources.

**Terms and privacy**

- **FR-025** (RQ-141, RQ-228, RQ-376; N-27, N-28, N-25, N-43; C-04; constitution 3.4, 3.5): A terms-of-use and privacy page, readable without signing in, SHOULD say: accounts are for people 13 and over; learners may only share texts they have the right to share; the suspension and ban rule (a first copyright breach gives a fixed suspension, a second a ban); what data grove keeps and why, for each kind; that Firebase (Google) and Cloudflare process data for grove; that what learners paste into their own AI is governed by that AI's terms; that a learner's own texts get only automatic checks and may contain mistakes; and that learners ask the owner to export or delete their data.

**The look's basics** (values in `docs/middle-steps.md` Appendix A)

- **FR-026** (RQ-306, RQ-312, RQ-334, RQ-335; N-11, N-34): Grove MUST have two looks, Night forest (dark) and Pale birch (light), following the device's setting; they SHOULD use the forest palette and the colour tokens of Appendix A.1.
- **FR-027** (RQ-331, RQ-337; N-34): Text SHOULD use Zen Kaku Gothic New (weights 400, 500, 700) served by grove, falling back to Hiragino Sans, Noto Sans JP, then the device's sans-serif, at the sizes of Appendix A.2; content text sizes are defined relative to a size factor (default 1, range 0.8–1.6).
- **FR-028** (RQ-314, RQ-338, RQ-339; N-34): Content SHOULD sit on rounded, frosted-glass cards with the corner radii, blur, saturation, shadow and glow of Appendix A.3.
- **FR-029** (RQ-316, RQ-340; N-34): Buttons SHOULD be rounded (14 px) and shrink to 97% while pressed; main buttons have the green gradient, text colour and glow of Appendix A.3.
- **FR-030** (RQ-341, RQ-23; N-34, N-19): The layout SHOULD follow Appendix A.3: one column at most 560 px wide with its padding, and a sticky top bar fading from the page colour and blurred 14 px, holding the three-tree logo of Appendix A.5 and the app title.
- **FR-031** (RQ-314, RQ-339; N-34; R-15): When the device asks for reduced transparency or reduced motion, cards and the top bar SHOULD drop the blur and glows (solid card colours instead), so older phones don't lag.

**Scope statements** (carried by the content of later goals; nothing to build in G-01)

- RQ-24 (N-22): Grove serves adult self-learners. RQ-25 (N-13): Grove works for learners at any level. RQ-163 (N-22): Grove serves students learning alongside a course. In G-01 these mean only that accounts carry no level, course or audience restriction beyond the age rule of FR-011.

### Key Entities *(include if feature involves data)*

- **Account**: one person in grove. Firebase identity (its user ID), email, roles (learner always; reviewer or owner as given), created time, the time they agreed to the terms and confirmed being 13 or over, the invitation used (by label). Owns that person's learner data (empty in G-01; filled by later goals).
- **Role**: signed-out visitor, learner, reviewer, owner. Decides what each request may do (FR-018).
- **Invitation**: a code, a label, the role it gives, uses allowed and uses left. The reviewer invitation allows at most 5 uses.
- **Session**: one device's sign-in for an account: random identifier, created and expiry time (30 days), CSRF token. Ended on sign-out or account deletion.
- **Failed sign-in counter**: per email address entered: count of failures in a row and the lockout end time.
- **Sign-up counter**: per internet address: sign-up attempts in the last hour.
- **Security log entry**: time, who (account or address entered), what happened, and the invitation label where relevant; kept 30 days.
- **Settings**: on the owner's computer: the owner's account, the tunnel's current link, and where backups go.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An invited reviewer can go from the README link to their own signed-in grove in under 2 minutes on a phone.
- **SC-002**: In the authorisation tests, 0 requests from one account can read or change another learner's data, and 0 pages beyond the four public ones can be reached signed out. (Q-01)
- **SC-003**: On every page, 0 network requests go to any host but grove's own. (Q-02)
- **SC-004**: After a tunnel restart, the README shows the new link within 2 minutes; during the review, grove answers at the README link in at least 19 of 20 hourly checks a day. (Q-06)
- **SC-005**: After a restart of grove or the owner's computer, 0 changes that grove confirmed as saved are lost; if the database is lost, at most the last hour is lost, and a restore from backup has been tried once by hand before reviewers are invited. (Q-03)
- **SC-006**: For sign-in, sign-up and password reset, the answers for an address with an account and one without can't be told apart by text or status. (RQ-372)
- **SC-007**: 100% of the colours, fonts, radii and widths checked on the G-01 pages match Appendix A in both looks.

## Assumptions

- The first build's users are the owner and at most 5 invited reviewers (C-11); grove isn't open to anyone else yet.
- Learners have a current browser on a phone or desktop and an internet connection; grove is unavailable when the owner's computer is off (PR-p1-129, C-06).
- Firebase Authentication's free tier is enough for 6 accounts and sends the reset emails; its password-reset page is the one outside page learners see (C-12).
- "One internet address" means the visitor's address as passed on by the tunnel, not the tunnel's own.
- Learner data beyond the account (texts, ground, progress) arrives in later goals; G-01 gives each learner an empty home page in the forest look as the place later goals fill.
- Switching the look by hand and changing the text size factor are not in G-01 (the extras are in G-08); G-01 follows the device's setting and uses size factor 1.
- The owner writes the final wording of the terms and privacy notice; the spec fixes what it must say (FR-025).
- The reviewer role in G-01 behaves like a learner; what reviewers see differently (the demo content, RQ-360…363) comes in G-07.
- Course roles (teachers, classes) and content maintainers are not in the first build.
