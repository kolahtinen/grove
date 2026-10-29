// The way back (G-09 FR-922, FR-923; addendum 006): a link at the top of every signed-in page but Home,
// naming the page it belongs under; "‹ Back to your session" instead while a session's short-session
// offer sent the learner here (`?from=session`) and that session still has its offer, which the server
// keeps (no address is ever taken from the page). On those pages the fill bars (FR-920) sit at the
// bottom: one per kind still needed, filling as texts are added, and ▶ Start your session when full.
// The phone's or browser's Back closes an open menu, sheet or panel first (`backCloses`).
import { post } from './api.mjs';

const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; };

// The page map (FR-922): each page and the page it belongs under.
const HOME = ['/', 'Home'];
const LIBRARY = ['/texts', 'Your library'];
const PARENTS = {
  '/session': HOME, '/options': HOME, '/texts': HOME, '/library': HOME, '/progress': HOME, '/settings': HOME, '/profile': HOME,
  '/add': LIBRARY, '/dictionary': LIBRARY, '/leaves': LIBRARY, '/text': LIBRARY, '/review': LIBRARY,
  '/library/text': ['/library', 'Common library'],
  '/add/ai': ['/add', 'Add a text'], '/own': ['/add', 'Add a text'],
  '/start': ['/settings', 'Settings'],
};
// The pages a session's offer leads through; links between them keep `from=session`.
const OFFER_PAGES = ['/add', '/library', '/library/text', '/add/ai', '/own'];
const NAMES = { reading: 'Reading', listening: 'Listening' };

export const fromSession = () => new URLSearchParams(window.location.search).get('from') === 'session';
export let session = null;
const listeners = [];
let current;

// The going session's offer, when the learner came from it; null otherwise.
export function offer() {
  return fromSession() && session?.status === 'going' && session.offer ? session.offer : null;
}
// The kinds whose bars aren't full yet (the library lists only these, B-23).
export function kindsStillNeeded() {
  const o = offer();
  return o ? o.needs.filter((k) => o.added[k] < o.missing[k]) : null;
}
export function onOfferChange(fn) { listeners.push(fn); }

function backLink(parent) {
  const nav = el('nav', 'way-back');
  nav.setAttribute('aria-label', 'Back');
  const o = offer();
  const a = el('a', '', o ? '‹ Back to your session' : `‹ ${parent[1]}`);
  a.href = o ? '/session' : parent[0];
  nav.append(a);
  return nav;
}

function renderLink(parentOverride) {
  const parent = parentOverride ?? PARENTS[window.location.pathname];
  document.querySelector('.way-back')?.remove();
  if (!parent && !offer()) return;
  // A page can say where the link goes (the Options page's sheet head); else at the top of main.
  (document.querySelector('[data-way-back]') ?? document.querySelector('main'))?.prepend(backLink(parent ?? HOME));
}

async function startSession(button) {
  button.disabled = true;
  const r = await post('/api/session/plan', { sessionId: session.id, fill: false });
  if (r.ok && r.data.session.total > 0) { window.location.assign('/session'); return; }
  button.disabled = false;
  await refresh();
}

function renderBars() {
  document.querySelector('.fill-bars')?.remove();
  const o = offer();
  if (!o) return;
  const box = el('aside', 'fill-bars');
  box.setAttribute('aria-label', 'Your session');
  if (o.full) {
    const go = el('button', 'main', '▶ Start your session');
    go.type = 'button';
    go.addEventListener('click', () => startSession(go));
    box.append(go);
  } else {
    const back = el('a', 'fill-bars-link');
    back.href = '/session';
    back.setAttribute('aria-label', 'Back to your session');
    for (const kind of o.needs) {
      const done = o.added[kind] >= o.missing[kind];
      const row = el('span', `fill-bar ${kind}${done ? ' full' : ''}`);
      const bar = el('progress');
      bar.max = o.missing[kind];
      bar.value = Math.min(o.added[kind], o.missing[kind]);
      bar.setAttribute('aria-label', `${NAMES[kind]}: ${Math.min(o.added[kind], o.missing[kind])} of ${o.missing[kind]} min`);
      row.append(el('span', 'fill-name', NAMES[kind]), bar, el('span', 'fill-count', done ? '✓' : `${Math.min(o.added[kind], o.missing[kind])} of ${o.missing[kind]} min`));
      back.append(row);
    }
    box.append(back);
  }
  document.body.append(box);
  document.body.classList.add('has-fill-bars');
}

// Keeps `from=session` on links between the offer's pages.
function carry() {
  if (!offer()) return;
  for (const a of document.querySelectorAll('main a[href^="/"]')) {
    const url = new URL(a.href, window.location.origin);
    if (OFFER_PAGES.includes(url.pathname) && !url.searchParams.has('from')) {
      url.searchParams.set('from', 'session');
      a.href = `${url.pathname}${url.search}`;
    }
  }
}

// Reads the going session again (after + Add) and redraws the link, the bars and the carried links.
export async function refresh() {
  if (fromSession()) {
    const res = await fetch('/api/session', { credentials: 'same-origin' });
    session = res.ok ? (await res.json()).session : null;
  }
  renderLink(current);
  renderBars();
  carry();
  for (const fn of listeners) fn(offer());
}

// Called once a page knows who is signed in; `parent` overrides the map (the starting level before a
// level is chosen goes back to Home).
export async function showWay(parent) {
  current = parent;
  await refresh();
}
export { carry as carryFromSession };

// FR-922: Back, Esc or ✕ close an open overlay first. Opening one pushes a history entry, so the phone's
// Back pops it and closes the overlay; closing it another way removes that entry again.
export function backCloses(close, { reuse = false } = {}) {
  let open = true;
  const onPop = () => { if (!open) return; open = false; window.removeEventListener('popstate', onPop); close(); };
  // An overlay opened from another (Help from the menu) takes over its history entry.
  if (!(reuse && history.state?.groveOverlay)) history.pushState({ groveOverlay: true }, '');
  window.addEventListener('popstate', onPop);
  return (keep = false) => {
    if (!open) return;
    open = false;
    window.removeEventListener('popstate', onPop);
    if (!keep && history.state?.groveOverlay) history.back();
  };
}
