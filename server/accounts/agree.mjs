// Each new sign-in agrees to the terms and confirms being 13 or over before grove opens
// (FR-011, constitution 3.1).
import { sendJson, HttpError } from '../web/http.mjs';

export function createAgree({ seclog, sessions }) {
  return function agree(ctx) {
    if (ctx.body.agreeTerms !== true || ctx.body.confirmAge13 !== true) {
      throw new HttpError(400, 'agreement_needed', 'Please tick both boxes to continue.');
    }
    sessions.agree(ctx.session.id_hash);
    seclog.security('terms_agreed', { accountId: ctx.account.id, ip: ctx.ip });
    sendJson(ctx.res, 200, { result: 'agreed' });
  };
}
