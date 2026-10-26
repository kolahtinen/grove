import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readingGrove, signedIn, tokensOf } from './helpers.mjs';
import { splitPieces } from '../../server/reading/own.mjs';

let t;
let learner;
let c;
let id;
before(async () => {
  ({ t, learner } = await readingGrove());
  c = await signedIn(t);
});
after(() => t.close());

const OWN = 'Idag är det sol i Stockholm.\nJag dricker kaffe och äter en kanelbulle på ett kafé. Det är gott!';
const FORMS = ['idag', 'är', 'det', 'sol', 'i', 'jag', 'dricker', 'kaffe', 'och', 'äter', 'en', 'kanelbulle', 'på', 'ett', 'kafé', 'gott'];
const meaning = (form) => ({ form, lemma: form === 'dricker' ? 'dricka' : form === 'äter' ? 'äta' : form, en: `meaning of ${form}`, explain_sv: `förklaring av ${form}` });
const ownAnswer = (code, forms, extra = {}) => JSON.stringify({ own: code, copyright: 'free', copyright_note: 'Written by the learner.', words: forms.map(meaning), names: ['Stockholm'], ...extra });
const codeOf = (exchangeId) => t.grove.db.prepare('SELECT code FROM exchanges WHERE id = ?').get(exchangeId).code;

test('FR-318 RQ-74 RQ-400: an own text is saved without English, split into lines and sentences, listed as own and waiting, with its AI prompt; it can\'t be opened yet', async () => {
  const res = await c.post('/api/own-text', { title: 'Min dag', text: OWN });
  assert.equal(res.status, 200);
  id = res.body.id;
  assert.equal(res.body.ready, false);
  assert.deepEqual([res.body.piece, res.body.of], [1, 1]);
  assert.match(res.body.prompt, /For every word in it/);
  assert.match(res.body.prompt, /copyright/);
  assert.match(res.body.prompt, /Jag dricker kaffe/);
  const row = t.grove.db.prepare('SELECT own, exchange_id, ready FROM texts WHERE id = ?').get(id);
  assert.deepEqual({ ...row }, { own: 1, exchange_id: null, ready: 0 });
  const lines = t.grove.db.prepare('SELECT sv, en FROM text_lines WHERE text_id = ? ORDER BY position').all(id);
  assert.equal(lines.length, 2);
  assert.ok(lines.every((l) => l.en === ''));
  assert.equal(t.grove.db.prepare('SELECT COUNT(*) AS n FROM sentences WHERE text_id = ?').get(id).n, 3);
  const home = (await c.get('/api/home')).body;
  assert.deepEqual([home.texts.find((x) => x.id === id).own, home.texts.find((x) => x.id === id).ready], [true, false]);
  const blocked = await c.get(`/api/reading?id=${id}`);
  assert.equal(blocked.status, 409);
  assert.equal(blocked.body.error, 'not_ready');
  assert.equal((await c.post('/api/own-text', { title: 'Lång', text: 'a'.repeat(20001) })).status, 400);
});

test('FR-318 RQ-400 RQ-401: an answer missing some words gets a fix-it for just those; once complete the text opens with its share of known words and the AI\'s copyright view', async () => {
  const status = (await c.get(`/api/own-text?id=${id}`)).body;
  const code = codeOf(status.exchangeId);
  const partial = await c.post('/api/answer', { exchangeId: status.exchangeId, answer: ownAnswer(code, FORMS.filter((f) => f !== 'kanelbulle' && f !== 'gott')) });
  assert.equal(partial.body.result, 'needs_fix', JSON.stringify(partial.body));
  assert.match(partial.body.fix.prompt, /kanelbulle, gott/);
  assert.doesNotMatch(partial.body.fix.prompt, /\bdricker\b/);
  assert.equal((await c.get(`/api/reading?id=${id}`)).status, 409);
  const done = await c.post('/api/answer', { exchangeId: partial.body.fix.exchangeId, answer: ownAnswer(code, ['kanelbulle', 'gott'], { copyright: 'unsure', copyright_note: 'It reads like a magazine.' }) });
  assert.equal(done.body.result, 'piece_added', JSON.stringify(done.body));
  assert.equal(done.body.ready, true);
  assert.equal(typeof done.body.knownShare, 'number');
  const r = (await c.get(`/api/reading?id=${id}`)).body;
  assert.equal(r.own, true);
  assert.equal(r.knownShare, done.body.knownShare);
  assert.deepEqual(r.copyright, { view: 'unsure', note: 'It reads like a magazine.' });
  const bun = tokensOf(r).find((x) => x.t === 'kanelbulle');
  assert.equal(bun.status, 'new');
  assert.equal(bun.meaning, 'meaning of kanelbulle');
  assert.equal(tokensOf(r).find((x) => x.t === 'Stockholm').status, 'name');
});

test('FR-318 RQ-74 RQ-18 RQ-396: Save as leaf adds the word with the AI\'s meaning from the round; there is no Get meanings prompt any more', async () => {
  assert.deepEqual((await c.post('/api/leaf', { textId: id, form: 'Kanelbulle' })).body, { result: 'saved' });
  const leaf = t.grove.db.prepare("SELECT state, en, explain_sv, en_source, source_text_id FROM words WHERE account_id = ? AND lemma = 'kanelbulle'").get(learner.id);
  assert.deepEqual({ ...leaf }, { state: 'leaf', en: 'meaning of kanelbulle', explain_sv: 'förklaring av kanelbulle', en_source: 'ai', source_text_id: id });
  assert.equal((await c.post('/api/meanings-prompt', {})).status, 404);
});

test('FR-318 RQ-400 R-18: a long own text goes to the AI in pieces split between sentences, each answered on its own; the text opens when every piece is in', async () => {
  assert.deepEqual(splitPieces(['Ett.', 'Två.', 'Tre.'], 9), ['Ett. Två.', 'Tre.']);
  const sentence = 'Jag dricker kaffe på ett kafé.';
  const long = Array.from({ length: 120 }, () => sentence).join(' ');
  const res = (await c.post('/api/own-text', { title: 'Lång dag', text: long })).body;
  assert.ok(res.of >= 2, `${res.of} pieces`);
  let status = res;
  for (let piece = 1; piece <= res.of; piece += 1) {
    assert.equal(status.piece, piece);
    assert.ok(status.prompt.length < 2500 + 1500, 'a piece is about the size setting');
    const a = await c.post('/api/answer', { exchangeId: status.exchangeId, answer: ownAnswer(codeOf(status.exchangeId), ['jag', 'dricker', 'kaffe', 'på', 'ett', 'kafé']) });
    assert.equal(a.body.ready, piece === res.of, JSON.stringify(a.body));
    status = (await c.get(`/api/own-text?id=${res.id}`)).body;
  }
  assert.equal(status.ready, true);
});

test('FR-319 RQ-155: another account cannot read the own text, its AI round, or save leaves from it', async () => {
  const other = await signedIn(t, 'other@example.test');
  assert.equal((await other.get(`/api/reading?id=${id}`)).status, 404);
  assert.equal((await other.get(`/api/own-text?id=${id}`)).status, 404);
  assert.equal((await other.post('/api/leaf', { textId: id, form: 'kanelbulle' })).status, 404);
});

test('FR-224 RQ-406: an own text is marked beta', async () => {
  const home = (await c.get('/api/home')).body;
  assert.equal(home.texts.find((x) => x.id === id).beta, true);
  assert.equal((await c.get(`/api/reading?id=${id}`)).body.beta, true);
});
