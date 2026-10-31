// Content tool, not part of grove's build: finds grammar patterns in every library text (texts/ and
// texts-pending/) and writes content/library/patterns/<level>.json (see content/library/README.md,
// "Grammar patterns"). Rule-based, with the word list's forms and Kelly's parts of speech, so its places
// are a first pass to review. Usage: node content/library/patterns/find-patterns.mjs
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const R = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const { splitSentences } = await import(`${R}/server/words/sentences.mjs`);
const { tokenize } = await import(`${R}/server/words/tokens.mjs`);
const { IRREGULAR } = await import(`${R}/server/words/irregular.mjs`);
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const ladder = JSON.parse(readFileSync(`${R}/content/learning/grammar/patterns.json`, 'utf8')).patterns;
const L = Object.fromEntries(ladder.map((p) => [p.id, p]));

// Kelly parts of speech; word-list forms (form → lemmas) and headwords.
const pos = new Map();
for (const line of readFileSync(`${R}/server/levels/kelly-sv.tsv`, 'utf8').split('\n')) {
  const f = line.split('\t'); if (f.length < 4 || f[0] === 'lemma' || line.startsWith('#')) continue;
  if (!pos.has(f[0])) pos.set(f[0], new Set()); pos.get(f[0]).add(f[3]);
}
const forms = new Map(); const heads = new Set();
for (const line of readFileSync(`${R}/server/lexicon/sv-en.tsv`, 'utf8').split('\n')) {
  const [k, a, b] = line.split('\t');
  if (k === 'w') heads.add(a);
  else if (k === 'f') { if (!forms.has(a)) forms.set(a, new Set()); forms.get(a).add(b); }
}
const lemmas = (w) => { const s = new Set(); if (pos.has(w) || heads.has(w)) s.add(w); for (const l of forms.get(w) || []) s.add(l); for (const l of IRREGULAR.get(w) || []) s.add(l); return [...s]; };
const isPos = (l, p) => pos.get(l)?.has(p);
const verbLemma = (w) => lemmas(w).find((l) => isPos(l, 'verb'));
const nounLemma = (w) => lemmas(w).find((l) => isPos(l, 'noun'));
const adjLemma = (w) => lemmas(w).find((l) => isPos(l, 'adjective'));

const SUBJ = new Set(['jag', 'du', 'han', 'hon', 'den', 'det', 'vi', 'ni', 'de', 'man', 'hen']);
const MODALS = new Set(['kan', 'kunde', 'vill', 'ville', 'måste', 'får', 'fick', 'bör', 'borde', 'kunna', 'vilja', 'behöver', 'brukar', 'brukade', 'tänker', 'försöker', 'slipper']);
const MODAL_LADDER = new Set(['kan', 'kunde', 'vill', 'ville', 'måste', 'får', 'bör', 'borde']);
const STRONG_PAST = new Set(['var', 'hade', 'gick', 'kom', 'såg', 'tog', 'fick', 'gav', 'sa', 'sade', 'drack', 'skrev', 'satt', 'stod', 'sov', 'for', 'flög', 'föll', 'höll', 'hann', 'fann', 'drog', 'bar', 'bad', 'bröt', 'sjöng', 'sprang', 'vann', 'dog', 'log', 'ljög', 'grät', 'skrek', 'steg', 'sköt', 'slog', 'valde', 'sålde', 'frös', 'gjorde', 'visste', 'kunde', 'ville', 'lät', 'sjönk', 'slapp', 'blev', 'fanns', 'åkte', 'lade', 'sade', 'lyfte', 'hette', 'låg', 'åt', 'vek', 'trädde', 'skar', 'band', 'vände', 'fick', 'bjöd', 'ströck', 'drev', 'kröp', 'flöt', 'nös', 'smög', 'tvang', 'ljöd', 'red', 'skrattade']);
const PRESENT_IRR = new Set(['är', 'har', 'gör', 'vet', 'kan', 'vill', 'ska', 'skall', 'går', 'får', 'står', 'ser', 'ber', 'dör', 'bör', 'tar', 'ger', 'drar', 'ler', 'bor', 'sker', 'når', 'mår', 'syr', 'tror', 'bär']);
const PARTICLES = ['om', 'ihåg', 'upp', 'ut', 'in', 'av', 'på', 'med', 'bort', 'fram', 'tillbaka', 'ner', 'igen', 'till', 'över', 'efter', 'undan', 'hem', 'ifrån', 'emot', 'åt', 'isär', 'ihop', 'sönder', 'iväg', 'kvar'];
const WEAK_P = new Set(['till', 'på', 'med', 'efter', 'över', 'åt', 'om', 'i']);
const STRONG_PAIRS = new Set(['tycka om', 'hälsa på', 'sätta på', 'hålla på', 'passa på', 'ta på', 'hålla med', 'ta med', 'följa med', 'vara med', 'hänga med', 'hjälpa till', 'lägga till', 'säga till', 'se till', 'ta över', 'tänka om', 'göra om', 'byta om', 'turas om', 'höra av', 'ta hand om', 'tycka till', 'gå till', 'komma till']);
const REFLEX = new Set(['mig', 'dig', 'sig', 'oss', 'er']);
const POSS = new Set(['min', 'mitt', 'mina', 'din', 'ditt', 'dina', 'vår', 'vårt', 'våra', 'er', 'ert', 'era']);
const SIN = new Set(['sin', 'sitt', 'sina']);
const DEPONENT = new Set(['hoppas', 'minnas', 'minns', 'mindes', 'träffas', 'träffades', 'finns', 'finnas', 'fanns', 'funnits', 'trivs', 'trivas', 'trivdes', 'umgås', 'umgicks', 'kännas', 'känns', 'kändes', 'synas', 'syns', 'syntes', 'lyckas', 'lyckades', 'andas', 'skämmas', 'skäms', 'brottas', 'samlas', 'samlades', 'mötas', 'möts', 'möttes', 'ses', 'sågs', 'turas', 'låtsas', 'svettas', 'åldras', 'hoppades', 'hörs', 'märks', 'märktes', 'fattas', 'tycks', 'verkar', 'kräks', 'pratas', 'bråkas', 'enas', 'slåss', 'retas', 'hjälps', 'avundas', 'vistas', 'trängas', 'trängdes', 'brottades', 'ångras', 'växlas', 'skiljas', 'skildes', 'samarbetas', 'kallas']);
// -s forms of verbs above that are passives or reciprocals, not deponents
const NOT_DEP = new Set(['verkar', 'kallas', 'hörs', 'märks', 'märktes', 'fattas', 'pratas', 'hjälps']);
const SUBORD = new Set(['eftersom', 'medan', 'innan', 'tills', 'fast', 'därför', 'så', 'om', 'när', 'att', 'om', 'ifall', 'trots', 'även', 'sedan', 'än', 'vilket']);
const QWORDS = new Set(['vad', 'var', 'vart', 'hur', 'vem', 'vems', 'varför', 'vilken', 'vilket', 'vilka', 'när']);
const IMPER = new Set(['sätt', 'ta', 'kom', 'glöm', 'ställ', 'gå', 'titta', 'vänta', 'ring', 'skynda', 'börja', 'tänk', 'lägg', 'drick', 'ät', 'hör', 'låt', 'säg', 'ge', 'hjälp', 'skriv', 'läs', 'stäng', 'öppna', 'se', 'kolla', 'ursäkta', 'förlåt', 'var', 'gör', 'håll', 'prova', 'fråga', 'krya', 'akta', 'lyssna', 'kör', 'visa', 'res', 'spring', 'sov', 'vila', 'drick', 'undvik', 'föreställ', 'skriv', 'mät', 'tänd', 'stanna', 'boka', 'köp', 'bjud']);
const FRONTERS = new Set(['sedan', 'då', 'nu', 'ibland', 'i', 'på', 'efter', 'först', 'här', 'där', 'varje', 'ofta', 'i dag', 'därför', 'tyvärr', 'snart', 'till', 'under', 'om', 'när', 'klockan', 'förra', 'nästa', 'hemma', 'dessutom', 'ändå', 'samtidigt', 'kanske', 'också', 'senare', 'förr', 'sen', 'efteråt', 'vid', 'med', 'utan', 'trots', 'ute', 'inne', 'tidigare', 'i morgon', 'igår', 'numera', 'i går', 'idag', 'egentligen', 'faktiskt', 'oftast', 'annars', 'därefter', 'till sist', 'till slut', 'plötsligt', 'redan', 'alltid', 'aldrig', 'tillsammans', 'hela', 'efter', 'framför', 'bakom', 'bland', 'enligt', 'för', 'över', 'mellan']);

const OFF = {
  'det-finns': { name: 'There is: det finns', explain_en: 'Swedish says "there is" or "there are" with det finns (det fanns in the past): Det finns en park här. The thing that exists comes after finns.', level: 'A1', reason: 'A fixed everyday chunk met from the first texts, like the A1 present tense (G-A1-01) it is built on.' },
  'imperative': { name: 'Commands: the verb stem (Ta! Kom! Sätt dig!)', explain_en: 'A command uses the verb without -r, the same as the infinitive without its -a ending if it has one: Ta en kaka! Sätt dig! Glöm inte nyckeln!', level: 'A2', reason: 'Built from the infinitive, which the ladder brings in at A2 with modal verbs (G-A2-04).' },
  'att-inf': { name: 'To do: att + infinitive', explain_en: 'After many verbs, adjectives and nouns, Swedish uses att + the infinitive, like English "to": Det är roligt att läsa. Hon slutade att röka.', level: 'A2', reason: 'The infinitive after a word, as in modal verb + infinitive (G-A2-04), which is A2 on the ladder.' },
  'genitive': { name: "Whose: the -s genitive (Annas bok)", explain_en: "Add -s to a name or noun to show who owns something, with no apostrophe: Annas bror, kommunens app. The thing owned comes after, without its own ending.", level: 'A1', reason: 'Possession is A1 on the ladder (min, mitt, mina: G-A1-08); the -s genitive is the same idea for names and nouns.' },
  'for-att': { name: 'In order to: för att + infinitive', explain_en: 'För att + infinitive says why someone does something: Hon flyttade för att plugga. It answers the question varför?', level: 'B1', reason: 'A purpose clause, taught with the B1 subordinate clauses (G-B1-01, G-B1-02).' },
  'man': { name: 'man: one, you, people', explain_en: 'man is a subject meaning people in general, like English "you" or "one": Man får inte röka här. It takes the same verb form as every other subject.', level: 'A2', reason: 'A general subject used in simple A2 statements about rules and habits; no new verb form, so just after the A1 basics.' },
  'participle-adj': { name: 'Done to it: past participles as adjectives (stängd, lagad)', explain_en: 'A past participle describes a noun like an adjective and agrees with it: en stängd dörr, ett stängt fönster, stängda butiker. It often ends in -d, -t or -en.', level: 'B2', reason: 'The same participles the B2 passive with bli uses (G-B2-03); agreement follows the A2 adjective rules (G-A2-05).' },
  'inte-bara': { name: 'Not only … but also: inte bara … utan också', explain_en: 'inte bara … utan (också) joins two things where the second adds more: Det handlar inte bara om pengar, utan också om tid.', level: 'B2', reason: 'A two-part linking phrase for building arguments, used in B2 opinion texts; it needs the B1 clause patterns first.' },
  'ju-desto': { name: 'The more … the more: ju … desto (ju)', explain_en: 'ju + comparative … desto (or ju) + comparative links two changes: Ju mer man läser, desto lättare blir det. Note the verb comes after the subject in the ju part.', level: 'B2', reason: 'Builds on A2 comparatives (G-A2-07) with an unusual word order; used in B2 argument texts.' },
  'brukar': { name: 'Usually: brukar + infinitive', explain_en: 'brukar + infinitive says what someone usually does: Jag brukar cykla till jobbet. brukade is the past: Vi brukade bada här.', level: 'A2', reason: 'Works like the A2 modal verbs (G-A2-04): a verb + infinitive.' },
  'hålla-på': { name: 'In the middle of: håller på att + infinitive', explain_en: 'håller på att + infinitive says something is going on right now or is about to happen: Vi håller på att flytta. Han höll på att ramla.', level: 'B1', reason: 'Swedish has no -ing tense; this phrase for an ongoing action comes after the A2 tenses and is common at B1.' },
};

function detect(text) {
  const found = new Map(); // key → places
  const add = (key, line, words) => { if (!found.has(key)) found.set(key, []); const p = found.get(key); if (p.length < 20 && words.length <= 80 && !p.some((x) => x.line === line && x.words === words)) p.push({ text: 1, line, words }); };
  const names = new Set((text.names || []).map((n) => n.toLowerCase()));
  text.lines.forEach((ln, li) => {
    const line = li + 1;
    for (const sentence of splitSentences(ln.sv)) {
      const t = tokenize(sentence); const w = t.map((x) => x.word); const raw = t.map((x) => x.raw);
      const span = (a, b) => raw.slice(a, b + 1).join(' ');
      const isQ = /\?\s*["”»]?$/.test(sentence.trim());
      // the first word of the clause (after a dash or quote)
      for (let i = 0; i < w.length; i += 1) {
        const x = w[i]; const v = verbLemma(x); const prev = w[i - 1]; const next = w[i + 1];
        // A1-01 present -r
        if (v && x !== v && x.endsWith('r') && (PRESENT_IRR.has(x) || x === v + 'r' || x === v.slice(0, -1) + 'er' || x === v.slice(0, -1) + 'r')) {
          if (!(nounLemma(x) && !PRESENT_IRR.has(x) && !SUBJ.has(prev ?? '') && !SUBJ.has(next ?? '') && !names.has(prev ?? ''))) add('G-A1-01', line, raw[i]);
        }
        // A1-07 inte after the verb
        if (x === 'inte' && i > 0) {
          const pv = verbLemma(prev);
          if (pv && !['att', 'som'].includes(w[i - 2])) add('G-A1-07', line, span(i - 1, i));
          else if (SUBJ.has(prev) && verbLemma(w[i - 2])) add('G-A1-07', line, span(i - 2, i));
        }
        // A1-08 possessives
        if (POSS.has(x) && !(x === 'er' && !nounLemma(next ?? '')) && next && (nounLemma(next) || adjLemma(next) || x !== 'vår')) {
          if (!(x === 'mitt' && ['i', 'på', 'under', 'emot'].includes(next))) add('G-A1-08', line, span(i, i + 1));
        }
        // genitive: Name+s or noun-s + noun
        if (x.endsWith('s') && x.length > 3 && (names.has(x.slice(0, -1)) || (t[i].capitalised && i > 0)) && next && (nounLemma(next) || adjLemma(next))) add('genitive', line, span(i, i + 1));
        else if (x.endsWith('ens') || x.endsWith('ets') || x.endsWith('arnas') || x.endsWith('ernas')) { if (nounLemma(x.slice(0, -1)) && next && (nounLemma(next) || adjLemma(next))) add('genitive', line, span(i, i + 1)); }
        // A2-01 past
        if (v && x !== v && (STRONG_PAST.has(x) || ((x.endsWith('ade') || x.endsWith('de') || x.endsWith('te')) && (x === v.slice(0, -1) + 'ade' || x === v + 'de' || x === v.slice(0, -1) + 'de' || x === v.slice(0, -1) + 'te' || x === v + 'dde' || x === v.slice(0, -2) + 'de' || x === v.slice(0, -2) + 'te')))) {
          if (!['den', 'det', 'de', 'en', 'ett', 'sina', 'mina', 'hans', 'hennes'].includes(prev) || SUBJ.has(next ?? '')) add('G-A2-01', line, raw[i]);
        }
        // perfect / pluperfect: har/hade + (inte|subject|adverb)* + supine
        if (['har', 'hade', 'ha', 'haft'].includes(x) || (x === 'har' && 0)) {
          for (let j = i + 1; j <= Math.min(i + 3, w.length - 1); j += 1) {
            const y = w[j]; const yv = verbLemma(y);
            if (yv && y !== yv && (y.endsWith('t') || y.endsWith('it')) && !PRESENT_IRR.has(y) && !y.endsWith('ar') && !isPos(y, 'adverb')) {
              const key = x === 'hade' ? 'G-B2-01' : 'G-A2-02';
              add(key, line, j - i <= 3 ? span(i, j) : `${raw[i]}`);
              break;
            }
            if (!(SUBJ.has(y) || ['inte', 'aldrig', 'redan', 'också', 'just', 'nyligen', 'alltid', 'ofta', 'länge', 'faktiskt', 'ännu', 'äntligen', 'själv', 'bara'].includes(y))) break;
          }
        }
        // A2-03 future
        if (['ska', 'skall'].includes(x) && next && (verbLemma(next) === next || (SUBJ.has(next) && verbLemma(w[i + 2]) === w[i + 2]))) add('G-A2-03', line, SUBJ.has(next) ? span(i, i + 2) : span(i, i + 1));
        if (['kommer', 'kom'].includes(x) && next === 'att' && verbLemma(w[i + 2]) === w[i + 2]) add('G-A2-03', line, span(i, i + 2));
        // A2-04 modal + infinitive
        if (MODAL_LADDER.has(x)) {
          let j = i + 1; while (j < w.length && (SUBJ.has(w[j]) || ['inte', 'också', 'alltid', 'aldrig', 'ju', 'gärna', 'bara', 'nog', 'verkligen', 'snart', 'själv', 'då'].includes(w[j])) && j - i < 3) j += 1;
          if (w[j] && verbLemma(w[j]) === w[j] && w[j] !== 'att') add('G-A2-04', line, span(i, j));
        }
        // B2-02 skulle + infinitive
        if (x === 'skulle') {
          let j = i + 1; while (j < w.length && (SUBJ.has(w[j]) || ['inte', 'också', 'aldrig', 'ju', 'gärna', 'bara', 'nog', 'verkligen', 'kanske', 'själv'].includes(w[j])) && j - i < 3) j += 1;
          const isPast = (y) => { const yv = verbLemma(y); return STRONG_PAST.has(y) && y !== 'skulle' || (yv && y !== yv && /(ade|de|te|dde)$/.test(y)); };
          if (w[j] && verbLemma(w[j]) === w[j] && !w.slice(0, i).some(isPast)) add('G-B2-02', line, span(i, j));
        }
        // brukar
        if (['brukar', 'brukade'].includes(x)) { let j = i + 1; while (j < w.length && (SUBJ.has(w[j]) || w[j] === 'inte') && j - i < 3) j += 1; if (w[j] && verbLemma(w[j]) === w[j]) add('brukar', line, span(i, j)); }
        // A2-08 reflexive
        const agrees = { mig: 'jag', dig: 'du', oss: 'vi', er: 'ni' };
        if (REFLEX.has(x) && i > 0 && (x === 'sig' || w.includes(agrees[x]) || (x === 'dig' && w[0] && IMPER.has(w[0])))) { const pv = verbLemma(prev); if (pv && !['på', 'till', 'med', 'för', 'om', 'åt', 'mot', 'hos', 'av', 'från', 'efter', 'i', 'bland', 'utan', 'under', 'över'].includes(prev)) add('G-A2-08', line, span(i - 1, i)); else if (SUBJ.has(prev) && verbLemma(w[i - 2])) add('G-A2-08', line, span(i - 2, i)); }
        // A2-07 comparing
        if ((x.endsWith('are') || x.endsWith('ast') || x.endsWith('aste')) && adjLemma(x) && adjLemma(x) !== x && !(['tidigare', 'senare', 'senast', 'tidigast'].includes(x) && !w.slice(i + 1, i + 5).includes('än'))) add('G-A2-07', line, raw[i]);
        if (['tidigare', 'senare', 'längre', 'närmare', 'hellre', 'helst', 'tidigast', 'senast'].includes(x) && !w.slice(i + 1, i + 5).includes('än')) { /* adverb, not a comparison */ } else if (['större', 'störst', 'största', 'bättre', 'bäst', 'bästa', 'sämre', 'sämst', 'mindre', 'minst', 'minsta', 'äldre', 'äldst', 'äldsta', 'yngre', 'yngst', 'yngsta', 'fler', 'flest', 'högre', 'högst', 'längre', 'längst', 'lägre', 'färre', 'tyngre', 'hellre', 'helst'].includes(x)) add('G-A2-07', line, raw[i]);
        if (['mer', 'mest', 'mindre'].includes(x) && next && adjLemma(next) && !nounLemma(next)) add('G-A2-07', line, span(i, i + 1));
        // A2-06 den stora bilen
        if (['den', 'det', 'de'].includes(x) && next && adjLemma(next) && (next.endsWith('a') || next.endsWith('e')) && w[i + 2] && nounLemma(w[i + 2]) && /(en|et|na|n|t)$/.test(w[i + 2])) add('G-A2-06', line, span(i, i + 2));
        // B1-01 subordinate: att + subject; eftersom/medan/innan/tills/fast/även om + subject
        if (x === 'att' && next && SUBJ.has(next) && prev !== 'för' && !(verbLemma(next) === next)) add('G-B1-01', line, span(i, i + 1));
        if (['eftersom', 'medan', 'innan', 'tills', 'fastän'].includes(x) && next && (SUBJ.has(next) || nounLemma(next) || names.has(next))) add('G-B1-01', line, span(i, i + 1));
        if (x === 'om' && prev === 'även' && next) add('G-B1-01', line, span(i - 1, i + 1));
        // B1-02 starting with När/Om/Eftersom/Innan/Medan/Sedan + clause, then V
        if (i === 0 || (i === 1 && raw[0] === '–')) {
          if (['när', 'om', 'eftersom', 'innan', 'medan', 'trots', 'även'].includes(x) && !isQ && sentence.includes(',')) add('G-B1-02', line, raw[i] + (x === 'trots' || x === 'även' ? ' ' + raw[i + 1] : ''));
        }
        // B1-03 som relative
        if (x === 'som' && i > 0 && !['så', 'lika', 'samma', 'sådan', 'sådana', 'sådant', 'precis', 'såsom', 'liksom'].includes(prev) && next && (verbLemma(next) || SUBJ.has(next) || ['inte', 'aldrig', 'redan', 'ofta', 'bara', 'själv'].includes(next)) && !(nounLemma(next) && !verbLemma(next))) {
          const pn = nounLemma(prev) || ['den', 'det', 'de', 'dem', 'alla', 'något', 'någon', 'ingen', 'inget', 'allt', 'många', 'flera', 'andra', 'dem', 'mycket', 'saker', 'folk', 'personer'].includes(prev) || (t[i - 1] && /[a-zåäö]/.test(prev));
          if (pn) add('G-B1-03', line, raw[i]);
        }
        // B1-04 indirect questions
        if (i > 1 && QWORDS.has(x) && !isQ && ['vet', 'visste', 'veta', 'undrar', 'undrade', 'fråga', 'frågar', 'frågade', 'förstå', 'förstår', 'förstod', 'berätta', 'berättar', 'berättade', 'förklara', 'förklarar', 'säga', 'bestämma', 'avgöra', 'se', 'ser', 'visar', 'tänka', 'tänker', 'beror', 'oklart', 'spelar'].some((v) => w.slice(Math.max(0, i - 3), i).includes(v))) add('G-B1-04', line, span(i, Math.min(i + 1, w.length - 1)));
        if (x === 'om' && i > 0 && ['undrar', 'undrade', 'frågar', 'frågade', 'vet', 'visste', 'osäker', 'ifrågasätter', 'tveksam'].includes(prev)) add('G-B1-04', line, span(i - 1, i));
        // B1-05 passive -s
        if (x.endsWith('s') && !DEPONENT.has(x) && x.length > 4) {
          const base = lemmas(x).find((l) => isPos(l, 'verb') && !l.endsWith('s'));
          const cand = base ?? [x.slice(0, -1), x.slice(0, -1) + 'a', x.slice(0, -2) + 'a', x.slice(0, -3) + 'a'].find((l) => isPos(l, 'verb') && !l.endsWith('s') && (x === l + 's' || x === l.slice(0, -1) + 's' || x === l + 'des' || x === l.slice(0, -1) + 'des' || x === l + 'ts' || x === l.slice(0, -1) + 'ts' || x === l.slice(0, -1) + 'ades' || x === l + 'tes'));
          if (cand && !nounLemma(x) && !['inom', 'utanför'].includes(x)) add('G-B1-05', line, raw[i]);
          else if (NOT_DEP.has(x) && x !== 'verkar') add('G-B1-05', line, raw[i]);
        }
        // B1-06 sin/sitt/sina
        if (SIN.has(x) && next) add('G-B1-06', line, span(i, i + 1));
        // B1-07 particle verbs (the pair is a headword in the word list)
        const okPair = (vv, pp) => heads.has(`${vv} ${pp}`) && (!WEAK_P.has(pp) || STRONG_PAIRS.has(`${vv} ${pp}`));
        if (v && next && PARTICLES.includes(next) && okPair(v, next)) add('G-B1-07', line, span(i, i + 1));
        if (v && next && SUBJ.has(next) && w[i + 2] && PARTICLES.includes(w[i + 2]) && okPair(v, w[i + 2])) add('G-B1-07', line, span(i, i + 2));
        // B2-03 bli passive
        if (['blir', 'blev', 'blivit', 'bli'].includes(x) && next && /(ad|at|ade|d|da|t|tt|en|et|na|ade)$/.test(next) && (verbLemma(next) || lemmas(next).some((l) => /(ad|d|en)$/.test(l))) && !adjLemma(next.replace(/(t|a)$/, '')) ) add('G-B2-03', line, span(i, i + 1));
        // B2-04 -ande/-ende
        if ((x.endsWith('ande') || x.endsWith('ende')) && x.length > 6 && !['ande', 'varande'].includes(x)) add('G-B2-04', line, raw[i]);
        // B2-06 deponents
        if (DEPONENT.has(x) && !NOT_DEP.has(x)) add('G-B2-06', line, raw[i]);
        // det finns
        if (x === 'det' && ['finns', 'fanns', 'funnits'].includes(next)) add('det-finns', line, span(i, i + 1));
        if (['finns', 'fanns'].includes(x) && next === 'det' && prev !== 'det') add('det-finns', line, span(i, i + 1));
        // att + infinitive / för att
        if (x === 'att' && next && verbLemma(next) === next && !['kommer', 'kom', 'håller', 'höll'].includes(prev)) { const purpose = prev === 'för' && !(w[i - 2] === 'sig' || adjLemma(w[i - 2] ?? '') || ['tack', 'ansvar', 'plats', 'tid', 'dags', 'risk', 'skäl', 'möjlighet', 'stöd', 'kritiserats', 'oroliga', 'orolig', 'rädd', 'rädda', 'beredd', 'beredda'].includes(w[i - 2])); add(purpose ? 'for-att' : 'att-inf', line, purpose ? span(i - 1, i + 1) : span(i, i + 1)); }
        if (['håller', 'höll'].includes(x) && next === 'på' && w[i + 2] === 'att') add('hålla-på', line, span(i, Math.min(i + 3, w.length - 1)));
        // man
        if (x === 'man' && i > 0 && (verbLemma(prev) || verbLemma(next ?? '')) && !adjLemma(prev) && !['en', 'den', 'min', 'hennes', 'hans', 'äldre', 'gammal', 'ung', 'yngre', 'ingen'].includes(prev)) add('man', line, raw[i]);
        else if (x === 'man' && i === 0 && next && verbLemma(next)) add('man', line, raw[i]);
        // B2-05 cleft
        if (x === 'det' && ['är', 'var'].includes(next) && w.slice(i + 2, i + 6).includes('som')) { const k = w.indexOf('som', i + 2); if (k > i + 2 && k - i <= 6) add('G-B2-05', line, span(i, k)); }
        // inte bara … utan; ju … desto
        if (x === 'inte' && next === 'bara' && w.slice(i + 2).includes('utan')) add('inte-bara', line, span(i, i + 1));
        if (x === 'ju' && next && (/(are|re)$/.test(next) || next === 'mer' || next === 'fler') && w.includes('desto')) add('ju-desto', line, span(i, i + 1));
        // C2-01, C2-03, C1-01
        if (['vore', 'leve'].includes(x) || (x === 'må' && next !== 'bra')) add('G-C2-01', line, raw[i]);
        if (['hur', 'vad', 'vem', 'var'].includes(x) && w.slice(i + 2, i + 7).includes('än')) { const k = w.indexOf('än', i + 2); add('G-C2-03', line, span(i, k)); }
        // participles as adjectives: en/ett/den/det/de + participle + noun
        if (['en', 'ett', 'den', 'det', 'de', 'sina', 'sin', 'sitt'].includes(prev) && /(ad|at|ade|ada|d|da|dd|dda|t|tt|ta)$/.test(x) && next && nounLemma(next) && !adjLemma(x) && lemmas(x).some((l) => isPos(l, 'verb') || /(ad|d)$/.test(l)) && !verbLemma(x)) add('participle-adj', line, span(i, i + 1));
        if (adjLemma(x) && /(ad|ade|ad e)$/.test(adjLemma(x)) && next && nounLemma(next)) add('participle-adj', line, span(i, i + 1));
      }
      // first content word (after a dash) for clause-initial patterns
      let s0 = 0; while (s0 < w.length && ['–'].includes(w[s0])) s0 += 1;
      // A1-06 questions: verb first, or question word + verb
      if (isQ) {
        const a = w[s0]; const b = w[s0 + 1];
        if (a && verbLemma(a) && a !== verbLemma(a) || ['är', 'har', 'kan', 'vill', 'ska', 'får', 'finns', 'gör', 'vet', 'tror', 'tycker', 'behöver', 'brukar', 'hade', 'var', 'skulle', 'kunde'].includes(a)) { if (b && (SUBJ.has(b) || names.has(b))) add('G-A1-06', line, span(s0, s0 + 1)); }
        else if (a && QWORDS.has(a) && b && verbLemma(b)) add('G-A1-06', line, span(s0, Math.min(s0 + 2, w.length - 1)));
      } else if (w[s0] && IMPER.has(w[s0]) && !SUBJ.has(w[s0 + 1] ?? '') && (sentence.trim().endsWith('!') || ['dig', 'mig', 'inte', 'den', 'det', 'med', 'en', 'ett', 'av', 'på', 'till', 'upp', 'ut', 'är', 'efter', 'gärna', 'bort', 'fram'].includes(w[s0 + 1] ?? ''))) {
        if (!(w[s0] === 'var' && !['snäll', 'så', 'försiktig', 'där', 'inte', 'lugn', 'tyst'].includes(w[s0 + 1])) && !(w[s0] === 'kom' && w[s0 + 1] === 'ihåg' && 0)) add('imperative', line, span(s0, s0 + (w[s0 + 1] === 'dig' || w[s0 + 1] === 'inte' ? 1 : 0)));
      }
      // A1-05 verb second after a fronted part: find the first finite verb; if words before it aren't the subject and a subject follows
      {
        let k = s0; const isFinite = (y) => { const yv = verbLemma(y); return (PRESENT_IRR.has(y) || STRONG_PAST.has(y) || MODALS.has(y) || ['ska', 'skulle', 'blir', 'blev', 'finns', 'fanns'].includes(y) || (yv && y !== yv && /(r|de|te|ade|dde)$/.test(y))); };
        while (k < w.length && !isFinite(w[k])) k += 1;
        if (k > s0 && k < w.length - 1 && FRONTERS.has(w[s0]) && (SUBJ.has(w[k + 1]) || names.has(w[k + 1])) && !SUBJ.has(w[s0]) && !isQ && k - s0 <= 6 && !w.slice(s0, k).some((y) => [',', 'och', 'som', 'att'].includes(y))) {
          if (!sentence.slice(0, sentence.indexOf(t[k].raw)).includes(',')) add(k - s0 >= 1 && ['den', 'det', 'detta', 'sådant'].includes(w[s0]) ? 'G-C1-03' : 'G-A1-05', line, span(k, k + 1));
        }
        if (k === s0 + 1 && ['det', 'den', 'detta', 'sådant'].includes(w[s0]) && k < w.length - 1 && SUBJ.has(w[k + 1]) && w[k + 1] !== 'det' && !isQ && !['är', 'var', 'blir', 'blev', 'finns', 'fanns', 'kostar', 'tar', 'går', 'gör'].includes(w[k]) ) add('G-C1-03', line, span(s0, k + 1));
        // C1-01: conditions without om: sentence starts with Hade/Skulle/Var/Om + subject … and a comma
        if (['hade', 'var', 'skulle', 'fick', 'kunde'].includes(w[s0]) && SUBJ.has(w[s0 + 1] ?? '') && !isQ && sentence.includes(',')) add('G-C1-01', line, span(s0, s0 + 1));
      }
    }
  });
  return found;
}

// Nominal style (C1-02) only in C1/C2 texts: -ning, -tion, -het, -else nouns in a row with a genitive or preposition.
function nominal(text, found) {
  text.lines.forEach((ln, li) => {
    const t = tokenize(ln.sv);
    for (let i = 0; i < t.length - 1; i += 1) {
      const x = t[i].word; const y = t[i + 1].word;
      if (/(ning|ningen|tion|tionen|het|heten|else|elsen|ande|andet)$/.test(x) && x.length > 7 && ['av', 'för', 'på', 'om', 'till', 'med', 'i'].includes(y) && t[i + 2]) {
        if (!found.has('G-C1-02')) found.set('G-C1-02', []);
        const p = found.get('G-C1-02'); if (p.length < 20) p.push({ text: 1, line: li + 1, words: `${t[i].raw} ${t[i + 1].raw} ${t[i + 2].raw}` });
      }
    }
  });
}

const outDir = `${R}/content/library/patterns`;
mkdirSync(outDir, { recursive: true });
const summary = {};
for (const level of LEVELS) {
  const out = { level, texts: [] };
  for (const dir of ['texts', 'texts-pending']) {
    const f = `${R}/content/library/${dir}/${level}.json`; if (!existsSync(f)) continue;
    for (const text of JSON.parse(readFileSync(f, 'utf8')).texts) {
      const found = detect(text);
      if (['C1', 'C2'].includes(level)) nominal(text, found);
      let pats = [...found.entries()].map(([key, places]) => {
        if (L[key]) return { name: L[key].name, explain_en: L[key].explain_en, level: L[key].level, ladder: key, places };
        const o = OFF[key]; return { name: o.name, explain_en: o.explain_en, level: o.level, ladder: null, level_reason: o.reason, places };
      });
      // a pattern above the text's level only where the text has it more than once; at most 20, highest levels first
      const at = LEVELS.indexOf(level);
      pats = pats.filter((p) => LEVELS.indexOf(p.level) <= at + 1 || p.places.length > 1);
      pats.sort((a, b) => LEVELS.indexOf(b.level) - LEVELS.indexOf(a.level) || b.places.length - a.places.length);
      pats = pats.slice(0, 20);
      pats.sort((a, b) => LEVELS.indexOf(a.level) - LEVELS.indexOf(b.level) || (a.ladder ?? 'z').localeCompare(b.ladder ?? 'z'));
      for (const p of pats) { summary[p.level] ??= { patterns: 0, places: 0, off: new Set() }; summary[p.level].patterns += 1; summary[p.level].places += p.places.length; if (!p.ladder) summary[p.level].off.add(p.name); }
      out.texts.push({ id: text.id, pending: dir === 'texts-pending' || undefined, patterns: pats });
    }
  }
  writeFileSync(`${outDir}/${level}.json`, `${JSON.stringify(out, null, 1)}\n`);
}
for (const [l, s] of Object.entries(summary)) console.log(l, s.patterns, 'pattern uses', s.places, 'places; off-ladder:', [...s.off].join(' | '));
