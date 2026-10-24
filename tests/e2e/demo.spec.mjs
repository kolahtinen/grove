import { test, expect } from '@playwright/test';
import { REVIEWER } from '../fakes/dev-accounts.mjs';

test('FR-704 FR-705 RQ-362 RQ-363: the reviewer lands on Home as the demo learner: Review and Master ready, four demo texts, minutes on earlier days', async ({ page }) => {
  await page.goto('/signin');
  await page.getByLabel('Email').fill(REVIEWER.email);
  await page.getByLabel('Password').fill(REVIEWER.password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL(/\/terms$/);
  await page.getByLabel(/I agree to the terms/).check();
  await page.getByLabel(/I am 13 or over/).check();
  await page.getByRole('button', { name: 'Agree' }).click();
  await page.waitForURL(/\/$/);
  await expect(page.locator('#stages-card')).toBeVisible();
  await expect(page.locator('#restart')).toBeHidden();
  for (const title of ['En kall morgon', 'Brevet i väskan', 'Lördag på torget', 'Den borttappade nyckeln']) {
    await expect(page.locator('#texts')).toContainText(title);
  }
  await page.goto('/progress');
  await expect(page.locator('#bars .bar')).toHaveCount(14);
  const withMinutes = await page.locator('#bars .bar').evaluateAll((bars) => bars.filter((b) => b.getAttribute('aria-label').match(/: [1-9]\d* minutes/)).length);
  expect(withMinutes).toBeGreaterThanOrEqual(3);
});
