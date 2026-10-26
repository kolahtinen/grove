import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FAMILIES, TACTICS, recommend, productOf } from '../../server/texts/plans.mjs';

test('FR-223 RQ-403: the two menus list the AIs and, per AI, its products, free and paid', () => {
  assert.deepEqual(FAMILIES.map((f) => f.id), ['chatgpt', 'gemini', 'claude', 'copilot', 'lechat', 'other']);
  for (const f of FAMILIES) {
    assert.ok(f.products.length >= 1, f.id);
    assert.ok(f.products.some((p) => !p.paid), `${f.id} has a free product`);
  }
  assert.deepEqual(FAMILIES.find((f) => f.id === 'chatgpt').products.map((p) => p.name), ['Free', 'Go', 'Plus', 'Pro']);
  assert.equal(productOf('chatgpt', 'plus').paid, true);
  assert.equal(productOf('chatgpt', 'gemini-pro'), null, 'a product of another AI is not this AI\'s');
});

test('FR-223 RQ-403 RQ-404: grove recommends a tactic from the probe test: step by step for free ChatGPT, Copilot, Claude and others; one long prompt for free Gemini and Le Chat; the whole package for paid products', () => {
  assert.deepEqual(TACTICS, ['steps', 'long', 'whole']);
  const free = (family) => recommend(family, FAMILIES.find((f) => f.id === family).products.find((p) => !p.paid).id).tactic;
  assert.equal(free('chatgpt'), 'steps');
  assert.equal(free('copilot'), 'steps');
  assert.equal(free('claude'), 'steps');
  assert.equal(free('other'), 'steps');
  assert.equal(free('gemini'), 'long');
  assert.equal(free('lechat'), 'long');
  for (const f of FAMILIES) for (const p of f.products.filter((x) => x.paid)) assert.equal(recommend(f.id, p.id).tactic, 'whole', `${f.id} ${p.id}`);
  assert.match(recommend('lechat', 'free').reason, /\S/);
});
