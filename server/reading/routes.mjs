// G-03's routes (contracts/http-api.md). All need an agreed session; the account comes from it (FR-319).
import { sendJson } from '../web/http.mjs';
import { buildReading } from './view.mjs';
import { buildPractice } from './practice.mjs';
import { createFlag, createReport, EXPLAIN_REASONS, REPORT_REASONS } from './flags.mjs';
import { buildDictionary } from './dictionary.mjs';
import { addOwnText, saveLeaf, meaningsPrompt } from './own.mjs';

const note = { type: 'string', min: 0, max: 200, optional: true };

export function registerReadingRoutes(router, { db, now = () => Date.now() }) {
  router.add({ method: 'GET', path: '/api/reading', access: 'agreed', handler: (ctx) => sendJson(ctx.res, 200, buildReading(db, ctx.account.id, ctx.url.searchParams.get('id'))) });
  router.add({ method: 'GET', path: '/api/practice', access: 'agreed', handler: (ctx) => sendJson(ctx.res, 200, buildPractice(db, ctx.account.id, ctx.url.searchParams.get('id'))) });
  router.add({ method: 'GET', path: '/api/dictionary', access: 'agreed', handler: (ctx) => sendJson(ctx.res, 200, buildDictionary(db, ctx.account.id)) });

  router.add({
    method: 'POST', path: '/api/settings', access: 'agreed',
    schema: { showTranslations: { type: 'boolean' } },
    handler: (ctx) => {
      db.prepare('INSERT OR IGNORE INTO learner_settings (account_id) VALUES (?)').run(ctx.account.id);
      db.prepare('UPDATE learner_settings SET show_translations = ? WHERE account_id = ?').run(ctx.body.showTranslations ? 1 : 0, ctx.account.id);
      sendJson(ctx.res, 200, { showTranslations: ctx.body.showTranslations });
    },
  });

  router.add({
    method: 'POST', path: '/api/explain', access: 'agreed',
    schema: { sentenceId: { type: 'integer', min: 1 }, form: { type: 'string', min: 1, max: 80 }, reason: { type: 'enum', values: Object.keys(EXPLAIN_REASONS) }, note },
    handler: (ctx) => sendJson(ctx.res, 200, { code: createFlag(db, ctx.account.id, ctx.body, now()) }),
  });

  router.add({
    method: 'POST', path: '/api/report', access: 'agreed',
    schema: {
      textId: { type: 'integer', min: 1 },
      questionPosition: { type: 'integer', min: 0, max: 5, optional: true },
      linePosition: { type: 'integer', min: 0, max: 59, optional: true },
      reason: { type: 'enum', values: Object.keys(REPORT_REASONS) },
      note,
    },
    handler: (ctx) => sendJson(ctx.res, 200, { code: createReport(db, ctx.account.id, ctx.body, now()) }),
  });

  router.add({
    method: 'POST', path: '/api/own-text', access: 'agreed',
    schema: { title: { type: 'string', min: 1, max: 120 }, text: { type: 'string', min: 1, max: 20000 } },
    handler: (ctx) => sendJson(ctx.res, 200, { id: addOwnText(db, ctx.account.id, ctx.body, now()) }),
  });

  router.add({
    method: 'POST', path: '/api/leaf', access: 'agreed',
    schema: { textId: { type: 'integer', min: 1 }, form: { type: 'string', min: 1, max: 80 } },
    handler: (ctx) => { saveLeaf(db, ctx.account.id, ctx.body, now()); sendJson(ctx.res, 200, { result: 'saved' }); },
  });

  router.add({
    method: 'POST', path: '/api/meanings-prompt', access: 'agreed', schema: {},
    handler: (ctx) => sendJson(ctx.res, 200, meaningsPrompt(db, ctx.account.id, now())),
  });
}
