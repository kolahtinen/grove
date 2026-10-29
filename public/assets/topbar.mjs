// Every signed-in page's top bar (G-09 FR-902): the logo links to Home, and ☰ opens a menu of Account,
// Settings, Help and Sign out. Help shows How grove works in a bubble over the page, taken from grove's
// own /how page (research R8), with the animation's Replay. All text comes from grove's own pages.
import { post } from './api.mjs';
import { playGrow } from './grow.mjs';

const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; };
let bubble = null;

function closeHelp() {
  if (!bubble) return;
  bubble.backdrop.remove();
  bubble.pop.remove();
  bubble.returnTo?.focus();
  bubble = null;
}

export async function showHelp(returnTo) {
  if (bubble) return;
  const backdrop = el('div', 'sheet-backdrop');
  const pop = el('section', 'card help-pop');
  pop.id = 'help';
  pop.setAttribute('role', 'dialog');
  pop.setAttribute('aria-modal', 'true');
  pop.setAttribute('aria-label', 'How grove works');
  const close = el('button', 'bar-button help-close', '✕');
  close.type = 'button';
  close.setAttribute('aria-label', 'Close');
  close.addEventListener('click', closeHelp);
  pop.append(close);
  bubble = { backdrop, pop, returnTo };
  backdrop.addEventListener('click', closeHelp);
  document.body.append(backdrop, pop);
  close.focus();
  const res = await fetch('/how', { credentials: 'same-origin' });
  if (!res.ok || !bubble) return;
  const main = new DOMParser().parseFromString(await res.text(), 'text/html').querySelector('main');
  for (const section of main?.children ?? []) pop.append(document.adoptNode(section));
  const host = pop.querySelector('#grow-host');
  const replay = pop.querySelector('#replay');
  replay?.addEventListener('click', () => {
    replay.disabled = true;
    playGrow(host, { onend: () => { replay.disabled = false; }, skipLabel: 'Stop' });
  });
}

// The ☰ menu, shown once grove knows who is signed in.
export function showMenu() {
  const button = document.querySelector('.menu-button');
  if (!button) return;
  const menu = el('nav', 'menu');
  menu.id = 'site-menu';
  menu.setAttribute('aria-label', 'Menu');
  menu.hidden = true;
  const link = (href, text) => { const a = el('a', 'menu-item', text); a.href = href; return a; };
  const help = el('button', 'menu-item', 'Help');
  help.type = 'button';
  const signout = el('button', 'menu-item signout', 'Sign out');
  signout.type = 'button';
  menu.append(link('/profile', 'Account'), link('/settings', 'Settings'), help, signout);
  button.after(menu);
  const toggle = (open) => {
    menu.hidden = !open;
    button.setAttribute('aria-expanded', String(open));
  };
  button.addEventListener('click', (event) => {
    event.stopPropagation();
    toggle(menu.hidden);
    if (!menu.hidden) menu.querySelector('.menu-item').focus();
  });
  document.addEventListener('click', (event) => { if (!menu.contains(event.target)) toggle(false); });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (bubble) { closeHelp(); return; }
    if (!menu.hidden) { toggle(false); button.focus(); }
  });
  help.addEventListener('click', () => { toggle(false); showHelp(button); });
  signout.addEventListener('click', async () => {
    await post('/api/signout', {});
    window.location.assign('/signin');
  });
}
