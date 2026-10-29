// Counts minutes of input while the page is in view and the learner active (FR-415; research R5), each
// half minute with its kind: reading, listening or other (G-09 FR-925).
import { post } from './api.mjs';

let lastActive = Date.now();
for (const event of ['pointerdown', 'keydown', 'scroll', 'touchstart']) {
  window.addEventListener(event, () => { lastActive = Date.now(); }, { passive: true });
}

export function startHeartbeat(kindNow = () => 'other') {
  setInterval(() => {
    if (document.visibilityState !== 'visible' || Date.now() - lastActive > 120000) return;
    const d = new Date();
    const day = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    post('/api/input', { seconds: 30, day, kind: kindNow() });
  }, 30000);
}
