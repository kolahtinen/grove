// Agreeing to the terms and confirming being 13 or over before grove opens on a device (FR-011,
// constitution 3.1 2.0.0): the agreement is recorded with the terms version and the device, and the
// device cookie is set (or renewed), so later sign-ins on it go straight in until the terms change.
import { sendJson, HttpError } from '../web/http.mjs';
import { DEVICE_COOKIE } from './terms.mjs';

export function createAgree({ seclog, sessions, terms }) {
  return function agree(ctx) {
    if (ctx.body.agreeTerms !== true || ctx.body.confirmAge13 !== true) {
      throw new HttpError(400, 'agreement_needed', 'Please tick both boxes to continue.');
    }
    const agreement = terms.record(ctx.account.id, ctx.cookies[DEVICE_COOKIE]);
    sessions.agree(ctx.session.id_hash, agreement.id);
    seclog.security('terms_agreed', { accountId: ctx.account.id, ip: ctx.ip });
    sendJson(ctx.res, 200, { result: 'agreed' }, { 'set-cookie': agreement.cookie });
  };
}
