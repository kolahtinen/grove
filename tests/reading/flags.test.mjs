import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readingGrove, signedIn, addPart, textId, tokensOf } from './helpers.mjs';

let t;
let learner;
let c;
before(async () => {
  ({ t, learner } = await readingGrove());
  c = await signedIn(t);
  const { res } = await addPart(c);
  assert.equal(res.result, 'accepted', JSON.stringify(res));
});
after(() => t.close());

const sentenceId = (sv) => t.grove.db.prepare('SELECT id FROM sentences WHERE account_id = ? AND sv = ?').get(learner.id, sv).id;

test('FR-313 RQ-297: Explain stores a flag with a code, reason and note, and the next part prompt asks for it', async () => {
  const res = await c.post('/api/explain', { sentenceId: sentenceId('Maja tvättar kopparna.'), form: 'kopparna', reason: 'why_form', note: 'why -arna?' });
  assert.deepEqual(res.body, { code: 'E1' });
  const second = await c.post('/api/explain', { sentenceId: sentenceId('Elsa räknar pengarna.'), form: 'räknar', reason: 'other' });
  assert.equal(second.body.code, 'E2');
  const p = await c.post('/api/prompt', { action: 'next' });
  assert.match(p.body.prompt, /E1: "kopparna" in "Maja tvättar kopparna\." — reason: why this form — note: why -arna\?/);
  assert.match(p.body.prompt, /"explanations"/);
  assert.equal((await c.post('/api/explain', { sentenceId: sentenceId('Maja tvättar kopparna.'), form: 'kopparna', reason: 'nonsense' })).status, 400);
});

test('FR-314 RQ-298: an answer\'s explanation is stored, shown in the menu for that word, and closes its flag; an unanswered flag stays open', async () => {
  const { res } = await addPart(c, undefined, (a) => {
    a.texts = a.texts.slice(0, 1); a.texts[0].title = 'Förklarat';
    a.explanations = [{ code: 'E1', explain_en: 'koppar + na: the plural definite form, "the cups".' }];
    return a;
  });
  assert.equal(res.result, 'accepted', JSON.stringify(res));
  const r = (await c.get(`/api/reading?id=${textId(t, learner.id, 'En bra dag')}`)).body;
  assert.match(tokensOf(r).find((x) => x.t === 'kopparna').explanation, /plural definite/);
  const flags = t.grove.db.prepare('SELECT code, status FROM explain_flags WHERE account_id = ? ORDER BY code').all(learner.id).map((f) => [f.code, f.status]);
  assert.deepEqual(flags, [['E1', 'answered'], ['E2', 'open']]);
});

test('FR-315 RQ-301: a reported question stops counting, the next prompt lists it, and a fix replaces it', async () => {
  const id = textId(t, learner.id, 'Olles väska');
  await c.post('/api/question', { textId: id, position: 1, option: 0 });
  const rep = await c.post('/api/report', { textId: id, questionPosition: 1, reason: 'wrong_answer', note: 'the sofa' });
  assert.deepEqual(rep.body, { code: 'R1' });
  const r = (await c.get(`/api/reading?id=${id}`)).body;
  assert.equal(r.questions[1].reported, true);
  const waiting = (await c.get('/api/home')).body.waiting;
  const prompt = waiting ? waiting.prompt : (await c.post('/api/prompt', { action: 'next' })).body.prompt;
  assert.match(prompt, /R1: text "Olles väska", question 2 \("Var hittar Elsa väskan\?"\) — reason: wrong answer — note: the sofa/);
  assert.match(prompt, /"fixes"/);
  const { res } = await addPart(c, undefined, (a) => {
    a.texts = a.texts.slice(0, 1); a.texts[0].title = 'Fixat';
    a.fixes = [{ code: 'R1', q: 'Var hittar Elsa väskan?', options: ['Bakom en soffa', 'Under ett bord'], answer: 0 }];
    return a;
  });
  assert.equal(res.result, 'accepted', JSON.stringify(res));
  const q = t.grove.db.prepare('SELECT options, answer FROM questions WHERE text_id = ? AND position = 1').get(id);
  assert.deepEqual(JSON.parse(q.options), ['Bakom en soffa', 'Under ett bord']);
  assert.equal(q.answer, 0);
  assert.equal(t.grove.db.prepare("SELECT status FROM reports WHERE code = 'R1' AND account_id = ?").get(learner.id).status, 'fixed');
});

test('FR-315 RQ-301: a reported question\'s answers never count in the summary', async () => {
  const id = textId(t, learner.id, 'Olles väska');
  await c.post('/api/question', { textId: id, position: 0, option: 0 });
  await c.post('/api/rating', { textId: id, value: 'most' });
  t.grove.db.prepare('UPDATE learner_settings SET last_summary_at = 0').run();
  const res = await c.post('/api/prompt', { action: 'new_package' });
  assert.match(res.body.prompt, /"Olles väska": understood most; questions right 1 of 1/);
});

test('FR-315 RQ-301: a reported sentence is fixed by replacing its line; a report needs exactly one position', async () => {
  const id = textId(t, learner.id, 'En kall morgon');
  const rep = await c.post('/api/report', { textId: id, linePosition: 0, reason: 'unnatural' });
  const code = rep.body.code;
  assert.equal((await c.post('/api/report', { textId: id, reason: 'other' })).status, 400);
  assert.equal((await c.post('/api/report', { textId: id, linePosition: 0, questionPosition: 0, reason: 'other' })).status, 400);
  const { res } = await addPart(c, undefined, (a) => {
    a.texts = a.texts.slice(0, 1); a.texts[0].title = 'Rad fixad';
    a.fixes = [{ code, sv: 'Det är en mycket kall morgon i Stockholm.', en: 'It is a very cold morning in Stockholm.' }];
    return a;
  });
  assert.equal(res.result, 'accepted', JSON.stringify(res));
  assert.equal(t.grove.db.prepare('SELECT sv FROM text_lines WHERE text_id = ? AND position = 0').get(id).sv, 'Det är en mycket kall morgon i Stockholm.');
  assert.equal(t.grove.db.prepare('SELECT sv FROM sentences WHERE text_id = ? AND line_position = 0').get(id).sv, 'Det är en mycket kall morgon i Stockholm.');
});

test('FR-319 RQ-155: flags and reports on another account\'s text are refused', async () => {
  const other = await signedIn(t, 'other@example.test');
  assert.equal((await other.post('/api/explain', { sentenceId: sentenceId('Maja tvättar kopparna.'), form: 'kopparna', reason: 'other' })).status, 404);
  assert.equal((await other.post('/api/report', { textId: textId(t, learner.id, 'Olles väska'), questionPosition: 0, reason: 'other' })).status, 404);
});
