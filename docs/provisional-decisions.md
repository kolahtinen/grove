# Provisional decisions, 2026-10-27

The owner asked me (Claude) to work alone for about an hour: decide the open questions on the owner's behalf from everything said so far, research best practices for the problems ahead, and keep it all in this separate document for a long confirming session afterwards. **Nothing here is in the specs yet.** Each decision is marked:

- **Agreed by research**: already decided by the owner; the research supports it (confirm quickly).
- **Provisional**: my decision on the owner's behalf; confirm, change or reject.
- **Needs you**: I couldn't decide it well alone; a recommendation is given.

Each one says what it would change (spec, requirement) if confirmed. Sources are listed at the end, by number. Most are secondary write-ups found by web search, not checked against the primary papers; the numbers are indicative.

## Summary

| ID | Decision | Mark |
|---|---|---|
| PD-01 | Sessions: Review first, then a text, then Master | Agreed by research |
| PD-02 | Reading speed: 100 words a minute from B1, 70 below | Provisional |
| PD-03 | Listening: default speech 0.9× below B1 | Provisional |
| PD-04 | By skill: Short 90–94% known, Medium the target (95%), Long 98% or more | Provisional |
| PD-05 | Session summary without streaks or goals to fail | Provisional |
| PD-06 | Empty and edge states for sessions | Provisional |
| PD-07 | Tiles: accessible disclosure buttons; focus moves to the opened panel | Provisional |
| PD-08 | Icon-only tiles: keep them, add names for screen readers | Needs you |
| PD-09 | ☰ menu: fine for four rarely used items | Agreed by research |
| PD-10 | Tap targets at least 44 px | Provisional |
| PD-11 | Reduced motion: tiles open without animation | Provisional |
| PD-12 | Palette 14, adjusted to pass contrast (AA) | Provisional |
| PD-13 | Word colours: To remember teal-green with a dotted underline; fallen words plain | Provisional |
| PD-14 | Right, wrong and Beta colours from the same palette | Provisional |
| PD-15 | The oak logo and animation use palette 14 | Provisional |
| PD-16 | Terms: one section per screen, 3 s unlock, one Agree; the version is stored | Provisional |
| PD-17 | Library: browse by topic, filter by level | Provisional |
| PD-18 | Library now: the owner's lessons only, published from the owner's own texts | Provisional |
| PD-19 | Learner sharing later needs a notice-and-action report (EU DSA) | Provisional (for later) |
| PD-20 | AI-written texts: keep the copyright check; no EU ruling yet | Provisional |
| PD-21 | Starting texts: five texts A1–C1, about 120 words, stop below 90% known | Provisional |
| PD-22 | A 5-word spot check after each starting text | Needs you |
| PD-23 | Starting texts written in advance, like the demo | Provisional |
| PD-24 | Deploy on the quick tunnel; a named tunnel later | Agreed by research |
| PD-25 | Flaky browser tests: each test gets its own learner | Needs you |
| PD-26 | Probe sizes: keep the defaults unless Claude or round D disagree | Provisional |
| PD-27 | Order of work inside the new Home | Provisional |

---

## Sessions (G-09)

### PD-01 · Sessions: Review first, then a text, then Master — *Agreed by research*

**Decided** on question-pages/75 (2). **Research:** retrieval practice before new material tends to *help* learning the new material (the "forward testing effect", reliably replicated in laboratory studies [1]); one study series reported the opposite when the old and new material were closely related [2], which isn't grove's case (reviewed words and a new text overlap only a little). Spacing works over days, not minutes [3], which G-04's schedule already does. **Nothing to change.**

### PD-02 · Reading speed for planning — *Provisional*

**Question:** is 100 words a minute right for every learner? **Research:** most L2 readers in extensive-reading studies start below 100 words a minute; 200 is a common goal and 250 the fluent target [4]. Learners read at a half to a third of their first-language speed [4]. **Decision:** plan reading at **100 words a minute from B1 up and 70 below B1** (the learner's level is known, G-04 FR-414). The owner chose "the first guess" on question-pages/75 (1); this is a small refinement inside it, not learning per learner. **Changes:** G-09 FR-905. *If you'd rather keep one number, keep 100.*

### PD-03 · Listening speed — *Provisional*

**Research:** a slightly slower voice (about 98 words a minute against 116) helped young EFL learners; a much slower one (58) didn't [5]; another study found natural speed better over a term [5]. **Decision:** keep the learner's speed slider (G-05 FR-503), but start it at **0.9× for learners below B1** and 1× from B1. Plan listening at 80 words a minute as decided. **Changes:** G-05 FR-503's starting value.

### PD-04 · Short, medium and long in By skill — *Provisional*

**Question:** what share of known words should each form aim at? The owner said long has the highest share and short the lowest (question-pages/74, 8). **Research:** 95% known words gives minimal comprehension, 98% adequate comprehension without help [6]; below 90% few learners understand [6]. Extensive (long, easy) reading works best when nearly everything is known; short intensive reading can be harder with support. **Decision:** Short picks texts at **90–94%** known (intensive: more new words, the word menu at hand), Medium the learner's **target share** (95% by default, G-02), Long **98% or more** (fluency: read a lot, easily). If no unread text is in the band, the nearest is used and the session says so. **Changes:** G-09 FR-906.

### PD-05 · The session summary — *Provisional*

**Research:** Duolingo found that learners with the most ambitious daily goal were the *least* likely to keep practising, and changed its streak so one lesson a day counts [7]. **Decision:** the summary shows minutes, texts read, words reviewed and words that fell, plus "days practised this week" (a count, never a lost streak). No daily goal to fail. **Changes:** G-09 FR-904.

### PD-06 · Empty and edge states — *Provisional*

**Decision** (fills gaps in G-09's edge cases):
- Nothing due, no unread texts: Practise offers New texts and plans Master and re-reading of the oldest read text.
- A text that doesn't fit: the next shortest; none fits → Review and Master only, and the session says "no text fits in 3 minutes".
- A session in progress when the learner gets new texts: the plan doesn't change (the decision on question-pages/75, 3).
- The reviewer account (shared): one session at a time; the last started wins.
**Changes:** G-09 Edge Cases.

## Home and navigation (G-09)

### PD-07 · How the tiles work for keyboards and screen readers — *Provisional*

**Research:** the W3C's disclosure pattern: the tile is a button with `aria-expanded` true or false; Enter and Space open it [8]. Focus is normally left on the button, but the W3C's own card example moves it on click [8]; in grove the opened panel sits after the whole row, not right after the tile, so a screen-reader user would otherwise have to search for it. **Decision:** each tile is a button with `aria-expanded`; opening moves focus to the panel's title; Esc or ✕ closes it and returns focus to the tile; Tab order follows the grid. **Changes:** G-09 FR-901.

### PD-08 · Icons without words on the tiles — *Needs you*

**Research:** usability research consistently finds icons without text labels ambiguous; only a few icons (home, search, print) are widely recognised; adding text labels fixed known failures [9]. **The owner asked** for icons only (question-pages/74, 11), and tapping a tile shows its title, so a wrong guess costs one tap. **Recommendation:** keep icon-only tiles as asked, with accessible names (screen readers say "Practise for X min"), and test with one new person before the deploy; if they hesitate, add a one-word label under each icon. *Alternative:* labels from the start. Pictures: `reviews/2026-10-26-home-v2/p14-grid.png` (icons only) and `p14-grid-labels.png` (one word under each icon).

### PD-09 · The ☰ menu — *Agreed by research*

**Research:** hidden (hamburger) navigation is found less often and makes tasks slower than visible navigation [10]. That cost matters for main navigation; grove's main navigation is the visible tile grid, and the menu holds only Account, Settings, Help and Sign out, which are rarely needed. **Decision:** keep it; the button's accessible name is "Menu". **Nothing to change.**

### PD-10 · Tap targets — *Provisional*

**Research:** WCAG 2.2 asks for at least 24 × 24 px targets (2.5.8, AA) [11]; phone guidelines use 44 px. **Decision:** tiles are far bigger; the ☰ button, ✕, chips and minute choices are at least 44 × 44 px. **Changes:** G-09 FR-901, FR-902.

### PD-11 · Reduced motion — *Provisional*

**Research:** respect `prefers-reduced-motion`; replace motion with an instant change rather than removing feedback [12]. **Decision:** with reduced motion, tiles open and close instantly; the session's progress bar doesn't slide; the oak animation shows its still frames (as G-08 FR-803). **Changes:** G-09 Edge Cases (already there), FR-901.

## The look (G-09 FR-912, FR-913)

### PD-12 · Palette 14, adjusted for contrast — *Provisional*

**Checked** every text colour against its background with the WCAG formula (4.5:1 for text, 3:1 for large text) [11]. Three of palette 14's chosen colours fail as chip text:

| Colour | As chosen | Ratio on cards | Adjusted | Ratio |
|---|---|---|---|---|
| Light muted text | `#74706A` | 4.21 | `#6D6A64` | 4.6 |
| Light Discover | `#C08552` | 2.67 | `#92592C` | 4.87 |
| Light Review | `#8C5A3C` | 4.93 | `#74432C` (keeps the step) | 6.96 |
| Light Master | `#4B2E2B` | 10.41 | unchanged | 10.41 |
| Dark Discover | `#E3A46E` | 7.81 | `#F0C28F` (keeps the step) | 10.22 |
| Dark Review | `#C27A52` | 4.94 | `#DE9A66` | 7.11 |
| Dark Master | `#9C5745` | 3.08 | `#CF7A5E` | 5.26 |

Darkening only the failing ones would make Discover and Review almost the same brown, so each trio was re-spaced: still warmer and darker from Discover to Master. **Trade-off:** in light mode the three browns are closer than chosen; the icons (sprout, circle arrow, mountain) carry the difference. Picture: `reviews/2026-10-26-home-v2/p14-modes-aa.png` (compare `p14-modes-final2.png`, B). The dark banner `#2E5A40` keeps white text at 6.6:1; the chips on it stand out less (2.1:1), which is allowed (they aren't controls). **Changes:** G-09 FR-913.

### PD-13 · Word colours in texts — *Provisional*

**Problem:** G-04 FR-413's word colours (a blue for To remember, others for fallen words) come from the old palette and the blue clashes with greens and browns; after addendum 003 only To remember and "fallen" are left. **Research:** colour alone mustn't carry meaning (WCAG 1.4.1) [11]. **Decision:** To remember words in teal-green `#2E6B5E` (light, 5.3:1) / `#7CC2B0` (dark, 8.1:1) **with a dotted underline**; fallen words (in the ground) plain text like any known word, since the ground is "known" (the earlier colours for "fell from To read" etc. are dropped). New words stay as G-03 marks them. **Changes:** G-04 FR-413 (rewrite), G-09 FR-913.

### PD-14 · Right, wrong and Beta — *Provisional*

**Decision:** right `#3C7738` / dark `#8FCB7E`; wrong the owner's reddish `#A14646` / dark `#E07A6E`; the Beta badge in Review's chestnut `#74432C` / dark `#DE9A66`. All pass 4.5:1 on cards. **Changes:** G-09 FR-913, G-08 FR-805's colours.

### PD-15 · The oak — *Provisional*

**Decision:** the oak logo and animation (question-pages/65) take palette 14: trunk and branches in bark `#4B2E2B` (dark `#C9A27E`), leaves in the accent greens, the falling leaf in Discover's caramel; flat shapes, a lighter warm side and a darker cool side as decided there. **Changes:** G-08 when the oak is built.

## Terms (G-09 FR-911)

### PD-16 · Reading the terms — *Provisional*

**Research:** an online agreement holds when the notice is clear and the person takes a clear action that says it means agreement; courts have rejected sign-up pages that never said clicking meant accepting [13]. Finland and Sweden both set the GDPR age for a child's own consent at 13 [14], matching grove's 13+. **Decision:** as specified (one section per screen, Next after 3 s, one Agree), plus: the Agree screen says in words "By pressing Agree you confirm you are 13 or over and agree to the terms of use and privacy notice", links to the full terms on one page, and has Back; grove stores the **terms version** with the agreement, so a later change can ask again. **Changes:** G-09 FR-911, G-01 data (agreement version).

## Texts and the library

### PD-17 · Browsing the library — *Provisional*

**Pull between two answers:** question-pages/64 (8) said "library page by level"; question-pages/74 (10) said the library belongs with topics. **Decision:** both: in Texts, each topic lists its library texts, with a level filter (A1…C1, default the learner's level); a topic with no library texts shows none. **Changes:** G-09 FR-909, the library spec.

### PD-18 · The library for 1 November — *Provisional*

**Decided earlier:** only the owner's lessons now; learner sharing after 1 November (question-pages/64, 16). **Decision:** the owner makes lessons with their own AI like any learner, then presses **Publish to library** on a text (owner only); published texts appear for every learner under their topic, read-only, marked "grove lesson" (no Beta badge), with the meanings they were accepted with. Unpublish removes it for new readers. **Changes:** a small library spec (G-10) after the Home.

### PD-19 · Before learners can share — *Provisional (for later)*

**Research:** under the EU Digital Services Act, every hosting service must let anyone report illegal content, confirm receipt, decide quickly and tell the outcome [15]; small services are spared the transparency reports but not, as far as found, the notice handling [15]. **Decision:** when learner sharing comes, Report on a shared text becomes a proper notice: receipt, the owner's decision and the reason go back to the reporter. Noted for the library spec; nothing now.

### PD-20 · AI-written texts and copyright — *Provisional*

**Research:** no EU court has ruled on AI output yet; the pending case (C-250/25, Like Company v Google) is about chatbots reproducing protected text, expected late 2026 at the earliest [16]. **Decision:** keep the own-text copyright check (G-03 FR-318); the owner's lessons are AI-written fresh texts on a topic, which is low risk; revisit when C-250/25 is decided. **Nothing to change.**

## Starting texts (O-04)

### PD-21 · Five starting texts — *Provisional*

**Decided earlier:** ready texts A1–C1, getting harder; tap unknown words; untapped words go to the ground, tapped ones become leaves (question-pages/64, 4). **Research:** levels are roughly <1,500 words at A1, 1,500–2,500 at A2, 2,750–3,250 at B1, up to 4,500 at C1 [17]; below 90% known words few readers understand [6]; LingQ uses the same "untapped means known" rule when the page is turned [18]. **Decision:** five texts (A1, A2, B1, B2, C1), about 120 words each, each on an everyday topic; a word already met in an earlier starting text isn't asked again; after any text where the learner tapped more than 10% of the words (below 90% known), grove suggests stopping there ("this level is your edge"); "I'm a complete beginner" skips them all. **Changes:** G-06 rewrite (FR-601…610).

### PD-22 · A spot check after each starting text — *Needs you*

**Research:** self-reports overestimate: learners who said they knew a word could define only about half of them in one study [19]. **Recommendation:** after each starting text, ask the meaning of 5 untapped words (multiple choice, as Let it fall); if 2 or more are wrong, those wrong ones become leaves and grove says "you may know fewer of these than it seems; we'll be careful". Costs about 30 s a text. *Alternative:* no check (simpler; the ground may hold words the learner doesn't really know, which would make texts a bit harder than planned).

### PD-23 · Who writes the starting texts — *Provisional*

**Decision:** written in advance like the demo (G-07): Claude drafts the five texts from Kelly-list words of each level, the build checks each word's level and meaning (the word list, then checked by hand as for the demo, RQ-399), and the owner reads them once. **Changes:** G-06 plan.

## Deploy and process

### PD-24 · The tunnel — *Agreed by research*

**Research:** Cloudflare's quick tunnels have no uptime guarantee, a random address that changes on restart, and are meant for trying things out; production should use a named tunnel [20]. **Decision:** keep the quick tunnel for the review (already planned: the README shows the current link, G-01 FR-004); a named tunnel needs a domain and is for after the review. **Nothing to change.**

### PD-25 · Flaky browser tests — *Needs you*

**Found today:** the browser tests share one reviewer account; each run adds texts and changes words, so later tests see more data and sometimes time out or find two buttons (drill FR-401, reading FR-316, look-extras FR-805). The Dictionary's slowness was one cause (question-pages/72). **Research:** each test should own its data; retries hide the problem rather than fix it [21]. **Conflict:** "tests stay fixed; a test changes only when its spec rule changes" (CLAUDE.md). **Recommendation:** allow one exception, recorded in the regeneration log: tests that depend on an account's state start their own learner (as the other session began doing in `texts.spec.mjs`), without changing what they check. *Alternative:* keep the tests and accept occasional reruns.

### PD-26 · Prompt sizes — *Provisional*

**Decision:** the defaults held for ChatGPT, Copilot, Gemini and Le Chat (addendum 002). If Claude and round D aren't run before the deploy, the defaults stay and are revisited after the real-AI check. **Nothing to change.**

### PD-27 · Order inside the new Home — *Provisional*

**Decision** (within question-pages/74, 17): palette and contrast first (it touches every page and every look test), then the grid, menu and Account, then Practise for X min, then Texts with topics, then By skill, then Just one mode. Each part is regenerated and tested on its own, so whatever is left on 1 November is a whole part, not half of several. **Changes:** G-09 tasks.

---

## Sources

1. Pastötter & Bäuml (2014), *Retrieval practice enhances new learning: the forward effect of testing*, Frontiers in Psychology. [PMC](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3983480/) · [Frontiers](https://www.frontiersin.org/articles/10.3389/fpsyg.2014.00286/full)
2. The Learning Scientists, *The dark side of interleaving* (guest post). [link](https://www.learningscientists.org/blog/2017/11/1-8)
3. BCIT, *Interleaving*. [link](https://libguides.bcit.ca/studyskills/interleaving) · Bryn Mawr, *Effective study systems*. [link](https://www.brynmawr.edu/inside/offices-services/academic-support/student-resources/how-study/effective-study-systems)
4. Beglar et al., *Pleasure reading and reading rate gains*. [link](https://scholarspace.manoa.hawaii.edu/bitstream/10125/66684/1/26_1_10125_66684_beglar.pdf) · Oyamada (2014). [link](https://aws1.hpu.edu/research-publications/tesol-working-papers/2014/TESOL_WPS_2014_Oyamada.pdf)
5. Chiu & Chen (2023), *Speech rate and young EFL learners' listening comprehension*. [link](https://ccsenet.org/journal/index.php/elt/article/view/0/48926) · Hayati et al. [link](https://library.iated.org/view/GORJIAN2012EFF2)
6. Schmitt, Jiang & Grabe (2011), on Hu & Nation (2000) and Laufer. [link](https://www.lextutor.ca/cover/papers/schmitt_etal_2011.pdf)
7. Duolingo, *Improving the streak*. [link](https://blog.duolingo.com/improving-the-streak)
8. W3C ARIA Authoring Practices, *Disclosure pattern* and *disclosure card*. [link](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure) · [card](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-card) · Roselli, *Disclosure widgets*. [link](https://adrianroselli.com/2020/05/disclosure-widgets.html)
9. *Myth: icons enhance usability*. [link](https://uxmyths.com/post/715009009/myth-icons-enhance-usability) · *Why icon-only design is failing users*. [link](https://webdesignerdepot.com/why-icon-only-design-is-failing-users-the-case-for-text-labels)
10. Smart Insights on NN/g's hidden-navigation study. [link](https://www.smartinsights.com/digital-marketing-strategy/are-hamburger-menus-hidden-navigation-good-for-ux/) · Roselli, *Avoid the hamburger menu for desktop layouts*. [link](https://adrianroselli.com/2016/01/avoid-the-hamburger-menu-for-desktop-layouts.html)
11. W3C, *What's new in WCAG 2.2*. [link](https://w3.org/WAI/standards-guidelines/wcag/new-in-22/) · WebAIM, *WCAG 2.2*. [link](https://webaim.org/standards/wcag/wcag22)
12. W3C, *Understanding SC 2.3.3 Animation from interactions* and technique C39. [link](https://w3c.github.io/wcag/understanding/animation-from-interactions.html) · [C39](https://w3.org/WAI/WCAG22/Techniques/css/C39)
13. Winston & Strawn, *Are your electronic agreements enforceable?* [link](https://www.winston.com/en/blogs-and-podcasts/direct-sellers-update-regulation-law-and-policy/are-your-electronic-agreements-enforceable) · Ironclad on clickwrap. [link](https://ironcladapp.com/?p=7909)
14. Bird & Bird, *Children in the digital world*: Finland, Sweden. [Finland](https://childreninthedigitalworld.twobirds.com/home/finland) · [Sweden](https://childreninthedigitalworld.twobirds.com/home/sweden)
15. Traficom, *Hosting services*. [link](https://traficom.fi/en/data-economy-and-data-intermediation/hosting-services) · A&O, *DSA: hosting services*. [link](https://www.allenovery.com/en-gb/global/news-and-insights/digital-services-act/layer-two-providers-of-hosting-services)
16. CMS, *CJEU to rule on landmark AI and copyright case from Hungary*. [link](https://cms.law/en/hun/legal-updates/cjeu-to-rule-on-landmark-ai-and-copyright-case-from-hungary) · Verfassungsblog. [link](https://verfassungsblog.de/copyright-ai-cjeu/)
17. Milton & Alexiou, vocabulary size and the CEFR (GALA paper). [link](https://www.enl.auth.gr/gala/14th/Papers/English%20papers/Milton&Alexiou.pdf) · Nation, *Vocabulary and the CEFR*. [link](https://wgtn.ac.nz/lals/resources/paul-nations-resources/vocabulary-lists/vocabulary-cefr-and-word-family-size/vocabulary-and-the-cefr-docx)
18. LingQ support, *How do I increase my known words?* [link](https://lingq-support.groovehq.com/help/how-do-i-increase-my-known-words)
19. JALT, *Who check more pseudowords?* [link](https://jalt-publications.org/proceedings/articles/1121-who-check-more-pseudowords-low-level-or-high-level-students) · Meara, *Scoring a yes/no vocabulary test*. [link](https://lognostics.co.uk/vlibrary/meara1991.doc)
20. Cloudflare, *Quick Tunnels*. [link](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/do-more-with-tunnels/trycloudflare/)
21. Shiplight, *How to fix flaky tests*. [link](https://dev.to/manavshiplightai/how-to-fix-flaky-tests-root-causes-and-permanent-fixes-41f4) · Katalon, *Playwright best practices*. [link](https://katalon.com/resources-center/blog/playwright-best-practices)
