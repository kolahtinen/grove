// G-09's session routes (contracts/http-api.md). All need an agreed session; the account comes from it
// (FR-914).
import { sendJson, HttpError } from '../web/http.mjs';
import { createSessions } from './store.mjs';
import { listTopics } from './topics.mjs';

// The fields each kind of session takes (others are refused, constitution 2.4).
const NEEDS = { time: ['minutes'], topic: ['minutes', 'topic'], skill: ['skill', 'form'], mode: ['mode'] };
const OPTIONAL = ['minutes', 'topic', 'skill', 'form', 'mode'];

export function registerSessionRoutes(router, { db, now = () => Date.now() }) {
  const sessions = createSessions({ db, now });
  router.add({
    method: 'POST', path: '/api/sessions', access: 'agreed',
    schema: {
      kind: { type: 'enum', values: Object.keys(NEEDS) },
      minutes: { type: 'integer', min: 3, max: 60, optional: true },
      topic: { type: 'string', min: 0, max: 120, optional: true },
      skill: { type: 'enum', values: ['reading', 'listening', 'words', 'grammar'], optional: true },
      form: { type: 'enum', values: ['short', 'medium', 'long'], optional: true },
      mode: { type: 'enum', values: ['discover', 'review', 'master'], optional: true },
      voice: { type: 'boolean' },
    },
    handler: (ctx) => {
      const needs = NEEDS[ctx.body.kind];
      const wrong = OPTIONAL.some((f) => (ctx.body[f] !== undefined) !== needs.includes(f));
      if (wrong) throw new HttpError(400, 'bad_request', 'That isn’t a session grove can plan.');
      sendJson(ctx.res, 200, { session: sessions.start(ctx.account.id, ctx.body) });
    },
  });
  router.add({
    method: 'GET', path: '/api/session', access: 'agreed',
    handler: (ctx) => {
      const raw = ctx.url.searchParams.get('id');
      if (raw === null) { sendJson(ctx.res, 200, { session: sessions.current(ctx.account.id) }); return; }
      const id = Number(raw);
      if (!Number.isSafeInteger(id) || id < 1) throw new HttpError(404, 'not_found', 'There is no such session.');
      sendJson(ctx.res, 200, { session: sessions.byId(ctx.account.id, id) });
    },
  });
  router.add({
    method: 'POST', path: '/api/session/next', access: 'agreed',
    schema: { sessionId: { type: 'integer', min: 1 }, index: { type: 'integer', min: 0, max: 200 } },
    handler: (ctx) => sendJson(ctx.res, 200, { session: sessions.next(ctx.account.id, ctx.body) }),
  });
  router.add({ method: 'GET', path: '/api/topics', access: 'agreed', handler: (ctx) => sendJson(ctx.res, 200, { topics: listTopics(db, ctx.account.id) }) });
}
