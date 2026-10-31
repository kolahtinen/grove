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

test('FR-904 FR-912 FR-932 FR-933 RQ-421 RQ-425 RQ-457: a session shows its start screen, then one exercise at a time in the shared frame (the session bar, the kicker line with the skill and time, the bottom bar\'s one button), texts inside the session, and ends with a summary of only the lines with something in them', async ({ page }) => {
  await signIn(page);
  await addSample(page);
  const started = await api(page, '/api/sessions', { kind: 'time', tile: 'mix', skill: 'mix', minutes: 10, voice: true, fill: true });
  expect(started.status, JSON.stringify(started.body)).toBe(200);
  const total = started.body.session.total;
  await page.goto('/session');
  await expect(page.locator('#start-card h2')).toHaveText('10-minute Mix');
  await expect(page.locator('#start-card .plan-list li')).toHaveCount(total);
  await page.locator('#session-start').click();
  await expect(page.locator('#session-count')).toHaveText(`1/${total}`);
  await expect(page.locator('#session-top .seg')).toHaveCount(total);
  // FR-912: the kicker line, the skill's icon and name, what it is and its time (seconds under a minute, half minutes above).
  await expect(page.locator('#exercise-kicker')).toHaveText(/^(Review|Reading|Listening|Words|Grammar) · .+(\d+ s|\d+½? min)$/);
  await expect(page.locator('#exercise-kicker svg.icon')).toHaveCount(1);
  expect(await page.locator('#exercise-kicker').evaluate((n) => getComputedStyle(n).textTransform)).toBe('none');
  await expect(page.locator('#exercise-banner')).toHaveCount(0);

  for (let step = 0; step < 80; step += 1) {
    await expect(page.locator('#exercise:visible, #session-end:visible')).toHaveCount(1);
    if (await page.locator('#session-end').isVisible()) break;
    const option = page.locator('#exercise-box button.option:not([disabled])').first();
    const know = page.getByRole('button', { name: /^I know it/ });
    const knew = page.getByRole('button', { name: 'I knew it' });
    const play = page.getByRole('button', { name: /^Play the text|^Play again/ });
    const rate = page.getByRole('button', { name: 'Most', exact: true });
    const tap = page.locator('#exercise-box .spot button.w:not([disabled])').first();
    const action = page.locator('#action');
    if (await know.isVisible()) await know.click();
    else if (await option.isVisible()) await option.click();
    else if (await knew.isVisible() && await knew.isEnabled()) await knew.click();
    else if (await action.isEnabled()) await action.click();
    else if (await play.isVisible() && await page.locator('#wait').textContent() === 'Play the text first') await play.click();
    else if (await rate.isVisible() && await rate.getAttribute('aria-pressed') !== 'true') await rate.click();
    else if (await tap.isVisible()) await tap.click();
    await page.waitForTimeout(120);
  }
  await expect(page.locator('#session-end')).toBeVisible();
  // FR-904 (RQ-457): only the lines with something in them, and the days practised this week.
  for (const n of await page.locator('#summary li b').allTextContents()) expect(Number(n)).toBeGreaterThan(0);
  await expect(page.locator('#summary li').last()).toContainText('Days practised this week');
  await expect(page.locator('#session-end')).toContainText('minutes of practice');
  await expect(page.getByRole('button', { name: 'Back to Home' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Another 10 minutes' })).toBeVisible();
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
  await expect(without.or(page.locator('#start-card:visible')).first()).toBeVisible();
  if (await without.isVisible()) await without.click();
  await expect(page.locator('#start-card h2')).toHaveText(`10-minute Mix: ${topic.label}`);
});

test('FR-918 RQ-435 RQ-439 RQ-460: Add a text is a chooser of three big choices, each with its explainer and an arrow, opening its own page, which leads back with ‹ Add a text; a way half done says Under way with Continue', async ({ page }) => {
  await signIn(page);
  await page.goto('/add');
  await expect(page.locator('main')).toContainText('Three ways to get Swedish texts into your library.');
  const ways = page.locator('.way-pick');
  await expect(ways.locator('b')).toHaveText([/^From the common library$/, /^Texts from your AI\s*Beta$/, /^Your own text\s*Beta$/]);
  await expect(ways.nth(0)).toContainText('Texts grove has written, by topic and level.');
  await expect(ways.nth(1)).toContainText('free AI chat');
  await expect(ways.nth(1)).toContainText('About 5 minutes');
  await expect(ways.nth(2)).toContainText('Only you see it.');
  await expect(ways.nth(0)).toHaveAttribute('href', '/library?from=add');
  await expect(ways.nth(1)).toHaveAttribute('href', '/add/ai');
  await expect(ways.nth(2)).toHaveAttribute('href', '/own');
  for (const w of await ways.all()) await expect(w.locator('.go')).toHaveText('›');
  await ways.nth(0).click();
  await page.waitForURL(/\/library\?from=add$/);
  await expect(page.locator('.way-back a')).toHaveText('‹ Add a text');
  await page.locator('.way-back a').click();
  await page.waitForURL(/\/add$/);
  await ways.nth(2).click();
  await page.waitForURL(/\/own$/);
  await expect(page.locator('.way-back a')).toHaveText('‹ Add a text');
  await page.getByLabel('Title').fill('Min lista');
  await page.getByLabel('Swedish text').fill('Jag läser en bok.');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await page.waitForURL(/\/own\?id=\d+$/);
  // A half-done way: Under way, with Continue to where the learner was.
  await page.goto('/add');
  const under = page.locator('.way-under', { hasText: 'Under way: step 2 of 3' });
  await expect(under).toBeVisible();
  await under.getByRole('link', { name: /Continue/ }).click();
  await page.waitForURL(/\/own\?id=\d+$/);
  await expect(page.locator('#own-count')).toHaveText('Step 2 of 3');
});

test('FR-919 RQ-436 RQ-403 RQ-461: Texts from your AI goes one step per screen: Step i of 5 with a bar, Done so far with what happened, the current step with one main button and Back; a copy never moves on by itself; the ways of asking sit folded under How grove asks; texts added end with Read and Ask for the next part', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await signIn(page);
  await api(page, '/api/plan', { family: 'chatgpt', product: 'free', tactic: 'steps' });
  await page.goto('/add/ai');
  await expect(page.locator('#tab-list, [role="tablist"]')).toHaveCount(0);
  await expect(page.locator('#step-count')).toHaveText(/^Step \d of 5$/);
  while (await page.locator('.ai-step[data-step="ai"]').isHidden()) await page.getByRole('button', { name: 'Back' }).click();
  await expect(page.locator('#step-count')).toHaveText('Step 1 of 5');
  await expect(page.locator('#mini-steps i')).toHaveCount(5);
  await expect(page.locator('.ai-step:not([hidden])')).toHaveCount(1);
  // FR-919 (question-pages/92, 3): the ways of asking folded under How grove asks, the recommended one chosen.
  await expect(page.locator('#tactics-summary')).toHaveText('How grove asks ChatGPT: step by step');
  await expect(page.locator('#tactics')).not.toHaveAttribute('open', '');
  await expect(page.locator('.tactic-option')).toHaveCount(3);
  await api(page, '/api/prompt', { action: 'new_package' });
  await page.reload();
  // A waiting package with a setup: step 2, Your AI done, with what happened in it.
  await expect(page.locator('#step-count')).toHaveText('Step 2 of 5');
  await expect(page.locator('#package-message')).toHaveText('Picking up where you left off.');
  await expect(page.locator('#done-summary')).toHaveText('Done so far (1)');
  await expect(page.locator('#done-list li')).toContainText('You chose ChatGPT (Free). grove will ask it step by step.');
  for (const b of await page.locator('#setup-steps').getByRole('button', { name: 'Copy prompt' }).all()) await b.click();
  await expect(page.locator('.ai-step[data-step="setup"]')).toBeVisible();
  await page.locator('#setup-done').click();
  await expect(page.locator('#package-message')).toContainText('Setup sent');
  await expect(page.locator('#step-count')).toHaveText('Step 3 of 5');
  await expect(page.locator('#done-list li').nth(1)).toContainText('ChatGPT said OK to the setup messages.');
  await expect(page.locator('#request-done')).toBeDisabled();
  await page.locator('#prompt-steps').getByRole('button', { name: 'Copy prompt' }).click();
  await expect(page.locator('#package-message')).toHaveText('Copied. Now paste it into ChatGPT and wait for its answer. It takes about a minute.');
  // A copy never moves on by itself (question-pages/92, 2).
  await expect(page.locator('#step-count')).toHaveText('Step 3 of 5');
  await page.locator('#request-done').click();
  await expect(page.locator('#step-count')).toHaveText('Step 4 of 5');
  await expect(page.getByLabel("Paste the AI's answer here")).toBeVisible();
  await page.getByRole('button', { name: 'Back' }).click();
  await expect(page.locator('#step-count')).toHaveText('Step 3 of 5');
  await page.locator('#request-done').click();
  const code = await page.evaluate(async () => (await (await fetch('/api/home')).json()).waiting.code);
  const tag = Math.random().toString(36).replace(/[^a-z]/g, '').slice(0, 5);
  const answer = JSON.parse(SAMPLE.replaceAll('TEST-1', code ?? 'TEST-1'));
  answer.texts.forEach((x) => { x.title = `${x.title} ${tag}`; });
  await page.getByLabel("Paste the AI's answer here").fill(JSON.stringify(answer));
  await page.getByRole('button', { name: 'Add texts' }).click();
  await expect(page.locator('#package-message')).toContainText(/\d+ texts? added/);
  await expect(page.locator('#step-count')).toHaveText('Step 5 of 5');
  await expect(page.locator('#added-list a').first()).toContainText(tag);
  await expect(page.locator('#added-more')).toContainText('That was part 1 of 3.');
  await expect(page.locator('#read-first')).toHaveText(new RegExp(`^Read “.*${tag}”$`));
  await expect(page.locator('#next-part')).toHaveText('Ask ChatGPT for part 2 of 3');
  await expect(page.getByRole('link', { name: 'Add another text' })).toHaveAttribute('href', '/add');
  await expect(page.getByRole('link', { name: 'Go to Your library' })).toHaveAttribute('href', '/texts');
});

test('FR-919 FR-206 RQ-461: an answer grove can\'t use (a refusal) says what went wrong with the fix-it request to copy, never staying on Reading…; the next paste, a correct answer, is added', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await signIn(page);
  await api(page, '/api/plan', { family: 'chatgpt', product: 'free', tactic: 'long' });
  const first = (await api(page, '/api/prompt', { action: 'new_package' })).body;
  await page.goto('/add/ai');
  await page.locator('#prompt-steps').getByRole('button', { name: 'Copy prompt' }).click();
  await page.locator('#request-done').click();
  await page.getByLabel("Paste the AI's answer here").fill('Sorry, I cannot do that.');
  await page.getByRole('button', { name: 'Add texts' }).click();
  await expect(page.locator('#fix-box .message')).toContainText('grove couldn\'t use this answer:');
  await expect(page.locator('#fix-box').getByRole('button', { name: 'Copy prompt' })).toBeVisible();
  await expect(page.locator('#package-message')).not.toContainText('Reading');
  await expect(page.locator('#step-count')).toHaveText('Step 4 of 5');
  const tag = Math.random().toString(36).replace(/[^a-z]/g, '').slice(0, 5);
  const answer = JSON.parse(SAMPLE.replaceAll('TEST-1', first.code));
  answer.texts.forEach((x) => { x.title = `${x.title} ${tag}`; });
  await page.getByLabel("Paste the AI's answer here").fill(JSON.stringify(answer));
  await page.getByRole('button', { name: 'Add texts' }).click();
  await expect(page.locator('#package-message')).toContainText(/\d+ texts? added/);
  await expect(page.locator('#package-message')).not.toContainText('already added');
  await api(page, '/api/plan', { family: 'chatgpt', product: 'free', tactic: 'steps' });
});
