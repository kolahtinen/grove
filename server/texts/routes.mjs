// G-02's routes (contracts/http-api.md). All need a signed-in session that agreed to the terms; the
// account always comes from the session (FR-220).
import { sendJson, HttpError } from '../web/http.mjs';
import { createWordStore } from '../words/store.mjs';
import { createPackages } from './packages.mjs';
import { applyRating, RATINGS } from './ratings.mjs';
import { DEFAULT_SIZES } from '../config.mjs';
import { FAMILIES, TACTICS } from './plans.mjs';

export const MAX_ANSWER = 80000;

export function registerTextRoutes(router, { db, sizes = DEFAULT_SIZES, now = () => Date.now() }) {
  const words = createWordStore({ db, now });
  const packages = createPackages({ db, words, sizes, now });

  function ownText(accountId, raw) {
    const id = Number(raw);
    if (!Number.isSafeInteger(id) || id < 1) throw new HttpError(404, 'not_found', 'There is no such text.');
    const text = db.prepare('SELECT * FROM texts WHERE id = ? AND account_id = ?').get(id, accountId);
    if (!text) throw new HttpError(404, 'not_found', 'There is no such text.');
    return text;
  }

  router.add({ method: 'GET', path: '/api/home', access: 'agreed', handler: (ctx) => sendJson(ctx.res, 200, packages.home(ctx.account.id)) });

  router.add({
    method: 'POST', path: '/api/topic', access: 'agreed',
    schema: { topic: { type: 'string', min: 1, max: 80 } },
    handler: (ctx) => {
      const topic = ctx.body.topic.trim();
      if (!topic) throw new HttpError(400, 'bad_request', 'Please write a topic.');
      packages.settings(ctx.account.id);
      db.prepare('UPDATE learner_settings SET topic = ? WHERE account_id = ?').run(topic, ctx.account.id);
      sendJson(ctx.res, 200, { topic });
    },
  });

  router.add({
    method: 'POST', path: '/api/prompt', access: 'agreed',
    schema: { action: { type: 'enum', values: ['next', 'new_package', 'new_chat'] }, forSession: { type: 'boolean', optional: true } },
    handler: (ctx) => sendJson(ctx.res, 200, packages.requestPrompt(ctx.account.id, ctx.body.action, { forSession: !!ctx.body.forSession })),
  });

  router.add({
    method: 'POST', path: '/api/plan', access: 'agreed',
    schema: {
      family: { type: 'enum', values: FAMILIES.map((f) => f.id) },
      product: { type: 'string', min: 1, max: 30 },
      tactic: { type: 'enum', values: TACTICS, optional: true },
    },
    handler: (ctx) => sendJson(ctx.res, 200, packages.setPlan(ctx.account.id, ctx.body)),
  });

  router.add({
    method: 'POST', path: '/api/answer', access: 'agreed',
    schema: { exchangeId: { type: 'integer', min: 1 }, answer: { type: 'string', min: 1, max: MAX_ANSWER } },
    handler: (ctx) => sendJson(ctx.res, 200, packages.answer(ctx.account.id, ctx.body.exchangeId, ctx.body.answer)),
  });

  router.add({
    method: 'GET', path: '/api/text', access: 'agreed',
    handler: (ctx) => {
      const text = ownText(ctx.account.id, ctx.url.searchParams.get('id'));
      if (!text.read_at) db.prepare('UPDATE texts SET read_at = ? WHERE id = ?').run(now(), text.id);
      const lines = db.prepare('SELECT sv, en FROM text_lines WHERE text_id = ? ORDER BY position').all(text.id);
      const questions = db.prepare('SELECT q, options FROM questions WHERE text_id = ? ORDER BY position').all(text.id)
        .map((q) => ({ q: q.q, options: JSON.parse(q.options) }));
      const answered = db.prepare('SELECT position, option, right FROM question_answers WHERE text_id = ? ORDER BY position').all(text.id)
        .map((a) => ({ position: a.position, option: a.option, right: !!a.right }));
      const rating = db.prepare('SELECT value FROM ratings WHERE text_id = ?').get(text.id)?.value ?? null;
      sendJson(ctx.res, 200, { id: text.id, title: text.title, kind: text.kind, topic: text.topic, lines, questions, answered, rating });
    },
  });

  router.add({
    method: 'POST', path: '/api/question', access: 'agreed',
    schema: { textId: { type: 'integer', min: 1 }, position: { type: 'integer', min: 0, max: 5 }, option: { type: 'integer', min: 0, max: 2 } },
    handler: (ctx) => {
      const text = ownText(ctx.account.id, ctx.body.textId);
      const q = db.prepare('SELECT options, answer FROM questions WHERE text_id = ? AND position = ?').get(text.id, ctx.body.position);
      if (!q || ctx.body.option >= JSON.parse(q.options).length) throw new HttpError(404, 'not_found', 'There is no such question.');
      const right = ctx.body.option === q.answer;
      // Only the first answer to a question counts.
      db.prepare('INSERT OR IGNORE INTO question_answers (account_id, text_id, position, option, right, at) VALUES (?, ?, ?, ?, ?, ?)')
        .run(ctx.account.id, text.id, ctx.body.position, ctx.body.option, right ? 1 : 0, now());
      sendJson(ctx.res, 200, { right, rightOption: q.answer });
    },
  });

  router.add({
    method: 'POST', path: '/api/rating', access: 'agreed',
    schema: { textId: { type: 'integer', min: 1 }, value: { type: 'enum', values: RATINGS } },
    handler: (ctx) => {
      const text = ownText(ctx.account.id, ctx.body.textId);
      const s = packages.settings(ctx.account.id);
      const next = applyRating(s, ctx.body.value);
      db.prepare(`INSERT INTO ratings (account_id, text_id, value, at) VALUES (?, ?, ?, ?)
        ON CONFLICT (account_id, text_id) DO UPDATE SET value = excluded.value, at = excluded.at`).run(ctx.account.id, text.id, ctx.body.value, now());
      db.prepare('UPDATE learner_settings SET target_share = ?, shorter = ?, high_streak = ? WHERE account_id = ?')
        .run(next.target_share, next.shorter, next.high_streak, ctx.account.id);
      sendJson(ctx.res, 200, { result: 'rated', targetShare: next.target_share });
    },
  });
}
