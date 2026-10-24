import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { REVIEWER } from '../fakes/dev-accounts.mjs';

const SAMPLE = readFileSync(new URL('../texts/answers/good-patterns.json', import.meta.url), 'utf8');

// A fake speech engine: records what is spoken and ends each utterance quickly.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.__spoken = [];
    const fake = {
      speak(u) { window.__spoken.push(u.text); setTimeout(() => u.onend && u.onend(), 40); },
      cancel() {},
      getVoices() { return [{ lang: 'sv-SE', name: 'Fake Swedish' }]; },
    };
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

// Adds the sample answer (with patterns) through the API from the page, with unique titles; returns its text ids by title.
async function addSample(page) {
  const tag = Math.random().toString(36).slice(2, 7);
  return page.evaluate(async ({ sample, tag }) => {
    const me = await (await fetch('/api/me')).json();
    const h = { 'content-type': 'application/json', 'x-csrf-token': me.csrf };
    await fetch('/api/settings', { method: 'POST', headers: h, body: JSON.stringify({ showTranslations: true }) });
    let p = await fetch('/api/prompt', { method: 'POST', headers: h, body: JSON.stringify({ action: 'next' }) });
    if (p.status === 409) p = await fetch('/api/prompt', { method: 'POST', headers: h, body: JSON.stringify({ action: 'new_package' }) });
    const prompt = await p.json();
    const answer = JSON.parse(sample.replaceAll('TEST-1', prompt.code));
    answer.texts.forEach((x) => { x.title = `${x.title} ${tag}`; });
    const r = await (await fetch('/api/answer', { method: 'POST', headers: h, body: JSON.stringify({ exchangeId: prompt.exchangeId, answer: JSON.stringify(answer) }) })).json();
    return Object.fromEntries(r.texts.map((x) => [x.title.replace(` ${tag}`, ''), x.id]));
  }, { sample: SAMPLE, tag });
}

test('FR-305 FR-301 FR-304 RQ-18 RQ-10: English under each line; a tap speaks the word and opens its menu fast; translations can be turned off and peeked at', async ({ page }) => {
  await signIn(page);
  const ids = await addSample(page);
  await page.goto(`/text?id=${ids['En bra dag']}`);
  await expect(page.locator('#lines li').first().locator('.en')).toBeVisible();
  await expect(page.locator('#stats')).toContainText('words');
  const word = page.locator('button.w', { hasText: 'kopparna' });
  const started = Date.now();
  await word.click();
  await expect(page.locator('#menu')).toBeVisible();
  expect(Date.now() - started).toBeLessThan(500);
  await expect(page.locator('#menu-lemma')).toHaveText('kopp');
  await expect(page.locator('#menu-meaning')).toHaveText('the cups');
  await expect(page.locator('#menu-status')).toContainText('Leaf');
  expect(await page.evaluate(() => window.__spoken)).toContain('kopparna');
  await page.locator('#menu-close').click();
  await page.locator('#toggle-en').click();
  await page.reload();
  const line = page.locator('#lines li').first();
  await expect(line.locator('.en')).toBeHidden();
  await line.getByRole('button', { name: 'English' }).click();
  await expect(line.locator('.en')).toBeVisible();
  await page.locator('#toggle-en').click();
});

test('FR-308 RQ-12: the pattern\'s words are coloured, and the menu shows the pattern\'s name and explanation', async ({ page }) => {
  await signIn(page);
  const ids = await addSample(page);
  await page.goto(`/text?id=${ids['Olles väska']}`);
  for (const w of ['har', 'han', 'glömt']) {
    await expect(page.locator('#lines li').nth(8).locator('button.w.pattern', { hasText: new RegExp(`^${w}$`) })).toHaveCount(1);
  }
  await page.locator('button.w.pattern', { hasText: 'glömt' }).click();
  await expect(page.locator('#menu-pattern-list')).toContainText('har + supine');
  await expect(page.locator('#menu-pattern-list')).toContainText('Past action');
});

test('FR-310 FR-311 FR-312 RQ-274 RQ-276: Practise asks word meanings with English after each answer, then the passage questions, then plays the text with highlighting', async ({ page }) => {
  await signIn(page);
  const ids = await addSample(page);
  await page.goto(`/text?id=${ids['En bra dag']}`);
  await page.locator('#practise').click();
  await expect(page.locator('#practice-card')).toBeVisible();
  await expect(page.locator('#practice legend')).toContainText('mean here');
  await page.locator('#practice button.option').first().click();
  await expect(page.locator('#practice .feedback')).toHaveText(/Right|Not quite/);
  await expect(page.locator('#practice .practice-en')).toBeVisible();
  while (await page.getByRole('button', { name: 'Next' }).isVisible()) {
    await page.getByRole('button', { name: 'Next' }).click();
    const option = page.locator('#practice button.option:not([disabled])').first();
    if (await option.isVisible().catch(() => false) && await page.locator('#practice legend').first().textContent().then((t) => t.includes('mean here'))) await option.click();
  }
  await expect(page.locator('#practice-heading')).toHaveText(/questions about the text/);
  await page.getByRole('button', { name: 'Show the whole text' }).click();
  await page.locator('#play').click();
  await expect(page.locator('#practice-lines .sentence.speaking')).toHaveCount(1);
  await expect(page.locator('#practice-lines .sentence.speaking')).toHaveCount(0, { timeout: 10000 });
  const spoken = await page.evaluate(() => window.__spoken);
  expect(spoken).toContain('På kvällen är kaféet tomt.');
  await page.locator('#play').click();
  await page.locator('#stop').click();
  await expect(page.locator('#practice-lines .sentence.speaking')).toHaveCount(0);
});

test('FR-313 FR-315 RQ-297 RQ-301: Explain from the menu and Report on a question', async ({ page }) => {
  await signIn(page);
  const ids = await addSample(page);
  await page.goto(`/text?id=${ids['En bra dag']}`);
  await page.locator('button.w', { hasText: 'kopparna' }).click();
  await page.locator('#menu-explain').click();
  await page.getByLabel('Why this form').check();
  await page.locator('#explain-form input[name="note"]').fill('why -arna?');
  await page.getByRole('button', { name: 'Ask for an explanation' }).click();
  await expect(page.locator('#menu-message')).toHaveText(/Asked — the next prompt will include it/);
  await page.locator('#menu-close').click();
  const question = page.locator('#questions fieldset').first();
  await question.getByRole('button', { name: 'Report' }).click();
  await page.locator('#report-form').getByLabel('Wrong answer').check();
  await page.getByRole('button', { name: 'Send report' }).click();
  await expect(page.locator('#menu-message')).toHaveText(/Reported \(R\d+\)/);
  await page.locator('#menu-close').click();
  await expect(question.locator('.feedback')).toHaveText(/Reported/);
});

test('FR-316 FR-317 RQ-53 RQ-56: the dictionary lists words with meaning and example, filters by search, and shows names apart', async ({ page }) => {
  await signIn(page);
  await addSample(page);
  await page.goto('/dictionary');
  const kopp = page.locator('#dict-words li', { has: page.locator('strong', { hasText: /^kopp$/ }) });
  await expect(kopp).toContainText('cup');
  await expect(kopp.locator('.example')).toContainText(/kopp/i);
  await page.locator('#search').fill('umbrella');
  await expect(page.locator('#dict-words li')).toHaveCount(1);
  await expect(page.locator('#names')).toContainText('Elsa');
});

test('FR-318 FR-304 RQ-74: an own text is saved without English, HTML in it shows as text, and a new word can be saved as a leaf', async ({ page }) => {
  await signIn(page);
  // A made-up word, new on every run (the reviewer account is shared between test runs).
  const newWord = `kanelbulle${Math.random().toString(36).replace(/[^a-z]/g, '').slice(0, 5)}`;
  await page.locator('#own-form input[name="title"]').fill('<b>Min</b> dag');
  await page.locator('#own-form textarea[name="text"]').fill(`Idag dricker jag kaffe och äter en ${newWord}.\n<i>Det</i> är gott!`);
  await page.getByRole('button', { name: 'Save text' }).click();
  await page.waitForURL(/\/text\?id=\d+$/);
  await expect(page.locator('#title')).toHaveText('<b>Min</b> dag');
  await expect(page.locator('#title b')).toHaveCount(0);
  await expect(page.locator('#lines')).toContainText('<i>Det</i>');
  await expect(page.locator('#lines i')).toHaveCount(0);
  await expect(page.locator('#stats')).toContainText('your own text');
  await expect(page.locator('#lines .en')).toHaveCount(0);
  await page.locator('button.w', { hasText: newWord }).click();
  await page.locator('#menu-save').click();
  await expect(page.locator('#menu-message')).toHaveText('Saved as a leaf.');
});
