// Works out who is asking from the session only, and refuses what their role may not do
// (FR-011, FR-018, FR-019, constitution 2.3).
import { sendJson } from './http.mjs';

export function createGuard({ sessions }) {
  return {
    async attach(ctx) {
      ctx.session = sessions.lookup(ctx.cookies);
      ctx.account = ctx.session
        ? { id: ctx.session.account_id, email: ctx.session.email, isOwner: !!ctx.session.is_owner, isReviewer: !!ctx.session.is_reviewer }
        : null;
    },

    // Returns null when allowed, or a function that sends the refusal.
    check(access, ctx) {
      if (access === 'public') return null;
      if (!ctx.session) {
        return ctx.isApi
          ? () => sendJson(ctx.res, 401, { error: 'signed_out', message: 'Please sign in.' })
          : () => { ctx.res.writeHead(303, { location: '/signin' }); ctx.res.end(); };
      }
      if (access === 'signed_in') return null;
      if (!ctx.session.terms_agreed_at) {
        return ctx.isApi
          ? () => sendJson(ctx.res, 403, { error: 'terms_needed', message: 'Please agree to the terms first.' })
          : () => { ctx.res.writeHead(303, { location: '/terms' }); ctx.res.end(); };
      }
      if (access === 'agreed') return null;
      if (access === 'owner' && ctx.account.isOwner) return null;
      return () => sendJson(ctx.res, 403, { error: 'forbidden', message: 'That is not available to you.' });
    },
  };
}
