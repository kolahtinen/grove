// grove prototype UI. Throwaway: discovers requirements, not production code.
import { buildDemoState, buildEmptyState } from "./seed.js";
import {
  DAY, buildLexicon, annotate, status, strength, locked, atRisk, grade, meet, markDrill, addGround, snapshot, allItems,
  newItems, pickTarget, sentencesFor, EX_SKILL, SKILL_ACTIVITY, pickBySliders, STATUS_LABEL, isPattern,
  RATINGS, understood, applyRating, LEVELS, levelOf, inputHours,
} from "./core.js";
import {
  parseAnswer, fixPrompt, knownLemmas, fadingLemmas, unlearnedPhrases, UNIT, packagePrompt, checkPackage, textSentences,
  glossPrompt, checkGloss, topicPrompt, checkTopic, writingPrompt, checkWriting, grammarPrompt, checkGrammar,
} from "./prompts.js";

let state, lex, ai = { live: false };
const $ = (s) => document.querySelector(s);
// Prototype shortcut: let append/replaceChildren skip null/false children instead of printing "null".
for (const m of ["append", "replaceChildren"]) {
  const orig = Element.prototype[m];
  Element.prototype[m] = function (...k) { return orig.apply(this, k.filter((x) => x != null && x !== false)); };
}

function h(tag, attrs = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
    else if (k === "style" && typeof v === "object") Object.assign(el.style, v);
    else if (v !== false && v != null) el.setAttribute(k, v === true ? "" : v);
  }
  for (const k of kids.flat()) if (k != null && k !== false) el.append(k.nodeType ? k : String(k));
  return el;
}
const shuffle = (a) => a.map((x) => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map((p) => p[1]);
const norm = (s) => s.toLowerCase().replace(/[^\p{L}\s]/gu, " ").replace(/\s+/g, " ").trim();
const topicName = (id) => lex.topics.find((t) => t.id === id)?.name || id;
const fmtH = (hrs) => (hrs < 1 ? `${Math.round(hrs * 60)} min` : `${hrs.toFixed(1)} h`);

// ---------- persistence ----------
let saveTimer, me = null, bankData = { entries: [], freq: [], patternLevels: {} }, shared = { texts: [], deleted: [] };
async function api(url, body, method) {
  const r = await fetch(url, { method: method || (body ? "POST" : "GET"), headers: body ? { "content-type": "application/json" } : {}, body: body ? JSON.stringify(body) : undefined });
  const j = await r.json().catch(() => ({}));
  if (r.status === 401 && me) { me = null; authView(); }
  if (!r.ok) throw new Error(j.error || r.statusText);
  return j;
}
function save() {
  snapshot(state, lex);
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => api("/api/state", state, "PUT").catch(() => {}), 300);
}
function rebuild() { lex = buildLexicon(state); }

function setAi(live, reason) {
  ai = { live, reason };
  const el = $("#ai");
  el.className = "pill " + (live ? "live" : "off");
  el.textContent = live ? "AI: your API key" : "AI: copy-paste";
  el.title = reason || "";
}

// ---------- copy-paste AI exchange (PR-p1-24…PR-p1-27) ----------
async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true; }
  catch { const ta = h("textarea", { style: { position: "fixed", opacity: 0 } }, text); document.body.append(ta); ta.select(); const ok = document.execCommand("copy"); ta.remove(); return ok; }
}
function copyBtn(text, label = "Copy prompt") {
  const b = h("button", { class: "b", onclick: async () => { const ok = await copyText(text); b.textContent = ok ? "Copied ✓" : "Copy failed – select the text below"; setTimeout(() => (b.textContent = label), 2000); } }, label);
  return b;
}
function aiExchange({ title, prompt, check, accept, note }) {
  const box = h("div", { class: "exchange" });
  const status = h("div");
  const paste = h("textarea", { placeholder: "Paste the AI's whole answer here…", style: { minHeight: "120px" } });
  const tryAnswer = (text) => {
    const parsed = parseAnswer(text);
    const problems = parsed.problems || check(parsed.data);
    if (!problems.length) { status.replaceChildren(); accept(parsed.data); return true; }
    const fix = fixPrompt(problems);
    status.replaceChildren(h("div", { class: "notice" }, h("b", {}, "The answer doesn't fit yet:"), h("ul", {}, ...problems.slice(0, 10).map((p) => h("li", {}, p))),
      problems.length > 10 ? h("p", {}, `…and ${problems.length - 10} more (all are in the fix-it message).`) : null,
      ai.live ? null : h("div", {}, "Copy this fix-it message back into the same AI chat, then paste the new answer below.", h("div", { class: "row" }, copyBtn(fix, "Copy fix-it message")),
        h("details", {}, h("summary", {}, "Show fix-it message"), h("pre", { class: "prompt" }, fix)))));
    return fix;
  };
  const viaApi = ai.live ? h("button", { class: "b", onclick: async (e) => {
    e.target.disabled = true;
    const messages = [{ role: "user", content: prompt }];
    try {
      for (let attempt = 0; attempt < 3; attempt++) {
        status.replaceChildren(h("p", { class: "mute" }, attempt ? `Asking the AI to fix its answer (try ${attempt + 1})…` : "Asking the AI…"));
        const r = await fetch("/api/ai/run", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ messages }) });
        const j = await r.json();
        if (!r.ok) throw new Error(j.error);
        const res = tryAnswer(j.text);
        if (res === true) return;
        messages.push({ role: "assistant", content: j.text }, { role: "user", content: res });
      }
    } catch (err) { status.replaceChildren(h("p", { class: "bad" }, `AI failed: ${err.message}. You can still copy-paste below.`)); }
    e.target.disabled = false;
  } }, "Ask AI with your API key") : null;
  box.append(h("h3", {}, title), note ? h("p", { class: "mute" }, note) : null,
    viaApi ? h("div", { class: "row" }, viaApi, h("span", { class: "mute" }, "or copy-paste:")) : null,
    h("p", {}, h("b", {}, "1."), " Copy this prompt into your own AI chat (Claude, ChatGPT, Gemini…). ", copyBtn(prompt)),
    h("details", {}, h("summary", {}, "Show prompt"), h("pre", { class: "prompt" }, prompt)),
    h("p", {}, h("b", {}, "2."), " Paste the AI's answer:"), paste,
    h("button", { class: "b", onclick: () => paste.value.trim() && tryAnswer(paste.value) }, "Use answer"), status);
  return box;
}
function rememberInflections(list = []) {
  const ex = (state.custom.extraForms ||= {});
  for (const i of list) {
    const id = lex.formMap.get(String(i.lemma).toLowerCase());
    if (id && !lex.formMap.has(String(i.form).toLowerCase())) (ex[id] ||= []).push(String(i.form).toLowerCase());
  }
  rebuild();
}

// ---------- speech (PR-p1-22, PR-p1-34) ----------
let svVoice = null;
function pickVoice() { svVoice = speechSynthesis.getVoices().find((v) => v.lang?.toLowerCase().startsWith("sv")) || null; }
if ("speechSynthesis" in window) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
let warnedVoice = false;
function speak(text, onend) {
  if (!("speechSynthesis" in window)) return alert("This browser has no text-to-speech.");
  // X-p1-02: read aloud only with a Swedish voice; otherwise say so (once) instead of using a wrong voice.
  if (!svVoice && speechSynthesis.getVoices().length) {
    if (!warnedVoice) { warnedVoice = true; alert("There's no Swedish voice on this device, so grove can't read aloud. Add one in your device's text-to-speech settings (e.g. Settings → Accessibility → Text-to-speech)."); }
    return;
  }
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "sv-SE"; if (svVoice) u.voice = svVoice; u.rate = state.settings.speed;
  if (onend) u.onend = onend;
  speechSynthesis.speak(u);
}
const stopSpeech = () => "speechSynthesis" in window && speechSynthesis.cancel();
const play = (text) => h("button", { class: "play", title: "Listen", onclick: (e) => { e.stopPropagation(); speak(text); } }, "▶");

// ---------- English hiding (PR-p1-32) ----------
function englishHidden() {
  const from = state.settings.hideEnglishFrom;
  if (!from) return false;
  return levelOf(state, lex, bankData.freq).index >= LEVELS.findIndex((l) => l[0] === from);
}

// ---------- annotated sentence rendering (PR-p1-16 colour-coding) ----------
function renderSentence(text, { target } = {}) {
  const a = annotate(text, lex);
  const span = h("span", { class: "sentence-text" });
  let pos = 0;
  for (const t of a.tokens) {
    if (t.start > pos) span.append(text.slice(pos, t.start));
    const ids = [t.wordId, ...t.phraseIds].filter(Boolean);
    const sts = ids.map((id) => status(state, id));
    const cls = ["tok"];
    if (t.name) cls.push("name");
    else if (!t.wordId) cls.push("unk");
    else if (sts.includes("new")) cls.push("new");
    else if (sts.includes("fading")) cls.push("fading");
    else if (sts.includes("drilling")) cls.push("drill");
    if (target && ids.includes(target)) cls.push("target");
    const pat = a.patternSpans.find((p) => p.start <= t.start && p.end >= t.end);
    const el = h("span", { class: cls.join(" ") + (pat ? " pat" : ""), title: pat ? lex.byId.get(pat.id).name : "" }, t.t);
    if (pat) el.style.borderBottomColor = lex.byId.get(pat.id).color;
    el.onclick = (e) => { e.stopPropagation(); inspectToken(t, a, text); };
    span.append(el);
    pos = t.end;
  }
  span.append(text.slice(pos));
  return span;
}

// ---------- inspector ----------
function inspector(...kids) {
  const el = $("#inspector");
  el.hidden = false;
  el.replaceChildren(h("button", { class: "x", onclick: () => (el.hidden = true) }, "×"), ...kids);
}
function stPill(it) {
  const st = status(state, it.id);
  const risk = atRisk(state, it);
  return h("span", { class: "st " + (risk ? "risk" : st), title: state.srs[it.id] ? `strength ${strength(state, it.id).toFixed(2)}` : "" }, risk ? "at risk" : STATUS_LABEL[st]);
}
function meaning(it) {
  if (it.type === "pattern") return "";
  if (englishHidden()) return it.explain_sv || "(ingen förklaring än)";
  return it.explain_sv ? `${it.en} · ${it.explain_sv}` : it.en;
}
function bankMark(it) {
  if (it.type === "pattern" || it.source !== "ai") return null;
  const e = bankData.entries.find((x) => x.mine && x.lemma === it.sv);
  if (state.bankChoices?.[it.sv] === "keep") return h("span", { class: "tag rejected", title: "The owner rejected this entry; you chose to keep it." }, "rejected");
  if (!e || e.status === "checked") return null;
  return h("span", { class: "tag unchecked", title: e.why || "" }, e.status === "rejected" ? "rejected – see Home" : "unchecked");
}
function itemLine(id) {
  const it = lex.byId.get(id);
  return h("div", {}, h("b", {}, it.type === "pattern" ? it.name : it.sv), " – ", meaning(it), " ", stPill(it), " ", bankMark(it), " ",
    h("span", { class: "mute" }, `(${it.type}${state.met[id] ? `, met ${state.met[id]}×` : ""})`));
}
function drillButton(id) {
  const st = status(state, id);
  if (isPattern(id) || st === "drilling" || st === "fading") return null;
  const b = h("button", { class: "b ghost", onclick: () => { markDrill(state, id); save(); b.replaceWith(h("span", { class: "ok" }, "✓ added to drilling")); } }, "Drill this");
  return b;
}
function inspectToken(t, a, text) {
  const kids = [h("div", { class: "row" }, play(t.t), h("b", { style: { fontSize: "20px" } }, t.t))];
  if (t.name) kids.push(h("p", { class: "mute" }, "A name."));
  else if (t.wordId) {
    kids.push(itemLine(t.wordId), drillButton(t.wordId));
    for (const p of t.phraseIds) kids.push(itemLine(p), drillButton(p));
  } else kids.push(h("p", {}, "Not in your grove yet. Add it from Topics → paste a text."));
  for (const p of a.patternSpans.filter((p) => p.start <= t.start && p.end >= t.end)) {
    const pat = lex.byId.get(p.id);
    kids.push(h("div", { style: { marginTop: "8px", borderLeft: `4px solid ${pat.color}`, paddingLeft: "8px" } }, itemLine(p.id), h("div", { class: "mute" }, pat.rule),
      h("a", { href: "#", onclick: (e) => { e.preventDefault(); $("#inspector").hidden = true; go("dictionary", { tab: "pattern", explain: p.id }); } }, "Explain with AI ›")));
  }
  inspector(...kids);
}

// ---------- adding items ----------
function addWord({ form, lemma, en, explain_sv, topic, forms = [] }) {
  lemma = String(lemma).toLowerCase().trim();
  const id = "w:" + lemma;
  const cw = state.custom.words.find((w) => w.id === id);
  if (cw) { for (const f of [form, ...forms]) if (f && !cw.forms.includes(f.toLowerCase())) cw.forms.push(f.toLowerCase()); if (explain_sv && !cw.explain_sv) cw.explain_sv = explain_sv; }
  else if (lex.byId.get(id)?.type === "word") { if (form && !lex.formMap.has(form.toLowerCase())) ((state.custom.extraForms[id] ||= [])).push(form.toLowerCase()); }
  else state.custom.words.push({ id, type: "word", sv: lemma, en, explain_sv, topic, forms: [...new Set([lemma, form, ...forms].filter(Boolean).map((f) => f.toLowerCase()))], deps: [], def: [], past: [], source: "ai" });
  rebuild();
  return id;
}
function addPhrase({ sv, en, explain_sv, topic }) {
  sv = String(sv).toLowerCase().replace(/[.!?]/g, "").trim();
  const id = "p:" + sv;
  if (lex.byId.has(id)) return id;
  const deps = annotate(sv, lex).tokens.map((t) => t.wordId).filter(Boolean);
  state.custom.phrases.push({ id, type: "phrase", sv, en, explain_sv, topic, deps: [...new Set(deps)], forms: [sv], source: "ai" });
  rebuild();
  return id;
}
function topicSelect(withAll, value) {
  const s = h("select", {}, withAll ? h("option", { value: "all" }, "All topics") : null, ...lex.topics.map((t) => h("option", { value: t.id }, t.name)));
  if (value) s.value = value;
  return s;
}

// ---------- routing ----------
const VIEWS = { home: "Home", library: "Library", practice: "Practice", dictionary: "Dictionary", grove: "My grove", stats: "Progress", topics: "Topics", why: "Why this works" };
const viewsFor = () => (me?.role === "owner" ? { ...VIEWS, owner: "Owner" } : VIEWS);
let current = { view: "home" };
function go(view, params = {}) { stopSpeech(); current = { view, ...params }; route(); }
function route() {
  $("#nav").replaceChildren(...Object.entries(viewsFor()).map(([k, v]) => h("button", { class: current.view === k ? "on" : "", onclick: () => go(k) }, v)));
  const main = $("#main");
  main.replaceChildren();
  ({ home, library, practice, dictionary, grove, stats, topics, why, reader, content, mark, owner, start, terms })[current.view](main, current);
  window.scrollTo(0, 0);
}

// ---------- CI explanation (PR-p1-39) ----------
const TIPS = [
  "You don't need to understand every word. Following the story is enough – your brain does the rest.",
  "Every minute of input counts. Short daily sessions beat rare long ones.",
  "Not sure about a word? Tap it. Then keep going – meeting it again in context is how it sticks.",
  "If a text feels hard, rate it honestly. Grove will make the next one easier.",
  "Listening and reading the same text is a great combination: first listen, then read along.",
  "Words you meet in stories you care about are remembered better than words from lists.",
  "Feeling like you're 'just reading'? That's the point: understanding messages is how languages are acquired.",
];
const tip = () => h("div", { class: "tip" }, "💡 ", TIPS[Math.floor(Math.random() * TIPS.length)]);
function welcome() {
  const ov = h("div", { class: "overlay" }, h("div", { class: "card", style: { maxWidth: "560px" } },
    h("h2", {}, "Välkommen to grove 🌳"),
    h("p", {}, "You'll learn Swedish the way you learned your first language: by understanding lots of it."),
    h("p", {}, "Grove gives you stories, dialogues and texts where you already know about 95% of the words. The few new ones you pick up from context – and every word you meet grows your grove."),
    h("p", {}, "No endless drills: you only drill the words you choose. Everything else comes from reading and listening."),
    h("div", { class: "row" }, h("button", { class: "b", onclick: () => { state.seenWelcome = true; save(); ov.remove(); } }, "Let's start"),
      h("button", { class: "b ghost", onclick: () => { state.seenWelcome = true; save(); ov.remove(); go("why"); } }, "Why does this work?"))));
  document.body.append(ov);
}
function why(main) {
  main.append(h("div", { class: "card prose" },
    h("h2", {}, "Why this works: comprehensible input"),
    h("p", {}, "Linguist Stephen Krashen argued that we acquire a language in one way: by understanding messages in it. Not by memorising rules or word lists, but by reading and hearing things we ", h("i", {}, "almost"), " fully understand. He called this comprehensible input."),
    h("p", {}, "It's how every child learns to speak, and many adults who learned through stories, series and podcasts report the same: once there's enough understood input, words and grammar start to stick on their own."),
    h("h3", {}, "How grove uses it"),
    h("ul", {},
      h("li", {}, h("b", {}, "About 95% known words. "), "Every text is built from words you know, with at most one new word or phrase per sentence. Enough to stretch you, never enough to lose you."),
      h("li", {}, h("b", {}, "Stories that continue. "), "Series bring the same characters and words back episode after episode – the repetition happens naturally."),
      h("li", {}, h("b", {}, "Your ground. "), "Words you understand join your ground, your growing known vocabulary. You only drill the words you choose."),
      h("li", {}, h("b", {}, "Your feedback steers it. "), "Rate how much you understood; grove makes the next text easier or harder."),
      h("li", {}, h("b", {}, "Hours count. "), "Grove tracks your hours of input, because time spent understanding is what moves you forward.")),
    h("h3", {}, "What to expect (a rough guide – everyone is different)"),
    roadmap(),
    h("p", { class: "mute" }, "The hours are rough figures from learners' experience with input-based methods, not promises.")));
}
const ROADMAP = [[0, "Short, simple stories with lots of support. Everything feels new – that's normal."], [25, "Familiar words start jumping out. Simple stories feel easier."],
  [100, "You follow most easy stories without tapping words. You may start thinking in short Swedish phrases."], [300, "Everyday dialogues and easy podcasts become understandable."],
  [600, "Many native texts on familiar topics are within reach."], [1000, "Comfortable with a wide range of content; speaking starts to come more naturally."]];
function roadmap() {
  const hrs = inputHours(state);
  return h("table", {}, ...ROADMAP.map(([at, txt], i) => {
    const here = hrs >= at && (i === ROADMAP.length - 1 || hrs < ROADMAP[i + 1][0]);
    return h("tr", { class: here ? "here" : "" }, h("td", { style: { whiteSpace: "nowrap" } }, `${at}+ h`, here ? " ← you" : ""), h("td", {}, txt));
  }));
}

// ---------- home (PR-p1-04, PR-p1-23, PR-p1-35) ----------
const ACTIVITIES = {
  reading: ["Read", "next text in your library"], listening: ["Listen", "hear it first, then read"],
  flashcard: ["Flashcards", "your drilled words"], mc: ["Multiple choice", "meaning in context"],
  translate: ["Type the translation", "English → Swedish"], tiles: ["Word tiles", "build the sentence"],
  gap: ["Fill the gap", "missing word"], write: ["Write with a pattern", "your own sentence"],
};
function nextUnread() { return state.library.find((t) => !t.read); }
function startActivity(kind, auto) {
  if (kind === "reading" || kind === "listening") {
    const t = nextUnread();
    if (t) go("reader", { id: t.id, mode: kind === "listening" ? "listen" : "read", auto });
    else go("content", { auto });
  } else go("practice", { kind, auto });
}
function home(main) {
  const lvl = levelOf(state, lex, bankData.freq);
  const unread = state.library.filter((t) => !t.read).length;
  const drilling = allItems(lex).filter((i) => ["drilling", "fading"].includes(status(state, i.id)) && !isPattern(i.id)).length;
  const hide = h("select", { onchange: () => { state.settings.hideEnglishFrom = hide.value; save(); } }, h("option", { value: "" }, "never"), ...LEVELS.slice(1).map(([n]) => h("option", { value: n }, `from ${n}`)));
  hide.value = state.settings.hideEnglishFrom || "";
  const speed = h("select", { onchange: () => { state.settings.speed = +speed.value; save(); } }, h("option", { value: 1 }, "normal"), h("option", { value: 0.7 }, "slow"));
  speed.value = String(state.settings.speed);
  main.append(rejectedOffers(),
    h("div", { class: "card" }, h("h2", {}, "Hej! Ready to grow?"),
      h("div", { class: "stats-row" },
        h("div", {}, h("b", {}, fmtH(inputHours(state))), h("span", {}, "of input")),
        h("div", {}, h("b", {}, lvl.words), h("span", {}, "words in your ground")),
        h("div", {}, h("b", {}, lvl.name), h("span", {}, lvl.next ? `${lvl.next.at - lvl.words} more ${lvl.next.name} words to reach ${lvl.next.name} (estimate)` : lvl.tagged ? "beyond the word list" : "top level")),
        h("div", {}, h("b", {}, unread), h("span", {}, "unread texts")),
        h("div", {}, h("b", {}, drilling), h("span", {}, "words you're drilling"))),
      h("button", { class: "b", style: { fontSize: "18px", padding: "12px 22px" }, onclick: () => startActivity(pickBySliders(state.sliders), true) }, "Continue ▸"),
      h("span", { class: "mute" }, "  steered by your goals below")),
    h("div", { class: "card" }, h("h2", {}, "Or choose what to do"),
      h("div", { class: "grid" }, ...Object.entries(ACTIVITIES).map(([k, [name, desc]]) =>
        h("button", { class: "tile", onclick: () => startActivity(k, false) }, h("b", {}, name), h("span", {}, desc))),
        h("button", { class: "tile", onclick: () => go("content") }, h("b", {}, "Get new content"), h("span", {}, "about an hour, via your AI")))),
    h("div", { class: "card" }, h("h2", {}, "My goals"), h("p", { class: "mute" }, "How much each skill matters to you. Continue follows these weights."),
      ...Object.keys(SKILL_ACTIVITY).map((k) => {
        const out = h("span", {}, state.sliders[k]);
        const inp = h("input", { type: "range", min: 0, max: 100, value: state.sliders[k], oninput: () => { state.sliders[k] = +inp.value; out.textContent = inp.value; save(); } });
        return h("div", { class: "slider" }, h("label", {}, k[0].toUpperCase() + k.slice(1)), inp, out);
      })),
    h("div", { class: "card" }, h("h2", {}, "Settings"),
      h("div", { class: "row" }, "Hide English completely:", hide, h("span", { class: "mute" }, "new words are then explained in simple Swedish")),
      h("div", { class: "row", style: { marginTop: "8px" } }, "Speech speed:", speed),
      h("div", { class: "row", style: { marginTop: "8px" } }, h("span", { class: "mute" }, `Texts aim at ${Math.round(state.difficulty.knownShare * 100)}% known words${state.difficulty.short ? ", short sentences" : ""} (set by your ratings).`))),
    h("div", { class: "card" }, h("h2", {}, "Account"), h("p", { class: "mute" }, `Signed in as ${me.email}${me.role === "owner" ? " (owner)" : ""}. Your data is kept on the owner's computer. `,
      h("a", { href: "#", onclick: (e) => { e.preventDefault(); go("terms"); } }, "Terms of use"), ". To export or delete your data, ask the owner."),
      h("button", { class: "b ghost", onclick: () => go("start") }, "Set my starting level again")),
  );
}

// ---------- library (PR-p1-29) ----------
const KIND_LABEL = { episode: "Story", retell: "Retelling", dialogue: "Dialogue", cyoa: "Choose your path" };
function textRow(t) {
  const s = t.series && state.series.find((x) => x.id === t.series);
  return h("tr", {}, h("td", {}, h("a", { href: "#", onclick: (e) => { e.preventDefault(); go("reader", { id: t.id }); } }, t.title)),
    h("td", {}, KIND_LABEL[t.kind], s ? ` · ${s.title}` : ""), h("td", {}, `${t.est} min`),
    h("td", {}, t.read ? (t.rating ? RATINGS[t.rating - 1][1] : "read") : h("span", { class: "badge" }, "unread")),
    h("td", {}, h("button", { class: "b ghost", onclick: () => go("reader", { id: t.id, mode: "audio" }) }, "🎧 audio only")));
}
function library(main) {
  const unread = state.library.filter((t) => !t.read), read = state.library.filter((t) => t.read).reverse();
  main.append(
    h("div", { class: "card" }, h("h2", {}, "Library"), tip(),
      h("div", { class: "row" }, h("button", { class: "b", onclick: () => go("content") }, "Get new content"),
        h("button", { class: "b ghost", onclick: () => go("content", { easy: true }) }, "Get an easy read"), h("span", { class: "mute" }, `${unread.length} unread · ${unread.reduce((a, t) => a + t.est, 0)} min waiting`)),
      h("h3", {}, "Unread"), unread.length ? h("table", {}, ...unread.map(textRow)) : h("p", { class: "mute" }, "Nothing unread. Get a new content package."),
      read.length ? h("h3", {}, "Read") : null, read.length ? h("table", {}, ...read.map(textRow)) : null),
    sharedLibrary(),
    h("div", { class: "card" }, h("h2", {}, "Your story series"), ...state.series.map((s) => h("div", { style: { margin: "8px 0" } }, h("b", {}, s.title), ` – ${s.episodes} episode${s.episodes === 1 ? "" : "s"}`, h("div", { class: "mute" }, s.summary)))));
}

// ---------- reader (PR-p1-32, PR-p1-33, PR-p1-34) ----------
function reader(main, { id, mode = "read", auto }) {
  const t = state.library.find((x) => x.id === id);
  const started = Date.now();
  const hideEn = englishHidden();
  let path = t.kind === "cyoa" ? ["start"] : null;
  let loopLine = null;
  const card = h("div", { class: "card" });
  main.append(card);
  const modeSel = h("select", { onchange: () => go("reader", { id, mode: modeSel.value, auto }) },
    h("option", { value: "read" }, "Read"), h("option", { value: "listen" }, "Listen first, then read"), h("option", { value: "audio" }, "Audio only (podcast)"));
  modeSel.value = mode;
  const speed = h("select", { onchange: () => { state.settings.speed = +speed.value; save(); } }, h("option", { value: 1 }, "normal speed"), h("option", { value: 0.7 }, "slow"));
  speed.value = String(state.settings.speed);
  const body = h("div", { class: "passage" + (mode === "listen" ? " veiled" : "") });
  const after = h("div");
  const s = t.series && state.series.find((x) => x.id === t.series);
  card.append(
    h("div", { class: "row" }, h("h2", { style: { margin: 0 } }, t.title), h("span", { class: "badge" }, KIND_LABEL[t.kind]), s ? h("span", { class: "mute" }, `${s.title}, episode ${t.episode}`) : null, auto ? h("span", { class: "badge" }, "chosen by Continue") : null),
    tip(),
    h("div", { class: "row" }, modeSel, speed, h("button", { class: "b ghost", onclick: () => playAll() }, "▶ Play all"), h("button", { class: "b ghost", onclick: stopSpeech }, "■ Stop"),
      mode === "listen" ? h("button", { class: "b ghost", onclick: () => body.classList.remove("veiled") }, "Show text") : null),
    mode === "audio" ? h("div", { class: "audio-only" }, h("p", {}, "Audio only. Close your eyes and listen."), h("button", { class: "b", style: { fontSize: "20px" }, onclick: () => playAll() }, "▶ Play"), h("p", { class: "mute", id: "nowline" }, "")) : null,
    body, after);
  if (mode === "audio") body.hidden = true;

  const speakerColors = {};
  const palette = ["#2f6db3", "#b3462f", "#6b4fb3", "#2f8f6b"];
  function lineEl(l, i) {
    const en = h("div", { class: "en", hidden: true }, l.en);
    const color = l.speaker ? (speakerColors[l.speaker] ||= palette[Object.keys(speakerColors).length % palette.length]) : null;
    const loop = h("button", { class: "play", title: "Repeat this sentence", onclick: (e) => { e.stopPropagation(); loopLine = loopLine === i ? null : i; body.querySelectorAll(".loop").forEach((b) => b.classList.toggle("on", false)); if (loopLine === i) { loop.classList.add("on"); loopSpeak(l.sv, i); } else stopSpeech(); } }, "🔁");
    loop.classList.add("loop");
    return h("div", { class: "line", "data-i": i }, h("div", { class: "sentence" }, play(l.sv), loop,
      l.speaker ? h("b", { class: "speaker", style: { color } }, l.speaker + ": ") : null, renderSentence(l.sv),
      hideEn ? null : h("button", { class: "en-btn", title: "English", onclick: () => (en.hidden = !en.hidden) }, "EN")), en);
  }
  function loopSpeak(sv, i) { if (loopLine !== i) return; speak(sv, () => setTimeout(() => loopSpeak(sv, i), 600)); }
  const visibleLines = () => t.kind === "cyoa" ? path.flatMap((nid) => t.nodes.find((n) => n.id === nid).lines) : t.lines;
  function playAll() {
    const lines = visibleLines();
    let i = 0;
    const nxt = () => {
      body.querySelectorAll(".line").forEach((el) => el.classList.remove("speaking"));
      if (i >= lines.length) { body.classList.remove("veiled"); const n = $("#nowline"); if (n) n.textContent = "Done."; return; }
      body.querySelector(`.line[data-i="${i}"]`)?.classList.add("speaking");
      const n = $("#nowline"); if (n) n.textContent = `Sentence ${i + 1} of ${lines.length}`;
      speak(lines[i++].sv, nxt);
    };
    nxt();
  }
  function renderBody() {
    body.replaceChildren(...visibleLines().map(lineEl));
    if (t.kind === "cyoa") {
      const node = t.nodes.find((n) => n.id === path.at(-1));
      if (node.choices.length) body.append(h("div", { class: "choices" }, h("p", { class: "mute" }, "Vad gör du?"), ...node.choices.map((c) =>
        h("button", { class: "b ghost", title: hideEn ? "" : c.en, onclick: () => { path.push(c.to); renderBody(); } }, c.sv))));
      else { body.append(h("p", { class: "mute" }, "Slut. ", h("a", { href: "#", onclick: (e) => { e.preventDefault(); path = ["start"]; renderBody(); } }, "Try another path"))); finishPart(); }
    } else finishPart();
  }
  let finished = false;
  function finishPart() {
    if (finished) return; finished = true;
    const qs = h("div");
    if (t.questions?.length) {
      qs.append(h("h3", {}, "Frågor"));
      for (const q of t.questions) {
        const fb = h("span");
        qs.append(h("div", { class: "question" }, h("div", { class: "sentence", style: { fontSize: "18px" } }, play(q.q), renderSentence(q.q)),
          h("div", { class: "row" }, ...q.options.map((o, i) => h("button", { class: "b ghost", onclick: () => { fb.replaceChildren(i === q.answer ? h("span", { class: "ok" }, " ✓ Rätt!") : h("span", { class: "bad" }, ` ✗ Rätt svar: ${q.options[q.answer]}`)); } }, o)), fb)));
      }
    }
    const rate = h("div", { class: "row" }, ...RATINGS.map(([r, sv, en]) => h("button", { class: "b ghost rating", onclick: () => rated(r) }, h("b", {}, sv), h("small", {}, en))));
    after.replaceChildren(qs, h("h3", {}, "Hur mycket förstod du? (How much did you understand?)"), rate);
  }
  function rated(r) {
    const all = t.kind === "cyoa" ? t.nodes.flatMap((n) => n.lines) : t.lines;
    for (const l of all) for (const iid of annotate(l.sv, lex).items) meet(state, iid, { sv: l.sv, en: l.en, title: t.title });
    const ms = Math.max(30000, Math.min(Date.now() - started, t.est * 3 * 60000));
    state.inputLog.push({ t: Date.now(), ms, kind: mode === "read" ? "reading" : "listening", text: t.id });
    t.read = true; t.rating = r;
    const d = applyRating(state, r);
    save();
    const nxt = nextUnread();
    after.replaceChildren(h("div", { class: "notice" },
      h("p", {}, understood(r) ? "Bra! " : "Thanks – that's useful. ", `Logged ${fmtH(ms / 3600000)} of input. Next texts will aim at ${Math.round(d.knownShare * 100)}% known words${d.short ? " with shorter sentences" : ""}.`),
      r <= 2 ? h("p", {}, h("button", { class: "b", onclick: () => go("content", { retell: t.id }) }, "Get a simpler retelling of this text")) : null,
      expandDue() ? h("p", {}, "Texts feel easy, or you've read a lot lately: ", h("button", { class: "b", onclick: () => { state.lastExpand = { t: Date.now(), hours: inputHours(state) }; save(); go("practice", { kind: "expand" }); } }, "Expand your grove ▸")) : null,
      h("div", { class: "row" }, nxt ? h("button", { class: "b", onclick: () => go("reader", { id: nxt.id, mode, auto }) }, `Next: ${nxt.title} ▸`) : h("button", { class: "b", onclick: () => go("content") }, "Get new content ▸"),
        h("button", { class: "b ghost", onclick: () => go("library") }, "Library"))));
  }
  renderBody();
  if (mode === "listen" || mode === "audio") playAll();
}

// ---------- content packages (PR-p1-29…PR-p1-31, PR-p1-30) ----------
const DEFAULT_MIX = { episode: 4, retell: 2, dialogue: 3, cyoa: 2 };
function planUnits(mix, opts) {
  const units = [];
  const series = opts.seriesId === "new" ? { isNew: true, topic: opts.seriesTopic } : state.series.find((s) => s.id === opts.seriesId);
  for (let i = 0; i < mix.episode; i++) units.push({ kind: "episode", seriesRef: opts.seriesId === "new" ? "new" : series.id, offset: i });
  const readTexts = state.library.filter((t) => t.read && t.kind !== "cyoa").reverse();
  for (let i = 0; i < mix.retell; i++) {
    const src = opts.retellId ? state.library.find((t) => t.id === opts.retellId) : readTexts[i % Math.max(1, readTexts.length)] || state.library[0];
    units.push({ kind: "retell", sourceId: src?.id, how: opts.retellId ? "more simply, with shorter sentences" : ["more simply", "from another character's point of view", "in the past tense"][i % 3] });
  }
  for (let i = 0; i < mix.dialogue; i++) units.push({ kind: "dialogue", topic: opts.topic });
  for (let i = 0; i < mix.cyoa; i++) units.push({ kind: "cyoa", topic: opts.topic });
  if (opts.easy) units.forEach((u) => (u.easy = true));                                  // PR-p1-126: an easy read on request
  else if (units.length >= 4) (units.filter((u) => u.kind === "dialogue").at(-1) || units.at(-1)).easy = true; // PR-p1-125: now and then an easier text
  return units;
}
// Closely bound content goes in the same part (page 06 Q12): consecutive episodes travel in pairs.
function planParts(units, whole) {
  if (whole) return [units];
  const groups = [];
  for (let i = 0; i < units.length; i++) {
    if (units[i].kind === "episode" && units[i + 1]?.kind === "episode") { groups.push([units[i], units[i + 1]]); i++; }
    else groups.push([units[i]]);
  }
  const parts = [];
  let cur = [], min = 0;
  for (const g of groups) {
    const m = g.reduce((a, u) => a + UNIT[u.kind].min, 0);
    if (cur.length && min + m > 20) { parts.push(cur); cur = []; min = 0; }
    cur.push(...g); min += m;
  }
  if (cur.length) parts.push(cur);
  return parts;
}
function resolveUnits(part, pkg) {
  let newSeen = false;
  return part.map((u) => {
    if (u.kind === "episode") {
      const sid = u.seriesRef === "new" ? pkg.newSeriesId : u.seriesRef;
      const s = sid && state.series.find((x) => x.id === sid);
      if (!s) {
        if (!newSeen) { newSeen = true; return { ...u, series: { isNew: true, topic: pkg.opts.seriesTopic } }; }
        return { ...u, series: { title: "the new series above", summary: "Continue straight from the episode above.", lastNew: [] }, episode: 2 };
      }
      const ep = s.episodes + 1 + (newSeen ? 1 : 0);
      return { ...u, series: s, episode: ep };
    }
    if (u.kind === "retell") {
      const src = state.library.find((t) => t.id === u.sourceId);
      return { ...u, source: { title: src?.title || "?", text: src ? textSentences(src).map((l) => l.sv).join(" ") : "" } };
    }
    return u;
  });
}
function content(main, { retell, easy }) {
  const card = h("div", { class: "card" });
  main.append(card);
  const pkg = state.pkg;
  if (pkg && pkg.current < pkg.parts.length) return showPart(card, pkg);

  const mix = retell ? { episode: 0, retell: 1, dialogue: 0, cyoa: 0 } : easy ? { episode: 0, retell: 0, dialogue: 1, cyoa: 0 } : { ...DEFAULT_MIX };
  const counts = h("div");
  const minutes = h("b");
  const seriesSel = h("select", {}, ...state.series.map((s) => h("option", { value: s.id }, `Continue “${s.title}”`)), h("option", { value: "new" }, "Start a new series…"));
  const SERIES_IDEAS = ["a family moves to a cabin by a lake", "a small café in Stockholm", "two friends hike in Lapland", "a detective in Gothenburg", "a cooking contest"];
  const seriesTopic = h("input", { placeholder: "your own topic", size: 28 });
  const ideas = h("div", { class: "row", hidden: true }, "Topic:", ...SERIES_IDEAS.map((i) => h("button", { class: "b ghost", onclick: () => (seriesTopic.value = i) }, i)), seriesTopic);
  seriesSel.onchange = () => (ideas.hidden = seriesSel.value !== "new");
  const topic = h("input", { value: "everyday life", size: 24 });
  const whole = h("input", { type: "checkbox" });
  const week = h("input", { type: "checkbox" }); // PR-p1-133: a week's worth in one prompt, pasted back in parts
  const plan = h("div");
  const refresh = () => {
    counts.replaceChildren(...Object.keys(UNIT).map((k) => {
      const inp = h("input", { type: "number", min: 0, max: 8, value: mix[k], style: { width: "60px" }, oninput: () => { mix[k] = Math.max(0, +inp.value || 0); refresh(); } });
      return h("div", { class: "row" }, inp, `${UNIT[k].plural} (≈${UNIT[k].min} min each)`);
    }));
    const total = Object.entries(mix).reduce((a, [k, n]) => a + n * UNIT[k].min, 0);
    minutes.textContent = `≈ ${total} min of input`;
    const units = planUnits(weekMix(), opts());
    const parts = planParts(units, whole.checked);
    plan.replaceChildren(h("p", {}, minutes, ` in ${parts.length} part${parts.length === 1 ? "" : "s"} (one copy-paste each):`),
      h("ol", {}, ...parts.map((p) => h("li", {}, p.map((u) => UNIT[u.kind].label).join(", ")))));
  };
  const opts = () => ({ seriesId: seriesSel.value, seriesTopic: seriesTopic.value || SERIES_IDEAS[0], topic: topic.value || "everyday life", retellId: retell, easy });
  const weekMix = () => (week.checked ? Object.fromEntries(Object.entries(mix).map(([k, n]) => [k, n * 7])) : mix);
  whole.onchange = week.onchange = refresh;
  const src = retell && state.library.find((t) => t.id === retell);
  card.append(h("h2", {}, retell ? "A simpler retelling" : easy ? "An easy read" : "Get new content"),
    h("p", { class: "mute" }, retell ? `Your AI will retell “${src?.title}” more simply.` : easy ? "A dialogue made only of words you know: easy, relaxing input." : "Pick the mix for about an hour of input. Grove turns it into prompts for your own AI."),
    retell || easy ? h("div", {}, h("h3", {}, "Topic"), topic) : h("div", {}, counts, h("h3", {}, "Story series"), seriesSel, ideas, h("h3", {}, "Topic for dialogues and choose-your-path stories"), topic,
      h("p", {}, h("label", {}, whole, " My AI can handle long answers: send the whole package in one prompt")),
      h("p", {}, h("label", {}, week, " A week's worth (7 × this mix); paste the answers back part by part"))),
    plan,
    h("button", { class: "b", onclick: () => {
      const units = planUnits(weekMix(), opts());
      if (!units.length) return;
      state.pkg = { opts: opts(), parts: planParts(units, whole.checked), current: 0, newSeriesId: null, created: Date.now() };
      save(); go("content");
    } }, "Make the prompt ▸"));
  refresh();
}
function showPart(card, pkg) {
  const part = resolveUnits(pkg.parts[pkg.current], pkg);
  const prompt = packagePrompt({ units: part, known: knownLemmas(lex, state), fading: fadingLemmas(lex, state), newPhrases: unlearnedPhrases(lex, state),
    difficulty: state.difficulty, partNo: pkg.current + 1, partCount: pkg.parts.length });
  card.append(h("h2", {}, `New content – part ${pkg.current + 1} of ${pkg.parts.length}`),
    h("p", { class: "mute" }, part.map((u) => UNIT[u.kind].label).join(", ")),
    aiExchange({
      title: pkg.current ? "Next part" : "Part 1",
      note: pkg.current ? "Paste this into the same AI chat as before. If the AI stops halfway or refuses, cancel and ask for a smaller package." : "If the AI stops halfway or refuses, cancel and ask for a smaller package.",
      prompt,
      check: (d) => checkPackage(d, part, lex, state, state.difficulty),
      accept: (d) => acceptPart(d, part, pkg),
    }),
    h("button", { class: "b warn", onclick: () => { state.pkg = null; save(); go("content"); } }, "Cancel package"));
}
function acceptPart(d, part, pkg) {
  rememberInflections(d.inflections);
  state.custom.names = [...new Set([...(state.custom.names || []), ...(d.names || [])])];
  const before = new Set(allItems(lex).filter((i) => status(state, i.id) === "new").map((i) => i.id));
  const fresh = new Set();
  for (const w of d.new_words || []) { const id = addWord({ form: w.form, lemma: w.lemma, en: w.en, explain_sv: w.explain_sv, topic: "core" }); if (status(state, id) === "new") fresh.add(id); }
  for (const p of d.new_phrases || []) { const id = addPhrase({ sv: p.sv, en: p.en, explain_sv: p.explain_sv, topic: "core" }); if (status(state, id) === "new") fresh.add(id); }
  submitToBank(d.new_words, d.new_phrases, d.inflections);
  rebuild();
  const ids = [];
  d.texts.forEach((t, i) => {
    const u = part[i];
    const id = `lib:${Date.now()}:${pkg.current}:${i}`;
    const item = { id, kind: t.kind, title: t.title, lines: t.kind === "cyoa" ? [] : t.lines, nodes: t.kind === "cyoa" ? t.nodes : undefined, questions: t.questions || [],
      est: UNIT[t.kind].min, created: Date.now(), read: false, rating: null };
    if (t.kind === "episode") {
      let s = state.series.find((x) => x.title.toLowerCase() === String(t.series).toLowerCase());
      if (!s) { s = { id: "series:" + Date.now() + i, title: t.series, topic: pkg.opts.seriesTopic, episodes: 0, summary: "", lastNew: [] }; state.series.push(s); if (u?.seriesRef === "new") pkg.newSeriesId = s.id; }
      s.episodes++; item.series = s.id; item.episode = s.episodes;
      s.summary = (d.series_summaries || []).find((x) => String(x.series).toLowerCase() === s.title.toLowerCase())?.summary || s.summary;
      const words = new Set(t.lines.flatMap((l) => annotate(l.sv, lex).items));
      s.lastNew = [...fresh].filter((fid) => words.has(fid)).map((fid) => lex.byId.get(fid).sv);
    }
    if (u?.easy) item.easy = true;
    state.library.push(item);
    ids.push(id);
    state.custom.sentences.push(...textSentences(t).filter((l) => l.en).map((l, k) => ({ id: `${id}:${k}`, sv: l.sv, en: l.en, topic: "core", source: "ai" })));
  });
  // Also catch seed items that were new before and appear now.
  const inTexts = new Set(d.texts.flatMap((t) => textSentences(t)).flatMap((l) => annotate(l.sv, lex).items));
  for (const id of before) if (inTexts.has(id) && !isPattern(id)) fresh.add(id);
  pkg.current++;
  if (pkg.current >= pkg.parts.length) state.pkg = null;
  rebuild(); save();
  go("mark", { ids: [...fresh], all: [...inTexts].filter((x) => !isPattern(x)), textIds: ids });
}

// ---------- marking after new content (PR-p1-40) ----------
function mark(main, { ids, all, textIds, back }) {
  const marks = {};
  const MARKS = [["dont", "Don't know"], ["half", "Half know"], ["never", "Never remember"]];
  const row = (id) => {
    const it = lex.byId.get(id);
    const btns = MARKS.map(([k, label]) => {
      const b = h("button", { class: "b ghost mark", onclick: () => { marks[id] = marks[id] === k ? null : k; btns.forEach((x) => x.classList.remove("on")); if (marks[id]) b.classList.add("on"); } }, label);
      return b;
    });
    return h("tr", {}, h("td", {}, play(it.sv), h("b", {}, it.sv)), h("td", {}, meaning(it)), h("td", {}, stPill(it)), h("td", {}, h("div", { class: "row" }, ...btns)));
  };
  const others = (all || []).filter((id) => !ids.includes(id) && lex.byId.get(id));
  const extra = h("tbody", { hidden: true }, ...others.map(row));
  const showAll = h("input", { type: "checkbox", onchange: () => (extra.hidden = !showAll.checked) });
  main.append(h("div", { class: "card" }, h("h2", {}, "New words in your content"),
    h("div", { class: "notice" }, "Mark the words you don't know, only half know, or never remember. ", h("b", {}, "These are good candidates for drilling"),
      " – grove will practise them with you. Every word you leave unmarked joins your ground, your known vocabulary. You'll meet them again in your texts anyway."),
    ids.length ? h("table", {}, h("tbody", {}, ...ids.map(row))) : h("p", {}, "No new words this time."),
    others.length ? h("p", {}, h("label", {}, showAll, ` Show every word in the content (${others.length} more) – you can mark known words for drilling too`)) : null,
    h("table", {}, extra),
    h("button", { class: "b", onclick: () => {
      let drilled = 0, grounded = 0;
      for (const id of ids) { if (marks[id]) { markDrill(state, id); drilled++; } else { addGround(state, id, "intake"); grounded++; } }
      for (const id of others) if (marks[id]) { markDrill(state, id); drilled++; }
      save();
      main.replaceChildren(h("div", { class: "card" }, h("p", { class: "ok" }, `🌱 ${grounded} words joined your ground; ${drilled} will be drilled.`),
        textIds?.length ? shareBox(textIds) : null,
        state.pkg ? h("button", { class: "b", onclick: () => go("content") }, "Next part of the package ▸") : null,
        textIds?.length ? h("button", { class: state.pkg ? "b ghost" : "b", onclick: () => go("reader", { id: textIds[0] }) }, "Start reading ▸") : null,
        h("button", { class: "b ghost", onclick: () => go(back || "library") }, "Library")));
    } }, "Done")));
}

// ---------- practice (PR-p1-18, PR-p1-36) ----------
function practice(main, { kind, auto }) {
  const card = h("div", { class: "card" });
  main.append(card);
  if (!kind) {
    card.append(h("h2", {}, "Practice"), h("p", { class: "mute" }, "Drills use only the words you chose to drill, plus grammar patterns."),
      h("div", { class: "grid" }, ...Object.entries(ACTIVITIES).filter(([k]) => !["reading", "listening"].includes(k)).map(([k, [name, desc]]) =>
        h("button", { class: "tile", onclick: () => go("practice", { kind: k }) }, h("b", {}, name), h("span", {}, desc))),
        h("button", { class: "tile", onclick: () => go("practice", { kind: "expand" }) }, h("b", {}, "Expand your grove"), h("span", {}, "add words you already know"))));
    return;
  }
  if (kind === "expand") return expandGrove(card);
  const next = () => (auto ? startActivity(pickBySliders(state.sliders), true) : go("practice", { kind, auto, n: Math.random() }));
  const nextBtn = () => h("button", { class: "b", onclick: next }, "Next ▸");
  card.append(h("div", { class: "row" }, h("h2", { style: { margin: 0 } }, ACTIVITIES[kind][0]), auto ? h("span", { class: "badge" }, `chosen for: ${EX_SKILL[kind]}`) : null));
  const types = { flashcard: ["word", "phrase"], mc: ["word", "phrase"], translate: ["word", "phrase"], tiles: ["pattern", "phrase"], gap: ["word"], write: ["pattern"] }[kind];
  const pick = pickTarget(state, lex, types);
  if (!pick) { card.append(h("p", {}, "Nothing to drill here. Words you mark after new content (or with “Drill this”) show up here.")); return; }
  const it = pick.i;
  const s = pick.sent[0].s;
  const gradeIt = (ok) => { const r = grade(state, it.id, ok, kind); save(); return r === "promoted" ? h("p", { class: "ok" }, `🌱 “${it.sv}” joined your ground – drilling done!`) : null; };
  const finish = (ok, msg) => {
    const promo = gradeIt(ok);
    card.append(h("p", { class: ok ? "ok" : "bad" }, msg || (ok ? "Right!" : "Not quite.")), promo, nextBtn());
  };
  card.append(h("p", { class: "mute" }, "Drilling: ", h("b", {}, it.type === "pattern" ? it.name : it.sv), " ", stPill(it)));

  if (kind === "flashcard") {
    const ex = sentencesFor(it.id, state, lex)[0]?.s;
    const back = h("div", { hidden: true }, h("p", { style: { fontSize: "20px" } }, meaning(it)), ex ? h("div", { class: "sentence" }, play(ex.sv), renderSentence(ex.sv, { target: it.id })) : null, ex && !englishHidden() ? h("div", { class: "en" }, ex.en) : null,
      h("div", { class: "row" }, h("button", { class: "b warn", onclick: () => { gradeIt(false); next(); } }, "Again"),
        h("button", { class: "b", onclick: () => { const p = gradeIt(true); p ? card.append(p, nextBtn()) : next(); } }, "Got it")));
    card.append(h("div", { class: "sentence" }, play(it.sv), h("b", {}, it.sv)), h("button", { class: "b ghost", onclick: (e) => { e.target.remove(); back.hidden = false; } }, "Show meaning"), back);
  }
  if (kind === "mc") {
    card.append(h("div", { class: "sentence" }, play(s.sv), renderSentence(s.sv, { target: it.id })), h("p", {}, `What does “${it.sv}” mean here?`));
    const distract = shuffle(allItems(lex).filter((x) => x.type === it.type && x.id !== it.id && x.en !== it.en)).slice(0, 3);
    const opts = h("div", { class: "opts" });
    for (const o of shuffle([it, ...distract])) {
      opts.append(h("button", { onclick: (e) => {
        if (opts.dataset.done) return; opts.dataset.done = 1;
        const ok = o.id === it.id;
        e.target.classList.add(ok ? "right" : "wrong");
        [...opts.children].find((b) => b.textContent === it.en)?.classList.add("right");
        card.append(h("div", { class: "en" }, s.en));
        finish(ok);
      } }, o.en));
    }
    card.append(opts);
  }
  if (kind === "translate") {
    const inp = h("input", { style: { width: "100%", fontSize: "18px" }, placeholder: "Type it in Swedish…" });
    card.append(h("p", { style: { fontSize: "20px" } }, s.en), inp, h("button", { class: "b", onclick: (e) => {
      e.target.disabled = true;
      const ok = norm(inp.value) === norm(s.sv);
      const mine = new Set(norm(inp.value).split(" "));
      card.append(h("div", { class: "sentence" }, play(s.sv), renderSentence(s.sv)),
        ok ? null : h("p", { class: "mute" }, "Missing or different: ", norm(s.sv).split(" ").filter((w) => !mine.has(w)).join(", ") || "word order"));
      finish(ok);
    } }, "Check"));
    inp.focus();
  }
  if (kind === "tiles") {
    const words = s.sv.replace(/[.!?–"]/g, "").split(/\s+/).filter(Boolean);
    const extra = shuffle(lex.words.filter((w) => status(state, w.id) === "ground" && !words.map((x) => x.toLowerCase()).includes(w.sv))).slice(0, 2).map((w) => w.sv);
    const answer = h("div", { class: "tiles" }), pool = h("div", { class: "tiles" });
    const tile = (w) => { const b = h("button", { onclick: () => (b.parentNode === pool ? answer : pool).append(b) }, w); return b; };
    for (const w of shuffle([...words, ...extra])) pool.append(tile(w));
    card.append(h("p", { style: { fontSize: "20px" } }, s.en), answer, pool, h("button", { class: "b", onclick: (e) => {
      e.target.disabled = true;
      const ok = norm([...answer.children].map((b) => b.textContent).join(" ")) === norm(s.sv);
      card.append(h("div", { class: "sentence" }, play(s.sv), renderSentence(s.sv)));
      if (it.type === "pattern") card.append(h("div", { style: { borderLeft: `4px solid ${it.color}`, paddingLeft: "8px" } }, h("b", {}, it.name), h("div", { class: "mute" }, it.rule)));
      finish(ok);
    } }, "Check"));
  }
  if (kind === "gap") {
    const tok = annotate(s.sv, lex).tokens.find((t) => t.wordId === it.id);
    const inp = h("input", { size: Math.max(4, tok.t.length), style: { fontSize: "20px" } });
    card.append(h("div", { class: "sentence" }, s.sv.slice(0, tok.start), inp, s.sv.slice(tok.end)), englishHidden() ? h("p", { class: "en" }, it.explain_sv || "") : h("p", { class: "en" }, s.en),
      h("button", { class: "b ghost", onclick: () => (inp.placeholder = tok.t[0] + "…") }, "Hint"),
      h("button", { class: "b", onclick: (e) => {
        e.target.disabled = true;
        const ok = inp.value.trim().toLowerCase() === tok.lower;
        card.append(h("div", { class: "sentence" }, play(s.sv), renderSentence(s.sv, { target: it.id })));
        finish(ok, ok ? "Right!" : `It's “${tok.t}”.`);
      } }, "Check"));
    inp.focus();
  }
  if (kind === "write") {
    card.append(h("div", { style: { borderLeft: `4px solid ${it.color}`, paddingLeft: "10px" } }, h("p", {}, it.rule),
      ...it.examples.map((ex) => h("div", { class: "sentence" }, play(ex), renderSentence(ex)))));
    const ta = h("textarea", { placeholder: `Write a Swedish sentence that uses “${it.name}”…` });
    const out = h("div");
    card.append(ta, h("button", { class: "b", onclick: () => {
      if (!ta.value.trim()) return;
      const a = annotate(ta.value, lex);
      const hit = a.items.includes(it.id);
      out.replaceChildren(h("div", { class: "sentence" }, play(ta.value), renderSentence(ta.value)),
        h("p", { class: "mute" }, hit ? "grove's simple check finds the pattern." : "grove's simple check can't find the pattern – the AI will judge."),
        aiExchange({
          title: "Get feedback from AI",
          prompt: writingPrompt({ pattern: it.name, rule: it.rule, text: ta.value.trim() }),
          check: checkWriting,
          accept: (d) => {
            const ok = d.correct && d.uses_pattern;
            grade(state, it.id, ok, "write"); save();
            out.append(h("div", { class: "card" }, h("p", { class: ok ? "ok" : "bad" }, ok ? "Correct, and it uses the pattern!" : d.correct ? "Correct Swedish, but it doesn't use the pattern." : "Not quite right."),
              d.corrected.trim() !== ta.value.trim() ? h("div", { class: "sentence" }, play(d.corrected), renderSentence(d.corrected)) : null,
              h("p", {}, d.explanation), nextBtn()));
          },
        }));
    } }, "Check"), h("button", { class: "b ghost", onclick: next }, "Skip"), out);
  }
}

// ---------- dictionary (round 3 notes; PR-p1-16) ----------
function dictionary(main, { tab = "word", explain }) {
  const tabs = h("div", { class: "row" }, ...[["word", "Words"], ["phrase", "Phrases"], ["pattern", "Grammar patterns"]].map(([k, v]) =>
    h("button", { class: "b" + (k === tab ? "" : " ghost"), onclick: () => go("dictionary", { tab: k }) }, v)));
  const card = h("div", { class: "card" }, h("h2", {}, "Dictionary"), h("p", { class: "mute" }, "Everything you've met, with where you first met it."), tabs);
  main.append(card);
  const ctx = (id) => {
    const c = state.contexts[id] || (() => { const s = sentencesFor(id, state, lex)[0]?.s; return s ? { sv: s.sv, en: s.en } : null; })();
    return c ? h("div", {}, h("span", { class: "ctx" }, play(c.sv), renderSentence(c.sv, { target: id })), englishHidden() ? null : h("div", { class: "en" }, c.en, c.title ? ` – from “${c.title}”` : "")) : "";
  };
  if (tab === "pattern") {
    for (const p of lex.patterns) {
      card.append(h("div", { style: { borderLeft: `5px solid ${p.color}`, padding: "4px 12px", margin: "14px 0" } },
        h("div", { class: "row" }, h("b", {}, p.name), stPill(p), state.met[p.id] ? h("span", { class: "mute" }, `met ${state.met[p.id]}×`) : null),
        h("div", {}, p.rule), ...p.examples.map((ex) => h("div", { class: "sentence", style: { fontSize: "18px", margin: 0 } }, play(ex), renderSentence(ex))),
        explanationBox(p, explain === p.id)));
    }
    if (explain) setTimeout(() => document.getElementById("x-" + explain)?.scrollIntoView({ block: "center" }), 50);
    return;
  }
  const q = h("input", { placeholder: "Search…" });
  const ssel = h("select", {}, ...["all", "ground", "drilling", "fading"].map((s) => h("option", { value: s }, s === "all" ? "all" : STATUS_LABEL[s])));
  const body = h("tbody");
  const fill = () => {
    const items = allItems(lex).filter((i) => i.type === tab && status(state, i.id) !== "new" && (ssel.value === "all" || status(state, i.id) === ssel.value)
      && (!q.value || i.sv.includes(q.value.toLowerCase()) || i.en.toLowerCase().includes(q.value.toLowerCase())));
    body.replaceChildren(...items.sort((a, b) => a.sv.localeCompare(b.sv, "sv")).map((i) => h("tr", {},
      h("td", {}, play(i.sv), h("b", {}, i.sv)), h("td", {}, meaning(i)), h("td", {}, stPill(i)), h("td", { class: "mute" }, state.met[i.id] ? `${state.met[i.id]}×` : "–"),
      h("td", {}, ctx(i.id)))));
  };
  q.oninput = ssel.onchange = fill;
  fill();
  card.append(h("div", { class: "row", style: { margin: "12px 0" } }, q, ssel),
    h("table", {}, h("thead", {}, h("tr", {}, ...["Swedish", "Meaning", "Status", "Met", "Example"].map((x) => h("th", {}, x)))), body));
}
function explanationBox(p, open) {
  const ex = state.explanations[p.id];
  const area = h("div", { id: "x-" + p.id });
  const shown = ex ? h("div", { class: "notice" }, h("b", {}, "AI explanation: "), ex.explanation,
    ...ex.examples.map((e) => h("div", {}, h("div", { class: "sentence", style: { fontSize: "18px", margin: 0 } }, play(e.sv), renderSentence(e.sv)), h("div", { class: "en" }, e.en)))) : null;
  const openIt = () => area.replaceChildren(aiExchange({
    title: `Explain “${p.name}”`,
    prompt: grammarPrompt({ pattern: p.name, rule: p.rule, examples: p.examples, known: knownLemmas(lex, state) }),
    check: (d) => checkGrammar(d, lex, state),
    accept: (d) => {
      rememberInflections(d.inflections);
      const fresh = (d.new_words || []).map((w) => addWord({ form: w.form, lemma: w.lemma, en: w.en, explain_sv: w.explain_sv, topic: "core" })).filter((id) => status(state, id) === "new");
      submitToBank(d.new_words, [], d.inflections);
      state.explanations[p.id] = { explanation: d.explanation, examples: d.examples };
      state.custom.sentences.push(...d.examples.map((e, i) => ({ id: `gx:${p.id}:${Date.now()}:${i}`, sv: e.sv, en: e.en, topic: "core", source: "ai" })));
      rebuild(); save();
      if (fresh.length) go("mark", { ids: fresh, back: "dictionary" }); else go("dictionary", { tab: "pattern", explain: p.id });
    },
  }));
  if (open) openIt();
  return h("div", {}, shown, open ? null : h("button", { class: "b ghost", onclick: openIt }, ex ? "Ask again" : "Explain with AI"), area);
}

// ---------- grove map (PR-p1-08, PR-p1-09) ----------
function grove(main) {
  const W = 330, H = 420;
  const trees = lex.topics.filter((t) => allItems(lex).some((i) => i.topic === t.id));
  const NS = "http://www.w3.org/2000/svg";
  const s = (tag, attrs, ...kids) => { const el = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v); kids.forEach((k) => el.append(k)); return el; };
  const svg = s("svg", { viewBox: `0 0 ${W * Math.min(trees.length, 2)} ${H * Math.ceil(trees.length / 2)}` });
  trees.forEach((t, ti) => {
    const ox = (ti % 2) * W, oy = Math.floor(ti / 2) * H, cx = ox + W / 2;
    const g = s("g", {});
    g.append(s("path", { d: `M${cx - 10},${oy + H - 30} L${cx - 5},${oy + 170} L${cx + 5},${oy + 170} L${cx + 10},${oy + H - 30} Z`, fill: "#7a5a3a" }));
    g.append(s("ellipse", { cx, cy: oy + 175, rx: 140, ry: 130, fill: t.color, opacity: 0.08 }));
    g.append(s("text", { x: cx, y: oy + H - 10, "text-anchor": "middle", "font-size": 15, "font-weight": 600, fill: "#24301f" }, t.name));
    const rows = [["pattern", 70, 105], ["phrase", 120, 185], ["word", 195, 290]];
    const pos = {};
    for (const [type, y0, y1] of rows) {
      const its = allItems(lex).filter((i) => i.type === type && i.topic === t.id);
      const perRow = type === "word" ? 10 : 6;
      const nrows = Math.max(1, Math.ceil(its.length / perRow));
      its.forEach((it, k) => {
        const r = Math.floor(k / perRow), inRow = Math.min(perRow, its.length - r * perRow), c = k % perRow;
        const y = oy + y0 + (nrows === 1 ? (y1 - y0) / 2 : (r * (y1 - y0)) / (nrows - 1));
        const half = 125 * Math.sqrt(Math.max(0.15, 1 - ((y - oy - 175) / 135) ** 2));
        pos[it.id] = [inRow === 1 ? cx : cx - half + (2 * half * c) / (inRow - 1), y];
      });
    }
    for (const it of allItems(lex).filter((i) => i.topic === t.id && i.deps?.length)) for (const d of it.deps) if (pos[d])
      g.append(s("line", { x1: pos[it.id][0], y1: pos[it.id][1], x2: pos[d][0], y2: pos[d][1], stroke: "#7a5a3a", "stroke-opacity": 0.15 }));
    for (const it of allItems(lex).filter((i) => i.topic === t.id)) {
      const [x, y] = pos[it.id];
      const st = status(state, it.id), lk = locked(state, it), risk = atRisk(state, it);
      const r = it.type === "pattern" ? 9 : it.type === "phrase" ? 7 : 5.5;
      const col = it.type === "pattern" ? it.color : t.color;
      const attrs = { cx: x, cy: y, r, style: "cursor:pointer" };
      if (st === "ground") Object.assign(attrs, { fill: col });
      else if (st === "fading") Object.assign(attrs, { fill: "#c9b458", opacity: 0.55 });
      else if (st === "drilling") Object.assign(attrs, { fill: col, opacity: 0.45 });
      else Object.assign(attrs, { fill: "#fff", stroke: lk ? "#aaa" : col, "stroke-dasharray": lk ? "2 2" : "none", "stroke-width": 1.5 });
      const c = s("circle", attrs, s("title", {}, `${it.sv} – ${it.type === "pattern" ? "" : it.en} (${risk ? "at risk" : lk ? "locked" : STATUS_LABEL[st]})`));
      c.addEventListener("click", () => inspector(itemLine(it.id), it.deps?.length ? h("p", { class: "mute" }, "Built on: ", it.deps.map((d) => `${lex.byId.get(d).sv} (${STATUS_LABEL[status(state, d)]})`).join(", ")) : null,
        it.type === "pattern" ? h("p", {}, it.rule) : h("div", {}, play(it.sv))));
      g.append(c);
      if (risk) g.append(s("circle", { cx: x, cy: y, r: r + 3.5, fill: "none", stroke: "#e67e22", "stroke-width": 2 }));
    }
    svg.append(g);
  });
  const dot = (style) => h("span", { class: "dot", style });
  main.append(h("div", { class: "card grove" }, h("h2", {}, "My grove"),
    h("p", { class: "mute" }, "One tree per topic. Words at the bottom, phrases in the middle, grammar patterns (in Basics) at the top. Click a leaf."),
    h("div", { class: "legend" }, h("span", {}, dot({ background: "#3f8f55" }), "known (ground)"), h("span", {}, dot({ background: "#3f8f55", opacity: 0.45 }), "drilling"),
      h("span", {}, dot({ background: "#c9b458", opacity: 0.6 }), "fading (drilled, wilting)"), h("span", {}, dot({ border: "1.5px solid #3f8f55" }), "new"),
      h("span", {}, dot({ border: "1.5px dashed #aaa" }), "locked (parts not met)"), h("span", {}, dot({ border: "2px solid #e67e22" }), "at risk (a part is fading)")),
    svg));
}

// ---------- progress (PR-p1-17, PR-p1-35, PR-p1-39) ----------
function stats(main) {
  const items = allItems(lex);
  const sts = ["ground", "drilling", "fading", "new"];
  const table = h("table", {}, h("tr", {}, h("th", {}, ""), ...sts.map((s) => h("th", {}, STATUS_LABEL[s]))),
    ...["word", "phrase", "pattern"].map((ty) => h("tr", {}, h("td", {}, ty + "s"), ...sts.map((s) => h("td", {}, items.filter((i) => i.type === ty && status(state, i.id) === s).length)))));
  const lvl = levelOf(state, lex, bankData.freq);
  // input per day, last 14 days
  const days = [...Array(14)].map((_, i) => new Date(Date.now() - (13 - i) * DAY).toISOString().slice(0, 10));
  const perDay = days.map((d) => state.inputLog.filter((e) => new Date(e.t).toISOString().slice(0, 10) === d).reduce((a, e) => a + e.ms, 0) / 60000);
  const maxM = Math.max(10, ...perDay);
  const bars = h("div", { class: "bars" }, ...perDay.map((m, i) => h("div", { title: `${days[i]}: ${Math.round(m)} min` }, h("i", { style: { height: `${(m / maxM) * 100}%` } }), h("span", {}, days[i].slice(8)))));
  // ground over time
  const snaps = state.snapshots.slice(-30);
  const max = Math.max(1, ...snaps.map((s) => s.learned));
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 600 180"); svg.style.width = "100%";
  const pts = snaps.map((s, i) => [40 + (i * 540) / Math.max(1, snaps.length - 1), 160 - (s.learned / max) * 140]);
  svg.innerHTML = `<line x1="40" y1="160" x2="580" y2="160" stroke="#ccc"/><text x="4" y="24" font-size="11" fill="#6b7563">${max}</text><text x="4" y="160" font-size="11" fill="#6b7563">0</text>
    <polyline fill="none" stroke="#3f8f55" stroke-width="2.5" points="${pts.map((p) => p.join(",")).join(" ")}"/>
    ${pts.map((p, i) => `<circle cx="${p[0]}" cy="${p[1]}" r="3" fill="#3f8f55"><title>${snaps[i].date}: ${snaps[i].learned}</title></circle>`).join("")}`;
  // per skill
  const since = Date.now() - 14 * DAY;
  const recent = [...state.history.filter((e) => e.t >= since).map((e) => EX_SKILL[e.ex] || "vocabulary"), ...state.inputLog.filter((e) => e.t >= since).map((e) => e.kind)];
  const bySkill = {}; for (const k of recent) bySkill[k] = (bySkill[k] || 0) + 1;
  const sliderSum = Object.values(state.sliders).reduce((a, b) => a + b, 0) || 1;
  const skills = h("div", {}, ...Object.keys(SKILL_ACTIVITY).map((k) => {
    const done = recent.length ? (bySkill[k] || 0) / recent.length : 0, want = state.sliders[k] / sliderSum;
    return h("div", { class: "slider" }, h("span", {}, k), h("div", { style: { position: "relative", height: "14px", background: "#eee", borderRadius: "7px" } },
      h("div", { style: { width: `${done * 100}%`, height: "100%", background: "#3f8f55", borderRadius: "7px" } }),
      h("div", { title: "your goal", style: { position: "absolute", left: `${want * 100}%`, top: "-3px", width: "3px", height: "20px", background: "#24301f" } })), h("span", { class: "mute" }, bySkill[k] || 0));
  }));
  const metWords = lex.words.filter((w) => state.met[w.id]).sort((a, b) => state.met[b.id] - state.met[a.id]);
  main.append(
    h("div", { class: "card" }, h("h2", {}, "Progress"),
      h("div", { class: "stats-row" }, h("div", {}, h("b", {}, fmtH(inputHours(state))), h("span", {}, "of input in total")),
        h("div", {}, h("b", {}, lvl.name), h("span", {}, `estimated from ${lvl.words} known words`)), h("div", {}, h("b", {}, metWords.length), h("span", {}, "different words met"))),
      h("h3", {}, "Minutes of input per day"), bars),
    h("div", { class: "card" }, h("h2", {}, "What your hours can bring"), roadmap(), h("p", { class: "mute" }, "A rough guide from learners' experience with input-based methods – everyone is different.")),
    h("div", { class: "card" }, h("h2", {}, "Your ground over time"), svg, table),
    h("div", { class: "card" }, h("h2", {}, "Words you meet most"), h("p", {}, ...metWords.slice(0, 30).map((w) => h("span", { class: "chip" }, `${w.sv} ${state.met[w.id]}×`)))),
    h("div", { class: "card" }, h("h2", {}, "Activity per skill (last 14 days)"), h("p", { class: "mute" }, "Green bar = share of your activity; black mark = share you asked for with the goal sliders."), skills));
}

// ---------- topics & pasted texts (PR-p1-05, PR-p1-13) ----------
function topics(main) {
  const name = h("input", { placeholder: "e.g. Football" });
  const vocab = h("div");
  const list = h("table", {}, h("tr", {}, ...["Topic", "Words", "Phrases", "Known", ""].map((x) => h("th", {}, x))),
    ...lex.topics.map((t) => {
      const its = allItems(lex).filter((i) => i.topic === t.id);
      const genBtn = h("button", { class: "b ghost", onclick: () => {
        vocab.replaceChildren(aiExchange({
          title: `Starter vocabulary for “${t.name}”`,
          prompt: topicPrompt({ topic: t.name, known: knownLemmas(lex, state) }),
          check: (d) => checkTopic(d, lex, state),
          accept: (d) => {
            rememberInflections(d.inflections);
            const ids = d.words.map((w) => addWord({ form: w.lemma, lemma: w.lemma, en: w.en, explain_sv: w.explain_sv, topic: t.id, forms: w.forms }));
            ids.push(...(d.phrases || []).map((p) => addPhrase({ sv: p.sv, en: p.en, topic: t.id })));
            submitToBank(d.words.map((w) => ({ ...w, form: w.lemma })), d.phrases || [], d.inflections);
            state.custom.sentences.push(...d.sentences.map((s, i) => ({ id: `tp:${t.id}:${Date.now()}:${i}`, sv: s.sv, en: s.en, topic: t.id, source: "ai" })));
            rebuild(); save();
            go("mark", { ids: ids.filter((id) => status(state, id) === "new"), back: "topics" });
          },
        }));
        vocab.scrollIntoView({ block: "start" });
      } }, "Generate vocabulary");
      return h("tr", {}, h("td", {}, h("span", { class: "dot", style: { background: t.color } }), t.name), h("td", {}, its.filter((i) => i.type === "word").length),
        h("td", {}, its.filter((i) => i.type === "phrase").length), h("td", {}, its.filter((i) => status(state, i.id) === "ground").length), h("td", {}, genBtn));
    }));
  const ta = h("textarea", { placeholder: "Paste a Swedish text or article here…", style: { minHeight: "140px" } });
  const ts = topicSelect(false);
  const out = h("div");
  main.append(
    h("div", { class: "card" }, h("h2", {}, "Topics"), list, h("h3", {}, "New topic"),
      h("div", { class: "row" }, name, h("button", { class: "b", onclick: () => {
        if (!name.value.trim()) return;
        state.custom.topics.push({ id: name.value.toLowerCase().replace(/\W+/g, "-"), name: name.value.trim(), color: `hsl(${Math.floor(Math.random() * 360)} 45% 42%)` });
        rebuild(); save(); route();
      } }, "Add topic"), h("span", { class: "mute" }, "then Generate vocabulary to give it words")), vocab),
    h("div", { class: "card" }, h("h2", {}, "Learn from a text you paste"), ta, h("div", { class: "row" }, "Topic:", ts, h("button", { class: "b", onclick: () => analyse() }, "Analyse")), out));

  function analyse() {
    const text = ta.value.trim();
    if (!text) return;
    const a = annotate(text, lex);
    const known = a.tokens.filter((t) => t.wordId || t.name).length;
    const sentences = text.match(/[^.!?]+[.!?]*/g) || [text];
    const rows = h("div");
    out.replaceChildren(h("p", {}, h("b", {}, `${a.tokens.length ? Math.round((100 * known) / a.tokens.length) : 0}% of the words are in your grove`), ` · ${a.unknown.length} unknown words`),
      h("div", { class: "passage" }, ...sentences.map((s) => h("div", { class: "sentence" }, play(s.trim()), renderSentence(s.trim())))),
      a.unknown.length ? h("h3", {}, "Add unknown words") : null, rows);
    const words = a.unknown.slice(0, 60);
    if (words.length) out.insertBefore(aiExchange({
      title: "Get meanings from AI",
      prompt: glossPrompt({ words, context: text.slice(0, 3000) }),
      check: (d) => checkGloss(d, words),
      accept: (d) => {
        for (const g of d.glosses) {
          const r = [...rows.children].find((r) => r.data?.u === String(g.form).toLowerCase());
          if (r) { r.data.lemma.value = g.lemma; r.data.en.value = g.en; r.data.explain = g.explain_sv; r.data.fromAi = true; }
        }
      },
    }), rows);
    rows.replaceChildren(...words.map((u) => {
      const be = bankData.entries.find((e) => e.status === "checked" && (e.lemma === u || (e.forms || []).includes(u)));
      const cb = h("input", { type: "checkbox", checked: true }), lemma = h("input", { value: be?.lemma || u, size: 12 }), en = h("input", { value: be?.en || "", placeholder: "meaning", size: 18, title: be ? "from the shared bank" : "" });
      const r = h("div", { class: "row", style: { margin: "4px 0" } }, cb, h("b", { style: { minWidth: "110px" } }, u), lemma, en);
      r.data = { u, cb, lemma, en };
      return r;
    }));
    if (words.length) rows.append(h("button", { class: "b", onclick: () => {
      const ids = [];
      const sub = [];
      for (const r of rows.children) if (r.data?.cb.checked && r.data.en.value) { ids.push(addWord({ form: r.data.u, lemma: r.data.lemma.value, en: r.data.en.value, explain_sv: r.data.explain, topic: ts.value })); if (r.data.fromAi) sub.push({ form: r.data.u, lemma: r.data.lemma.value, en: r.data.en.value, explain_sv: r.data.explain }); }
      submitToBank(sub, [], []);
      state.custom.sentences.push(...sentences.map((s, i) => ({ id: `paste:${Date.now()}:${i}`, sv: s.trim(), en: "", topic: ts.value, source: "pasted" })));
      rebuild(); save();
      go("mark", { ids: ids.filter((id) => status(state, id) === "new"), back: "topics" });
    } }, "Add checked words"));
  }
}

// ---------- shared bank (PR-p1-89, 94…98, 114) ----------
async function refreshShared() {
  try { bankData = await api("/api/bank"); } catch {}
  try { shared = await api("/api/library"); } catch {}
}
function submitToBank(words = [], phrases = [], inflections = []) {
  const byLemma = new Map();
  for (const w of words || []) if (w?.lemma && w?.en) byLemma.set(String(w.lemma).toLowerCase(), { kind: "word", lemma: w.lemma, en: w.en, explain_sv: w.explain_sv, forms: [w.form, ...(w.forms || [])].filter(Boolean) });
  for (const i of inflections || []) { const e = byLemma.get(String(i.lemma).toLowerCase()); if (e) e.forms.push(i.form); }
  const entries = [...byLemma.values(), ...(phrases || []).filter((p) => p?.sv && p?.en).map((p) => ({ kind: "phrase", lemma: p.sv, en: p.en, explain_sv: p.explain_sv }))];
  if (!entries.length) return;
  api("/api/bank/submit", { entries }).then(refreshShared).then(() => { if (["home", "dictionary"].includes(current.view)) route(); }).catch(() => {});
}
// PR-p1-96: grove recognises inflected forms from the bank, so they don't count as unknown
function mergeBankForms() {
  const ex = (state.custom.extraForms ||= {});
  for (const e of bankData.entries) if (e.status === "checked" && e.kind === "word") {
    const wid = lex.formMap.get(e.lemma);
    if (!wid) continue;
    for (const f of e.forms || []) if (!lex.formMap.has(f)) (ex[wid] ||= []).push(f);
  }
  rebuild();
}
// PR-p1-114: the owner rejected one of your entries; you choose what happens to it
function rejectedOffers() {
  const list = bankData.entries.filter((e) => e.mine && e.status === "rejected" && !e.choice && !state.bankChoices?.[e.lemma]);
  if (!list.length) return null;
  const card = h("div", { class: "card notice" }, h("h2", {}, "The owner checked some of your words"));
  for (const e of list) {
    const choose = async (choice) => {
      await api("/api/bank/choose", { id: e.id, choice });
      const id = (e.kind === "phrase" ? "p:" : "w:") + e.lemma;
      if (choice === "take" && e.offer.type === "correction") { const cw = state.custom.words.find((w) => w.id === id) || state.custom.phrases.find((w) => w.id === id); if (cw) cw.en = e.offer.en; }
      if (choice === "take" && e.offer.type === "delete") { state.custom.words = state.custom.words.filter((w) => w.id !== id); state.custom.phrases = state.custom.phrases.filter((w) => w.id !== id); delete state.ground[id]; delete state.drill[id]; delete state.srs[id]; }
      (state.bankChoices ||= {})[e.lemma] = choice; rebuild(); save(); await refreshShared(); route();
    };
    card.append(h("div", { style: { margin: "8px 0" } }, h("b", {}, e.lemma), ` – your AI said “${e.en}”. `,
      e.offer.type === "correction" ? `The owner suggests “${e.offer.en}”.` : "The owner suggests deleting it.",
      h("div", { class: "row" },
        h("button", { class: "b", onclick: () => choose("take") }, e.offer.type === "correction" ? "Use the correction" : "Delete it"),
        h("button", { class: "b ghost", onclick: () => choose("keep") }, "Keep mine, marked rejected"))));
  }
  return card;
}

// ---------- shared library (PR-p1-131, 138…144) ----------
const CEFR = ["A1", "A2", "B1", "B2", "C1", "C2"];
function sharedLibrary() {
  const myIdx = Math.max(0, levelOf(state, lex, bankData.freq).index - 1);
  const showAll = h("input", { type: "checkbox", onchange: () => fill() });
  const body = h("div");
  const fill = () => {
    const have = new Set(state.library.map((x) => x.sharedId).filter(Boolean));
    const texts = shared.texts.filter((x) => x.status !== "deleted" && (showAll.checked || x.source.mine || CEFR.indexOf(x.level) <= myIdx + 1));
    body.replaceChildren(texts.length ? h("table", {}, ...texts.map((x) => h("tr", {},
      h("td", {}, h("b", {}, x.title), x.status === "checked" ? null : h("span", { class: "tag unchecked", title: x.why }, "waiting for the check")),
      h("td", {}, KIND_LABEL[x.kind] || x.kind, ` · ${x.level}`), h("td", { class: "mute" }, x.source.mine ? "shared by you" : x.by ? `by ${x.by}` : "anonymous"),
      h("td", {}, have.has(x.id) ? h("span", { class: "ok" }, "in your library") : x.status === "checked" ? h("button", { class: "b ghost", onclick: () => addShared(x) }, "Add to my library") : null),
      h("td", {}, x.source.mine ? null : h("button", { class: "b ghost", title: "Report this text", onclick: () => reportText(x) }, "⚑"))))) : h("p", { class: "mute" }, "No shared texts at your level yet."));
  };
  fill();
  return h("div", { class: "card" }, h("h2", {}, "Shared library"), h("p", { class: "mute" }, "Texts other learners got from their AI and shared, checked word by word. Fewer prompts for everyone."),
    h("label", {}, showAll, " show all levels"), body);
}
function addShared(x) {
  const id = "lib:shared:" + x.id;
  state.library.push({ id, sharedId: x.id, kind: x.kind, title: x.title, lines: x.lines, questions: x.questions || [], est: x.est, created: Date.now(), read: false, rating: null });
  state.custom.sentences.push(...x.lines.filter((l) => l.en).map((l, k) => ({ id: `${id}:${k}`, sv: l.sv, en: l.en, topic: "core", source: "shared" })));
  rebuild(); save(); route();
}
function reportText(x) {
  const why = prompt(`Report “${x.title}”. Why? Type one: copyright, wrong, offensive`, "wrong");
  if (!why) return;
  const note = prompt("A note for the owner (optional):", "") || "";
  api("/api/library/report", { id: x.id, why, note }).then(() => alert("Thanks – the owner will look at it.")).catch((e) => alert(e.message));
}
function applyDeleted() { // PR-p1-146: a deleted text's sentences go with it
  const gone = new Set((shared.deleted || []).map((d) => d.id));
  const local = state.library.filter((x) => x.sharedId && gone.has(x.sharedId)).map((x) => x.id);
  if (!local.length) return;
  state.library = state.library.filter((x) => !local.includes(x.id));
  state.custom.sentences = state.custom.sentences.filter((s) => !local.some((l) => s.id.startsWith(l + ":")));
}
function shareBox(textIds) { // PR-p1-141, 143: the learner chooses per text, and whether their name shows
  const rows = textIds.map((tid) => { const tx = state.library.find((x) => x.id === tid); const cb = h("input", { type: "checkbox" }); return { tx, cb }; }).filter((r) => r.tx);
  const name = h("input", { type: "checkbox" });
  const out = h("div");
  return h("div", { class: "notice" }, h("b", {}, "Share with other learners? "), "Shared texts are checked first, so they're confirmed sooner.",
    ...rows.map((r) => h("div", {}, h("label", {}, r.cb, ` ${r.tx.title}`))), h("label", {}, name, " show my name (otherwise anonymous)"),
    h("div", {}, h("button", { class: "b ghost", onclick: async (e) => {
      e.target.disabled = true;
      for (const r of rows.filter((r) => r.cb.checked)) {
        try { const j = await api("/api/library/share", { title: r.tx.title, kind: r.tx.kind, lines: textSentences(r.tx), questions: r.tx.questions, est: r.tx.est, source: "ai", showName: name.checked, names: state.custom.names });
          r.tx.sharedId = j.id; out.append(h("div", {}, `“${r.tx.title}”: ${j.status === "checked" ? "shared ✓" : "shared, waiting for the check (" + j.why + ")"}`)); }
        catch (err) { out.append(h("div", { class: "err" }, err.message)); }
      }
      save(); refreshShared();
    } }, "Share the ticked texts")), out);
}

// ---------- starting level (PR-p1-115…118, 123; X-p1-04, X-p1-05) ----------
// Fixed graded test texts (X-p1-05: made once and checked by the owner; kept in the code in the prototype, in the bank later).
const TEST_TEXTS = [
  ["A1", "Jag heter Anna. Jag bor i ett litet hus. Jag har en katt. Katten är svart. Varje morgon dricker jag kaffe."],
  ["A2", "I helgen åkte vi till landet. Vi gick en lång promenad i skogen och plockade svamp. På kvällen lagade vi middag tillsammans och spelade kort."],
  ["B1", "Trots att det regnade hela dagen bestämde vi oss för att gå ut. Vi tog på oss regnkläder och följde stigen längs sjön, där vi till slut hittade en övergiven båt."],
  ["B2", "Kommunen har beslutat att bygga om stadens bibliotek, vilket har väckt starka reaktioner bland invånarna. Kritikerna menar att pengarna borde ha använts till skolor och äldreomsorg i stället."],
];
function start(main, { step = "pick", level }) {
  const card = h("div", { class: "card" });
  main.append(card);
  if (step === "pick") {
    card.append(h("h2", {}, "Where are you starting from?"),
      h("p", {}, "Pick your level, and grove adds the most common words for it to your ground (the words you know). Not sure? Take a short reading test."),
      h("div", { class: "row" }, ...["Pre-A1", "A1", "A2", "B1", "B2", "C1"].map((l) => h("button", { class: "b", onclick: () => go("start", { step: "check", level: l }) }, l))),
      h("p", { class: "mute" }, "Levels follow CEFR, the European scale from A1 (beginner) to C2 (near-native)."),
      h("button", { class: "b ghost", onclick: () => go("start", { step: "test" }) }, "I don't know my level – test me"));
    return;
  }
  if (step === "test") {
    const ratings = {};
    card.append(h("h2", {}, "Reading test"), h("p", {}, "Read each text and say how much you understood."),
      ...TEST_TEXTS.map(([lv, txt]) => h("div", { class: "question" }, h("div", { class: "sentence", style: { fontSize: "18px" } }, play(txt), txt),
        h("div", { class: "row" }, ...RATINGS.map(([r, sv, en]) => { const b = h("button", { class: "b ghost rating", onclick: () => { ratings[lv] = r; b.parentNode.querySelectorAll("button").forEach((x) => x.classList.remove("on")); b.classList.add("on"); } }, h("b", {}, sv), h("small", {}, en)); return b; })))),
      h("button", { class: "b", onclick: () => { const ok = TEST_TEXTS.filter(([lv]) => understood(ratings[lv] || 0)).map(([lv]) => lv); go("start", { step: "check", level: ok.at(-1) || "Pre-A1" }); } }, "Done"));
    return;
  }
  // step "check": a sample of the level's words; tick the ones you don't know (PR-p1-116)
  const idx = CEFR.indexOf(level);
  const levelWords = bankData.freq.filter((f) => CEFR.indexOf(f.level) <= idx).map((f) => lex.formMap.get(f.lemma)).filter(Boolean);
  const sample = shuffle(levelWords).slice(0, 30);
  const ticked = new Set();
  card.append(h("h2", {}, `Starting at ${level}`), level === "Pre-A1" ? h("p", {}, "You're starting from the beginning: your ground starts empty.") :
    h("p", {}, `Here are ${sample.length} of the ${levelWords.length} words for ${level}. Tick the ones you `, h("b", {}, "don't"), " know; the rest of the level's words join your ground."),
    h("div", { class: "checklist" }, ...sample.map((wid) => { const w = lex.byId.get(wid); const l = h("label", {}, h("input", { type: "checkbox", onchange: (e) => { e.target.checked ? ticked.add(wid) : ticked.delete(wid); l.classList.toggle("on", e.target.checked); } }), w.sv, h("span", { class: "mute" }, ` ${englishHidden() ? "" : w.en}`)); return l; })),
    h("button", { class: "b", onclick: () => {
      let n = 0;
      for (const wid of levelWords) if (!ticked.has(wid) && status(state, wid) === "new") { addGround(state, wid, "start"); n++; } // ticked words stay new (PR-p1-123)
      for (const [pid, plv] of Object.entries(bankData.patternLevels || {})) if (idx >= 0 && CEFR.indexOf(plv) <= idx) state.srs[pid] = { stab: 30, last: Date.now(), reps: 3 }; // PR-p1-118
      state.startLevel = level; save();
      main.replaceChildren(h("div", { class: "card" }, h("p", { class: "ok" }, `🌱 ${n} words joined your ground. You can always add more with “Expand your grove”.`), h("button", { class: "b", onclick: () => go("home") }, "Go to Home ▸")));
    } }, "Done"));
}

// ---------- Expand your grove (PR-p1-120…123) ----------
function expandDue() {
  const last = state.library.filter((x) => x.read).slice(-3);
  const easyStreak = last.length === 3 && last.every((x) => x.rating === 5);
  const hours = inputHours(state) - (state.lastExpand?.hours || 0) >= 2;
  return (easyStreak || hours) && Date.now() - (state.lastExpand?.t || 0) > 3600e3;
}
function expandGrove(card) {
  const fresh = bankData.freq.map((f) => lex.formMap.get(f.lemma)).filter((id) => id && status(state, id) === "new").slice(0, 20);
  const known = shuffle(lex.words.filter((w) => status(state, w.id) === "ground").map((w) => w.id)).slice(0, 3); // PR-p1-122: a few ground words to catch wrong guesses
  const items = shuffle([...fresh, ...known]);
  const ticked = new Set();
  if (!items.length) { card.append(h("h2", {}, "Expand your grove"), h("p", {}, "You know every word in the frequency list. Impressive!")); return; }
  card.append(h("h2", {}, "Expand your grove"), h("p", {}, "These are the next most common words. Tick the ones you ", h("b", {}, "don't"), " know; the rest join your ground."),
    h("div", { class: "checklist" }, ...items.map((id) => { const w = lex.byId.get(id); const l = h("label", {}, h("input", { type: "checkbox", onchange: (e) => { e.target.checked ? ticked.add(id) : ticked.delete(id); l.classList.toggle("on", e.target.checked); } }), w.sv); return l; })),
    h("button", { class: "b", onclick: () => {
      let g = 0, d = 0;
      for (const id of fresh) if (!ticked.has(id)) { addGround(state, id, "expand"); g++; }          // unticked new words join the ground
      for (const id of known) if (ticked.has(id)) { markDrill(state, id); d++; }                       // a ticked ground word goes to drilling (PR-p1-122)
      save();                                                                                           // ticked new words stay new (PR-p1-123)
      card.replaceChildren(h("p", { class: "ok" }, `🌱 ${g} words joined your ground${d ? `; ${d} known word${d > 1 ? "s" : ""} will be drilled` : ""}.`), h("button", { class: "b", onclick: () => go("practice", { kind: "expand", n: Math.random() }) }, "More ▸"));
    } }, "Done"));
}

// ---------- owner (PR-p1-104, 111, 112, 114, 128, 140, 144…149, 236) ----------
async function owner(main) {
  if (me?.role !== "owner") return go("home");
  const card = h("div", { class: "card" }, h("h2", {}, "Owner"), h("p", { class: "mute" }, "Invitations, the review list, reports and accounts. You don't see anyone's learning progress."));
  main.append(card);
  let o;
  try { o = await api("/api/owner/overview"); } catch (e) { card.append(h("p", { class: "err" }, e.message)); return; }
  const decide = async (it, action, offer) => { await api("/api/owner/decide", { id: it.id, action, offer }); route(); };
  const reviewRow = (it) => {
    const corr = h("input", { placeholder: "correction (meaning)", size: 22 });
    return h("tr", {}, h("td", {}, it.type === "text" ? h("span", {}, h("b", {}, it.title), h("div", { class: "mute" }, it.lines.map((l) => l.sv).join(" "))) : h("span", {}, h("b", {}, it.lemma), ` – “${it.en}”`, it.forms?.length ? h("span", { class: "mute" }, ` (${it.forms.join(", ")})`) : null)),
      h("td", { class: "mute" }, `${it.why}; from ${it.by}${it.type === "text" ? `, ${it.source}` : ""}`),
      h("td", {}, h("button", { class: "b", onclick: () => decide(it, "approve") }, "Approve"),
        it.type === "entry" ? h("span", {}, corr, h("button", { class: "b warn", onclick: () => decide(it, "reject", corr.value ? { type: "correction", en: corr.value } : { type: "delete" }) }, "Reject")) : h("button", { class: "b warn", onclick: () => decide(it, "reject") }, "Reject")));
  };
  const entries = o.review.filter((r) => r.type === "entry");
  const batch = `You're checking Swedish dictionary entries that learners' AIs suggested. For each, say whether the meaning (in English) and the forms are right.
Answer with one JSON block: {"verdicts":[{"id":"…","verdict":"approve" or "reject","correction":"the right English meaning, only when rejecting a wrong meaning"}]}
Entries:
${entries.map((e) => `- id ${e.id}: ${e.lemma} = "${e.en}"${e.forms?.length ? `; forms: ${e.forms.join(", ")}` : ""}`).join("\n")}`;
  const vbox = h("textarea", { placeholder: "Paste your AI's verdicts here…" });
  const vout = h("div");
  const resetEmail = h("input", { type: "email", placeholder: "learner's email" }), resetPw = h("input", { type: "text", placeholder: "new password (8+ characters)" });
  card.append(
    h("h3", {}, "Invitations"), h("button", { class: "b", onclick: async () => { await api("/api/owner/invite", {}); route(); } }, "New invitation code"),
    h("table", {}, ...o.invites.map((i) => h("tr", {}, h("td", {}, h("code", {}, i.code)), h("td", { class: "mute" }, i.usedBy ? "used" : "unused")))),
    h("h3", {}, `Review list (${o.review.length})`), h("p", { class: "mute" }, "Shared texts first (they're checked sooner), then entries the dictionary check couldn't confirm. Approving makes them visible to everyone."),
    o.review.length ? h("table", {}, ...o.review.map(reviewRow)) : h("p", { class: "mute" }, "Nothing to review."),
    entries.length ? h("details", {}, h("summary", {}, "Review the entries with your own AI (batch)"), h("p", {}, copyBtn(batch)), h("pre", { class: "prompt" }, batch), vbox,
      h("button", { class: "b", onclick: async () => { const p = parseAnswer(vbox.value); if (p.problems) return vout.replaceChildren(h("p", { class: "err" }, p.problems.join(" "))); const r = await api("/api/owner/verdicts", { verdicts: p.data.verdicts || [] }); vout.replaceChildren(h("p", { class: "ok" }, `${r.results.filter((x) => x.ok).length} applied.`)); setTimeout(route, 800); } }, "Apply verdicts"), vout) : null,
    h("h3", {}, `Reports (${o.reports.length})`),
    o.reports.length ? h("table", {}, ...o.reports.map((r) => h("tr", {}, h("td", {}, h("b", {}, r.title), h("div", { class: "mute" }, `shared by ${r.by} (${r.source})`)),
      h("td", {}, ...r.reports.map((x) => h("div", {}, `${x.why}${x.note ? `: ${x.note}` : ""}`))),
      h("td", {}, h("button", { class: "b ghost", onclick: async () => { await api("/api/owner/report-action", { id: r.id, action: "dismiss" }); route(); } }, "Dismiss"),
        h("button", { class: "b warn", onclick: async () => { await api("/api/owner/report-action", { id: r.id, action: "delete" }); route(); } }, "Delete (wrong/offensive)"),
        h("button", { class: "b warn", onclick: async () => { if (confirm("Delete for copyright? The sharer's account is suspended (first time) or banned (second time).")) { await api("/api/owner/report-action", { id: r.id, action: "copyright" }); route(); } } }, "Delete for copyright"))))) : h("p", { class: "mute" }, "No reports."),
    h("h3", {}, "Reset a password by hand"), h("div", { class: "row" }, resetEmail, resetPw, h("button", { class: "b", onclick: async () => { try { await api("/api/owner/reset-password", { email: resetEmail.value, password: resetPw.value }); alert("Password reset. Tell the learner the new one."); } catch (e) { alert(e.message); } } }, "Reset")),
    h("h3", {}, "Accounts"), h("table", {}, ...o.accounts.map((a) => h("tr", {}, h("td", {}, a.email), h("td", {}, a.role), h("td", { class: "mute" }, a.banned ? "banned" : a.suspendedUntil > Date.now() ? `suspended until ${new Date(a.suspendedUntil).toISOString().slice(0, 10)}` : a.strikes ? `${a.strikes} strike` : "")))),
    h("details", {}, h("summary", {}, "Recent bank changes (log)"), h("table", {}, ...o.log.map((l) => h("tr", { class: "mute" }, h("td", {}, new Date(l.t).toLocaleString()), h("td", {}, l.by), h("td", {}, l.action), h("td", {}, l.detail))))));
}

// ---------- terms, sign-in (PR-p1-145, 233, 234, X-p1-03) ----------
async function terms(main) {
  const j = await api("/api/terms");
  main.append(h("div", { class: "card" }, h("h2", {}, "Terms of use"), h("pre", { style: { whiteSpace: "pre-wrap", font: "inherit" } }, j.text), me ? h("button", { class: "b ghost", onclick: () => go("home") }, "Back") : null));
}
function authView() {
  $("#nav").replaceChildren(); $("#user").replaceChildren();
  const main = $("#main");
  const err = h("p", { class: "err" });
  const email = h("input", { type: "email", placeholder: "you@example.com" }), pw = h("input", { type: "password" });
  const invite = h("input", { type: "text", placeholder: "from the owner" }), age = h("input", { type: "checkbox" }), tos = h("input", { type: "checkbox" });
  let mode = "in";
  const box = h("div");
  const paint = () => box.replaceChildren(
    h("label", {}, "Email", email), h("label", {}, "Password", pw),
    mode === "up" ? h("div", {}, h("label", {}, "Invitation code", invite), h("label", {}, age, " I'm 13 or older"),
      h("label", {}, tos, " I accept the ", h("a", { href: "#", onclick: async (e) => { e.preventDefault(); const j = await api("/api/terms"); alert(j.text); } }, "terms of use"))) : null,
    h("button", { class: "b", onclick: async () => {
      err.textContent = "";
      try {
        const j = mode === "in" ? await api("/api/login", { email: email.value, password: pw.value }) : await api("/api/signup", { email: email.value, password: pw.value, invite: invite.value, age13: age.checked, terms: tos.checked });
        me = j.user; await loadUser();
      } catch (e) { err.textContent = e.message; }
    } }, mode === "in" ? "Sign in" : "Create account"),
    h("p", {}, h("a", { href: "#", onclick: (e) => { e.preventDefault(); mode = mode === "in" ? "up" : "in"; paint(); } }, mode === "in" ? "I have an invitation – create an account" : "I already have an account")),
    h("p", { class: "mute" }, mode === "in" ? "Forgot your password? Ask the owner to reset it." : "grove is open by invitation for now."));
  paint();
  main.replaceChildren(h("div", { class: "card auth" }, h("h2", {}, "Welcome to grove 🌳"), box, err));
}
async function loadUser() {
  state = await api("/api/state");
  if (!state || state.version !== 3) state = buildEmptyState(); // a new account starts empty
  state.bankChoices ||= {};
  await refreshShared();
  rebuild(); applyDeleted(); mergeBankForms(); save();
  $("#user").replaceChildren(h("span", {}, me.email), h("button", { onclick: async () => { await api("/api/logout", {}); me = null; authView(); } }, "Sign out"));
  if (!state.startLevel) go("start"); else route();
  if (!state.seenWelcome) welcome();
}

// ---------- boot ----------
(async () => {
  const m = await api("/api/me");
  setAi(m.ai.live, m.ai.reason);
  if (!m.user) return authView();
  me = m.user;
  await loadUser();
})();
