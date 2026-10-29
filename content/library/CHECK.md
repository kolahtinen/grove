# Library check

Written by `node scripts/check-library.mjs`: each text counted with grove's own word counting against the words at its level and below: the core list (`core-a1a2.tsv`) first, otherwise the lower of SweLLex (`vocab-graded/`) and Kelly (inflections, compounds and fixed phrases included). "Above" lists the words above the text's level with the level they first count at (— = in no list; * = in no list and not in the word list); **bold** words are far (two or more bands above, or not in Kelly) and limited; the others are one band above, a stretch.

## A1 (13 texts; 50–80 words, sentences ≤ 10 words, ≤ 4 far words)

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

## A2 (15 texts; 80–120 words, sentences ≤ 14 words, ≤ 5 far words)

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

## B1 (12 texts; 120–180 words, sentences ≤ 20 words, ≤ 7 far words)

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

## B2 (10 texts; 180–250 words, sentences ≤ 25 words, ≤ 9 far words)

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

70 of 70 texts pass.
