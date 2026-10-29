// Discover's Words and Grammar cards (G-09 FR-928…FR-931; contracts/http-api.md): I know it and + Pick up,
// shown or met, and Report. Only an item ID in learning_items is accepted (T-24); each changes only the
// signed-in learner's data (FR-914) and passes the CSRF check (G-01 FR-022).
import { sendJson } from '../web/http.mjs';
import { answerItem, markSeen, reportItem, REPORT_REASONS } from './learning.mjs';

const item = { type: 'string', min: 1, max: 80 };

export function registerLearningRoutes(router, { db, now = () => Date.now() }) {
  router.add({
    method: 'POST', path: '/api/learning/answer', access: 'agreed',
    schema: { item, action: { type: 'enum', values: ['know', 'pick'] } },
    handler: (ctx) => sendJson(ctx.res, 200, answerItem({ db, accountId: ctx.account.id, id: ctx.body.item, action: ctx.body.action, now })),
  });
  router.add({
    method: 'POST', path: '/api/learning/seen', access: 'agreed',
    schema: { item },
    handler: (ctx) => { markSeen(db, ctx.account.id, ctx.body.item, now()); sendJson(ctx.res, 200, {}); },
  });
  router.add({
    method: 'POST', path: '/api/learning/report', access: 'agreed',
    schema: { item, reason: { type: 'enum', values: Object.keys(REPORT_REASONS) }, note: { type: 'string', min: 0, max: 200, optional: true } },
    handler: (ctx) => { reportItem(db, ctx.account.id, { id: ctx.body.item, reason: ctx.body.reason, note: ctx.body.note }, now()); sendJson(ctx.res, 200, {}); },
  });
}
