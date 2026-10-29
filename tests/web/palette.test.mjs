import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../../public/assets/grove.css', import.meta.url), 'utf8');

// The custom properties of the first `:root { … }` (dark) and of the one inside the light media query.
function tokens(block) {
  return Object.fromEntries([...block.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
}
const darkBlock = css.slice(css.indexOf(':root {'), css.indexOf('@media (prefers-color-scheme: light)'));
const lightStart = css.indexOf('@media (prefers-color-scheme: light)');
const lightBlock = css.slice(lightStart, css.indexOf('\n}\n', lightStart));
const LOOKS = { dark: tokens(darkBlock), light: tokens(lightBlock) };

function luminance(hex) {
  const n = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function ratio(a, b) {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

// Text colour on background, the ratio it needs (FR-913: 4.5:1; 3:1 for large text and chips).
const PAIRS = [
  ['--ink', '--bg', 4.5], ['--ink', '--card', 4.5], ['--ink', '--card2', 4.5],
  ['--muted', '--card', 4.5], ['--muted', '--card2', 4.5],
  ['--link', '--card', 4.5], ['--link', '--card2', 4.5], ['--muted-strong', '--card', 4.5],
  ['--onbanner', '--banner', 4.5], ['--onacc', '--accent', 4.5], ['--onacc', '--accent2', 4.5],
  ['--cw', '--card', 4.5], ['--ok', '--card', 4.5], ['--bad', '--card', 4.5], ['--amber', '--card', 4.5],
  ['--discover', '--card', 3], ['--review', '--card', 3], ['--master', '--card', 3],
];
// White on the light gradient's end (#5E8A66) falls short (found by the contrast test, T804); FR-913
// proposes #577F5E, for the owner to confirm. PD-12's adjusted colours pass (question-pages/76, 12).
const PENDING = new Set(['light --onacc --accent2']);

for (const [look, t] of Object.entries(LOOKS)) {
  for (const [fg, bg, need] of PAIRS) {
    const key = `${look} ${fg} ${bg}`;
    const options = PENDING.has(key) ? { todo: 'FR-913 proposes #577F5E for the light gradient end; owner to confirm' } : {};
    test(`FR-913 RQ-426 RQ-306: ${look}, ${fg} on ${bg} meets ${need}:1`, options, () => {
      assert.match(t[fg] ?? '', /^#[0-9A-F]{6}$/i, `${look} ${fg}`);
      assert.match(t[bg] ?? '', /^#[0-9A-F]{6}$/i, `${look} ${bg}`);
      const r = ratio(t[fg], t[bg]);
      assert.ok(r >= need, `${key}: ${r.toFixed(2)}`);
    });
  }
}

test('FR-913 RQ-426: no rule outside the token blocks uses a colour literal', () => {
  const rest = css.slice(0, css.indexOf(':root {')) + css.slice(css.indexOf('\n}\n', lightStart) + 3);
  const literals = rest.replace(/\/\*[\s\S]*?\*\//g, '').match(/#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(/gi) ?? [];
  assert.deepEqual(literals, []);
});
