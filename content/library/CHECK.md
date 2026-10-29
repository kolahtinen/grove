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

10 of 10 texts pass.
