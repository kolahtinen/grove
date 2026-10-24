// Copies Zen Kaku Gothic New (OFL-1.1, weights 400/500/700, woff2 only) into public/fonts so grove
// serves its own fonts and the page contacts no other host (FR-024, FR-027, C-12).
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(root, 'node_modules', '@fontsource', 'zen-kaku-gothic-new');
const target = join(root, 'public', 'fonts');

if (!existsSync(source)) {
  console.log('copy-fonts: @fontsource/zen-kaku-gothic-new is not installed; nothing copied');
  process.exit(0);
}

mkdirSync(join(target, 'files'), { recursive: true });
const faces = [];
for (const weight of [400, 500, 700]) {
  const css = readFileSync(join(source, `${weight}.css`), 'utf8');
  faces.push(css.replace(/src:\s*url\(\.\/files\/([\w.-]+\.woff2)\)\s*format\('woff2'\)[^;]*;/g, (_, file) => {
    copyFileSync(join(source, 'files', file), join(target, 'files', file));
    return `src: url(/fonts/files/${file}) format('woff2');`;
  }));
}
writeFileSync(join(target, 'fonts.css'), faces.join('\n'));
copyFileSync(join(source, 'LICENSE'), join(target, 'OFL.txt'));
console.log('copy-fonts: copied to public/fonts');
