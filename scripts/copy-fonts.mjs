// Copies Zen Kaku Gothic New (OFL-1.1) into public/fonts so grove serves its own fonts (C-12, FR-027).
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pkg = join(root, 'node_modules', '@fontsource', 'zen-kaku-gothic-new');
const out = join(root, 'public', 'fonts');

if (!existsSync(pkg)) {
  console.log('copy-fonts: font package not installed, skipping');
  process.exit(0);
}
mkdirSync(join(out, 'files'), { recursive: true });

let css = '';
for (const weight of [400, 500, 700]) {
  const source = readFileSync(join(pkg, `${weight}.css`), 'utf8');
  css += source.replace(/src: url\(\.\/files\/([^)]+\.woff2)\) format\('woff2'\)[^;]*;/g, (_, file) => {
    copyFileSync(join(pkg, 'files', file), join(out, 'files', file));
    return `src: url(/fonts/files/${file}) format('woff2');`;
  });
}
writeFileSync(join(out, 'fonts.css'), css);
copyFileSync(join(pkg, 'LICENSE'), join(out, 'OFL.txt'));
console.log('copy-fonts: fonts copied to public/fonts');
