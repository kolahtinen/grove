import { test, expect } from '@playwright/test';
import { agreeTerms } from './helpers.mjs';
import { REVIEWER, HTMLISH } from '../fakes/dev-accounts.mjs';

async function signIn(page, account) {
  await page.goto('/signin');
  await page.getByLabel('Email').fill(account.email);
  await page.getByLabel('Password').fill(account.password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/terms$/);
  await agreeTerms(page);
  await expect(page).toHaveURL(/\/$/);
}

test('FR-024 RQ-331 RQ-367: every page, signed out and signed in, contacts only grove and loads fonts from /fonts/', async ({ page, baseURL }) => {
  const origin = new URL(baseURL).origin;
  const requests = [];
  page.on('request', (request) => requests.push(request.url()));
  for (const path of ['/signin', '/reset', '/terms']) {
    await page.goto(path);
    await page.waitForLoadState('networkidle');
  }
  await signIn(page, REVIEWER);
  for (const path of ['/', '/terms']) {
    await page.goto(path);
    await page.waitForLoadState('networkidle');
  }
  const outside = requests.filter((url) => !url.startsWith(origin) && !url.startsWith('data:'));
  expect(outside).toEqual([]);
  const fonts = requests.filter((url) => url.endsWith('.woff2'));
  expect(fonts.length).toBeGreaterThan(0);
  for (const url of fonts) expect(new URL(url).pathname.startsWith('/fonts/')).toBe(true);
});

test('FR-024 FR-910 RQ-367 RQ-427: an account email with HTML in it is shown as text on the Account page (constitution 4.6)', async ({ page }) => {
  await signIn(page, HTMLISH);
  // G-09 FR-902 takes the email out of the top bar; FR-910 shows it on Account.
  await page.goto('/profile');
  const email = page.locator('#account-email-page');
  await expect(email).toHaveText(HTMLISH.email);
  await expect(email.locator('b')).toHaveCount(0);
});
