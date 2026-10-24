import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { REVIEWER } from '../fakes/dev-accounts.mjs';

const SAMPLE = readFileSync(new URL('../texts/answers/good-patterns.json', import.meta.url), 'utf8');

// A fake speech engine. voices: 'sv' | 'en' | 'late' | 'underscore'.
async function fakeSpeech(page, voices = 'sv') {
  await page.addInitScript((kind) => {
    window.__spoken = [];
    const listeners = [];
    let list = kind === 'en' ? [{ lang: 'en-US', name: 'English' }] : kind === 'underscore' ? [{ lang: 'sv_SE', name: 'Svenska' }] : kind === 'late' ? [] : [{ lang: 'sv-SE', name: 'Svenska' }];
    if (kind === 'late') setTimeout(() => { list = [{ lang: 'sv-SE', name: 'Svenska' }]; listeners.forEach((fn) => fn()); }, 800);
    const fake = {
      speak(u) { window.__spoken.push({ text: u.text, rate: u.rate }); setTimeout(() => u.onend && u.onend(), 40); },
      cancel() {},
      getVoices() { return list; },
      addEventListener(name, fn) { if (name === 'voiceschanged') listeners.push(fn); },
    };
    Object.defineProperty(window, 'speechSynthesis', { value: fake, configurable: true });
  }, voices);
}

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

async function api(page, path, body) {
  return page.evaluate(async ({ path, body }) => {
    const me = await (await fetch('/api/me')).json();
    const r = await fetch(path, { method: 'POST', headers: { 'content-type': 'application/json', 'x-csrf-token': me.csrf }, body: JSON.stringify(body) });
    return { status: r.status, body: await r.json() };
  }, { path, body });
}

// A short text of our own (3 sentences) so listening finishes fast.
async function shortText(page) {
  const r = await api(page, '/api/own-text', { title: `Lyssna ${Math.random().toString(36).slice(2, 6)}`, text: 'Det är en kall morgon. Elsa öppnar dörren.\nHon dricker kaffe.' });
  return r.body.id;
}

test('FR-504 FR-505 FR-508 RQ-198 RQ-21 RQ-47 RQ-57 RQ-270: Listen blurs the text, plays each sentence in order with highlighting, then shows the text and questions', async ({ page }) => {
  await fakeSpeech(page, 'sv');
  await signIn(page);
  await api(page, '/api/settings', { speechRate: 1, voiceHelpShown: false });
  const id = await shortText(page);
  await page.goto(`/text?id=${id}`);
  await page.locator('#listen').click();
  await expect(page.locator('#lines')).toHaveClass(/blurred/);
  await page.locator('#listen-play').click();
  await expect(page.locator('#lines .sentence.speaking')).toHaveCount(1);
  await expect(page.locator('#lines')).not.toHaveClass(/blurred/, { timeout: 5000 });
  const spoken = (await page.evaluate(() => window.__spoken)).map((u) => u.text);
  expect(spoken).toEqual(['Det är en kall morgon.', 'Elsa öppnar dörren.', 'Hon dricker kaffe.']);
});

test('FR-506 FR-507 RQ-14 RQ-197: replay counts plays; a looped sentence repeats until the loop is turned off', async ({ page }) => {
  await fakeSpeech(page, 'sv');
  await signIn(page);
  const id = await shortText(page);
  await page.goto(`/text?id=${id}`);
  await page.locator('#listen').click();
  const row = page.locator('#listen-list .listen-row').nth(1);
  await row.getByRole('button', { name: 'Replay' }).click();
  await expect(row.locator('.play-count')).toHaveText('played 1×');
  await page.waitForTimeout(100);
  await page.locator('#listen-list .listen-row').nth(1).getByRole('button', { name: 'Replay' }).click();
  await expect(page.locator('#listen-list .listen-row').nth(1).locator('.play-count')).toHaveText('played 2×');
  await page.locator('#listen-list .listen-row').nth(2).getByRole('button', { name: 'Loop' }).click();
  await expect.poll(async () => (await page.evaluate(() => window.__spoken)).filter((u) => u.text === 'Hon dricker kaffe.').length, { timeout: 5000 }).toBeGreaterThan(3);
  await page.locator('#listen-list .listen-row').nth(2).getByRole('button', { name: 'Loop' }).click();
  const n = (await page.evaluate(() => window.__spoken)).length;
  await page.waitForTimeout(400);
  expect((await page.evaluate(() => window.__spoken)).length).toBeLessThanOrEqual(n + 1);
});

test('FR-503 RQ-13 RQ-365: the speed slider sets the rate of the next utterance, shows the note, and is kept', async ({ page }) => {
  await fakeSpeech(page, 'sv');
  await signIn(page);
  const id = await shortText(page);
  await page.goto(`/text?id=${id}`);
  await page.locator('#listen').click();
  await expect(page.locator('#listening-card')).toContainText("depends on your device's voice");
  await page.locator('#speed').fill('0.7');
  await page.locator('#speed').dispatchEvent('change');
  await expect(page.locator('#speed-value')).toHaveText('0.7×');
  await page.locator('#listen-list .listen-row').first().getByRole('button', { name: 'Replay' }).click();
  await expect.poll(async () => Math.round(((await page.evaluate(() => window.__spoken)).at(-1)?.rate ?? 0) * 10) / 10).toBe(0.7);
  await page.reload();
  await page.locator('#listen').click();
  await expect(page.locator('#speed-value')).toHaveText('0.7×');
  await api(page, '/api/settings', { speechRate: 1 });
});

test('FR-501 FR-502 RQ-20 RQ-369: with only an English voice nothing is spoken and the help shows once', async ({ page }) => {
  await fakeSpeech(page, 'en');
  await signIn(page);
  await api(page, '/api/settings', { voiceHelpShown: false });
  const id = await shortText(page);
  await page.goto(`/text?id=${id}`);
  await page.locator('#listen').click();
  await expect(page.locator('#voice-help')).toBeVisible();
  await expect(page.locator('#voice-help')).toContainText('Settings → Accessibility → Spoken Content');
  await page.locator('#listen-play').click();
  await page.locator('button.w').first().click();
  expect(await page.evaluate(() => window.__spoken.length)).toBe(0);
  await page.reload();
  await page.locator('#listen').click();
  await expect(page.locator('#voice-help')).toBeHidden();
});

test('FR-501 RQ-20: voices arriving late are used, and sv_SE counts as Swedish', async ({ page }) => {
  await fakeSpeech(page, 'late');
  await signIn(page);
  const id = await shortText(page);
  await page.goto(`/text?id=${id}`);
  await page.waitForTimeout(1200);
  await page.locator('button.w').first().click();
  await expect.poll(async () => page.evaluate(() => window.__spoken.length)).toBe(1);
  const page2 = await page.context().newPage();
  await fakeSpeech(page2, 'underscore');
  await page2.goto(`/text?id=${id}`);
  await page2.locator('button.w').first().click();
  await expect.poll(async () => page2.evaluate(() => window.__spoken.length)).toBe(1);
});
