// Packages and exchanges (FR-201…FR-207, FR-212, FR-203; research R6): one open package of 3 parts
// at a time, the summary with its first prompt, fix-it and meanings exchanges.
import { createHash, randomInt } from 'node:crypto';
import { HttpError } from '../web/http.mjs';
import { transaction } from '../store/db.mjs';
import { extractJson } from './extract.mjs';
import { validateAnswer, validateMeanings } from './schema.mjs';
import { checkAnswer, describeProblem } from './check.mjs';
import { buildPartPrompt, chooseKnown } from './prompt.mjs';
import { buildFixPrompt, buildMeaningsPrompt } from './fixit.mjs';
import { acceptAnswer } from './accept.mjs';
import { LABELS } from './ratings.mjs';
import { tokenize } from '../words/tokens.mjs';
import { openRequests } from '../reading/flags.mjs';

export const PARTS = 3;
export const DEFAULT_TOPIC = 'everyday life';
const LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';

export function createPackages({ db, words, now = () => Date.now() }) {
  function settings(accountId) {
    db.prepare('INSERT OR IGNORE INTO learner_settings (account_id) VALUES (?)').run(accountId);
    return db.prepare('SELECT * FROM learner_settings WHERE account_id = ?').get(accountId);
  }
  const openPackage = (accountId) => db.prepare("SELECT * FROM packages WHERE account_id = ? AND status = 'open'").get(accountId);
  const waitingOf = (accountId, packageId) => db.prepare(`SELECT * FROM exchanges WHERE account_id = ? AND package_id = ?
    AND status = 'waiting' AND kind IN ('part', 'fix') ORDER BY id DESC LIMIT 1`).get(accountId, packageId);
  const unratedIn = (accountId, packageId) => db.prepare(`SELECT COUNT(*) AS n FROM texts t WHERE t.account_id = ? AND t.package_id = ?
    AND NOT EXISTS (SELECT 1 FROM ratings r WHERE r.text_id = t.id)`).get(accountId, packageId).n;

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

  function makePrompt(accountId, pkg, partNo, withSummary) {
    const s = settings(accountId);
    const topic = s.topic || DEFAULT_TOPIC;
    const used = JSON.parse(s.topics_used);
    const code = `${Array.from({ length: 4 }, () => LETTERS[randomInt(LETTERS.length)]).join('')}-${partNo}`;
    const sum = withSummary ? summary(accountId, s.last_summary_at) : null;
    const prompt = buildPartPrompt({
      code, partNo, of: PARTS, topic, newTopic: !used.includes(topic.toLowerCase()),
      known: chooseKnown(words.groundLemmas(accountId), tokenize(topic).map((t) => t.word)),
      reuse: words.recentLeaves(accountId, 10), targetShare: s.target_share,
      firmNew: !!s.firm_new, shorter: !!s.shorter, summary: sum, continueHint: partNo > 1,
      ...openRequests(db, accountId),
    });
    // The nudges are asked for once (FR-212).
    db.prepare(`UPDATE learner_settings SET shorter = 0, firm_new = 0${withSummary ? ', last_summary_at = ?' : ''} WHERE account_id = ?`)
      .run(...(withSummary ? [now(), accountId] : [accountId]));
    const info = db.prepare(`INSERT INTO exchanges (account_id, package_id, part_no, kind, code, carries_summary, prompt, status, created_at)
      VALUES (?, ?, ?, 'part', ?, ?, ?, 'waiting', ?)`).run(accountId, pkg.id, partNo, code, sum ? 1 : 0, prompt, now());
    return db.prepare('SELECT * FROM exchanges WHERE id = ?').get(Number(info.lastInsertRowid));
  }

  function newPackage(accountId) {
    const info = db.prepare("INSERT INTO packages (account_id, status, created_at) VALUES (?, 'open', ?)").run(accountId, now());
    const pkg = db.prepare('SELECT * FROM packages WHERE id = ?').get(Number(info.lastInsertRowid));
    return makePrompt(accountId, pkg, 1, true);
  }

  function closePackage(accountId, pkg, status) {
    db.prepare('UPDATE packages SET status = ? WHERE id = ?').run(status, pkg.id);
    db.prepare("UPDATE exchanges SET status = 'replaced' WHERE package_id = ? AND status IN ('waiting', 'needs_fix')").run(pkg.id);
  }

  function refuse(exchange, problems) {
    db.prepare("UPDATE exchanges SET status = 'needs_fix', answered_at = ? WHERE id = ?").run(now(), exchange.id);
    const root = exchange.fixes_id ?? exchange.id;
    const prompt = buildFixPrompt(problems, exchange.code);
    const info = db.prepare(`INSERT INTO exchanges (account_id, package_id, part_no, kind, code, fixes_id, prompt, status, created_at)
      VALUES (?, ?, ?, 'fix', ?, ?, ?, 'waiting', ?)`).run(exchange.account_id, exchange.package_id, exchange.part_no, exchange.code, root, prompt, now());
    return { result: 'needs_fix', problems: problems.map(describeProblem), fix: { exchangeId: Number(info.lastInsertRowid), prompt } };
  }

  function answerMeanings(accountId, exchange, pasted) {
    const extracted = extractJson(pasted, { requireField: 'meanings' });
    const checked = extracted.ok ? validateMeanings(extracted.value) : null;
    if (!checked?.ok) {
      const problem = !extracted.ok ? describeProblem({ kind: extracted.problem, line: extracted.line }) : checked.problems.join('; ');
      throw new HttpError(400, 'bad_answer', `grove couldn't read that answer: ${problem} Copy the meanings prompt into your AI again.`);
    }
    const asked = new Set(exchange.prompt.split('\n\n')[1].split(', ').map((x) => x.trim()));
    let filled = 0;
    transaction(db, () => {
      for (const m of checked.value.meanings) {
        const form = m.form.toLowerCase();
        if (!asked.has(form)) continue;
        const leaf = words.find(accountId, form);
        if (!leaf) continue;
        const lemma = m.lemma.toLowerCase();
        const groundWord = lemma !== form ? words.find(accountId, lemma) : null;
        if (groundWord && groundWord.state === 'ground' && leaf.state === 'leaf') {
          // It was an inflection of a known word after all: learn the form, drop the leaf.
          words.learnForm(accountId, form, lemma);
          db.prepare('DELETE FROM words WHERE id = ?').run(leaf.id);
        } else {
          db.prepare('UPDATE words SET en = ?, explain_sv = ? WHERE id = ?').run(m.en, m.explain_sv ?? null, leaf.id);
        }
        filled += 1;
      }
      db.prepare("UPDATE exchanges SET status = 'accepted', answered_at = ? WHERE id = ?").run(now(), exchange.id);
    });
    return { result: 'meanings_added', filled, missing: Math.max(0, asked.size - filled) };
  }

  return {
    settings,
    DEFAULT_TOPIC,

    home(accountId) {
      const s = settings(accountId);
      const pkg = openPackage(accountId);
      const waiting = pkg ? waitingOf(accountId, pkg.id) : null;
      const meanings = db.prepare("SELECT id, prompt FROM exchanges WHERE account_id = ? AND kind = 'meanings' AND status = 'waiting' ORDER BY id DESC LIMIT 1").get(accountId);
      const texts = db.prepare(`SELECT t.id, t.title, t.part_no, t.created_at, t.read_at, t.own, r.value FROM texts t
        LEFT JOIN ratings r ON r.text_id = t.id WHERE t.account_id = ? ORDER BY t.created_at DESC, t.id DESC`).all(accountId);
      return {
        topic: s.topic || DEFAULT_TOPIC,
        targetShare: s.target_share,
        package: pkg ? { id: pkg.id, partsAccepted: pkg.parts_accepted, of: pkg.parts_total, status: pkg.status, unrated: unratedIn(accountId, pkg.id) } : null,
        waiting: waiting ? { exchangeId: waiting.id, kind: waiting.kind, code: waiting.code, part: waiting.part_no, of: PARTS, prompt: waiting.prompt } : null,
        meanings: meanings ? { exchangeId: meanings.id, prompt: meanings.prompt } : null,
        texts: texts.map((t) => ({ id: t.id, title: t.title, partNo: t.part_no, own: !!t.own, createdAt: t.created_at, state: t.value ? 'rated' : t.read_at ? 'read' : 'new' })),
      };
    },

    // FR-201, FR-203: the waiting prompt, the next part, or part 1 of a new package.
    requestPrompt(accountId, action) {
      return transaction(db, () => {
        settings(accountId);
        let pkg = openPackage(accountId);
        if (action === 'new_package' && pkg) { closePackage(accountId, pkg, 'closed'); pkg = null; }
        let ex;
        if (!pkg) ex = newPackage(accountId);
        else {
          ex = waitingOf(accountId, pkg.id);
          if (!ex && pkg.parts_accepted < pkg.parts_total) ex = makePrompt(accountId, pkg, pkg.parts_accepted + 1, false);
          if (!ex) {
            if (unratedIn(accountId, pkg.id) > 0) {
              throw new HttpError(409, 'package_waiting', 'Rate every text of this package first, or start a new package.');
            }
            closePackage(accountId, pkg, 'finished');
            ex = newPackage(accountId);
          }
        }
        return { exchangeId: ex.id, kind: ex.kind, code: ex.code, part: ex.part_no, of: PARTS, prompt: ex.prompt, carriesSummary: !!ex.carries_summary };
      });
    },

    answer(accountId, exchangeId, pasted) {
      const exchange = db.prepare('SELECT * FROM exchanges WHERE id = ? AND account_id = ?').get(exchangeId, accountId);
      if (!exchange) throw new HttpError(404, 'not_found', 'There is no such prompt.');
      if (exchange.kind === 'meanings') {
        if (exchange.status !== 'waiting') throw new HttpError(409, 'duplicate', 'Those meanings are already added.');
        return answerMeanings(accountId, exchange, pasted);
      }
      const extracted = extractJson(pasted);
      if (!extracted.ok) {
        if (exchange.status === 'accepted') throw new HttpError(409, 'duplicate', 'This part is already added.');
        return refuse(exchange, [{ kind: extracted.problem, line: extracted.line }]);
      }
      const checked = validateAnswer(extracted.value);
      if (!checked.ok) {
        if (exchange.status === 'accepted') throw new HttpError(409, 'duplicate', 'This part is already added.');
        return refuse(exchange, checked.problems.map((message) => ({ kind: 'format', message })));
      }
      const answer = checked.value;
      const hash = createHash('sha256').update(JSON.stringify(answer)).digest('hex');
      if (db.prepare("SELECT 1 FROM exchanges WHERE account_id = ? AND answer_hash = ? AND status = 'accepted'").get(accountId, hash)) {
        throw new HttpError(409, 'duplicate', 'This answer is already added.');
      }
      const partDone = db.prepare(`SELECT 1 FROM exchanges WHERE account_id = ? AND code = ? AND status = 'accepted'`).get(accountId, exchange.code);
      if (exchange.status === 'accepted' || exchange.status === 'replaced' || partDone) {
        throw new HttpError(409, 'duplicate', 'This part is already added.');
      }
      if (answer.part !== exchange.code) {
        throw new HttpError(409, 'wrong_part', `This answer is for part "${answer.part}", but this box is for part "${exchange.code}". Paste it where it belongs, or ask your AI again with this prompt.`);
      }
      const s = settings(accountId);
      const counter = words.counterFor(accountId, { names: answer.names, phrases: answer.new_phrases.map((p) => p.sv), inflections: answer.inflections });
      const result = checkAnswer(answer, counter, s.target_share);
      if (!result.ok) return refuse(exchange, result.problems);

      const topic = s.topic || DEFAULT_TOPIC;
      const stored = acceptAnswer({ db, words, accountId, exchange, answer, check: result, topic, now, counter });
      transaction(db, () => {
        db.prepare("UPDATE exchanges SET status = 'accepted', answer_hash = ?, answered_at = ? WHERE id = ?").run(hash, now(), exchange.id);
        db.prepare("UPDATE exchanges SET status = 'replaced' WHERE account_id = ? AND code = ? AND id != ? AND status IN ('waiting', 'needs_fix')").run(accountId, exchange.code, exchange.id);
        db.prepare('UPDATE packages SET parts_accepted = MIN(parts_total, parts_accepted + 1) WHERE id = ?').run(exchange.package_id);
        const used = JSON.parse(s.topics_used);
        if (answer.starter_words.length && !used.includes(topic.toLowerCase())) used.push(topic.toLowerCase());
        db.prepare('UPDATE learner_settings SET firm_new = ?, topics_used = ? WHERE account_id = ?').run(result.tooFew ? 1 : 0, JSON.stringify(used), accountId);
      });

      const missing = words.missingMeanings(accountId, stored.added);
      let meanings = null;
      if (missing.length) {
        const prompt = buildMeaningsPrompt(missing);
        const info = db.prepare(`INSERT INTO exchanges (account_id, package_id, part_no, kind, code, prompt, status, created_at)
          VALUES (?, ?, ?, 'meanings', ?, ?, 'waiting', ?)`).run(accountId, exchange.package_id, exchange.part_no, exchange.code, prompt, now());
        meanings = { exchangeId: Number(info.lastInsertRowid), prompt };
      }
      return { result: 'accepted', texts: stored.texts, newWords: stored.added.length, meanings };
    },
  };
}
