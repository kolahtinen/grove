# grove p1: build 2026-10-20, implicit requirements (asked in Claude Code)

The build of p1 (accounts, shared bank and library, owner view, starting level, Expand your grove, easier texts, a week's worth, tolerance margins) added 39 behaviours no requirement asked for. They were listed in chat; one question followed.

**Question:** which to drop, and which to leave undecided? Everything not named is kept. Options: keep all 39 · not sure yet.
**Answer:** not sure yet: all stay 'implicit: undecided' (left out of the combined list until decided).

- PR-p1-237 (Accounts): A password needs at least 8 characters.
- PR-p1-238 (Accounts): Each invitation code works once.
- PR-p1-239 (Accounts): The owner signs up with the email set in grove's settings, without an invitation.
- PR-p1-240 (Accounts): A sign-in lasts 30 days on that device.
- PR-p1-241 (Accounts): At most 10 sign-ups an hour from one internet address.
- PR-p1-242 (Accounts): The page header shows the signed-in email and a Sign out button.
- PR-p1-243 (Accounts): The owner is also a learner, with their own learner data.
- PR-p1-244 (Accounts): The terms of use say: 13 and over; share only texts you may share; the suspension and ban rule; what data is kept and why; ask the owner to export or delete your data.
- PR-p1-245 (Accounts): Learners ask the owner to export or delete their data (no button for it yet).
- PR-p1-246 (Shared bank): Each account can add at most 100 new bank entries a day.
- PR-p1-247 (Shared bank): A single paste or upload is at most 100 KB.
- PR-p1-248 (Shared bank): The dictionary check counts a meaning as agreeing when it shares a content word with the dictionary's meaning.
- PR-p1-249 (Shared bank): A word with the same meaning as an entry that's already checked isn't sent again; a different meaning is checked.
- PR-p1-250 (Shared bank): Your rejected entries appear on Home, with 'Use the correction' (or 'Delete it') and 'Keep mine, marked rejected'.
- PR-p1-251 (Shared bank): Your own unchecked words carry an 'unchecked' tag in the word inspector.
- PR-p1-252 (Shared library): A shared text counts as checked only when every word in it is a checked bank entry or a character name.
- PR-p1-253 (Shared library): A shared text's level is the highest CEFR level among its words.
- PR-p1-254 (Shared library): The shared library shows texts up to one level above yours, with 'show all levels' to see the rest.
- PR-p1-255 (Shared library): 'Add to my library' copies a shared text into your own library.
- PR-p1-256 (Shared library): After new content arrives, you can tick which texts to share and whether your name shows.
- PR-p1-257 (Shared library): Report reasons are copyright, wrong or offensive, with a note.
- PR-p1-258 (Owner): The owner's review list shows shared texts first, then entries.
- PR-p1-259 (Owner): The owner can reject an entry with a corrected meaning, or (with none) offer to delete it.
- PR-p1-260 (Owner): The owner's batch review prompt lists the entries and asks the AI for {verdicts: [id, approve or reject, correction]}.
- PR-p1-261 (Owner): The owner sees the accounts with their strikes, suspensions and bans, but no learning progress.
- PR-p1-262 (Owner): The owner sees the last 30 bank changes.
- PR-p1-263 (Owner): The suspension after a first copyright breach lasts exactly 30 days.
- PR-p1-264 (Starting level): A new account goes straight to the starting level, after the welcome.
- PR-p1-265 (Starting level): The starting check shows a sample of 30 of the level's words.
- PR-p1-266 (Starting level): The reading test has four texts (A1, A2, B1, B2); your level is the highest one you rated 'most' or 'everything'.
- PR-p1-267 (Starting level): Grammar patterns at or below the starting level count as known (with a long review interval).
- PR-p1-268 (Starting level): Home has a 'Set my starting level again' button.
- PR-p1-269 (Starting level): The level estimate: a level counts when it and every level below have 80% of their own words in the ground.
- PR-p1-270 (Expand your grove): Expand shows the next 20 most common new words plus 3 words you already know.
- PR-p1-271 (Expand your grove): Expand is offered after three texts in a row rated 'everything', or every 2 hours of input, at most once an hour.
- PR-p1-272 (Easier texts): In a package of 4 or more texts, the last dialogue (or the last text) is an easy read.
- PR-p1-273 (Easier texts): 'Get an easy read' asks for one dialogue made only of known words, on a topic you choose.
- PR-p1-274 (Content): 'A week's worth' asks for 7 times the chosen mix, pasted back part by part.
- PR-p1-275 (Listening): With no Swedish voice on the device, grove says so once and doesn't read aloud.
