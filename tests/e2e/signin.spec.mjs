import { test, expect } from '@playwright/test';
import { agreeTerms } from './helpers.mjs';
import { REVIEWER } from '../fakes/dev-accounts.mjs';

test('FR-011 FR-911 FR-902 RQ-228 RQ-437 RQ-428 RQ-420: sign in, agree on the terms, sign out from ☰; the same device goes straight in next time, a new device agrees again', async ({ page, browser }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/signin$/);

  await page.getByLabel('Email').fill(REVIEWER.email);
  await page.getByLabel('Password').fill(REVIEWER.password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/terms$/);

  // G-09 FR-911 replaces FR-011's two boxes with the terms screens (tests/e2e/terms-screens.spec.mjs).
  await agreeTerms(page);

  await expect(page).toHaveURL(/\/$/);
  // G-09 FR-902 replaces FR-014's email and Sign out in the bar: Sign out is in the ☰ menu.
  await page.getByRole('button', { name: 'Menu' }).click();
  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(page).toHaveURL(/\/signin$/);

  // G-01 FR-011 as amended (addendum 005, constitution 3.1 2.0.0): this device already agreed.
  await page.getByLabel('Email').fill(REVIEWER.email);
  await page.getByLabel('Password').fill(REVIEWER.password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/$/);

  const other = await browser.newContext();
  const second = await other.newPage();
  await second.goto(new URL('/signin', page.url()).href);
  await second.getByLabel('Email').fill(REVIEWER.email);
  await second.getByLabel('Password').fill(REVIEWER.password);
  await second.getByRole('button', { name: 'Sign in' }).click();
  await expect(second).toHaveURL(/\/terms$/);
  await other.close();
});

test('FR-012 RQ-372: a wrong password shows the same plain message as an unknown address', async ({ page }) => {
  await page.goto('/signin');
  await page.getByLabel('Email').fill(REVIEWER.email);
  await page.getByLabel('Password').fill('Not-the-password-1');
  await page.getByRole('button', { name: 'Sign in' }).click();
  const message = page.locator('.message');
  await expect(message).toHaveText('Wrong email or password.');
  await page.getByLabel('Email').fill('nobody@example.test');
  await page.getByLabel('Password').fill('Not-the-password-1');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(message).toHaveText('Wrong email or password.');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(message).toHaveText('Please enter your email and password.');
});
