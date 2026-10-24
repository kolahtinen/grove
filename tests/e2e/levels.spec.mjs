import { test, expect } from '@playwright/test';
import { REVIEWER, OWNER } from '../fakes/dev-accounts.mjs';

async function signIn(page, account) {
  await page.goto('/signin');
  await page.getByLabel('Email').fill(account.email);
  await page.getByLabel('Password').fill(account.password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL(/\/terms$/);
  await page.getByLabel(/I agree to the terms/).check();
  await page.getByLabel(/I am 13 or over/).check();
  await page.getByRole('button', { name: 'Agree' }).click();
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

test('FR-605 FR-604 FR-606 RQ-248 RQ-114 RQ-252: a new account goes from the welcome to the starting check; A2 with two ticked words shows Level: A2; Home offers the check again', async ({ page }, info) => {
  await signIn(page, OWNER);
  await page.waitForURL(/\/(start)?$/);
  if (info.project.name === 'phone') {
    if (await page.locator('#welcome').isVisible().catch(() => false)) await page.locator('#welcome-close').click();
    await expect(page).toHaveURL(/\/start$/);
  } else {
    await page.goto('/');
    await page.locator('#restart').click();
    await expect(page).toHaveURL(/\/start$/);
  }
  await page.locator('#levels button[data-level="A2"]').click();
  await expect(page.locator('#sample li')).toHaveCount(30);
  await page.locator('#sample input').nth(0).check();
  await page.locator('#sample input').nth(1).check();
  await page.locator('#confirm').click();
  await expect(page.locator('#start-message')).toContainText('joined your ground');
  await page.locator('#to-home').click();
  await expect(page.locator('#level-line')).toContainText('Level: A2');
  await expect(page.locator('#restart')).toBeVisible();
});

test('FR-606 FR-605 RQ-252 RQ-248: the reviewer goes to Home with no starting check and no "Set my starting level again"', async ({ page }) => {
  await signIn(page, REVIEWER);
  await page.waitForURL(/\/$/);
  await expect(page.locator('#stages-card')).toBeVisible();
  await expect(page.locator('#restart')).toBeHidden();
  await expect(page).toHaveURL(/\/$/);
});
