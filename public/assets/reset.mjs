// The password-reset page (FR-015).
import { prepare, post, showMessage } from './api.mjs';

const form = document.getElementById('reset');
const message = document.querySelector('.message');

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const email = form.elements.email.value.trim();
  if (!email) {
    showMessage(message, 'Please enter your email.');
    return;
  }
  const button = form.querySelector('button');
  button.disabled = true;
  await prepare();
  const result = await post('/api/reset', { email });
  button.disabled = false;
  if (result.ok) showMessage(message, 'If this address has an account, an email is on its way.', 'ok');
  else showMessage(message, result.message);
});
