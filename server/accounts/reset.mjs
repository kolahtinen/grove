// Password reset by email, with the same answer for any address (FR-015, RQ-372).
import { sendJson } from '../web/http.mjs';
import { FirebaseError } from '../firebase/client.mjs';
import { holdUntil, normaliseEmail } from './same-answer.mjs';
import { UNAVAILABLE_MESSAGE } from './signin.mjs';

export function createReset({ seclog, firebase, answerMinMs }) {
  return async function reset(ctx) {
    const started = Date.now();
    const email = normaliseEmail(ctx.body.email);
    let status = 200;
    let body = { result: 'sent_if_account' };
    if (/^[^\s@]+@[^\s@]+$/.test(email)) {
      try {
        await firebase.sendPasswordReset(email);
      } catch (error) {
        if (error instanceof FirebaseError && error.code === 'unavailable') {
          seclog.security('firebase_unreachable', { email, ip: ctx.ip });
          status = 503;
          body = { error: 'signin_unavailable', message: UNAVAILABLE_MESSAGE };
        }
      }
    }
    if (status === 200) seclog.security('reset_requested', { email, ip: ctx.ip });
    await holdUntil(started, answerMinMs);
    sendJson(ctx.res, status, body);
  };
}
