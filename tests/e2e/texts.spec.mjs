import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { REVIEWER } from '../fakes/dev-accounts.mjs';

const sample = (name) => readFileSync(new URL(`../texts/answers/${name}`, import.meta.url), 'utf8');

// A sample answer with this prompt's part code and unique titles, so answers never repeat across runs.
function answerFor(name, code) {
  const tag = Math.random().toString(36).slice(2, 7);
  const json = JSON.parse(sample(name));
  json.part = code;
  json.texts.forEach((x) => { x.title = `${x.title} ${tag}`; });
  return { text: `Here you go!\n\n\`\`\`json\n${JSON.stringify(json, null, 2)}\n\`\`\``, titles: json.texts.map((x) => x.title) };
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

// Starts a fresh package on Home and returns its request's code (a waiting redo or fix-it from an
// earlier run would otherwise answer "next"; G-02 FR-206 changed on 2026-10-26).
async function freshPrompt(page) {
  await expect(page.locator('#progress')).not.toBeEmpty();
  if (await page.locator('#new-package').isVisible()) await page.locator('#new-package').click();
  else await page.locator('#get-texts').click();
  await expect(page.locator('#prompt-area')).toBeVisible();
  const home = await page.evaluate(async () => (await fetch('/api/home')).json());
  return home.waiting;
}

test('FR-201 FR-203 FR-219 RQ-40 RQ-19 RQ-390 RQ-402: Home shows the topic; Get texts asks for a new chat and gives the setup and the request, each copied with Copy prompt ("Copied to clipboard", the text itself hidden); a pasted answer adds three texts', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await signIn(page);
  await expect(page.locator('#topic-text')).not.toBeEmpty();
  const waiting = await freshPrompt(page);
  await expect(page.locator('#new-chat-note')).toContainText('Open a new chat');
  const steps = page.locator('#prompt-steps .prompt-step');
  await expect(steps).toHaveCount(waiting.steps.length + 1);
  await expect(steps.first()).toContainText('setup');
  await steps.first().getByRole('button', { name: 'Copy prompt' }).click();
  await expect(steps.first().locator('.copied')).toHaveText('Copied to clipboard');
  await expect(steps.first().locator('textarea')).toBeHidden();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('reply only with "OK"');
  await steps.last().getByRole('button', { name: 'Copy prompt' }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(waiting.code);
  const { text, titles } = answerFor('good.json', waiting.code);
  await page.getByLabel("Paste the AI's answer here").fill(text);
  await page.getByRole('button', { name: 'Add texts' }).click();
  await expect(page.locator('#package-message')).toHaveText(/3 texts added/);
  for (const title of titles) await expect(page.locator('#texts')).toContainText(title);
  await expect(page.locator('#texts')).toContainText('listening · new');
});

test('FR-201 RQ-402: when copying is blocked, the prompt is shown and selected for copying by hand', async ({ page }) => {
  await signIn(page);
  await page.evaluate(() => { navigator.clipboard.writeText = () => Promise.reject(new Error('blocked')); });
  await freshPrompt(page);
  const last = page.locator('#prompt-steps .prompt-step').last();
  await last.getByRole('button', { name: 'Copy prompt' }).click();
  await expect(last.locator('.copied')).toContainText('copy it by hand');
  await expect(last.locator('textarea')).toBeVisible();
  await expect(last.locator('textarea')).toBeFocused();
});

test('FR-206 FR-221 RQ-185 RQ-63 RQ-395: a text with too many new words is asked for again on its own while the others are kept; HTML in an answer is shown as text', async ({ page }) => {
  await signIn(page);
  const waiting = await freshPrompt(page);
  const bad = answerFor('too-many-new.json', waiting.code);
  await page.getByLabel("Paste the AI's answer here").fill(bad.text);
  await page.getByRole('button', { name: 'Add texts' }).click();
  await expect(page.locator('#package-message')).toHaveText(/2 texts added/);
  await expect(page.locator('#problems')).toContainText('Hon säljer stora bullar med kanel.');
  await expect(page.locator('#prompt-heading')).toHaveText(/Ask again for one text/);
  const redo = (await page.evaluate(async () => (await fetch('/api/home')).json())).waiting;
  const one = JSON.parse(sample('script.json'));
  one.part = redo.code;
  one.texts = [one.texts[0]];
  one.texts[0].title = `${one.texts[0].title} ${Math.random().toString(36).slice(2, 7)}`;
  await page.getByLabel("Paste the AI's answer here").fill(JSON.stringify(one));
  await page.getByRole('button', { name: 'Add texts' }).click();
  await expect(page.locator('#package-message')).toHaveText(/1 text added/);
  const item = page.locator('#texts a', { hasText: one.texts[0].title });
  await expect(item).toContainText('<b>x</b> rubrik');
  await expect(item.locator('b')).toHaveCount(0);
  await item.click();
  const line = page.locator('#lines li').first();
  await expect(line.locator('.en')).toHaveText('<script>alert(1)</script> <b>x</b>');
  await expect(line.locator('script, b')).toHaveCount(0);
});

test('FR-203 FR-219 RQ-391 RQ-394: I\'m in a new chat gives the setup again before the same request; the whole-package choice is kept', async ({ page }) => {
  await signIn(page);
  const waiting = await freshPrompt(page);
  await page.getByRole('button', { name: 'Add texts' }).waitFor();
  const answer = answerFor('good.json', waiting.code);
  await page.getByLabel("Paste the AI's answer here").fill(answer.text);
  await page.getByRole('button', { name: 'Add texts' }).click();
  await expect(page.locator('#package-message')).toHaveText(/3 texts added/);
  await page.locator('#get-texts').click();
  await expect(page.locator('#prompt-steps .prompt-step')).toHaveCount(1);
  await page.getByRole('button', { name: "I'm in a new chat" }).click();
  await expect(page.locator('#prompt-steps .prompt-step').first()).toContainText('setup');
  await expect(page.locator('#new-chat-note')).toContainText('Open a new chat');
  await page.locator('#whole-package').check();
  await expect(page.locator('#package-message')).toContainText('whole package');
  await page.reload();
  await expect(page.locator('#whole-package')).toBeChecked();
  await page.locator('#whole-package').uncheck();
  await expect(page.locator('#package-message')).toContainText('one part at a time');
});

test('FR-218 RQ-36 RQ-46 RQ-11: open a text, see each line\'s English, answer a question, rate it, and see it rated on Home', async ({ page }) => {
  await signIn(page);
  // A reading text: listening texts open in listening mode (G-05 FR-509).
  const first = page.locator('#texts a', { hasText: 'reading ·' }).first();
  await expect(first).toBeVisible();
  const title = (await first.locator('.text-title').textContent()).trim();
  await first.click();
  await page.waitForURL(/\/text\?id=\d+$/);
  await expect(page.locator('#title')).toHaveText(title);
  // G-02 FR-218 now follows G-03 FR-301: English shows under each line by default.
  const line = page.locator('#lines li').first();
  await expect(line.locator('.en')).toBeVisible();
  const question = page.locator('#questions fieldset').first();
  await question.getByRole('button').first().click();
  await expect(question.locator('.feedback')).toHaveText(/Right|Not quite/);
  await page.getByRole('button', { name: 'Most', exact: true }).click();
  await expect(page.locator('#rating-message')).toHaveText(/Thanks/);
  await page.getByRole('link', { name: 'Back to Home' }).click();
  // FR-219 names each text's kind with its state since 2026-10-26.
  await expect(page.locator('#texts a', { hasText: title }).locator('.text-state')).toHaveText('reading · rated');
});
