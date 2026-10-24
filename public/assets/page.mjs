// Shared page parts: the header's signed-in email and Sign out button (FR-014).
import { getMe, post } from './api.mjs';

export async function showAccount() {
  const me = await getMe();
  const box = document.querySelector('.account');
  if (!me || !box) return me;
  box.querySelector('.account-email').textContent = me.email;
  box.hidden = false;
  document.getElementById('signout').addEventListener('click', async () => {
    await post('/api/signout', {});
    window.location.assign('/signin');
  });
  return me;
}
