import { test, expect } from '@playwright/test';
import { agreeTerms } from './helpers.mjs';
import { REVIEWER } from '../fakes/dev-accounts.mjs';
import { startTestGrove, PASSWORD } from '../fakes/harness.mjs';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const fake = { speak(u) { setTimeout(() => u.onend && u.onend(), 30); }, cancel() {}, getVoices() { return [{ lang: 'sv-SE', name: 'Fake' }]; } };
    Object.defineProperty(window, 'speechSynthesis', { value: fake, configurable: true });
  });
});

async function signIn(page) {
  await page.goto('/signin');
  await page.getByLabel('Email').fill(REVIEWER.email);
  await page.getByLabel('Password').fill(REVIEWER.password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL(/\/terms$/);
  await agreeTerms(page);
  await page.waitForURL(/\/$/);
  if (await page.locator('#welcome').isVisible()) await page.locator('#welcome-close').click();
}

// G-09 FR-901 as amended by addendum 005 (question-pages/77, 3 and 8; question-pages/76, 2): three
// headed groups of labelled tiles.
// FR-905 (question-pages/78, 3): a session that would run short first offers a new text or Fill the time.
async function fillIfShort(page) {
  const fill = page.getByRole('group', { name: 'This session would be short' }).getByRole('button', { name: 'Fill the time' });
  await expect(fill.or(page.locator('#session-line'))).toBeVisible();
  if (await fill.isVisible()) await fill.click();
}

const GROUPS = { Learning: ['Practise', 'By skill', 'One mode'], Library: ['Common library', 'Your library'], Progress: ['Progress'] };

test('FR-901 RQ-419 RQ-429: Home has three headed groups of labelled icon tiles in the spec\'s order; a tile opens below its row, one at a time, and Esc, ✕ or the tile again closes it with focus back on the tile', async ({ page }) => {
  await signIn(page);
  await expect(page.getByRole('button', { name: 'Progress' })).toBeVisible();
  for (const [heading, labels] of Object.entries(GROUPS)) {
    const group = page.getByRole('region', { name: heading });
    await expect(group.getByRole('heading', { name: heading })).toBeVisible();
    const names = await group.locator('button.tile').evaluateAll((list) => list.map((b) => b.textContent.trim()));
    expect(names.filter((n) => n !== 'Resume')).toEqual(labels);
  }
  for (const t of await page.locator('#tiles button.tile').all()) {
    await expect(t.locator('svg')).toBeVisible();
    await expect(t.locator('.tile-label')).toBeVisible();
    const box = await t.boundingBox();
    expect(Math.abs(box.width - box.height)).toBeLessThan(2);
    expect(box.width).toBeGreaterThanOrEqual(44);
  }
  const yours = page.getByRole('button', { name: 'Your library' });
  await yours.click();
  await expect(yours).toHaveAttribute('aria-expanded', 'true');
  const panel = page.locator('#tile-panel');
  await expect(panel).toBeVisible();
  await expect(page.locator('#tile-title')).toHaveText('Your library');
  await expect(page.locator('#tile-title')).toBeFocused();
  await expect(panel.getByRole('link', { name: 'Open your library' })).toHaveAttribute('href', '/texts');
  await expect(panel.getByRole('link', { name: 'Add a text' })).toHaveAttribute('href', '/add');
  await expect(panel.getByRole('link', { name: 'Your dictionary' })).toHaveAttribute('href', '/dictionary');
  await expect(panel.getByRole('link', { name: 'Your leaves' })).toHaveAttribute('href', '/leaves');
  // Below the opened tile's row: the panel's top is under every tile of that row.
  const [tBox, pBox] = [await yours.boundingBox(), await panel.boundingBox()];
  expect(pBox.y).toBeGreaterThan(tBox.y + tBox.height - 1);
  await page.keyboard.press('Escape');
  await expect(panel).toBeHidden();
  await expect(yours).toBeFocused();
  const common = page.getByRole('button', { name: 'Common library' });
  await common.click();
  await expect(panel.getByRole('link', { name: 'Open the common library' })).toHaveAttribute('href', '/library');
  await page.getByRole('button', { name: 'By skill' }).click();
  await expect(page.locator('#tile-title')).toHaveText('By skill');
  await expect(common).toHaveAttribute('aria-expanded', 'false');
  await page.getByRole('button', { name: 'By skill' }).click();
  await expect(panel).toBeHidden();
  const progress = page.getByRole('button', { name: 'Progress' });
  await progress.click();
  await panel.getByRole('button', { name: 'Close' }).click();
  await expect(panel).toBeHidden();
  await expect(progress).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('FR-901 FR-903 FR-904 RQ-419 RQ-421: Practise for X min starts a session; while it is going Resume is the first tile and opens it', async ({ page }) => {
  await signIn(page);
  await page.getByRole('button', { name: 'Practise' }).click();
  await expect(page.getByRole('radio', { name: '10 min' })).toHaveAttribute('aria-checked', 'true');
  for (const m of [3, 5, 20, 30]) await expect(page.getByRole('radio', { name: `${m} min` })).toBeVisible();
  await page.getByLabel('Other length in minutes').fill('61');
  await page.locator('#tile-panel').getByRole('button', { name: 'Start' }).click();
  await expect(page.locator('#tile-panel .message')).toHaveText('Choose a length from 3 to 60 minutes.');
  await page.getByRole('radio', { name: '5 min' }).click();
  await page.locator('#tile-panel').getByRole('button', { name: 'Start' }).click();
  await fillIfShort(page);
  await page.waitForURL(/\/session$/);
  await expect(page.locator('#session-line')).toContainText('5-minute session');
  await page.goto('/');
  const first = page.locator('#tiles button.tile').first();
  await expect(first).toHaveText('Resume');
  await first.click();
  await page.locator('#tile-panel').getByRole('link', { name: 'Resume' }).click();
  await page.waitForURL(/\/session$/);
  await expect(page.locator('#session-line')).toContainText('5-minute session');
});

test('FR-902 RQ-420: the top bar has the logo linking Home and ☰ with Account, Settings, Help and Sign out; Help shows How grove works in a bubble with Replay', async ({ page }) => {
  await signIn(page);
  await page.goto('/progress');
  const bar = page.locator('.topbar');
  await expect(bar.locator('a.brand')).toHaveAttribute('href', '/');
  await expect(bar.locator('.account-email')).toHaveCount(0);
  await expect(bar.locator('.help-link')).toHaveCount(0);
  const menuButton = bar.getByRole('button', { name: 'Menu' });
  const mb = await menuButton.boundingBox();
  expect(mb.width).toBeGreaterThanOrEqual(44);
  expect(mb.height).toBeGreaterThanOrEqual(44);
  await menuButton.click();
  const menu = page.locator('#site-menu');
  await expect(menu.locator('.menu-item')).toHaveText(['Account', 'Settings', 'Help', 'Sign out']);
  await expect(menu.getByRole('link', { name: 'Account' })).toHaveAttribute('href', '/profile');
  await expect(menu.getByRole('link', { name: 'Settings' })).toHaveAttribute('href', '/settings');
  await menu.getByRole('button', { name: 'Help' }).click();
  const help = page.getByRole('dialog', { name: 'How grove works' });
  await expect(help).toBeVisible();
  await expect(help.getByRole('heading', { name: 'How grove works' })).toBeVisible();
  await expect(help.getByRole('button', { name: 'Replay' })).toBeVisible();
  await help.getByRole('button', { name: 'Close' }).click();
  await expect(help).toHaveCount(0);
  await menuButton.click();
  await menu.getByRole('button', { name: 'Help' }).click();
  await page.mouse.click(5, (page.viewportSize().height) - 5);
  await expect(page.getByRole('dialog', { name: 'How grove works' })).toHaveCount(0);
  await menuButton.click();
  await menu.getByRole('button', { name: 'Sign out' }).click();
  await page.waitForURL(/\/signin$/);
});

test('FR-906 FR-908 RQ-423 RQ-424: By skill offers four skills in three forms and starts a session; Just one mode starts Discover, Review or Master on its own', async ({ page }) => {
  await signIn(page);
  await page.getByRole('button', { name: 'By skill' }).click();
  const panel = page.locator('#tile-panel');
  for (const skill of ['Reading', 'Listening', 'Words and phrases', 'Grammar']) {
    for (const [form, minutes] of [['short', 5], ['medium', 10], ['long', 20]]) {
      await expect(panel.getByRole('button', { name: `${skill}, ${form} (${minutes} min)` })).toBeVisible();
    }
  }
  await panel.getByRole('button', { name: 'Words and phrases, short (5 min)' }).click();
  await fillIfShort(page);
  await page.waitForURL(/\/session$/);
  await expect(page.locator('#session-line')).toContainText('5-minute session');
  await page.goto('/');
  await page.getByRole('button', { name: 'One mode' }).click();
  for (const mode of ['Discover', 'Review', 'Master']) await expect(panel.getByRole('button', { name: mode })).toBeVisible();
  await panel.getByRole('button', { name: 'Discover' }).click();
  await page.waitForURL(/\/session$/);
  await expect(page.locator('#session-line')).toContainText('Discover');
});

test('FR-916 FR-917 RQ-431 RQ-432: the Common library says its texts are coming and searches the common dictionary as you type, with meanings and levels; a word can be added as a leaf', async ({ page }) => {
  await signIn(page);
  await page.getByRole('button', { name: 'Common library' }).click();
  await page.locator('#tile-panel').getByRole('link', { name: 'Open the common library' }).click();
  await page.waitForURL(/\/library$/);
  await expect(page.locator('#library-coming')).toContainText('coming');
  await page.getByLabel('Search').fill('p');
  await expect(page.locator('#lexicon-results li')).toHaveCount(0);
  const word = 'pingvin';
  await page.getByLabel('Search').fill(word);
  const item = page.locator('#lexicon-results li', { has: page.locator('.text-title', { hasText: new RegExp(`^${word}$`) }) });
  await expect(item).toBeVisible();
  await expect(item.locator('.lexicon-en')).not.toBeEmpty();
  const add = item.getByRole('button', { name: `Add ${word} as a leaf` });
  if (await add.isVisible()) {
    await add.click();
    await expect(item).toContainText('added as a leaf');
  } else {
    await expect(item.locator('.text-state')).toHaveText(/a leaf|in your ground/);
  }
});

test('FR-920 RQ-434: with no unread text, Practise first says so and offers Add a text or practising without a text', async ({ page }) => {
  const t = await startTestGrove({ host: 'localhost' });
  try {
    const learner = t.seedAccount({ email: 'no-texts@example.test' });
    t.grove.db.prepare('INSERT OR IGNORE INTO learner_settings (account_id) VALUES (?)').run(learner.id);
    t.grove.db.prepare('UPDATE learner_settings SET start_done = 1, welcome_dismissed = 1 WHERE account_id = ?').run(learner.id);
    await page.goto(`${t.base}/signin`);
    await page.getByLabel('Email').fill('no-texts@example.test');
    await page.getByLabel('Password').fill(PASSWORD);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.waitForURL(/\/terms$/);
    await agreeTerms(page);
    await page.waitForURL(`${t.base}/`);
    await page.getByRole('button', { name: 'Practise' }).click();
    await page.locator('#tile-panel').getByRole('button', { name: 'Start' }).click();
    const offer = page.getByRole('group', { name: 'You have no new texts' });
    await expect(offer).toBeVisible();
    await expect(offer.getByRole('link', { name: 'Add a text' })).toHaveAttribute('href', '/add');
    await offer.getByRole('button', { name: 'Practise without a text' }).click();
    // Nothing at all to practise for this learner: the panel says so (FR-905).
    await expect(page.locator('#tile-panel .message')).toContainText('nothing to practise');
  } finally {
    await t.close();
  }
});
