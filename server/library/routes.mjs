// The common library's routes (G-09 FR-916): the grove texts for a learner, and adding one to Your library.
import { sendJson } from '../web/http.mjs';
import { listLibrary, addToLibrary } from './library.mjs';

export function registerLibraryRoutes(router, { db, now = () => Date.now() }) {
  router.add({ method: 'GET', path: '/api/library', access: 'agreed', handler: (ctx) => sendJson(ctx.res, 200, listLibrary(db, ctx.account.id)) });
  router.add({
    method: 'POST', path: '/api/library/add', access: 'agreed',
    schema: { id: { type: 'string', min: 1, max: 20 } },
    handler: (ctx) => sendJson(ctx.res, 200, addToLibrary({ db, accountId: ctx.account.id, id: ctx.body.id, now })),
  });
}
