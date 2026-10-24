// The Leaves page (FR-412): drilled leaves by mark, unmarked leaves apart; add and delete.
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
        remember: leaves.filter((i) => i.drilled && i.to_remember).map((i) => view(i, t)),
        read: leaves.filter((i) => i.drilled && i.to_read).map((i) => view(i, t)),
        unmarked: leaves.filter((i) => !i.drilled && i.kind !== 'pattern').map((i) => view(i, t)),
      };
    },
    add(accountId, { text, kind = 'word' }) {
      const item = items.findOrCreate(accountId, text, kind);
      items.setMarks(item, { read: true, remember: !!item.to_remember });
      return { result: 'added' };
    },
    remove(accountId, { lemma, kind = 'word' }) {
      const item = items.mustFind(accountId, lemma, kind);
      db.prepare('DELETE FROM words WHERE id = ?').run(item.id);
      return { result: 'deleted' };
    },
  };
}
