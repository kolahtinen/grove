// The top bar's account part: on most signed-in pages the ☰ menu (G-09 FR-902); on the terms and reset
// pages, the signed-in email and Sign out (FR-014).
import { getMe, post } from './api.mjs';
import { showMenu } from './topbar.mjs';

export async function showAccount() {
  const me = await getMe();
  const box = document.querySelector('.account');
  if (!me || !box) return me;
  box.hidden = false;
  if (box.querySelector('.menu-button')) { showMenu(); return me; }
  box.querySelector('.account-email').textContent = me.email;
  box.querySelector('.signout').addEventListener('click', async () => {
    await post('/api/signout', {});
    window.location.assign('/signin');
  });
  return me;
}
