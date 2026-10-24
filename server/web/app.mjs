// Puts grove's routes together: health, static pages and files, and each module's API routes.
import { createRouter, createHandler } from './http.mjs';
import { createSessions, checkCsrf } from './session.mjs';
import { createGuard } from './guard.mjs';
import { registerStaticRoutes } from './static.mjs';
import { registerAccountRoutes } from '../accounts/routes.mjs';
import { registerTextRoutes } from '../texts/routes.mjs';
import { registerReadingRoutes } from '../reading/routes.mjs';

export function createApp({ config, db, seclog, firebase, now = () => Date.now() }) {
  const router = createRouter();
  const sessions = createSessions({ db, now });
  const guard = createGuard({ sessions });

  router.add({
    method: 'GET',
    path: '/health',
    access: 'public',
    handler: (ctx) => { ctx.res.writeHead(200, { 'content-type': 'text/plain; charset=utf-8' }); ctx.res.end('ok'); },
  });
  registerAccountRoutes(router, { config, db, seclog, firebase, sessions, now });
  registerTextRoutes(router, { db, now });
  registerReadingRoutes(router, { db, now });
  registerStaticRoutes(router);

  const handler = createHandler({ router, guard, csrf: checkCsrf, log: seclog.app });
  return { router, sessions, handler };
}
