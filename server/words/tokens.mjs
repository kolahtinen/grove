// Word tokens of a sentence: Unicode letters (so å ä ö work), lower-cased; digits are skipped
// (research R2 step 2).

const WORD = /\p{L}+(?:[-’']\p{L}+)*/gu;

export function tokenize(sentence) {
  const tokens = [];
  for (const match of String(sentence).matchAll(WORD)) {
    const raw = match[0];
    tokens.push({ raw, word: raw.toLowerCase(), index: tokens.length, capitalised: raw[0] !== raw[0].toLowerCase() });
  }
  return tokens;
}
