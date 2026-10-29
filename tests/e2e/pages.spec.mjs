import { test, expect } from '@playwright/test';
import { agreeTerms } from './helpers.mjs';
import { REVIEWER } from '../fakes/dev-accounts.mjs';

async function signIn(page) {
  await page.goto('/signin');
  await page.getByLabel('Email').fill(REVIEWER.email);
  await page.getByLabel('Password').fill(REVIEWER.password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL(/\/terms$/);
  await agreeTerms(page);
  await page.waitForURL(/\/$/);
}

// The ☰ menu that links to these pages comes with FR-902; until then they are opened by address.
test('FR-910 RQ-427: Settings holds the speech speed with its note and the voice help, Speak words, and the starting level; changes are kept', async ({ page }) => {
  await signIn(page);
  await page.goto('/settings');
  await expect(page.locator('#speed')).toBeVisible();
  await expect(page.getByText("How well the speed works depends on your device's voice.")).toBeVisible();
  await page.getByText('No Swedish voice?').click();
  await expect(page.locator('#voice-help')).toContainText('Settings → Accessibility → Spoken Content');
  const speak = page.locator('#speak-words');
  const before = await speak.getAttribute('aria-pressed');
  await speak.click();
  await expect(speak).toHaveAttribute('aria-pressed', before === 'true' ? 'false' : 'true');
  await page.reload();
  await expect(speak).toHaveAttribute('aria-pressed', before === 'true' ? 'false' : 'true');
  await speak.click();
  // The reviewer starts with its demo history, so the starting level can't be set again (G-06 FR-606).
  await expect(page.locator('#no-restart')).toBeVisible();
});

test('FR-910 RQ-427 RQ-229: Account shows the email, Sign out and how to ask for an export or deletion; Progress shows the level and today\'s minutes', async ({ page }) => {
  await signIn(page);
  await page.goto('/progress');
  await expect(page.locator('#progress-level')).toContainText('min of input today');
  await page.goto('/profile');
  await expect(page.locator('#account-email-page')).toHaveText(REVIEWER.email);
  await expect(page.locator('main')).toContainText('To get a copy of your data, or to have it deleted, ask the owner.');
  await page.locator('#account-signout').click();
  await page.waitForURL(/\/signin$/);
});
