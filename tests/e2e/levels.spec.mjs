import { test, expect } from '@playwright/test';
import { agreeTerms } from './helpers.mjs';
import { REVIEWER, OWNER } from '../fakes/dev-accounts.mjs';

async function signIn(page, account) {
  await page.goto('/signin');
  await page.getByLabel('Email').fill(account.email);
  await page.getByLabel('Password').fill(account.password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL(/\/terms$/);
  await agreeTerms(page);
}

test('FR-602 C-05: the terms page links to Credits, which names the Kelly list and the font with their licences', async ({ page }) => {
  await page.goto('/terms');
  await page.getByRole('link', { name: /Credits/ }).click();
  await expect(page).toHaveURL(/\/credits$/);
  await expect(page.locator('main')).toContainText('Swedish Kelly list, Språkbanken');
  await expect(page.locator('main')).toContainText('CC BY-SA 3.0');
  await expect(page.locator('main')).toContainText('Zen Kaku Gothic New');
  await expect(page.locator('main')).toContainText('SIL Open Font Licence');
});

test('FR-605 FR-604 FR-606 RQ-248 RQ-114 RQ-252: a new account goes from the welcome to the starting check; A2 with two ticked words shows Level: A2; Settings offers the check again', async ({ page }, info) => {
  await signIn(page, OWNER);
  await page.waitForURL(/\/(start)?$/);
  if (info.project.name === 'phone') {
    if (await page.locator('#welcome').isVisible().catch(() => false)) await page.locator('#welcome-close').click();
    await expect(page).toHaveURL(/\/start$/);
  } else {
    await page.goto('/settings');
    await page.locator('#restart').click();
    await expect(page).toHaveURL(/\/start$/);
  }
  // G-06 FR-603 as amended (addendum 006, question-pages/82): Assess my level asks for a guess, then shows
  // the sample from that level.
  await page.getByRole('button', { name: 'Assess my level' }).click();
  await page.locator('#guess-levels button[data-level="A2"]').click();
  await expect(page.locator('#sample li')).toHaveCount(30);
  await page.locator('#sample input').nth(0).check();
  await page.locator('#sample input').nth(1).check();
  await page.locator('#confirm').click();
  await expect(page.locator('#start-message')).toContainText('joined your ground');
  await page.locator('#to-home').click();
  // G-09 FR-910: the level is on Progress, the starting check on Settings.
  await page.goto('/progress');
  await expect(page.locator('#progress-levels .lv.now .v')).toHaveText('A2');
  await page.goto('/settings');
  await expect(page.locator('#restart')).toBeVisible();
});

test('FR-606 FR-605 RQ-252 RQ-248: the reviewer goes to Home with no starting check and no "Set my starting level again"', async ({ page }) => {
  await signIn(page, REVIEWER);
  await page.waitForURL(/\/$/);
  await expect(page.locator('#tiles')).toBeVisible();
  await expect(page).toHaveURL(/\/$/);
  await page.goto('/settings');
  await expect(page.locator('#restart')).toBeHidden();
});

test('FR-603 FR-605 RQ-447 RQ-433 RQ-113: Pick my level lists each level with a line; a tap highlights it without applying it; Choose applies it; Not sure, assess checks the highlighted level', async ({ page }) => {
  await signIn(page, OWNER);
  await page.waitForURL(/\/(start)?$/);
  await page.goto('/start');
  await expect(page.getByRole('button', { name: 'Pick my level' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Assess my level' })).toBeVisible();
  await page.getByRole('button', { name: 'Pick my level' }).click();
  for (const level of ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']) {
    await expect(page.locator(`#levels button[data-level="${level}"] span`)).not.toBeEmpty();
  }
  await expect(page.getByRole('button', { name: 'Choose' })).toBeDisabled();
  await page.locator('#levels button[data-level="B2"]').click();
  await expect(page.locator('#levels button[data-level="B2"]')).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Not sure, assess' }).click();
  await expect(page.locator('#sample-heading')).toHaveText('Words from B2');
  await page.locator('#sample-back').click();
  await page.locator('#levels button[data-level="B1"]').click();
  await expect(page.locator('#levels button[data-level="B2"]')).toHaveAttribute('aria-pressed', 'false');
  await expect(page).toHaveURL(/\/start$/);
  await page.getByRole('button', { name: 'Choose' }).click();
  await page.waitForURL(/\/$/);
  await page.goto('/progress');
  await expect(page.locator('#progress-levels .lv.now .v')).toHaveText('B1');
});
