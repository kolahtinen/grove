// A text's lines of tappable words (G-03 FR-301, FR-304, FR-320; G-04 FR-413), shared by the reading page
// and a text inside a session (G-09 FR-933). A word keeps the punctuation right before and after it on its
// line in one unbreakable group; a tap opens the word menu. All text via textContent.

const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; };

// Colour classes (FR-413): To remember, and the marks a word had when it fell (To read and both only for
// words that fell before addendum 003). No mark for a form of more than one word (FR-306).
export function markClass(tok) {
  if (tok.marks?.remember) return ' m-remember';
  if (tok.fell) return ` f-${tok.fell}`;
  return '';
}

// Punctuation stuck to the word before it, up to the first space; the rest.
function splitTrailing(text) {
  const at = text.search(/\s/);
  return at === -1 ? [text, ''] : [text.slice(0, at), text.slice(at)];
}

// Renders `data.lines` into the list `list`; with `tappable` false, words aren't buttons. `onWord(token,
// sentence, line, button)` runs on a tap.
export function renderLines(list, data, { tappable = true, onWord } = {}) {
  list.replaceChildren();
  for (const line of data.lines) {
    const li = el('li', line.reported ? 'reported' : '');
    const sv = el('p', 'sv passage');
    for (const s of line.sentences) {
      const span = el('span', 'sentence');
      span.dataset.sentence = s.id;
      let group = null;
      let lead = '';
      s.tokens.forEach((tok, k) => {
        if (!tok.word) {
          const next = s.tokens[k + 1];
          if (group && !/^\s/.test(tok.t)) {
            const [stuck, rest] = splitTrailing(tok.t);
            group.append(document.createTextNode(stuck));
            if (rest) { span.append(document.createTextNode(rest)); group = null; }
          } else if (next?.word && !/\s$/.test(tok.t)) {
            const m = tok.t.match(/^(.*\s)?(\S*)$/s);
            if (m[1]) span.append(document.createTextNode(m[1]));
            lead = m[2];
            group = null;
          } else {
            span.append(document.createTextNode(tok.t));
            group = null;
          }
          return;
        }
        const w = el(tappable ? 'button' : 'span', `w ${tok.status}${tok.patterns?.length ? ' pattern' : ''}${markClass(tok)}`, tok.t);
        if (tappable) {
          w.type = 'button';
          w.addEventListener('click', () => onWord?.(tok, s, line, w));
        }
        group = el('span', 'nb');
        if (lead) { group.append(document.createTextNode(lead)); lead = ''; }
        group.append(w);
        span.append(group);
      });
      sv.append(span, document.createTextNode(' '));
    }
    li.append(sv);
    list.append(li);
  }
}

// Every sentence of the text in order (listening plays them one by one).
export const sentencesOf = (data) => data.lines.flatMap((l) => l.sentences);
