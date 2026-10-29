// Builds grove's learning content for the build (G-09 FR-930; B-26, question-pages/89): reads the approved
// files in content/learning/, checks every item and stops on a problem, and writes
// server/learning/learning-content.json, which grove imports at start-up. Nothing grove runs reads content/.
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildContent } from '../server/learning/content.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const { items, problems } = buildContent(join(root, 'content/learning'));
if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
writeFileSync(join(root, 'server/learning/learning-content.json'), `${JSON.stringify(items, null, 1)}\n`);
const count = (type) => items.filter((x) => x.type === type).length;
console.log(`${count('pattern')} patterns, ${count('phrase')} phrases, ${count('word')} words`);
