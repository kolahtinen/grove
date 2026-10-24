// Throwaway prototype server (round 4 build): accounts by invitation, one learner file per account, the shared bank,
// the shared library and the owner's tools. Runs on the owner's computer; a relay tunnel makes it reachable (PR-p1-127).
import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";
import { WORDS, PHRASES, PATTERNS } from "./public/seed.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(here, "public");
const DATA = path.join(here, "data");
const PORT = Number(process.env.PORT || 5173);
const MODEL = "claude-opus-5-5";
// PR-p1-150: exactly one owner, fixed here; nobody can become owner through grove.
const OWNER_EMAIL = (process.env.OWNER_EMAIL || "owner@grove.test").toLowerCase();
const MAX_BODY = 100 * 1024;         // PR-p1-165: a single paste has a maximum size
const SIGNUPS_PER_HOUR = 10;         // PR-p1-164: sign-ups per hour from one place
const ENTRIES_PER_DAY = 100;         // PR-p1-162: new bank entries per account per day
const SUSPEND_DAYS = 30;             // PR-p1-147: first copyright breach

let client = null;
let ai = { live: false, reason: "" };
if (process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN) {
  try { client = new Anthropic(); ai = { live: true, reason: "" }; }
  catch (e) { ai = { live: false, reason: e.message }; }
} else ai = { live: false, reason: "No API key: copy-paste with your own AI" };

async function run(messages) {
  const r = await client.beta.messages.create({
    model: MODEL, max_tokens: 8000, betas: ["server-side-fallback-2026-07-01"], fallbacks: "default", output_config: { effort: "low" }, messages,
  });
  if (r.stop_reason === "refusal") throw new Error("The model declined this request");
  if (r.stop_reason === "max_tokens") throw new Error("Response was cut off");
  return { text: r.content.filter((b) => b.type === "text").map((b) => b.text).join("") };
}

// ---------- storage: small JSON files written atomically ----------
async function readJson(file, fallback) { try { return JSON.parse(await fs.readFile(path.join(DATA, file), "utf8")); } catch { return fallback; } }
async function writeJson(file, obj) {
  const p = path.join(DATA, file);
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p + ".tmp", JSON.stringify(obj));
  await fs.rename(p + ".tmp", p);
}
const now = () => Date.now();
const day = (t = now()) => new Date(t).toISOString().slice(0, 10);
const id = (p) => p + crypto.randomBytes(6).toString("hex");

// ---------- the shared bank (PR-p1-89, 94…98, 103, 104, 110…114, 119, 124, 128) ----------
// One bank per language (PR-p1-110); translations in English only (PR-p1-113).
// Stand-in for an imported open dictionary (PR-p1-103): the seed words, until Wiktionary is imported (licence check first).
const CEFR_ORDER = ["A1", "A2", "B1", "B2", "C1", "C2"];
function seedBank() {
  const level = (i, n) => (i < n * 0.5 ? "A1" : i < n * 0.8 ? "A2" : "B1");   // stand-in for the Kelly-list's CEFR tags (X-p1-04)
  const dict = WORDS.map((w, i) => ({ id: "d:" + w.sv, kind: "word", lemma: w.sv, en: w.en, forms: [...new Set([...(w.forms || []), ...(w.past || [])])],
    level: level(i, WORDS.length), status: "checked", source: { type: "dictionary", name: "seed stand-in for an imported dictionary" }, created: now() }));
  const phr = PHRASES.map((p) => ({ id: "d:" + p.sv, kind: "phrase", lemma: p.sv, en: p.en, forms: p.forms, level: "A2", status: "checked", source: { type: "dictionary", name: "seed stand-in" }, created: now() }));
  return {
    sv: {
      entries: [...dict, ...phr],
      freq: dict.map((d) => ({ lemma: d.lemma, level: d.level })),                       // PR-p1-119: frequency list lives in the bank
      patternLevels: Object.fromEntries(PATTERNS.map((p, i) => [p.id, i < 6 ? "A1" : "A2"])), // PR-p1-124: a pattern's level is stored with it
      log: [],
    },
  };
}
async function bank() { const b = await readJson("bank.json", null); if (b) return b; const s = seedBank(); await writeJson("bank.json", s); return s; }
const STOP = new Set(["a", "an", "the", "to", "of", "be", "is", "it", "in", "on", "and", "or", "for", "at", "something", "someone"]);
const meaningWords = (s) => new Set(String(s).toLowerCase().split(/[^a-z]+/).filter((w) => w && !STOP.has(w)));
// PR-p1-97/103/111/112: the background check. Runs right after a paste (X-p1-01 not needed: the computer is always on).
// Other free online dictionaries (PR-p1-135) and open text collections (PR-p1-136, X-p1-07) aren't connected in the prototype.
function checkEntry(e, entries) {
  const d = entries.find((x) => x.source.type === "dictionary" && x.lemma === e.lemma && x.kind === e.kind);
  if (!d) return { status: "review", why: "not in the dictionary" };
  const formsOk = (e.forms || []).every((f) => d.forms.includes(f));
  const mw = meaningWords(d.en), ew = meaningWords(e.en);
  const meaningOk = [...ew].some((w) => mw.has(w));
  if (formsOk && meaningOk) return { status: "checked", why: "agrees with the dictionary" };
  return { status: "review", why: !meaningOk ? `meaning differs from the dictionary ("${d.en}")` : "a form isn't in the dictionary" };
}
function logBank(b, by, action, entry, detail = "") { b.sv.log.push({ t: now(), by, action, entry, detail }); } // PR-p1-163

// ---------- accounts (PR-p1-91, 99, 145, 150, 151, 159…161, 166, 233, 234, 236) ----------
async function users() { return readJson("users.json", { users: [], invites: [] }); }
function hashPw(pw, salt = crypto.randomBytes(16).toString("hex")) { return { salt, hash: crypto.scryptSync(pw, salt, 32).toString("hex") }; } // PR-p1-161
const sessions = new Map(); // token -> user id (prototype: in memory)
const signupsByIp = new Map();
function cookie(req, name) { return (req.headers.cookie || "").split(/;\s*/).map((c) => c.split("=")).find(([k]) => k === name)?.[1]; }
const publicUser = (u) => ({ id: u.id, email: u.email, role: u.role });

function blocked(u) {
  if (u.banned) return "This account is banned after a second copyright breach.";                               // PR-p1-148
  if (u.suspendedUntil && u.suspendedUntil > now()) return `This account is suspended until ${day(u.suspendedUntil)} after a copyright breach.`; // PR-p1-147
  return null;
}

// ---------- the shared library (PR-p1-131…133, 138…149) ----------
async function library() { return readJson("library.json", { texts: [], deleted: [] }); }
function levelOfText(lines, b) {
  const lv = new Map(b.sv.entries.filter((e) => e.level).flatMap((e) => (e.forms || [e.lemma]).map((f) => [f.toLowerCase(), e.level])));
  let top = 0;
  for (const l of lines) for (const w of String(l.sv).toLowerCase().match(/\p{L}+/gu) || []) { const i = CEFR_ORDER.indexOf(lv.get(w)); if (i > top) top = i; }
  return CEFR_ORDER[top];
}
// PR-p1-132: the check covers the whole text and all its words.
function checkText(lines, b, names = []) {
  const known = new Set(b.sv.entries.filter((e) => e.status === "checked").flatMap((e) => [e.lemma, ...(e.forms || [])].map((f) => f.toLowerCase())));
  const nm = new Set(names.map((n) => n.toLowerCase()));
  const unknown = new Set();
  for (const l of lines) for (const w of String(l.sv).toLowerCase().match(/\p{L}+/gu) || []) if (!known.has(w) && !nm.has(w)) unknown.add(w);
  return unknown.size ? { status: "unchecked", why: `${unknown.size} word(s) not yet checked: ${[...unknown].slice(0, 12).join(", ")}` } : { status: "checked", why: "every word is checked" };
}

// ---------- routes ----------
const open = new Set(["POST /api/signup", "POST /api/login", "GET /api/me", "GET /api/terms"]); // PR-p1-166: the rest needs an account
const ownerOnly = (u) => { if (u.role !== "owner") throw Object.assign(new Error("Only the owner can do that."), { code: 403 }); };    // PR-p1-159

const routes = {
  "GET /api/terms": async () => ({ text: TERMS }),
  "GET /api/me": async (_b, u) => ({ user: u ? publicUser(u) : null, ai: { ...ai, model: MODEL } }),
  "POST /api/signup": async (b, _u, req, res) => {
    const ip = req.socket.remoteAddress;
    const recent = (signupsByIp.get(ip) || []).filter((t) => t > now() - 3600e3);
    if (recent.length >= SIGNUPS_PER_HOUR) throw Object.assign(new Error("Too many sign-ups from here; try again in an hour."), { code: 429 });
    const email = String(b.email || "").trim().toLowerCase(), pw = String(b.password || "");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw Object.assign(new Error("Enter a valid email address."), { code: 400 }); // PR-p1-234
    if (pw.length < 8) throw Object.assign(new Error("The password needs at least 8 characters."), { code: 400 });
    if (!b.age13) throw Object.assign(new Error("Accounts are for people aged 13 and over (for now)."), { code: 400 });          // X-p1-03
    if (!b.terms) throw Object.assign(new Error("Please accept the terms of use."), { code: 400 });                               // PR-p1-145
    const db = await users();
    if (db.users.some((x) => x.email === email)) throw Object.assign(new Error("That email already has an account."), { code: 400 });
    const isOwner = email === OWNER_EMAIL;
    const inv = db.invites.find((i) => i.code === String(b.invite || "").trim() && !i.usedBy);
    if (!isOwner && !inv) throw Object.assign(new Error("Sign-up is by invitation for now: enter the code the owner gave you."), { code: 400 }); // PR-p1-233
    const u = { id: id("u_"), email, ...hashPw(pw), role: isOwner ? "owner" : "learner", created: now(), failed: 0, lockUntil: 0, strikes: 0, age13: true, terms: day() }; // PR-p1-151
    if (inv) inv.usedBy = u.id;
    db.users.push(u);
    await writeJson("users.json", db);
    signupsByIp.set(ip, [...recent, now()]);
    return login(u, res);
  },
  "POST /api/login": async (b, _u, _req, res) => {
    const db = await users();
    const u = db.users.find((x) => x.email === String(b.email || "").trim().toLowerCase());
    if (!u) throw Object.assign(new Error("Wrong email or password."), { code: 401 });
    if (u.lockUntil > now()) throw Object.assign(new Error(`Too many wrong passwords: locked until ${new Date(u.lockUntil).toLocaleTimeString()}.`), { code: 429 });
    if (hashPw(String(b.password || ""), u.salt).hash !== u.hash) {
      u.failed = (u.failed || 0) + 1;
      if (u.failed >= 5) { u.lockUntil = now() + 15 * 60e3; u.failed = 0; } // PR-p1-160
      await writeJson("users.json", db);
      throw Object.assign(new Error("Wrong email or password."), { code: 401 });
    }
    const why = blocked(u);
    if (why) throw Object.assign(new Error(why), { code: 403 });
    u.failed = 0; await writeJson("users.json", db);
    return login(u, res);
  },
  "POST /api/logout": async (_b, _u, req, res) => { sessions.delete(cookie(req, "grove")); res.setHeader("set-cookie", "grove=; Path=/; Max-Age=0"); return { ok: true }; },

  // one learner file per account (PR-p1-72: saved after every change)
  "GET /api/state": async (_b, u) => readJson(`learners/${u.id}.json`, null),
  "PUT /api/state": async (b, u) => { await writeJson(`learners/${u.id}.json`, b); return { ok: true }; },
  "GET /api/ai/status": async () => ({ ...ai, model: MODEL }),
  "POST /api/ai/run": async (b) => { if (!client) throw Object.assign(new Error(ai.reason), { offline: true }); return run(b.messages); },

  // bank: what this learner may see (PR-p1-97, 98): checked entries, plus their own unchecked ones marked as such
  "GET /api/bank": async (_b, u) => {
    const b = await bank();
    const mine = (e) => e.source.by === u.id;
    return {
      entries: b.sv.entries.filter((e) => e.status === "checked" || mine(e)).map((e) => ({ ...e, mine: mine(e) })),
      freq: b.sv.freq, patternLevels: b.sv.patternLevels,
    };
  },
  "POST /api/bank/submit": async (body, u) => {
    const b = await bank();
    const today = b.sv.log.filter((l) => l.by === u.id && l.action === "submit" && day(l.t) === day()).length;
    const incoming = (body.entries || []).slice(0, Math.max(0, ENTRIES_PER_DAY - today)); // PR-p1-162
    const out = [];
    for (const raw of incoming) {
      const e = { kind: raw.kind === "phrase" ? "phrase" : "word", lemma: String(raw.lemma || "").toLowerCase().trim(), en: String(raw.en || ""), forms: (raw.forms || []).map((f) => String(f).toLowerCase()), explain_sv: raw.explain_sv || "" };
      if (!e.lemma || !e.en) continue;
      // A duplicate (same word, agreeing meaning, already checked or already sent by this learner) is skipped; a different meaning is checked.
      const agrees = (x) => [...meaningWords(e.en)].some((w) => meaningWords(x.en).has(w)) && (e.forms || []).every((f) => (x.forms || []).includes(f) || f === x.lemma);
      if (b.sv.entries.some((x) => x.lemma === e.lemma && x.kind === e.kind && ((x.status === "checked" && agrees(x)) || x.source.by === u.id))) continue;
      const r = checkEntry(e, b.sv.entries);
      const entry = { id: id("b_"), ...e, status: r.status, why: r.why, source: { type: "ai", by: u.id }, created: now() };
      b.sv.entries.push(entry);
      logBank(b, u.id, "submit", entry.id, `${e.lemma}: ${r.status} (${r.why})`);
      out.push({ lemma: e.lemma, status: r.status, why: r.why });
    }
    await writeJson("bank.json", b);
    return { results: out, skippedForLimit: (body.entries || []).length - incoming.length };
  },
  // PR-p1-114: the learner chooses what happens to their rejected entry
  "POST /api/bank/choose": async (body, u) => {
    const b = await bank();
    const e = b.sv.entries.find((x) => x.id === body.id && x.source.by === u.id && x.status === "rejected");
    if (!e) throw Object.assign(new Error("No such rejected entry."), { code: 404 });
    e.choice = body.choice; // keep | take
    logBank(b, u.id, "choose", e.id, body.choice);
    await writeJson("bank.json", b);
    return { ok: true };
  },

  // library (PR-p1-131…146)
  "GET /api/library": async (_b, u) => {
    const L = await library();
    return {
      texts: L.texts.filter((t) => t.status === "checked" || t.source.by === u.id).map((t) => ({ ...t, source: { type: t.source.type, mine: t.source.by === u.id }, by: t.showName ? t.byName : null })),
      deleted: L.deleted,
    };
  },
  "POST /api/library/share": async (body, u) => {
    const L = await library(), b = await bank();
    if (body.source === "pasted" && !body.rightsConfirmed) throw Object.assign(new Error("Confirm that you may share this text."), { code: 400 }); // PR-p1-138
    const lines = (body.lines || []).map((l) => ({ sv: String(l.sv || ""), en: String(l.en || ""), speaker: l.speaker }));
    const r = checkText(lines, b, body.names || []);
    const db = await users();
    const t = { id: id("lib_"), title: String(body.title || "Untitled"), kind: body.kind || "episode", lines, questions: body.questions || [], est: body.est || 5,
      level: levelOfText(lines, b), status: r.status, why: r.why, priority: 1, // PR-p1-142: shared texts first in the check
      source: { type: body.source === "pasted" ? "pasted" : "ai", by: u.id, origin: body.origin || "" }, // PR-p1-139: the source is kept
      showName: !!body.showName, byName: db.users.find((x) => x.id === u.id).email.split("@")[0], created: now(), reports: [] }; // PR-p1-143
    L.texts.push(t);
    await writeJson("library.json", L);
    return { id: t.id, status: t.status, why: t.why, level: t.level };
  },
  "POST /api/library/report": async (body, u) => { // PR-p1-144
    const L = await library();
    const t = L.texts.find((x) => x.id === body.id);
    if (!t) throw Object.assign(new Error("No such text."), { code: 404 });
    t.reports.push({ by: u.id, why: body.why, note: String(body.note || "").slice(0, 500), t: now() });
    await writeJson("library.json", L);
    return { ok: true };
  },

  // ---------- owner (PR-p1-104, 111, 112, 114, 128, 140, 146…149, 236). The owner never sees learners' progress (PR-p1-152).
  "GET /api/owner/overview": async (_b, u) => {
    ownerOnly(u);
    const db = await users(), b = await bank(), L = await library();
    const name = (uid) => db.users.find((x) => x.id === uid)?.email || uid;
    return {
      invites: db.invites,
      accounts: db.users.map((x) => ({ email: x.email, role: x.role, created: x.created, strikes: x.strikes || 0, suspendedUntil: x.suspendedUntil || 0, banned: !!x.banned })),
      review: [
        ...L.texts.filter((t) => t.status === "unchecked").map((t) => ({ type: "text", id: t.id, title: t.title, why: t.why, by: name(t.source.by), source: t.source.type, lines: t.lines.slice(0, 6) })),
        ...b.sv.entries.filter((e) => e.status === "review").map((e) => ({ type: "entry", id: e.id, kind: e.kind, lemma: e.lemma, en: e.en, forms: e.forms, why: e.why, by: name(e.source.by) })),
      ],
      reports: L.texts.filter((t) => t.reports.length && t.status !== "deleted").map((t) => ({ id: t.id, title: t.title, by: name(t.source.by), source: t.source.type, reports: t.reports })),
      log: b.sv.log.slice(-30).reverse().map((l) => ({ ...l, by: name(l.by) })),
    };
  },
  "POST /api/owner/invite": async (_b, u) => { ownerOnly(u); const db = await users(); const inv = { code: crypto.randomBytes(4).toString("hex"), by: u.id, created: now() }; db.invites.push(inv); await writeJson("users.json", db); return inv; },
  "POST /api/owner/decide": async (body, u) => { ownerOnly(u); return decide(body, u); },
  "POST /api/owner/verdicts": async (body, u) => { // PR-p1-128: batch review via the owner's own AI
    ownerOnly(u);
    const out = [];
    for (const v of body.verdicts || []) {
      try { await decide({ id: v.id, action: v.verdict === "approve" ? "approve" : "reject", offer: v.correction ? { type: "correction", en: v.correction } : { type: "delete" } }, u); out.push({ id: v.id, ok: true }); }
      catch (e) { out.push({ id: v.id, ok: false, error: e.message }); }
    }
    return { results: out };
  },
  "POST /api/owner/reset-password": async (body, u) => { // PR-p1-236
    ownerOnly(u);
    const db = await users();
    const t = db.users.find((x) => x.email === String(body.email || "").toLowerCase());
    if (!t) throw Object.assign(new Error("No account with that email."), { code: 404 });
    if (String(body.password || "").length < 8) throw Object.assign(new Error("The password needs at least 8 characters."), { code: 400 });
    Object.assign(t, hashPw(body.password), { failed: 0, lockUntil: 0 });
    await writeJson("users.json", db);
    return { ok: true };
  },
  "POST /api/owner/report-action": async (body, u) => { // PR-p1-140, 146…149
    ownerOnly(u);
    const L = await library(), db = await users(), b = await bank();
    const t = L.texts.find((x) => x.id === body.id);
    if (!t) throw Object.assign(new Error("No such text."), { code: 404 });
    if (body.action === "dismiss") { t.reports = []; }
    else {
      t.status = "deleted"; t.lines = []; t.questions = []; // its sentences go with it (PR-p1-146); its words stay in the bank (PR-p1-140)
      L.deleted.push({ id: t.id, copyright: body.action === "copyright" });
      if (body.action === "copyright") { // only copyright breaches count (PR-p1-149)
        const a = db.users.find((x) => x.id === t.source.by);
        if (a) { a.strikes = (a.strikes || 0) + 1; if (a.strikes >= 2) a.banned = true; else a.suspendedUntil = now() + SUSPEND_DAYS * 86400e3; }
        for (const [tok, uid] of sessions) if (uid === a?.id) sessions.delete(tok);
      }
      logBank(b, u.id, "delete-text", t.id, body.action);
    }
    await writeJson("library.json", L); await writeJson("users.json", db); await writeJson("bank.json", b);
    return { ok: true };
  },
};

async function decide({ id: eid, action, offer }, u) {
  const b = await bank(), L = await library();
  const t = L.texts.find((x) => x.id === eid);
  if (t) { t.status = action === "approve" ? "checked" : "deleted"; if (action !== "approve") { t.lines = []; L.deleted.push({ id: t.id, copyright: false }); } await writeJson("library.json", L); logBank(b, u.id, action, eid, "text"); await writeJson("bank.json", b); return { ok: true }; }
  const e = b.sv.entries.find((x) => x.id === eid);
  if (!e) throw Object.assign(new Error("Not found: " + eid), { code: 404 });
  if (action === "approve") { e.status = "checked"; e.why = "approved by the owner"; }
  else { e.status = "rejected"; e.offer = offer?.type === "correction" && offer.en ? { type: "correction", en: String(offer.en) } : { type: "delete" }; }
  logBank(b, u.id, action, eid, action === "approve" ? "" : JSON.stringify(e.offer));
  await writeJson("bank.json", b);
  return { ok: true };
}

function login(u, res) {
  const tok = crypto.randomBytes(24).toString("hex");
  sessions.set(tok, u.id);
  res.setHeader("set-cookie", `grove=${tok}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${30 * 86400}`);
  return { user: publicUser(u) };
}

const TERMS = `Terms of use (prototype)
1. grove is for people aged 13 and over.
2. Share only texts you have the right to share. Texts written for you by your AI are fine; texts you copied from elsewhere usually aren't.
3. The first time a shared text breaks copyright, your account is suspended for ${SUSPEND_DAYS} days; the second time, it is banned.
4. grove keeps your email address, your learning history, the texts you paste and who shared each library text, only to run grove and to handle copyright complaints. You can ask the owner to export or delete your data.`;

const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8" };

http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://x");
  const key = `${req.method} ${url.pathname}`;
  const route = routes[key];
  if (url.pathname.startsWith("/api/")) {
    if (!route) return res.writeHead(404, { "content-type": "application/json" }).end(JSON.stringify({ error: "not found" }));
    let body = "";
    for await (const c of req) { body += c; if (body.length > MAX_BODY) return res.writeHead(413, { "content-type": "application/json" }).end(JSON.stringify({ error: "That's too long (limit 100 KB)." })); }
    try {
      const db = await users();
      const uid = sessions.get(cookie(req, "grove"));
      const u = uid && db.users.find((x) => x.id === uid && !blocked(x));
      if (!u && !open.has(key)) throw Object.assign(new Error("Please sign in."), { code: 401 });
      const out = await route(body ? JSON.parse(body) : {}, u, req, res);
      res.writeHead(200, { "content-type": "application/json" }).end(JSON.stringify(out));
    } catch (e) {
      if (e instanceof Anthropic.AuthenticationError) ai = { live: false, reason: "API key rejected" };
      console.error(key, e.message);
      res.writeHead(e.code || (e.offline ? 503 : 500), { "content-type": "application/json" }).end(JSON.stringify({ error: e.message, offline: !!e.offline }));
    }
    return;
  }
  // Static files: the app's code and the sign-in page only; all data needs an account (PR-p1-166).
  const file = path.join(PUBLIC, path.normalize(url.pathname === "/" ? "/index.html" : url.pathname));
  if (!file.startsWith(PUBLIC)) return res.writeHead(403).end();
  let data;
  try { data = await fs.readFile(file); } catch { return res.writeHead(404).end("not found"); }
  res.writeHead(200, { "content-type": TYPES[path.extname(file)] || "application/octet-stream" }).end(data);
}).listen(PORT, () => console.log(`grove prototype on http://localhost:${PORT}  (owner: ${OWNER_EMAIL}; AI: ${ai.live ? MODEL + " via your API key" : ai.reason})`));
