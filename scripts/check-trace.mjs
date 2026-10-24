// Constitution 1.4: every spec requirement has at least one test named after it.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function walk(dir, match, found = []) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules') continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, match, found);
    else if (match(name)) found.push(path);
  }
  return found;
}

const required = new Set();
for (const spec of walk(join(root, 'specs'), (n) => n === 'spec.md')) {
  for (const line of readFileSync(spec, 'utf8').split('\n')) {
    const m = line.match(/^- \*\*(FR-\d{3})\*\*(.*)/);
    if (m && !m[2].includes('*Withdrawn*')) required.add(m[1]);
  }
}

const tested = new Set();
for (const file of walk(join(root, 'tests'), (n) => n.endsWith('.test.mjs') || n.endsWith('.spec.mjs'))) {
  const text = readFileSync(file, 'utf8');
  for (const m of text.matchAll(/\b(?:test|it)\(\s*['"`]((?:FR-\d{3}[ ,]+)+)/g)) {
    for (const id of m[1].match(/FR-\d{3}/g)) tested.add(id);
  }
}

const missing = [...required].filter((id) => !tested.has(id)).sort();
if (missing.length) {
  console.error(`check-trace: no test for ${missing.join(', ')}`);
  process.exit(1);
}
console.log(`check-trace: all ${required.size} requirements have tests`);
