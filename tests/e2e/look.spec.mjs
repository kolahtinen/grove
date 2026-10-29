import { test, expect } from '@playwright/test';

const style = (locator, prop) => locator.evaluate((el, p) => getComputedStyle(el).getPropertyValue(p), prop);
const rootVar = (page, name) => page.evaluate((n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim(), name);

// Palette 14 (G-09 FR-913 replaces Appendix A.1's colours).
const TOKENS = {
  dark: { '--bg': '#0F110E', '--card': '#1A1F1A', '--card2': '#222822', '--ink': '#E9EBE3', '--accent': '#6FA27E', '--accent2': '#97C3A2', '--muted': '#9AA095', '--discover': '#F0C28F', '--review': '#DE9A66', '--master': '#CF7A5E' },
  light: { '--bg': '#ECE5DA', '--card': '#EEEEE2', '--card2': '#F5F4EC', '--ink': '#26241F', '--accent': '#2F5A40', '--accent2': '#5E8A66', '--muted': '#6A6761', '--discover': '#92592C', '--review': '#74432C', '--master': '#4B2E2B' },
};
const RGB = { dark: { bg: 'rgb(15, 17, 14)', ink: 'rgb(233, 235, 227)' }, light: { bg: 'rgb(236, 229, 218)', ink: 'rgb(38, 36, 31)' } };

for (const scheme of ['dark', 'light']) {
  test(`FR-026 FR-913 RQ-306 RQ-334 RQ-335 RQ-426: in ${scheme} mode the page uses palette 14's ${scheme} tokens`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto('/signin');
    const body = page.locator('body');
    expect(await style(body, 'background-color')).toBe(RGB[scheme].bg);
    expect(await style(body, 'color')).toBe(RGB[scheme].ink);
    for (const [name, value] of Object.entries(TOKENS[scheme])) expect(await rootVar(page, name), name).toBe(value);
  });
}

test('FR-027 RQ-331 RQ-337: text uses Zen Kaku Gothic New at 15px with line height 1.6', async ({ page }) => {
  await page.goto('/signin');
  const body = page.locator('body');
  expect((await style(body, 'font-family')).replace(/"/g, "'")).toMatch(/^'Zen Kaku Gothic New', 'Hiragino Sans', 'Noto Sans JP'/);
  expect(await style(body, 'font-size')).toBe('15px');
  expect(await style(body, 'line-height')).toBe('24px');
  const loaded = await page.evaluate(async () => (await document.fonts.load("15px 'Zen Kaku Gothic New'", 'Sign in')).length);
  expect(loaded).toBeGreaterThan(0);
});

test('FR-005 FR-030 RQ-23 RQ-38 RQ-341 RQ-309: one centred column at most 560px, no sideways scroll, a sticky blurred top bar with the logo and tagline', async ({ page }) => {
  for (const path of ['/signin', '/reset', '/terms']) {
    await page.goto(path);
    const main = page.locator('main');
    const box = await main.boundingBox();
    const viewport = page.viewportSize();
    expect(box.width).toBeLessThanOrEqual(560);
    expect(Math.abs(box.x + box.width / 2 - viewport.width / 2)).toBeLessThan(2);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    const bar = page.locator('.topbar');
    expect(await style(bar, 'position')).toBe('sticky');
    expect(await style(bar, 'backdrop-filter')).toBe('blur(14px)');
    await expect(bar.locator('svg.logo')).toBeVisible();
    await expect(bar.locator('.tagline')).toHaveText('grow from what you know');
  }
});

test('FR-028 RQ-314 RQ-338 RQ-339: cards have radius 22px, an 18px backdrop blur and the card shadow', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/signin');
  const card = page.locator('.card').first();
  expect(await style(card, 'border-radius')).toBe('22px');
  expect(await style(card, 'backdrop-filter')).toBe('blur(18px) saturate(1.4)');
  expect(await style(card, 'box-shadow')).toBe('rgba(0, 0, 0, 0.45) 0px 12px 34px 0px');
});

test('FR-029 FR-913 RQ-316 RQ-340 RQ-426: buttons are rounded 14px, main buttons use the accent gradient, and a pressed button shrinks to 97%', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/signin');
  const button = page.getByRole('button', { name: 'Sign in' });
  expect(await style(button, 'border-radius')).toBe('14px');
  expect(await style(button, 'background-image')).toBe('linear-gradient(135deg, rgb(111, 162, 126), rgb(151, 195, 162))');
  const box = await button.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(200);
  expect(await style(button, 'transform')).toBe('matrix(0.97, 0, 0, 0.97, 0, 0)');
  await page.mouse.up();
});

test('FR-031 RQ-314 R-15: with reduced motion, cards and the top bar drop the blur', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/signin');
  expect(await style(page.locator('.card').first(), 'backdrop-filter')).toBe('none');
  expect(await style(page.locator('.topbar'), 'backdrop-filter')).toBe('none');
});
