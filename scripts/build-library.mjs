// Builds grove's library texts for the build (G-09 FR-916; addendum 005, RQ-438): reads the approved
// texts in content/library/texts/<level>.json (B-11), checks each with G-02's answer format, and writes
// server/library/grove-texts.json, which grove imports at start-up. Nothing grove runs reads content/.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateAnswer } from '../server/texts/schema.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dir = join(root, 'content/library/texts');
const out = [];
for (const file of readdirSync(dir).filter((f) => f.endsWith('.json')).sort()) {
  for (const t of JSON.parse(readFileSync(join(dir, file), 'utf8')).texts) {
    const answer = { part: `LIB-${t.id}`, texts: [{ kind: t.kind, title: t.title, lines: t.lines, questions: t.questions }], new_words: [], new_phrases: [], inflections: [], names: t.names ?? [] };
    const checked = validateAnswer(answer);
    if (!checked.ok) throw new Error(`${t.id}: ${checked.problems.join('; ')}`);
    out.push({ id: t.id, level: t.level, topic: t.topic, form: t.form, kind: t.kind, title: t.title, names: t.names ?? [], lines: t.lines, questions: t.questions });
  }
}
writeFileSync(join(root, 'server/library/grove-texts.json'), `${JSON.stringify(out, null, 1)}\n`);
console.log(`${out.length} grove texts`);
