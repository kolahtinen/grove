# Prototype records: grove / p1

What the prototype taught, besides the requirements. Used to find needs, in each round's short pass and in phase 2 (also for rejected prototypes).

## Features added that weren't asked for

Also to be listed as implicit requirements in `requirements.md` (pending the first implicit-requirements check).

| Round | Feature | Kept or removed |
|---|---|---|
| 1 | A fourth item state, "learning" (practised but not yet above the learned threshold), between new and learned | kept for now |
| 1 | Reading, listening and chat count as a light review of every known item met (strength goes up a little) | kept; see problems |
| 1 | AI-generated passage sentences are saved and reused in later exercises; pasted texts are saved too (without English) | kept for now |
| 1 | Per-sentence "n new" badge and a passage counter ("29 words · 1 new (3%)") to make i+1 visible | kept for now |
| 1 | "I understood it" button for each new item after a passage, which starts it in practice | kept for now |
| 1 | Click any word for an inspector panel: meaning, status, strength, phrases and patterns it's part of; add unknown words from there (with "Ask AI" for the meaning) | kept for now |
| 1 | Listening mode blurs the text (click to reveal) and plays the whole passage; "Show / hide English" toggle | kept for now |
| 1 | Multiple choice asks for a word's meaning inside a sentence, not on its own (my reading of PR-p1-10) | kept for now |
| 1 | The progress view compares each skill's share of practice with the share set on the goal sliders | kept for now |
| 1 | Locked items (parts not learned) shown with dashed outlines on the map | kept for now |
| 1 | Reset buttons: "Reset to demo learner" and "Start from zero" | prototype only |
| 1 | Write-with-a-pattern checks for the pattern with a rule (regex) and lists words not in the tree | kept until AI correction |
| 2 | The fix-it message lists the exact sentences and words that broke the rules | kept for now |
| 2 | Prompts ask the AI to list inflected forms of known words ('inflections'); grove learns those forms so they stop counting as unknown | kept for now |
| 2 | New words from an accepted passage, grammar example or topic go straight into the tree (status new), with the AI's meaning | kept for now |
| 2 | AI grammar explanations are saved with the pattern; their examples are reused in exercises | kept for now |
| 2 | Writing exercise: the AI's verdict (correct + uses the pattern) grades it; grove's own pattern check is only a hint | kept for now |
| 2 | With an API key, the fix-it message is sent automatically, up to 3 tries | kept for now |
| 2 | Removed the speaking slider (no activity left after chat was dropped) | default; comes back with chat |
| 3 | Character and place names have their own list and never count as new words | kept for now |
| 3 | A 'Drill this' button wherever a known word appears (inspector, dictionary, map) – my reading of 'ground words can be marked later' | kept for now |
| 3 | Continue weighs reading and listening double, my reading of 'more focus on input' (PR-p1-37) | kept for now |
| 3 | Meeting a grammar pattern in a text still gives it a light review | kept for now |
| 3 | The CEFR thresholds (A1 = 250, A2 = 750, B1 = 1500, B2 = 3000, C1 = 6000, C2 = 10000 known words) and the hours roadmap are my rough estimates | needs your review |
| 3 | Five preset series ideas to choose from, plus your own topic | kept for now |
| 3 | Input time per text is capped at three times its estimated length and at least 30 seconds | kept for now |
| 3 | Sample texts (an episode, a dialogue, a choose-your-path story) in the demo library so the reader works before any AI content | prototype only |
| 3 | The 'Read & listen' and 'Chat' views became 'Library'; 'Words & grammar' became 'Dictionary' | kept for now |

| build 2026-10-20 | Accounts, the shared bank and library, the owner's view, the starting level, Expand your grove, easier texts, a week's worth, tolerance margins: see PR-p1-237…275 (implicit requirements) | asked (question-pages/40) |

## Rejected, and why

| Round | What | Why |
|---|---|---|
| 1 | Smallest-possible first prototype (PR-p1-21, first version) | You wanted roughly every feature tried in round 1. |
| 1 | Unlocking that restricts content | Unlocking is only shown on the map; any content may appear. |
| 1 | Re-locking items when a part fades | Dependants are marked "at risk" instead and stay unlocked. |
| 1 | Learner data kept only in the browser | Moved to a JSON file on the server, ahead of accounts. |
| 1 | AI faked in the prototype | You'll set an API key; offline content stays only as a fallback. |
| 1 | Native mobile app, social features | Not now; a phone-friendly web page later. |
| 1 | Teacher features in round 1 | Self-learners first; teachers will create item sets later. |
| 1 | Chat partner correcting mistakes inline | Not picked for the conversation partner. |
| 2 | Paid AI API as the normal way to get AI content | First version must cost nothing beyond Claude Pro; the API stays only as an option (PR-p1-27). |
| 2 | Conversation partner in v1 | Copy-paste every turn is too clumsy. A one-time role prompt plus pasting the chat back is noted for later. |
| 2 | Paid tier in v1 | No paid tier now; maybe later. |
| 2 | Static page with data only in the browser | You keep the small server and host it yourself or for free. |
| 2 | Lenient handling of rule-breaking AI answers (show anyway / drop sentences) | You chose a fix-it prompt instead. |
| 2 | Built-in (offline) passage generator | AI is required for the main flow (PR-p1-28). |
| 3 | Narrow reading; interests list feeding every prompt; texts about my own life; emoji next to words | Not picked on page 05. |
| 3 | Learned = met N times in understood texts | Dropped after page 06: no encounter route; encounters are only counted. |
| 3 | Levels by input hours or ground size in plain numbers; hiding English by a simple switch | CEFR labels estimated from the ground were chosen. |
| 3 | Ground words fading | Ground is permanent; you can mark a word for drilling again yourself. |
| 3 | Different pitch/speed per dialogue speaker | Speaker names and colours only. |
| 3 | A fixed 95% or a manual 95/98% choice | The share moves with your ratings. |
| implicit check | One learner per server, no accounts (PR-p1-43) | Dropped on page 14; why asked on page 15 where it touches other requirements. |
| implicit check | 'Drill this' button (PR-p1-46) | Dropped on page 14; why asked on page 15 where it touches other requirements. |
| implicit check | Names list (PR-p1-47) | Dropped on page 14, restored on page 15: without it names count as new words (PR-p1-06). |
| implicit check | 0.9× default speech speed (PR-p1-49) | Dropped on page 14; why asked on page 15 where it touches other requirements. |
| implicit check | 'Continue' weighs input double (PR-p1-52) | Dropped on page 14; why asked on page 15 where it touches other requirements. |
| implicit check | Most-met words as drilling candidates (PR-p1-86) | Dropped on page 14; why asked on page 15 where it touches other requirements. |
| implicit check | Reset buttons (PR-p1-69) | Dropped on page 14; why asked on page 15 where it touches other requirements. |
| implicit check | Demo sample texts (PR-p1-70) | Dropped on page 14; why asked on page 15 where it touches other requirements. |
| 4 | Starting level from a pasted text you understand (all its words join the ground) | Not wanted (page 21); no reason given. |

## Technical problems and dead ends

| Round | What happened | What it shows |
|---|---|---|
| 1 | JavaScript's `\b` word boundary doesn't treat å, ä, ö as letters, so pattern detection failed on words like "på" and "sjön"; replaced with Unicode-aware boundaries. | Swedish (and any non-English) text needs Unicode-aware tokenising everywhere. |
| 1 | Seven seed sentences counted past-tense verbs (lagade, åt, var…) as unknown words until the lexicon also stored past forms. | Counting "new" for i+1 needs every inflected form linked to its lemma; a word list isn't enough. |
| 1 | "var" is both "was" and "where"; the seed content avoids it. Matching by surface form can't tell homographs apart. | Real or AI content will be miscounted unless words are matched in context. |
| 1 | With patterns counted as items, many sentences have 2+ new things. With 61 seed sentences, an offline passage for a less-known topic had only 3 sentences until the demo learner knew more. | Strict i+1 (≤1 new per sentence and ~5% per passage) needs a large content bank or generated text. |
| 1 | One reading pass refreshed fading items straight back to "learned", because meeting an item resets its clock. | We need to decide how much reading or listening counts as review compared with active recall. |
| 1 | Phrases match only the listed forms ("tycker om", not "tyckte om"). | Phrases need inflection too, or must be matched more loosely. |
| 1 | The live AI path is untested: no API key on this machine. Without a key the server answers 503 and the app falls back to offline content, which was tested. | Round 2 must run once with `ANTHROPIC_API_KEY` set and check that AI passages really respect i+1 (the "n new" badges show it). |
| 1 | Text-to-speech uses the operating system's voices; there was no way to hear audio in the headless test, and a Swedish voice may not be installed. | Listening quality depends on the learner's device unless the server provides audio. |
| 1 | In chat, words the learner writes count as review even if used wrongly. | Free production needs checking before it counts. |
| 2 | The check rounded 5% of a 29-word text down to 1 new word while the prompt allowed 1–2; changed to round up. | Rules in the prompt and in the check must be written once and shared, or the AI gets rejected for following the prompt. |
| 2 | The page's 'n new' counter also counts grammar patterns and phrases, but the check (and the AI) only count words, so an accepted passage can show '3 new (10%)'. | We must decide what counts as 'new' for i+1: words only, or words + phrases + patterns. The AI can't be held to our pattern list. |
| 2 | Seed words the learner hasn't started count as new, even if they are very basic (e.g. 'idag', 'äter' for the demo learner). Easy to trip over when writing test answers by hand; an AI given the known list should avoid them. | The known-words list in each prompt grows with the learner; for a big vocabulary the prompt will get long. |
| 2 | Tested only with hand-written answers pasted in headless Chromium; no real AI answers yet. | Round 3 should paste real answers from Claude/ChatGPT and count how often a fix-it round is needed. |
| 2 | The clipboard button needs a secure page (localhost or https); there is a fallback, but on plain http hosting copying may fail. | Hosting needs https. |
| 3 | Character names (Lisa, Omar) counted as unknown words and broke the i+1 check. | AI content needs a names list; grove should never count names as vocabulary. |
| 3 | One hour of input is ~3,000–5,000 words; a 3-text part already makes a ~4,000-character prompt, and each part repeats the whole known-words list. | Prompts will grow with the ground; long-term, prompts may need a compact known-words format. |
| 3 | With 95% known, one hour of input brings roughly 100–150 new words to mark at once. | The marking screen may get long; worth testing with real packages. |
| 3 | Seed words the demo learner never met (e.g. 'idag', 'tåg') count as new, so even the sample texts have several new words; I didn't enforce i+1 on hand-written samples. | Starting vocabulary for a new learner needs deciding (placement or a first package). |
| 3 | Changing the learning model (ground/drilling instead of strength for everything) replaced the stored data shape; old learner data is reset to the demo. | Real data migrations will matter once there are real users. |
| 3 | Real AI answers still untested; all tests used hand-written JSON pasted in headless Chromium. Audio, highlighting and looping can't be heard in a headless test. | Next round should run a real package through Claude Pro and listen to the reader. |

| build 2026-10-20 | An AI meaning for a word the dictionary already had was skipped instead of checked, so a wrong meaning ('glas = window') never reached the review list. | Fixed: only true duplicates (same meaning) are skipped. Found by the API test. |
| build 2026-10-20 | The first level rule counted all words up to a level together, so an A2 learner showed as B1 (78 of 97 words 'up to B1'). | Fixed: each level must pass on its own words. |
| build 2026-10-20 | The level shown on Home used the old word counts (A1 = 250), so an A2 learner with 78 words showed as Pre-A1. | The X-p1-04 rule now applies (PR-p1-64 note). |
| build 2026-10-20 | Tested with 31 API checks (accounts, roles, bank, library, review, reports, suspension, ban, limits) and a full browser run (sign-up, starting level, reading test, easy read, sharing, Expand, owner view, report); no page errors. Real AI answers still untried. Screenshots in prototypes/p1/screenshots/. | |
| build 2026-10-20 | Not built: other online dictionaries (PR-p1-135), open text collections (PR-p1-136), sharing pasted texts in the app (PR-p1-138), the AI's level suggestion for new patterns (PR-p1-124); Wiktionary and the Kelly-list aren't imported (seed words stand in). | Sources and licences to check first. |

## Possible user needs

| Round | [Who] needs [what] so that [why] | From |
|---|---|---|
| 1 | A learner needs new material to contain only one new thing at a time so that they can understand it without a dictionary | PR-p1-06 |
| 1 | A learner needs to see how much of a text they already know so that they can choose texts at the right level | PR-p1-05, PR-p1-06 |
| 1 | A learner needs to learn through topics they care about so that they stay motivated | PR-p1-05 |
| 1 | A learner needs to turn their own texts into study material so that they learn the words they actually meet | PR-p1-05, PR-p1-13 |
| 1 | A learner needs words from conversations kept for later so that nothing new is lost | PR-p1-15 |
| 1 | A learner needs to see grammar inside real sentences so that they notice patterns without long explanations | PR-p1-07, PR-p1-16 |
| 1 | A learner needs to hear every sentence so that they can train listening and pronunciation | PR-p1-04, PR-p1-22 |
| 1 | A learner needs to see which items are fading so that they can review before forgetting | PR-p1-12 |
| 1 | A learner needs to see which phrases and patterns are at risk because a part is fading so that they know what to shore up | PR-p1-08, PR-p1-12 |
| 1 | A learner needs to see their knowledge grow so that they feel progress | PR-p1-09, PR-p1-17 |
| 1 | A learner needs to tell the app which skills matter to them so that practice matches their goals | PR-p1-04 |
| 1 | A learner needs to choose the activity themselves so that they're never forced into something they don't want right now | PR-p1-23 |
| 1 | A learner needs a streak and a days-studied count so that they keep a daily habit | PR-p1-17 |
| 1 | A learner who isn't a beginner needs to mark what they already know so that they don't start from zero | PR-p1-02 (gap: not in the prototype) |
| 1 | A learner needs their progress saved outside one browser so that they can switch devices | PR-p1-20 |
| 1 | A learner needs feedback on what they write and say so that they can fix mistakes | PR-p1-15, PR-p1-18 |
| 1 | A teacher needs to create item sets for a class so that students practise course material | PR-p1-01 |
| 1 | A learner needs good default content for free so that they can start without paying | PR-p1-14 |
| 1 | A learner needs to learn more than one language so that grove can keep serving them | PR-p1-03 |
| 2 | A learner needs to use AI help without paying for an API so that grove is free to use with the AI they already have | PR-p1-24, PR-p1-25 |
| 2 | A learner needs to use whichever AI chat they already have so that they aren't tied to one provider | PR-p1-25 |
| 2 | A learner needs grove to reject AI material that's too hard and say how to fix it so that everything stays at their level | PR-p1-26, PR-p1-06 |
| 2 | A learner needs feedback on their own sentences so that they learn from mistakes | PR-p1-15, PR-p1-18 |
| 2 | A learner needs grammar explained in plain words with examples they can read so that patterns make sense | PR-p1-15, PR-p1-16 |
| 2 | A learner needs copy-paste to take as few steps as possible so that AI help doesn't feel like a chore | PR-p1-25 |
| 2 | The owner needs to run grove at no cost so that a first version can exist without a budget | PR-p1-24, PR-p1-20 |
| 2 | A learner without any AI needs to know that reading needs one so that they aren't stuck | PR-p1-28 |
| 3 | A learner needs to understand why input works so that they trust the method and keep going | PR-p1-39 |
| 3 | A learner needs stories that continue so that the same words come back naturally and they want to read on | PR-p1-29, PR-p1-31 |
| 3 | A learner needs to say how much they understood so that texts stay at the right level | PR-p1-33, PR-p1-06 |
| 3 | A learner needs to choose which words to drill so that practice time goes only to words they struggle with | PR-p1-36, PR-p1-40 |
| 3 | A learner needs to see their hours of input and an estimated level so that they feel progress that isn't about drills | PR-p1-35 |
| 3 | A learner needs to listen before reading, slow down and repeat sentences so that they train their ear | PR-p1-34 |
| 3 | A learner needs to look up any word they've met, with the sentence they met it in, so that they can refresh it in context | PR-p1-41 |
| 3 | A learner needs to get about an hour of material with as few copy-pastes as their AI allows so that preparing input doesn't take over | PR-p1-30 |
| 3 | A learner past the beginner stage needs English to disappear so that they think in Swedish | PR-p1-32 |
| 3 | A learner needs comprehension questions so that they can check they followed the text | PR-p1-32 |

