import { test, expect } from '@playwright/test';
import { startTestGrove } from '../fakes/harness.mjs';

test('FR-032 RQ-408: right after a restart, the loading page shows grove\'s logo, its message and a progress bar, then opens the page asked for by itself', async ({ page }) => {
  let open;
  const gate = new Promise((resolve) => { open = resolve; });
  const held = { name: 'held', size: 10, async *steps() { yield 5; await gate; yield 5; } };
  const t = await startTestGrove({ host: 'localhost', loads: [held], waitReady: false });
  try {
    await page.goto(`${t.base}/signin`);
    await expect(page.getByText('grove is starting — this takes a few seconds.')).toBeVisible();
    await expect(page.locator('.brand .logo')).toBeVisible();
    await expect(page.locator('.brand .title')).toHaveText('grove');
    const bar = page.getByRole('progressbar', { name: 'Loading grove' });
    await expect(bar).toHaveAttribute('value', '0.5');
    open();
    await page.waitForURL(`${t.base}/signin`);
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
  } finally {
    open();
    await t.close();
  }
});
