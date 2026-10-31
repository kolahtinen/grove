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
  await expect(fill.or(page.locator('#offer:visible, #start-card:visible, #exercise:visible'))).toBeVisible();
  if (await fill.isVisible()) await fill.click();
  await page.waitForURL(/\/session$/);
  const without = page.getByRole('button', { name: 'Practise without' });
  await expect(without.or(page.locator('#start-card:visible, #exercise:visible'))).toBeVisible();
  if (await without.isVisible()) await without.click();
  await expect(page.locator('#start-card:visible, #exercise:visible')).toBeVisible();
}

// G-09 FR-901 (RQ-463, the picked sketch's version C): three bands of rows.
const BANDS = { Learn: ['Discover', 'Review', 'Mix'], 'Your texts': ['Your library', 'Common library'], 'How you’re doing': ['Progress'] };

test('FR-901 RQ-463 RQ-419: Home is three bands, each with a heading and a line, every tile a row with its name, a line and a live count; a Learn row opens below itself (Esc, ✕ or the row again close it, focus back on the row); Your library, Common library and Progress open their pages; side by side on a computer', async ({ page }, info) => {
  await signIn(page);
  for (const [heading, names] of Object.entries(BANDS)) {
    const band = page.getByRole('region', { name: heading });
    await expect(band.getByRole('heading', { name: heading })).toBeVisible();
    await expect(band.locator('.band-head p')).not.toBeEmpty();
    const rows = await band.locator('.row-tile .nm').allTextContents();
    expect(rows).toEqual(names);
  }
  await expect(page.locator('.band-head p')).toHaveText(['Practise for a few minutes. grove plans it.', 'What you read and listen to.', 'Your level and your week.']);
  const o = await page.evaluate(async () => (await fetch('/api/overview')).json());
  await expect(page.locator('#tile-discover-count')).toHaveText(o.brandNew ? 'Start here' : `${o.newTexts} new`);
  await expect(page.locator('#tile-review-count')).toHaveText(o.leaves ? `${o.due} due` : 'none yet');
  await expect(page.locator('#tile-yours-count')).toHaveText(`${o.yourTexts} text${o.yourTexts === 1 ? '' : 's'}`);
  await expect(page.locator('#tile-common-count')).toHaveText(`${o.commonTexts} texts`);
  await expect(page.locator('#tile-progress-line')).toContainText('min today');
  await expect(page.locator('#tile-progress .mini-week i')).toHaveCount(7);
  for (const row of await page.locator('.row-tile').all()) expect((await row.boundingBox()).height).toBeGreaterThanOrEqual(44);
  await expect(page.getByRole('link', { name: 'Your library' })).toHaveAttribute('href', '/texts');
  await expect(page.getByRole('link', { name: 'Common library' })).toHaveAttribute('href', '/library');
  await expect(page.getByRole('link', { name: 'Progress' })).toHaveAttribute('href', '/progress');
  const discover = page.getByRole('button', { name: 'Discover', exact: true });
  await discover.click();
  await expect(discover).toHaveAttribute('aria-expanded', 'true');
  const panel = page.locator('#tile-panel');
  await expect(page.locator('#tile-title')).toHaveText('Discover');
  await expect(page.locator('#tile-title')).toBeFocused();
  await expect(panel.getByRole('button', { name: /^Start/ })).toBeVisible();
  await expect(panel.getByRole('link', { name: 'Options…' })).toHaveAttribute('href', '/options?tile=discover');
  const [rBox, pBox] = [await discover.boundingBox(), await panel.boundingBox()];
  expect(pBox.y).toBeGreaterThan(rBox.y + rBox.height - 1);
  await page.keyboard.press('Escape');
  await expect(panel).toBeHidden();
  await expect(discover).toBeFocused();
  const review = page.getByRole('button', { name: 'Review', exact: true });
  await review.click();
  await page.getByRole('button', { name: 'Mix', exact: true }).click();
  await expect(page.locator('#tile-title')).toHaveText('Mix');
  await expect(review).toHaveAttribute('aria-expanded', 'false');
  await page.getByRole('button', { name: 'Mix', exact: true }).click();
  await expect(panel).toBeHidden();
  await review.click();
  await panel.getByRole('button', { name: 'Close' }).click();
  await expect(panel).toBeHidden();
  await expect(review).toBeFocused();
  await page.getByRole('link', { name: 'Progress' }).click();
  await page.waitForURL(/\/progress$/);
  await page.goto('/');
  await expect(page.locator('.band')).toHaveCount(3);
  const tops = await page.locator('.band').evaluateAll((list) => list.map((b) => Math.round(b.getBoundingClientRect().top)));
  if (info.project.name === 'desktop') expect(new Set(tops).size).toBe(1);
  else expect(tops[0]).toBeLessThan(tops[1]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('FR-901 FR-903 FR-904 RQ-440 RQ-442 RQ-450 RQ-463: Mix → Start is a 10-minute Mix of all skills; Options… opens its own page with ‹ Home, skill chips and 5 · 10 · 20 · 30; while a session is going a Resume bar at the very top of Home opens it', async ({ page }) => {
  await signIn(page);
  await page.getByRole('button', { name: 'Mix', exact: true }).click();
  const panel = page.locator('#tile-panel');
  await expect(panel.getByRole('button', { name: /^Start/ })).toHaveText('Start · 10 min, all skills');
  await panel.getByRole('link', { name: 'Options…' }).click();
  await page.waitForURL(/\/options\?tile=mix$/);
  await expect(page.getByRole('heading', { name: 'Mix options' })).toBeVisible();
  await expect(page.locator('.way-back a')).toHaveText('‹ Home');
  await expect(page.locator('.way-back a')).toHaveAttribute('href', '/');
  await expect(page.getByRole('link', { name: 'Close' })).toHaveAttribute('href', '/');
  for (const skill of ['Reading', 'Listening', 'Words', 'Grammar']) await expect(page.getByRole('button', { name: skill, exact: true })).toHaveAttribute('aria-pressed', 'false');
  for (const m of [5, 10, 20, 30]) await expect(page.getByRole('radio', { name: `${m} minutes` })).toBeVisible();
  await expect(page.getByRole('radio', { name: '10 minutes' })).toHaveAttribute('aria-checked', 'true');
  await expect(page.getByRole('switch', { name: 'Harder questions only' })).toBeHidden();
  await expect(page.locator('#plan-line')).toHaveText('Your 10 minutes · All skills, in turns');
  await expect(page.locator('#plan-legend li')).toHaveText(['≈4 min review', '≈1½ min reading', '≈1½ min listening', '≈1½ min words', '≈1½ min grammar']);
  await expect(page.locator('#plan-bar span')).toHaveCount(5);
  await page.getByRole('link', { name: '‹ Home' }).click();
  await page.waitForURL(/\/$/);
  await page.getByRole('button', { name: 'Mix', exact: true }).click();
  await panel.getByRole('button', { name: /^Start/ }).click();
  await goOnIfShort(page);
  await expect(page.locator('#start-card h2')).toHaveText('10-minute Mix');
  await page.locator('#session-start').click();
  await page.goto('/');
  const resume = page.locator('.resume-bar');
  await expect(resume).toContainText('Resume: 10-minute Mix');
  const [rBox, tBox] = [await resume.boundingBox(), await page.locator('.band').first().boundingBox()];
  expect(rBox.y).toBeLessThan(tBox.y);
  expect(await page.locator('main > *:not([hidden])').first().getAttribute('id')).toBe('resume-slot');
  await resume.click();
  await page.waitForURL(/\/session$/);
  await expect(page.locator('#session-top')).toBeVisible();
});

test('FR-903 FR-905 RQ-440 RQ-441 RQ-450 RQ-451: on the Options page skills are ticked in any number and the bar splits the time; Review adds Harder questions only; the chosen options start that session and are named next time', async ({ page }) => {
  await signIn(page);
  await page.goto('/options?tile=discover');
  await page.getByRole('button', { name: 'Reading', exact: true }).click();
  await page.getByRole('button', { name: 'Grammar', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Reading', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: 'Grammar', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('radio', { name: '20 minutes' }).click();
  await expect(page.locator('#plan-line')).toHaveText('Your 20 minutes · Reading + Grammar, in turns');
  await expect(page.locator('#plan-legend li')).toHaveText(['≈10 min reading', '≈10 min grammar']);
  await expect(page.getByRole('button', { name: 'Start · 20 min' })).toBeVisible();
  await page.getByRole('button', { name: 'Reading', exact: true }).click();
  await expect(page.locator('#plan-line')).toHaveText('Your 20 minutes · Grammar');
  await page.goto('/options?tile=review');
  await expect(page.getByRole('heading', { name: 'Review options' })).toBeVisible();
  const hard = page.getByRole('switch', { name: 'Harder questions only' });
  await expect(hard).toHaveAttribute('aria-checked', 'false');
  await page.getByRole('button', { name: 'Reading', exact: true }).click();
  await page.getByRole('radio', { name: '5 minutes' }).click();
  await expect(page.locator('#plan-legend li')).toHaveText(['≈5 min review (reading)']);
  // FR-903 (question-pages/93): with Harder questions only the chips are greyed and the bar is one part.
  await hard.click();
  await expect(page.locator('#plan-bar span')).toHaveCount(1);
  await expect(page.locator('#plan-legend li')).toHaveText(['≈5 min harder questions']);
  await expect(page.getByRole('button', { name: 'Reading', exact: true })).toBeDisabled();
  await hard.click();
  await expect(page.getByRole('button', { name: 'Reading', exact: true })).toBeEnabled();
  await page.getByRole('button', { name: 'Start · 5 min' }).click();
  await goOnIfShort(page);
  await expect(page.locator('#start-card h2, #exercise').first()).toBeVisible();
  expect(await page.evaluate(async () => (await (await fetch('/api/session')).json()).session.label)).toBe('5-minute Review');
  await page.goto('/');
  await page.getByRole('button', { name: 'Review', exact: true }).click();
  await expect(page.locator('#tile-panel')).toContainText('Last time in Options: Reading · 5 min');
  await page.locator('#tile-panel').getByRole('link', { name: 'Options…' }).click();
  await expect(page.getByRole('button', { name: 'Reading', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('radio', { name: '5 minutes' })).toHaveAttribute('aria-checked', 'true');
  await page.keyboard.press('Escape');
  await page.waitForURL(/\/$/);
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

test('FR-916 RQ-431 RQ-438 RQ-445 RQ-460: the Common library lists grove texts by topic with level, kind and minutes, filtered up to the chosen level (the learner\'s first, said in a line); + Add adds one without leaving the list and says so with Read now; a title opens a preview sheet over the list; a grove text in Your library is never Beta', async ({ page }) => {
  await signIn(page);
  await page.getByRole('link', { name: 'Common library' }).click();
  await page.waitForURL(/\/library$/);
  const level = await page.evaluate(async () => (await (await fetch('/api/library')).json()).level);
  await expect(page.getByLabel('Show levels up to')).toHaveValue(level);
  await expect(page.locator('#level-line')).toHaveText(`Your level is ${level}, so texts up to ${level} show first.`);
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
  await item.getByRole('button', { name: /to your library$/ }).click();
  await expect(page.locator('#library-status')).toContainText(title);
  await expect(page).toHaveURL(/\/library$/);
  const row = page.locator('#library-texts .library-item', { hasText: title }).first();
  await expect(row.locator('.added')).toHaveText('Added ✓');
  await expect(row.locator('.added-line')).toContainText('Added to your library.');
  await expect(row.getByRole('link', { name: 'Read now' })).toHaveAttribute('href', /^\/text\?id=\d+$/);
  // The preview sheet (B-16): title, level, topic, kind, minutes, the first lines, + Add and Read now.
  const other = page.locator('#library-texts .library-item', { has: page.getByRole('button', { name: /^Add .* to your library$/ }) }).first();
  const otherTitle = (await other.locator('.text-title').textContent()).trim();
  const scroll = await page.evaluate(() => window.scrollY);
  await other.locator('.text-title').click();
  const sheet = page.getByRole('dialog', { name: otherTitle });
  await expect(sheet).toBeVisible();
  await expect(page).toHaveURL(/\/library$/);
  await expect(sheet.locator('.pv-facts')).toHaveText(/^(A1|A2|B1|B2|C1|C2) · (reading|listening) · about \d+ min$/);
  await expect(sheet.locator('.first-lines')).not.toHaveText('…');
  await expect(sheet.getByRole('button', { name: '+ Add to your library' })).toBeVisible();
  await expect(sheet.getByRole('link', { name: 'Read now' })).toHaveAttribute('href', /^\/library\/text\?id=/);
  await page.keyboard.press('Escape');
  await expect(sheet).toHaveCount(0);
  expect(await page.evaluate(() => window.scrollY)).toBe(scroll);
  await other.locator('.text-title').click();
  await page.getByRole('dialog', { name: otherTitle }).getByRole('button', { name: '+ Add to your library' }).click();
  await expect(page.getByRole('dialog', { name: otherTitle }).locator('.text-state.added')).toHaveText('Added ✓');
  await page.getByRole('dialog', { name: otherTitle }).getByRole('button', { name: 'Close' }).click();
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
    await panel.getByRole('link', { name: 'Options…' }).click();
    await page.getByRole('button', { name: 'Reading', exact: true }).click();
    await page.getByRole('radio', { name: '5 minutes' }).click();
    await page.getByRole('button', { name: 'Start · 5 min' }).click();
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
    await page.getByRole('link', { name: /From the common library/ }).click();
    await page.waitForURL(/\/library\?from=session$/);
    // B-23: only reading texts, and no way to show the others.
    await expect(page.locator('#library-kinds')).toContainText('reading');
    const kinds = await page.locator('#library-texts .library-item .text-state').allTextContents();
    expect(kinds.length).toBeGreaterThan(0);
    expect(kinds.every((k) => k.includes('reading'))).toBe(true);
    await expect(page.getByRole('button', { name: /Show all/ })).toHaveCount(0);
    // Open one in full (the preview's Read now): the bars stay; ‹ Back to your session still leads back.
    await page.locator('#library-texts .text-title').first().click();
    await page.getByRole('dialog').getByRole('link', { name: 'Read now' }).click();
    await page.waitForURL(/\/library\/text\?id=.*from=session/);
    await expect(page.locator('.fill-bar')).toHaveCount(1);
    await page.getByRole('button', { name: '+ Add to your library' }).click();
    await expect(page.locator('#lt-added')).toBeVisible();
    await page.goBack();
    for (let i = 0; i < 12 && !(await page.getByRole('button', { name: '▶ Start your session' }).isVisible()); i += 1) {
      const adds = page.locator('#library-texts .library-item').getByRole('button', { name: /^Add .* to your library$/ });
      // Wait for the list (after an add it is drawn again, once the session's bars are read).
      const ready = adds.and(page.locator(':not([disabled])')).first();
      await expect(ready.or(page.getByRole('button', { name: '▶ Start your session' }))).toBeVisible();
      if (await page.getByRole('button', { name: '▶ Start your session' }).isVisible()) break;
      const before = await adds.count();
      // The list is drawn again once the text is added: wait for that before looking again.
      const clicked = await ready.elementHandle();
      await clicked.click();
      await clicked.waitForElementState('hidden').catch(() => {});
      await expect(adds.and(page.locator(':not([disabled])'))).toHaveCount(before - 1).catch(() => {});
      await expect(page.locator('#library-status')).toContainText('is in your library');
    }
    await page.getByRole('button', { name: '▶ Start your session' }).click();
    await page.waitForURL(/\/session$/);
    await expect(page.locator('#start-card')).toBeVisible();
    await expect(page.locator('#start-card h2')).toHaveText('5-minute Discover');
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
  const map = { '/options?tile=discover': 'Home', '/library?from=add': 'Add a text', '/texts': 'Home', '/library': 'Home', '/progress': 'Home', '/settings': 'Home', '/profile': 'Home', '/add': 'Your library', '/dictionary': 'Your library', '/leaves': 'Your library', '/add/ai': 'Add a text', '/own': 'Add a text' };
  const hrefs = { Home: '/', 'Your library': '/texts', 'Add a text': '/add' };
  for (const [path, parent] of Object.entries(map)) {
    await page.goto(path);
    const back = page.locator('.way-back a');
    await expect(back, path).toHaveText(`‹ ${parent}`);
    await expect(back, path).toHaveAttribute('href', hrefs[parent]);
  }
  // G-09 FR-932: on the session page the top bar (and its link) gives way to the session bar, whose ✕ leads Home.
  await page.goto('/session');
  await expect(page.locator('#session-leave:visible, .way-back a:visible').first()).toBeVisible();
  if (await page.locator('#session-leave').isVisible()) await expect(page.locator('.way-back a')).toBeHidden();
  else await expect(page.locator('.way-back a')).toHaveText('‹ Home');
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
    await page.locator('#tile-panel').getByRole('button', { name: /^Start/ }).click();
    const offer = page.getByRole('group', { name: 'Nothing to review' });
    await expect(offer).toContainText('nothing to practise');
    await expect(offer.getByRole('link', { name: 'Add a text' })).toHaveAttribute('href', '/add');
    await offer.getByRole('button', { name: 'Go to Discover' }).click();
    await expect(page.locator('#tile-title')).toHaveText('Discover');
  } finally {
    await t.close();
  }
});

