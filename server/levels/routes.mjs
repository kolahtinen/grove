// G-06's routes (contracts/http-api.md).
import { sendJson } from '../web/http.mjs';
import { createStart, LEVELS } from './start.mjs';

export function registerLevelRoutes(router, { db, now = () => Date.now() }) {
  const start = createStart({ db, now });
  router.add({ method: 'GET', path: '/api/start/sample', access: 'agreed', handler: (ctx) => sendJson(ctx.res, 200, start.sample(ctx.url.searchParams.get('level'))) });
  router.add({
    method: 'POST', path: '/api/start', access: 'agreed',
    schema: { level: { type: 'enum', values: [...LEVELS, 'beginner'] }, unknown: { type: 'list', max: 30, item: { type: 'string', min: 1, max: 80 } } },
    handler: (ctx) => sendJson(ctx.res, 200, start.apply(ctx.account.id, ctx.body)),
  });
  // FR-605: the starting level page was opened, so Home no longer sends the learner there.
  router.add({ method: 'POST', path: '/api/start/offered', access: 'agreed', schema: {}, handler: (ctx) => sendJson(ctx.res, 200, start.offered(ctx.account.id)) });
}
