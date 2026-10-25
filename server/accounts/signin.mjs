// Sign-in, sign-out and "who am I" (FR-009, FR-012, FR-013, FR-014, FR-020; contracts/http-api.md).
import { sendJson, HttpError } from '../web/http.mjs';
import { FirebaseError } from '../firebase/client.mjs';
import { holdUntil, normaliseEmail } from './same-answer.mjs';

const WRONG = { error: 'wrong_credentials', message: 'Wrong email or password.' };
export const UNAVAILABLE_MESSAGE = 'Signing in isn’t possible right now. Please try again in a while.';

export function rolesOf(account) {
  return ['learner', ...(account.isReviewer ? ['reviewer'] : []), ...(account.isOwner ? ['owner'] : [])];
}

export function createSignin({ db, seclog, firebase, sessions, lockout, answerMinMs, now }) {
  const findByUid = db.prepare('SELECT id FROM accounts WHERE firebase_uid = ?');

  return {
    async signIn(ctx) {
      const started = Date.now();
      const email = normaliseEmail(ctx.body.email);
      const answer = async (status, body, headers) => {
        await holdUntil(started, answerMinMs);
        sendJson(ctx.res, status, body, headers);
      };

      if (lockout?.isLocked(email)) {
        seclog.security('signin_failed', { email, ip: ctx.ip, detail: { reason: 'locked' } });
        return answer(401, WRONG);
      }
      let uid;
      try {
        ({ uid } = await firebase.signIn(email, ctx.body.password));
      } catch (error) {
        // Only a wrong password counts toward the lockout; anything else is Firebase's fault (FR-020).
        if (error instanceof FirebaseError && error.code === 'wrong_credentials') {
          lockout?.recordFailure(email, ctx.ip);
          seclog.security('signin_failed', { email, ip: ctx.ip, detail: { reason: 'wrong_credentials' } });
          return answer(401, WRONG);
        }
        const reason = error instanceof FirebaseError && error.code === 'unavailable' ? 'unavailable' : 'bad_answer';
        seclog.security('firebase_unreachable', { email, ip: ctx.ip, detail: { reason } });
        return answer(503, { error: 'signin_unavailable', message: UNAVAILABLE_MESSAGE });
      }
      const account = findByUid.get(uid);
      if (!account) {
        lockout?.recordFailure(email, ctx.ip);
        seclog.security('signin_failed', { email, ip: ctx.ip, detail: { reason: 'no_account' } });
        return answer(401, WRONG);
      }
      lockout?.recordSuccess(email);
      const session = sessions.create(account.id);
      seclog.security('signin', { accountId: account.id, ip: ctx.ip });
      return answer(200, { result: 'signed_in', termsNeeded: true }, { 'set-cookie': session.cookie });
    },

    me(ctx) {
      sendJson(ctx.res, 200, {
        email: ctx.account.email,
        roles: rolesOf(ctx.account),
        termsAgreed: !!ctx.session.terms_agreed_at,
        csrf: ctx.session.csrf_token,
      });
    },

    signOut(ctx) {
      sessions.destroy(ctx.session.id_hash);
      seclog.security('signout', { accountId: ctx.account.id, ip: ctx.ip });
      sendJson(ctx.res, 200, { result: 'signed_out' }, { 'set-cookie': sessions.clearCookie() });
    },

    csrf(ctx) {
      const pre = sessions.preSession();
      sendJson(ctx.res, 200, { csrf: pre.token }, { 'set-cookie': pre.cookie });
    },
  };
}

export { HttpError };
