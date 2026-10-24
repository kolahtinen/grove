// The AI answer format and its limits (FR-205, contracts/http-api.md). Strict: unknown fields are
// problems, except the harmless ones the X-03 answers added, which are dropped (research R3).

const HARMLESS = new Set(['kind', 'series', 'episode', 'speaker', 'nodes']);

function checker() {
  const problems = [];
  const note = (where, what) => { if (problems.length < 20) problems.push(`${where}: ${what}`); };

  function str(value, where, max, { min = 1 } = {}) {
    if (typeof value !== 'string') { note(where, 'should be text'); return null; }
    const v = value.trim();
    if (v.length < min) { note(where, 'is empty'); return null; }
    if (v.length > max) { note(where, `is longer than ${max} characters`); return null; }
    return v;
  }

  function obj(value, where, fields) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) { note(where, 'should be an object'); return null; }
    for (const key of Object.keys(value)) {
      if (!Object.hasOwn(fields, key) && !HARMLESS.has(key)) note(where, `has an unknown field "${key}"`);
    }
    const out = {};
    for (const [key, rule] of Object.entries(fields)) {
      if (value[key] === undefined || value[key] === null) {
        if (rule.optional) { if (rule.default !== undefined) out[key] = rule.default; continue; }
        note(where, `is missing "${key}"`);
        continue;
      }
      out[key] = rule.check(value[key], `${where} → ${key}`);
    }
    return out;
  }

  function arr(value, where, { min = 0, max }, each) {
    if (!Array.isArray(value)) { note(where, 'should be a list'); return []; }
    if (value.length < min) note(where, `needs at least ${min}`);
    if (value.length > max) { note(where, `has more than ${max}`); return []; }
    return value.map((item, i) => each(item, `${where} ${i + 1}`));
  }

  return { problems, str, obj, arr, note };
}

export function validateAnswer(input) {
  const c = checker();
  const text = (t, where) => {
    const v = c.obj(t, where, {
      title: { check: (x, w) => c.str(x, w, 120) },
      lines: { check: (x, w) => c.arr(x, w, { min: 1, max: 60 }, (line, lw) => c.obj(line, lw, {
        sv: { check: (y, yw) => c.str(y, yw, 400) },
        en: { check: (y, yw) => c.str(y, yw, 400) },
      })) },
      questions: { optional: true, default: [], check: (x, w) => c.arr(x, w, { max: 6 }, (q, qw) => {
        const out = c.obj(q, qw, {
          q: { check: (y, yw) => c.str(y, yw, 300) },
          options: { check: (y, yw) => c.arr(y, yw, { min: 2, max: 3 }, (o, ow) => c.str(o, ow, 200)) },
          answer: { check: (y, yw) => (Number.isInteger(y) ? y : (c.note(yw, 'should be a whole number'), null)) },
        });
        if (out && Array.isArray(out.options) && Number.isInteger(out.answer) && (out.answer < 0 || out.answer >= out.options.length)) {
          c.note(qw, 'answer points to an option that does not exist');
        }
        return out;
      }) },
    });
    return v;
  };
  const entry = (fields) => (x, w) => c.arr(x, w, { max: 200 }, (e, ew) => c.obj(e, ew, fields));
  const s80 = { check: (y, yw) => c.str(y, yw, 80) };
  const value = c.obj(input, 'The answer', {
    part: { check: (x, w) => c.str(x, w, 20) },
    texts: { check: (x, w) => c.arr(x, w, { min: 1, max: 4 }, text) },
    new_words: { optional: true, default: [], check: entry({ form: s80, lemma: s80, en: { check: (y, yw) => c.str(y, yw, 200) }, explain_sv: { optional: true, check: (y, yw) => c.str(y, yw, 300) } }) },
    new_phrases: { optional: true, default: [], check: entry({ sv: s80, en: { check: (y, yw) => c.str(y, yw, 200) }, explain_sv: { optional: true, check: (y, yw) => c.str(y, yw, 300) } }) },
    inflections: { optional: true, default: [], check: entry({ form: s80, lemma: s80 }) },
    names: { optional: true, default: [], check: (x, w) => c.arr(x, w, { max: 200 }, (n, nw) => c.str(n, nw, 80)) },
    starter_words: { optional: true, default: [], check: entry({ lemma: s80, en: { check: (y, yw) => c.str(y, yw, 200) }, explain_sv: { optional: true, check: (y, yw) => c.str(y, yw, 300) } }) },
  });
  return c.problems.length ? { ok: false, problems: c.problems } : { ok: true, value };
}

export function validateMeanings(input) {
  const c = checker();
  const s80 = { check: (y, yw) => c.str(y, yw, 80) };
  const value = c.obj(input, 'The answer', {
    meanings: { check: (x, w) => c.arr(x, w, { min: 1, max: 200 }, (e, ew) => c.obj(e, ew, {
      form: s80, lemma: s80, en: { check: (y, yw) => c.str(y, yw, 200) }, explain_sv: { optional: true, check: (y, yw) => c.str(y, yw, 300) },
    })) },
  });
  return c.problems.length ? { ok: false, problems: c.problems } : { ok: true, value };
}
