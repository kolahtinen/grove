import { test, expect } from '@playwright/test';
import { agreeTerms } from './helpers.mjs';
import { readFileSync } from 'node:fs';
import { REVIEWER, OWNER } from '../fakes/dev-accounts.mjs';

const SAMPLE = readFileSync(new URL('../texts/answers/good-patterns.json', import.meta.url), 'utf8');

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.__spoken = [];
    const fake = { speak(u) { window.__spoken.push(u.text); setTimeout(() => u.onend && u.onend(), 30); }, cancel() {}, getVoices() { return [{ lang: 'sv-SE', name: 'Fake' }]; } };
    Object.defineProperty(window, 'speechSynthesis', { value: fake, configurable: true });
  });
});

async function signIn(page, account = REVIEWER) {
  await page.goto('/signin');
  await page.getByLabel('Email').fill(account.email);
  await page.getByLabel('Password').fill(account.password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL(/\/terms$/);
  await agreeTerms(page);
  await page.waitForURL(/\/$/);
}

// Calls the API from the page with the session's CSRF token.
async function api(page, path, body) {
  return page.evaluate(async ({ path, body }) => {
    const me = await (await fetch('/api/me')).json();
    const r = await fetch(path, { method: 'POST', headers: { 'content-type': 'application/json', 'x-csrf-token': me.csrf }, body: JSON.stringify(body) });
    return { status: r.status, body: await r.json() };
  }, { path, body });
}

async function addSample(page) {
  // Known words the tests drill must be back in the ground, or the sample has too many new words.
  for (const w of ['tårta']) await setState(page, w, { ground: true });
  const tag = Math.random().toString(36).replace(/[^a-z]/g, '').slice(0, 5);
  // A new package gives a fresh part: \"next\" may give a waiting redo since G-02 FR-206 changed (2026-10-26).
  const p = await api(page, '/api/prompt', { action: 'new_package' });
  const answer = JSON.parse(SAMPLE.replaceAll('TEST-1', p.body.code));
  answer.texts.forEach((x) => { x.title = `${x.title} ${tag}`; });
  const r = await api(page, '/api/answer', { exchangeId: p.body.exchangeId, answer: JSON.stringify(answer) });
  return Object.fromEntries(r.body.texts.map((x) => [x.title.replace(` ${tag}`, ''), x.id]));
}

// Puts a word in a known state: unmarked leaf → (To remember), or ground. To read is gone (addendum 003).
async function setState(page, lemma, { remember = false, ground = false, kind = 'word' } = {}) {
  await api(page, '/api/marks', { lemma, kind, remember: false });
  if (ground) { await api(page, '/api/let-it-fall', { lemma, kind, confirmed: true }); return; }
  if (remember) await api(page, '/api/marks', { lemma, kind, remember });
}

test('FR-401 RQ-52 RQ-415: after rating, the marking step lists the new words with a To remember switch; Done drills some and grounds the rest', async ({ page }) => {
  await signIn(page);
  // Make the text's new words unmarked leaves again before the sample arrives (the account is shared between runs).
  for (const w of ['kopp', 'räkna', 'mörk', 'gärna', 'släcka', 'chef']) {
    await api(page, '/api/marks', { lemma: w, remember: false });
    await api(page, '/api/pick-up', { lemma: w });
    await api(page, '/api/marks', { lemma: w, remember: false });
  }
  const ids = await addSample(page);
  await page.goto(`/text?id=${ids['En bra dag']}`);
  await page.getByRole('button', { name: 'Most', exact: true }).click();
  await expect(page.locator('#marking-card')).toBeVisible();
  const rows = page.locator('#marking-list li');
  const n = await rows.count();
  expect(n).toBeGreaterThanOrEqual(4);
  await expect(rows.nth(0).getByRole('button', { name: 'To read' })).toHaveCount(0);
  await rows.nth(0).getByRole('button', { name: 'To remember' }).click();
  await rows.nth(1).getByRole('button', { name: 'To remember' }).click();
  await page.locator('#marking-done').click();
  await expect(page.locator('#marking-message')).toHaveText(`2 to drill, ${n - 2} to your ground.`);
  await page.reload();
  await expect(page.locator('#marking-card')).toBeHidden();
});

test('FR-903 FR-406 RQ-440 RQ-415: the Review tile → Start shows a due leaf in its sentence with Play, one card at a time', async ({ page }) => {
  await signIn(page);
  await addSample(page);
  await setState(page, 'gärna', { ground: true });
  await api(page, '/api/pick-up', { lemma: 'gärna' });
  // G-09 FR-903 (addendum 006): the Review tile's Start is a 10-minute Review of the due leaves; a short
  // one first offers Fill the time or Start shorter (FR-905).
  await page.goto('/');
  await page.getByRole('button', { name: 'Review', exact: true }).click();
  await page.locator('#tile-panel').getByRole('button', { name: 'Start', exact: true }).click();
  const shorter = page.getByRole('group', { name: 'This session would be short' }).getByRole('button', { name: 'Start shorter' });
  await expect(shorter.or(page.locator('#session-line'))).toBeVisible();
  if (await shorter.isVisible()) await shorter.click();
  await page.waitForURL(/\/session$/);
  await expect(page.locator('#session-line')).toContainText('Review');
  await expect(page.locator('#exercise-banner .chip.review').first()).toContainText('Review');
  // The sentence is shown, with Play (addendum 003, question-pages/73, 2).
  if (await page.locator('.review-sentence').isVisible()) await expect(page.locator('#exercise-box').getByRole('button', { name: 'Play' })).toBeVisible();
  for (let i = 0; i < 12; i += 1) {
    // Wait for the next card (or the end) before answering it.
    await expect(page.locator('#session-end, #exercise-box button.option:not([disabled]), #exercise-box button:text-is("Show")').first()).toBeVisible();
    if (await page.locator('#session-end').isVisible()) break;
    const option = page.locator('#exercise-box button.option:not([disabled])').first();
    if (await option.isVisible()) { await option.click(); await page.getByRole('button', { name: 'Next' }).click(); continue; }
    const show = page.getByRole('button', { name: 'Show' });
    if (await show.isVisible()) { await show.click(); await page.getByRole('button', { name: 'I knew it' }).click(); }
  }
  await expect(page.locator('#session-end')).toBeVisible();
});

test('FR-409 FR-410 FR-411 FR-412 RQ-07 RQ-08 RQ-414 RQ-415: the To remember switch, Let it fall, Pick up for words and patterns, and the Leaves page', async ({ page }) => {
  await signIn(page);
  const ids = await addSample(page);
  await setState(page, 'tolv', { remember: true });
  await page.goto(`/text?id=${ids['En kall morgon']}`);
  // "En kall morgon" is the sample's listening text and opens in listening mode (G-05 FR-509): show it.
  await page.getByRole('button', { name: 'Show the text' }).click();
  await page.locator('button.w', { hasText: /^tårta$/ }).first().click();
  await expect(page.locator('#menu-pickup')).toBeVisible();
  await page.locator('#menu-remember').click();
  await expect(page.locator('#menu-remember')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('#menu-close').click();
  await setState(page, 'tårta', { ground: true });
  // Pick up a grammar pattern of the sentence from the word menu (FR-411, RQ-414).
  await setState(page, 'har + supine', { kind: 'pattern' });
  await page.goto(`/text?id=${ids['Olles väska']}`);
  await page.locator('button.w.pattern', { hasText: /^glömt$/ }).first().click();
  await page.locator('#menu-pattern-list li', { hasText: 'har + supine' }).getByRole('button', { name: 'Pick up' }).click();
  await expect(page.locator('#menu-message')).toContainText('Picked up “har + supine”');
  await page.locator('#menu-close').click();
  await page.locator('button.w', { hasText: /^tolv$/ }).click();
  await page.locator('#menu-fall').click();
  await expect(page.locator('#fall-check')).toBeVisible();
  const option = page.locator('#fall-check button.option').first();
  if (await option.isVisible()) await option.click(); else await page.getByRole('button', { name: 'Yes, let it fall' }).click();
  await expect(page.locator('#menu-message')).toHaveText(/fell to your ground|stays a leaf/);
  await setState(page, 'servitör');
  const word = `kanel${Math.random().toString(36).replace(/[^a-z]/g, '').slice(0, 5)}`;
  await page.goto('/leaves');
  await page.getByLabel('Add a word, phrase or pattern').fill(word);
  await page.getByRole('button', { name: 'Add' }).click();
  // A made-up word isn't in grove's word list, so it asks for the learner's own meaning (FR-412, 2026-10-26).
  await expect(page.locator('#leaves-message')).toContainText('What does it mean?');
  await page.getByLabel('Its meaning').fill('a made-up cinnamon thing');
  await page.getByRole('button', { name: 'Add' }).click();
  await expect(page.locator('#leaves-message')).toContainText('Added with your meaning');
  await expect(page.locator('#leaves-remember')).toContainText(word);
  await expect(page.locator('#leaves-remember li', { hasText: word })).toContainText('a made-up cinnamon thing');
  await page.locator('#leaves-remember li', { hasText: word }).getByRole('button', { name: 'Delete' }).click();
  await expect(page.locator('#leaves-remember')).not.toContainText(word);
  await page.locator('#leaves-unmarked li', { hasText: 'servitör' }).getByRole('button', { name: 'To remember' }).click();
  await expect(page.locator('#leaves-remember')).toContainText('servitör');
});

test('FR-413 RQ-294 RQ-413 RQ-415 RQ-426: To remember words are teal-green with a dotted underline; fallen words look like known words; a form of more than one word has no mark', async ({ page }) => {
  await signIn(page);
  const ids = await addSample(page);
  await setState(page, 'räkna', { remember: true });
  await setState(page, 'gärna', { remember: true });
  await api(page, '/api/let-it-fall', { lemma: 'gärna', confirmed: true });
  await page.goto(`/text?id=${ids['En bra dag']}`);
  await expect(page.locator('button.w', { hasText: /^räknar$/ })).toHaveClass(/m-remember/);
  const remember = page.locator('button.w', { hasText: /^räknar$/ });
  await expect(remember).toHaveCSS('border-bottom-style', 'dotted');
  // PD-13 (question-pages/76, 13): a fallen word has the text's own colour, like any known word.
  const [fallen, text] = await page.evaluate(() => [getComputedStyle([...document.querySelectorAll('button.w')].find((b) => b.textContent === 'gärna')).color, getComputedStyle(document.body).color]);
  expect(fallen).toBe(text);
  await expect(page.locator('button.w.other-reading')).toHaveCount(0);
});

test('FR-414 FR-415 FR-910 RQ-03 RQ-71 RQ-427: Progress shows the level line, today\'s minutes and 14 day bars', async ({ page }) => {
  await signIn(page);
  // With level word lists present (G-06), the line shows the level; without them, "Set your starting level" (FR-414, FR-608).
  await page.goto('/progress');
  await expect(page.locator('#progress-level')).toContainText(/Your level: |Set your starting level/);
  await expect(page.locator('#progress-level')).toContainText('min of input today');
  await expect(page.locator('#bars .bar')).toHaveCount(14);
  await expect(page.locator('#progress-counts')).toContainText('words in your ground');
});

test('FR-416 RQ-73: the welcome card shows on a first visit and stays gone after closing', async ({ page }, info) => {
  await signIn(page, OWNER);
  if (info.project.name === 'phone') await expect(page.locator('#welcome')).toBeVisible();
  if (await page.locator('#welcome').isVisible()) await page.locator('#welcome-close').click();
  await expect(page.locator('#welcome')).toBeHidden();
  await page.reload();
  await expect(page.locator('#welcome')).toBeHidden();
});
