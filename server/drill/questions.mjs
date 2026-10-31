// Questions in sentences the learner has read (FR-406, FR-407, FR-410; research R3): meaning here,
// spoken (To remember), reversed (Master), or a recall card when there's no sentence or too few meanings.
import { randomInt } from 'node:crypto';
import { splitTokens } from '../reading/view.mjs';

function shuffle(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i -= 1) { const j = randomInt(i + 1); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

// FR-932: a sentence shown in an exercise never carries a closing quotation mark it doesn't open (a
// line's closing ” left on its last sentence).
export function tidySentence(sv) {
  let text = String(sv ?? '').trim();
  for (const [open, close] of [['“', '”'], ['«', '»'], ['„', '”']]) {
    const opens = text.split(open).length - 1;
    const closes = text.split(close).length - 1;
    if (closes > opens && text.endsWith(close)) text = text.slice(0, -1).trimEnd();
  }
  if ((text.split('"').length - 1) % 2 === 1 && text.endsWith('"')) text = text.slice(0, -1).trimEnd();
  return text;
}

export function createQuestions(db) {
  // The English of a sentence's line (FR-932: shown after answering).
  const lineEn = (textId, sv) => db.prepare(`SELECT l.en FROM sentences s JOIN text_lines l ON l.text_id = s.text_id AND l.position = s.line_position
    WHERE s.text_id = ? AND s.sv = ? LIMIT 1`).get(textId, sv)?.en
    ?? db.prepare('SELECT en FROM text_lines WHERE text_id = ? AND sv = ? LIMIT 1').get(textId, sv)?.en ?? null;

  // The most recent sentence of this learner containing the item (its new items, its form, or a learned form).
  function sentenceFor(accountId, item) {
    const forms = [item.lemma, ...db.prepare('SELECT form FROM word_forms WHERE word_id = ?').all(item.id).map((r) => r.form)];
    if (item.kind === 'pattern') {
      const place = db.prepare(`SELECT p.text_id, p.words, l.sv FROM pattern_places p JOIN text_lines l ON l.text_id = p.text_id AND l.position = p.line_position
        WHERE p.word_id = ? ORDER BY p.rowid DESC LIMIT 1`).get(item.id);
      return place ? { sv: place.sv, textId: place.text_id, form: place.words } : null;
    }
    const rows = db.prepare('SELECT text_id, sv, new_items FROM sentences WHERE account_id = ? ORDER BY id DESC').all(accountId);
    for (const r of rows) {
      const words = splitTokens(r.sv).filter((x) => x.word);
      if (item.kind === 'phrase') {
        if (r.sv.toLowerCase().includes(item.lemma)) return { sv: r.sv, textId: r.text_id, form: item.lemma };
        continue;
      }
      const hit = words.find((w) => forms.includes(w.word));
      if (hit) return { sv: r.sv, textId: r.text_id, form: hit.t };
      if (JSON.parse(r.new_items).includes(item.lemma)) {
        const any = words.find((w) => w.word.startsWith(item.lemma.slice(0, 3)));
        if (any) return { sv: r.sv, textId: r.text_id, form: any.t };
      }
    }
    return null;
  }

  function meaningHere(item, textId) {
    const m = textId ? db.prepare('SELECT en FROM word_meanings WHERE word_id = ? AND text_id = ?').get(item.id, textId) : null;
    return m?.en ?? item.en ?? null;
  }

  function otherMeanings(accountId, item, right) {
    const kind = item.kind === 'pattern' ? 'pattern' : 'word';
    return [...new Set(db.prepare('SELECT en FROM words WHERE account_id = ? AND id != ? AND kind = ? AND en IS NOT NULL').all(accountId, item.id, kind)
      .map((r) => r.en).filter((en) => en !== right && en !== item.en))];
  }

  function recall(item, meaning) {
    return { lemma: item.lemma, kind: item.kind, mode: 'recall', meaning: meaning ?? item.en ?? null };
  }

  return {
    sentenceFor,
    // A meaning question in a sentence, shown with Play (FR-406; addendum 003, RQ-415).
    meaningQuestion(accountId, item, mode = 'remember') {
      const s = sentenceFor(accountId, item);
      const right = s ? meaningHere(item, s.textId) : item.en;
      const others = otherMeanings(accountId, item, right);
      if (!s || !right || others.length < 2) return recall(item, right);
      const options = shuffle([right, ...shuffle(others).slice(0, Math.min(3, others.length))]);
      return { lemma: item.lemma, kind: item.kind, mode, sentence: tidySentence(s.sv), sentenceEn: lineEn(s.textId, s.sv), word: s.form, meaning: right, options, right: options.indexOf(right) };
    },
    // Master: the sentence with the form blanked, the English meaning, and Swedish forms to choose from.
    masterQuestion(accountId, item) {
      const s = sentenceFor(accountId, item);
      if (!s || item.kind !== 'word') return this.meaningQuestion(accountId, item);
      const meaning = meaningHere(item, s.textId);
      const others = db.prepare("SELECT lemma FROM words WHERE account_id = ? AND id != ? AND kind = 'word'").all(accountId, item.id)
        .map((r) => r.lemma).filter((l) => l !== s.form.toLowerCase())
        .sort((a, b) => Math.abs(a.length - s.form.length) - Math.abs(b.length - s.form.length)).slice(0, 12);
      if (others.length < 2 || !meaning) return recall(item, meaning);
      const options = shuffle([s.form.toLowerCase(), ...shuffle(others).slice(0, 3)]);
      const blank = s.sv.replace(new RegExp(`(^|[^\\p{L}])${s.form.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?=[^\\p{L}]|$)`, 'u'), `$1${'_'.repeat(Math.max(4, s.form.length))}`);
      return { lemma: item.lemma, kind: item.kind, mode: 'master', sentence: tidySentence(blank), sentenceEn: lineEn(s.textId, s.sv), meaning, options, right: options.indexOf(s.form.toLowerCase()) };
    },
  };
}
