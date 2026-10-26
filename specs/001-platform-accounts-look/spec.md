# Feature Specification: Platform, accounts, security and the look's basics (G-01)

**Feature Branch**: `main` (no feature branch; spec folder `specs/001-platform-accounts-look`)

**Created**: 2026-10-24

**Status**: Draft (clarified; reviewer accounts changed on question-pages/55)

**Input**: User description: "G-01: Platform, accounts, security and the look's basics. The feature description is the G-01 section of docs/middle-steps.md (Part 2: Feed for Spec Kit), with Appendix A (colour tokens, type, shape/layout, logo) for the look's basics. Follow the combined requirements as written; every spec requirement names its RQ and N IDs."

**Sources**: `docs/middle-steps.md` (G-01 feed; Appendix A), `docs/requirements.md`, `docs/needs.md`, `docs/middle/` (constraints C-…, quality Q-…, threats T-…, risks R-…), `.specify/memory/constitution.md` v1.1.0. Named outside services (Firebase Authentication, the quick tunnel, the GitHub README) are decisions already made in the combined requirements and constraints, not design choices of this spec.

## Clarifications

### Session 2026-10-24

- Q: What happens when someone signs up with an email that already has an account? → A: Every sign-up ends with the same "Done, now sign in" screen (question-pages/54). **Superseded** by the next answer of page 55: there is no sign-up in the first build.
- Q: After a password reset, do that account's existing grove sign-ins end? → A: No; grove sign-ins last 30 days or until Sign out, whatever happens to the password (question-pages/54).
- Q: How do reviewers get accounts in the first build? → A: One shared reviewer account, created by an owner command; its email and password are in the private repo's README; no sign-up page (question-pages/55).
- Q: With one shared reviewer account, how are the terms and the 13+ confirmation agreed? → A: On each new sign-in, before anything else opens, recorded with its time for that sign-in; constitution 3.1 amended to v1.1.0 (question-pages/55).
- Q: "Set my starting level again" would wipe the demo for every reviewer; what then? → A: The reviewer account has no such button (RQ-363 changed; built in G-07) (question-pages/55).
- Q: If the shared reviewer password leaks, how are signed-in people thrown out? → A: Nothing extra; sign-ins last up to 30 days unless the owner deletes the account (question-pages/55).
- Q: Which tagline does the top bar show? → A: 'grow from what you know' (RQ-309), not the 'read, listen, grow' the first build invented (question-pages/56).

### Combined requirements changed in clarify

From question-pages/55, for the first build:

| RQ | As written | In this spec |
|---|---|---|
| RQ-217 | Only people the owner invites can create an account | Accounts are created only by owner commands: the owner account and one shared reviewer account (FR-010) |
| RQ-360 | The owner can mark an invitation as a reviewer invitation | The reviewer account is marked as the reviewer account when the owner creates it (FR-010) |
| RQ-368 | The README holds one reviewer invitation code, valid for at most 5 sign-ups | The README holds the shared reviewer account's email and password (FR-010) |
| RQ-141, RQ-228 | Terms accepted at sign-up | Terms and the 13+ confirmation accepted at each new sign-in, before use (FR-011) |
| RQ-218, RQ-222, RQ-160, RQ-225 | Sign-up form, invitation uses, sign-up limits | Not in the first build: there is no sign-up (FR-021 withdrawn) |
| RQ-363 (G-07) | "Set my starting level again" replaces the demo ground | The reviewer account has no "Set my starting level again" |

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Sign in as a reviewer and agree to the terms (Priority: P1)

An invited course reviewer finds grove's current link and the reviewer account's email and password in the private repo's README. They open the link on their phone and sign in. Before anything else, grove shows the terms of use and privacy notice with two boxes: "I agree" and "I am 13 or over". Once both are ticked, they land on the reviewer account's grove, see the account's email and a Sign out button in the header, and stay signed in on that device for 30 days.

**Why this priority**: Nothing else in grove can be used or reviewed without signing in; this is the walking skeleton every later goal builds on.

**Independent Test**: With the reviewer account created, a tester signs in, agrees, signs out, signs in again (and is asked to agree again on that new sign-in), and closes and reopens the browser; each step works.

**Acceptance Scenarios**:

1. **Given** the reviewer account exists, **When** someone signs in with its email and password, **Then** a session is created and they are shown the terms with the two boxes before any other page. (RQ-366, RQ-141, RQ-228; constitution 3.1)
2. **Given** a new sign-in that hasn't agreed yet, **When** it requests any page or data other than the terms and Sign out, **Then** it is sent to the terms; **When** both boxes are ticked and sent, **Then** the agreement and the age confirmation are recorded with their time for that sign-in and grove opens. (RQ-141, RQ-228; constitution 3.1)
3. **Given** a signed-in learner, **When** they look at any page, **Then** the header shows the account's email and a Sign out button; **When** they press Sign out, **Then** their session ends on the server and they are on the sign-in page. (RQ-226; constitution 4.7)
4. **Given** a learner who signed in on a device 29 days ago and hasn't signed out, **When** they open grove there, **Then** they are still signed in; after 30 days they must sign in (and agree) again. (RQ-224)
5. **Given** a wrong password or an unknown email, **When** someone signs in, **Then** the answer is the same "wrong email or password" in both cases. (RQ-372)

---

### User Story 2 - My data stays mine (Priority: P1)

A learner trusts that no other account can see or change their grove, that nothing but grove is contacted when they use it, and that signed-out visitors see only the public pages.

**Why this priority**: Grove holds personal data on the owner's computer (Q-01, Q-02, C-04); a leak would end the review and break the law.

**Independent Test**: Automated tests for every server endpoint and every role (signed-out visitor, learner, reviewer, owner), a test that changes IDs in requests, and a browser test that records every network request on every page.

**Acceptance Scenarios**:

1. **Given** a signed-in learner, **When** they request another account's data by changing an ID, **Then** the server refuses. (RQ-155, Q-01)
2. **Given** a signed-out visitor, **When** they open any page but sign-in, password reset or the terms and privacy notice, **Then** they are sent to sign-in. (RQ-162, Q-01)
3. **Given** any page of grove, **When** it loads, **Then** the browser contacts no host but grove's own, and its fonts come from grove. (C-12, Q-02, RQ-331, RQ-367)
4. **Given** any request to grove's server, **When** it is handled, **Then** the server talks to no outside service except Firebase Authentication, and to that only for sign-in, password resets and the owner's account commands. (RQ-181, RQ-367; constitution 4.2, 4.5)

---

### User Story 3 - Get back in after forgetting a password (Priority: P2)

The owner (or, later, any learner with their own account) asks for a reset, gets an email, sets a new password on the reset page the email links to, and signs in. The reviewer account's reset email goes to the address the owner gave it, so only the owner can reset it.

**Why this priority**: Without it, a forgotten password locks an account for good, and the owner has no way to reset passwords by hand (RQ-220 dropped).

**Independent Test**: A tester asks for a reset for an existing account, follows the email, sets a new password and signs in with it; the old password no longer works.

**Acceptance Scenarios**:

1. **Given** an account, **When** its email is entered on the password-reset page, **Then** a reset email is sent, the page says that if the address has an account an email is on its way, and the request is in the security log. (RQ-219, RQ-371, RQ-372)
2. **Given** an email with no account, **When** it is entered on the password-reset page, **Then** the page shows exactly the same answer, and no email is sent. (RQ-372)

---

### User Story 4 - The owner sets up and runs grove safely (Priority: P2)

The owner creates their own account and the shared reviewer account with commands on their computer, writes the reviewer sign-in into the README, and leaves the computer running. Grove and the tunnel start by themselves after a restart, the README always shows the current link, grove is checked every hour, backups are made every hour, and the owner can read a security log, and export or delete an account's data on request.

**Why this priority**: Reviewers can only reach grove if it is running and its link is current (Q-06); the owner must stay the only owner (T-03) and answer data requests (C-04).

**Independent Test**: Run both setup commands on a fresh install; restart the tunnel and time the README update; restart the computer and check that grove comes back with its data; run the export and delete commands for a test account and look for leftovers, including in Firebase.

**Acceptance Scenarios**:

1. **Given** a fresh install, **When** the owner runs the owner setup command with their email, **Then** the owner account exists with the owner and learner roles and its own learner data, and the action is in the security log. (RQ-146, RQ-223, RQ-227, RQ-371)
2. **Given** an owner already exists, **When** the owner setup command is run again for another email, **Then** no second owner is created; no other command or page can make an owner. (RQ-146, RQ-147, RQ-223)
3. **Given** the owner, **When** they run the reviewer setup command with an email and a password that meets the rule, **Then** one account with the learner and reviewer roles exists, a second reviewer account is refused, and the action is in the security log. (RQ-217, RQ-360, RQ-221, RQ-368, RQ-371)
4. **Given** the tunnel restarts and its address changes, **When** 2 minutes have passed, **Then** the README shows the new link. (RQ-364, Q-06)
5. **Given** the owner's computer restarts, **When** it is back up, **Then** grove and the tunnel are running without anyone signing in at the computer, and every change grove had confirmed as saved is still there, even after a power cut. (RQ-125, Q-03)
6. **Given** grove is running, **When** an hour passes, **Then** a backup is written to the second disk and can be read back, and an availability check of the README link is logged. (RQ-180, Q-03, Q-06; constitution 4.12)
7. **Given** someone asks for their data, **When** the owner runs the export command for that account, **Then** all its data is written as JSON; **When** the owner runs the delete command, **Then** the account and all its data are gone from grove and Firebase, and the action is in the security log. (RQ-229, RQ-371; constitution 3.2, 3.3)

---

### User Story 5 - Grove resists guessing and floods (Priority: P2)

Someone who got hold of the link tries to guess passwords, find out which emails have accounts, or send huge requests. Grove refuses calmly and logs what matters.

**Why this priority**: Grove is reachable from the whole internet through the tunnel (R-17, T-01, T-05, T-16).

**Independent Test**: Scripted attempts: 6 wrong passwords in a row, a 101 KB request, and sign-in and reset with known and unknown emails compared answer by answer.

**Acceptance Scenarios**:

1. **Given** 5 failed sign-ins in a row for one email address, **When** a sixth is tried within 15 minutes, **Then** it is refused even with the right password, and the lockout is in the security log. (RQ-156, RQ-371)
2. **Given** any email address, **When** it is used for sign-in or password reset, **Then** the answer (text, status and timing within normal variation) is the same whether or not it has an account, including while it is locked. (RQ-372)
3. **Given** a request larger than 100 KB, **When** it is sent, **Then** it is refused with a clear message, and the server keeps running. (RQ-161, RQ-231; constitution 2.4, 2.5)

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
- The owner's computer restarts or loses power: grove and the tunnel start again by themselves; nothing confirmed as saved is lost. (Q-03)
- The GitHub README can't be updated (network down, token expired): grove keeps running, retries, and logs the failure without the token. (RQ-364; constitution 2.1)
- Firebase is unreachable, or gives an answer grove can't use: sign-in and password reset say plainly that signing in isn't possible right now (never "wrong password", and it doesn't count toward the lockout, FR-020); nothing internal is shown, and already signed-in learners keep working. (RQ-366; constitution 2.5)
- Firebase returns something unexpected or a forged, expired or other-project token: it is rejected. (T-10; constitution 4.5)
- A request is larger than 100 KB: refused with a clear message. (RQ-231, T-07)
- Several reviewers use the reviewer account at the same time: they see and change the same data; the last save wins and nothing is corrupted. (accepted on question-pages/55)
- Someone with the link and the reviewer email types 5 wrong passwords: the reviewer account is locked for 15 minutes for everyone; sessions already signed in keep working. (RQ-156; accepted on question-pages/55)
- The reviewer password leaks: the owner changes it (password reset); sign-ins already made last up to 30 days unless the owner deletes and re-creates the account. (RQ-224; accepted on question-pages/55)
- An account is deleted while someone is signed in to it: their next request is treated as signed out. (RQ-229, RQ-155)
- An older phone where the frosted-glass blur and glows lag: fewer effects when the device asks for reduced transparency or reduced motion. (R-15)
- A device with no Japanese fonts and the bundled font not yet loaded: text shows in the device's sans-serif until it loads. (RQ-331)

## Requirements *(mandatory)*

MUST for must-priority combined requirements, SHOULD for should-priority ones, as in the G-01 feed. Each requirement names the combined requirements (RQ-…) and needs (N-…) it comes from; other sources (C-, Q-, T-, constitution) are added where they shape it. Tests are named after the FR ID and its RQ IDs. A withdrawn FR keeps its number and needs no test.

### Functional Requirements

**Platform and hosting**

- **FR-001** (RQ-125, RQ-180; N-15, N-20, N-16, N-19; C-06): Grove's processing and data storage MUST run on the owner's own computer, reached by learners only through a public relay (a quick tunnel; reduction X-01: a test deployment for invited reviewers), with no ports open at home. A small server with a database stores the data.
- **FR-002** (RQ-125, RQ-180; N-20; Q-03, R-05): Grove and the tunnel MUST start by themselves when the owner's computer starts; a change grove has confirmed as saved MUST survive a restart of grove or the computer, including a power cut.
- **FR-003** (RQ-180; N-20; Q-03; constitution 4.12): Grove MUST write a backup of all data to a second disk every hour, so at most one hour of data is lost if the database is lost.
- **FR-004** (RQ-364; N-18; Q-06): The README of the owner's private GitHub repo MUST show grove's current link; the owner's computer MUST update it by itself within 2 minutes whenever the tunnel's address changes, touching nothing in the repo but the README. Only the current link is ever written: once a newer address is known, an older one is never sent to GitHub again (each write takes the link that is current as it is sent), and the README always ends with the newest link (first-build review, finding 7). The owner's computer MUST also open the README link every hour and log whether grove answered.
- **FR-005** (RQ-38, RQ-23; N-16, N-19, N-05; C-03): Grove MUST run in a current desktop browser and SHOULD work on phones first: a single centred column at most 560 px wide, with no sideways scrolling from 360 px wide up.
- **FR-006** (RQ-181, RQ-367; N-16, N-19, N-20, N-24; C-01): Grove's server MUST NOT call any AI service, and MUST NOT contact any outside service except Firebase Authentication (and GitHub, from the owner's computer's README updater only).
- **FR-007** (RQ-178; N-42, N-06): Grove MUST NOT offer a conversation partner in the first version.

**Accounts**

- **FR-008** (RQ-90, RQ-147; N-16, N-17, N-24): Grove MUST support several accounts, each with its own sign-in and separate learner data. Every account MUST be a learner.
- **FR-009** (RQ-366, RQ-157, RQ-367; N-20, N-18, N-24): Accounts (creation, sign-in, stored passwords) MUST be handled by Firebase Authentication with email and password, reached only from grove's server; passwords are stored hashed by Firebase and never by grove; nobody needs a Google account.
- **FR-010** (RQ-217, RQ-360, RQ-368, RQ-221; N-18, N-20; C-11): In the first build, accounts MUST be created only by owner commands on the owner's computer; there is no sign-up page. Besides the owner's account, the owner MUST be able to create exactly one shared reviewer account (learner and reviewer roles) with an email the owner controls and a password of at least 8 characters with at least one letter, one digit and one symbol; the owner writes its email and password into the private repo's README. Creating the reviewer account MUST be all-or-nothing: grove's account row and the demo (G-07 FR-705) are stored together, and if storing them fails, the Firebase account just made is deleted again, so nothing is left behind and the command can be run again (first-build review, finding 9).
- **FR-011** (RQ-141, RQ-228; N-27, N-28; C-04; constitution 3.1): Each new sign-in MUST agree to the terms of use and privacy notice and confirm being 13 or over before the account can be used; grove records both with their time for that sign-in. Until then, only the terms page, the agreement and Sign out are available.
- **FR-012** (RQ-372; N-24): Sign-in and password reset MUST give the same answer (text, status, and timing within normal variation) whether or not an email address has an account.
- **FR-013** (RQ-224; N-19; constitution 4.7): A sign-in SHOULD last 30 days on that device unless the learner signs out or the account is deleted; a password reset does not end existing sign-ins; the session cookie is random, HttpOnly, Secure and SameSite=Lax, and every state-changing request needs a CSRF token.
- **FR-014** (RQ-226; N-17): Every signed-in page SHOULD show the signed-in account's email and a Sign out button in the header; signing out MUST end the session on the server.
- **FR-015** (RQ-219, RQ-372; N-20, N-24): A forgotten password MUST be resettable by email: the person enters an email, the same answer is shown either way, and an account's address gets a reset email linking to Firebase's password-reset page (the one allowed outside page, C-12).
- **FR-016** (RQ-146, RQ-223, RQ-227; N-18, N-20; T-03): There MUST be exactly one owner, set in grove's settings on the owner's computer (the owner flag on one account in grove's database there). The owner's account SHOULD be created by a setup command on that computer; nobody can become owner through grove. The owner SHOULD also be a learner with their own learner data.
- **FR-017** (RQ-229; N-20; C-04; constitution 3.2, 3.3): People SHOULD ask the owner to export or delete their data (no button for it yet); the owner MUST be able to export one account's data as JSON with one command, and delete one account and all its data, including in Firebase, with one command. The delete command MUST remove the Firebase account first and grove's data after, so that if Firebase can't be reached the command fails with grove's data untouched and can be run again; a Firebase account that no longer exists counts as removed (first-build review, finding 1).

**Security**

- **FR-018** (RQ-155; N-20, N-24; Q-01; constitution 2.3): Every request MUST be checked on the server against who is asking and their role (signed-out visitor, learner, reviewer, owner); no account can read or change another account's data.
- **FR-019** (RQ-162; N-20, N-18; Q-01): Signed-out visitors MUST reach only the sign-in, password-reset and terms-and-privacy pages (and the files those pages need); every other page sends them to sign-in, and every other request is refused.
- **FR-020** (RQ-156, RQ-372; N-20, N-24; T-01): After 5 failed sign-ins in a row for an email address, sign-in for that address MUST be refused for 15 minutes, even with the right password. Failures are counted per address entered, whether or not it has an account, so the lockout doesn't reveal which addresses have accounts. Only a wrong password, or an address with no account, counts as a failure. When Firebase can't be reached or gives an answer grove can't use (including an ID token that fails verification), sign-in and password reset MUST say that signing in isn't possible right now (503 `signin_unavailable`), MUST NOT count it toward the lockout, and log it as `firebase_unreachable` with the reason (first-build review, finding 2).
- **FR-021** *Withdrawn* (RQ-160, RQ-225; question-pages/55): sign-up limits per internet address; there is no sign-up in the first build.
- **FR-022** (RQ-161, RQ-231; N-18; T-07; constitution 2.4, 2.5): A single request body SHOULD be at most 100 KB; anything larger is refused with a clear message, without crashing the server. Whether a request is allowed (its CSRF check and access rule, FR-018, FR-019) MUST be decided before its body is read; a refused request's body is never read: grove answers and closes the connection (first-build review, finding 4).
- **FR-023** (RQ-371; N-18; T-13; constitution 3.6): Grove MUST keep a security log of account creation, sign-ins, failed sign-ins, lockouts, terms agreements, password-reset requests and the owner's actions (setup, exports, deletions): who, when, what. No log grove or its services write (including the system's service log) holds passwords, tokens or request bodies, and entries are deleted after 30 days.
- **FR-024** (RQ-331, RQ-367; N-20, N-24; C-12, Q-02; constitution 4.4, 4.6): The pages MUST NOT load anything from another host: fonts, styles, scripts and images are served by grove, and a content security policy forbids inline scripts and outside sources.

**Terms and privacy**

- **FR-025** (RQ-141, RQ-228, RQ-376; N-27, N-28, N-25, N-43; C-04; constitution 3.4, 3.5): A terms-of-use and privacy page, readable without signing in, SHOULD say: grove is for people 13 and over; learners may only share texts they have the right to share; the suspension and ban rule (a first copyright breach gives a fixed suspension, a second a ban); what data grove keeps and why, for each kind; that Firebase (Google) and Cloudflare process data for grove; that what learners paste into their own AI is governed by that AI's terms; that a learner's own texts get only automatic checks and may contain mistakes; that the reviewer account is shared, so reviewers see each other's activity on it; and that people ask the owner to export or delete their data.

**The look's basics** (values in `docs/middle-steps.md` Appendix A)

- **FR-026** (RQ-306, RQ-312, RQ-334, RQ-335; N-11, N-34): Grove MUST have two looks, Night forest (dark) and Pale birch (light), following the device's setting; they SHOULD use the forest palette and the colour tokens of Appendix A.1.
- **FR-027** (RQ-331, RQ-337; N-34): Text SHOULD use Zen Kaku Gothic New (weights 400, 500, 700) served by grove, falling back to Hiragino Sans, Noto Sans JP, then the device's sans-serif, at the sizes of Appendix A.2; content text sizes are defined relative to a size factor (default 1, range 0.8–1.6).
- **FR-028** (RQ-314, RQ-338, RQ-339; N-34): Content SHOULD sit on rounded, frosted-glass cards with the corner radii, blur, saturation, shadow and glow of Appendix A.3.
- **FR-029** (RQ-316, RQ-340; N-34): Buttons SHOULD be rounded (14 px) and shrink to 97% while pressed; main buttons have the green gradient, text colour and glow of Appendix A.3.
- **FR-030** (RQ-341, RQ-23, RQ-309; N-34, N-19): The layout SHOULD follow Appendix A.3: one column at most 560 px wide with its padding, and a sticky top bar fading from the page colour and blurred 14 px, holding the three-tree logo of Appendix A.5, the app name 'grove' and the tagline 'grow from what you know' (RQ-309, question-pages/56).
- **FR-031** (RQ-314, RQ-339; N-34; R-15): When the device asks for reduced transparency or reduced motion, cards and the top bar SHOULD drop the blur and glows (solid card colours instead), so older phones don't lag.

**Scope statements** (carried by the content of later goals; nothing to build in G-01)

- RQ-24 (N-22): Grove serves adult self-learners. RQ-25 (N-13): Grove works for learners at any level. RQ-163 (N-22): Grove serves students learning alongside a course. In G-01 these mean only that accounts carry no level, course or audience restriction beyond the age rule of FR-011.
- RQ-218, RQ-222 (N-20): sign-up form and invitation uses; not in the first build (question-pages/55), back with open sign-up later.

### Key Entities *(include if feature involves data)*

- **Account**: one sign-in in grove. Firebase identity (its user ID), email, roles (learner always; reviewer or owner as given), created time. Owns that account's learner data (empty in G-01; filled by later goals). In the first build: the owner's account and one shared reviewer account.
- **Role**: signed-out visitor, learner, reviewer, owner. Decides what each request may do (FR-018).
- **Session**: one device's sign-in for an account: random identifier, created and expiry time (30 days), CSRF token, and the time terms and the 13+ confirmation were agreed (empty until agreed). Ended on sign-out or account deletion.
- **Failed sign-in counter**: per email address entered: count of failures in a row and the lockout end time.
- **Security log entry**: time, who (account or address entered), what happened; kept 30 days.
- **Availability check**: time and whether the README link answered; kept 30 days.
- **Settings**: on the owner's computer: the tunnel's current link, and where backups go.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A reviewer can go from the README to the reviewer account's signed-in grove (terms agreed) in under 1 minute on a phone.
- **SC-002**: In the authorisation tests, 0 requests from one account can read or change another account's data, and 0 pages beyond the three public ones can be reached signed out. (Q-01)
- **SC-003**: On every page, 0 network requests go to any host but grove's own. (Q-02)
- **SC-004**: After a tunnel restart, the README shows the new link within 2 minutes; during the review, grove answers at the README link in at least 19 of 20 hourly checks a day. (Q-06)
- **SC-005**: After a restart of grove or the owner's computer, 0 changes that grove confirmed as saved are lost; if the database is lost, at most the last hour is lost, and a restore from backup has been tried once by hand before reviewers are invited. (Q-03)
- **SC-006**: For sign-in and password reset, the answers for an address with an account and one without can't be told apart by text or status. (RQ-372)
- **SC-007**: 100% of the colours, fonts, radii and widths checked on the G-01 pages match Appendix A in both looks.

## Assumptions

- The first build's users are the owner and at most 5 invited reviewers sharing one reviewer account (C-11, question-pages/55); grove isn't open to anyone else yet.
- The reviewer account's email is one the owner controls (e.g. an alias), so its reset emails reach only the owner.
- Learners have a current browser on a phone or desktop and an internet connection; grove is unavailable when the owner's computer is off (PR-p1-129, C-06).
- Firebase Authentication's free tier covers the accounts and sends the reset emails; its password-reset page is the one outside page anyone sees (C-12).
- Learner data beyond the account (texts, ground, progress) arrives in later goals; G-01 gives each account an empty home page in the forest look as the place later goals fill. The reviewer account's demo content comes in G-07.
- Switching the look by hand and changing the text size factor are not in G-01 (the extras are in G-08); G-01 follows the device's setting and uses size factor 1.
- The owner writes the final wording of the terms and privacy notice; the spec fixes what it must say (FR-025).
- Course roles (teachers, classes) and content maintainers are not in the first build.
