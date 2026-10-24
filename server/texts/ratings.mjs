// Ratings move the target share of known words (FR-218, research R7).

export const RATINGS = ['almost_nothing', 'a_little', 'about_half', 'most', 'everything'];
export const UNDERSTOOD = new Set(['most', 'everything']);
export const SHARE = { start: 95, min: 93, max: 98 };

// The settings after one rating: { target_share, shorter, high_streak }.
export function applyRating(settings, value) {
  let share = settings.target_share;
  let shorter = settings.shorter;
  let streak = settings.high_streak;
  if (value === 'almost_nothing') { share += 2; shorter = 1; streak = 0; }
  else if (value === 'a_little') { share += 1; shorter = 1; streak = 0; }
  else if (value === 'about_half') { streak = 0; }
  else if (UNDERSTOOD.has(value)) {
    streak += 1;
    if (streak >= 3) { share -= 1; streak = 0; }
  }
  share = Math.min(SHARE.max, Math.max(SHARE.min, share));
  return { target_share: share, shorter, high_streak: streak };
}

export const LABELS = { almost_nothing: 'almost nothing', a_little: 'a little', about_half: 'about half', most: 'most', everything: 'everything' };
