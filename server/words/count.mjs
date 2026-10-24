// Counts the new items of a sentence against the learner's ground (FR-213, research R2): names and
// numbers never count; fixed phrases count as one item; known forms, regular inflections and
// compounds of known words are known.
import { tokenize } from './tokens.mjs';
import { regularLemma, isCompound } from './inflect.mjs';
import { IRREGULAR } from './irregular.mjs';

// ground: Set of known dictionary forms; forms: Map form → [dictionary forms]; phrases: [{words, lemma, known}];
// names: Set of lower-cased names.
export function createCounter({ ground, forms = new Map(), phrases = [], names = new Set() }) {
  const lemmaKnown = (lemma) => ground.has(lemma);
  const cache = new Map();

  function isKnownWord(word) {
    if (cache.has(word)) return cache.get(word);
    let known = ground.has(word)
      || (forms.get(word) || []).some(lemmaKnown)
      || (IRREGULAR.get(word) || []).some(lemmaKnown)
      || regularLemma(word, lemmaKnown) !== null;
    if (!known) {
      known = isCompound(word, lemmaKnown, (part) => ground.has(part) || (forms.get(part) || []).some(lemmaKnown)
        || (IRREGULAR.get(part) || []).some(lemmaKnown) || regularLemma(part, lemmaKnown) !== null);
    }
    cache.set(word, known);
    return known;
  }

  const sortedPhrases = [...phrases].filter((p) => p.words.length > 1).sort((a, b) => b.words.length - a.words.length);

  return {
    isKnownWord,
    countSentence(sentence) {
      const tokens = tokenize(sentence);
      const used = new Array(tokens.length).fill(false);
      const items = [];
      let total = 0;
      let known = 0;

      for (const phrase of sortedPhrases) {
        for (let i = 0; i + phrase.words.length <= tokens.length; i += 1) {
          if (used.slice(i, i + phrase.words.length).some(Boolean)) continue;
          if (phrase.words.every((w, k) => tokens[i + k].word === w)) {
            for (let k = 0; k < phrase.words.length; k += 1) used[i + k] = true;
            total += 1;
            if (phrase.known) known += 1;
            else items.push({ text: phrase.lemma, kind: 'phrase' });
          }
        }
      }

      tokens.forEach((token, i) => {
        if (used[i]) return;
        if (names.has(token.word)) return;
        // A capitalised word that doesn't start the sentence is a name.
        if (token.capitalised && i > 0) return;
        total += 1;
        if (isKnownWord(token.word)) known += 1;
        else items.push({ text: token.word, kind: 'word' });
      });
      return { total, known, items };
    },
  };
}
