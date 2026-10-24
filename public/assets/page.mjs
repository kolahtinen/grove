// The top bar's account part: the signed-in email and Sign out (FR-014).
import { getMe, post } from './api.mjs';

export async function showAccount() {
  const me = await getMe();
  const box = document.querySelector('.account');
  if (!me || !box) return me;
  box.querySelector('.account-email').textContent = me.email;
  box.hidden = false;
  box.querySelector('.signout').addEventListener('click', async () => {
    await post('/api/signout', {});
    window.location.assign('/signin');
  });
  return me;
}
