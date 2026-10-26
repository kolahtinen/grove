// The learner's AI, its product and the tactic grove recommends for it (FR-223; question-pages/70).
// From the probe test of 2026-10-26 (free versions); the paid rows are a first guess until tried.

export const TACTICS = ['steps', 'long', 'whole'];

export const FAMILIES = [
  { id: 'chatgpt', name: 'ChatGPT', products: [{ id: 'free', name: 'Free' }, { id: 'go', name: 'Go', paid: true }, { id: 'plus', name: 'Plus', paid: true }, { id: 'pro', name: 'Pro', paid: true }] },
  { id: 'gemini', name: 'Gemini', products: [{ id: 'free', name: 'Free' }, { id: 'ai-plus', name: 'Google AI Plus', paid: true }, { id: 'ai-pro', name: 'Google AI Pro', paid: true }, { id: 'ai-ultra', name: 'Google AI Ultra', paid: true }] },
  { id: 'claude', name: 'Claude', products: [{ id: 'free', name: 'Free' }, { id: 'pro', name: 'Pro', paid: true }, { id: 'max', name: 'Max', paid: true }] },
  { id: 'copilot', name: 'Copilot', products: [{ id: 'free', name: 'Free' }, { id: 'm365', name: 'Microsoft 365 Personal or Family', paid: true }] },
  { id: 'lechat', name: 'Le Chat (Mistral)', products: [{ id: 'free', name: 'Free' }, { id: 'pro', name: 'Pro', paid: true }] },
  { id: 'other', name: 'Another AI', products: [{ id: 'free', name: 'Free' }, { id: 'paid', name: 'Paid', paid: true }] },
].map((f) => ({ ...f, products: f.products.map((p) => ({ ...p, paid: !!p.paid })) }));

// Free AIs that kept to the known words only when they were in the same message as the request.
const LONG_WHEN_FREE = new Set(['gemini', 'lechat']);

export function productOf(family, product) {
  return FAMILIES.find((f) => f.id === family)?.products.find((p) => p.id === product) ?? null;
}

export function recommend(family, product) {
  const p = productOf(family, product);
  if (p?.paid) return { tactic: 'whole', reason: 'Paid versions take long answers, so the whole package can come in one go.' };
  if (LONG_WHEN_FREE.has(family)) return { tactic: 'long', reason: 'In grove\'s test this AI kept to your known words best when they came with each request.' };
  return { tactic: 'steps', reason: family === 'chatgpt' || family === 'copilot'
    ? 'In grove\'s test this AI did best with the setup sent once, in pieces.'
    : 'The setup is sent once, in pieces; if texts keep failing, grove offers one long prompt.' };
}
