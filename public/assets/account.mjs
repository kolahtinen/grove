// Account (G-09 FR-910): the signed-in email, Sign out, and how to ask the owner for an export or a
// deletion (G-01 FR-017). The email is set with textContent.
import { post } from './api.mjs';
import { showAccount } from './page.mjs';

const me = await showAccount();
document.getElementById('account-email-page').textContent = me?.email ?? '';
document.getElementById('account-signout').addEventListener('click', async () => {
  await post('/api/signout', {});
  window.location.assign('/signin');
});
