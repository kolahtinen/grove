import { test, expect } from '@playwright/test';
import { agreeTerms } from './helpers.mjs';
import { REVIEWER } from '../fakes/dev-accounts.mjs';

// G-09 FR-928…FR-931 and G-03 FR-305 (B-26; the picked sketch, version B, question-pages/89).
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

async function startFrom(page, tile, skills, minutes) {
  await page.goto(`/options?tile=${tile}`);
  for (const s of skills) await page.getByRole('button', { name: s, exact: true }).click();
  await page.getByRole('radio', { name: `${minutes} minutes` }).click();
  await page.getByRole('button', { name: `Start · ${minutes} min` }).click();
  const fill = page.getByRole('group', { name: 'This session would be short' }).getByRole('button', { name: 'Fill the time' });
  await expect(fill.or(page.locator('#session-line'))).toBeVisible();
  if (await fill.isVisible()) await fill.click();
  await page.waitForURL(/\/session$/);
}

test('FR-928 RQ-452: Words shows the next words one per card with Play, I know it and + Pick up, then how many were picked up; a phrase spotlight asks what it means first', async ({ page }) => {
  await signIn(page);
  await startFrom(page, 'discover', ['Words'], 10);
  const box = page.locator('#exercise-box');
  await expect(box.locator('.ex-kicker')).toContainText(/Next words at your level · [ABC][12] · 1 of [1-4]/);
  const total = Number((await box.locator('.ex-kicker').textContent()).match(/of (\d)/)[1]);
  await expect(box.locator('.big-word')).not.toBeEmpty();
  await expect(box.locator('.example')).toBeVisible();
  await box.getByRole('button', { name: 'Play' }).click();
  expect((await page.evaluate(() => window.__spoken)).length).toBeGreaterThan(0);
  await expect(box.locator('.card-dots i')).toHaveCount(total);
  await box.getByRole('button', { name: '+ Pick up' }).click();
  for (let i = 1; i < total; i += 1) {
    await expect(box.locator('.ex-kicker')).toContainText(`${i + 1} of ${total}`);
    await box.getByRole('button', { name: 'I know it' }).click();
  }
  await expect(box.getByRole('heading', { name: `${total} new word${total === 1 ? '' : 's'} seen` })).toBeVisible();
  await expect(box).toContainText('1 picked up as leaves; grove will bring them back in Review.');
  await box.getByRole('button', { name: 'Next' }).click();
  await expect(box.locator('.ex-kicker')).toContainText('Phrase spotlight');
  const choices = box.getByRole('group', { name: 'What does it mean?' }).getByRole('button');
  await expect(choices).toHaveCount(3);
  await choices.first().click();
  await expect(box.locator('.choices button.right')).toHaveCount(1);
  await expect(box.locator('.note')).toBeVisible();
  await box.getByRole('button', { name: '+ Pick up' }).click();
  await expect(box.getByRole('button', { name: 'Picked up ✓' })).toBeVisible();
});

test('FR-929 RQ-453: Grammar is the pattern of the day in two steps; a tap on any word of a place marks the whole place; Check shows found, missed and taps that were not the pattern', async ({ page }) => {
  await signIn(page);
  await startFrom(page, 'discover', ['Grammar'], 5);
  const box = page.locator('#exercise-box');
  await expect(box.getByRole('tab', { name: '1 · Learn' })).toHaveAttribute('aria-selected', 'true');
  await expect(box.locator('.ex-kicker')).toContainText('Pattern of the day ·');
  await expect(box.locator('mark.pattern-part').first()).toBeVisible();
  await box.getByRole('button', { name: 'Now spot it in a text' }).click();
  await expect(box.getByRole('tab', { name: '2 · Spot it' })).toHaveAttribute('aria-selected', 'true');
  await expect(box).toContainText('Tap every place you see:');
  const places = box.locator('.spot > span');
  const n = await places.count();
  expect(n).toBeGreaterThan(1);
  await places.first().locator('button.w').last().click();
  await expect(places.first()).toHaveClass(/tapped/);
  const loose = box.locator('.spot > button.w').first();
  await loose.click();
  await box.getByRole('button', { name: 'Check' }).click();
  await expect(box.locator('.message')).toContainText(`You found 1 of ${n}.`);
  await expect(box.locator('.message')).toContainText(`grove shows the ${n - 1} you missed with a dashed line.`);
  await expect(box.locator('.message')).toContainText('1 tap was not the pattern.');
  await expect(box.locator('.spot .found')).toHaveCount(1);
  await expect(box.locator('.spot .missed')).toHaveCount(n - 1);
  await expect(box.locator('.spot button.w.off')).toHaveCount(1);
  await expect(box.getByRole('button', { name: 'Next' })).toBeFocused();
});

test('FR-931 RQ-454: Report on a card sends a reason and a note to grove\'s owner', async ({ page }) => {
  await signIn(page);
  await startFrom(page, 'discover', ['Grammar'], 5);
  const box = page.locator('#exercise-box');
  await box.getByRole('button', { name: 'Report' }).click();
  await box.getByLabel('What is wrong').selectOption('unnatural');
  await box.getByLabel('Note').fill('Line two sounds odd');
  await box.getByRole('button', { name: 'Send report' }).click();
  await expect(box.locator('.message')).toHaveText('Thanks — your report goes to grove’s owner.');
});

test('FR-305 RQ-455: the word menu has its own Patterns section, listing a grove grammar ladder pattern the tapped word is part of, with its level and Pick up', async ({ page }) => {
  await signIn(page);
  const found = await page.evaluate(async () => {
    const me = await (await fetch('/api/me')).json();
    const lib = await (await fetch('/api/library')).json();
    for (const t of lib.texts.filter((x) => x.kind === 'reading').slice(0, 30)) {
      const r = await fetch('/api/library/add', { method: 'POST', headers: { 'content-type': 'application/json', 'x-csrf-token': me.csrf }, body: JSON.stringify({ id: t.id }) });
      const { textId } = await r.json();
      const reading = await (await fetch(`/api/reading?id=${textId}`)).json();
      const tokens = reading.lines.flatMap((l) => l.sentences.flatMap((s) => s.tokens)).filter((x) => x.word);
      const counts = new Map();
      for (const x of tokens) counts.set(x.t, (counts.get(x.t) ?? 0) + 1);
      const tok = tokens.find((x) => x.ladder?.length && counts.get(x.t) === 1 && x.status !== 'name');
      if (tok) return { textId, word: tok.t, pattern: reading.ladder.find((p) => p.id === tok.ladder[0]) };
    }
    return null;
  });
  expect(found).not.toBeNull();
  await page.goto(`/text?id=${found.textId}`);
  await page.locator('button.w', { hasText: new RegExp(`^${found.word}$`) }).first().click();
  const section = page.locator('#menu-patterns');
  await expect(section.getByRole('heading', { name: 'Patterns' })).toBeVisible();
  const item = section.locator('li', { hasText: found.pattern.name });
  await expect(item).toBeVisible();
  await expect(item.locator('.ladder-level')).toHaveText(found.pattern.level);
  if (!found.pattern.drilled) {
    await item.getByRole('button', { name: 'Pick up' }).click();
    await expect(page.locator('#menu-message')).toContainText(`Picked up “${found.pattern.name}”`);
  }
});
