// Throwaway prototype seed content: Swedish for English speakers.
// Words unlock phrases (deps), phrases unlock patterns (deps). Unlocking is only shown on the map.

export const TOPICS = [
  { id: "core", name: "Basics", color: "#7a8b5c" },
  { id: "food", name: "Food & cooking", color: "#c0703a" },
  { id: "travel", name: "Travel", color: "#3d6fa8" },
  { id: "nature", name: "Nature & outdoors", color: "#3f8f55" },
];

// [sv, en, topic, forms?, extra?]  forms default to [sv]; extra: {def:[...], past:[...]}
const W = [
  ["jag", "I", "core"], ["du", "you", "core"], ["vi", "we", "core"], ["det", "it / that", "core"],
  ["är", "am / is / are", "core", ["är", "vara"], { past: ["var"] }],
  ["har", "have", "core", ["har", "ha"], { past: ["hade"] }],
  ["en", "a / an (en-word)", "core"], ["ett", "a / an (ett-word)", "core"], ["och", "and", "core"],
  ["i", "in", "core"], ["på", "on / at", "core"], ["till", "to / for", "core"], ["med", "with", "core"],
  ["inte", "not", "core"], ["vill", "want", "core", ["vill", "vilja"], { past: ["ville"] }],
  ["kan", "can", "core", ["kan", "kunna"], { past: ["kunde"] }],
  ["mycket", "much / very", "core"], ["här", "here", "core"], ["där", "there", "core"],
  ["idag", "today", "core"], ["nu", "now", "core"], ["också", "also", "core"], ["men", "but", "core"],
  ["går", "go / walk / leave", "core", ["går", "gå"], { past: ["gick"] }],
  ["åker", "go (by vehicle)", "core", ["åker", "åka"], { past: ["åkte"] }],
  ["ser", "see", "core", ["ser", "se"], { past: ["såg"] }],
  ["tycker", "think", "core", ["tycker", "tycka"]], ["om", "about", "core"], ["bra", "good / well", "core"],
  ["stor", "big", "core", ["stor", "stort", "stora"]], ["liten", "small", "core", ["liten", "litet", "lilla", "små"]],
  ["vad", "what", "core"], ["hur", "how", "core"], ["när", "when", "core"], ["finns", "exists", "core"],
  ["att", "to / that", "core"], ["varje", "every", "core"], ["dag", "day", "core", ["dag", "dagen", "dagar"], { def: ["dagen"] }],
  ["gillar", "like", "core", ["gillar", "gilla"], { past: ["gillade"] }], ["tack", "thanks", "core"],
  ["så", "so", "core"], ["få", "get / may have", "core", ["få", "får"]],
  ["morgon", "morning", "core", ["morgon", "morgonen"], { def: ["morgonen"] }], ["vid", "by / next to", "core"],
  ["många", "many", "core"],

  ["mat", "food", "food"], ["äter", "eat", "food", ["äter", "äta"], { past: ["åt"] }],
  ["dricker", "drink", "food", ["dricker", "dricka"], { past: ["drack"] }],
  ["kaffe", "coffee", "food", ["kaffe", "kaffet"], { def: ["kaffet"] }],
  ["te", "tea", "food", ["te", "teet"], { def: ["teet"] }],
  ["vatten", "water", "food", ["vatten", "vattnet"], { def: ["vattnet"] }],
  ["bröd", "bread", "food", ["bröd", "brödet"], { def: ["brödet"] }],
  ["ost", "cheese", "food", ["ost", "osten"], { def: ["osten"] }],
  ["smör", "butter", "food", ["smör", "smöret"], { def: ["smöret"] }],
  ["mjölk", "milk", "food", ["mjölk", "mjölken"], { def: ["mjölken"] }],
  ["äpple", "apple", "food", ["äpple", "äpplet", "äpplen"], { def: ["äpplet"] }],
  ["fisk", "fish", "food", ["fisk", "fisken"], { def: ["fisken"] }],
  ["soppa", "soup", "food", ["soppa", "soppan"], { def: ["soppan"] }],
  ["lagar", "cook / make", "food", ["lagar", "laga"], { past: ["lagade"] }],
  ["frukost", "breakfast", "food", ["frukost", "frukosten"], { def: ["frukosten"] }],
  ["middag", "dinner", "food", ["middag", "middagen"], { def: ["middagen"] }],
  ["kök", "kitchen", "food", ["kök", "köket"], { def: ["köket"] }],
  ["god", "tasty / good", "food", ["god", "gott", "goda"]],
  ["varm", "warm / hot", "food", ["varm", "varmt", "varma"]],
  ["kopp", "cup", "food", ["kopp", "koppen"], { def: ["koppen"] }],
  ["glas", "glass", "food", ["glas", "glaset"], { def: ["glaset"] }],

  ["tåg", "train", "travel", ["tåg", "tåget"], { def: ["tåget"] }],
  ["buss", "bus", "travel", ["buss", "bussen"], { def: ["bussen"] }],
  ["biljett", "ticket", "travel", ["biljett", "biljetten"], { def: ["biljetten"] }],
  ["station", "station", "travel", ["station", "stationen"], { def: ["stationen"] }],
  ["stad", "city", "travel", ["stad", "staden"], { def: ["staden"] }],
  ["hotell", "hotel", "travel", ["hotell", "hotellet"], { def: ["hotellet"] }],
  ["resa", "trip", "travel", ["resa", "resan"], { def: ["resan"] }],
  ["karta", "map", "travel", ["karta", "kartan"], { def: ["kartan"] }],
  ["väska", "bag", "travel", ["väska", "väskan"], { def: ["väskan"] }],
  ["rum", "room", "travel", ["rum", "rummet"], { def: ["rummet"] }],
  ["köper", "buy", "travel", ["köper", "köpa"], { past: ["köpte"] }],
  ["kostar", "cost", "travel", ["kostar", "kosta"]],
  ["billig", "cheap", "travel", ["billig", "billigt", "billiga"]],
  ["dyr", "expensive", "travel", ["dyr", "dyrt", "dyra"]],
  ["vänster", "left", "travel"], ["höger", "right", "travel"],

  ["skog", "forest", "nature", ["skog", "skogen"], { def: ["skogen"] }],
  ["sjö", "lake", "nature", ["sjö", "sjön"], { def: ["sjön"] }],
  ["träd", "tree", "nature", ["träd", "trädet"], { def: ["trädet"] }],
  ["berg", "mountain", "nature", ["berg", "berget"], { def: ["berget"] }],
  ["fågel", "bird", "nature", ["fågel", "fågeln", "fåglar", "fåglarna"], { def: ["fågeln"] }],
  ["sol", "sun", "nature", ["sol", "solen"], { def: ["solen"] }],
  ["regnar", "rain (verb)", "nature", ["regnar", "regna"], { past: ["regnade"] }],
  ["vandrar", "hike", "nature", ["vandrar", "vandra"], { past: ["vandrade"] }],
  ["blomma", "flower", "nature", ["blomma", "blomman", "blommor"], { def: ["blomman"] }],
  ["grön", "green", "nature", ["grön", "grönt", "gröna"]],
  ["vacker", "beautiful", "nature", ["vacker", "vackert", "vackra"]],
  ["väder", "weather", "nature", ["väder", "vädret"], { def: ["vädret"] }],
  ["badar", "swim / bathe", "nature", ["badar", "bada"], { past: ["badade"] }],
  ["tält", "tent", "nature", ["tält", "tältet"], { def: ["tältet"] }],
  ["kall", "cold", "nature", ["kall", "kallt", "kalla"]],
];

export const WORDS = W.map(([sv, en, topic, forms, extra]) => ({
  id: "w:" + sv, type: "word", sv, en, topic, forms: forms || [sv], deps: [],
  def: extra?.def || [], past: extra?.past || [],
}));

// [sv, en, topic, deps(word sv), forms?]
const P = [
  ["jag vill ha", "I'd like / I want", "core", ["jag", "vill", "har"]],
  ["kan jag få", "can I have", "core", ["kan", "jag", "få"]],
  ["tack så mycket", "thank you very much", "core", ["tack", "så", "mycket"]],
  ["god morgon", "good morning", "core", ["god", "morgon"]],
  ["varje dag", "every day", "core", ["varje", "dag"]],
  ["det finns", "there is / there are", "core", ["det", "finns"]],
  ["tycker om", "like", "core", ["tycker", "om"], ["tycker om", "tycka om"]],
  ["på morgonen", "in the morning", "core", ["på", "morgon"]],
  ["hur mycket", "how much", "core", ["hur", "mycket"]],
  ["en kopp kaffe", "a cup of coffee", "food", ["en", "kopp", "kaffe"]],
  ["ett glas vatten", "a glass of water", "food", ["ett", "glas", "vatten"]],
  ["lagar mat", "cook (a meal)", "food", ["lagar", "mat"], ["lagar mat", "laga mat", "lagade mat"]],
  ["äter frukost", "have breakfast", "food", ["äter", "frukost"], ["äter frukost", "äta frukost", "åt frukost"]],
  ["vad gott", "how tasty", "food", ["vad", "god"]],
  ["hur mycket kostar", "how much does … cost", "travel", ["hur", "mycket", "kostar"]],
  ["en biljett till", "a ticket to", "travel", ["en", "biljett", "till"]],
  ["åker tåg", "go by train", "travel", ["åker", "tåg"], ["åker tåg", "åka tåg", "åkte tåg"]],
  ["till vänster", "on / to the left", "travel", ["till", "vänster"]],
  ["till höger", "on / to the right", "travel", ["till", "höger"]],
  ["på hotellet", "at the hotel", "travel", ["på", "hotell"]],
  ["i skogen", "in the forest", "nature", ["i", "skog"]],
  ["vid sjön", "by the lake", "nature", ["vid", "sjö"]],
  ["det regnar", "it's raining", "nature", ["det", "regnar"], ["det regnar", "det regnade", "regnade det"]],
  ["vackert väder", "beautiful weather", "nature", ["vacker", "väder"]],
  ["i solen", "in the sun", "nature", ["i", "sol"]],
];

export const PHRASES = P.map(([sv, en, topic, deps, forms]) => ({
  id: "p:" + sv, type: "phrase", sv, en, topic, deps: deps.map((d) => "w:" + d), forms: forms || [sv],
}));

const VERB_INF = "äta|dricka|åka|gå|se|ha|få|köpa|laga|vandra|bada|vara|gilla|kosta|regna";
const FINITE = "är|har|vill|kan|äter|dricker|åker|går|ser|gillar|kostar|finns|regnar|lagar|köper|vandrar|badar|tycker";

export const PATTERNS = [
  { id: "g:v2", name: "Verb second (V2)", color: "#8e44ad",
    rule: "In a main clause the verb is always the second element. If something else comes first (Idag, På morgonen), the subject moves after the verb.",
    examples: ["Idag åker vi buss.", "På morgonen dricker jag kaffe."],
    regex: "(?:^|[.!?]\\s*)(?:idag|nu|på morgonen|varje dag|där|här)\\s+\\S+\\s+(?:jag|du|vi|det)\\b", deps: ["p:varje dag", "p:på morgonen"] },
  { id: "g:modal", name: "vill / kan + infinitive", color: "#d35400",
    rule: "After vill and kan the next verb is in the infinitive (no -r): vill äta, kan åka.",
    examples: ["Jag vill se berget.", "Vi kan gå nu."],
    regex: `\\b(?:vill|kan|ville|kunde)(?:\\s+(?:jag|du|vi|det))?(?:\\s+inte)?\\s+(?:${VERB_INF})\\b`, deps: ["p:jag vill ha", "p:kan jag få"] },
  { id: "g:neg", name: "inte after the verb", color: "#c0392b",
    rule: "inte (not) comes straight after the conjugated verb: Jag dricker inte kaffe.",
    examples: ["Du dricker inte mjölk.", "Biljetten är inte dyr."],
    regex: `\\b(?:${FINITE})(?:\\s+(?:jag|du|vi|det))?\\s+inte\\b`, deps: ["p:jag vill ha"] },
  { id: "g:def", name: "'the' is an ending", color: "#16a085",
    rule: "Swedish puts 'the' on the end of the noun: en skog → skogen, ett tåg → tåget.",
    examples: ["Soppan är varm och god.", "Vi badar i sjön."],
    regexFrom: "def", deps: ["p:i skogen", "p:vid sjön", "p:på hotellet"] },
  { id: "g:adjt", name: "Adjective + t with ett-words", color: "#2980b9",
    rule: "Adjectives get -t when describing an ett-word: ett stort hotell, vackert väder.",
    examples: ["Ett stort hotell är dyrt.", "Kaffet är varmt."],
    regex: "\\b(?:stort|litet|gott|varmt|billigt|dyrt|grönt|vackert|kallt)\\b", deps: ["p:vackert väder", "p:vad gott"] },
  { id: "g:finns", name: "det finns = there is", color: "#27ae60",
    rule: "det finns + noun says that something exists somewhere: Det finns bröd i köket.",
    examples: ["Det finns bröd i köket.", "Det finns många fåglar i skogen."],
    regex: "\\bdet finns\\b", deps: ["p:det finns"] },
  { id: "g:attinf", name: "gillar / tycker om att + infinitive", color: "#b8860b",
    rule: "To like doing something: gillar att / tycker om att + infinitive.",
    examples: ["Jag tycker om att laga mat.", "Gillar du att vandra?"],
    regex: `\\b(?:gillar|tycker om)(?:\\s+(?:du|vi))?\\s+att\\s+(?:${VERB_INF})\\b`, deps: ["p:tycker om"] },
  { id: "g:past", name: "Past tense", color: "#7f8c8d",
    rule: "Regular verbs add -de or -te (lagade, köpte). Common verbs are irregular (åt, drack, gick, såg, var).",
    examples: ["Vi lagade soppa idag.", "Jag köpte en stor väska."],
    regexFrom: "past", deps: ["p:lagar mat", "p:åker tåg"] },
  { id: "g:q", name: "Questions", color: "#e91e63",
    rule: "Start with a question word (vad, hur, när) or put the verb before the subject: Gillar du te?",
    examples: ["Gillar du te?", "När går bussen?"],
    regex: `(?:^|[.!]\\s*)(?:(?:vad|hur|när)\\b[^.?!]*|(?:${FINITE})\\s+(?:du|vi|jag|det)\\b[^.?!]*)\\?`, deps: ["p:hur mycket", "p:kan jag få"] },
  { id: "g:place", name: "Place: i / på / vid", color: "#5d6d7e",
    rule: "i = in (i skogen), på = on / at (på hotellet), vid = by (vid sjön).",
    examples: ["Vi har ett tält vid sjön.", "Det finns en karta på hotellet."],
    regex: "\\b(?:i|på|vid)\\s+(?:skogen|sjön|staden|köket|hotellet|stationen|berget|tältet|rummet|tåget|bussen|solen)\\b", deps: ["p:i skogen", "p:vid sjön", "p:på hotellet"] },
].map((p) => ({ ...p, type: "pattern", sv: p.name, en: p.rule, topic: "core" }));

// [sv, en, topic]
const S = [
  ["Jag vill ha en kopp kaffe.", "I'd like a cup of coffee.", "food"],
  ["Kan jag få ett glas vatten?", "Can I have a glass of water?", "food"],
  ["På morgonen dricker jag kaffe.", "In the morning I drink coffee.", "food"],
  ["Vi äter frukost i köket.", "We have breakfast in the kitchen.", "food"],
  ["Jag äter bröd med ost och smör.", "I eat bread with cheese and butter.", "food"],
  ["Idag lagar jag fisk till middag.", "Today I'm cooking fish for dinner.", "food"],
  ["Soppan är varm och god.", "The soup is warm and tasty.", "food"],
  ["Vad gott!", "How tasty!", "food"],
  ["Jag tycker om att laga mat.", "I like cooking.", "food"],
  ["Du dricker inte mjölk.", "You don't drink milk.", "food"],
  ["Vi lagade soppa idag.", "We made soup today.", "food"],
  ["Jag åt ett äpple på morgonen.", "I ate an apple in the morning.", "food"],
  ["Kaffet är varmt.", "The coffee is hot.", "food"],
  ["Gillar du te?", "Do you like tea?", "food"],
  ["Det finns bröd i köket.", "There is bread in the kitchen.", "food"],
  ["Varje dag äter jag frukost.", "Every day I have breakfast.", "food"],
  ["Jag vill inte dricka te nu.", "I don't want to drink tea now.", "food"],
  ["Jag vill ha en biljett till staden.", "I'd like a ticket to the city.", "travel"],
  ["Hur mycket kostar biljetten?", "How much does the ticket cost?", "travel"],
  ["Biljetten är inte dyr.", "The ticket isn't expensive.", "travel"],
  ["Vi åker tåg till staden.", "We're going to the city by train.", "travel"],
  ["Bussen går till stationen.", "The bus goes to the station.", "travel"],
  ["Hotellet är till vänster.", "The hotel is on the left.", "travel"],
  ["Stationen är till höger.", "The station is on the right.", "travel"],
  ["Det finns en karta på hotellet.", "There's a map at the hotel.", "travel"],
  ["Rummet är litet men billigt.", "The room is small but cheap.", "travel"],
  ["Jag köpte en stor väska.", "I bought a big bag.", "travel"],
  ["Kan jag få en karta?", "Can I have a map?", "travel"],
  ["Idag åker vi buss.", "Today we're taking the bus.", "travel"],
  ["Vi åkte tåg till staden.", "We went to the city by train.", "travel"],
  ["Ett stort hotell är dyrt.", "A big hotel is expensive.", "travel"],
  ["Jag gillar att åka tåg.", "I like travelling by train.", "travel"],
  ["Resan var bra.", "The trip was good.", "travel"],
  ["När går bussen?", "When does the bus leave?", "travel"],
  ["Vi vandrar i skogen.", "We're hiking in the forest.", "nature"],
  ["Det regnar idag.", "It's raining today.", "nature"],
  ["Solen är varm.", "The sun is warm.", "nature"],
  ["Vi badar i sjön.", "We're swimming in the lake.", "nature"],
  ["Det finns många fåglar i skogen.", "There are many birds in the forest.", "nature"],
  ["Trädet är stort och grönt.", "The tree is big and green.", "nature"],
  ["Vi har ett tält vid sjön.", "We have a tent by the lake.", "nature"],
  ["Vackert väder idag!", "Beautiful weather today!", "nature"],
  ["Vattnet är kallt.", "The water is cold.", "nature"],
  ["Jag ser en blomma.", "I see a flower.", "nature"],
  ["Det regnade på berget.", "It rained on the mountain.", "nature"],
  ["Gillar du att vandra?", "Do you like hiking?", "nature"],
  ["Jag vill se berget.", "I want to see the mountain.", "nature"],
  ["Vi vandrade till sjön.", "We hiked to the lake.", "nature"],
  ["Blomman är liten och vacker.", "The flower is small and beautiful.", "nature"],
  ["Idag badar vi inte.", "Today we're not swimming.", "nature"],
  ["Jag tycker om skogen.", "I like the forest.", "nature"],
  ["God morgon!", "Good morning!", "core"],
  ["Tack så mycket!", "Thank you very much!", "core"],
  ["Hur är vädret?", "How's the weather?", "nature"],
  ["Jag är här nu.", "I'm here now.", "core"],
  ["Vi kan gå nu.", "We can go now.", "core"],
  ["Det är varmt i solen.", "It's warm in the sun.", "nature"],
  ["Där är sjön!", "There's the lake!", "nature"],
  ["Där är stationen.", "There's the station.", "travel"],
  ["Jag dricker också te.", "I drink tea too.", "food"],
  ["Vi köper bröd och ost.", "We're buying bread and cheese.", "food"],
];

export const SENTENCES = S.map(([sv, en, topic], i) => ({ id: "s:" + i, sv, en, topic, source: "seed" }));

// ---- Demo learner state (round 3 model: ground, drilling, met counts, library) ----
const DAY = 86400000;
function rnd(seed) { let x = 0; for (const c of seed) x = (x * 31 + c.charCodeAt(0)) >>> 0; return ((x * 2654435761) >>> 0) / 4294967296; }

// Words the sample texts introduce, with simple-Swedish explanations (PR-p1-32).
const SAMPLE_WORDS = [
  ["ligger", "lies, is located", "finns på en plats", ["ligger", "ligga"]], ["de", "they", "flera personer", ["de"]],
  ["hon", "she", "en kvinna eller en flicka", ["hon"]], ["säger", "says", "talar, med ord", ["säger", "säga", "sa"]],
  ["ja", "yes", "motsatsen till nej", ["ja"]], ["lite", "a little", "inte mycket", ["lite"]],
  ["stanna", "stay", "inte gå, vara kvar", ["stanna", "stannar"]], ["hem", "home", "dit man bor", ["hem"]],
  ["varsågod", "here you go", "man säger det när man ger något", ["varsågod"]],
].map(([sv, en, explain_sv, forms]) => ({ id: "w:" + sv, type: "word", sv, en, explain_sv, topic: "core", forms, deps: [], def: [], past: [], source: "sample" }));

export const SAMPLE_LIBRARY = [
  { id: "lib:sample1", kind: "episode", title: "Sommar vid sjön – avsnitt 1", series: "series:sample", episode: 1, est: 4, sample: true,
    lines: [
      ["Lisa och Omar åker tåg till en liten stad.", "Lisa and Omar take the train to a small town."],
      ["Staden ligger vid en stor sjö.", "The town is by a big lake."],
      ["På morgonen går de till sjön.", "In the morning they go to the lake."],
      ["Solen är varm, men vattnet är kallt.", "The sun is warm, but the water is cold."],
      ["Omar badar, men Lisa vill inte bada.", "Omar swims, but Lisa doesn't want to swim."],
      ["Hon dricker kaffe och ser på fåglarna.", "She drinks coffee and looks at the birds."],
      ["Det finns många fåglar vid sjön.", "There are many birds by the lake."],
      ["– Vad vackert! säger Lisa.", "\"How beautiful!\" says Lisa."],
      ["Idag är en bra dag.", "Today is a good day."],
    ].map(([sv, en]) => ({ sv, en })),
    questions: [
      { q: "Hur åker Lisa och Omar till staden?", options: ["Med tåg", "Med buss"], answer: 0 },
      { q: "Vill Lisa bada?", options: ["Ja", "Nej, hon vill inte bada"], answer: 1 },
    ] },
  { id: "lib:sample2", kind: "dialogue", title: "På kaféet", est: 3, sample: true,
    lines: [
      ["Erik", "God morgon! Vad vill du ha?", "Good morning! What would you like?"],
      ["Anna", "Jag vill ha en kopp kaffe, tack.", "I'd like a cup of coffee, please."],
      ["Erik", "Vill du ha bröd också?", "Would you like bread too?"],
      ["Anna", "Ja, bröd med ost och smör.", "Yes, bread with cheese and butter."],
      ["Erik", "Varsågod!", "Here you go!"],
      ["Anna", "Tack så mycket! Hur mycket kostar det?", "Thank you very much! How much is it?"],
      ["Erik", "Det är inte dyrt.", "It isn't expensive."],
      ["Anna", "Bra!", "Good!"],
    ].map(([speaker, sv, en]) => ({ speaker, sv, en })),
    questions: [{ q: "Vad vill Anna ha?", options: ["En kopp kaffe", "Ett glas vatten"], answer: 0 }] },
  { id: "lib:sample3", kind: "cyoa", title: "I skogen", est: 3, sample: true, lines: [],
    nodes: [
      { id: "start", lines: [["Du vandrar i skogen.", "You're hiking in the forest."], ["Det regnar lite.", "It's raining a little."], ["Du ser ett tält och en sjö.", "You see a tent and a lake."]],
        choices: [{ sv: "Gå till tältet", en: "Go to the tent", to: "tent" }, { sv: "Gå till sjön", en: "Go to the lake", to: "lake" }] },
      { id: "tent", lines: [["I tältet finns det en karta.", "In the tent there's a map."], ["På kartan ser du stationen.", "On the map you see the station."], ["Du åker tåg hem.", "You take the train home."]], choices: [] },
      { id: "lake", lines: [["Vid sjön är det kallt.", "By the lake it's cold."], ["Du ser en stor fågel.", "You see a big bird."], ["Fågeln är vacker. Du vill stanna.", "The bird is beautiful. You want to stay."]], choices: [] },
    ].map((n) => ({ ...n, lines: n.lines.map(([sv, en]) => ({ sv, en })) })),
    questions: [] },
];

export function buildDemoState(now = Date.now()) {
  const ground = {}, drill = {}, srs = {}, met = {};
  const fading = ["w:smör", "w:mjölk", "w:karta", "w:biljett", "w:middag", "p:hur mycket"];
  const drilling = ["w:kopp", "w:glas", "w:säger", "w:stanna"];
  for (const w of WORDS) {
    const r = rnd(w.id);
    const p = { core: 0.92, food: 0.8, travel: 0.65, nature: 0.5 }[w.topic];
    if (!fading.includes(w.id) && !drilling.includes(w.id) && r < p) ground[w.id] = { since: now - (5 + r * 40) * DAY, via: "sample" };
  }
  for (const w of SAMPLE_WORDS) if (!drilling.includes(w.id)) ground[w.id] = { since: now - DAY, via: "sample" };
  for (const id of ["p:jag vill ha", "p:kan jag få", "p:tack så mycket", "p:god morgon", "p:varje dag", "p:det finns", "p:tycker om",
    "p:på morgonen", "p:en kopp kaffe", "p:ett glas vatten", "p:äter frukost", "p:åker tåg", "p:en biljett till", "p:i skogen"]) ground[id] = { since: now - 10 * DAY, via: "sample" };
  for (const id of fading) { drill[id] = { since: now - 12 * DAY }; srs[id] = { stab: 2, last: now - 6 * DAY, reps: 2 }; }
  for (const id of drilling) { drill[id] = { since: now - 2 * DAY }; srs[id] = { stab: 2.5, last: now - 0.5 * DAY, reps: 2 }; }
  for (const id of ["g:v2", "g:modal", "g:neg", "g:finns", "g:place"]) srs[id] = { stab: 9 + rnd(id) * 10, last: now - (1 + rnd(id) * 2) * DAY, reps: 3 };
  srs["g:def"] = { stab: 5, last: now - 10 * DAY, reps: 3 };
  srs["g:attinf"] = { stab: 1.5, last: now - 0.5 * DAY, reps: 1 };
  for (const id of [...Object.keys(ground), ...Object.keys(drill)]) met[id] = 1 + Math.floor(rnd("m" + id) * 25);

  // Input and practice history for the progress view: 14 days, a 5-day streak.
  const history = [], inputLog = [];
  const ids = Object.keys(drill);
  for (let d = 13; d >= 0; d--) {
    if (d === 6 || d === 9 || d === 10) continue;
    inputLog.push({ t: now - d * DAY, ms: (10 + rnd("in" + d) * 35) * 60000, kind: d % 3 ? "reading" : "listening" });
    for (let k = 0; k < 4; k++) history.push({ t: now - d * DAY - k * 60000, id: ids[k % ids.length], ok: rnd("o" + d + k) > 0.3, ex: ["flashcard", "mc", "tiles", "gap"][k] });
  }
  const g = Object.keys(ground).length;
  const snapshots = [];
  for (let d = 13; d >= 0; d--) snapshots.push({ date: new Date(now - d * DAY).toISOString().slice(0, 10), learned: Math.round(g * (0.6 + 0.4 * (13 - d) / 13)) });

  return {
    version: 3, createdAt: now, ground, drill, srs, met, contexts: {}, history, inputLog, snapshots,
    sliders: { reading: 60, listening: 40, vocabulary: 40, grammar: 30, writing: 20 },
    difficulty: { knownShare: 0.95, short: false, goodStreak: 0 },
    settings: { hideEnglishFrom: "", speed: 0.9 },
    seenWelcome: false,
    series: [{ id: "series:sample", title: "Sommar vid sjön", topic: "a summer by a lake", episodes: 1,
      summary: "Lisa and Omar take the train to a small town by a big lake. In the morning Omar swims; Lisa drinks coffee and watches the birds.",
      lastNew: ["ligger", "de", "hon", "säger"] }],
    library: SAMPLE_LIBRARY.map((x) => ({ ...x, created: now, read: false, rating: null })),
    custom: {
      words: SAMPLE_WORDS, phrases: [], topics: [], extraForms: {}, names: ["Lisa", "Omar", "Erik", "Anna"],
      sentences: SAMPLE_LIBRARY.flatMap((x) => [...x.lines, ...(x.nodes || []).flatMap((n) => n.lines)].map((l, i) => ({ id: `${x.id}:${i}`, sv: l.sv, en: l.en, topic: "core", source: "sample" }))),
    },
    explanations: {}, pkg: null,
  };
}

// A new account starts empty: no sample texts (PR-p1-70 dropped), normal speech speed (PR-p1-93), starting level not set yet (PR-p1-115).
export function buildEmptyState(now = Date.now()) {
  const d = buildDemoState(now);
  return { ...d, ground: {}, drill: {}, srs: {}, met: {}, contexts: {}, history: [], inputLog: [], snapshots: [], library: [], series: [], explanations: {}, pkg: null,
    settings: { ...d.settings, speed: 1 }, seenWelcome: false, startLevel: null, bankChoices: {}, sharedAdded: [] };
}
