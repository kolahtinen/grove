// The spacing rule (FR-403…FR-405; research R1): strength 2^(−days/gap); due at ≤ 0.5, fading below
// 0.2; right → ×2.5 from 1 day, falls once the gap is 4 days or more; wrong → halve, at least 0.5.

const DAY = 24 * 60 * 60 * 1000;
export const START_GAP = 1;
export const FALL_GAP = 4;
export const MIN_GAP = 0.5;
export const MASTER_GAP = 2;

export function strength(item, now) {
  if (!item.drilled) return null;
  const days = Math.max(0, now - (item.last_review_at ?? now)) / DAY;
  return 2 ** (-days / item.gap_days);
}

export const isDue = (item, now) => item.drilled === 1 && strength(item, now) <= 0.5;
export const isFading = (item, now) => item.drilled === 1 && strength(item, now) < 0.2;

// When an item becomes due: last review + one gap.
export const dueAt = (item) => (item.drilled ? (item.last_review_at ?? 0) + item.gap_days * DAY : null);

export function answer(item, right) {
  if (right) {
    if (item.gap_days >= FALL_GAP) return { gap: item.gap_days, fell: true };
    return { gap: item.gap_days * 2.5, fell: false };
  }
  return { gap: Math.max(MIN_GAP, item.gap_days / 2), fell: false };
}
