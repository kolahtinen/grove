// Regular Swedish inflections and compounds of known words (research R2 steps 5–6). Irregular forms
// come from the AI's inflections list or a meanings answer instead.

// Longest first, so 'arna' is tried before 'na' and 'a'.
export const ENDINGS = ['arna', 'orna', 'erna', 'ande', 'ende', 'aste', 'dde', 'heten', 'ast', 'are', 'het', 'ens', 'ets',
  'en', 'et', 'er', 'ar', 'or', 'na', 'de', 'te', 'dd', 'tt', 'r', 't', 's', 'a', 'n', 'e'];

// The dictionary form a regularly inflected form comes from, or null.
export function regularLemma(form, isKnown) {
  for (const ending of ENDINGS) {
    if (!form.endsWith(ending) || form.length - ending.length < 2) continue;
    const stem = form.slice(0, -ending.length);
    const candidates = [stem, `${stem}a`, `${stem}e`];
    // A doubled final consonant before the ending (glad → gladdare is not Swedish, but vän → vänner is).
    if (stem.length > 2 && stem.at(-1) === stem.at(-2)) candidates.push(stem.slice(0, -1));
    // A verb whose dictionary form doubles the last consonant (glömt → glömma).
    if (/[bcdfghjklmnpqrstvwxz]$/.test(stem)) candidates.push(`${stem}${stem.at(-1)}a`);
    // Nouns ending in -e or -a lose it before the plural (pojke → pojkar, flicka → flickor).
    for (const c of candidates) if (isKnown(c)) return c;
  }
  return null;
}

// True when a form of 6+ letters is a ground word (optionally + joining s) followed by a known part
// of 4+ letters.
export function isCompound(form, isDictionaryForm, isKnownForm) {
  if (form.length < 6) return false;
  for (let i = 2; i <= form.length - 4; i += 1) {
    const head = form.slice(0, i);
    const tail = form.slice(i);
    if (!isKnownForm(tail)) continue;
    if (isDictionaryForm(head) || (head.endsWith('s') && head.length > 2 && isDictionaryForm(head.slice(0, -1)))) return true;
  }
  return false;
}
