import { test, expect } from '@playwright/test';
import { REVIEWER } from '../fakes/dev-accounts.mjs';

const SECTIONS = ['Who grove is for', 'Texts you share', 'What grove keeps and why', 'Who else handles your data', 'Your rights'];

test('FR-911 RQ-428 RQ-228: a new sign-in reads the terms one section per screen, Next after 3 s, Back, and one Agree that says what it means', async ({ page }) => {
  await page.clock.install();
  await page.goto('/signin');
  await page.getByLabel('Email').fill(REVIEWER.email);
  await page.getByLabel('Password').fill(REVIEWER.password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL(/\/terms$/);
  const next = page.getByRole('button', { name: 'Next' });
  const agree = page.getByRole('button', { name: 'I am 13 or over and agree to the terms' });
  await expect(page.locator('#whole-terms')).toBeHidden();
  await expect(page.locator('#step-title')).toHaveText(SECTIONS[0]);
  await expect(page.locator('#step-count')).toHaveText(`Terms, 1 of ${SECTIONS.length}`);
  await expect(page.locator('#step-body')).toContainText('13 or over');
  await expect(page.getByRole('button', { name: 'Back' })).toBeHidden();
  await expect(next).toBeDisabled();
  await page.clock.fastForward(2500);
  await expect(next).toBeDisabled();
  await page.clock.fastForward(600);
  await expect(next).toBeEnabled();
  await next.click();
  await expect(page.locator('#step-title')).toHaveText(SECTIONS[1]);
  await expect(next).toBeDisabled();
  await page.getByRole('button', { name: 'Back' }).click();
  await expect(page.locator('#step-title')).toHaveText(SECTIONS[0]);
  for (let i = 1; i < SECTIONS.length; i += 1) {
    await page.clock.fastForward(3100);
    await next.click();
    await expect(page.locator('#step-title')).toHaveText(SECTIONS[i]);
  }
  await expect(next).toBeHidden();
  await expect(agree).toBeVisible();
  await expect(page.getByRole('button', { name: 'Back' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Read the whole terms on one page' })).toHaveAttribute('href', '/terms?whole=1');
  await expect(page.getByRole('checkbox')).toHaveCount(0);
  await agree.click();
  await page.waitForURL(/\/$/);
  const agreed = await page.evaluate(async () => (await (await fetch('/api/me')).json()).termsAgreed);
  expect(agreed).toBe(true);
});

test('FR-911 FR-025 RQ-428 RQ-141: signed out, /terms is still the whole terms on one page', async ({ page }) => {
  await page.goto('/terms');
  await expect(page.locator('#whole-terms')).toBeVisible();
  await expect(page.locator('#agreement')).toBeHidden();
  for (const title of SECTIONS) await expect(page.locator('#whole-terms').getByRole('heading', { name: title })).toBeVisible();
});
