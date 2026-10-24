import { test, expect } from '@playwright/test';
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
  await page.getByLabel(/I agree to the terms/).check();
  await page.getByLabel(/I am 13 or over/).check();
  await page.getByRole('button', { name: 'Agree' }).click();
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
  let p = await api(page, '/api/prompt', { action: 'next' });
  if (p.status === 409) p = await api(page, '/api/prompt', { action: 'new_package' });
  const answer = JSON.parse(SAMPLE.replaceAll('TEST-1', p.body.code));
  answer.texts.forEach((x) => { x.title = `${x.title} ${tag}`; });
  const r = await api(page, '/api/answer', { exchangeId: p.body.exchangeId, answer: JSON.stringify(answer) });
  return Object.fromEntries(r.body.texts.map((x) => [x.title.replace(` ${tag}`, ''), x.id]));
}

// Puts a word in a known state: unmarked leaf → (marks), or ground.
async function setState(page, lemma, { read = false, remember = false, ground = false } = {}) {
  await api(page, '/api/marks', { lemma, read: false, remember: false });
  if (ground) { await api(page, '/api/let-it-fall', { lemma, confirmed: true }); return; }
  if (read || remember) await api(page, '/api/marks', { lemma, read, remember });
}

test('FR-401 RQ-52: after rating, the marking step lists the new words with two switches; Done drills some and grounds the rest', async ({ page }) => {
  await signIn(page);
  // Make the text's new words unmarked leaves again before the sample arrives (the account is shared between runs).
  for (const w of ['kopp', 'räkna', 'mörk', 'gärna', 'släcka', 'chef']) {
    await api(page, '/api/marks', { lemma: w, read: false, remember: false });
    await api(page, '/api/pick-up', { lemma: w });
    await api(page, '/api/marks', { lemma: w, read: false, remember: false });
  }
  const ids = await addSample(page);
  await page.goto(`/text?id=${ids['En bra dag']}`);
  await page.getByRole('button', { name: 'Most', exact: true }).click();
  await expect(page.locator('#marking-card')).toBeVisible();
  const rows = page.locator('#marking-list li');
  const n = await rows.count();
  expect(n).toBeGreaterThanOrEqual(4);
  await rows.nth(0).getByRole('button', { name: 'To read' }).click();
  await rows.nth(1).getByRole('button', { name: 'To remember' }).click();
  await page.locator('#marking-done').click();
  await expect(page.locator('#marking-message')).toHaveText(`2 to drill, ${n - 2} to your ground.`);
  await page.reload();
  await expect(page.locator('#marking-card')).toBeHidden();
});

test('FR-407 FR-406 RQ-06: Home shows the three stages; Review shows a due leaf in a sentence and finishes with All done', async ({ page }) => {
  await signIn(page);
  await addSample(page);
  await setState(page, 'gärna', { ground: true });
  await api(page, '/api/pick-up', { lemma: 'gärna' });
  await page.goto('/');
  for (const name of ['Discover', 'Review', 'Master']) await expect(page.locator('.stage-name', { hasText: name })).toBeVisible();
  await expect(page.locator('#review-count')).toContainText('due');
  await page.locator('#review-link').click();
  await expect(page.locator('#review-heading')).toHaveText('Review');
  for (let i = 0; i < 12; i += 1) {
    if (await page.locator('.message.ok', { hasText: 'All done' }).isVisible()) break;
    const option = page.locator('#review-box button.option:not([disabled])').first();
    if (await option.isVisible()) { await option.click(); await page.getByRole('button', { name: 'Next' }).click(); continue; }
    const show = page.getByRole('button', { name: 'Show' });
    if (await show.isVisible()) { await show.click(); await page.getByRole('button', { name: 'I knew it' }).click(); }
  }
  await expect(page.locator('.message.ok', { hasText: 'All done' })).toBeVisible();
});

test('FR-409 FR-410 FR-411 FR-412 RQ-07 RQ-08: menu switches, Let it fall, Pick up, and the Leaves page', async ({ page }) => {
  await signIn(page);
  const ids = await addSample(page);
  await setState(page, 'tolv', { read: true });
  await page.goto(`/text?id=${ids['En kall morgon']}`);
  await page.locator('button.w', { hasText: /^tårta$/ }).first().click();
  await expect(page.locator('#menu-pickup')).toBeVisible();
  await page.locator('#menu-remember').click();
  await expect(page.locator('#menu-remember')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('#menu-close').click();
  await setState(page, 'tårta', { ground: true });
  await page.goto(`/text?id=${ids['Olles väska']}`);
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
  await expect(page.locator('#leaves-read')).toContainText(word);
  await page.locator('#leaves-read li', { hasText: word }).getByRole('button', { name: 'Delete' }).click();
  await expect(page.locator('#leaves-read')).not.toContainText(word);
  await page.locator('#leaves-unmarked li', { hasText: 'servitör' }).getByRole('button', { name: 'To read' }).click();
  await expect(page.locator('#leaves-read')).toContainText('servitör');
});

test('FR-413 RQ-294: words are coloured by their marks and by the marks they had when they fell', async ({ page }) => {
  await signIn(page);
  const ids = await addSample(page);
  await setState(page, 'kopp', { read: true });
  await setState(page, 'räkna', { remember: true });
  await setState(page, 'mörk', { read: true, remember: true });
  await setState(page, 'gärna', { read: true });
  await api(page, '/api/let-it-fall', { lemma: 'gärna', confirmed: true });
  await page.goto(`/text?id=${ids['En bra dag']}`);
  await expect(page.locator('button.w', { hasText: /^kopparna$/ })).toHaveClass(/m-read/);
  await expect(page.locator('button.w', { hasText: /^räknar$/ })).toHaveClass(/m-remember/);
  await expect(page.locator('button.w', { hasText: /^mörkt$/ })).toHaveClass(/m-both/);
  await expect(page.locator('button.w', { hasText: /^gärna$/ })).toHaveClass(/f-read/);
});

test('FR-414 FR-415 RQ-03 RQ-71: Home shows the level line and today\'s minutes; Progress shows 14 day bars', async ({ page }) => {
  await signIn(page);
  // With level word lists present (G-06), the line shows the level; without them, "Set your starting level" (FR-414, FR-608).
  await expect(page.locator('#level-line')).toContainText(/Level: |Set your starting level/);
  await expect(page.locator('#level-line')).toContainText('min of input today');
  await page.goto('/progress');
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
