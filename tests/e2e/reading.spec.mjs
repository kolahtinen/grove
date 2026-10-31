import { test, expect } from '@playwright/test';
import { agreeTerms } from './helpers.mjs';
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
  await agreeTerms(page);
  await page.waitForURL(/\/$/);
}

// Adds the sample answer (with patterns) through the API from the page, with unique titles; returns its text ids by title.
async function addSample(page) {
  const tag = Math.random().toString(36).slice(2, 7);
  return page.evaluate(async ({ sample, tag }) => {
    const me = await (await fetch('/api/me')).json();
    const h = { 'content-type': 'application/json', 'x-csrf-token': me.csrf };
    // A new package gives a fresh part: \"next\" may give a waiting redo since G-02 FR-206 changed (2026-10-26).
    const p = await fetch('/api/prompt', { method: 'POST', headers: h, body: JSON.stringify({ action: 'new_package' }) });
    const prompt = await p.json();
    const answer = JSON.parse(sample.replaceAll('TEST-1', prompt.code));
    answer.texts.forEach((x) => { x.title = `${x.title} ${tag}`; });
    const r = await (await fetch('/api/answer', { method: 'POST', headers: h, body: JSON.stringify({ exchangeId: prompt.exchangeId, answer: JSON.stringify(answer) }) })).json();
    return Object.fromEntries(r.texts.map((x) => [x.title.replace(` ${tag}`, ''), x.id]));
  }, { sample: SAMPLE, tag });
}

test('FR-305 FR-301 FR-304 RQ-18 RQ-10 RQ-411: no English under the lines but one Show translation; a tap always speaks the word and opens its menu fast; ▶ in the menu says it again', async ({ page }) => {
  await signIn(page);
  const ids = await addSample(page);
  await page.goto(`/text?id=${ids['En bra dag']}`);
  await expect(page.locator('#lines .en')).toHaveCount(0);
  await expect(page.locator('#translation .en').first()).toBeHidden();
  await page.getByRole('button', { name: 'Show translation' }).click();
  await expect(page.locator('#translation .en').first()).toBeVisible();
  await page.getByRole('button', { name: 'Hide translation' }).click();
  await expect(page.locator('#translation .en').first()).toBeHidden();
  await expect(page.locator('#stats')).toContainText('words');
  const word = page.locator('button.w', { hasText: 'kopparna' });
  const started = Date.now();
  await word.click();
  await expect(page.locator('#menu')).toBeVisible();
  expect(Date.now() - started).toBeLessThan(500);
  await expect(page.locator('#menu-lemma')).toHaveText('kopp');
  await expect(page.locator('#menu-meaning')).toHaveText('the cups');
  await expect(page.locator('#menu .menu-state .state-chip')).toHaveText('leaf');
  expect(await page.evaluate(() => window.__spoken)).toContain('kopparna');
  await expect(page.locator('#menu-speak')).toHaveCount(0);
  const said = (await page.evaluate(() => window.__spoken)).filter((w) => w === 'kopparna').length;
  await page.locator('#menu').getByRole('button', { name: 'Say kopparna again' }).click();
  await expect.poll(async () => (await page.evaluate(() => window.__spoken)).filter((w) => w === 'kopparna').length).toBe(said + 1);
});

// G-03 FR-305 as the picked sketch's version A (RQ-456, question-pages/95), G-04 FR-409, FR-411.
async function api(page, path, body) {
  return page.evaluate(async ({ path, body }) => {
    const me = await (await fetch('/api/me')).json();
    const r = await fetch(path, { method: 'POST', headers: { 'content-type': 'application/json', 'x-csrf-token': me.csrf }, body: JSON.stringify(body) });
    return { status: r.status, body: await r.json() };
  }, { path, body });
}

test('FR-305 FR-411 FR-409 RQ-456: a ground word with a pattern in its sentence shows its meaning, its dictionary form, one ↑ Pick up <word> with its line, and the pattern as a folded row with its own Pick up this pattern; no To remember', async ({ page }) => {
  await signIn(page);
  const ids = await addSample(page);
  const lemma = await page.evaluate(async (id) => {
    const r = await (await fetch(`/api/reading?id=${id}`)).json();
    const tok = r.lines.flatMap((l) => l.sentences.flatMap((x) => x.tokens)).find((x) => x.t === 'glömt');
    return tok.lemmas?.[0] || tok.word;
  }, ids['Olles väska']);
  await api(page, '/api/marks', { lemma, remember: false });
  await api(page, '/api/let-it-fall', { lemma, confirmed: true });
  await api(page, '/api/marks', { lemma: 'har + supine', kind: 'pattern', remember: false });
  await page.goto(`/text?id=${ids['Olles väska']}`);
  await page.locator('button.w.pattern', { hasText: /^glömt$/ }).first().click();
  const menu = page.locator('#menu');
  await expect(menu.locator('#menu-meaning')).not.toBeEmpty();
  await expect(menu.locator('.facts-sub', { hasText: 'Dictionary form' })).toContainText(lemma);
  await expect(menu.locator('.menu-state .state-chip')).toHaveText('ground');
  const action = menu.locator('#menu-action button');
  await expect(action).toHaveCount(1);
  await expect(action).toHaveText('Pick up glömt');
  await expect(menu.locator('.act-cap')).toHaveText('It becomes a leaf, due in Review today.');
  await expect(menu.getByRole('button', { name: /To remember/ })).toHaveCount(0);
  const row = menu.locator('#menu-pattern-list .prow', { hasText: 'har + supine' });
  await row.locator('button.phead').click();
  await expect(row.getByRole('button', { name: /Pick up/ })).toHaveText('Pick up this pattern');
  await expect(menu.locator('.quiet').getByRole('button')).toHaveText([/Explain\s*Ask your AI about this word/, /Report sentence\s*Something is wrong in it/]);
});

test('FR-305 FR-315 RQ-456: a name shows "A name — grove never counts it as new.", Report sentence and Not a name? (reported as not a name), with no dictionary form or meaning', async ({ page }) => {
  await signIn(page);
  const ids = await addSample(page);
  await page.goto(`/text?id=${ids['En bra dag']}`);
  await page.locator('button.w.name').first().click();
  const menu = page.locator('#menu');
  await expect(menu).toContainText('A name — grove never counts it as new.');
  await expect(menu.locator('#menu-lemma, #menu-meaning, #menu-action')).toHaveCount(0);
  await expect(menu.getByRole('button', { name: /Report sentence/ })).toBeVisible();
  await menu.getByRole('button', { name: /Not a name\?/ }).click();
  await expect(page.locator('#menu-message')).toHaveText(/^Reported \(R\d+\)/);
});

test('FR-305 RQ-456: Esc, ✕ and a tap outside each close the word menu and give focus back to the word', async ({ page }) => {
  await signIn(page);
  const ids = await addSample(page);
  await page.goto(`/text?id=${ids['En bra dag']}`);
  const word = page.locator('button.w', { hasText: 'kopparna' });
  const menu = page.locator('#menu');
  await word.click();
  await expect(menu).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();
  await expect(word).toBeFocused();
  await word.click();
  await menu.getByRole('button', { name: 'Close' }).click();
  await expect(menu).toBeHidden();
  await word.click();
  await page.mouse.click(5, 120);
  await expect(menu).toBeHidden();
  await expect(word).toBeFocused();
});

test('FR-305 FR-410 FR-927 RQ-456 RQ-449: on a drilled leaf the action is ↓ Let it fall; answered right, the menu stays open, the button turns to ↑ Pick up and a message with Undo shows; Undo puts the leaf back', async ({ page }) => {
  await signIn(page);
  const ids = await addSample(page);
  await api(page, '/api/marks', { lemma: 'kopp', remember: false });
  await api(page, '/api/marks', { lemma: 'kopp', remember: true });
  await page.goto(`/text?id=${ids['En bra dag']}`);
  await page.locator('button.w', { hasText: 'kopparna' }).click();
  const menu = page.locator('#menu');
  await expect(menu.locator('#menu-action button')).toHaveText('Let it fall');
  await expect(menu.locator('.act-cap')).toHaveText('Only if you know it now: grove asks its meaning once.');
  await menu.locator('#menu-action button').click();
  const box = page.locator('#fall-check');
  await expect(box).toBeVisible();
  // The check's choices are shuffled when shown: pick kopp's meaning here by its text.
  await expect(box.locator('button.option, button:has-text("Yes, let it fall")').first()).toBeVisible();
  if (await box.locator('button.option').count()) await box.locator('button.option', { hasText: /^the cups$/ }).click();
  else await box.getByRole('button', { name: 'Yes, let it fall' }).click();
  await expect(menu).toBeVisible();
  await expect(menu.locator('#menu-action button')).toHaveText('Pick up kopparna');
  await expect(page.locator('.toast')).toContainText('kopparna fell to your ground.');
  await page.locator('.toast').getByRole('button', { name: 'Undo' }).click();
  await expect(page.locator('.toast')).toContainText('Undone.');
  await expect(menu.locator('#menu-action button')).toHaveText('Let it fall');
  expect(await page.evaluate(async () => (await (await fetch('/api/leaves')).json()).remember.some((w) => w.lemma === 'kopp'))).toBe(true);
});

test('FR-320 RQ-417: a word never breaks from the punctuation around it, so a name never stands alone before its full stop', async ({ page }) => {
  await signIn(page);
  const ids = await addSample(page);
  await page.goto(`/text?id=${ids['Olles väska']}`);
  const groups = page.locator('#lines .nb');
  await expect(groups.filter({ hasText: /^Olle[.!?]?$/ }).first()).toBeVisible();
  const texts = await groups.allTextContents();
  expect(texts.some((x) => /\p{L}[.,!?…”]+$/u.test(x)), 'a word with its punctuation in one group').toBe(true);
  expect(await groups.first().evaluate((n) => getComputedStyle(n).whiteSpace)).toBe('nowrap');
  // No line of the text starts with punctuation at a phone's width.
  const starts = await page.locator('#lines .sv').evaluateAll((ps) => ps.flatMap((p) => {
    const r = document.createRange();
    const out = [];
    const walker = document.createTreeWalker(p, NodeFilter.SHOW_TEXT);
    let prevTop = null;
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      for (let i = 0; i < n.data.length; i += 1) {
        if (/\s/.test(n.data[i])) continue;
        r.setStart(n, i); r.setEnd(n, i + 1);
        const top = Math.round(r.getBoundingClientRect().top);
        if (prevTop !== null && top > prevTop + 4) out.push(n.data[i]);
        prevTop = top;
      }
    }
    return out;
  }));
  expect(starts.filter((c) => /[.,!?…:;]/.test(c))).toEqual([]);
});

test('FR-321 FR-909 RQ-418 RQ-422 RQ-462: My own texts has its own page, linked from Texts, which suggests it after a finished package', async ({ page }) => {
  await signIn(page);
  // G-09 FR-909: own texts are part of Texts (the top-bar link went with the ☰ menu, FR-902).
  await page.goto('/texts');
  await expect(page.locator('#own-link')).toBeVisible();
  // The shared account's latest package may be open or finished, depending on earlier tests.
  const pkg = await page.evaluate(async () => (await (await fetch('/api/home')).json()).package);
  const finished = !!pkg && pkg.partsAccepted >= pkg.of;
  if (finished) await expect(page.locator('#own-suggest')).toBeVisible(); else await expect(page.locator('#own-suggest')).toBeHidden();
  await page.locator('#own-link').click();
  await page.waitForURL(/\/own$/);
  await expect(page.locator('#own-form')).toBeVisible();
  await page.locator('#own-form input[name="title"]').fill('Listan');
  await page.locator('#own-form textarea[name="text"]').fill('Jag läser en bok.');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await page.waitForURL(/\/own\?id=\d+$/);
  await page.goto('/own');
  const waiting = page.locator('#own-list a', { hasText: 'Listan' }).first();
  await expect(waiting).toContainText('Finish the word check');
  await waiting.click();
  await page.waitForURL(/\/own\?id=\d+$/);
  await expect(page.locator('#own-count')).toHaveText('Step 2 of 3');
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

test('FR-316 FR-317 FR-926 RQ-53 RQ-56 RQ-409 RQ-416 RQ-449: the dictionary has four tabs of 100 entries with More, searches on the server as you type, and each row has its state and one button: Let it fall on a leaf, Pick up on a ground word', async ({ page }) => {
  await signIn(page);
  await addSample(page);
  await page.goto('/dictionary');
  await expect(page.getByRole('tab', { name: /^Words/ })).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#dict-list > li')).toHaveCount(100);
  await expect(page.locator('#count')).toHaveText(/^100 of [\d,]+$/);
  await page.getByRole('button', { name: 'More' }).click();
  await expect(page.locator('#dict-list > li')).toHaveCount(200);

  await page.locator('#search').fill('kopp');
  const kopp = page.locator('#dict-list > li', { has: page.locator('strong', { hasText: /^kopp$/ }) });
  await expect(kopp).toContainText('cup');
  await expect(kopp.locator('.example')).toContainText(/kopp/i);
  await expect(kopp.getByRole('button', { name: 'Let kopp fall' })).toBeVisible();
  await expect(kopp.locator('.text-state')).toHaveText('leaf');
  await page.locator('#search').fill('umbrella');
  await expect(page.locator('#dict-list > li')).toHaveCount(1);
  await expect(page.locator('#count')).toHaveText('1 of 1');

  await page.locator('#search').fill('');
  await page.getByRole('tab', { name: /^Names/ }).click();
  await expect(page.locator('#dict-list')).toContainText('Elsa');
  await expect(page.locator('#dict-list button.flip')).toHaveCount(0);
  await page.getByRole('tab', { name: /^Phrases/ }).click();
  await expect(page.locator('#dict-list')).toContainText('hur mår du');

  await page.getByRole('tab', { name: /^Words/ }).click();
  const ground = page.locator('#dict-list > li', { has: page.locator('.text-state.ground') }).first();
  const lemma = await ground.locator('strong').textContent();
  await ground.getByRole('button', { name: `Pick up ${lemma}` }).click();
  const picked = page.locator('#dict-list > li', { has: page.locator('strong', { hasText: new RegExp(`^${lemma}$`) }) });
  await expect(picked.locator('.text-state')).toHaveText('leaf');
  await expect(picked.getByRole('button', { name: `Let ${lemma} fall` })).toBeVisible();
  // FR-927: the message says what happened, with Undo.
  await expect(page.locator('.toast')).toContainText('is a leaf again: due now in Review.');
  await page.locator('.toast').getByRole('button', { name: 'Undo' }).click();
  await expect(page.locator('.toast')).toContainText('Undone.');
  await expect(picked.locator('.text-state')).toHaveText('ground');
});

test('FR-318 FR-304 RQ-74 RQ-400 RQ-401 RQ-462: an own text goes in three steps on one page: paste and Save, at once the word check (missing words asked again), then ready with its share of known words and the AI\'s copyright view; HTML in it shows as text; a new word is picked up with the AI\'s meaning', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await signIn(page);
  // A made-up word, new on every run (the reviewer account is shared between test runs).
  const newWord = `kanelbulle${Math.random().toString(36).replace(/[^a-z]/g, '').slice(0, 5)}`;
  await page.goto('/own');
  await expect(page.locator('#own-count')).toHaveText('Step 1 of 3');
  await expect(page.locator('#own-paste')).toContainText('Up to 20,000 characters. A news article, a song, a page from a book.');
  await page.locator('#own-form input[name="title"]').fill('<b>Min</b> dag');
  await page.locator('#own-form textarea[name="text"]').fill(`Idag dricker jag kaffe och äter en ${newWord}.\n<i>Det</i> är gott!`);
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await page.waitForURL(/\/own\?id=(\d+)$/);
  const id = Number(new URL(page.url()).searchParams.get('id'));
  // Step 2 at once, on the same page.
  await expect(page.locator('#own-count')).toHaveText('Step 2 of 3');
  await expect(page.locator('#own-check')).toContainText('Your text is saved. Before you read it, your AI gives the meaning of each word you haven\'t met, and says if the text looks copyrighted. This happens once.');
  await expect(page.locator('#own-check-label')).toHaveText('Word check for “<b>Min</b> dag”');
  await expect(page.locator('#own-check-label b')).toHaveCount(0);
  await page.locator('#own-copy').click();
  await expect(page.locator('#own-copied')).toHaveText('Copied to clipboard');
  await expect(page.locator('#own-prompt')).toBeHidden();
  const code = (await page.evaluate(() => navigator.clipboard.readText())).match(/"own": "([^"]+)"/)[1];
  const word = (form) => ({ form, lemma: form, en: form === newWord ? 'a made-up bun' : `meaning of ${form}`, explain_sv: 'enkel förklaring' });
  const forms = ['idag', 'dricker', 'jag', 'kaffe', 'och', 'äter', 'en', 'i', 'det', 'är', 'gott'];
  await page.getByLabel("Paste the AI's answer here").fill(JSON.stringify({ own: code, copyright: 'unsure', copyright_note: 'It reads like a magazine.', words: forms.map(word) }));
  await page.locator('#own-add').click();
  await expect(page.locator('#own-problems')).toContainText(newWord);
  await expect(page.locator('#own-message')).toHaveText(/Your AI's answer left 1 word without a meaning\./);
  await page.getByLabel("Paste the AI's answer here").fill(JSON.stringify({ own: code, copyright: 'unsure', words: [word(newWord)] }));
  await page.locator('#own-add').click();
  await expect(page.locator('#own-count')).toHaveText('Step 3 of 3');
  await expect(page.locator('#own-message')).toHaveText(/^Meanings added for \d+ new words?\.$/);
  await expect(page.locator('#own-known')).toContainText('% known');
  await expect(page.locator('#own-copyright')).toHaveText('Your AI thinks this may be copyrighted: It reads like a magazine.');
  await page.getByRole('link', { name: 'Read “<b>Min</b> dag”' }).click();
  await page.waitForURL(new RegExp(`/text\\?id=${id}$`));
  await expect(page.locator('#title')).toHaveText('<b>Min</b> dag');
  await expect(page.locator('#title b')).toHaveCount(0);
  await expect(page.locator('#lines')).toContainText('<i>Det</i>');
  await expect(page.locator('#lines i')).toHaveCount(0);
  await expect(page.locator('#stats')).toContainText('your own text');
  await expect(page.locator('#stats')).toContainText('harder than your usual texts');
  await expect(page.locator('#copyright')).toHaveText('Your AI thinks this may be copyrighted: It reads like a magazine.');
  await expect(page.locator('#lines .en')).toHaveCount(0);
  await page.locator('button.w', { hasText: newWord }).click();
  await expect(page.locator('#menu')).toContainText('a made-up bun');
  await expect(page.locator('#menu .menu-state .state-chip')).toHaveText('new');
  await page.locator('#menu-action button').click();
  await expect(page.locator('.toast')).toContainText(`${newWord} is a new leaf: due now in Review.`);
});
