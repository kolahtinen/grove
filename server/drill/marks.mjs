// The word menu's switches, Let it fall and Pick up (FR-409…FR-411; question-pages/56).
import { transaction } from '../store/db.mjs';
import { createItems } from './items.mjs';
import { createQuestions } from './questions.mjs';

export function createMarks({ db, now = () => Date.now() }) {
  const items = createItems({ db, now });
  const questions = createQuestions(db);
  return {
    setMarks(accountId, { lemma, kind = 'word', read, remember }) {
      const item = items.findOrCreate(accountId, lemma, kind);
      const after = items.setMarks(item, { read, remember });
      return { state: after.state, drilled: !!after.drilled, read: !!after.to_read, remember: !!after.to_remember };
    },
    fallCheck(accountId, { lemma, kind = 'word' }) {
      const item = items.mustFind(accountId, lemma, kind);
      if (item.kind === 'pattern') return { question: null };
      const q = questions.meaningQuestion(accountId, item, 'read');
      return { question: q.mode === 'recall' ? null : { sentence: q.sentence, word: q.word, options: q.options, right: q.right } };
    },
    letItFall(accountId, { lemma, kind = 'word', right, confirmed }) {
      const item = items.mustFind(accountId, lemma, kind);
      const ok = right === true || confirmed === true;
      transaction(db, () => {
        if (right !== undefined) db.prepare("INSERT INTO review_answers (account_id, word_id, mode, right, at) VALUES (?, ?, 'fall_check', ?, ?)").run(accountId, item.id, right ? 1 : 0, now());
        if (ok && item.state === 'leaf') items.fall(item);
      });
      return { fell: ok && item.state === 'leaf' };
    },
    pickUp(accountId, { lemma, kind = 'word' }) {
      items.pickUp(items.mustFind(accountId, lemma, kind));
      return { result: 'picked_up' };
    },
  };
}
