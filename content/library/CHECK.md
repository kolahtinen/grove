# Library check

Written by `node scripts/check-library.mjs`: each text counted with grove's own word counting against the words at its level and below: the core list (`core-a1a2.tsv`) first, otherwise the lower of SweLLex (`vocab-graded/`) and Kelly (inflections, compounds and fixed phrases included). "Above" lists the words above the text's level with the level they first count at (— = in no list; * = in no list and not in the word list); **bold** words are far (two or more bands above, or not in Kelly) and limited; the others are one band above, a stretch.

## A1 (10 texts; 50–80 words, sentences ≤ 10 words, ≤ 4 far words)

| id | title | kind | words | longest | above | far: Kelly alone → now | result |
|---|---|---|---|---|---|---|---|
| A1-01 | Jag heter Anna | reading | 55 | 7 | lat (A2) | 1 → 0 (lat no longer far) | passes |
| A1-02 | En vanlig morgon | reading | 57 | 7 | bröd (A2), jacka (A2), kontor (A2), **stan** (—*) | 4 → 1 (dusch, mjölk, jacka no longer far) | passes |
| A1-03 | På kaféet | reading, dialogue | 62 | 6 | skinka (A2) | 4 → 0 (kopp, mjölk, smörgås, skinka no longer far) | passes |
| A1-04 | Min lägenhet | reading | 57 | 8 | lägenhet (A2), vardagsrum (A2), bord (A2), lampa (A2), sovrum (A2), fönster (A2), park (A2), hyra (A2) | 4 → 0 (våning, soffa, lampa, sovrum no longer far) | passes |
| A1-05 | I affären | listening, dialogue | 54 | 6 | bröd (A2), kassa (A2), **kilo** (B2), **påse** (B1) | 4 → 2 (mjölk, äpple no longer far) | passes |
| A1-06 | Vädret i dag | listening | 58 | 6 | vinter (A2), snöa (A2), **minus** (C1), snö (A2), regn (A2), plus (A2), **smälta** (B1), våt (A2), paraply (A2) | 4 → 2 (våt, paraply no longer far) | passes |
| A1-07 | Vid busshållplatsen | listening, dialogue | 54 | 7 | biljett (A2), **app** (B2), okej (A2) | 4 → 1 (förlåt, biljett, okej no longer far) | passes |
| A1-08 | Johan är kock | reading | 54 | 6 | **kock** (C1), restaurang (A2), fisk (A2), potatis (A2), gäst (A2) | 3 → 1 (soppa, potatis no longer far) | passes |
| A1-09 | På lördag | reading | 57 | 7 | bio (A2), pizza (A2), **stan** (—*) | 4 → 1 (bio, pizza, promenera no longer far) | passes |
| A1-10 | Jag är sjuk | reading, dialogue | 54 | 7 | **åh** (—), feber (A2), det gör inget (A2), vila (A2), **krya** (—) | 4 → 2 (hals, feber no longer far) | passes |

## A2 (10 texts; 80–120 words, sentences ≤ 14 words, ≤ 5 far words)

| id | title | kind | words | longest | above | far: Kelly alone → now | result |
|---|---|---|---|---|---|---|---|
| A2-01 | En helg på landet | reading | 85 | 9 | **älg** (B2) | 3 → 1 (soppa, bakad no longer far) | passes |
| A2-02 | Intervjun | reading, dialogue | 89 | 10 | **tjugofem** (—) | 1 → 1 (none no longer far) | passes |
| A2-03 | Farmors födelsedag | reading | 90 | 10 | **träffas** (—), **duka** (—) | 4 → 2 (vas, tårta no longer far) | passes |
| A2-04 | Ett samtal till vårdcentralen | listening, dialogue | 82 | 9 | låda (B1), **böja** (B2), **värktablett** (B2) | 2 → 2 (none no longer far) | passes |
| A2-05 | En ny stad | reading | 87 | 11 | — | 0 → 0 | passes |
| A2-06 | Pannkakor till middag | listening | 89 | 12 | **pannkaka** (C1), panna (B1) | 4 → 1 (mjöl, spis, sylt no longer far) | passes |
| A2-07 | På biblioteket | reading | 90 | 10 | — | 1 → 0 (språkkafé no longer far) | passes |
| A2-08 | En dag i Stockholm | listening | 87 | 14 | **stan** (—*) | 3 → 1 (kafé, promenera no longer far) | passes |
| A2-09 | Fotbollsmatchen | reading | 82 | 9 | **blöt** (B2), paus (B1), **halvlek** (B2), **sköt** (—) | 3 → 3 (none no longer far) | passes |
| A2-10 | Ett rum för två nätter | listening, dialogue | 89 | 8 | **familjerum** (—*), **parkering** (C1) | 2 → 2 (none no longer far) | passes |

## B1 (10 texts; 120–180 words, sentences ≤ 20 words, ≤ 7 far words)

| id | title | kind | words | longest | above | far: Kelly alone → now | result |
|---|---|---|---|---|---|---|---|
| B1-01 | Att jobba hemifrån | reading | 123 | 13 | **arbetsrum** (C2) | 1 → 1 (none no longer far) | passes |
| B1-02 | Midsommar | reading | 130 | 16 | **stång** (C2), löv (B2), **kudde** (C1) | 5 → 2 (groda, sill, krans no longer far) | passes |
| B1-03 | Tåget är försenat | reading, dialogue | 128 | 15 | **signalfel** (—), **åh** (—) | 2 → 2 (none no longer far) | passes |
| B1-04 | Läxhjälp på fritiden | reading | 128 | 18 | **läxhjälpen** (—*) | 1 → 1 (none no longer far) | passes |
| B1-05 | Visning av en lägenhet | listening, dialogue | 130 | 11 | **femtiofem** (—), **kvadratmeter** (C1), källare (B2), så länge (B2) | 4 → 2 (tvättstuga, busshållplats no longer far) | passes |
| B1-06 | Allemansrätten | reading | 129 | 17 | **allemansrätt** (—), svamp (B2), **paddla** (C1), **kanot** (—) | 3 → 3 (none no longer far) | passes |
| B1-07 | Varför sover vi så dåligt? | listening | 121 | 14 | — | 1 → 0 (slappna no longer far) | passes |
| B1-08 | Körkortet | reading | 123 | 17 | **trettiotvå** (—), **parkera** (C1), **uppkörningen** (C1), **skolzon** (—*) | 4 → 4 (none no longer far) | passes |
| B1-09 | Sopsortering | reading | 122 | 18 | diskbänk (B2), **kärl** (C1), **biogas** (—*), metall (B2), burk (B2), **återvinningscentral** (C1) | 5 → 3 (sopa, batteri no longer far) | passes |
| B1-10 | Planer för sommaren | listening, dialogue | 125 | 13 | **vandrarhem** (C2) | 2 → 1 (färja no longer far) | passes |

30 of 30 texts pass.
