// Own texts (G-03 FR-318; research R7; addendum 002): saved waiting, then an AI round in pieces
// (every word's meaning in context, and a copyright view), checked only for completeness; the text
// opens when every piece is in. Save as leaf takes the AI's meaning.
import { randomInt } from 'node:crypto';
import { HttpError } from '../web/http.mjs';
import { transaction } from '../store/db.mjs';
import { DEFAULT_SIZES } from '../config.mjs';
import { splitSentences } from '../words/sentences.mjs';
import { tokenize } from '../words/tokens.mjs';
import { askedForms } from '../words/asked.mjs';
import { createWordStore } from '../words/store.mjs';
import { fillExamples } from '../words/examples.mjs';
import { extractJson } from '../texts/extract.mjs';
import { validateOwn, COPYRIGHT } from '../texts/schema.mjs';
import { describeProblem } from '../texts/check.mjs';

const LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const FORMAT = '```json\n{ "own": "<CODE>", "copyright": "free | unsure | copyrighted", "copyright_note": "short reason", "words": [ { "form": "as written", "lemma": "dictionary form", "en": "its meaning in this text", "explain_sv": "enkel förklaring" } ], "names": ["…"] }\n```';

export function buildOwnPrompt({ code, piece, of, text }) {
  return [
    `I'm learning Swedish (my own language is English) with an app called grove. This is a Swedish text I want to read${of > 1 ? ` (piece ${piece} of ${of})` : ''}:`,
    text,
    'For every word in it, give its dictionary form, its English meaning in this text, and a simple Swedish explanation using very common words. List names of people and places in "names" instead.',
    'Also say whether the text looks free to use ("free"), maybe copyrighted ("unsure") or copyrighted ("copyrighted"), with a short reason in "copyright_note".',
    `Reply with ONLY one \`\`\`json code block in this format, and no other text:\n${FORMAT.replace('<CODE>', code)}`,
  ].join('\n\n');
}

export function buildOwnFixPrompt({ code, forms }) {
  return [
    'Thanks! Your answer left out the meaning of these words:',
    forms.join(', '),
    `Please give them in the same format (with "own": "${code}"), the same copyright view, and nothing else:\n${FORMAT.replace('<CODE>', code)}`,
  ].join('\n\n');
}

const formsOf = (text) => askedForms(tokenize(text).map((t) => t.word));

// Pieces of at most `max` characters, split between sentences.
export function splitPieces(sentences, max) {
  const pieces = [];
  let current = '';
  for (const s of sentences) {
    if (current && current.length + 1 + s.length > max) { pieces.push(current); current = ''; }
    current = current ? `${current} ${s}` : s;
  }
  if (current) pieces.push(current);
  return pieces;
}

export function addOwnText(db, accountId, { title, text }, now = Date.now(), sizes = DEFAULT_SIZES) {
  const words = createWordStore({ db, now: () => now });
  const names = db.prepare('SELECT name FROM names WHERE account_id = ?').all(accountId).map((r) => r.name);
  const counter = words.counterFor(accountId, { names });
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (!lines.length) throw new HttpError(400, 'bad_request', 'Please paste some Swedish text.');
  return transaction(db, () => {
    const info = db.prepare("INSERT INTO texts (account_id, position, title, topic, created_at, own, ready) VALUES (?, 1, ?, '', ?, 1, 0)").run(accountId, title.trim(), now);
    const id = Number(info.lastInsertRowid);
    const all = [];
    const sentenceIds = [];
    lines.forEach((line, li) => {
      db.prepare("INSERT INTO text_lines (account_id, text_id, position, sv, en) VALUES (?, ?, ?, ?, '')").run(accountId, id, li, line);
      splitSentences(line).forEach((sv, si) => {
        all.push(sv);
        const items = counter.countSentence(sv).items.map((x) => x.text);
        sentenceIds.push(Number(db.prepare('INSERT INTO sentences (account_id, text_id, line_position, position, sv, new_items) VALUES (?, ?, ?, ?, ?, ?)')
          .run(accountId, id, li, si, sv, JSON.stringify(items)).lastInsertRowid));
      });
    });
    // G-03 FR-316: the learner's words without an example take theirs from this text.
    fillExamples(db, accountId, { sentenceIds });
    const letters = Array.from({ length: 4 }, () => LETTERS[randomInt(LETTERS.length)]).join('');
    const pieces = splitPieces(all, sizes.ownPieceChars);
    pieces.forEach((piece, i) => {
      const code = `OWN-${letters}-${i + 1}`;
      db.prepare(`INSERT INTO exchanges (account_id, kind, code, prompt, steps, asked_forms, text_id, status, created_at)
        VALUES (?, 'own', ?, ?, '[]', ?, ?, 'waiting', ?)`).run(accountId, code, buildOwnPrompt({ code, piece: i + 1, of: pieces.length, text: piece }), JSON.stringify(formsOf(piece)), id, now);
    });
    return { id, ...ownStatus(db, accountId, id) };
  });
}

// The waiting piece of an own text, or ready (contracts of specs/003-reading-word-menu).
export function ownStatus(db, accountId, textId) {
  const text = db.prepare('SELECT id, title, ready FROM texts WHERE id = ? AND account_id = ? AND own = 1').get(textId, accountId);
  if (!text) throw new HttpError(404, 'not_found', 'There is no such text.');
  const of = db.prepare("SELECT COUNT(*) AS n FROM exchanges WHERE text_id = ? AND kind = 'own'").get(text.id).n;
  const waiting = db.prepare("SELECT * FROM exchanges WHERE text_id = ? AND status = 'waiting' AND kind IN ('own', 'fix') ORDER BY id LIMIT 1").get(text.id);
  if (!waiting) return { ready: !!text.ready, piece: of, of };
  const piece = Number((waiting.code.match(/-(\d+)$/) || [])[1]) || 1;
  return { ready: false, piece, of, exchangeId: waiting.id, prompt: waiting.prompt };
}

const WORSE = (a, b) => (COPYRIGHT.indexOf(b) > COPYRIGHT.indexOf(a) ? b : a);

// An own exchange's answer (or its fix-it's): store each word's meaning here, the names and the
// copyright view; missing words get a fix-it; the text opens when every piece is in.
export function answerOwn({ db, words, now, accountId, exchange, root, pasted }) {
  if (exchange.status !== 'waiting') throw new HttpError(409, 'duplicate', 'This piece is already added.');
  const textId = root.text_id;
  const fix = (problems, forms) => {
    db.prepare("UPDATE exchanges SET status = 'needs_fix', answered_at = ? WHERE id = ?").run(now(), exchange.id);
    const prompt = forms ? buildOwnFixPrompt({ code: root.code, forms }) : `${problems.map((p, i) => `${i + 1}. ${p}`).join('\n')}\n\n${buildOwnFixPrompt({ code: root.code, forms: JSON.parse(exchange.asked_forms || '[]') })}`;
    const info = db.prepare(`INSERT INTO exchanges (account_id, kind, code, fixes_id, prompt, steps, asked_forms, text_id, status, created_at)
      VALUES (?, 'fix', ?, ?, ?, '[]', ?, ?, 'waiting', ?)`).run(accountId, root.code, root.id, prompt, forms ? JSON.stringify(askedForms(forms)) : exchange.asked_forms, textId, now());
    return { result: 'needs_fix', problems, fix: { exchangeId: Number(info.lastInsertRowid), prompt }, newChatSuggested: false };
  };
  const extracted = extractJson(pasted, { requireField: 'own' });
  if (!extracted.ok) return fix([describeProblem({ kind: extracted.problem, line: extracted.line })]);
  const checked = validateOwn(extracted.value);
  if (!checked.ok) return fix(checked.problems);
  const answer = checked.value;
  if (answer.own !== root.code) {
    throw new HttpError(409, 'wrong_part', `This answer is for "${answer.own}", but this box is for "${root.code}". Paste it where it belongs.`);
  }
  const asked = JSON.parse(exchange.asked_forms || '[]');
  const given = new Set([...answer.words.map((w) => w.form.toLowerCase()), ...answer.names.flatMap((n) => tokenize(n).map((t) => t.word))]);
  const missing = asked.filter((f) => !given.has(f));
  const pieceForms = new Set(JSON.parse(root.asked_forms || '[]'));

  return transaction(db, () => {
    for (const w of answer.words) {
      const form = w.form.toLowerCase();
      if (!pieceForms.has(form)) continue;
      db.prepare(`INSERT INTO text_meanings (account_id, text_id, form, lemma, en, explain_sv) VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT (text_id, form) DO UPDATE SET lemma = excluded.lemma, en = excluded.en, explain_sv = excluded.explain_sv`)
        .run(accountId, textId, form, w.lemma.toLowerCase(), w.en, w.explain_sv ?? null);
    }
    for (const name of answer.names) {
      db.prepare('INSERT OR IGNORE INTO names (account_id, name, lower, text_id) VALUES (?, ?, ?, ?)').run(accountId, name, name.toLowerCase(), textId);
    }
    const text = db.prepare('SELECT copyright_view, copyright_note FROM texts WHERE id = ?').get(textId);
    const view = text.copyright_view ? WORSE(text.copyright_view, answer.copyright) : answer.copyright;
    const note = view === answer.copyright && answer.copyright_note ? answer.copyright_note : text.copyright_note;
    db.prepare('UPDATE texts SET copyright_view = ?, copyright_note = ? WHERE id = ?').run(view, note ?? null, textId);
    db.prepare("UPDATE exchanges SET status = 'accepted', answered_at = ? WHERE id = ?").run(now(), exchange.id);
    if (missing.length) return fix([`No meaning for: ${missing.join(', ')}.`], missing);

    const status = ownStatus(db, accountId, textId);
    let knownShare = null;
    if (!status.exchangeId) {
      const names = db.prepare('SELECT name FROM names WHERE account_id = ?').all(accountId).map((r) => r.name);
      const counter = words.counterFor(accountId, { names });
      let total = 0;
      let known = 0;
      for (const s of db.prepare('SELECT sv FROM sentences WHERE text_id = ?').all(textId)) {
        const c = counter.countSentence(s.sv);
        total += c.total;
        known += c.known;
      }
      knownShare = total ? Math.round((known / total) * 1000) / 10 : 100;
      db.prepare('UPDATE texts SET ready = 1, known_share = ? WHERE id = ?').run(knownShare, textId);
    }
    return { result: 'piece_added', piece: Number((root.code.match(/-(\d+)$/) || [])[1]) || 1, of: status.of, ready: !status.exchangeId, knownShare };
  });
}

// Save as leaf: with the AI's meaning from the own text's round, else the word list's (FR-318).
export function saveLeaf(db, accountId, { textId, form }, now = Date.now()) {
  const text = db.prepare('SELECT id FROM texts WHERE id = ? AND account_id = ?').get(textId, accountId);
  if (!text) throw new HttpError(404, 'not_found', 'There is no such text.');
  const f = form.trim().toLowerCase();
  const here = db.prepare('SELECT lemma, en, explain_sv FROM text_meanings WHERE text_id = ? AND form = ?').get(text.id, f);
  const store = createWordStore({ db, now: () => now });
  if (here) store.addLeaf({ accountId, lemma: here.lemma, en: here.en, explainSv: here.explain_sv, sourceTextId: text.id });
  else store.addLeaf({ accountId, lemma: f, sourceTextId: text.id });
}
