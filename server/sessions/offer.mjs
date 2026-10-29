// The short-session offer's fill bars (G-09 FR-920, FR-923; addendum 006): the minutes of each kind
// missing at the offer, and those of the learner's texts of that kind created since it, wherever they
// were added, at the planner's durations (R-34). Also read by G-02 (FR-202, B-23): the kinds a package
// started from the offer asks for.
import { readInventory } from './inventory.mjs';
import { durationsFor, textSeconds } from './durations.mjs';

export function offerState(db, accountId, offer) {
  const inventory = readInventory(db, accountId);
  const durations = durationsFor(inventory.belowB1);
  const added = { reading: 0, listening: 0 };
  for (const t of inventory.texts) if (t.createdAt >= offer.at) added[t.kind] += textSeconds(t, durations);
  const needs = Object.keys(offer.missing).filter((k) => offer.missing[k] > 0);
  const missing = { reading: Math.ceil((offer.missing.reading ?? 0) / 60), listening: Math.ceil((offer.missing.listening ?? 0) / 60) };
  const addedMinutes = { reading: Math.floor(added.reading / 60), listening: Math.floor(added.listening / 60) };
  return { needs, missing, added: addedMinutes, full: needs.every((k) => added[k] >= offer.missing[k]), notFull: needs.filter((k) => added[k] < offer.missing[k]) };
}

// The kinds the learner's going session still needs from its offer; none without an offer.
export function kindsStillNeeded(db, accountId) {
  const row = db.prepare("SELECT offer FROM practice_sessions WHERE account_id = ? AND status = 'going' AND offer IS NOT NULL").get(accountId);
  return row ? offerState(db, accountId, JSON.parse(row.offer)).notFull : [];
}
