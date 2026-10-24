# X-03 results (2026-10-23)

Prompt: [prompt.txt](prompt.txt), known words in [known.txt](known.txt) (20-minute part: 2 episodes, easy-read dialogue, cyoa; ~400 known words). Pasted on the phone.

## Answer 1: ChatGPT (free), on the phone

Manual check (not by script).

- Cut off: ends inside the cyoa's 2nd question. Missing: rest of the questions, new_words, new_phrases, inflections, names, series_summaries. (Cut by the AI or by the paste: to ask.)
- Text 2 has kind "retell", but episode 2 was asked for (series and episode fields are right).
- Lines are whole paragraphs (up to 5 sentences), not one sentence per line, so the 1-new-per-sentence rule can't be checked line by line. Build: split lines into sentences, or the prompt asks for one sentence per line.
- New words (not in the list, not inflections): ep 1: jobb, bredvid, sig, lägger (~4 in ~250 words, under 5%); ep 2: kvar, berätta, hand, plats; cyoa: ficka. Within 5% per text.
- Easy read broken: "hungrig" and "tillsammans" are new (0 allowed).
- The two new phrases (hur mår du, det gör inget) were not used; the practised words (glömma, granne, biljett) were.
- Cyoa structure is right: start → 3 choices → 2 endings each; every node reachable; 6 endings.
- Questions: right form, 3 options, correct answer index.
- Translations: present and good.
- Quality: natural, simple Swedish; the series and the cyoa share characters (Maja, Sara, Erik) — the AI tied the texts together on its own.

## Answer 2: Gemini (free), on the phone

Manual check (not by script).

- Complete and valid JSON; kinds right; one sentence per line (good for the per-sentence check). Dialogue lacks "series"/"nodes", cyoa lacks "lines" (harmless).
- About half the asked length: episodes ~120 words each (250 asked), dialogue ~60 (150), cyoa ~110 (250). So ~10 minutes, not 20.
- Cyoa: start → 2 choices → 2 endings, no second level (the prompt allows it); all nodes reachable.
- Swedish errors: "svarar Maja och le" (ler); "jag glömmer min biljett ... igår" and "Vad glömmer Anna igår?" (glömde); "Du glömmer nyckeln" (glömde); "Här är mörkt" (Här är det mörkt). Its inflections list has le/ler backwards.
- New words NOT listed in new_words (only "skiner" is): plötsligt, sak, lugnt, oj, ropar, glatt, denna, tillsammans, plats, sig, (ta) betalt. Ep 1 ~6% new (over 5%), ep 2 ~5%. Grove's check would send these back as a fix-it round.
- Easy read: one new word ("folk").
- Used both new phrases (hur mår du, det gör inget) and all three practised words.
- Questions: 2 options each, answers right.

## Answer 3: Claude (free), on the phone

Manual check (not by script).

- Complete, valid JSON; kinds right; mostly one sentence per line (a few lines hold 2–3 short sentences or quotes).
- Full length: episodes ~230 words each, dialogue ~150 (16 lines), cyoa ~330.
- Cyoa exactly as asked: start → 3 choices; two lead to 2 endings each, one ends; every node reachable.
- Swedish natural; small slips: "Jag har glömt min väska här igår" (glömde), title "Den borta nyckeln" (borttappade), question "Vem heter Olle?" (Vem är Olle?).
- New words: almost none. new_words is empty; apart from the two phrases, the only new word found is "säljer" (in the easy read). So the texts are near 100% known, not ~95%: too easy for learning.
- Easy read: one new word ("säljer").
- Inflections list very long (~80 entries, mostly present-tense verbs that needn't be listed), a few wrong (Elsas → "Elsa (namn)"); harmless.
- Used both new phrases and all three practised words.

## Paste note

The user thinks pasting cut ChatGPT's answer (its pretty-printed JSON was the longest). Gemini's and Claude's arrived whole.

## Across the three

- A 20-minute part fits in one answer from free ChatGPT and Claude; Gemini wrote about half the length.
- No AI kept the easy read to known words only (ChatGPT 2, Gemini 1, Claude 1 new word).
- The new-word share misses in both directions: Gemini over 5%, Claude near 0%; ChatGPT on target.
- The AIs' own lists can't be trusted: Gemini left most new words out, Claude listed none.
- One sentence per line isn't guaranteed (ChatGPT wrote paragraphs).
- Swedish slips in all; most in Gemini (tense errors with "igår" in Gemini and Claude).
- Claude's answer is the best base for the demo content (RQ-361).

## Decisions (question-pages/52)

Part size 10 minutes (RQ-186); easy read accepts 1 new word (RQ-377); too few new words accepted with a nudge (RQ-378); grove finds unlisted new words itself and asks only for meanings (RQ-379). Default used: the prompt asks for one sentence per line, and grove splits lines into sentences anyway (no requirement; a detail for the spec).
- [answer-claude.json](answer-claude.json): Claude's answer, kept as the base for the demo content (RQ-361). Its long "inflections" list was left out (grove works inflections out itself); the slips above are still in it.
