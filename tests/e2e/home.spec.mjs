import { test, expect } from '@playwright/test';
import { agreeTerms } from './helpers.mjs';
import { REVIEWER } from '../fakes/dev-accounts.mjs';
import { startTestGrove, PASSWORD } from '../fakes/harness.mjs';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const fake = { speak(u) { setTimeout(() => u.onend && u.onend(), 30); }, cancel() {}, getVoices() { return [{ lang: 'sv-SE', name: 'Fake' }]; } };
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
  if (await page.locator('#welcome').isVisible()) await page.locator('#welcome-close').click();
}

// G-09 FR-901 as amended by addendum 005 (question-pages/77, 3 and 8; question-pages/76, 2): three
// headed groups of labelled tiles.
// FR-905, FR-920 (addendum 006): a Review that would run short first offers Fill the time; a Mix or
// Discover short of new texts opens with its offer, where Practise without goes on.
async function goOnIfShort(page) {
  const fill = page.getByRole('group', { name: 'This session would be short' }).getByRole('button', { name: 'Fill the time' });
  await expect(fill.or(page.locator('#session-line'))).toBeVisible();
  if (await fill.isVisible()) await fill.click();
  await page.waitForURL(/\/session$/);
  const without = page.getByRole('button', { name: 'Practise without' });
  await expect(without.or(page.locator('#exercise'))).toBeVisible();
  if (await without.isVisible()) await without.click();
}

const GROUPS = { Learning: ['Discover', 'Review', 'Mix'], Library: ['Common library', 'Your library'], Progress: ['Progress'] };

test('FR-901 RQ-419 RQ-429 RQ-440: Home has three headed groups of labelled icon tiles in the spec\'s order; a tile opens below its row, one at a time, and Esc, ✕ or the tile again closes it with focus back on the tile', async ({ page }) => {
  await signIn(page);
  await expect(page.getByRole('button', { name: 'Progress' })).toBeVisible();
  for (const [heading, labels] of Object.entries(GROUPS)) {
    const group = page.getByRole('region', { name: heading });
    await expect(group.getByRole('heading', { name: heading })).toBeVisible();
    const names = await group.locator('button.tile').evaluateAll((list) => list.map((b) => b.textContent.trim()));
    expect(names).toEqual(labels);
  }
  for (const t of await page.locator('#tiles button.tile').all()) {
    await expect(t.locator('svg')).toBeVisible();
    await expect(t.locator('.tile-label')).toBeVisible();
    const box = await t.boundingBox();
    expect(Math.abs(box.width - box.height)).toBeLessThan(2);
    expect(box.width).toBeGreaterThanOrEqual(44);
  }
  const yours = page.getByRole('button', { name: 'Your library' });
  await yours.click();
  await expect(yours).toHaveAttribute('aria-expanded', 'true');
  const panel = page.locator('#tile-panel');
  await expect(panel).toBeVisible();
  await expect(page.locator('#tile-title')).toHaveText('Your library');
  await expect(page.locator('#tile-title')).toBeFocused();
  await expect(panel.getByRole('link', { name: 'Open your library' })).toHaveAttribute('href', '/texts');
  await expect(panel.getByRole('link', { name: 'Add a text' })).toHaveAttribute('href', '/add');
  await expect(panel.getByRole('link', { name: 'Your dictionary' })).toHaveAttribute('href', '/dictionary');
  await expect(panel.getByRole('link', { name: 'Your leaves' })).toHaveAttribute('href', '/leaves');
  // Below the opened tile's row: the panel's top is under every tile of that row.
  const [tBox, pBox] = [await yours.boundingBox(), await panel.boundingBox()];
  expect(pBox.y).toBeGreaterThan(tBox.y + tBox.height - 1);
  await page.keyboard.press('Escape');
  await expect(panel).toBeHidden();
  await expect(yours).toBeFocused();
  const common = page.getByRole('button', { name: 'Common library' });
  await common.click();
  await expect(panel.getByRole('link', { name: 'Open the common library' })).toHaveAttribute('href', '/library');
  await page.getByRole('button', { name: 'Discover', exact: true }).click();
  await expect(page.locator('#tile-title')).toHaveText('Discover');
  await expect(common).toHaveAttribute('aria-expanded', 'false');
  await page.getByRole('button', { name: 'Discover', exact: true }).click();
  await expect(panel).toBeHidden();
  const progress = page.getByRole('button', { name: 'Progress' });
  await progress.click();
  await panel.getByRole('button', { name: 'Close' }).click();
  await expect(panel).toBeHidden();
  await expect(progress).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('FR-901 FR-903 FR-904 RQ-440 RQ-442: Mix → Start is a 10-minute Mix; Options… offers the skills and 5, 10, 20, 30 minutes; while a session is going a Resume bar above the tiles opens it', async ({ page }) => {
  await signIn(page);
  await page.getByRole('button', { name: 'Mix', exact: true }).click();
  const panel = page.locator('#tile-panel');
  await panel.getByRole('button', { name: 'Options…' }).click();
  for (const skill of ['Mix', 'Reading', 'Listening', 'Words', 'Grammar']) await expect(panel.getByRole('radio', { name: skill, exact: true })).toBeVisible();
  for (const m of [5, 10, 20, 30]) await expect(panel.getByRole('radio', { name: `${m} min` })).toBeVisible();
  await expect(panel.getByRole('radio', { name: 'Mix', exact: true })).toHaveAttribute('aria-checked', 'true');
  await expect(panel.getByRole('radio', { name: '10 min' })).toHaveAttribute('aria-checked', 'true');
  await expect(panel.getByLabel('Harder questions only')).toHaveCount(0);
  await panel.getByRole('button', { name: 'Start', exact: true }).first().click();
  await goOnIfShort(page);
  await expect(page.locator('#session-line')).toContainText('10-minute Mix');
  await page.goto('/');
  const resume = page.locator('.resume-bar');
  await expect(resume).toContainText('Resume: 10-minute Mix');
  const [rBox, tBox] = [await resume.boundingBox(), await page.getByRole('button', { name: 'Discover', exact: true }).boundingBox()];
  expect(rBox.y).toBeLessThan(tBox.y);
  await resume.click();
  await page.waitForURL(/\/session$/);
  await expect(page.locator('#session-line')).toContainText('10-minute Mix');
});

test('FR-903 FR-905 RQ-440 RQ-441: Review\'s Options… add Harder questions only; the chosen options start that session and are shown again next time', async ({ page }) => {
  await signIn(page);
  await page.getByRole('button', { name: 'Review', exact: true }).click();
  const panel = page.locator('#tile-panel');
  await panel.getByRole('button', { name: 'Options…' }).click();
  await expect(panel.getByLabel('Harder questions only')).not.toBeChecked();
  await panel.getByRole('radio', { name: 'Reading', exact: true }).click();
  await panel.getByRole('radio', { name: '5 min' }).click();
  await panel.locator('.session-options').getByRole('button', { name: 'Start' }).click();
  await goOnIfShort(page);
  await expect(page.locator('#session-line')).toContainText('5-minute Review');
  await page.goto('/');
  await page.getByRole('button', { name: 'Review', exact: true }).click();
  await panel.getByRole('button', { name: 'Options…' }).click();
  await expect(panel.getByRole('radio', { name: 'Reading', exact: true })).toHaveAttribute('aria-checked', 'true');
  await expect(panel.getByRole('radio', { name: '5 min' })).toHaveAttribute('aria-checked', 'true');
});

test('FR-902 RQ-420: the top bar has the logo linking Home and ☰ with Account, Settings, Help and Sign out; Help shows How grove works in a bubble with Replay', async ({ page }) => {
  await signIn(page);
  await page.goto('/progress');
  const bar = page.locator('.topbar');
  await expect(bar.locator('a.brand')).toHaveAttribute('href', '/');
  await expect(bar.locator('.account-email')).toHaveCount(0);
  await expect(bar.locator('.help-link')).toHaveCount(0);
  const menuButton = bar.getByRole('button', { name: 'Menu' });
  const mb = await menuButton.boundingBox();
  expect(mb.width).toBeGreaterThanOrEqual(44);
  expect(mb.height).toBeGreaterThanOrEqual(44);
  await menuButton.click();
  const menu = page.locator('#site-menu');
  await expect(menu.locator('.menu-item')).toHaveText(['Account', 'Settings', 'Help', 'Sign out']);
  await expect(menu.getByRole('link', { name: 'Account' })).toHaveAttribute('href', '/profile');
  await expect(menu.getByRole('link', { name: 'Settings' })).toHaveAttribute('href', '/settings');
  await menu.getByRole('button', { name: 'Help' }).click();
  const help = page.getByRole('dialog', { name: 'How grove works' });
  await expect(help).toBeVisible();
  await expect(help.getByRole('heading', { name: 'How grove works' })).toBeVisible();
  await expect(help.getByRole('button', { name: 'Replay' })).toBeVisible();
  await help.getByRole('button', { name: 'Close' }).click();
  await expect(help).toHaveCount(0);
  await menuButton.click();
  await menu.getByRole('button', { name: 'Help' }).click();
  await page.mouse.click(5, (page.viewportSize().height) - 5);
  await expect(page.getByRole('dialog', { name: 'How grove works' })).toHaveCount(0);
  await menuButton.click();
  await menu.getByRole('button', { name: 'Sign out' }).click();
  await page.waitForURL(/\/signin$/);
});

test('FR-916 RQ-431 RQ-438 RQ-445: the Common library lists grove texts by topic with level, kind and minutes, filtered up to the chosen level (the learner\'s first); + Add adds one without leaving the list, a grove text in Your library, never Beta; a title opens the full text', async ({ page }) => {
  await signIn(page);
  await page.getByRole('button', { name: 'Common library' }).click();
  await page.locator('#tile-panel').getByRole('link', { name: 'Open the common library' }).click();
  await page.waitForURL(/\/library$/);
  const level = await page.evaluate(async () => (await (await fetch('/api/library')).json()).level);
  await expect(page.getByLabel('Show levels up to')).toHaveValue(level);
  const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const shown = async () => page.locator('#library-texts .level-badge').allTextContents();
  await page.getByLabel('Show levels up to').selectOption('A1');
  expect(new Set(await shown())).toEqual(new Set(['A1']));
  await page.getByLabel('Show levels up to').selectOption('B1');
  const upToB1 = await shown();
  expect(upToB1.every((l) => levels.indexOf(l) <= 2)).toBe(true);
  expect(new Set(upToB1)).toEqual(new Set(['A1', 'A2', 'B1']));
  await expect(page.locator('#library-texts .topic-group h3').first()).not.toBeEmpty();
  await expect(page.locator('#library-texts .library-item .text-state').first()).toHaveText(/(reading|listening) · \d+ min$/);
  const item = page.locator('#library-texts .library-item', { has: page.getByRole('button', { name: /^Add .* to your library$/ }) }).first();
  const title = (await item.locator('.text-title').textContent()).trim();
  const preview = await item.locator('a.text-title').getAttribute('href');
  expect(preview).toMatch(/^\/library\/text\?id=/);
  await item.getByRole('button', { name: /to your library$/ }).click();
  await expect(page.locator('#library-status')).toContainText(title);
  await expect(page).toHaveURL(/\/library$/);
  const row = page.locator('#library-texts .library-item', { hasText: title }).first();
  await expect(row.locator('.added')).toHaveText('Added ✓');
  await expect(row.locator('a.text-title')).toHaveAttribute('href', /^\/text\?id=\d+$/);
  const other = page.locator('#library-texts .library-item', { has: page.getByRole('button', { name: /^Add .* to your library$/ }) }).first();
  const otherTitle = (await other.locator('.text-title').textContent()).trim();
  await other.locator('a.text-title').click();
  await page.waitForURL(/\/library\/text\?id=/);
  await expect(page.getByRole('heading', { name: otherTitle })).toBeVisible();
  await expect(page.locator('.way-back a')).toHaveText('‹ Common library');
  await expect(page.getByRole('button', { name: '+ Add to your library' })).toBeVisible();
  await page.goto('/texts');
  const mine = page.locator('#texts a', { hasText: title }).first();
  await expect(mine.locator('.grove-mark')).toHaveText('grove text');
  await expect(mine.locator('.beta')).toHaveCount(0);
  await mine.click();
  await expect(page.locator('#beta')).toBeHidden();
});

test('FR-917 FR-926 RQ-432 RQ-449: the common dictionary searches grove\'s whole word list as you type, with meanings and levels; Pick up makes a word a leaf, Let it fall asks its meaning, and a wrong answer offers Let it fall anyway', async ({ page }) => {
  await signIn(page);
  await page.goto('/library');
  await page.getByLabel('Search').fill('p');
  await expect(page.locator('#lexicon-results li')).toHaveCount(0);
  const word = 'pingvin';
  await page.getByLabel('Search').fill(word);
  const item = page.locator('#lexicon-results li', { has: page.locator('.text-title', { hasText: new RegExp(`^${word}$`) }) });
  await expect(item).toBeVisible();
  await expect(item.locator('.lexicon-en')).not.toBeEmpty();
  const pick = item.getByRole('button', { name: `Pick up ${word}` });
  if (await pick.isVisible()) {
    await pick.click();
    await expect(item.locator('.text-state')).toHaveText('leaf');
    await expect(page.locator('.toast')).toContainText(word);
  }
  await item.getByRole('button', { name: `Let ${word} fall` }).click();
  const sheet = page.getByRole('dialog', { name: `Let ${word} fall` });
  await expect(sheet).toBeVisible();
  const options = sheet.locator('button.option');
  if (await options.count()) {
    const right = await page.evaluate(async (w) => (await (await fetch(`/api/fall-check?lemma=${w}&kind=word`)).json()).question.right, word);
    await options.nth(right === 0 ? 1 : 0).click();
    await expect(sheet).toContainText('Not quite');
    await sheet.getByRole('button', { name: 'Let it fall anyway' }).click();
  } else {
    await sheet.getByRole('button', { name: 'Yes, let it fall' }).click();
  }
  await expect(sheet).toHaveCount(0);
  await expect(item.locator('.text-state')).toHaveText('ground');
  await expect(page.locator('.toast')).toContainText('fell to your ground');
});

test('FR-920 FR-923 SC-006 RQ-444 RQ-445 B-20 B-23: a Reading session short of new texts offers Add a text or Practise without; the library then lists only reading texts with a Reading bar that fills as texts are added, ‹ Back to your session at the top, and ▶ Start your session when full', async ({ page }) => {
  const t = await startTestGrove({ host: 'localhost' });
  try {
    const learner = t.seedAccount({ email: 'no-texts@example.test' });
    t.grove.db.prepare('INSERT OR IGNORE INTO learner_settings (account_id) VALUES (?)').run(learner.id);
    t.grove.db.prepare('UPDATE learner_settings SET start_done = 1, welcome_dismissed = 1 WHERE account_id = ?').run(learner.id);
    await page.goto(`${t.base}/signin`);
    await page.getByLabel('Email').fill('no-texts@example.test');
    await page.getByLabel('Password').fill(PASSWORD);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.waitForURL(/\/terms$/);
    await agreeTerms(page);
    await page.waitForURL(`${t.base}/`);
    await page.getByRole('button', { name: 'Discover', exact: true }).click();
    const panel = page.locator('#tile-panel');
    await panel.getByRole('button', { name: 'Options…' }).click();
    await panel.getByRole('radio', { name: 'Reading', exact: true }).click();
    await panel.getByRole('radio', { name: '5 min' }).click();
    await panel.locator('.session-options').getByRole('button', { name: 'Start' }).click();
    await page.waitForURL(/\/session$/);
    // B-20: two choices.
    await expect(page.locator('#offer-line')).toContainText('min of reading');
    await expect(page.locator('#offer-line')).not.toContainText('listening');
    await expect(page.locator('#offer-choices').locator('a, button')).toHaveText(['Add a text', 'Practise without']);
    await page.getByRole('link', { name: 'Add a text' }).click();
    await page.waitForURL(/\/add\?from=session$/);
    await expect(page.locator('.way-back a')).toHaveText('‹ Back to your session');
    await expect(page.locator('.fill-bar')).toHaveCount(1);
    await expect(page.locator('.fill-bar .fill-name')).toHaveText('Reading');
    await page.getByRole('link', { name: 'Choose from the common library' }).click();
    await page.waitForURL(/\/library\?from=session$/);
    // B-23: only reading texts, and no way to show the others.
    await expect(page.locator('#library-kinds')).toContainText('reading');
    const kinds = await page.locator('#library-texts .library-item .text-state').allTextContents();
    expect(kinds.length).toBeGreaterThan(0);
    expect(kinds.every((k) => k.includes('reading'))).toBe(true);
    await expect(page.getByRole('button', { name: /Show all/ })).toHaveCount(0);
    // Open one in full: the bars stay; ‹ Back to your session still leads back.
    await page.locator('#library-texts a.text-title').first().click();
    await page.waitForURL(/\/library\/text\?id=.*from=session/);
    await expect(page.locator('.fill-bar')).toHaveCount(1);
    await page.getByRole('button', { name: '+ Add to your library' }).click();
    await expect(page.locator('#lt-added')).toBeVisible();
    await page.goBack();
    for (let i = 0; i < 12 && !(await page.getByRole('button', { name: '▶ Start your session' }).isVisible()); i += 1) {
      const adds = page.locator('#library-texts .library-item').getByRole('button', { name: /^Add .* to your library$/ });
      const before = await adds.count();
      await adds.first().click();
      await expect(adds.and(page.locator(':not([disabled])'))).toHaveCount(before - 1).catch(() => {});
      await expect(page.locator('#library-status')).toContainText('is in your library');
    }
    await page.getByRole('button', { name: '▶ Start your session' }).click();
    await page.waitForURL(/\/session$/);
    await expect(page.locator('#exercise')).toBeVisible();
    await expect(page.locator('#session-line')).toContainText('5-minute Discover');
    // The offer is answered: the way back is gone.
    await page.goto(`${t.base}/library?from=session`);
    await expect(page.locator('.way-back a')).toHaveText('‹ Home');
    await expect(page.locator('.fill-bars')).toHaveCount(0);
  } finally {
    await t.close();
  }
});

test('FR-922 RQ-446: every signed-in page but Home names the page it belongs under at the top and goes there; the phone\'s Back closes the menu first', async ({ page }) => {
  await signIn(page);
  const map = { '/session': 'Home', '/texts': 'Home', '/library': 'Home', '/progress': 'Home', '/settings': 'Home', '/profile': 'Home', '/add': 'Your library', '/dictionary': 'Your library', '/leaves': 'Your library', '/add/ai': 'Add a text', '/own': 'Add a text' };
  const hrefs = { Home: '/', 'Your library': '/texts', 'Add a text': '/add' };
  for (const [path, parent] of Object.entries(map)) {
    await page.goto(path);
    const back = page.locator('.way-back a');
    await expect(back, path).toHaveText(`‹ ${parent}`);
    await expect(back, path).toHaveAttribute('href', hrefs[parent]);
  }
  await page.goto('/');
  await expect(page.locator('.way-back')).toHaveCount(0);
  await page.goto('/progress');
  await page.goto('/texts');
  await page.getByRole('button', { name: 'Menu' }).click();
  await expect(page.locator('#site-menu')).toBeVisible();
  await page.goBack();
  await expect(page.locator('#site-menu')).toBeHidden();
  await expect(page).toHaveURL(/\/texts$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/progress$/);
});

test('FR-905 RQ-441 B-30: a Review with nothing to practise says so and offers Go to Discover and Add a text', async ({ page }) => {
  const t = await startTestGrove({ host: 'localhost' });
  try {
    const learner = t.seedAccount({ email: 'nothing@example.test' });
    t.grove.db.prepare('INSERT OR IGNORE INTO learner_settings (account_id) VALUES (?)').run(learner.id);
    t.grove.db.prepare('UPDATE learner_settings SET start_done = 1, welcome_dismissed = 1 WHERE account_id = ?').run(learner.id);
    await page.goto(`${t.base}/signin`);
    await page.getByLabel('Email').fill('nothing@example.test');
    await page.getByLabel('Password').fill(PASSWORD);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.waitForURL(/\/terms$/);
    await agreeTerms(page);
    await page.waitForURL(`${t.base}/`);
    await page.getByRole('button', { name: 'Review', exact: true }).click();
    await page.locator('#tile-panel').getByRole('button', { name: 'Start', exact: true }).click();
    const offer = page.getByRole('group', { name: 'Nothing to review' });
    await expect(offer).toContainText('nothing to practise');
    await expect(offer.getByRole('link', { name: 'Add a text' })).toHaveAttribute('href', '/add');
    await offer.getByRole('button', { name: 'Go to Discover' }).click();
    await expect(page.locator('#tile-title')).toHaveText('Discover');
  } finally {
    await t.close();
  }
});

