import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startTestGrove } from '../fakes/harness.mjs';

let t;
before(async () => { t = await startTestGrove({ levels: true }); });
after(() => t.close());

test('FR-602 C-05: the public credits page names every source with its licence, and the font', async () => {
  const res = await t.client().get('/credits');
  assert.equal(res.status, 200);
  const sources = t.grove.db.prepare('SELECT * FROM sources').all();
  assert.ok(sources.length >= 1);
  for (const s of sources) {
    assert.ok(res.text.includes(s.name.split(',')[0]), s.name);
    assert.ok(res.text.includes(s.licence.split(',')[0]), s.licence);
    if (s.url) assert.ok(res.text.includes(s.url), s.url);
  }
  assert.match(res.text, /Zen Kaku Gothic New/);
  assert.match(res.text, /SIL Open Font Licence/);
});
