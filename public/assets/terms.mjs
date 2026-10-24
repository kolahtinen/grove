// The terms page; for a new sign-in, the two boxes and the Agree button (FR-011).
import { post, showMessage } from './api.mjs';
import { showAccount } from './page.mjs';

const me = await showAccount();
const section = document.getElementById('agreement');

if (me && !me.termsAgreed) {
  section.hidden = false;
  const form = document.getElementById('agree');
  const button = form.querySelector('button');
  const boxes = [form.elements.agreeTerms, form.elements.confirmAge13];
  const update = () => { button.disabled = !boxes.every((box) => box.checked); };
  boxes.forEach((box) => box.addEventListener('change', update));
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const result = await post('/api/agree', { agreeTerms: boxes[0].checked, confirmAge13: boxes[1].checked });
    if (result.ok) window.location.assign('/');
    else showMessage(section.querySelector('.message'), result.message);
  });
}
