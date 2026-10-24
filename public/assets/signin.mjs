// The sign-in page (FR-009, FR-012): one plain message for any wrong email or password.
import { prepare, post, showMessage } from './api.mjs';

const form = document.getElementById('signin');
const message = document.querySelector('.message');

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const email = form.elements.email.value.trim();
  const password = form.elements.password.value;
  if (!email || !password) {
    showMessage(message, 'Please enter your email and password.');
    return;
  }
  const button = form.querySelector('button');
  button.disabled = true;
  showMessage(message, '');
  await prepare();
  const result = await post('/api/signin', { email, password });
  button.disabled = false;
  if (result.ok) {
    window.location.assign(result.data.termsNeeded ? '/terms' : '/');
    return;
  }
  form.elements.password.value = '';
  showMessage(message, result.message);
});
