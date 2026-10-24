// Registers the accounts module's API routes (contracts/http-api.md).
import { createSignin } from './signin.mjs';
import { createAgree } from './agree.mjs';
import { createReset } from './reset.mjs';

const AGREEMENT_MISSING = { missingCode: 'agreement_needed', missingMessage: 'Please tick both boxes to continue.' };

export function registerAccountRoutes(router, { config, db, seclog, firebase, sessions, now }) {
  const signin = createSignin({ db, seclog, firebase, sessions, answerMinMs: config.answerMinMs, now });
  const agree = createAgree({ seclog, sessions });
  const reset = createReset({ seclog, firebase, answerMinMs: config.answerMinMs });

  router.add({ method: 'GET', path: '/api/csrf', access: 'public', handler: signin.csrf });
  router.add({
    method: 'POST',
    path: '/api/signin',
    access: 'public',
    schema: { email: { type: 'string', min: 1, max: 254 }, password: { type: 'string', min: 1, max: 128 } },
    handler: signin.signIn,
  });
  router.add({ method: 'GET', path: '/api/me', access: 'signed_in', handler: signin.me });
  router.add({ method: 'POST', path: '/api/signout', access: 'signed_in', schema: {}, handler: signin.signOut });
  router.add({
    method: 'POST',
    path: '/api/agree',
    access: 'signed_in',
    schema: { agreeTerms: { type: 'boolean', ...AGREEMENT_MISSING }, confirmAge13: { type: 'boolean', ...AGREEMENT_MISSING } },
    handler: agree,
  });
  router.add({
    method: 'POST',
    path: '/api/reset',
    access: 'public',
    schema: { email: { type: 'string', min: 1, max: 254 } },
    handler: reset,
  });
}
