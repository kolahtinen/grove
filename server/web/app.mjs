// Puts grove's routes together: health, static pages and files, and each module's API routes.
import { createRouter, createHandler, sendJson } from './http.mjs';
import { createSessions, checkCsrf } from './session.mjs';
import { createGuard } from './guard.mjs';
import { registerStaticRoutes } from './static.mjs';
import { registerAccountRoutes } from '../accounts/routes.mjs';
import { registerTextRoutes } from '../texts/routes.mjs';
import { registerReadingRoutes } from '../reading/routes.mjs';
import { registerDrillRoutes } from '../drill/routes.mjs';
import { registerLevelRoutes } from '../levels/routes.mjs';
import { registerSessionRoutes } from '../sessions/routes.mjs';

export function createApp({ config, db, seclog, firebase, now = () => Date.now(), startup = null }) {
  const router = createRouter();
  const sessions = createSessions({ db, now });
  const guard = createGuard({ sessions });

  router.add({
    method: 'GET',
    path: '/health',
    access: 'public',
    handler: (ctx) => { ctx.res.writeHead(200, { 'content-type': 'text/plain; charset=utf-8' }); ctx.res.end('ok'); },
  });
  // How far start-up has got, at any time, for the loading page (FR-032).
  router.add({
    method: 'GET',
    path: '/api/starting',
    access: 'public',
    handler: (ctx) => sendJson(ctx.res, 200, startup ? startup.state() : { ready: true, progress: 1 }),
  });
  registerAccountRoutes(router, { config, db, seclog, firebase, sessions, now });
  registerTextRoutes(router, { db, sizes: config.sizes, now });
  registerReadingRoutes(router, { db, sizes: config.sizes, now });
  registerDrillRoutes(router, { db, now });
  registerLevelRoutes(router, { db, now });
  registerSessionRoutes(router, { db, now });
  registerStaticRoutes(router);

  const handler = createHandler({ router, guard, csrf: checkCsrf, log: seclog.app, startup });
  return { router, sessions, handler };
}
