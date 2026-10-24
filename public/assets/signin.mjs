// The sign-in page (FR-009, FR-012).
import { prepare, post, showMessage } from './api.mjs';

const form = document.getElementById('signin');
const message = document.querySelector('.message');

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = form.querySelector('button');
  if (!form.elements.email.value.trim() || !form.elements.password.value) {
    showMessage(message, 'Please enter your email and password.');
    return;
  }
  button.disabled = true;
  showMessage(message, '');
  await prepare();
  const result = await post('/api/signin', {
    email: form.elements.email.value.trim(),
    password: form.elements.password.value,
  });
  button.disabled = false;
  if (result.ok) {
    window.location.assign(result.data.termsNeeded ? '/terms' : '/');
    return;
  }
  form.elements.password.value = '';
  showMessage(message, result.message);
});
