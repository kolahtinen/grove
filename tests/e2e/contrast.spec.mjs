import { test, expect } from '@playwright/test';
import { agreeTerms } from './helpers.mjs';
import { REVIEWER } from '../fakes/dev-accounts.mjs';

// G-09 FR-913, SC-003 (research R9): on every page, in both looks, every element with text of its own
// meets 4.5:1 against the background it sits on (3:1 for text ≥ 24 px or ≥ 18.66 px bold, and for
// chips). Disabled controls are exempt (WCAG 1.4.3). The background is the nearest opaque one, with
// any translucent layers above it blended in; on a gradient, every colour stop is checked.
// Light main buttons are flat dark green (question-pages/78, 1), so no pair is reported apart any more.

const SIGNED_OUT = ['/signin', '/reset', '/terms', '/how', '/credits'];
const SIGNED_IN = ['/', '/texts', '/add', '/add/ai', '/own', '/library', '/session', '/review?mode=review', '/text', '/leaves', '/progress', '/dictionary', '/settings', '/profile'];

function audit() {
  const parse = (c) => {
    const m = c.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const [r, g, b, a = 1] = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
    return { r, g, b, a };
  };
  const over = (top, under) => ({ r: top.r * top.a + under.r * (1 - top.a), g: top.g * top.a + under.g * (1 - top.a), b: top.b * top.a + under.b * (1 - top.a), a: 1 });
  const lum = ({ r, g, b }) => {
    const f = (v) => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const ratio = (x, y) => { const [h, l] = [lum(x), lum(y)].sort((p, q) => q - p); return (h + 0.05) / (l + 0.05); };
  const gradientStops = (img) => (img.match(/rgba?\([^)]+\)/g) || []).map(parse);
  // The backgrounds the element's text is drawn on: every gradient stop, or the blended solid colour.
  const backgrounds = (el) => {
    const layers = [];
    for (let n = el; n; n = n.parentElement) {
      const s = getComputedStyle(n);
      const img = s.backgroundImage;
      if (img && img.includes('gradient') && n !== document.body && n !== document.documentElement) {
        const stops = gradientStops(img).filter((c) => c.a === 1);
        if (stops.length) return stops.map((stop) => layers.reduceRight((acc, l) => over(l, acc), stop));
      }
      const c = parse(s.backgroundColor);
      if (c && c.a > 0) {
        if (c.a === 1) return [layers.reduceRight((acc, l) => over(l, acc), c)];
        layers.push(c);
      }
    }
    const page = parse(getComputedStyle(document.body).backgroundColor) || { r: 255, g: 255, b: 255, a: 1 };
    return [layers.reduceRight((acc, l) => over(l, acc), page)];
  };
  const visible = (el) => {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return false;
    for (let n = el; n; n = n.parentElement) {
      const s = getComputedStyle(n);
      if (s.visibility === 'hidden' || s.display === 'none' || Number(s.opacity) === 0) return false;
    }
    return true;
  };
  const failures = [];
  for (const el of document.querySelectorAll('body *')) {
    if (['SCRIPT', 'STYLE', 'svg', 'path', 'OPTION'].includes(el.tagName)) continue;
    const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    if (!own || !visible(el)) continue;
    if (el.closest('[disabled], [aria-disabled="true"], [aria-hidden="true"]')) continue;
    const s = getComputedStyle(el);
    const size = parseFloat(s.fontSize);
    const bold = Number(s.fontWeight) >= 700;
    const large = size >= 24 || (size >= 18.66 && bold) || !!el.closest('.chip');
    const need = large ? 3 : 4.5;
    const fg = parse(s.color);
    for (const bg of backgrounds(el)) {
      const r = ratio(fg.a < 1 ? over(fg, bg) : fg, bg);
      if (r < need - 0.005) {
        failures.push({ text: el.textContent.trim().slice(0, 40), cls: String(el.className).slice(0, 40), color: s.color, bg: `rgb(${Math.round(bg.r)}, ${Math.round(bg.g)}, ${Math.round(bg.b)})`, ratio: Math.round(r * 100) / 100, need });
        break;
      }
    }
  }
  return failures;
}

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

async function api(page, path, body) {
  return page.evaluate(async ({ path, body }) => {
    const me = await (await fetch('/api/me')).json();
    const r = await fetch(path, { method: 'POST', headers: { 'content-type': 'application/json', 'x-csrf-token': me.csrf }, body: JSON.stringify(body) });
    return r.json();
  }, { path, body });
}

// Visits every page in a look and returns its failures, each with the page it is on.
async function auditAll(page, scheme) {
  await page.emulateMedia({ colorScheme: scheme, reducedMotion: 'reduce' });
  const found = [];
  const check = async (where) => { for (const f of await page.evaluate(audit)) found.push({ where, ...f }); };
  for (const path of SIGNED_OUT) {
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    await check(path);
  }
  await signIn(page);
  const topics = await page.evaluate(async () => (await (await fetch('/api/topics')).json()).topics);
  const textId = topics.flatMap((t) => t.texts).find((x) => x.title === 'Brevet i väskan')?.id ?? topics[0].texts[0].id;
  await api(page, '/api/sessions', { kind: 'time', tile: 'mix', skill: 'mix', minutes: 5, voice: true, fill: true });
  for (const path of SIGNED_IN) {
    await page.goto(path === '/text' ? `/text?id=${textId}` : path);
    await page.waitForLoadState('networkidle');
    if (path === '/') {
      await page.getByRole('button', { name: 'Mix', exact: true }).click();
      await expect(page.locator('#tile-panel')).toBeVisible();
    }
    await check(path);
  }
  return found;
}

for (const scheme of ['light', 'dark']) {
  test(`FR-913 SC-003 RQ-426 R-26: in the ${scheme} look every page's text meets AA against its background`, async ({ page }) => {
    test.setTimeout(90000);
    expect(await auditAll(page, scheme)).toEqual([]);
  });
}
