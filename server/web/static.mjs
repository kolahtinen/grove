// Serves grove's pages and static files from public/, with no directory listing. Only the files the
// public pages need are public (FR-019).
import { readFile } from 'node:fs/promises';
import { join, normalize, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { HttpError } from './http.mjs';

const PUBLIC_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'public');

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
};

export const PAGES = [
  { path: '/', file: 'index.html', access: 'agreed' },
  { path: '/signin', file: 'signin.html', access: 'public' },
  { path: '/reset', file: 'reset.html', access: 'public' },
  { path: '/terms', file: 'terms.html', access: 'public' },
  { path: '/text', file: 'text.html', access: 'agreed' },
  { path: '/dictionary', file: 'dictionary.html', access: 'agreed' },
  { path: '/own', file: 'own.html', access: 'agreed' },
  { path: '/review', file: 'review.html', access: 'agreed' },
  { path: '/session', file: 'session.html', access: 'agreed' },
  { path: '/settings', file: 'settings.html', access: 'agreed' },
  { path: '/profile', file: 'account.html', access: 'agreed' },
  { path: '/leaves', file: 'leaves.html', access: 'agreed' },
  { path: '/progress', file: 'progress.html', access: 'agreed' },
  { path: '/start', file: 'start.html', access: 'agreed' },
  { path: '/credits', file: 'credits.html', access: 'public' },
  { path: '/how', file: 'how.html', access: 'public' },
];

// Files under /assets/ that the public pages need; every other asset needs a signed-in session.
export const PUBLIC_ASSETS = new Set(['grove.css', 'api.mjs', 'page.mjs', 'signin.mjs', 'reset.mjs', 'terms.mjs', 'logo.svg', 'how.mjs', 'grow.mjs', 'topbar.mjs', 'starting.mjs']);

async function sendFile(ctx, relative) {
  const full = normalize(join(PUBLIC_DIR, relative));
  if (!full.startsWith(PUBLIC_DIR + '/')) throw new HttpError(404, 'not_found', 'There is nothing here.');
  let data;
  try { data = await readFile(full); } catch { throw new HttpError(404, 'not_found', 'There is nothing here.'); }
  ctx.res.writeHead(200, {
    'content-type': TYPES[extname(full)] || 'application/octet-stream',
    'cache-control': relative.startsWith('fonts/') ? 'public, max-age=604800' : 'no-cache',
  });
  ctx.res.end(ctx.req.method === 'HEAD' ? undefined : data);
}

export function registerStaticRoutes(router) {
  for (const page of PAGES) {
    router.add({ method: 'GET', path: page.path, access: page.access, handler: (ctx) => sendFile(ctx, page.file) });
  }
  router.add({ method: 'GET', path: '/fonts/*', access: 'public', handler: (ctx) => sendFile(ctx, ctx.path.slice(1)) });
  router.add({
    method: 'GET',
    path: '/assets/*',
    access: 'public',
    // Assets other than PUBLIC_ASSETS are checked here, as the route covers a whole folder.
    handler: async (ctx) => {
      const name = ctx.path.slice('/assets/'.length);
      if (!PUBLIC_ASSETS.has(name) && !ctx.session) throw new HttpError(401, 'signed_out', 'Please sign in.');
      await sendFile(ctx, `assets/${name}`);
    },
  });
}
