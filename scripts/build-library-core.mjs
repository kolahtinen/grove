// Builds content/library/core-a1a2.tsv: a stopgap list of the everyday words a beginner meets first,
// by theme, until a better graded list is chosen (question-pages/76, F2, F4). The words are picked by
// hand; each word's level comes from SweLLex (content/library/vocab-graded, CC BY 4.0) or Kelly when
// either puts it at A1 or A2, and from the theme otherwise (the reason column says which). Meanings
// come from grove's word list and are flagged as in the Kelly files; none is made up.
// Usage: node scripts/build-library-core.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readKelly } from '../server/levels/kelly.mjs';
import { meaning } from '../server/lexicon/lexicon.mjs';
import { flagsFor } from './build-library-vocab.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'content', 'library', 'core-a1a2.tsv');

// Theme → words. A word ending in + is A2 by theme (when neither list puts it at A1 or A2); others A1.
// Function words (och, jag, i, på…) are left out: Kelly already has them at A1.
export const THEMES = {
  'greetings and phrases': 'hej|hej då|tack|tack så mycket|varsågod|ursäkta|förlåt|ja tack|nej tack|god morgon|god natt|välkommen|hur mår du|vi ses|ha det bra|ingen orsak|det gör inget+|okej',
  numbers: 'noll|en|ett|två|tre|fyra|fem|sex|sju|åtta|nio|tio|elva|tolv|tretton|fjorton|femton|sexton|sjutton|arton|nitton|tjugo|trettio|fyrtio|femtio|sextio|sjuttio|åttio|nittio|hundra|tusen|första|andra|tredje',
  time: 'dag|natt|morgon|förmiddag|eftermiddag|kväll|vecka|månad|år|timme|minut|klocka|helg|semester+|födelsedag|måndag|tisdag|onsdag|torsdag|fredag|lördag|söndag|januari|februari|mars|april|maj|juni|juli|augusti|september|oktober|november|december|vår|sommar|höst|vinter',
  weather: 'väder|sol|regn|snö|vind+|moln+|grad|regna|snöa|blåsa+|paraply+',
  food: 'mat|frukost|lunch|middag|kaffe|te|mjölk|vatten|juice|bröd|smör|ost|skinka|ägg|fisk|kött|kyckling|korv|potatis|ris|pasta|soppa|sallad|grönsak|frukt|äpple|banan|apelsin|tomat|gurka+|lök+|morot+|socker|salt|peppar+|kaka|tårta|glass|choklad|godis|smörgås|pizza|öl|vin|sylt+|mjöl+|kopp|glas|tallrik|kniv|gaffel|sked|flaska|äta|dricka|laga|smaka',
  home: 'hem|hus|lägenhet|rum|kök|badrum|sovrum|vardagsrum|hall+|toalett|dusch|säng|bord|stol|soffa|lampa|fönster|dörr|golv|vägg|tak+|trappa+|nyckel|hyra|granne|balkong+|trädgård|skåp+|kylskåp+|spis+|tvättmaskin+|bo|städa|tvätta|duscha',
  family: 'familj|mamma|pappa|förälder|barn|son|dotter|bror|syster|mormor|morfar|farmor|farfar|kusin+|man|fru|sambo|pojkvän|flickvän|vän|kompis|bebis+',
  'body and health': 'kropp|huvud|hår|öga|öra|näsa|mun|tand|hals|arm|hand|finger|ben|fot|mage|rygg|hjärta+|sjuk|frisk|ont|feber+|läkare|sjukhus|apotek|medicin|tandläkare+|förkyld+|vila',
  clothes: 'kläder|jacka|tröja|byxa|skjorta|klänning|kjol+|sko|strumpa+|mössa+|vante+|halsduk+',
  'town and travel': 'stad|by+|gata|väg|affär|butik|kafé|restaurang|bank|skola|bibliotek|park|torg+|station|buss|tåg|bil|cykel|båt|flygplan|biljett|hållplats+|tunnelbana+|taxi|resa|åka|cykla|köra',
  'work and school': 'jobb|arbete|kontor|chef|kollega|lärare|elev|student|kurs|lektion|läxa|bok|penna|papper|dator|telefon|mobil|pengar|krona|kort|arbeta|jobba|studera|läsa|skriva|räkna+',
  'common verbs': 'vara|ha|göra|gå|komma|se|säga|veta|få|ta|ge|vilja|kunna|ska|måste|heta|sova|vakna|prata|tala|lyssna|höra|titta|förstå|fråga|svara|köpa|betala|kosta|öppna|stänga|börja|sluta|springa|spela|leka|träffa|ringa|hjälpa|behöva|tycka|gilla|älska|tänka|tro|bära|sitta|stå|ligga|handla|vänta|bli|hitta|glömma|lära|simma|dansa|sjunga|promenera+',
  'common adjectives': 'stor|liten|ny|gammal|ung|bra|dålig|god|fin|vacker|ful+|glad|ledsen|trött|hungrig|törstig+|lätt|svår|dyr|billig|varm|kall|lång|kort|hög|låg|snabb|långsam|tidig|sen|ren+|smutsig+|öppen|stängd+|trevlig|rolig|tråkig|viktig|färdig|ledig',
  colours: 'färg|röd|blå|grön|gul|svart|vit|grå|brun|rosa',
};

function readGraded() {
  const levels = new Map();
  for (const level of ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']) {
    const file = join(ROOT, 'content', 'library', 'vocab-graded', `${level}.tsv`);
    for (const line of readFileSync(file, 'utf8').split('\n').slice(2)) {
      const word = line.split('\t')[0];
      if (word && !levels.has(word)) levels.set(word, level);
    }
  }
  return levels;
}

const clean = (s) => String(s).replace(/[\t\r\n]+/g, ' ').trim();
const EARLY = new Set(['A1', 'A2']);

export function buildCore() {
  const graded = readGraded();
  const kelly = new Map();
  for (const r of readKelly()) if (!kelly.has(r.lemma)) kelly.set(r.lemma, r);
  const rows = [];
  const seen = new Set();
  for (const [theme, list] of Object.entries(THEMES)) {
    for (const entry of list.split('|')) {
      const a2 = entry.endsWith('+');
      const sv = entry.replace(/\+$/, '');
      if (seen.has(sv)) continue;
      seen.add(sv);
      const g = graded.get(sv);
      const k = kelly.get(sv)?.level;
      let level;
      let source;
      if (g && EARLY.has(g) && (!k || !EARLY.has(k) || g <= k)) { level = g; source = `SweLLex ${g}${k ? `; Kelly ${k}` : ''}`; }
      else if (k && EARLY.has(k)) { level = k; source = `Kelly ${k}${g ? `; SweLLex ${g}` : ''}`; }
      else { level = a2 ? 'A2' : 'A1'; source = `theme (${[g && `SweLLex ${g}`, k && `Kelly ${k}`].filter(Boolean).join('; ') || 'in neither list'})`; }
      const found = meaning(sv);
      const pos = kelly.get(sv)?.pos ?? (sv.includes(' ') ? 'phrase' : '');
      rows.push({ sv, level, theme, en: found?.en ?? '', flags: flagsFor({ lemma: sv, pos }, found), source });
    }
  }
  return rows;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const rows = buildCore();
  const lines = [
    '# grove library core list, A1–A2: a stopgap (question-pages/76, F2, F4). Words picked by hand by theme; level from SweLLex (Språkbanken Text, CC BY 4.0) or the Kelly list (Språkbanken, CC BY-SA 3.0 / LGPL 3.0) when either has it at A1–A2, else from the theme; meanings from the English Wiktionary via kaikki.org (CC BY-SA 4.0). Built by scripts/build-library-core.mjs.',
    'sv\tlevel\ttheme\ten\tflags\tsource',
    ...rows.map((r) => [r.sv, r.level, r.theme, clean(r.en), r.flags.join(','), r.source].join('\t')),
  ];
  writeFileSync(OUT, `${lines.join('\n')}\n`);
  const by = (f) => rows.filter(f).length;
  console.log(`${rows.length} words: A1 ${by((r) => r.level === 'A1')}, A2 ${by((r) => r.level === 'A2')}; from SweLLex ${by((r) => r.source.startsWith('SweLLex'))}, Kelly ${by((r) => r.source.startsWith('Kelly'))}, theme ${by((r) => r.source.startsWith('theme'))}; flagged ${by((r) => r.flags.length)} (no meaning ${by((r) => r.flags.includes('none'))})`);
}
