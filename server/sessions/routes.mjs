// G-09's session routes (contracts/http-api.md, addendum 006). All need an agreed session; the account
// comes from it (FR-914).
import { sendJson, HttpError } from '../web/http.mjs';
import { createSessions } from './store.mjs';
import { listTopics } from './topics.mjs';
import { TILES, SKILLS, LENGTHS } from './plan.mjs';

export function registerSessionRoutes(router, { db, now = () => Date.now() }) {
  const sessions = createSessions({ db, now });
  router.add({
    method: 'POST', path: '/api/sessions', access: 'agreed',
    schema: {
      kind: { type: 'enum', values: ['time', 'topic'] },
      tile: { type: 'enum', values: TILES },
      skill: { type: 'enum', values: SKILLS },
      minutes: { type: 'integer', min: Math.min(...LENGTHS), max: Math.max(...LENGTHS) },
      hardOnly: { type: 'boolean', optional: true },
      topic: { type: 'string', min: 0, max: 120, optional: true },
      voice: { type: 'boolean' },
      fill: { type: 'boolean', optional: true },
      asIs: { type: 'boolean', optional: true },
    },
    handler: (ctx) => {
      const b = ctx.body;
      // The fields each kind and tile take (others are refused, constitution 2.4).
      const wrong = !LENGTHS.includes(b.minutes)
        || ((b.topic !== undefined) !== (b.kind === 'topic'))
        || (b.kind === 'topic' && b.tile !== 'mix')
        || (b.hardOnly !== undefined && b.tile !== 'review');
      if (wrong) throw new HttpError(400, 'bad_request', 'That isn’t a session grove can plan.');
      sendJson(ctx.res, 200, { session: sessions.start(ctx.account.id, b) });
    },
  });
  router.add({
    method: 'POST', path: '/api/session/plan', access: 'agreed',
    schema: { sessionId: { type: 'integer', min: 1 }, fill: { type: 'boolean' } },
    handler: (ctx) => sendJson(ctx.res, 200, { session: sessions.answerOffer(ctx.account.id, ctx.body) }),
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
