import { test, expect } from '@playwright/test';
import { REVIEWER } from '../fakes/dev-accounts.mjs';

test('FR-011 FR-014 RQ-228 RQ-226: sign in, agree on the terms, see the header, sign out, and agree again next time', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/signin$/);

  await page.getByLabel('Email').fill(REVIEWER.email);
  await page.getByLabel('Password').fill(REVIEWER.password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/terms$/);

  const agree = page.getByRole('button', { name: 'Agree' });
  await expect(agree).toBeDisabled();
  await page.getByLabel(/I agree to the terms/).check();
  await expect(agree).toBeDisabled();
  await page.getByLabel(/I am 13 or over/).check();
  await expect(agree).toBeEnabled();
  await agree.click();

  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('.account-email')).toHaveText(REVIEWER.email);
  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(page).toHaveURL(/\/signin$/);

  await page.getByLabel('Email').fill(REVIEWER.email);
  await page.getByLabel('Password').fill(REVIEWER.password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/terms$/);
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
