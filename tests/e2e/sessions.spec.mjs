import { test, expect } from '@playwright/test';
import { agreeTerms } from './helpers.mjs';
import { readFileSync } from 'node:fs';
import { REVIEWER } from '../fakes/dev-accounts.mjs';

const SAMPLE = readFileSync(new URL('../texts/answers/good-patterns.json', import.meta.url), 'utf8');

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.__spoken = [];
    const fake = { speak(u) { window.__spoken.push(u.text); setTimeout(() => u.onend && u.onend(), 30); }, cancel() {}, getVoices() { return [{ lang: 'sv-SE', name: 'Fake' }]; } };
    Object.defineProperty(window, 'speechSynthesis', { value: fake, configurable: true });
  });
});

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

// Fresh unread texts for the shared reviewer account, as the other browser tests add them.
async function addSample(page) {
  const tag = Math.random().toString(36).replace(/[^a-z]/g, '').slice(0, 5);
  const p = await api(page, '/api/prompt', { action: 'new_package' });
  const answer = JSON.parse(SAMPLE.replaceAll('TEST-1', p.body.code));
  answer.texts.forEach((x) => { x.title = `${x.title} ${tag}`; });
  await api(page, '/api/answer', { exchangeId: p.body.exchangeId, answer: JSON.stringify(answer) });
}

test('FR-904 FR-912 RQ-421 RQ-425: a session shows one exercise at a time under its line and bar, each card with the mode banner\'s two chips, texts open and come back, and it ends with a summary', async ({ page }) => {
  await signIn(page);
  await addSample(page);
  const started = await api(page, '/api/sessions', { kind: 'time', tile: 'mix', skill: 'mix', minutes: 10, voice: true, fill: true });
  expect(started.status, JSON.stringify(started.body)).toBe(200);
  await page.goto('/session');
  await expect(page.locator('#session-line')).toHaveText(/^10-minute Mix · 1 of \d+ · about \d+ min left$/);
  await expect(page.locator('#session-bar')).toBeVisible();
  const chips = page.locator('#exercise-banner .chip');
  await expect(chips).toHaveCount(2);
  await expect(chips.first()).toHaveText(/^(Discover|Review)$/);
  await expect(chips.first().locator('svg.icon')).toHaveCount(1);
  await expect(chips.nth(1)).toHaveText(/^\d+ min$/);
  expect(await chips.first().evaluate((n) => getComputedStyle(n).textTransform)).toBe('none');
  expect(await page.locator('#exercise-banner').evaluate((n) => getComputedStyle(n).backgroundColor)).not.toBe('rgba(0, 0, 0, 0)');

  for (let step = 0; step < 40; step += 1) {
    await expect(page.locator('#exercise:visible, #session-end:visible')).toHaveCount(1);
    if (await page.locator('#session-end').isVisible()) break;
    const open = page.getByRole('link', { name: 'Open the text' });
    const option = page.locator('#exercise-box button.option:not([disabled])').first();
    const show = page.getByRole('button', { name: 'Show' });
    // FR-928, FR-929 (B-26): a Mix of all skills has Words and Grammar exercises too.
    const know = page.getByRole('button', { name: 'I know it' });
    const choice = page.locator('#exercise-box .choices button:not([disabled])').first();
    const spot = page.getByRole('button', { name: 'Now spot it in a text' });
    const check = page.getByRole('button', { name: 'Check' });
    if (await know.isVisible()) {
      await know.click();
    } else if (await choice.isVisible()) {
      await choice.click();
    } else if (await spot.isVisible()) {
      await spot.click();
    } else if (await check.isVisible()) {
      await check.click();
    } else if (await open.isVisible()) {
      await open.click();
      await page.waitForURL(/\/text\?id=\d+&session=\d+&index=\d+$/);
      await page.locator('#session-done').click();
      await page.waitForURL(/\/session\?id=\d+$/);
    } else if (await option.isVisible()) {
      await option.click();
      await page.getByRole('button', { name: 'Next', exact: true }).click();
    } else if (await show.isVisible()) {
      await show.click();
      await page.getByRole('button', { name: 'I knew it' }).click();
    } else {
      await page.getByRole('button', { name: 'Next', exact: true }).click();
    }
    await page.waitForTimeout(150);
  }
  await expect(page.locator('#session-end')).toBeVisible();
  // FR-904 (PD-05): minutes, texts, words reviewed, words that fell and the days practised this week.
  await expect(page.locator('#summary li')).toHaveCount(5);
  await expect(page.locator('#summary li').last()).toContainText('this week');
  await expect(page.locator('#summary')).toContainText('min of practice');
  const after = await page.evaluate(async () => (await (await fetch('/api/session')).json()).session);
  expect(after).toBeNull();
});

test('FR-915 FR-907 RQ-430 RQ-443: Your library lists the texts by topic, unread first, with Beta badges, and links Add a text, your dictionary and your leaves; Practise this topic starts a 10-minute Mix on it', async ({ page }) => {
  await signIn(page);
  await addSample(page);
  await page.goto('/texts');
  await expect(page.getByRole('heading', { name: 'Your library' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Add a text' }).first()).toHaveAttribute('href', '/add');
  await expect(page.getByRole('link', { name: 'Your dictionary' })).toHaveAttribute('href', '/dictionary');
  await expect(page.getByRole('link', { name: 'Your leaves' })).toHaveAttribute('href', '/leaves');
  const topics = await page.evaluate(async () => (await (await fetch('/api/topics')).json()).topics);
  const topic = topics.find((t) => t.topic && t.texts.some((x) => !x.read));
  await page.goto('/texts');
  const group = page.locator('#texts .topic-group', { has: page.getByRole('heading', { name: topic.label, exact: true }) });
  await expect(group).toBeVisible();
  await expect(group.locator('a').first()).toContainText(topic.texts.find((x) => !x.read).title);
  const demo = page.locator('#texts a', { hasText: 'Brevet i väskan' });
  await expect(demo).toBeVisible();
  await expect(demo.locator('.beta')).toHaveCount(0);
  await group.getByRole('button', { name: `Practise ${topic.label}` }).click();
  await page.waitForURL(/\/session$/);
  // FR-920: a session short of new texts opens with its offer; Practise without goes on.
  const without = page.getByRole('button', { name: 'Practise without' });
  await expect(without.or(page.locator('#exercise'))).toBeVisible();
  if (await without.isVisible()) await without.click();
  await expect(page.locator('#session-line')).toContainText(`10-minute Mix: ${topic.label}`);
});

test('FR-918 RQ-435 RQ-439: Add a text shows the three ways side by side, each with its explainer, each leading to its own page', async ({ page }) => {
  await signIn(page);
  await page.goto('/add');
  const library = page.locator('.add-way', { has: page.getByRole('heading', { name: 'From the common library' }) });
  await expect(library).toContainText('level');
  await expect(library.getByRole('link')).toHaveAttribute('href', '/library');
  const ai = page.locator('.add-way', { has: page.getByRole('heading', { name: /Texts from your AI/ }) });
  const own = page.locator('.add-way', { has: page.getByRole('heading', { name: /Your own text/ }) });
  await expect(ai).toContainText('free AI chat');
  await expect(ai).toContainText('About 5 minutes');
  await expect(own).toContainText('stays private');
  await expect(ai.getByRole('link')).toHaveAttribute('href', '/add/ai');
  await expect(own.getByRole('link')).toHaveAttribute('href', '/own');
  await own.getByRole('link').click();
  await page.waitForURL(/\/own$/);
  await page.getByLabel('Title').fill('Min lista');
  await page.getByLabel('Swedish text').fill('Jag läser en bok.');
  await page.getByRole('button', { name: 'Save text' }).click();
  await page.waitForURL(/\/text\?id=\d+$/);
});

test('FR-919 RQ-436 RQ-403: Texts from your AI is a wizard: a step list shows done, now and next; one step at a time with Back; a confirmation after each action; all three tactics always there', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await signIn(page);
  await api(page, '/api/plan', { family: 'chatgpt', product: 'free', tactic: 'steps' });
  await page.goto('/add/ai');
  const list = page.locator('#ai-steps');
  await expect(list.locator('li').first()).toContainText('Your AI: ChatGPT');
  await expect(page.locator('#tab-list, [role="tablist"]')).toHaveCount(0);
  // Start from a fresh package in a new chat, wherever the shared account was.
  if (await page.locator('.ai-step[data-step="ai"]').isHidden()) {
    while (await page.locator('.ai-step[data-step="ai"]').isHidden()) await page.getByRole('button', { name: 'Back' }).click();
  }
  // G-02 FR-223 as amended (question-pages/78, 2): all three tactics, always there to choose.
  await expect(page.locator('.tactic-option')).toHaveCount(3);
  await expect(page.locator('.ai-step:not([hidden])')).toHaveCount(1);
  await page.evaluate(async () => {
    const me = await (await fetch('/api/me')).json();
    await fetch('/api/prompt', { method: 'POST', headers: { 'content-type': 'application/json', 'x-csrf-token': me.csrf }, body: JSON.stringify({ action: 'new_package' }) });
  });
  await page.reload();
  // A waiting package with a setup: the setup step is now, Your AI done.
  await expect(list.locator('li[aria-current="step"]')).toContainText('Send the setup');
  await expect(list.locator('li.done')).toHaveCount(1);
  await expect(page.locator('.ai-step:not([hidden])')).toHaveCount(1);
  for (const b of await page.locator('#setup-steps').getByRole('button', { name: 'Copy prompt' }).all()) await b.click();
  await page.getByRole('button', { name: "I've sent them" }).click();
  await expect(page.locator('#package-message')).toContainText('Setup sent');
  await expect(list.locator('li[aria-current="step"]')).toContainText('Copy the request');
  await page.locator('#prompt-steps').getByRole('button', { name: 'Copy prompt' }).click();
  await expect(page.locator('#package-message')).toHaveText('Copied. Now paste it into your AI chat and wait for its answer.');
  await expect(list.locator('li[aria-current="step"]')).toContainText('Paste the answer');
  await expect(page.getByLabel("Paste the AI's answer here")).toBeVisible();
  await page.getByRole('button', { name: 'Back' }).click();
  await expect(list.locator('li[aria-current="step"]')).toContainText('Copy the request');
  await page.locator('#prompt-steps').getByRole('button', { name: 'Copy prompt' }).click();
  const code = await page.evaluate(async () => (await (await fetch('/api/home')).json()).waiting.code);
  const tag = Math.random().toString(36).replace(/[^a-z]/g, '').slice(0, 5);
  const answer = JSON.parse(SAMPLE.replaceAll('TEST-1', code ?? 'TEST-1'));
  answer.texts.forEach((x) => { x.title = `${x.title} ${tag}`; });
  await page.getByLabel("Paste the AI's answer here").fill(JSON.stringify(answer));
  await page.getByRole('button', { name: 'Add texts' }).click();
  await expect(page.locator('#package-message')).toContainText(/\d+ texts? added/);
  await expect(list.locator('li[aria-current="step"]')).toContainText('Texts added');
  await expect(page.locator('#added-list a').first()).toContainText(tag);
  await expect(list.locator('li.done')).toHaveCount(await list.locator('li').count() - 1);
});
