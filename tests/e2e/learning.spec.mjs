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
  await expect(fill.or(page.locator('#offer:visible, #start-card:visible'))).toBeVisible();
  if (await fill.isVisible()) await fill.click();
  await page.waitForURL(/\/session$/);
  // G-09 FR-904 (RQ-457): the session opens on its start screen.
  await page.locator('#session-start').click();
}

test('FR-928 FR-932 RQ-452 RQ-457: Words shows the next words one per card (Word i of n, dots above the word) with Play, I know it and + Pick up each with its hint, then the words with what was done and how many were picked up; a phrase spotlight asks what it means first', async ({ page }) => {
  await signIn(page);
  await startFrom(page, 'discover', ['Words'], 10);
  const box = page.locator('#exercise-box');
  await expect(page.locator('#exercise-kicker')).toContainText(/Words · Next words · [ABC][12]/);
  await expect(page.locator('#exercise-task')).toHaveText('Do you know this word?');
  await expect(page.locator('#exercise-hint')).toHaveText(/^Word 1 of [1-4]$/);
  const total = Number((await page.locator('#exercise-hint').textContent()).match(/of (\d)/)[1]);
  await expect(box.locator('.big-word')).not.toBeEmpty();
  await expect(box.locator('.example')).toBeVisible();
  const [dots, word] = [await box.locator('.card-dots').boundingBox(), await box.locator('.big-word').boundingBox()];
  expect(dots.y + dots.height).toBeLessThanOrEqual(word.y + 1);
  await box.getByRole('button', { name: 'Play' }).click();
  expect((await page.evaluate(() => window.__spoken)).length).toBeGreaterThan(0);
  await expect(box.locator('.card-dots i')).toHaveCount(total);
  await expect(box.getByRole('button', { name: /I know it/ })).toContainText('add it to your ground');
  await expect(box.getByRole('button', { name: /\+ Pick up/ })).toContainText('learn it in Review');
  await expect(page.locator('#action')).toBeDisabled();
  await expect(page.locator('#wait')).toHaveText('Choose for each word');
  await box.getByRole('button', { name: /\+ Pick up/ }).click();
  for (let i = 1; i < total; i += 1) {
    await expect(page.locator('#exercise-hint')).toHaveText(`Word ${i + 1} of ${total}`);
    await box.getByRole('button', { name: /I know it/ }).click();
  }
  await expect(page.locator('#exercise-task')).toHaveText(`${total} new word${total === 1 ? '' : 's'} seen`);
  await expect(box.locator('.ex-list li')).toHaveCount(total);
  await expect(box.locator('.ex-list li').first()).toContainText('picked up ✓');
  await expect(page.locator('#feedback')).toHaveText('1 picked up. grove brings it back in Review.');
  await page.locator('#action').click();
  await expect(page.locator('#exercise-kicker')).toContainText('Phrase spotlight');
  const choices = box.getByRole('group', { name: 'What does it mean?' }).getByRole('button');
  await expect(choices).toHaveCount(3);
  const ex = await page.evaluate(async () => (await (await fetch('/api/session')).json()).session.exercise);
  await choices.nth(ex.phrase.right).click();
  await expect(box.locator('.choices button.right')).toHaveCount(1);
  await expect(page.locator('#feedback')).toHaveText(`Right. ${ex.phrase.phrase} = ${ex.phrase.en}.`);
  await expect(box.locator('.note-box')).toBeVisible();
  await box.getByRole('button', { name: '+ Pick up this phrase' }).click();
  await expect(box.getByRole('button', { name: /Picked up/ })).toBeVisible();
});

test('FR-929 RQ-453: Grammar is the pattern of the day in two steps in order (Learn, then Spot it, no tabs); a tap on any word of a place marks the whole place; a word keeps its punctuation; Check shows found, missed (outlined around the place only) and taps that were not the pattern', async ({ page }) => {
  await signIn(page);
  await startFrom(page, 'discover', ['Grammar'], 5);
  const box = page.locator('#exercise-box');
  await expect(box.getByRole('tab')).toHaveCount(0);
  await expect(page.locator('#exercise-task')).toHaveText('Learn the pattern.');
  await expect(page.locator('#exercise-hint')).toHaveText('Step 1 of 2. Then you spot it in a short text.');
  await expect(page.locator('#exercise-kicker')).toContainText('Grammar · Pattern of the day ·');
  await expect(box.locator('mark.pattern-part').first()).toBeVisible();
  await page.getByRole('button', { name: 'Now spot it in a text' }).click();
  await expect(page.locator('#exercise-task')).toHaveText('Tap every place you see the pattern.');
  await expect(page.locator('#exercise-hint')).toContainText('Step 2 of 2.');
  await expect(page.locator('#action')).toBeDisabled();
  await expect(page.locator('#wait')).toHaveText('Tap at least one place');
  // A word keeps the punctuation right after it in its button.
  for (const t of await box.locator('.spot button.w').allTextContents()) expect(t).not.toMatch(/^[.,!?;:]/);
  const places = box.locator('.spot > span');
  const n = await places.count();
  expect(n).toBeGreaterThan(1);
  await places.first().locator('button.w').last().click();
  await expect(places.first()).toHaveClass(/tapped/);
  const loose = box.locator('.spot > button.w').first();
  await loose.click();
  await page.locator('#action').click();
  await expect(page.locator('#feedback')).toContainText(`You found 1 of ${n}.`);
  await expect(page.locator('#feedback')).toContainText('The ones you missed have a dashed line.');
  await expect(page.locator('#feedback')).toContainText('1 tap was not the pattern.');
  await expect(box.locator('.spot .found')).toHaveCount(1);
  await expect(box.locator('.spot .missed')).toHaveCount(n - 1);
  await expect(box.locator('.spot button.w.off')).toHaveCount(1);
  // The outline is around the place's words only: no text after its last word inside it.
  expect(await box.locator('.spot .missed').first().evaluate((sp) => /\s$/.test(sp.textContent))).toBe(false);
  await expect(page.locator('#action')).toHaveText('Next');
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

test('FR-305 RQ-455 RQ-456: the word menu has its own Grammar in this word section, listing a grove grammar ladder pattern the tapped word is part of as a folded row with its level, and Pick up this pattern', async ({ page }) => {
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
  await expect(page.locator('#menu .sec-title', { hasText: 'Grammar in this word' })).toBeVisible();
  const row = page.locator('#menu-pattern-list .prow', { hasText: found.pattern.name });
  await expect(row).toBeVisible();
  await expect(row.locator('.ladder-level')).toHaveText(found.pattern.level);
  await expect(row.getByRole('button', { name: 'More' })).toBeHidden();
  await row.locator('button.phead').click();
  await expect(row.locator('button.phead')).toHaveAttribute('aria-expanded', 'true');
  await expect(row.getByRole('button', { name: 'More' })).toBeVisible();
  if (!found.pattern.drilled) {
    await row.getByRole('button', { name: `Pick up ${found.pattern.name}` }).click();
    await expect(page.locator('.toast')).toContainText(`${found.pattern.name} is a leaf`);
    await expect(row.getByRole('button', { name: `Let ${found.pattern.name} fall` })).toBeVisible();
  }
});

test('FR-305 FR-916 RQ-465: a grove text\'s own grammar pattern shows in the word menu with its level chip, and Pick up this pattern picks it up by name', async ({ page }) => {
  await signIn(page);
  const found = await page.evaluate(async () => {
    const me = await (await fetch('/api/me')).json();
    const lib = await (await fetch('/api/library')).json();
    for (const t of lib.texts.filter((x) => x.kind === 'reading' && x.level === 'A2').slice(0, 20)) {
      const r = await fetch('/api/library/add', { method: 'POST', headers: { 'content-type': 'application/json', 'x-csrf-token': me.csrf }, body: JSON.stringify({ id: t.id }) });
      const { textId } = await r.json();
      const reading = await (await fetch(`/api/reading?id=${textId}`)).json();
      const tokens = reading.lines.flatMap((l) => l.sentences.flatMap((s) => s.tokens)).filter((x) => x.word);
      const counts = new Map();
      for (const x of tokens) counts.set(x.t, (counts.get(x.t) ?? 0) + 1);
      for (const tok of tokens) {
        if (counts.get(tok.t) !== 1 || tok.status === 'name') continue;
        const pattern = (tok.patterns ?? []).map((id) => reading.patterns.find((p) => p.id === id)).find((p) => p?.level && !(p.state === 'leaf' && p.drilled));
        if (pattern) return { textId, word: tok.t, pattern };
      }
    }
    return null;
  });
  expect(found).not.toBeNull();
  await page.goto(`/text?id=${found.textId}`);
  await page.locator('button.w', { hasText: new RegExp(`^${found.word}$`) }).first().click();
  await expect(page.locator('#menu .sec-title', { hasText: 'Grammar in this word' })).toBeVisible();
  const row = page.locator('#menu-pattern-list .prow', { hasText: found.pattern.name });
  await expect(row).toBeVisible();
  await expect(row.locator('.ladder-level')).toHaveText(found.pattern.level);
  await row.locator('button.phead').click();
  const picked = page.waitForRequest((req) => req.url().endsWith('/api/pick-up') && req.method() === 'POST');
  await row.getByRole('button', { name: `Pick up ${found.pattern.name}` }).click();
  expect(JSON.parse((await picked).postData())).toMatchObject({ lemma: found.pattern.name, kind: 'pattern' });
  await expect(page.locator('.toast')).toContainText(`${found.pattern.name} is a leaf`);
  await expect(row.getByRole('button', { name: `Let ${found.pattern.name} fall` })).toBeVisible();
});

test('FR-306 FR-916 RQ-466: a grove text\'s own meaning is the word menu\'s meaning here (kort "card" in A1-03)', async ({ page }) => {
  await signIn(page);
  const textId = await page.evaluate(async () => {
    const me = await (await fetch('/api/me')).json();
    const r = await fetch('/api/library/add', { method: 'POST', headers: { 'content-type': 'application/json', 'x-csrf-token': me.csrf }, body: JSON.stringify({ id: 'A1-03' }) });
    return (await r.json()).textId;
  });
  await page.goto(`/text?id=${textId}`);
  await page.locator('button.w', { hasText: /^kort$/ }).first().click();
  await expect(page.locator('#menu-meaning')).toContainText('card');
});
