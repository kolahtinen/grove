// Counts minutes of input while the page is in view and the learner active (FR-415; research R5).
import { post } from './api.mjs';

let lastActive = Date.now();
for (const event of ['pointerdown', 'keydown', 'scroll', 'touchstart']) {
  window.addEventListener(event, () => { lastActive = Date.now(); }, { passive: true });
}

export function startHeartbeat() {
  setInterval(() => {
    if (document.visibilityState !== 'visible' || Date.now() - lastActive > 120000) return;
    const d = new Date();
    const day = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    post('/api/input', { seconds: 30, day });
  }, 30000);
}
