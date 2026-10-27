import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { REVIEWER } from '../fakes/dev-accounts.mjs';

const SAMPLE = readFileSync(new URL('../texts/answers/good-patterns.json', import.meta.url), 'utf8');
const CAPTIONS = ['Every word you save is a leaf.', 'When you know it, it falls to the ground.', 'Your ground feeds everything you read next.', 'grove · grow from what you know'];

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const fake = { speak(u) { setTimeout(() => u.onend && u.onend(), 20); }, cancel() {}, getVoices() { return [{ lang: 'sv-SE', name: 'Fake' }]; } };
    Object.defineProperty(window, 'speechSynthesis', { value: fake, configurable: true });
  });
});

async function signIn(page) {
  await page.goto('/signin');
  await page.getByLabel('Email').fill(REVIEWER.email);
  await page.getByLabel('Password').fill(REVIEWER.password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL(/\/terms$/);
  await page.getByLabel(/I agree to the terms/).check();
  await page.getByLabel(/I am 13 or over/).check();
  await page.getByRole('button', { name: 'Agree' }).click();
  await page.waitForURL(/\/$/);
}

async function addSample(page) {
  const tag = Math.random().toString(36).slice(2, 7);
  return page.evaluate(async ({ sample, tag }) => {
    const me = await (await fetch('/api/me')).json();
    const h = { 'content-type': 'application/json', 'x-csrf-token': me.csrf };
    // A new package gives a fresh part: \"next\" may give a waiting redo since G-02 FR-206 changed (2026-10-26).
    const p = await fetch('/api/prompt', { method: 'POST', headers: h, body: JSON.stringify({ action: 'new_package' }) });
    const prompt = await p.json();
    const answer = JSON.parse(sample.replaceAll('TEST-1', prompt.code));
    answer.texts.forEach((x) => { x.title = `${x.title} ${tag}`; });
    const r = await (await fetch('/api/answer', { method: 'POST', headers: h, body: JSON.stringify({ exchangeId: prompt.exchangeId, answer: JSON.stringify(answer) }) })).json();
    return Object.fromEntries(r.texts.map((x) => [x.title.replace(` ${tag}`, ''), x.id]));
  }, { sample: SAMPLE, tag });
}

test('FR-801 FR-802 RQ-311 RQ-310: after agreeing, Home plays the scene once in a card, with its four captions in order, and it goes away by itself', async ({ page }) => {
  test.setTimeout(45000);
  await signIn(page);
  const card = page.locator('#grow-card');
  await expect(card).toBeVisible();
  await expect(card.locator('.grow-svg')).toBeVisible();
  await expect(card.locator('.grow-svg .g-ground')).toHaveCount(1);
  await expect(page.locator('#stages-card')).toBeVisible();
  for (const caption of CAPTIONS) await expect(card.locator('.grow-caption')).toHaveText(caption, { timeout: 4000 });
  await expect(card).toHaveCount(0, { timeout: 4000 });
  await page.reload();
  await expect(page.locator('#stages-card')).toBeVisible();
  await expect(page.locator('#grow-card')).toHaveCount(0);
});

test('FR-801 FR-802 RQ-311: Skip ends the scene at once; the help page Replays it; a logo tap plays it in a pop-up', async ({ page }) => {
  await signIn(page);
  await expect(page.locator('#grow-card')).toBeVisible();
  const started = Date.now();
  await page.locator('#grow-card').getByRole('button', { name: 'Skip' }).click();
  await expect(page.locator('#grow-card')).toHaveCount(0);
  expect(Date.now() - started).toBeLessThan(1000);
  await page.locator('.brand .logo').click();
  await expect(page).toHaveURL(/\/$/);
  const pop = page.locator('.grow-pop');
  await expect(pop).toBeVisible();
  await expect(pop.locator('.grow-caption')).toHaveText(CAPTIONS[0], { timeout: 4000 });
  await pop.getByRole('button', { name: 'Skip' }).click();
  await expect(pop).toHaveCount(0);
  await page.locator('.help-link').click();
  await expect(page).toHaveURL(/\/how$/);
  await expect(page.locator('#grow-host .grow')).toBeVisible();
  await expect(page.locator('#replay')).toBeDisabled();
  await page.locator('#grow-host').getByRole('button', { name: 'Stop' }).click();
  await expect(page.locator('#replay')).toBeEnabled();
  await page.locator('#replay').click();
  await expect(page.locator('#grow-host .grow-caption')).toHaveText(CAPTIONS[0], { timeout: 4000 });
});

test('FR-803 RQ-308: with reduced motion the scene is four still frames with their captions, and answers only fade', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/how');
  const frames = page.locator('#grow-host .grow-still');
  await expect(frames).toHaveCount(4);
  await expect(frames.locator('.grow-caption')).toHaveText(CAPTIONS);
  await expect(frames.nth(1).locator('.leaf-bok')).toHaveCSS('transition-duration', '0s');
  const names = await page.evaluate(() => {
    const b = document.createElement('button');
    b.className = 'option right';
    document.querySelector('main').append(b);
    return getComputedStyle(b).animationName;
  });
  expect(names).toBe('fade-in');
});

test('FR-805 RQ-319: a right answer is green with a check mark and a bounce; a wrong one red with a cross and a shake', async ({ page }) => {
  await signIn(page);
  const ids = await addSample(page);
  await page.goto(`/text?id=${ids['En bra dag']}`);
  await page.locator('#practise').click();
  await page.locator('#practice button.option').first().click();
  const right = page.locator('#practice button.option.right');
  await expect(right).toHaveCount(1);
  await expect(right).toHaveCSS('animation-name', 'answer-bounce');
  expect(await right.evaluate((b) => getComputedStyle(b, '::after').content)).toBe('"✓"');
  expect(await right.evaluate((b) => getComputedStyle(b).borderRadius)).toBe('16px');
  const wrong = await page.evaluate(() => {
    const b = document.createElement('button');
    b.className = 'option wrong';
    document.querySelector('main').append(b);
    const s = getComputedStyle(b);
    return { name: s.animationName, mark: getComputedStyle(b, '::after').content, color: s.color };
  });
  expect(wrong.name).toBe('answer-shake');
  expect(wrong.mark).toBe('"✗"');
});

test('FR-806 RQ-322: the word menu slides up with a header strip in the pop-up border colour', async ({ page }) => {
  await signIn(page);
  const ids = await addSample(page);
  await page.goto(`/text?id=${ids['En bra dag']}`);
  await page.locator('button.w', { hasText: 'kopparna' }).click();
  await expect(page.locator('#menu')).toBeVisible();
  await expect(page.locator('#menu')).toHaveCSS('animation-name', 'sheet-up');
  const [strip, border] = await page.evaluate(() => {
    const probe = document.createElement('div');
    probe.style.background = 'var(--pbord)';
    document.body.append(probe);
    return [getComputedStyle(document.querySelector('#menu .sheet-head')).backgroundColor, getComputedStyle(probe).backgroundColor];
  });
  expect(strip).toBe(border);
  await expect(page.locator('#sheet-backdrop')).toHaveCSS('backdrop-filter', 'blur(12px)');
});

test('FR-807 RQ-309 RQ-341: at 360 px nothing in the top bar overlaps and Sign out stays on one line', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await signIn(page);
  const ids = await addSample(page);
  for (const path of ['/', `/text?id=${ids['En bra dag']}`, '/leaves']) {
    await page.goto(path);
    await expect(page.locator('.account')).toBeVisible();
    const boxes = await page.evaluate(() => [...document.querySelectorAll('.topbar .logo, .topbar .title, .topbar .tagline, .topbar .bar-button')]
      .filter((e) => e.offsetParent !== null || e.tagName === 'svg')
      .map((e) => { const r = e.getBoundingClientRect(); return { name: e.className.baseVal ?? e.className, x: r.x, y: r.y, w: r.width, h: r.height }; }));
    for (let i = 0; i < boxes.length; i += 1) {
      for (let k = i + 1; k < boxes.length; k += 1) {
        const a = boxes[i];
        const b = boxes[k];
        const overlap = a.x < b.x + b.w - 0.5 && b.x < a.x + a.w - 0.5 && a.y < b.y + b.h - 0.5 && b.y < a.y + a.h - 0.5;
        expect(overlap, `${path}: ${a.name} overlaps ${b.name}`).toBe(false);
      }
    }
    const [signout, dictionary] = await Promise.all([page.locator('.signout').boundingBox(), page.locator('.account .nav[href="/dictionary"]').boundingBox()]);
    expect(Math.abs(signout.height - dictionary.height)).toBeLessThan(2);
    expect(await page.evaluate(() => { const r = document.querySelector('.topbar-inner'); return r.scrollWidth <= r.clientWidth; })).toBe(true);
    await expect(page.locator('.tagline')).toBeVisible();
  }
});
