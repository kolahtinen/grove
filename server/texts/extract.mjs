// Finds the JSON block in a pasted AI answer (FR-205, research R3): fenced blocks first, then the
// text from the first { to the last }. Reports a cut-off answer or broken JSON with a line number.

function candidates(text) {
  const out = [];
  for (const m of text.matchAll(/```[a-zA-Z]*[ \t]*\n([\s\S]*?)```/g)) out.push({ source: m[1], offset: m.index + m[0].indexOf(m[1]) });
  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  if (first >= 0 && last > first) out.push({ source: text.slice(first, last + 1), offset: first });
  return out;
}

function looksCutOff(text) {
  const start = text.indexOf('{');
  if (start < 0) return false;
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (const ch of text.slice(start)) {
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === '"') inString = false;
    } else if (ch === '"') inString = true;
    else if (ch === '{' || ch === '[') depth += 1;
    else if (ch === '}' || ch === ']') depth -= 1;
  }
  return inString || depth > 0;
}

// The line of a JSON error: from "position N" when the engine gives it, else by finding the
// snippet Node 22 quotes ('Unexpected token ',', ..."s": [1, 2,,]' is not valid JSON').
function lineOf(source, error, before = '') {
  const shift = before.split('\n').length - 1;
  const message = String(error?.message);
  const pos = Number(message.match(/position (\d+)/)?.[1]);
  if (Number.isFinite(pos)) return shift + source.slice(0, pos).split('\n').length;
  const snippet = message.match(/, (?:\.\.\.)?"([\s\S]*)"(?:\.\.\.)? is not valid JSON$/)?.[1];
  if (!snippet) return null;
  const at = source.indexOf(snippet.replace(/\.\.\.$/, ''));
  return at < 0 ? null : shift + source.slice(0, at).split('\n').length;
}

export function extractJson(pasted, { requireField = 'texts' } = {}) {
  const text = String(pasted);
  let firstError = null;
  for (const { source: candidate, offset } of candidates(text)) {
    try {
      const value = JSON.parse(candidate);
      if (value && typeof value === 'object' && !Array.isArray(value) && Object.hasOwn(value, requireField)) return { ok: true, value };
    } catch (error) {
      if (!firstError) firstError = { source: candidate, error, before: text.slice(0, offset) };
    }
  }
  if (looksCutOff(text.replace(/```[a-zA-Z]*/g, ''))) return { ok: false, problem: 'cut_off' };
  if (firstError) return { ok: false, problem: 'not_json', line: lineOf(firstError.source, firstError.error, firstError.before) };
  return { ok: false, problem: 'no_json' };
}
