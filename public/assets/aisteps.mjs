// Where the learner is in Texts from your AI (G-09 FR-919; question-pages/92): the five steps are always the
// same five, and the step follows G-02's prompting state (a waiting request) and, kept on this device only,
// whether its setup was sent and its request copied. Shared by the wizard and Add a text's "Under way".
export const AI_STEPS = ['Your AI', 'Setup', 'Copy the request', 'Paste the answer', 'Texts added'];

const key = (exchangeId) => `grove-ai-${exchangeId}`;

export function progressOf(exchangeId) {
  try { return JSON.parse(localStorage.getItem(key(exchangeId))) ?? {}; } catch { return {}; }
}
export function remember(exchangeId, part) {
  try { localStorage.setItem(key(exchangeId), JSON.stringify({ ...progressOf(exchangeId), ...part })); } catch { /* this device only */ }
}

// The step (0–4) a learner coming to the page is on.
export function aiStep(home) {
  if (!home?.plan?.family) return 0;
  const w = home.waiting;
  if (!w) return 0;
  const p = progressOf(w.exchangeId);
  if (w.steps?.length && !p.setup) return 1;
  if (!p.copied) return 2;
  return 3;
}
