import { expect } from '@playwright/test';

// The terms screens (G-09 FR-911) for a sign-in that hasn't agreed yet: each Next is enabled after 3 s,
// so the page's clock is moved on instead of waiting; then the one Agree. Shared by every browser test
// that signs in (G-09 plan: Tests whose spec rules change; question-pages/76, 24). Call it on /terms.
export async function agreeTerms(page) {
  await page.clock.install();
  await page.reload();
  const agree = page.getByRole('button', { name: 'I am 13 or over and agree to the terms' });
  const next = page.getByRole('button', { name: 'Next' });
  await expect(page.locator('#step-title')).not.toBeEmpty();
  for (let i = 0; i < 12 && await agree.isHidden(); i += 1) {
    await page.clock.fastForward(3000);
    await next.click();
  }
  await agree.click();
}
