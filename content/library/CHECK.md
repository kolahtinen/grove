# Library check

Written by `node scripts/check-library.mjs`: each text counted with grove's own word counting against the Kelly words at its level and below (inflections, compounds and Kelly's fixed phrases included). "Above" lists the words above the text's level with the Kelly level they first count at (— = not in Kelly; * = in neither Kelly nor the word list); **bold** words are far (two or more bands above, or not in Kelly) and limited; the others are one band above, a stretch.

## A1 (10 texts; 50–80 words, sentences ≤ 10 words, ≤ 4 far words)

| id | title | kind | words | longest | above | result |
|---|---|---|---|---|---|---|
| A1-01 | Jag heter Anna | reading | 55 | 7 | syster (A2), **lat** (B1) | passes |
| A1-02 | En vanlig morgon | reading | 57 | 7 | vakna (A2), **dusch** (B2), frukost (A2), kök (A2), bröd (A2), kaffe (A2), **mjölk** (B1), telefon (A2), **jacka** (B2), buss (A2), kontor (A2), **stan** (—*) | passes |
| A1-03 | På kaféet | reading, dialogue | 66 | 6 | **kopp** (B1), kaffe (A2), **mjölk** (B1), **smörgås** (C2), **skinka** (C1) | passes |
| A1-04 | Min lägenhet | reading | 57 | 8 | lägenhet (A2), kök (A2), **våning** (B1), vardagsrum (A2), **soffa** (B1), bord (A2), **lampa** (B1), **sovrum** (B2), säng (A2), fönster (A2), park (A2), hyra (A2) | passes |
| A1-05 | I affären | listening, dialogue | 55 | 6 | ursäkta (A2), **mjölk** (B1), bröd (A2), kassa (A2), **äpple** (B2), **kilo** (—), **påse** (B1) | passes |
| A1-06 | Vädret i dag | listening | 58 | 6 | vinter (A2), snöa (A2), **minus** (C1), snö (A2), regn (A2), plus (A2), **smälta** (B1), **våt** (C1), **paraply** (C2) | passes |
| A1-07 | Vid busshållplatsen | listening, dialogue | 55 | 7 | **förlåt** (B1), buss (A2), **biljett** (B1), **app** (—), **okej** (B1) | passes |
| A1-08 | Johan är kock | reading | 54 | 6 | **kock** (C1), restaurang (A2), **soppa** (C1), fisk (A2), **potatis** (B1), gäst (A2) | passes |
| A1-09 | På lördag | reading | 57 | 7 | **bio** (B2), **pizza** (B2), **promenera** (B2), **stan** (—*), buss (A2) | passes |
| A1-10 | Jag är sjuk | reading, dialogue | 59 | 7 | **åh** (—), **hals** (B1), **feber** (B2), vila (A2), **krya** (—) | passes |

## A2 (10 texts; 80–120 words, sentences ≤ 14 words, ≤ 5 far words)

| id | title | kind | words | longest | above | result |
|---|---|---|---|---|---|---|
| A2-01 | En helg på landet | reading | 85 | 9 | mormor (B1), **soppa** (C1), **bakad** (B2), **älg** (B2) | passes |
| A2-02 | Intervjun | reading, dialogue | 91 | 10 | **tjugofem** (—) | passes |
| A2-03 | Farmors födelsedag | reading | 90 | 10 | farmor (B1), **träffas** (—), **duka** (—), **vas** (—), **tårta** (C1), present (B1) | passes |
| A2-04 | Ett samtal till vårdcentralen | listening, dialogue | 82 | 9 | låda (B1), **böja** (B2), **värktablett** (C1) | passes |
| A2-05 | En ny stad | reading | 87 | 11 | — | passes |
| A2-06 | Pannkakor till middag | listening | 89 | 12 | **pannkaka** (—), **mjöl** (C1), mjölk (B1), salt (B1), panna (B1), **spis** (C1), **sylt** (C2), socker (B1), mormor (B1) | passes |
| A2-07 | På biblioteket | reading | 90 | 10 | **språkkafé** (C1) | passes |
| A2-08 | En dag i Stockholm | listening | 87 | 14 | **stan** (—*), **kafé** (C1), **promenera** (B2), tunnelbana (B1) | passes |
| A2-09 | Fotbollsmatchen | reading | 82 | 9 | regna (B1), **blöt** (B2), paus (B1), tränare (B1), **halvlek** (B2), **sköt** (—), smutsig (B1) | passes |
| A2-10 | Ett rum för två nätter | listening, dialogue | 92 | 8 | **familjerum** (—*), **parkering** (C1) | passes |

## B1 (10 texts; 120–180 words, sentences ≤ 20 words, ≤ 7 far words)

| id | title | kind | words | longest | above | result |
|---|---|---|---|---|---|---|
| B1-01 | Att jobba hemifrån | reading | 123 | 13 | **arbetsrum** (C2) | passes |
| B1-02 | Midsommar | reading | 130 | 16 | **stång** (C2), löv (B2), **groda** (C1), **sill** (—), **krans** (C2), **kudde** (C1) | passes |
| B1-03 | Tåget är försenat | reading, dialogue | 129 | 15 | **signalfel** (—), **åh** (—) | passes |
| B1-04 | Läxhjälp på fritiden | reading | 128 | 18 | läxa (B2), **läxhjälpen** (—*) | passes |
| B1-05 | Visning av en lägenhet | listening, dialogue | 130 | 11 | **femtiofem** (—), **kvadratmeter** (C1), balkong (B2), **tvättstuga** (C1), källare (B2), så länge (B2), **busshållplats** (C2) | passes |
| B1-06 | Allemansrätten | reading | 129 | 17 | **allemansrätt** (—), svamp (B2), **paddla** (—), **kanot** (—), skräp (B2) | passes |
| B1-07 | Varför sover vi så dåligt? | listening | 121 | 14 | **slappna** (C1), sovrum (B2) | passes |
| B1-08 | Körkortet | reading | 123 | 17 | **trettiotvå** (—), körkort (B2), **parkera** (C1), **uppkörningen** (C1), **skolzon** (—*) | passes |
| B1-09 | Sopsortering | reading | 122 | 18 | **sopa** (C1), diskbänk (B2), **kärl** (C1), **biogas** (—*), plast (B2), metall (B2), burk (B2), **batteri** (C1), **återvinningscentral** (C1), krånglig (B2) | passes |
| B1-10 | Planer för sommaren | listening, dialogue | 125 | 13 | **vandrarhem** (C2), **färja** (C1) | passes |

30 of 30 texts pass.
