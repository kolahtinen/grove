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

// Home's Practise tile comes with the tile grid (FR-901); until then the session starts through the API.
test('FR-904 FR-912 RQ-421 RQ-425: a session shows one exercise at a time under its line and bar, each card with the mode banner\'s two chips, texts open and come back, and it ends with a summary', async ({ page }) => {
  await signIn(page);
  await addSample(page);
  const started = await api(page, '/api/sessions', { kind: 'time', minutes: 10, voice: true });
  expect(started.status, JSON.stringify(started.body)).toBe(200);
  await page.goto('/session');
  await expect(page.locator('#session-line')).toHaveText(/^10-minute session · 1 of \d+ · about \d+ min left$/);
  await expect(page.locator('#session-bar')).toBeVisible();
  const chips = page.locator('#exercise-banner .chip');
  await expect(chips).toHaveCount(2);
  await expect(chips.first()).toHaveText(/^(Discover|Review|Master)$/);
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
    if (await open.isVisible()) {
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
  await expect(page.locator('#summary li')).toHaveCount(4);
  await expect(page.locator('#summary')).toContainText('min of practice');
  const after = await page.evaluate(async () => (await (await fetch('/api/session')).json()).session);
  expect(after).toBeNull();
});

test('FR-909 FR-907 RQ-422: Texts lists the texts by topic, unread first, with Beta badges, and Start a session on a topic starts one', async ({ page }) => {
  await signIn(page);
  await addSample(page);
  const topics = await page.evaluate(async () => (await (await fetch('/api/topics')).json()).topics);
  const topic = topics.find((t) => t.topic && t.texts.some((x) => !x.read));
  await page.goto('/texts');
  const group = page.locator('#texts .topic-group', { has: page.getByRole('heading', { name: topic.label, exact: true }) });
  await expect(group).toBeVisible();
  await expect(group.locator('a').first()).toContainText(topic.texts.find((x) => !x.read).title);
  const demo = page.locator('#texts a', { hasText: 'Brevet i väskan' });
  await expect(demo).toBeVisible();
  await expect(demo.locator('.beta')).toHaveCount(0);
  await group.getByLabel(`Session length for ${topic.label}`).selectOption('5');
  await group.getByRole('button', { name: `Start a session on ${topic.label}` }).click();
  await page.waitForURL(/\/session$/);
  await expect(page.locator('#session-line')).toContainText('5-minute session');
});

test('FR-909 RQ-422 RQ-418: New texts shows the AI and version above a wizard card with the tactic tabs on top and one step open at a time; Your own text is on Texts', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await signIn(page);
  await api(page, '/api/plan', { family: 'chatgpt', product: 'free', tactic: 'steps' });
  await page.goto('/texts');
  await expect(page.locator('#progress')).not.toBeEmpty();
  const [plan, wizard] = [await page.locator('#plan').boundingBox(), await page.locator('#wizard').boundingBox()];
  expect(plan.y + plan.height).toBeLessThanOrEqual(wizard.y + 1);
  await expect(page.locator('#wizard #tactic-tabs')).toBeVisible();
  const tabs = await page.locator('#tactic-tabs').boundingBox();
  const next = page.locator('#step-next');
  expect(tabs.y).toBeLessThan((await next.boundingBox()).y);
  // A fresh package in a new chat: setup is the open step, the others closed.
  // With nothing waiting, Next part is the open step; with a prompt waiting, its heading opens it.
  if (await page.locator('#prompt-area').isHidden()) await expect(page.locator('#step-next-body')).toBeVisible();
  else await page.locator('#step-next .wstep-head').click();
  await expect(page.locator('#step-next-body')).toBeVisible();
  await page.locator(await page.locator('#new-package').isVisible() ? '#new-package' : '#get-texts').click();
  await expect(page.locator('#prompt-area')).toBeVisible();
  const heads = page.locator('#wizard .wstep-head[aria-expanded="true"]');
  await expect(heads).toHaveCount(1);
  await expect(page.locator('#step-setup-body')).toBeVisible();
  await expect(page.locator('#step-prompt-body')).toBeHidden();
  await expect(page.locator('#step-paste-body')).toBeHidden();
  const setup = page.locator('#setup-steps .prompt-step');
  const n = await setup.count();
  expect(n).toBeGreaterThan(0);
  for (let i = 0; i < n; i += 1) await setup.nth(i).getByRole('button', { name: 'Copy prompt' }).click();
  await expect(page.locator('#step-prompt-body')).toBeVisible();
  await expect(page.locator('#step-setup-body')).toBeHidden();
  await page.locator('#prompt-steps .prompt-step').getByRole('button', { name: 'Copy prompt' }).click();
  await expect(page.locator('#step-paste-body')).toBeVisible();
  await expect(page.getByLabel("Paste the AI's answer here")).toBeVisible();
  await expect(heads).toHaveCount(1);
  // A step's heading opens it and closes the one open.
  await page.locator('#step-setup .wstep-head').click();
  await expect(page.locator('#step-setup-body')).toBeVisible();
  await expect(page.locator('#step-paste-body')).toBeHidden();
  // Your own text: G-03 FR-318's form, here on Texts.
  const own = page.locator('#own-card');
  await own.getByLabel('Title').fill('Min lista');
  await own.getByLabel('Swedish text').fill('Jag läser en bok.');
  await own.getByRole('button', { name: 'Save text' }).click();
  await page.waitForURL(/\/text\?id=\d+$/);
});
