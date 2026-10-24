// Splits a line into sentences at . ! ? or … followed by a space, a closing quote or the end;
// quotes stay with their sentence (research R2 step 1).

const CLOSERS = '”"»’\')';

export function splitSentences(line) {
  const text = String(line).trim();
  const out = [];
  let start = 0;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (ch !== '.' && ch !== '!' && ch !== '?' && ch !== '…') continue;
    let end = i + 1;
    while (end < text.length && (text[end] === '.' || text[end] === '!' || text[end] === '?' || text[end] === '…')) end += 1;
    while (end < text.length && CLOSERS.includes(text[end])) end += 1;
    // A full stop between digits (7.30) is not a sentence end.
    if (ch === '.' && /\d/.test(text[i - 1] || '') && /\d/.test(text[i + 1] || '')) continue;
    // ”Hej!” säger hon. — a small letter next means the sentence goes on.
    const next = text.slice(end).trimStart()[0];
    if (next && next !== next.toUpperCase() && /\p{L}/u.test(next)) continue;
    if (end === text.length || /\s/.test(text[end])) {
      const sentence = text.slice(start, end).trim();
      if (sentence) out.push(sentence);
      start = end;
      i = end - 1;
    }
  }
  const rest = text.slice(start).trim();
  if (rest) out.push(rest);
  return out;
}
