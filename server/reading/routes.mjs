// G-03's routes (contracts/http-api.md). All need an agreed session; the account comes from it (FR-319).
import { sendJson } from '../web/http.mjs';
import { buildReading } from './view.mjs';
import { buildPractice } from './practice.mjs';
import { createFlag, createReport, EXPLAIN_REASONS, REPORT_REASONS } from './flags.mjs';
import { dictionaryPage, readQuery } from './dictionary.mjs';
import { search as searchLexicon } from '../lexicon/lexicon.mjs';
import { addOwnText, saveLeaf, ownStatus } from './own.mjs';
import { ownText } from './view.mjs';
import { DEFAULT_SIZES } from '../config.mjs';
import { speechRateFor } from '../drill/progress.mjs';

const note = { type: 'string', min: 0, max: 200, optional: true };

export function registerReadingRoutes(router, { db, sizes = DEFAULT_SIZES, now = () => Date.now() }) {
  router.add({ method: 'GET', path: '/api/reading', access: 'agreed', handler: (ctx) => sendJson(ctx.res, 200, buildReading(db, ctx.account.id, ctx.url.searchParams.get('id'))) });
  router.add({ method: 'GET', path: '/api/practice', access: 'agreed', handler: (ctx) => sendJson(ctx.res, 200, buildPractice(db, ctx.account.id, ctx.url.searchParams.get('id'))) });
  router.add({ method: 'GET', path: '/api/dictionary', access: 'agreed', handler: (ctx) => sendJson(ctx.res, 200, dictionaryPage(db, ctx.account.id, readQuery(ctx.url.searchParams))) });
  // The common dictionary (G-09 FR-917): grove's whole word list, with each word's level and whether
  // it is already the learner's leaf or in their ground.
  router.add({
    method: 'GET', path: '/api/common-dictionary', access: 'agreed',
    handler: (ctx) => {
      const q = (ctx.url.searchParams.get('q') ?? '').slice(0, 60);
      const level = db.prepare('SELECT MIN(level) AS level FROM level_words WHERE lemma = ?');
      const mine = db.prepare('SELECT state FROM words WHERE account_id = ? AND lemma = ? AND kind = ?');
      const results = searchLexicon(q).map((r) => ({ ...r, level: level.get(r.lemma)?.level ?? null, state: mine.get(ctx.account.id, r.lemma, 'word')?.state ?? null }));
      sendJson(ctx.res, 200, { q, results });
    },
  });

  // The Settings page's values (G-09 FR-910).
  router.add({
    method: 'GET', path: '/api/settings', access: 'agreed',
    handler: (ctx) => {
      const s = db.prepare('SELECT speak_words, speech_rate FROM learner_settings WHERE account_id = ?').get(ctx.account.id);
      sendJson(ctx.res, 200, { speakWords: s ? !!s.speak_words : true, speechRate: speechRateFor(db, ctx.account.id) });
    },
  });

  router.add({
    method: 'POST', path: '/api/settings', access: 'agreed',
    schema: {
      speakWords: { type: 'boolean', optional: true },
      speechRate: { type: 'number', min: 0.5, max: 1.5, optional: true },
      voiceHelpShown: { type: 'boolean', optional: true },
    },
    handler: (ctx) => {
      // Saves only the settings sent, and answers with them (G-03 FR-305, G-05 FR-502, FR-503).
      const columns = { speakWords: 'speak_words', speechRate: 'speech_rate', voiceHelpShown: 'voice_help_shown' };
      db.prepare('INSERT OR IGNORE INTO learner_settings (account_id) VALUES (?)').run(ctx.account.id);
      const sent = {};
      for (const [key, column] of Object.entries(columns)) {
        if (ctx.body[key] === undefined) continue;
        const value = typeof ctx.body[key] === 'boolean' ? (ctx.body[key] ? 1 : 0) : Math.round(ctx.body[key] * 10) / 10;
        db.prepare(`UPDATE learner_settings SET ${column} = ? WHERE account_id = ?`).run(value, ctx.account.id);
        sent[key] = ctx.body[key];
        // G-09 FR-921: once the learner sets the speed, it no longer follows the level.
        if (key === 'speechRate') db.prepare('UPDATE learner_settings SET speech_rate_set = 1 WHERE account_id = ?').run(ctx.account.id);
      }
      sendJson(ctx.res, 200, sent);
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
    handler: (ctx) => sendJson(ctx.res, 200, addOwnText(db, ctx.account.id, ctx.body, now(), sizes)),
  });

  router.add({
    method: 'GET', path: '/api/own-text', access: 'agreed',
    handler: (ctx) => {
      const text = ownText(db, ctx.account.id, ctx.url.searchParams.get('id'));
      sendJson(ctx.res, 200, { id: text.id, title: text.title, ...ownStatus(db, ctx.account.id, text.id) });
    },
  });

  // My own texts (FR-321; addendum 003): newest first, waiting for their AI round or ready.
  router.add({
    method: 'GET', path: '/api/own-texts', access: 'agreed',
    handler: (ctx) => {
      const texts = db.prepare('SELECT id, title, ready, read_at FROM texts WHERE account_id = ? AND own = 1 ORDER BY id DESC').all(ctx.account.id)
        .map((x) => ({ id: x.id, title: x.title, ready: !!x.ready, state: !x.ready ? 'waiting' : x.read_at ? 'read' : 'new' }));
      sendJson(ctx.res, 200, { texts });
    },
  });

  router.add({
    method: 'POST', path: '/api/leaf', access: 'agreed',
    schema: { textId: { type: 'integer', min: 1 }, form: { type: 'string', min: 1, max: 80 } },
    handler: (ctx) => { saveLeaf(db, ctx.account.id, ctx.body, now()); sendJson(ctx.res, 200, { result: 'saved' }); },
  });

}
