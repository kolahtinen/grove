// The Leaves page (FR-412): drilled leaves by mark, unmarked leaves apart; add and delete. A typed
// item takes the word list's meaning; without one the learner gives theirs (G-02 FR-207).
import { HttpError } from '../web/http.mjs';
import { meaning as dictionaryMeaning } from '../lexicon/lexicon.mjs';
import { strength, isDue } from './schedule.mjs';
import { createItems } from './items.mjs';

export function createLeaves({ db, now = () => Date.now() }) {
  const items = createItems({ db, now });
  const view = (i, t) => ({ lemma: i.lemma, kind: i.kind, en: i.en, gap: i.gap_days, strength: i.drilled ? Math.round(strength(i, t) * 1000) / 1000 : null, due: i.drilled ? isDue(i, t) : false });
  return {
    list(accountId) {
      const t = now();
      const leaves = db.prepare("SELECT * FROM words WHERE account_id = ? AND state = 'leaf' ORDER BY lemma").all(accountId);
      return {
        remember: leaves.filter((i) => i.drilled).map((i) => view(i, t)),
        unmarked: leaves.filter((i) => !i.drilled && i.kind !== 'pattern').map((i) => view(i, t)),
      };
    },
    add(accountId, { text, kind = 'word', en }) {
      const own = en?.trim() || null;
      if (!items.find(accountId, text, kind) && !own && (kind === 'pattern' || !dictionaryMeaning(text))) {
        throw new HttpError(400, 'needs_meaning', 'grove has no meaning for this. What does it mean? (Your best guess is fine.)');
      }
      const item = items.findOrCreate(accountId, text, kind, null, own);
      items.setMarks(item, { remember: true });
      return { result: 'added' };
    },
    remove(accountId, { lemma, kind = 'word' }) {
      const item = items.mustFind(accountId, lemma, kind);
      db.prepare('DELETE FROM words WHERE id = ?').run(item.id);
      return { result: 'deleted' };
    },
  };
}
