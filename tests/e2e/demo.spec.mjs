import { test, expect } from '@playwright/test';
import { agreeTerms } from './helpers.mjs';
import { REVIEWER } from '../fakes/dev-accounts.mjs';

test('FR-704 FR-705 FR-909 RQ-362 RQ-363: the reviewer lands on Home as the demo learner: four demo texts on Texts, no starting check offered, minutes on earlier days', async ({ page }) => {
  await page.goto('/signin');
  await page.getByLabel('Email').fill(REVIEWER.email);
  await page.getByLabel('Password').fill(REVIEWER.password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL(/\/terms$/);
  await agreeTerms(page);
  await page.waitForURL(/\/$/);
  // G-09 FR-901, FR-909, FR-910: Home is the tile grid, the texts are on Texts, the starting check on Settings.
  await expect(page.locator('#tiles')).toBeVisible();
  await page.goto('/settings');
  await expect(page.locator('#restart')).toBeHidden();
  await page.goto('/texts');
  for (const title of ['En kall morgon', 'Brevet i väskan', 'Lördag på torget', 'Den borttappade nyckeln']) {
    await expect(page.locator('#texts')).toContainText(title);
  }
  await page.goto('/progress');
  await expect(page.locator('#bars .bar')).toHaveCount(14);
  const withMinutes = await page.locator('#bars .bar').evaluateAll((bars) => bars.filter((b) => b.getAttribute('aria-label').match(/: [1-9]\d* minutes/)).length);
  expect(withMinutes).toBeGreaterThanOrEqual(3);
});
