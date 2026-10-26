// G-04's routes (contracts/http-api.md). All need an agreed session; the account comes from it (FR-419).
import { sendJson } from '../web/http.mjs';
import { KINDS } from './items.mjs';
import { createMarking } from './marking.mjs';
import { createReview } from './review.mjs';
import { createMarks } from './marks.mjs';
import { createLeaves } from './leaves.mjs';
import { createProgress, computeLevel } from './progress.mjs';
import { createStart } from '../levels/start.mjs';

const lemma = { type: 'string', min: 1, max: 80 };
const kind = { type: 'enum', values: KINDS, optional: true };

export function registerDrillRoutes(router, { db, now = () => Date.now() }) {
  const marking = createMarking({ db, now });
  const review = createReview({ db, now });
  const marks = createMarks({ db, now });
  const leaves = createLeaves({ db, now });
  const progress = createProgress({ db, now });
  const start = createStart({ db, now });
  const query = (ctx) => ({ lemma: ctx.url.searchParams.get('lemma') || '', kind: KINDS.includes(ctx.url.searchParams.get('kind')) ? ctx.url.searchParams.get('kind') : 'word' });

  router.add({
    method: 'GET', path: '/api/stages', access: 'agreed',
    handler: (ctx) => {
      const id = ctx.account.id;
      const settings = db.prepare('SELECT welcome_dismissed, speech_rate, voice_help_shown FROM learner_settings WHERE account_id = ?').get(id);
      const welcome = !settings?.welcome_dismissed;
      // G-06: before the starting check, the level line keeps "Set your starting level" (FR-608).
      const flags = start.flags(id);
      sendJson(ctx.res, 200, { level: flags.needsStart ? null : computeLevel(db, id), todayMinutes: progress.minutes(id, progress.today()), ...review.counts(id), welcome, ...flags, speechRate: settings?.speech_rate ?? 1, voiceHelpShown: !!settings?.voice_help_shown });
    },
  });
  router.add({
    method: 'POST', path: '/api/welcome', access: 'agreed', schema: {},
    handler: (ctx) => {
      db.prepare('INSERT OR IGNORE INTO learner_settings (account_id) VALUES (?)').run(ctx.account.id);
      db.prepare('UPDATE learner_settings SET welcome_dismissed = 1 WHERE account_id = ?').run(ctx.account.id);
      sendJson(ctx.res, 200, { result: 'dismissed' });
    },
  });
  router.add({ method: 'GET', path: '/api/marking', access: 'agreed', handler: (ctx) => sendJson(ctx.res, 200, marking.list(ctx.account.id, ctx.url.searchParams.get('textId'))) });
  router.add({
    method: 'POST', path: '/api/marking', access: 'agreed',
    schema: { textId: { type: 'integer', min: 1 }, marks: { type: 'array', max: 60, of: { lemma, kind, read: { type: 'boolean' }, remember: { type: 'boolean' } } } },
    handler: (ctx) => sendJson(ctx.res, 200, marking.apply(ctx.account.id, ctx.body.textId, ctx.body.marks)),
  });
  router.add({
    method: 'POST', path: '/api/marks', access: 'agreed',
    schema: { lemma, kind, read: { type: 'boolean' }, remember: { type: 'boolean' } },
    handler: (ctx) => sendJson(ctx.res, 200, marks.setMarks(ctx.account.id, ctx.body)),
  });
  router.add({ method: 'GET', path: '/api/fall-check', access: 'agreed', handler: (ctx) => sendJson(ctx.res, 200, marks.fallCheck(ctx.account.id, query(ctx))) });
  router.add({
    method: 'POST', path: '/api/let-it-fall', access: 'agreed',
    schema: { lemma, kind, right: { type: 'boolean', optional: true }, confirmed: { type: 'boolean', optional: true } },
    handler: (ctx) => sendJson(ctx.res, 200, marks.letItFall(ctx.account.id, ctx.body)),
  });
  router.add({ method: 'POST', path: '/api/pick-up', access: 'agreed', schema: { lemma, kind }, handler: (ctx) => sendJson(ctx.res, 200, marks.pickUp(ctx.account.id, ctx.body)) });
  router.add({
    method: 'GET', path: '/api/review', access: 'agreed',
    handler: (ctx) => sendJson(ctx.res, 200, review.session(ctx.account.id, ctx.url.searchParams.get('mode') === 'master' ? 'master' : 'review')),
  });
  router.add({
    method: 'POST', path: '/api/review', access: 'agreed',
    schema: { lemma, kind, mode: { type: 'enum', values: ['read', 'remember', 'master', 'recall'] }, right: { type: 'boolean' } },
    handler: (ctx) => sendJson(ctx.res, 200, review.answer(ctx.account.id, ctx.body)),
  });
  router.add({ method: 'GET', path: '/api/leaves', access: 'agreed', handler: (ctx) => sendJson(ctx.res, 200, leaves.list(ctx.account.id)) });
  router.add({ method: 'POST', path: '/api/leaves', access: 'agreed', schema: { text: lemma, kind, en: { type: 'string', min: 1, max: 200, optional: true } }, handler: (ctx) => sendJson(ctx.res, 200, leaves.add(ctx.account.id, ctx.body)) });
  router.add({ method: 'POST', path: '/api/leaf-delete', access: 'agreed', schema: { lemma, kind }, handler: (ctx) => sendJson(ctx.res, 200, leaves.remove(ctx.account.id, ctx.body)) });
  router.add({ method: 'GET', path: '/api/progress', access: 'agreed', handler: (ctx) => sendJson(ctx.res, 200, progress.progress(ctx.account.id)) });
  router.add({
    method: 'POST', path: '/api/input', access: 'agreed',
    schema: { seconds: { type: 'integer', min: 1, max: 60 }, day: { type: 'string', min: 10, max: 10 } },
    handler: (ctx) => sendJson(ctx.res, 200, progress.addInput(ctx.account.id, ctx.body)),
  });
}
