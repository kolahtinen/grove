import { test, expect } from '@playwright/test';
import { agreeTerms } from './helpers.mjs';
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
  await agreeTerms(page);
  await page.waitForURL(/\/$/);
}

async function api(page, path, body) {
  return page.evaluate(async ({ path, body }) => {
    const me = await (await fetch('/api/me')).json();
    const r = await fetch(path, { method: 'POST', headers: { 'content-type': 'application/json', 'x-csrf-token': me.csrf }, body: JSON.stringify(body) });
    return { status: r.status, body: await r.json() };
  }, { path, body });
}

// A listening text from a package (G-05 FR-504, FR-509: only listening texts have Listen since B-32).
async function listeningText(page) {
  const ids = await page.evaluate(async ({ sample }) => {
    const me = await (await fetch('/api/me')).json();
    const h = { 'content-type': 'application/json', 'x-csrf-token': me.csrf };
    const p = await (await fetch('/api/prompt', { method: 'POST', headers: h, body: JSON.stringify({ action: 'new_package' }) })).json();
    const answer = JSON.parse(sample.replaceAll('TEST-1', p.code));
    const tag = Math.random().toString(36).slice(2, 7);
    answer.texts.forEach((x) => { x.title = `${x.title} ${tag}`; });
    const r = await (await fetch('/api/answer', { method: 'POST', headers: h, body: JSON.stringify({ exchangeId: p.exchangeId, answer: JSON.stringify(answer) }) })).json();
    return r.texts;
  }, { sample: readFileSync(new URL('../texts/answers/good.json', import.meta.url), 'utf8') });
  return ids.find((x) => x.kind === 'listening').id;
}

const sentencesOf = (page, id) => page.evaluate(async (tid) => (await (await fetch(`/api/reading?id=${tid}`)).json()).lines.flatMap((l) => l.sentences).map((x) => x.sv), id);

// A short text of our own (3 sentences) so listening finishes fast.
// Own texts open after their AI round since G-03 FR-318 changed (2026-10-26), so the round is answered here.
async function shortText(page) {
  const r = await api(page, '/api/own-text', { title: `Lyssna ${Math.random().toString(36).slice(2, 6)}`, text: 'Det är en kall morgon. Elsa öppnar dörren.\nHon dricker kaffe.' });
  const code = r.body.prompt.match(/"own": "([^"]+)"/)[1];
  const words = ['det', 'är', 'en', 'kall', 'morgon', 'öppnar', 'dörren', 'hon', 'dricker', 'kaffe'].map((form) => ({ form, lemma: form, en: form, explain_sv: form }));
  await api(page, '/api/answer', { exchangeId: r.body.exchangeId, answer: JSON.stringify({ own: code, copyright: 'free', words, names: ['Elsa'] }) });
  return r.body.id;
}

test('FR-504 FR-505 FR-508 RQ-198 RQ-21 RQ-47 RQ-57 RQ-270: Listen blurs the text, plays each sentence in order with highlighting, then shows the text and questions', async ({ page }) => {
  await fakeSpeech(page, 'sv');
  await signIn(page);
  await api(page, '/api/settings', { speechRate: 1, voiceHelpShown: false });
  const id = await listeningText(page);
  await page.goto(`/text?id=${id}`);
  await page.locator('#listen').click();
  await expect(page.locator('#lines')).toHaveClass(/blurred/);
  await page.locator('#listen-play').click();
  await expect(page.locator('#lines .sentence.speaking')).toHaveCount(1);
  await expect(page.locator('#lines')).not.toHaveClass(/blurred/, { timeout: 15000 });
  const spoken = (await page.evaluate(() => window.__spoken)).map((u) => u.text);
  expect(spoken).toEqual(await sentencesOf(page, id));
});

test('FR-506 FR-507 RQ-14 RQ-197 RQ-467: the Sentences sheet names rows by number and first words; replay counts plays; a looped sentence repeats until stopped', async ({ page }) => {
  await fakeSpeech(page, 'sv');
  await signIn(page);
  const id = await listeningText(page);
  await page.goto(`/text?id=${id}`);
  await page.locator('#listen').click();
  await expect(page.locator('#listen-list .listen-row')).toHaveCount(0);
  await page.getByRole('button', { name: 'Sentences' }).click();
  const sheet = page.getByRole('dialog', { name: 'Sentences' });
  const sentences = await sentencesOf(page, id);
  const words = sentences[1].split(/\s+/);
  await expect(sheet.locator('.listen-row').nth(1)).toContainText(`2 · ${words.slice(0, 3).join(' ')}${words.length > 3 ? '…' : ''}`);
  const row = sheet.locator('.listen-row').nth(1);
  await row.getByRole('button', { name: 'Replay' }).click();
  await expect(row.locator('.play-count')).toHaveText('played 1×');
  await page.waitForTimeout(100);
  await sheet.locator('.listen-row').nth(1).getByRole('button', { name: 'Replay' }).click();
  await expect(sheet.locator('.listen-row').nth(1).locator('.play-count')).toHaveText('played 2×');
  await sheet.locator('.listen-row').nth(2).getByRole('button', { name: 'Loop' }).click();
  const looped = sentences[2];
  await expect.poll(async () => (await page.evaluate(() => window.__spoken)).filter((u) => u.text === looped).length, { timeout: 5000 }).toBeGreaterThan(3);
  await sheet.getByRole('button', { name: 'Close' }).click();
  await expect(sheet).toBeHidden();
  const strip = page.locator('#listening-card .loop-strip');
  await expect(strip).toContainText('Looping 3 ·');
  await strip.getByRole('button', { name: 'Stop' }).click();
  await expect(strip).toBeHidden();
  const n = (await page.evaluate(() => window.__spoken)).length;
  await page.waitForTimeout(400);
  expect((await page.evaluate(() => window.__spoken)).length).toBeLessThanOrEqual(n + 1);
});

test('FR-503 RQ-13 RQ-365: the speed slider sets the rate of the next utterance, shows the note, and is kept', async ({ page }) => {
  await fakeSpeech(page, 'sv');
  await signIn(page);
  const id = await listeningText(page);
  await page.goto(`/text?id=${id}`);
  await page.locator('#listen').click();
  await expect(page.locator('#listening-card')).toContainText("depends on your device's voice");
  await page.locator('#speed').fill('0.7');
  await page.locator('#speed').dispatchEvent('change');
  await expect(page.locator('#speed-value')).toHaveText('0.7×');
  await page.getByRole('button', { name: 'Sentences' }).click();
  await page.getByRole('dialog', { name: 'Sentences' }).locator('.listen-row').first().getByRole('button', { name: 'Replay' }).click();
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
  const id = await listeningText(page);
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

test('FR-509 FR-505 RQ-393: a listening text from the AI opens in listening mode, blurred with Play; a reading text opens for reading', async ({ page }) => {
  await fakeSpeech(page, 'sv');
  await signIn(page);
  const ids = await page.evaluate(async ({ sample }) => {
    const me = await (await fetch('/api/me')).json();
    const h = { 'content-type': 'application/json', 'x-csrf-token': me.csrf };
    const p = await (await fetch('/api/prompt', { method: 'POST', headers: h, body: JSON.stringify({ action: 'new_package' }) })).json();
    const answer = JSON.parse(sample.replaceAll('TEST-1', p.code));
    const tag = Math.random().toString(36).slice(2, 7);
    answer.texts.forEach((x) => { x.title = `${x.title} ${tag}`; });
    const r = await (await fetch('/api/answer', { method: 'POST', headers: h, body: JSON.stringify({ exchangeId: p.exchangeId, answer: JSON.stringify(answer) }) })).json();
    return r.texts;
  }, { sample: readFileSync(new URL('../texts/answers/good.json', import.meta.url), 'utf8') });
  const listening = ids.find((x) => x.kind === 'listening');
  const reading = ids.find((x) => x.kind === 'reading');
  await page.goto(`/text?id=${listening.id}`);
  await expect(page.locator('#listening-card')).toBeVisible();
  await expect(page.locator('#lines')).toHaveClass(/blurred/);
  await expect(page.locator('#listen-play')).toBeVisible();
  await page.goto(`/text?id=${reading.id}`);
  await expect(page.locator('#listening-card')).toBeHidden();
  await expect(page.locator('#listen')).toBeHidden();
  await expect(page.locator('#lines')).not.toHaveClass(/blurred/);
});

