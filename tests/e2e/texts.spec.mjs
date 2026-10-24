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

// Gets the current prompt on Home (starting a package or the next part, or a new package if the last waits for ratings).
async function currentPrompt(page) {
  const prompt = page.locator('#prompt');
  if (!(await prompt.isVisible())) {
    await page.locator('#get-texts').click();
    // Either the prompt appears, or grove says to rate the package's texts first.
    await page.waitForFunction(() => !document.getElementById('prompt-area').hidden
      || /Rate every text/.test(document.getElementById('package-message').textContent));
    if (await page.locator('#prompt-area').isHidden()) {
      await page.getByRole('button', { name: 'New package' }).click();
    }
  }
  await expect(prompt).toBeVisible();
  const value = await prompt.inputValue();
  return value.match(/"part": "([A-Z]{4}-\d)"/)[1];
}

test('FR-201 FR-219 RQ-40 RQ-19: Home shows the topic; Get texts shows the prompt; Copy prompt copies it; a pasted answer adds three texts', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await signIn(page);
  await expect(page.locator('#topic-text')).not.toBeEmpty();
  const code = await currentPrompt(page);
  await page.getByRole('button', { name: 'Copy prompt' }).first().click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(code);
  const { text, titles } = answerFor('good.json', code);
  await page.getByLabel("Paste the AI's answer here").fill(text);
  await page.getByRole('button', { name: 'Add texts' }).click();
  await expect(page.locator('#package-message')).toHaveText(/3 texts added/);
  for (const title of titles) await expect(page.locator('#texts')).toContainText(title);
});

test('FR-206 FR-221 RQ-185 RQ-63: a bad answer shows its problems and a fix-it prompt; HTML in an answer is shown as text', async ({ page }) => {
  await signIn(page);
  const code = await currentPrompt(page);
  await page.getByLabel("Paste the AI's answer here").fill(answerFor('too-many-new.json', code).text);
  await page.getByRole('button', { name: 'Add texts' }).click();
  await expect(page.locator('#problems')).toContainText('Hon säljer stora bullar med kanel.');
  await expect(page.locator('#prompt-heading')).toHaveText(/Fix-it prompt/);
  await expect(page.locator('#prompt')).toHaveValue(/whole corrected JSON block/);
  const { text, titles } = answerFor('script.json', code);
  await page.getByLabel("Paste the AI's answer here").fill(text);
  await page.getByRole('button', { name: 'Add texts' }).click();
  await expect(page.locator('#package-message')).toHaveText(/3 texts added/);
  const item = page.locator('#texts a', { hasText: titles[0] });
  await expect(item).toContainText('<b>x</b> rubrik');
  await expect(item.locator('b')).toHaveCount(0);
  await item.click();
  const line = page.locator('#lines li').first();
  await line.getByRole('button', { name: 'English' }).click();
  await expect(line.locator('.en')).toHaveText('<script>alert(1)</script> <b>x</b>');
  await expect(line.locator('script, b')).toHaveCount(0);
});

test('FR-218 RQ-36 RQ-46 RQ-11: open a text, show a line in English, answer a question, rate it, and see it rated on Home', async ({ page }) => {
  await signIn(page);
  const first = page.locator('#texts a').first();
  await expect(first).toBeVisible();
  const title = (await first.locator('.text-title').textContent()).trim();
  await first.click();
  await page.waitForURL(/\/text\?id=\d+$/);
  await expect(page.locator('#title')).toHaveText(title);
  const line = page.locator('#lines li').first();
  await expect(line.locator('.en')).toBeHidden();
  await line.getByRole('button', { name: 'English' }).click();
  await expect(line.locator('.en')).toBeVisible();
  const question = page.locator('#questions fieldset').first();
  await question.getByRole('button').first().click();
  await expect(question.locator('.feedback')).toHaveText(/Right|Not quite/);
  await page.getByRole('button', { name: 'Most', exact: true }).click();
  await expect(page.locator('#rating-message')).toHaveText(/Thanks/);
  await page.getByRole('link', { name: 'Back to Home' }).click();
  await expect(page.locator('#texts a', { hasText: title }).locator('.text-state')).toHaveText('rated');
});
