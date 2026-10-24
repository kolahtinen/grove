import { test, expect } from '@playwright/test';

test('FR-015 RQ-219: the reset page sends and says an email is on its way if the address has an account', async ({ page }) => {
  await page.goto('/signin');
  await page.getByRole('link', { name: 'Forgot your password?' }).click();
  await expect(page).toHaveURL(/\/reset$/);
  await page.getByLabel('Email').fill('reviewer@example.test');
  await page.getByRole('button', { name: 'Send reset email' }).click();
  await expect(page.locator('.message')).toHaveText('If this address has an account, an email is on its way.');
});
