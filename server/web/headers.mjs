// Security headers on every response (FR-024, contracts/http-api.md, constitution 4.4, 4.6).

export const CSP = "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; "
  + "connect-src 'self'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'";

export function setSecurityHeaders(res, { isApi }) {
  res.setHeader('content-security-policy', CSP);
  res.setHeader('x-content-type-options', 'nosniff');
  res.setHeader('referrer-policy', 'no-referrer');
  res.setHeader('strict-transport-security', 'max-age=31536000');
  res.setHeader('cross-origin-opener-policy', 'same-origin');
  if (isApi) res.setHeader('cache-control', 'no-store');
}
