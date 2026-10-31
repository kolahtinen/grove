// G-09 User Story 2's scenarios 3–10 (RQ-457…RQ-459; the picked sketch's version B, question-pages/93):
// the shared exercise frame, one more try, looking again, texts inside the session, the summary. Each test
// runs on its own grove with the demo learner (G-07), so its leaves and texts are known.
import { test, expect } from '@playwright/test';
import { agreeTerms } from './helpers.mjs';
import { startTestGrove, PASSWORD } from '../fakes/harness.mjs';
import { applyDemo } from '../../server/demo/apply.mjs';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.__spoken = [];
    const fake = { speak(u) { window.__spoken.push(u.text); setTimeout(() => u.onend && u.onend(), 20); }, cancel() {}, getVoices() { return [{ lang: 'sv-SE', name: 'Fake' }]; } };
    Object.defineProperty(window, 'speechSynthesis', { value: fake, configurable: true });
  });
});

async function demoGrove(page, email) {
  const t = await startTestGrove({ host: 'localhost' });
  const learner = t.seedAccount({ email });
  applyDemo({ db: t.grove.db, accountId: learner.id });
  t.grove.db.prepare('UPDATE learner_settings SET start_done = 1, start_offered = 1, welcome_dismissed = 1 WHERE account_id = ?').run(learner.id);
  await page.goto(`${t.base}/signin`);
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL(/\/terms$/);
  await agreeTerms(page);
  await page.waitForURL(`${t.base}/`);
  return { t, learner };
}

async function api(page, path, body) {
  return page.evaluate(async ({ path, body }) => {
    const me = await (await fetch('/api/me')).json();
    const r = await fetch(path, { method: 'POST', headers: { 'content-type': 'application/json', 'x-csrf-token': me.csrf }, body: JSON.stringify(body) });
    return { status: r.status, body: await r.json() };
  }, { path, body });
}

const startSession = (page, body) => api(page, '/api/sessions', { kind: 'time', tile: 'review', minutes: 5, voice: true, fill: true, ...body });

test('FR-904 FR-912 FR-932 RQ-457: a session opens on its start screen; each exercise shows the session bar (✕, a segment each, i/n), the kicker line and one line of what to do, and the bottom bar\'s one button disabled with what is still needed', async ({ page }) => {
  const { t } = await demoGrove(page, 'frame@example.test');
  try {
    const s = (await startSession(page, {})).body.session;
    await page.goto(`${t.base}/session`);
    await expect(page.locator('.topbar')).toBeHidden();
    const start = page.locator('#start-card');
    await expect(start.locator('h2')).toHaveText('5-minute Review');
    await expect(start).toContainText(`${s.total} exercise`);
    await expect(start).toContainText('One at a time; you can leave and carry on later.');
    await expect(start.locator('.plan-list li')).toHaveCount(s.total);
    await expect(start.locator('.plan-list li').first()).toContainText('Review ·');
    await page.locator('#session-start').click();
    await expect(page.getByRole('button', { name: 'Leave the session' })).toBeVisible();
    await expect(page.locator('#session-top .seg')).toHaveCount(s.total);
    await expect(page.locator('#session-count')).toHaveText(`1/${s.total}`);
    const kicker = page.locator('#exercise-kicker');
    await expect(kicker).toHaveText(/^Review · (Pick the meaning|Remember the meaning|Harder question)\d+ s$/);
    await expect(kicker.locator('svg.icon')).toHaveCount(1);
    await expect(page.locator('#exercise-task')).not.toBeEmpty();
    const action = page.locator('#action');
    if (await page.locator('#exercise-box button.option').first().isVisible()) {
      await expect(action).toBeDisabled();
      await expect(page.locator('#wait')).toHaveText(/^Pick (an answer|a word)$/);
    } else {
      await expect(action).toHaveText('Show the meaning');
    }
    // ✕ leaves for Home; the session is kept and Resume is at the top.
    await page.getByRole('button', { name: 'Leave the session' }).click();
    await page.waitForURL(`${t.base}/`);
    await expect(page.locator('.resume-bar')).toContainText('Resume: 5-minute Review · 1 of');
  } finally {
    await t.close();
  }
});

test('FR-932 FR-904 RQ-459 RQ-457: after a wrong pick the learner tries once more, the answer is scheduled as wrong; a finished exercise opens again from its segment, locked, with Back to i of n; the summary lists only what has something in it', async ({ page }) => {
  const { t, learner } = await demoGrove(page, 'again@example.test');
  try {
    let s = (await startSession(page, {})).body.session;
    // A Review question with choices first (the demo's leaves are met in sentences).
    for (let i = 0; i < 6 && !s.exercise?.question?.options; i += 1) s = (await api(page, '/api/session/next', { sessionId: s.id, index: s.index })).body.session;
    test.skip(!s.exercise?.question?.options, 'no Review question with choices in this plan');
    const q = s.exercise.question;
    await page.goto(`${t.base}/session`);
    await expect(page.locator('#start-card:visible, #exercise:visible')).toBeVisible();
    if (await page.locator('#session-start').isVisible()) await page.locator('#session-start').click();
    const options = page.locator('#exercise-box button.option');
    const wrong = (q.right + 1) % q.options.length;
    await options.nth(wrong).click();
    await expect(page.locator('#feedback')).toHaveText('Not quite — try once more.');
    await expect(options.nth(wrong)).toHaveClass(/wrong/);
    await expect(options.nth(wrong)).toBeDisabled();
    await expect(page.locator('#action')).toBeDisabled();
    await options.nth(q.right).click();
    await expect(options.nth(q.right)).toHaveClass(/right/);
    expect(await options.nth(q.right).evaluate((b) => getComputedStyle(b).opacity)).toBe('1');
    await expect(page.locator('#feedback')).toHaveText(/^Right\./);
    if (q.sentenceEn) await expect(page.locator('#exercise-box .en-line')).toHaveText(q.sentenceEn);
    await expect.poll(() => t.grove.db.prepare(`SELECT a.right FROM review_answers a JOIN words w ON w.id = a.word_id
      WHERE a.account_id = ? AND w.lemma = ? ORDER BY a.at DESC LIMIT 1`).get(learner.id, q.lemma)?.right).toBe(0);
    await page.locator('#action').click();
    await expect(page.locator('#session-count')).toHaveText(`${s.index + 2}/${s.total}`);
    // Look again: the finished segment opens it as it was, answers locked.
    await page.locator('#session-top button.seg.done').last().click();
    await expect(page.locator('#action')).toHaveText(`Back to ${s.index + 2} of ${s.total}`);
    await expect(options.nth(q.right)).toHaveClass(/right/);
    await expect(options.nth(wrong)).toHaveClass(/wrong/);
    for (const b of await options.all()) await expect(b).toBeDisabled();
    await page.locator('#action').click();
    await expect(page.locator('#action')).not.toHaveText(/^Back to/);
    // The rest, to the summary.
    for (let i = 0; i < 60; i += 1) {
      await expect(page.locator('#session-end:visible, #exercise-box button.option:not([disabled]):visible, #action:enabled:visible, #exercise-box button.play.big:visible, #exercise-box button:has-text("I knew it"):enabled:visible').first()).toBeVisible();
      if (await page.locator('#session-end').isVisible()) break;
      // Fill-ins may be a text to hear again: play it first.
      if (await page.locator('#action').isDisabled() && await page.locator('#wait').textContent() === 'Play the text first') {
        await page.locator('#exercise-box button.play.big').click();
        await expect(page.locator('#action')).toBeEnabled();
      }
      const option = page.locator('#exercise-box button.option:not([disabled])').first();
      if (await option.isVisible()) { await option.click(); continue; }
      const knew = page.getByRole('button', { name: 'I knew it' });
      if (await knew.isVisible() && await knew.isEnabled()) { await knew.click(); continue; }
      // Wait for the next exercise's button: the old one stays until the server answers.
      const h = await page.locator('#action').elementHandle();
      await h.click();
      await h.waitForElementState('hidden').catch(() => {});
    }
    const end = page.locator('#session-end');
    await expect(end.locator('h2')).toHaveText('Well done');
    await expect(end).toContainText('5-minute Review ·');
    await expect(end).not.toContainText('· 0 minutes');
    for (const n of await end.locator('#summary li b').allTextContents()) expect(Number(n)).toBeGreaterThan(0);
    await expect(end.locator('#summary li', { hasText: 'Words reviewed' })).toHaveCount(1);
    await expect(end.locator('#summary li', { hasText: 'Texts read' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Back to Home' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Another 5 minutes' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Leave/ })).toHaveCount(0);
    await page.getByRole('button', { name: 'Back to Home' }).click();
    await page.waitForURL(`${t.base}/`);
    await expect(page.locator('.resume-bar')).toHaveCount(0);
  } finally {
    await t.close();
  }
});

test('FR-933 RQ-458: a reading text in a session opens inside the frame with no way out of the session; its questions lock once answered; a listening text starts with Play the text and the text blurred; read again asks nothing', async ({ page }) => {
  const { t, learner } = await demoGrove(page, 'texts@example.test');
  try {
    const s = (await startSession(page, { tile: 'discover', skills: ['reading'] })).body.session;
    const at = s.exercises.findIndex((e) => e.type === 'text');
    test.skip(at < 0, 'no new reading text in this plan');
    for (let i = 0; i < at; i += 1) await api(page, '/api/session/next', { sessionId: s.id, index: i });
    await page.goto(`${t.base}/session`);
    await expect(page.locator('#start-card:visible, #exercise:visible')).toBeVisible();
    if (await page.locator('#session-start').isVisible()) await page.locator('#session-start').click();
    await expect(page.locator('#exercise-kicker')).toContainText('Reading · New text');
    await expect(page.locator('#exercise-task')).toHaveText('Read the text, then answer and rate it.');
    await expect(page).toHaveURL(/\/session$/);
    for (const name of ['Back to Home', 'Your library', 'Practise', 'Listen']) await expect(page.getByRole('link', { name, exact: true }).or(page.getByRole('button', { name, exact: true }))).toHaveCount(0);
    await expect(page.locator('#exercise-box .text-lines button.w').first()).toBeVisible();
    await page.locator('#exercise-box .text-lines button.w').first().click();
    await expect(page.locator('#menu')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('#menu')).toBeHidden();
    const fieldsets = page.locator('#exercise-box fieldset');
    const n = await fieldsets.count();
    for (let k = 0; k < n; k += 1) {
      await fieldsets.nth(k).locator('button.option').first().click();
      for (const b of await fieldsets.nth(k).locator('button.option').all()) await expect(b).toBeDisabled();
    }
    await expect(page.locator('#wait')).toHaveText('Say how much you understood');
    await page.getByRole('button', { name: 'Most', exact: true }).click();
    await expect(page.locator('#feedback')).toContainText('Text done.');
    await page.locator('#action').click();
    await expect.poll(async () => page.evaluate(async (id) => (await (await fetch(`/api/session?id=${id}`)).json()).session.index, s.id)).toBe(at + 1);
    // A listening text: Play the text first, the text blurred.
    const listen = (await startSession(page, { tile: 'discover', skills: ['listening'] })).body.session;
    const li = listen.exercises.findIndex((e) => e.skill === 'listening');
    if (li >= 0) {
      for (let i = 0; i < li; i += 1) await api(page, '/api/session/next', { sessionId: listen.id, index: i });
      await page.goto(`${t.base}/session`);
      await expect(page.locator('#start-card:visible, #exercise:visible')).toBeVisible();
    if (await page.locator('#session-start').isVisible()) await page.locator('#session-start').click();
      await expect(page.locator('#exercise-task')).toHaveText(/^(Listen first, with the text hidden\.|Listen to it once more\.)$/);
      await expect(page.getByRole('button', { name: 'Play the text' })).toBeVisible();
      await expect(page.locator('#exercise-box .blurred')).toHaveCount(1);
      await expect(page.locator('#action')).toBeDisabled();
      await expect(page.locator('#wait')).toHaveText('Play the text first');
    }
    // Read again: "You read this …. No questions this time.", Done reading.
    const db = t.grove.db;
    const read = db.prepare("SELECT id FROM texts WHERE account_id = ? AND kind = 'reading' AND read_at IS NOT NULL LIMIT 1").get(learner.id);
    const sess = db.prepare("SELECT id FROM practice_sessions WHERE account_id = ? AND status = 'going'").get(learner.id);
    db.prepare('UPDATE practice_sessions SET plan = ?, at_index = 0 WHERE id = ?').run(JSON.stringify([{ mode: 'discover', type: 'text', textId: read.id, again: 'reread', seconds: 90 }]), sess.id);
    await page.goto(`${t.base}/session`);
    await expect(page.locator('#start-card:visible, #exercise:visible')).toBeVisible();
    if (await page.locator('#session-start').isVisible()) await page.locator('#session-start').click();
    await expect(page.locator('#exercise-kicker')).toContainText('Reading · Read again');
    await expect(page.locator('#exercise-hint')).toHaveText(/^You read this .+\. No questions this time\.$/);
    await expect(page.locator('#exercise-box fieldset')).toHaveCount(0);
    await expect(page.locator('#action')).toHaveText('Done reading');
    await page.locator('#action').click();
    await expect(page.locator('#session-end')).toBeVisible();
    await expect(page.locator('#summary li', { hasText: 'Texts read' })).toHaveCount(0);
  } finally {
    await t.close();
  }
});

test('FR-932 FR-928 RQ-457: a phrase spotlight locks its choices with ✓ on the right one, fully readable, and ✗ on a wrong pick', async ({ page }) => {
  const { t } = await demoGrove(page, 'phrase@example.test');
  try {
    const s = (await startSession(page, { tile: 'discover', skills: ['words'], minutes: 10 })).body.session;
    const at = s.exercises.findIndex((e) => e.type === 'phrase');
    test.skip(at < 0, 'no phrase spotlight in this plan');
    for (let i = 0; i < at; i += 1) await api(page, '/api/session/next', { sessionId: s.id, index: i });
    await page.goto(`${t.base}/session`);
    await expect(page.locator('#start-card:visible, #exercise:visible')).toBeVisible();
    if (await page.locator('#session-start').isVisible()) await page.locator('#session-start').click();
    await expect(page.locator('#exercise-kicker')).toContainText('Words · Phrase spotlight');
    await expect(page.locator('#exercise-task')).toHaveText('What does this phrase mean?');
    const ex = (await page.evaluate(async () => (await (await fetch('/api/session')).json()).session.exercise));
    const choices = page.locator('#exercise-box .choices button.option');
    const wrong = (ex.phrase.right + 1) % 3;
    await choices.nth(wrong).click();
    await expect(page.locator('#feedback')).toHaveText('Not quite — try once more.');
    await choices.nth((ex.phrase.right + 2) % 3).click();
    await expect(choices.nth(ex.phrase.right)).toHaveClass(/right/);
    expect(await choices.nth(ex.phrase.right).evaluate((b) => [getComputedStyle(b).opacity, getComputedStyle(b, '::after').content])).toEqual(['1', '"✓"']);
    expect(await choices.nth(wrong).evaluate((b) => getComputedStyle(b, '::after').content)).toBe('"✗"');
    await expect(page.locator('#feedback')).toContainText(`Not quite. ${ex.phrase.phrase} means “${ex.phrase.en}”`);
    await expect(page.getByRole('button', { name: '+ Pick up this phrase' })).toBeVisible();
    await expect(page.locator('#action')).toBeEnabled();
  } finally {
    await t.close();
  }
});

test('FR-904 FR-920 RQ-457: a session whose plan was never started is not kept: leaving its offer gives no Resume on Home', async ({ page }) => {
  const t = await startTestGrove({ host: 'localhost' });
  try {
    const learner = t.seedAccount({ email: 'unstarted@example.test' });
    t.grove.db.prepare('INSERT OR IGNORE INTO learner_settings (account_id) VALUES (?)').run(learner.id);
    t.grove.db.prepare('UPDATE learner_settings SET start_done = 1, start_offered = 1, welcome_dismissed = 1 WHERE account_id = ?').run(learner.id);
    await page.goto(`${t.base}/signin`);
    await page.getByLabel('Email').fill('unstarted@example.test');
    await page.getByLabel('Password').fill(PASSWORD);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.waitForURL(/\/terms$/);
    await agreeTerms(page);
    await page.waitForURL(`${t.base}/`);
    await page.getByRole('button', { name: 'Discover', exact: true }).click();
    await page.locator('#tile-panel').getByRole('button', { name: /^Start/ }).click();
    await page.waitForURL(/\/session$/);
    await expect(page.locator('#offer')).toBeVisible();
    await page.getByRole('button', { name: 'Leave: back to Home' }).click();
    await page.waitForURL(`${t.base}/`);
    await expect(page.locator('.resume-bar')).toHaveCount(0);
    expect(await page.evaluate(async () => (await (await fetch('/api/session')).json()).session)).toBeNull();
  } finally {
    await t.close();
  }
});
