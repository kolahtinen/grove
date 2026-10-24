// The marking step after a text (FR-401, FR-402; question-pages/59): the text's unmarked leaves; marked
// ones are drilled (To read and/or To remember), the rest fall to the ground.
import { HttpError } from '../web/http.mjs';
import { transaction } from '../store/db.mjs';
import { createItems } from './items.mjs';

export function unmarkedOf(db, accountId, textId) {
  const items = new Set();
  for (const s of db.prepare('SELECT new_items FROM sentences WHERE text_id = ?').all(textId)) for (const i of JSON.parse(s.new_items)) items.add(i);
  const rows = db.prepare(`SELECT id, lemma, kind, en FROM words WHERE account_id = ? AND state = 'leaf' AND drilled = 0
    AND kind IN ('word', 'phrase') AND (source_text_id = ? OR lemma IN (SELECT value FROM json_each(?))) ORDER BY id`).all(accountId, textId, JSON.stringify([...items]));
  return rows;
}

export function createMarking({ db, now = () => Date.now() }) {
  const items = createItems({ db, now });
  const ownText = (accountId, textId) => {
    const t = db.prepare('SELECT id FROM texts WHERE id = ? AND account_id = ?').get(Number(textId), accountId);
    if (!t) throw new HttpError(404, 'not_found', 'There is no such text.');
    return t;
  };
  return {
    list(accountId, textId) {
      const t = ownText(accountId, textId);
      return { words: unmarkedOf(db, accountId, t.id).map(({ lemma, kind, en }) => ({ lemma, kind, en })) };
    },
    apply(accountId, textId, marks) {
      const t = ownText(accountId, textId);
      const unmarked = new Map(unmarkedOf(db, accountId, t.id).map((w) => [`${w.kind}:${w.lemma}`, w]));
      let drilled = 0;
      let fell = 0;
      transaction(db, () => {
        for (const m of marks) {
          const item = unmarked.get(`${m.kind || 'word'}:${m.lemma.toLowerCase()}`);
          if (!item) continue;
          const full = db.prepare('SELECT * FROM words WHERE id = ?').get(item.id);
          if (m.read || m.remember) { items.setMarks(full, m); drilled += 1; } else { items.fall(full); fell += 1; }
        }
      });
      return { drilled, fell };
    },
  };
}
