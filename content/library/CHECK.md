# Library check

Written by `node scripts/check-library.mjs`: each text counted with grove's own word counting against the words at its level and below: the core list (`core-a1a2.tsv`) first, otherwise the lower of SweLLex (`vocab-graded/`) and Kelly (inflections, compounds and fixed phrases included). "Above" lists the words above the text's level with the level they first count at (— = in no list; * = in no list and not in the word list); **bold** words are far (two or more bands above, or not in Kelly) and limited; the others are one band above, a stretch.

## A1 (29 texts; 50–80 words, sentences ≤ 10 words, ≤ 4 far words)

| id | title | kind | words | longest | above | far: Kelly alone → now | result |
|---|---|---|---|---|---|---|---|
| A1-01 | Jag heter Anna | reading | 55 | 7 | lat (A2) | 1 → 0 (lat no longer far) | passes |
| A1-02 | En vanlig morgon | reading | 57 | 7 | bröd (A2), jacka (A2), kontor (A2) | 3 → 0 (dusch, mjölk, jacka no longer far) | passes |
| A1-03 | På kaféet | reading, dialogue | 62 | 6 | skinka (A2) | 4 → 0 (kopp, mjölk, smörgås, skinka no longer far) | passes |
| A1-04 | Min lägenhet | reading | 57 | 8 | lägenhet (A2), vardagsrum (A2), bord (A2), lampa (A2), sovrum (A2), fönster (A2), park (A2), hyra (A2) | 4 → 0 (våning, soffa, lampa, sovrum no longer far) | passes |
| A1-05 | I affären | listening, dialogue | 54 | 6 | bröd (A2), kassa (A2), **kilo** (B2), **påse** (B1) | 4 → 2 (mjölk, äpple no longer far) | passes |
| A1-06 | Vädret i dag | listening | 58 | 6 | vinter (A2), snöa (A2), **minus** (C1), snö (A2), regn (A2), plus (A2), **smälta** (B1), våt (A2), paraply (A2) | 4 → 2 (våt, paraply no longer far) | passes |
| A1-07 | Vid busshållplatsen | listening, dialogue | 54 | 7 | biljett (A2), **app** (B2), okej (A2) | 4 → 1 (förlåt, biljett, okej no longer far) | passes |
| A1-08 | Johan är kock | reading | 54 | 6 | **kock** (C1), restaurang (A2), fisk (A2), potatis (A2), gäst (A2) | 3 → 1 (soppa, potatis no longer far) | passes |
| A1-09 | På lördag | reading | 57 | 7 | bio (A2), pizza (A2) | 3 → 0 (bio, pizza, promenera no longer far) | passes |
| A1-10 | Jag är sjuk | reading, dialogue | 54 | 7 | **åh** (—), feber (A2), det gör inget (A2), vila (A2), **krya** (—) | 4 → 2 (hals, feber no longer far) | passes |
| A1-11 | Hos polisen | reading, dialogue | 64 | 7 | **plånbok** (B1), **oj** (B1), **id-kort** (—*), brun (A2), **i morse** (B1), snällt (A2) | 5 → 4 (brun no longer far) | passes |
| A1-12 | Ett foto av familjen | listening, dialogue | 70 | 6 | glasögon (A2), bredvid (A2), mormor (A2) | 1 → 0 (mormor no longer far) | passes |
| A1-13 | Middag på fredag | listening | 60 | 9 | middag (A2), **taco** (—), skär (A2), gurka (A2), **steka** (B1), kött (A2), **panna** (B1), lukta (A2), juice (A2) | 8 → 3 (tomat, gurka, lukta, juice, soffa no longer far) | passes |
| A1-14 | Vi städar på söndag | listening | 57 | 8 | städa (A2), lägenhet (A2), **dammsuga** (B2), vardagsrum (A2), golv (A2), fönster (A2), frisk (A2), luft (A2) | 6 → 1 (städa, tvätt, badrum, sopa, soffa no longer far) | passes |
| A1-15 | En promenad i parken | reading, dialogue | 78 | 7 | träd (A2), gul (A2), **löv** (B2), fågel (A2), bröd (A2), **bada** (B1), bänk (A2), mörk (A2) | 3 → 2 (bänk no longer far) | passes |
| A1-16 | Första dagen på kursen | listening, dialogue | 75 | 7 | kurs (A2), okej (A2), **ingenjör** (B2), sjuksköterska (A2) | 3 → 1 (okej, sjuksköterska no longer far) | passes |
| A1-17 | Jag springer | reading | 70 | 9 | kilometer (A2), regna (A2), **löpning** (C1), gröt (A2), frukt (A2), träna (A2) | 3 → 1 (dusch, gröt no longer far) | passes |
| A1-18 | Musik på torsdag | listening | 62 | 8 | sjunga (A2), **trumma** (B2), nervös (A2) | 5 → 1 (gitarr, piano, kafé, nervös no longer far) | passes |
| A1-19 | I taxin | reading, dialogue | 58 | 7 | okej (A2), **bråttom** (B2), tåg (A2), mörk (A2) | 2 → 1 (okej no longer far) | passes |
| A1-20 | Ett lånekort | listening, dialogue | 75 | 7 | låna (A2), **lånekort** (—), **id-kort** (—*), adress (A2), fönster (A2) | 2 → 2 (none no longer far) | passes |
| A1-21 | Grattis, mormor! | reading, dialogue | 76 | 7 | mormor (A2), **älskling** (C1), grattis (A2), födelsedag (A2), tårta (A2), jordgubbe (A2), **mums** (—), present (A2), **åh** (—), snällt (A2) | 8 → 3 (mormor, grattis, födelsedag, tårta, present no longer far) | passes |
| A1-22 | En ny tröja | reading, dialogue | 71 | 7 | tröja (A2), blå (A2), storlek (A2), **rea** (B2) | 2 → 1 (tröja no longer far) | passes |
| A1-23 | Tåget till Göteborg | listening | 76 | 10 | tåg (A2), fönster (A2), bredvid (A2), sjö (A2), **bistro** (C2), **kanelbulle** (—), **perrong** (—), kram (A2) | 4 → 3 (kram no longer far) | passes |
| A1-24 | Läraren Karin | reading | 68 | 8 | träd (A2) | 0 → 0 | passes |
| A1-25 | Frukost | listening | 52 | 7 | bröd (A2), **yoghurt** (C2) | 3 → 1 (mjölk, äpple no longer far) | passes |
| A1-26 | Var är nycklarna? | reading, dialogue | 57 | 6 | nyckel (A2), hall (A2), bord (A2), väska (A2), jacka (A2), blå (A2), sovrum (A2) | 4 → 0 (hall, väska, jacka, sovrum no longer far) | passes |
| A1-27 | Hos tandläkaren | listening, dialogue | 68 | 7 | **bak** (B2), hål (A2) | 1 → 1 (none no longer far) | passes |
| A1-28 | Den första snön | reading | 73 | 10 | fönster (A2), snöa (A2), **minus** (C1), jacka (A2), mössa (A2), gård (A2), snö (A2), park (A2), tyst (A2), träd (A2), sjö (A2), vinter (A2) | 4 → 1 (jacka, mössa, choklad no longer far) | passes |
| A1-29 | En söndag på museet | listening | 79 | 9 | museum (A2), centrum (A2) | 3 → 0 (station, kafé, kaka no longer far) | passes |

## A2 (29 texts; 80–120 words, sentences ≤ 14 words, ≤ 5 far words)

| id | title | kind | words | longest | above | far: Kelly alone → now | result |
|---|---|---|---|---|---|---|---|
| A2-01 | En helg på landet | reading | 85 | 9 | **älg** (B2) | 3 → 1 (soppa, baka no longer far) | passes |
| A2-02 | Intervjun | reading, dialogue | 89 | 10 | **tjugofem** (—) | 1 → 1 (none no longer far) | passes |
| A2-03 | Farmors födelsedag | reading | 90 | 10 | **träffas** (—), **duka** (—) | 4 → 2 (vas, tårta no longer far) | passes |
| A2-04 | Ett samtal till vårdcentralen | listening, dialogue | 82 | 9 | låda (B1), **böja** (B2), **värktablett** (B2) | 2 → 2 (none no longer far) | passes |
| A2-05 | En ny stad | reading | 87 | 11 | — | 0 → 0 | passes |
| A2-06 | Pannkakor till middag | listening | 89 | 12 | **pannkaka** (C1), panna (B1) | 4 → 1 (mjöl, spis, sylt no longer far) | passes |
| A2-07 | På biblioteket | reading | 90 | 10 | — | 1 → 0 (språkkafé no longer far) | passes |
| A2-08 | En dag i Stockholm | listening | 87 | 14 | — | 2 → 0 (kafé, promenera no longer far) | passes |
| A2-09 | Fotbollsmatchen | reading | 82 | 9 | **blöt** (B2), paus (B1), **halvlek** (B2) | 2 → 2 (none no longer far) | passes |
| A2-10 | Ett rum för två nätter | listening, dialogue | 89 | 8 | **familjerum** (—*), **parkering** (C1) | 2 → 2 (none no longer far) | passes |
| A2-11 | Min bästa vän | reading | 114 | 13 | **träffas** (—), tonår (B1) | 2 → 1 (penna no longer far) | passes |
| A2-12 | En stressig måndag | listening | 104 | 14 | **väckarklocka** (—), **blöt** (B2), **kännas** (—) | 6 → 3 (paraply, smörgås, kafé no longer far) | passes |
| A2-13 | Svamp i skogen | reading, dialogue | 109 | 11 | **kantarell** (—), **mossa** (—), **löv** (B2), gran (B1), **svamp** (B2), **korg** (B2), steka (B1) | 8 → 5 (steka, smör, smörgås no longer far) | passes |
| A2-14 | Fika med Rut | reading | 105 | 14 | **tjugotre** (—), **träffas** (—) | 3 → 2 (baka no longer far) | passes |
| A2-15 | Vad ska vi äta i kväll? | listening, dialogue | 86 | 7 | **citron** (C2) | 8 → 1 (lök, kyckling, lax, sallad, tomat, gurka, disk no longer far) | passes |
| A2-16 | Den nya grannen | listening | 113 | 12 | **sjuttiofem** (—), **gengäld** (—) | 4 → 2 (baka, knacka no longer far) | passes |
| A2-17 | På apoteket | listening, dialogue | 116 | 11 | hosta (B1), **hostmedicin** (—), **honung** (C1) | 6 → 2 (hosta, feber, sked, tablett no longer far) | passes |
| A2-18 | Tvättstugan | reading | 118 | 11 | **hyreshus** (—), tvättstuga (B1), **källare** (B2), **korg** (B2), i förväg (B1) | 4 → 3 (tvättstuga no longer far) | passes |
| A2-19 | Kolonilotten | reading | 110 | 14 | **kolonilott** (C1), **lott** (C1), **snigel** (—) | 5 → 3 (morot, sallad no longer far) | passes |
| A2-20 | Pappa är hemma | reading | 104 | 13 | **föräldraledig** (—*) | 1 → 1 (none no longer far) | passes |
| A2-21 | Flyttdagen | listening, dialogue | 100 | 9 | låda (B1), paus (B1), **uppackad** (—*) | 4 → 1 (spis, pizza, tallrik no longer far) | passes |
| A2-22 | Sommarjobbet | reading | 106 | 14 | **cappuccino** (—), turist (B1), **bulle** (C1) | 6 → 2 (kafé, nervös, skina, bak no longer far) | passes |
| A2-23 | Läxorna | listening, dialogue | 94 | 11 | **rabatt** (B2), **popcorn** (—) | 3 → 2 (läxa no longer far) | passes |
| A2-24 | Ett rum i kollektivet | reading | 109 | 13 | baksida (B1), **schema** (B2), **städning** (C1), **disk** (B2), bråk (B1) | 6 → 3 (badrum, kylskåp, tomat no longer far) | passes |
| A2-25 | Mormors bröd | reading | 83 | 9 | **jäst** (—), **kokbok** (—), **skål** (B2), **ugn** (C1), mjuk (B1) | 7 → 4 (baka, mjöl, deg no longer far) | passes |
| A2-26 | Is på gatan | listening | 94 | 10 | **halka** (B2) | 2 → 1 (gips no longer far) | passes |
| A2-27 | Min bror i Oslo | reading, dialogue | 100 | 9 | köttbulle (B1) | 1 → 0 (köttbulle no longer far) | passes |
| A2-28 | Språkcaféet | listening, dialogue | 106 | 10 | **språkcafé** (—*) | 1 → 1 (none no longer far) | passes |
| A2-29 | En natt i tält | reading | 117 | 13 | tält (B1), **till slut** (C1), bada (B1) | 2 → 1 (korv no longer far) | passes |

## B1 (22 texts; 120–180 words, sentences ≤ 20 words, ≤ 7 far words)

| id | title | kind | words | longest | above | far: Kelly alone → now | result |
|---|---|---|---|---|---|---|---|
| B1-01 | Att jobba hemifrån | reading | 123 | 13 | **arbetsrum** (C2) | 1 → 1 (none no longer far) | passes |
| B1-02 | Midsommar | reading | 130 | 16 | **stång** (C2), löv (B2), **kudde** (C1) | 5 → 2 (groda, sill, kran no longer far) | passes |
| B1-03 | Tåget är försenat | reading, dialogue | 128 | 15 | **signalfel** (—), **åh** (—) | 2 → 2 (none no longer far) | passes |
| B1-04 | Läxhjälp på fritiden | reading | 128 | 18 | **läxhjälp** (—*) | 1 → 1 (none no longer far) | passes |
| B1-05 | Visning av en lägenhet | listening, dialogue | 130 | 11 | **femtiofem** (—), **kvadratmeter** (C1), källare (B2), så länge (B2) | 4 → 2 (tvättstuga, busshållplats no longer far) | passes |
| B1-06 | Allemansrätten | reading | 129 | 17 | **allemansrätt** (—), svamp (B2), **paddla** (C1), **kanot** (—) | 3 → 3 (none no longer far) | passes |
| B1-07 | Varför sover vi så dåligt? | listening | 121 | 14 | — | 1 → 0 (slappna no longer far) | passes |
| B1-08 | Körkortet | reading | 123 | 17 | **trettiotvå** (—), **parkera** (C1), **uppkörning** (C1), **skolzon** (—*) | 4 → 4 (none no longer far) | passes |
| B1-09 | Sopsortering | reading | 122 | 18 | diskbänk (B2), **kärl** (C1), **biogas** (—*), metall (B2), burk (B2), **återvinningscentral** (C1) | 5 → 3 (sopa, batteri no longer far) | passes |
| B1-10 | Planer för sommaren | listening, dialogue | 125 | 13 | **vandrarhem** (C2) | 2 → 1 (färja no longer far) | passes |
| B1-11 | Tvillingarna | reading | 139 | 19 | skoj (B2), isär (B2), juridik (B2), **skidlärare** (—*) | 3 → 1 (tvilling, skoj no longer far) | passes |
| B1-12 | Kräftskiva i augusti | listening | 145 | 18 | **kräftskiva** (—), **kräfta** (C2), **dill** (C2), **saft** (C2), **paj** (C2), **dekorera** (C2), **papperslyktor** (C2), melodi (B2) | 9 → 7 (snapsvisa, fånig no longer far) | passes |
| B1-13 | Mobilen som slutade fungera | listening, dialogue | 145 | 17 | blöt (B2), **kvitto** (C1), app (B2) | 2 → 1 (app no longer far) | passes |
| B1-14 | Det gamla torpet | reading | 147 | 20 | **torp** (—), läcka (B2), **mest** (—), knut (B2) | 2 → 2 (none no longer far) | passes |
| B1-15 | Praktik på redaktionen | reading | 150 | 18 | **korrektur** (—*), termin (B2) | 1 → 1 (none no longer far) | passes |
| B1-16 | Mötet i föreningen | listening, dialogue | 145 | 18 | **gunga** (C2), arbetsdag (B2), **trappuppgång** (—) | 2 → 2 (none no longer far) | passes |
| B1-17 | Våren och pollen | reading | 169 | 19 | **allergisk** (C2), **björkpollen** (—*), **björk** (—), **klia** (C1), **pollenallergi** (—), **pollenprognos** (—*), app (B2), halt (B2), pol (B2), symtom (B2) | 9 → 6 (app, tablett, symtom no longer far) | passes |
| B1-18 | Vid incheckningen | listening, dialogue | 124 | 12 | check (B2), kilo (B2) | 2 → 0 (varsågod, kilo no longer far) | passes |
| B1-19 | Middag för sex | reading, dialogue | 140 | 11 | **ugn** (C1), **vegetarian** (—), **allergisk** (C2), **nöt** (C2), **gryta** (C1) | 7 → 5 (sallad, bageri no longer far) | passes |
| B1-20 | Farfar på skärmen | listening | 159 | 15 | **surfplatta** (—) | 1 → 1 (none no longer far) | passes |
| B1-21 | Ett år utan nya saker | reading | 150 | 18 | **tandkräm** (C2), **schampo** (—), **begagnad** (C1), dammsugare (B2) | 3 → 3 (none no longer far) | passes |
| B1-22 | Nattskiftet | reading | 177 | 19 | **undersköterska** (—), **arbetspass** (—) | 2 → 2 (none no longer far) | passes |

## B2 (20 texts; 180–250 words, sentences ≤ 25 words, ≤ 9 far words)

| id | title | kind | words | longest | above | far: Kelly alone → now | result |
|---|---|---|---|---|---|---|---|
| B2-01 | Föräldrar efter fyrtio | reading | 198 | 20 | **fyrtiotvå** (—), till slut (C1), **förstagångsförälder** (—*), **tjugofemåring** (—*) | 3 → 3 (none no longer far) | passes |
| B2-02 | Ett samhälle utan kontanter | reading | 184 | 22 | kontanter (C1), **kollekt** (—*), **bank-id** (—*) | 4 → 2 (app, bankomat no longer far) | passes |
| B2-03 | Mer än en kaffepaus | listening | 185 | 22 | oartig (C1), **kanelbulle** (—), tilltugg (C1) | 3 → 1 (oartigt, smörgås no longer far) | passes |
| B2-04 | Vems tur är det att städa? | reading, dialogue | 181 | 20 | **tentaplugg** (—*), stökig (C1), **dammsugning** (—), **tenta** (—) | 3 → 3 (none no longer far) | passes |
| B2-05 | Fyra dagars arbetsvecka? | listening, dialogue | 186 | 20 | **fyradagarsvecka** (—*), **turas** (—), **halvera** (—) | 3 → 3 (none no longer far) | passes |
| B2-06 | Med nattåg till Europa | reading | 188 | 20 | **nattåg** (—), **sovvagn** (—), **kupé** (—), **termos** (—), **överstökad** (—) | 5 → 5 (none no longer far) | passes |
| B2-07 | Bokcirkeln | reading | 181 | 22 | — | 1 → 0 (bibliotekarie no longer far) | passes |
| B2-08 | Barn och skärmar | listening | 184 | 23 | brottas (C1), **scrolla** (—) | 1 → 1 (none no longer far) | passes |
| B2-09 | Vargen som delar Sverige | reading | 195 | 22 | **mellersta** (—), **skolbuss** (—), **inavlad** (C2) | 3 → 3 (none no longer far) | passes |
| B2-10 | Första gången i vallokalen | listening, dialogue | 182 | 19 | **legitimation** (C2), **förtidsrösta** (—) | 2 → 2 (none no longer far) | passes |
| B2-11 | Bonusfamiljen | reading | 198 | 24 | **styvfamilj** (C2), till slut (C1), **fredagsmys** (—), **taco** (—), **pussel** (C2), kartong (C1) | 4 → 4 (none no longer far) | passes |
| B2-12 | Vegetariskt på jobbet | listening, dialogue | 190 | 19 | linsgrytan (C1), lins (C1) | 1 → 0 (vegetarisk no longer far) | passes |
| B2-13 | Andrahandskontraktet | reading | 181 | 25 | **förstahandskontrakt** (—), till slut (C1), hyresvärd (C1) | 1 → 1 (none no longer far) | passes |
| B2-14 | Promenadens kraft | listening | 185 | 20 | maraton (C1), **rask** (—), **hjärt** (—*), **två-diabetes** (—*) | 4 → 3 (maraton no longer far) | passes |
| B2-15 | Allemansrätten till information | reading | 204 | 23 | urholka (C1), **skyndsamt** (—) | 1 → 1 (none no longer far) | passes |
| B2-16 | Ett land som sjunger | listening | 184 | 19 | **kyrkokör** (—), **repetition** (C2) | 2 → 2 (none no longer far) | passes |
| B2-17 | Ska vi skaffa hund? | reading, dialogue | 218 | 13 | veterinär (C1), uppoffring (C1) | 1 → 0 (regnig no longer far) | passes |
| B2-18 | Cykel året runt | reading | 193 | 16 | **såld** (—), **dubbdäck** (—), **plogas** (—), minusgrad (C1), parkering (C1), **isig** (—) | 5 → 4 (riskabel no longer far) | passes |
| B2-19 | Bin på taket | listening, dialogue | 233 | 17 | **bi** (C2), **bikupa** (—), honung (C1), **kupa** (—), **tam** (C2), **humla** (—) | 7 → 5 (kilo, bry no longer far) | passes |
| B2-20 | Att våga starta eget | reading | 248 | 22 | ugn (C1), bokföring (C1), **bakning** (—), **kardemummabull** (—*) | 3 → 2 (bageri no longer far) | passes |

## C1 (10 texts; 250–350 words, sentences ≤ 30 words, ≤ 12 far words)

| id | title | kind | words | longest | above | far: Kelly alone → now | result |
|---|---|---|---|---|---|---|---|
| C1-01 | Ensam i ett land av ensamhushåll | reading | 276 | 24 | **tjugosju** (—), **klätterklubb** (—*) | 3 → 2 (fetma no longer far) | passes |
| C1-02 | Lagom är bäst – eller? | listening | 277 | 27 | **vikingatid** (—), **dryckeshorn** (—), **sansad** (—), **pragmatisk** (—), fjäder (C2), **jantelag** (—), **oskriven** (—) | 7 → 6 (varken no longer far) | passes |
| C1-03 | Maten som hamnar i soporna | reading | 261 | 28 | **före-datum** (—*), **förbrukningsdag** (—*), **affärsidé** (—), **skönhetsfel** (—*), banal (C2) | 5 → 4 (app no longer far) | passes |
| C1-04 | Hos banken | reading, dialogue | 281 | 22 | **budgivning** (—*), **lånelöfte** (—*), amortering (C2), **belåningsgrad** (—*), **överbryggningslån** (—*) | 4 → 4 (none no longer far) | passes |
| C1-05 | Att byta bana mitt i livet | reading | 278 | 29 | **fyrtiofem** (—), **högskoleutbildning** (—), **avgiftsfri** (—), **tenta** (—), **arbetspass** (—) | 7 → 5 (alltmer, familjeliv no longer far) | passes |
| C1-06 | Ska bilen ut ur stan? | listening, dialogue | 272 | 27 | **innerstad** (—), **byggd** (—), **utryckningsfordon** (—), **klädbutik** (—*), **pendelparkering** (—*), **stegvis** (—), **beredd** (—) | 7 → 7 (none no longer far) | passes |
| C1-07 | Flickan som inte ville bli vuxen | reading | 270 | 26 | rödhårig (C2), **trotsa** (—), **olydig** (—), **satirisk** (—), **folkmun** (—), **kännas** (—) | 7 → 5 (samhällsdebatt, resmål no longer far) | passes |
| C1-08 | När kroppen säger ifrån | listening | 274 | 27 | **pinkod** (—), **bulta** (—), **diffus** (—) | 7 → 3 (arbetsbelastning, utvilad, deltid, arbetsmängd no longer far) | passes |
| C1-09 | Skogen – resurs eller livsmiljö? | reading | 268 | 27 | infekterad (C2), **likåldrig** (—*), **lav** (—), **bärplockning** (—), **hyggesfri** (—*), **friluftsliv** (—) | 6 → 5 (kalhuggs no longer far) | passes |
| C1-10 | Litar vi fortfarande på varandra? | reading, dialogue | 266 | 28 | **otrygghet** (—), **naturlag** (—) | 2 → 2 (none no longer far) | passes |

## C2 (10 texts; 300–400 words, sentences ≤ 35 words, ≤ 15 far words)

| id | title | kind | words | longest | above | far: Kelly alone → now | result |
|---|---|---|---|---|---|---|---|
| C2-01 | Huset vid sjön | reading | 331 | 29 | **trähus** (—), **konfliktfylld** (—), **dödsbo** (—), **sommarhus** (—), **sentimental** (—*), **medlare** (—), **banklån** (—), **morbid** (—) | 8 → 8 (none no longer far) | passes |
| C2-02 | Uppmärksamhetens pris | listening | 326 | 28 | **välbetald** (—), **skoldag** (—*) | 3 → 2 (app no longer far) | passes |
| C2-03 | Husmanskostens återkomst | reading | 319 | 31 | **husmanskost** (—), **gräddsås** (—*), **lingon** (—), **strömming** (—), **kåldolme** (—), **skolmatsal** (—), **taco** (—), **skolmat** (—), **pendel** (—), **fermentera** (—), **pyttipanna** (—), **raggmunk** (—), **nostalgi** (—) | 19 → 13 (ärtsoppa, bortglömd, alltmer, globalisera, förankrad, skymma no longer far) | passes |
| C2-04 | En miljon bostäder | reading | 328 | 32 | **omodern** (—), **monoton** (—), **segregation** (—), **nyansera** (—), **föreningsliv** (—), **innerstad** (—), **avundas** (—*), **brännbar** (—), **upprustning** (—) | 9 → 9 (none no longer far) | passes |
| C2-05 | Lönesamtalet | reading, dialogue | 328 | 23 | **lönesamtal** (—*), **supportavdelning** (—*), **supportärende** (—*), **lönehöjning** (—) | 5 → 4 (median no longer far) | passes |
| C2-06 | Inlandsbanan | listening | 324 | 31 | **rallare** (—), **räls** (—), **glittra** (—), **avbruten** (—), **flytta ut** (—) | 7 → 5 (sommartid, alltmer no longer far) | passes |
| C2-07 | Översättarens osynliga arbete | reading | 316 | 26 | **ordagrann** (—), **idiom** (—*), **sociolekt** (—*), **rim** (—), **förskjutning** (—), **ordval** (—), **given** (—) | 9 → 7 (sudda, ännu no longer far) | passes |
| C2-08 | Ingen penicillin den här gången | listening, dialogue | 305 | 23 | **penicillin** (—), **streptokock** (—), **magbesvär** (—*), **resistent** (—), **resistens** (—), **febernedsättande** (—*) | 8 → 6 (antibiotika, snopen no longer far) | passes |
| C2-09 | Ett innanhav i kris | reading | 306 | 29 | **bräckvattenhav** (—*), **övergödning** (—), **fosfor** (—), **gödning** (—), **alg** (—), **blomning** (—), **torsk** (—), **reningsverk** (—), **bottensediment** (—*), **uthållig** (—), **beredd** (—) | 11 → 11 (none no longer far) | passes |
| C2-10 | Svenskan i engelskans skugga | reading, dialogue | 302 | 21 | **samhällsämne** (—*), **famla** (—), **samhällsbärande** (—*), **parallellspråkighet** (—*) | 5 → 4 (lånord no longer far) | passes |

120 of 120 texts pass.
