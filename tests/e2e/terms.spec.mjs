import { test, expect } from '@playwright/test';

test('FR-025 RQ-141 RQ-228 RQ-376: the terms page is public and says each required point', async ({ page }) => {
  const res = await page.goto('/terms');
  expect(res.status()).toBe(200);
  await expect(page).toHaveURL(/\/terms$/);
  const text = await page.locator('.terms').innerText();
  for (const phrase of [
    /13 or over/,
    /right to share/,
    /first time leads to a fixed suspension and the second time to a ban/,
    /What grove keeps and why/,
    /Firebase Authentication \(Google\)/,
    /Cloudflare/,
    /governed by that AI’s own terms/,
    /only automatic checks, so they may contain mistakes/,
    /reviewer account is shared/,
    /copy of your data, or to have it deleted, ask the owner/,
  ]) expect(text).toMatch(phrase);
});
