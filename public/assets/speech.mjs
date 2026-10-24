// grove's speech (G-05 FR-501, FR-503): the device's Swedish voice only, picked when the voices
// arrive (also late), never another language's voice; the learner's rate everywhere.

let rate = 1;
let voice = null;
const listeners = new Set();

const isSwedish = (v) => /^sv([-_]|$)/i.test(v?.lang || '');

function pick() {
  const synth = window.speechSynthesis;
  const before = voice;
  voice = synth ? (synth.getVoices() || []).find(isSwedish) || null : null;
  if (voice !== before) for (const fn of listeners) fn(!!voice);
}

if (window.speechSynthesis) {
  pick();
  window.speechSynthesis.addEventListener?.('voiceschanged', pick);
  // Some browsers fill the list without the event; look again shortly.
  setTimeout(pick, 400);
  setTimeout(pick, 1500);
}

export const hasSwedish = () => !!voice;
export const onVoices = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };
export const setRate = (r) => { rate = Math.min(1.5, Math.max(0.5, Number(r) || 1)); };
export const getRate = () => rate;

// Speaks Swedish text with the Swedish voice; returns false (and says nothing) without one.
export function speak(text, { onend } = {}) {
  pick();
  const synth = window.speechSynthesis;
  if (!synth || !voice) return false;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = voice.lang?.replace('_', '-') || 'sv-SE';
  try { u.voice = voice; } catch { /* keep u.lang */ }
  u.rate = rate;
  u.onend = () => onend?.();
  synth.speak(u);
  return true;
}

export function cancel() {
  window.speechSynthesis?.cancel();
}
