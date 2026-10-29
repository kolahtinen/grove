import { test, expect } from '@playwright/test';
import { REVIEWER } from '../fakes/dev-accounts.mjs';

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
  await page.getByLabel(/I agree to the terms/).check();
  await page.getByLabel(/I am 13 or over/).check();
  await page.getByRole('button', { name: 'Agree' }).click();
  await page.waitForURL(/\/$/);
  if (await page.locator('#welcome').isVisible()) await page.locator('#welcome-close').click();
}

const ORDER = ['Practise for X min', 'Texts', 'By skill', 'Dictionary', 'Just one mode', 'Progress'];

test('FR-901 RQ-419: Home is a grid of icon tiles in the spec\'s order; a tile opens below its row, one at a time, and Esc, ✕ or the tile again closes it with focus back on the tile', async ({ page }) => {
  await signIn(page);
  const tiles = page.locator('#tiles button.tile');
  await expect(page.getByRole('button', { name: 'Progress' })).toBeVisible();
  const names = await tiles.evaluateAll((list) => list.map((b) => b.getAttribute('aria-label')));
  expect(names.filter((n) => n !== 'Resume')).toEqual(ORDER);
  for (const t of await tiles.all()) {
    expect(await t.textContent()).toBe('');
    await expect(t.locator('svg')).toBeVisible();
    const box = await t.boundingBox();
    expect(Math.abs(box.width - box.height)).toBeLessThan(2);
    expect(box.width).toBeGreaterThanOrEqual(44);
  }
  const texts = page.getByRole('button', { name: 'Texts' });
  await texts.click();
  await expect(texts).toHaveAttribute('aria-expanded', 'true');
  const panel = page.locator('#tile-panel');
  await expect(panel).toBeVisible();
  await expect(page.locator('#tile-title')).toHaveText('Texts');
  await expect(page.locator('#tile-title')).toBeFocused();
  await expect(panel.getByRole('link', { name: 'Open Texts' })).toHaveAttribute('href', '/texts');
  // Below the opened tile's row: the panel's top is under every tile of that row.
  const [tBox, pBox] = [await texts.boundingBox(), await panel.boundingBox()];
  expect(pBox.y).toBeGreaterThan(tBox.y + tBox.height - 1);
  await page.keyboard.press('Escape');
  await expect(panel).toBeHidden();
  await expect(texts).toBeFocused();
  const progress = page.getByRole('button', { name: 'Progress' });
  await progress.click();
  await expect(page.locator('#tile-title')).toHaveText('Progress');
  await page.getByRole('button', { name: 'By skill' }).click();
  await expect(page.locator('#tile-title')).toHaveText('By skill');
  await expect(progress).toHaveAttribute('aria-expanded', 'false');
  await page.getByRole('button', { name: 'By skill' }).click();
  await expect(panel).toBeHidden();
  await page.getByRole('button', { name: 'Dictionary' }).click();
  await panel.getByRole('button', { name: 'Close' }).click();
  await expect(panel).toBeHidden();
  await expect(page.getByRole('button', { name: 'Dictionary' })).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('FR-901 FR-903 FR-904 RQ-419 RQ-421: Practise for X min starts a session; while it is going Resume is the first tile and opens it', async ({ page }) => {
  await signIn(page);
  await page.getByRole('button', { name: 'Practise for X min' }).click();
  await expect(page.getByRole('radio', { name: '10 min' })).toHaveAttribute('aria-checked', 'true');
  for (const m of [3, 5, 20, 30]) await expect(page.getByRole('radio', { name: `${m} min` })).toBeVisible();
  await page.getByLabel('Other length in minutes').fill('61');
  await page.locator('#tile-panel').getByRole('button', { name: 'Start' }).click();
  await expect(page.locator('#tile-panel .message')).toHaveText('Choose a length from 3 to 60 minutes.');
  await page.getByRole('radio', { name: '5 min' }).click();
  await page.locator('#tile-panel').getByRole('button', { name: 'Start' }).click();
  await page.waitForURL(/\/session$/);
  await expect(page.locator('#session-line')).toContainText('5-minute session');
  await page.goto('/');
  const first = page.locator('#tiles button.tile').first();
  await expect(first).toHaveAttribute('aria-label', 'Resume');
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
  await page.waitForURL(/\/session$/);
  await expect(page.locator('#session-line')).toContainText('5-minute session');
  await page.goto('/');
  await page.getByRole('button', { name: 'Just one mode' }).click();
  for (const mode of ['Discover', 'Review', 'Master']) await expect(panel.getByRole('button', { name: mode })).toBeVisible();
  await panel.getByRole('button', { name: 'Discover' }).click();
  await page.waitForURL(/\/session$/);
  await expect(page.locator('#session-line')).toContainText('Discover');
});
