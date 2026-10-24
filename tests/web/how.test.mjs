import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { startTestGrove } from '../fakes/harness.mjs';

let t;
before(async () => { t = await startTestGrove(); });
after(() => t.close());

const glossaryTerms = () => [...readFileSync(new URL('../../docs/glossary.md', import.meta.url), 'utf8').matchAll(/^\| \*\*([^*]+)\*\*/gm)].map((m) => m[1]);

test('FR-804 RQ-370: "How grove works" is served without signing in and explains every glossary term, the stages, marking, CEFR and the share of known words', async () => {
  const c = t.client();
  const r = await c.get('/how');
  assert.equal(r.status, 200);
  const html = r.text;
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  for (const term of glossaryTerms()) assert.match(text, new RegExp(`\\b${term}\\b`, 'i'), term);
  for (const more of ['Discover', 'Review', 'Master', 'To read', 'To remember', 'CEFR', 'A1', 'C2', '95']) assert.ok(text.includes(more), more);
  for (const asset of ['/assets/how.mjs', '/assets/grow.mjs', '/assets/topbar.mjs']) assert.equal((await c.get(asset)).status, 200, asset);
});

test('FR-807 FR-804 RQ-346 RQ-310 RQ-370: every page has the A.5 logo and a "?" link to /how in its top bar', () => {
  const dir = new URL('../../public/', import.meta.url);
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.html'))) {
    const html = readFileSync(new URL(file, dir), 'utf8');
    assert.ok(html.includes('<path class="gl" d="M3 27h26"/><g class="tr t1"><path d="M9 27V19M5 19l4-9 4 9z"/></g><g class="tr t2"><path d="M17 27V15M12 15l5-11 5 11z"/></g><g class="tr t3"><path d="M25 27v-6M22 21l3-7 3 7z"/></g>'), `${file}: A.5 logo`);
    assert.match(html, /<a class="bar-button nav help-link" href="\/how"/, `${file}: ? link`);
    assert.ok(html.includes('/assets/topbar.mjs'), `${file}: topbar.mjs`);
  }
});
