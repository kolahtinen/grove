import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { REVIEWER } from '../fakes/dev-accounts.mjs';
import { startTestGrove, seedGround, PASSWORD } from '../fakes/harness.mjs';

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
  // FR-223: the AI is chosen first; the shared reviewer account uses free ChatGPT, step by step.
  await page.evaluate(async () => {
    const me = await (await fetch('/api/me')).json();
    await fetch('/api/plan', { method: 'POST', headers: { 'content-type': 'application/json', 'x-csrf-token': me.csrf }, body: JSON.stringify({ family: 'chatgpt', product: 'free' }) });
  });
  await page.reload();
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
  // G-03 FR-301 (addendum 003): the English shows under the text with Show translation.
  await page.getByRole('button', { name: 'Show translation' }).click();
  await expect(page.locator('#translation .en').first()).toHaveText('<script>alert(1)</script> <b>x</b>');
  await expect(page.locator('#translation script, #translation b')).toHaveCount(0);
});

test('FR-223 RQ-403 RQ-404 RQ-391: the AI and version menus recommend a tactic in tabs; another can be chosen; I\'m in a new chat gives the setup again', async ({ page }) => {
  await signIn(page);
  const waiting = await freshPrompt(page);
  const answer = answerFor('good.json', waiting.code);
  await page.getByLabel("Paste the AI's answer here").fill(answer.text);
  await page.getByRole('button', { name: 'Add texts' }).click();
  await expect(page.locator('#package-message')).toHaveText(/3 texts added/);
  await page.locator('#get-texts').click();
  await expect(page.locator('#prompt-steps .prompt-step')).toHaveCount(1);
  await page.getByRole('button', { name: "I'm in a new chat" }).click();
  await expect(page.locator('#prompt-steps .prompt-step').first()).toContainText('setup');

  await page.getByRole('combobox', { name: 'AI', exact: true }).selectOption('lechat');
  await expect(page.getByRole('combobox', { name: 'Version' })).toHaveValue('free');
  const tabs = page.locator('#tactic-tabs [role="tab"]');
  await expect(tabs).toHaveText([/Step by step/, /One long prompt.*Recommended/, /Whole package/]);
  await expect(page.locator('#tactic-panel')).toContainText('carries the rules and your known words');
  await expect(tabs.nth(1)).toContainText('In use');
  await tabs.nth(2).click();
  await expect(page.locator('#tactic-panel')).toContainText('all three parts');
  await page.getByRole('button', { name: 'Use this way' }).click();
  await expect(page.locator('#plan-message')).toContainText('whole package, from your next package on');
  await page.reload();
  await expect(page.locator('#tactic-tabs [role="tab"]').nth(2)).toContainText('In use');
  await page.getByRole('combobox', { name: 'AI', exact: true }).selectOption('chatgpt');
  await expect(page.locator('#tactic-tabs [role="tab"]').nth(0)).toContainText('Recommended · In use');
});

test('FR-224 RQ-406: texts from the AI and own texts carry a Beta badge, on Home and the reading page', async ({ page }) => {
  await signIn(page);
  await expect(page.locator('#package-card h2 .beta')).toHaveText('Beta');
  await expect(page.locator('#own-card h2 .beta')).toHaveText('Beta');
  const item = page.locator('#texts a', { hasText: 'reading ·' }).first();
  await expect(item.locator('.beta')).toHaveText('Beta');
  await item.click();
  await expect(page.locator('#beta')).toBeVisible();
  await expect(page.locator('#beta-note')).toHaveText('This part of grove is new and still being tested.');
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
  // G-02 FR-218 follows G-03 FR-301 (addendum 003): no English under the lines; Show translation shows it.
  await expect(page.locator('#lines .en')).toHaveCount(0);
  await page.getByRole('button', { name: 'Show translation' }).click();
  await expect(page.locator('#translation .en').first()).toBeVisible();
  const question = page.locator('#questions fieldset').first();
  await question.getByRole('button').first().click();
  await expect(question.locator('.feedback')).toHaveText(/Right|Not quite/);
  await page.getByRole('button', { name: 'Most', exact: true }).click();
  await expect(page.locator('#rating-message')).toHaveText(/Thanks/);
  await page.getByRole('link', { name: 'Back to Home' }).click();
  // FR-219 names each text's kind with its state since 2026-10-26.
  await expect(page.locator('#texts a', { hasText: title }).locator('.text-state')).toHaveText('reading · rated');
});

// A grove of the test's own with one new learner, so the test doesn't depend on what earlier tests
// did to the shared reviewer account.
async function ownGrove(page, email) {
  const t = await startTestGrove({ host: 'localhost' });
  const learner = t.seedAccount({ email });
  seedGround(t.grove.db, learner.id, readFileSync(new URL('../../docs/middle/ai-test/known.txt', import.meta.url), 'utf8').split(/\s+/).filter(Boolean));
  // Past the starting check and the welcome, as a learner with a ground would be.
  t.grove.db.prepare('INSERT OR IGNORE INTO learner_settings (account_id) VALUES (?)').run(learner.id);
  t.grove.db.prepare('UPDATE learner_settings SET start_done = 1, welcome_dismissed = 1 WHERE account_id = ?').run(learner.id);
  await page.goto(`${t.base}/signin`);
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL(/\/terms$/);
  await page.getByLabel(/I agree to the terms/).check();
  await page.getByLabel(/I am 13 or over/).check();
  await page.getByRole('button', { name: 'Agree' }).click();
  await page.waitForURL(`${t.base}/`);
  return { t, learner };
}

test('FR-224 RQ-406: a text from the AI has a Beta badge on Home and its reading page; a demo text has none', async ({ page }) => {
  await signIn(page);
  const added = await page.evaluate(async (good) => {
    const me = await (await fetch('/api/me')).json();
    const h = { 'content-type': 'application/json', 'x-csrf-token': me.csrf };
    const p = await (await fetch('/api/prompt', { method: 'POST', headers: h, body: JSON.stringify({ action: 'new_package' }) })).json();
    const a = JSON.parse(good);
    a.part = p.code;
    const tag = Math.random().toString(36).slice(2, 7);
    a.texts.forEach((x) => { x.title = `${x.title} ${tag}`; });
    return (await (await fetch('/api/answer', { method: 'POST', headers: h, body: JSON.stringify({ exchangeId: p.exchangeId, answer: JSON.stringify(a) }) })).json()).texts;
  }, sample('good.json'));
  const reading = added.find((x) => x.kind === 'reading');
  await page.reload();
  const item = page.locator('#texts a', { hasText: reading.title });
  await expect(item.locator('.beta')).toHaveText('Beta');
  const demo = page.locator('#texts a', { hasText: 'Brevet i väskan' });
  await expect(demo).toBeVisible();
  await expect(demo.locator('.beta')).toHaveCount(0);
  await item.click();
  await expect(page.locator('#beta')).toBeVisible();
  await page.goBack();
  await page.locator('#texts a', { hasText: 'Brevet i väskan' }).click();
  await expect(page.locator('#title')).toHaveText('Brevet i väskan');
  await expect(page.locator('#beta')).toBeHidden();
});

test('FR-223 RQ-403: the first Get texts asks for the AI and its version first', async ({ page }) => {
  const { t } = await ownGrove(page, 'ai-first@example.test');
  try {
    await page.locator('#get-texts').click();
    await expect(page.locator('#plan-message')).toHaveText('First choose your AI and its version, so grove can ask it the best way.');
    await expect(page.getByRole('combobox', { name: 'AI', exact: true })).toBeFocused();
    await expect(page.locator('#prompt-area')).toBeHidden();
    await page.getByRole('combobox', { name: 'AI', exact: true }).selectOption('chatgpt');
    await page.locator('#get-texts').click();
    await expect(page.locator('#prompt-area')).toBeVisible();
  } finally {
    await t.close();
  }
});

test('FR-223 RQ-405: after two failed answers in a row, Home offers the other main tactic, and its button switches to it', async ({ page }) => {
  const { t } = await ownGrove(page, 'offer@example.test');
  try {
    await page.evaluate(async (bad) => {
      const me = await (await fetch('/api/me')).json();
      const h = { 'content-type': 'application/json', 'x-csrf-token': me.csrf };
      const post = async (path, body) => (await fetch(path, { method: 'POST', headers: h, body: JSON.stringify(body) })).json();
      await post('/api/plan', { family: 'chatgpt', product: 'free' });
      const p = await post('/api/prompt', { action: 'next' });
      const first = await post('/api/answer', { exchangeId: p.exchangeId, answer: bad.replaceAll('TEST-1', p.code) });
      const home = await (await fetch('/api/home')).json();
      const one = JSON.parse(bad);
      one.part = home.waiting.code;
      one.texts = [one.texts[0]];
      await post('/api/answer', { exchangeId: first.next.exchangeId, answer: JSON.stringify(one) });
    }, sample('too-many-new.json'));
    await page.reload();
    await expect(page.locator('#offer')).toContainText('Texts keep failing.');
    await page.locator('#offer').getByRole('button', { name: 'Try one long prompt' }).click();
    await expect(page.locator('#plan-message')).toContainText('one long prompt');
    await page.reload();
    await expect(page.locator('#tactic-tabs [role="tab"]').nth(1)).toContainText('In use');
    await expect(page.locator('#offer')).toBeHidden();
  } finally {
    await t.close();
  }
});
