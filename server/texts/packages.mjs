// Packages and exchanges (FR-201…FR-207, FR-212, FR-203; research R6, R9, R11): one open package of
// 3 parts at a time, each part with its reading and listening texts; the setup in a new chat with the
// summary; requests, fix-its for unreadable answers, redo requests for failed texts, meanings
// fix-its for words without a meaning, and meaning checks.
import { createHash, randomInt } from 'node:crypto';
import { HttpError } from '../web/http.mjs';
import { transaction } from '../store/db.mjs';
import { DEFAULT_SIZES } from '../config.mjs';
import { extractJson } from './extract.mjs';
import { validateAnswer, validateMeanings } from './schema.mjs';
import { checkAnswer, describeProblem } from './check.mjs';
import { buildSetup, buildRequest, chooseKnown, describeKinds } from './prompt.mjs';
import { buildFixPrompt, buildRedoPrompt, buildMeaningsFixPrompt } from './fixit.mjs';
import { acceptAnswer, missingMeanings } from './accept.mjs';
import { LABELS } from './ratings.mjs';
import { FAMILIES, TACTICS, recommend, productOf } from './plans.mjs';
import { tokenize } from '../words/tokens.mjs';
import { askedForms } from '../words/asked.mjs';
import { openRequests } from '../reading/flags.mjs';
import { answerOwn } from '../reading/own.mjs';
import { kindsStillNeeded } from '../sessions/offer.mjs';

export const PARTS = 3;
export const DEFAULT_TOPIC = 'everyday life';
const LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const SUFFIXES = 'bcdefghjkmnpqrstuvwxyz';
// A text this far below the target share suggests the AI has forgotten the setup (FR-203).
const FORGOTTEN_BELOW = 10;
const TEXT_KINDS = ['part', 'package', 'redo', 'fix', 'meanings_fix'];

export function createPackages({ db, words, sizes = DEFAULT_SIZES, now = () => Date.now() }) {
  function settings(accountId) {
    db.prepare('INSERT OR IGNORE INTO learner_settings (account_id) VALUES (?)').run(accountId);
    return db.prepare('SELECT * FROM learner_settings WHERE account_id = ?').get(accountId);
  }
  // Words to reuse (G-02 FR-210, G-04 research R7): drilled leaves, fading first, then due, then most
  // recently marked; before anything is drilled, the most recently added leaves.
  function reuseList(accountId) {
    const t = now();
    const drilled = db.prepare("SELECT lemma, gap_days, last_review_at FROM words WHERE account_id = ? AND drilled = 1 AND kind = 'word'").all(accountId)
      .map((w) => ({ lemma: w.lemma, strength: 2 ** (-Math.max(0, t - w.last_review_at) / 86400000 / w.gap_days), at: w.last_review_at }))
      .sort((a, b) => a.strength - b.strength || b.at - a.at).map((w) => w.lemma);
    return (drilled.length ? drilled : words.recentLeaves(accountId, 10)).slice(0, 10);
  }

  const openPackage = (accountId) => db.prepare("SELECT * FROM packages WHERE account_id = ? AND status = 'open'").get(accountId);
  const exchangeById = (id) => db.prepare('SELECT * FROM exchanges WHERE id = ?').get(id);
  // The first waiting request of the package: meanings fix-its and redos come in the order made.
  const waitingOf = (accountId, packageId) => db.prepare(`SELECT * FROM exchanges WHERE account_id = ? AND package_id = ?
    AND status = 'waiting' AND kind IN (${TEXT_KINDS.map(() => '?').join(', ')}) ORDER BY id LIMIT 1`).get(accountId, packageId, ...TEXT_KINDS);
  const unratedIn = (accountId, packageId) => db.prepare(`SELECT COUNT(*) AS n FROM texts t WHERE t.account_id = ? AND t.package_id = ?
    AND NOT EXISTS (SELECT 1 FROM ratings r WHERE r.text_id = t.id)`).get(accountId, packageId).n;

  // A part's texts: GROVE_PART_READING reading and GROVE_PART_LISTENING listening (FR-202); a package of
  // one kind (started from G-09's short-session offer, B-23) as many texts, all of that kind.
  const partKinds = (pkg) => (pkg.only_kind
    ? Array(sizes.partReading + sizes.partListening).fill(pkg.only_kind)
    : [...Array(sizes.partReading).fill('reading'), ...Array(sizes.partListening).fill('listening')]);
  function openAsks(pkg, partNo) {
    const have = db.prepare('SELECT kind, COUNT(*) AS n FROM texts WHERE package_id = ? AND part_no = ? GROUP BY kind').all(pkg.id, partNo);
    const left = Object.fromEntries(have.map((r) => [r.kind, r.n]));
    return partKinds(pkg).filter((kind) => (left[kind] = (left[kind] || 0) - 1) < 0).map((kind) => ({ part: partNo, kind }));
  }
  const currentPart = (pkg) => [1, 2, 3].find((p) => openAsks(pkg, p).length > 0) ?? null;
  function countParts(pkg) {
    const done = [1, 2, 3].filter((p) => openAsks(pkg, p).length === 0).length;
    db.prepare('UPDATE packages SET parts_accepted = ? WHERE id = ?').run(done, pkg.id);
  }

  // Each request has its own code: the package's letters, the part, and a letter for later requests.
  function codeFor(accountId, base) {
    const taken = (c) => db.prepare('SELECT 1 FROM exchanges WHERE account_id = ? AND code = ?').get(accountId, c);
    if (!taken(base)) return base;
    for (const s of SUFFIXES) if (!taken(`${base}${s}`)) return `${base}${s}`;
    return `${base}${randomInt(1000, 9999)}`;
  }

  // What changed since the last summary: texts rated or answered since then (FR-203, RQ-01, RQ-02).
  function summary(accountId, since) {
    const rows = db.prepare(`SELECT t.id, t.title, r.value,
        (SELECT COUNT(*) FROM question_answers q WHERE q.text_id = t.id AND q.right = 1 AND NOT EXISTS
          (SELECT 1 FROM reports r2 WHERE r2.text_id = q.text_id AND r2.question_position = q.position)) AS right,
        (SELECT COUNT(*) FROM question_answers q WHERE q.text_id = t.id AND NOT EXISTS
          (SELECT 1 FROM reports r2 WHERE r2.text_id = q.text_id AND r2.question_position = q.position)) AS asked
      FROM texts t LEFT JOIN ratings r ON r.text_id = t.id
      WHERE t.account_id = ? AND (r.at > ? OR EXISTS (SELECT 1 FROM question_answers q WHERE q.text_id = t.id AND q.at > ?))
      ORDER BY t.id`).all(accountId, since, since);
    if (!rows.length) return null;
    return rows.map((r) => `- "${r.title}": ${r.value ? `understood ${LABELS[r.value]}` : 'not rated'}; questions right ${r.right} of ${r.asked}`).join('\n');
  }

  // Dictionary meanings for the AI to check, each with a sentence it was met in (FR-207, RQ-398).
  // The learner's own meanings first, then dictionary meanings met in a sentence, then the rest.
  function checksFor(accountId) {
    const rows = db.prepare(`SELECT lemma, en, en_source FROM words WHERE account_id = ? AND kind IN ('word', 'phrase')
      AND (en_source IN ('dictionary', 'learner') OR en IS NULL) ORDER BY added_at, id`).all(accountId);
    const found = rows.map((r) => ({
      form: r.lemma, en: r.en ?? 'none', guess: r.en_source === 'learner',
      sentence: db.prepare('SELECT sv FROM sentences WHERE account_id = ? AND new_items LIKE ? ORDER BY id LIMIT 1').get(accountId, `%${JSON.stringify(r.lemma)}%`)?.sv ?? null,
    }));
    const rank = (c) => (c.guess ? 0 : c.sentence ? 1 : 2);
    return found.sort((a, b) => rank(a) - rank(b)).slice(0, sizes.checkMeanings);
  }

  function setupFor(accountId, pkg, { single = false } = {}) {
    const s = settings(accountId);
    const topic = s.topic || DEFAULT_TOPIC;
    return buildSetup({
      targetShare: s.target_share, summary: pkg.summary, chunkWords: sizes.setupChunkWords, single,
      known: chooseKnown(words.groundLemmas(accountId), tokenize(topic).map((t) => t.word), sizes.setupMaxWords),
    });
  }

  // A complete beginner has no known words, so no share to keep (FR-208).
  const known0 = (accountId) => words.groundLemmas(accountId).length > 0;

  function makeRequest(accountId, pkg, { kind, partNo, asks, withSetup }) {
    const s = settings(accountId);
    const topic = s.topic || DEFAULT_TOPIC;
    const used = JSON.parse(s.topics_used);
    const whole = kind === 'package';
    const code = whole ? pkg.code : codeFor(accountId, `${pkg.code}-${partNo}`);
    const checks = checksFor(accountId);
    const stored = db.prepare('SELECT COUNT(*) AS n FROM texts WHERE package_id = ?').get(pkg.id).n;
    const prompt = buildRequest({
      code, partNo, of: PARTS, asks, textWords: sizes.textWords, topic, newTopic: !used.includes(topic.toLowerCase()), targetShare: known0(accountId) ? s.target_share : undefined,
      reuse: reuseList(accountId), firmNew: !!s.firm_new, shorter: !!s.shorter, checks,
      continueHint: !whole && stored > 0, whole, ...openRequests(db, accountId),
    });
    // One long prompt (FR-203): the setup goes in front of every request, as one message.
    const long = (pkg.tactic ?? s.tactic) === 'long';
    const steps = withSetup && !long ? setupFor(accountId, pkg) : [];
    const message = long ? `${setupFor(accountId, pkg, { single: true })[0]}\n\n${prompt}` : prompt;
    // The nudges are asked for once (FR-212).
    db.prepare('UPDATE learner_settings SET shorter = 0, firm_new = 0 WHERE account_id = ?').run(accountId);
    const first = !db.prepare('SELECT 1 FROM exchanges WHERE package_id = ?').get(pkg.id);
    const info = db.prepare(`INSERT INTO exchanges (account_id, package_id, part_no, kind, code, carries_summary, prompt, steps, asks, asked_forms, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'waiting', ?)`).run(accountId, pkg.id, whole ? 1 : partNo, kind, code,
      first && pkg.summary ? 1 : 0, message, JSON.stringify(steps), JSON.stringify(asks), JSON.stringify(askedForms(checks.map((c) => c.form))), now());
    return exchangeById(Number(info.lastInsertRowid));
  }

  function newPackage(accountId, onlyKind = null) {
    const s = settings(accountId);
    const sum = summary(accountId, s.last_summary_at);
    if (sum) db.prepare('UPDATE learner_settings SET last_summary_at = ? WHERE account_id = ?').run(now(), accountId);
    const code = Array.from({ length: 4 }, () => LETTERS[randomInt(LETTERS.length)]).join('');
    // The package keeps the tactic it starts with (FR-223).
    const info = db.prepare("INSERT INTO packages (account_id, status, created_at, code, summary, tactic, only_kind) VALUES (?, 'open', ?, ?, ?, ?, ?)").run(accountId, now(), code, sum, s.tactic, onlyKind);
    const pkg = db.prepare('SELECT * FROM packages WHERE id = ?').get(Number(info.lastInsertRowid));
    if (s.tactic === 'whole') {
      return makeRequest(accountId, pkg, { kind: 'package', partNo: 1, asks: [1, 2, 3].flatMap((p) => openAsks(pkg, p)), withSetup: true });
    }
    return makeRequest(accountId, pkg, { kind: 'part', partNo: 1, asks: openAsks(pkg, 1), withSetup: true });
  }

  // The next request in an open package: the current part's open texts, or one at a time (FR-206).
  function nextRequest(accountId, pkg) {
    const partNo = currentPart(pkg);
    if (!partNo) return null;
    const asks = openAsks(pkg, partNo);
    // Step by step after one long prompt: this chat hasn't had the setup yet (FR-223).
    const hadSetup = db.prepare("SELECT 1 FROM exchanges WHERE package_id = ? AND steps IS NOT NULL AND steps != '[]'").get(pkg.id);
    return makeRequest(accountId, pkg, { kind: 'part', partNo, asks: pkg.one_text ? asks.slice(0, 1) : asks, withSetup: pkg.tactic !== 'long' && !hadSetup });
  }

  function closePackage(accountId, pkg, status) {
    db.prepare('UPDATE packages SET status = ? WHERE id = ?').run(status, pkg.id);
    db.prepare("UPDATE exchanges SET status = 'replaced' WHERE package_id = ? AND status IN ('waiting', 'needs_fix')").run(pkg.id);
  }

  const view = (ex) => ({
    exchangeId: ex.id, kind: ex.kind, code: ex.code, part: ex.part_no, of: PARTS,
    steps: JSON.parse(ex.steps || '[]'), prompt: ex.prompt, carriesSummary: !!ex.carries_summary,
  });

  // An answer grove couldn't read: a fix-it for the whole answer, in the same chat (FR-206).
  function refuse(exchange, problems) {
    db.prepare("UPDATE exchanges SET status = 'needs_fix', answered_at = ? WHERE id = ?").run(now(), exchange.id);
    const root = exchange.fixes_id ?? exchange.id;
    const prompt = buildFixPrompt(problems, exchange.code);
    const info = db.prepare(`INSERT INTO exchanges (account_id, package_id, part_no, kind, code, fixes_id, prompt, steps, asks, asked_forms, held, status, created_at)
      VALUES (?, ?, ?, 'fix', ?, ?, ?, '[]', ?, ?, ?, 'waiting', ?)`).run(exchange.account_id, exchange.package_id, exchange.part_no, exchange.code, root, prompt,
      exchange.asks, exchange.asked_forms, exchange.held, now());
    return { result: 'needs_fix', problems: problems.map(describeProblem), fix: { exchangeId: Number(info.lastInsertRowid), prompt }, newChatSuggested: true };
  }

  const duplicate = () => new HttpError(409, 'duplicate', 'This part is already added.');

  function answerTexts(accountId, exchange, pasted) {
    const root = exchange.fixes_id ? exchangeById(exchange.fixes_id) : exchange;
    const whole = root.kind === 'package';
    const extracted = extractJson(pasted);
    if (!extracted.ok) {
      if (exchange.status !== 'waiting') throw duplicate();
      return refuse(exchange, [{ kind: extracted.problem, line: extracted.line }]);
    }
    const checked = validateAnswer(extracted.value, { whole });
    if (!checked.ok) {
      if (exchange.status !== 'waiting') throw duplicate();
      return refuse(exchange, checked.problems.map((message) => ({ kind: 'format', message })));
    }
    const answer = checked.value;
    const hash = createHash('sha256').update(JSON.stringify(answer)).digest('hex');
    if (db.prepare("SELECT 1 FROM exchanges WHERE account_id = ? AND answer_hash = ? AND status = 'accepted'").get(accountId, hash)) {
      throw new HttpError(409, 'duplicate', 'This answer is already added.');
    }
    if (exchange.status !== 'waiting' || db.prepare("SELECT 1 FROM exchanges WHERE account_id = ? AND code = ? AND status = 'accepted'").get(accountId, exchange.code)) {
      throw duplicate();
    }
    if (answer.part !== exchange.code) {
      throw new HttpError(409, 'wrong_part', `This answer is for "${answer.part}", but this box is for "${exchange.code}". Paste it where it belongs, or ask your AI again with this prompt.`);
    }
    // The texts must be of the kinds asked for, and no more of them (FR-205).
    const asks = JSON.parse(exchange.asks || '[]');
    const left = {};
    for (const a of asks) left[`${a.part}:${a.kind}`] = (left[`${a.part}:${a.kind}`] || 0) + 1;
    const extra = [];
    answer.texts.forEach((x, i) => {
      const key = `${whole ? x.part : exchange.part_no}:${x.kind}`;
      if (!left[key]) extra.push({ kind: 'format', message: `Text ${i + 1} is a ${x.kind} text${whole ? ` for part ${x.part}` : ''}, but this request asked for ${describeKinds(asks.map((a) => a.kind))}${whole ? ' per part' : ''}.` });
      else left[key] -= 1;
    });
    if (extra.length) return refuse(exchange, extra);

    const s = settings(accountId);
    const counter = words.counterFor(accountId, { names: answer.names, phrases: answer.new_phrases.map((p) => p.sv), inflections: answer.inflections });
    const result = checkAnswer(answer, counter, s.target_share);
    const failing = [];
    const held = [];
    const pass = [];
    const missing = new Set();
    result.texts.forEach((x, i) => {
      if (!x.ok) failing.push(i);
      else {
        const m = missingMeanings(answer, x);
        if (m.length) { held.push(i); m.forEach((f) => missing.add(f)); } else pass.push(i);
      }
    });
    const topic = s.topic || DEFAULT_TOPIC;
    const pkg = db.prepare('SELECT * FROM packages WHERE id = ?').get(root.package_id);

    // The passing texts, the request marked answered, the meaning checks, the redo and meanings
    // fix-it requests and the part count are one transaction (FR-216).
    const stored = transaction(db, () => {
      const out = pass.length ? acceptAnswer({ db, words, accountId, exchange: root, answer, check: result, topic, now, counter, indexes: pass }) : { texts: [], added: [] };
      applyChecks(accountId, exchange, answer.meaning_checks);
      db.prepare("UPDATE exchanges SET status = 'accepted', answer_hash = ?, answered_at = ? WHERE id = ?").run(hash, now(), exchange.id);
      db.prepare("UPDATE exchanges SET status = 'replaced' WHERE account_id = ? AND code = ? AND id != ? AND status IN ('waiting', 'needs_fix')").run(accountId, exchange.code, exchange.id);
      const used = JSON.parse(s.topics_used);
      if (answer.starter_words.length && !used.includes(topic.toLowerCase())) used.push(topic.toLowerCase());
      db.prepare('UPDATE learner_settings SET firm_new = ?, topics_used = ? WHERE account_id = ?').run(result.tooFew ? 1 : 0, JSON.stringify(used), accountId);
      if (held.length) {
        const forms = askedForms([...missing]);
        db.prepare(`INSERT INTO exchanges (account_id, package_id, part_no, kind, code, fixes_id, prompt, steps, asks, asked_forms, held, status, created_at)
          VALUES (?, ?, ?, 'meanings_fix', ?, ?, ?, '[]', '[]', ?, ?, 'waiting', ?)`).run(accountId, root.package_id, root.part_no, codeFor(accountId, `${exchange.code}m`),
          root.id, buildMeaningsFixPrompt(forms), JSON.stringify(forms), JSON.stringify({ answer, indexes: held }), now());
      }
      for (const i of failing) {
        const text = answer.texts[i];
        const partNo = whole ? text.part : root.part_no;
        const code = codeFor(accountId, `${pkg.code}-${partNo}`);
        db.prepare(`INSERT INTO exchanges (account_id, package_id, part_no, kind, code, prompt, steps, asks, asked_forms, status, created_at)
          VALUES (?, ?, ?, 'redo', ?, ?, '[]', ?, '[]', 'waiting', ?)`).run(accountId, root.package_id, partNo, code,
          buildRedoPrompt({ code, kind: text.kind, partNo, problems: result.texts[i].problems, textWords: sizes.textWords }), JSON.stringify([{ part: partNo, kind: text.kind }]), now());
      }
      const streak = failing.length ? pkg.fail_streak + 1 : 0;
      db.prepare('UPDATE packages SET fail_streak = ?, one_text = MAX(one_text, ?) WHERE id = ?').run(streak, streak >= 2 ? 1 : 0, pkg.id);
      countParts(pkg);
      return out;
    });

    const next = waitingOf(accountId, root.package_id);
    const problems = failing.flatMap((i) => result.texts[i].problems.map(describeProblem));
    if (held.length) problems.push(`Waiting for the meaning of: ${[...missing].join(', ')}.`);
    return {
      result: failing.length || held.length ? 'partly_accepted' : 'accepted',
      texts: stored.texts.map(({ id, title, kind }) => ({ id, title, kind })),
      newWords: stored.added.length,
      problems,
      next: next && (next.kind === 'redo' || next.kind === 'meanings_fix') ? { exchangeId: next.id, kind: next.kind, prompt: next.prompt } : null,
      newChatSuggested: failing.some((i) => result.texts[i].share < s.target_share - FORGOTTEN_BELOW),
    };
  }

  // The AI's checks of dictionary meanings replace them; only the forms asked about count (FR-207).
  function applyChecks(accountId, exchange, checks = []) {
    const asked = new Set(JSON.parse(exchange.asked_forms || '[]'));
    for (const c of checks) {
      const form = c.form.toLowerCase();
      const lemma = c.lemma.toLowerCase();
      const key = asked.has(form) ? form : asked.has(lemma) ? lemma : null;
      if (key) words.setMeaning(accountId, key, { en: c.en, explainSv: c.explain_sv ?? null });
    }
  }

  // A meanings fix-it's answer gives the missing meanings and releases the held texts (RQ-397).
  function answerMeaningsFix(accountId, exchange, pasted) {
    if (exchange.status !== 'waiting') throw new HttpError(409, 'duplicate', 'Those meanings are already added.');
    const extracted = extractJson(pasted, { requireField: 'meanings' });
    const checked = extracted.ok ? validateMeanings(extracted.value) : null;
    if (!checked?.ok) {
      const problem = !extracted.ok ? describeProblem({ kind: extracted.problem, line: extracted.line }) : checked.problems.join('; ');
      throw new HttpError(400, 'bad_answer', `grove couldn't read that answer: ${problem} Copy the prompt into your AI again.`);
    }
    const root = exchangeById(exchange.fixes_id);
    const { answer, indexes } = JSON.parse(exchange.held);
    const asked = new Set(JSON.parse(exchange.asked_forms || '[]'));
    const given = checked.value.meanings.filter((m) => asked.has(m.form.toLowerCase()));
    answer.new_words = [...answer.new_words, ...given.map((m) => ({ form: m.form, lemma: m.lemma, en: m.en, explain_sv: m.explain_sv }))];
    const s = settings(accountId);
    const counter = words.counterFor(accountId, { names: answer.names, phrases: answer.new_phrases.map((p) => p.sv), inflections: answer.inflections });
    const result = checkAnswer(answer, counter, s.target_share);
    const ready = indexes.filter((i) => missingMeanings(answer, result.texts[i]).length === 0);
    const still = indexes.filter((i) => !ready.includes(i));
    const pkg = db.prepare('SELECT * FROM packages WHERE id = ?').get(root.package_id);
    const stored = transaction(db, () => {
      const out = ready.length ? acceptAnswer({ db, words, accountId, exchange: root, answer, check: result, topic: s.topic || DEFAULT_TOPIC, now, counter, indexes: ready }) : { texts: [], added: [] };
      db.prepare("UPDATE exchanges SET status = 'accepted', answered_at = ? WHERE id = ?").run(now(), exchange.id);
      if (still.length) {
        const forms = askedForms(still.flatMap((i) => missingMeanings(answer, result.texts[i])));
        db.prepare(`INSERT INTO exchanges (account_id, package_id, part_no, kind, code, fixes_id, prompt, steps, asks, asked_forms, held, status, created_at)
          VALUES (?, ?, ?, 'meanings_fix', ?, ?, ?, '[]', '[]', ?, ?, 'waiting', ?)`).run(accountId, root.package_id, root.part_no, codeFor(accountId, exchange.code),
          root.id, buildMeaningsFixPrompt(forms), JSON.stringify(forms), JSON.stringify({ answer, indexes: still }), now());
      }
      countParts(pkg);
      return out;
    });
    const next = waitingOf(accountId, root.package_id);
    return {
      result: still.length ? 'partly_accepted' : 'accepted',
      texts: stored.texts.map(({ id, title, kind }) => ({ id, title, kind })),
      newWords: stored.added.length,
      problems: [],
      next: next && (next.kind === 'redo' || next.kind === 'meanings_fix') ? { exchangeId: next.id, kind: next.kind, prompt: next.prompt } : null,
      newChatSuggested: false,
    };
  }

  return {
    settings,
    DEFAULT_TOPIC,

    home(accountId) {
      const s = settings(accountId);
      const pkg = openPackage(accountId);
      const waiting = pkg ? waitingOf(accountId, pkg.id) : null;
      // Beta (FR-224): own texts and texts from the learner's AI; the demo's prepared texts and grove
      // texts from the common library (G-09 FR-916, marked "grove text") aren't.
      const texts = db.prepare(`SELECT t.id, t.title, t.kind, t.part_no, t.created_at, t.read_at, t.own, t.ready, r.value,
          (t.own = 1 OR (e.code NOT LIKE 'DEMO-%' AND e.code NOT LIKE 'LIB-%')) AS beta, (e.code LIKE 'LIB-%') AS grove FROM texts t
        LEFT JOIN ratings r ON r.text_id = t.id LEFT JOIN exchanges e ON e.id = t.exchange_id
        WHERE t.account_id = ? ORDER BY t.created_at DESC, t.id DESC`).all(accountId);
      return {
        topic: s.topic || DEFAULT_TOPIC,
        targetShare: s.target_share,
        plan: { family: s.ai_family, product: s.ai_product, tactic: s.tactic, ...(s.ai_family ? { recommended: recommend(s.ai_family, s.ai_product).tactic, reason: recommend(s.ai_family, s.ai_product).reason } : { recommended: null, reason: null }), families: FAMILIES },
        // After two answers in a row with a failed text, the other main tactic (RQ-405).
        offer: pkg && pkg.one_text ? ((pkg.tactic ?? s.tactic) === 'steps' ? 'long' : 'steps') : null,
        package: pkg ? { id: pkg.id, partsAccepted: pkg.parts_accepted, of: pkg.parts_total, status: pkg.status, oneText: !!pkg.one_text, unrated: unratedIn(accountId, pkg.id) } : null,
        waiting: waiting ? { ...view(waiting), newChatSuggested: waiting.kind === 'fix' } : null,
        texts: texts.map((t) => ({
          id: t.id, title: t.title, kind: t.kind, partNo: t.part_no, own: !!t.own, ready: !!t.ready, beta: !!t.beta, grove: !!t.grove, createdAt: t.created_at,
          state: t.value ? 'rated' : t.read_at ? 'read' : 'new',
        })),
      };
    },

    // FR-201, FR-203: the waiting request, the next one, part 1 of a new package, or the setup again.
    requestPrompt(accountId, action, { forSession = false } = {}) {
      return transaction(db, () => {
        settings(accountId);
        let pkg = openPackage(accountId);
        if (action === 'new_chat') {
          const waiting = pkg ? waitingOf(accountId, pkg.id) : null;
          if (!waiting) throw new HttpError(409, 'nothing_waiting', 'There is no prompt waiting. Ask for texts first.');
          // One long prompt needs no setup: every request already carries it.
          if ((pkg.tactic ?? settings(accountId).tactic) !== 'long') {
            db.prepare('UPDATE exchanges SET steps = ? WHERE id = ?').run(JSON.stringify(setupFor(accountId, pkg)), waiting.id);
          }
          return view(exchangeById(waiting.id));
        }
        if (action === 'new_package' && pkg) { closePackage(accountId, pkg, 'closed'); pkg = null; }
        // From the offer, a session needing one kind gets a package of only that kind (FR-202, B-23).
        const needed = forSession ? kindsStillNeeded(db, accountId) : [];
        const onlyKind = needed.length === 1 ? needed[0] : null;
        let ex;
        if (!pkg) ex = newPackage(accountId, onlyKind);
        else {
          ex = waitingOf(accountId, pkg.id) ?? nextRequest(accountId, pkg);
          if (!ex) {
            if (unratedIn(accountId, pkg.id) > 0) {
              throw new HttpError(409, 'package_waiting', 'Rate every text of this package first, or start a new package.');
            }
            closePackage(accountId, pkg, 'finished');
            ex = newPackage(accountId, onlyKind);
          }
        }
        return view(ex);
      });
    },

    // The learner's AI and product, and the tactic: the recommended one unless another is chosen (FR-223).
    setPlan(accountId, { family, product, tactic }) {
      if (!productOf(family, product)) throw new HttpError(400, 'bad_request', 'Please pick a product of that AI.');
      const recommended = recommend(family, product).tactic;
      const chosen = tactic ?? recommended;
      settings(accountId);
      db.prepare('UPDATE learner_settings SET ai_family = ?, ai_product = ?, tactic = ? WHERE account_id = ?').run(family, product, chosen, accountId);
      // Step by step and one long prompt take effect in the open package too; the whole package waits.
      if (chosen !== 'whole') db.prepare("UPDATE packages SET tactic = ? WHERE account_id = ? AND status = 'open' AND tactic != 'whole'").run(chosen, accountId);
      return { family, product, tactic: chosen, recommended };
    },

    answer(accountId, exchangeId, pasted) {
      let exchange = db.prepare('SELECT * FROM exchanges WHERE id = ? AND account_id = ?').get(exchangeId, accountId);
      if (!exchange) throw new HttpError(404, 'not_found', 'There is no such prompt.');
      // RQ-461 (FR-919): a paste into a request grove refused is the answer to its waiting fix-it request (the
      // newest of that code), so a correct answer after a failed one is read normally, never "already added".
      if (exchange.status === 'needs_fix') {
        const fix = db.prepare("SELECT * FROM exchanges WHERE account_id = ? AND code = ? AND kind = 'fix' AND status = 'waiting' ORDER BY id DESC LIMIT 1").get(accountId, exchange.code);
        if (fix) exchange = fix;
      }
      const root = exchange.fixes_id ? exchangeById(exchange.fixes_id) : exchange;
      if (root.kind === 'own') return answerOwn({ db, words, sizes, now, accountId, exchange, root, pasted });
      if (exchange.kind === 'meanings') throw new HttpError(409, 'duplicate', 'This prompt is no longer used. Ask for texts again.');
      if (exchange.kind === 'meanings_fix') return answerMeaningsFix(accountId, exchange, pasted);
      return answerTexts(accountId, exchange, pasted);
    },
  };
}
