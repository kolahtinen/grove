# Contract: grove's HTTP interface (G-01)

Served on `127.0.0.1:<PORT>` only; reached by learners through the quick tunnel over HTTPS.

## Rules for every response

- Headers: `Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, `Strict-Transport-Security: max-age=31536000`, `Cache-Control: no-store` on `/api/*`.
- Errors are JSON `{ "error": "<code>", "message": "<plain sentence>" }` with no internal detail (constitution 2.5).
- Request bodies over 100 KB → `413 too_large` (FR-022). JSON only, strict schemas; unknown fields → `400 bad_request`.
- Non-GET requests need a matching CSRF token in `X-CSRF-Token` and a same-origin `Origin`, else `403 csrf`.
- Signed-out requests to anything but the public pages and public API → pages redirect `303` to `/signin`; API returns `401 signed_out` (FR-019).

## Pages (static HTML)

| Path | Who | Notes |
|---|---|---|
| `/signin`, `/signup`, `/reset`, `/terms` | anyone | public (FR-019) |
| `/` | signed in | home: header with email and Sign out, empty grove |
| `/assets/*`, `/fonts/*` | anyone | CSS, JS modules, fonts, logo; only files the public pages need are public |

## Public API

| Method, path | Body | Responses |
|---|---|---|
| `GET /api/csrf` | – | `200 {csrf}` and sets the pre-session CSRF cookie |
| `POST /api/signup` | `{code: string ≤64, email: string ≤254, password: string 8–128, agreeTerms: true, confirmAge13: true}` | `200 {result:"done"}` for every accepted sign-up, new or taken address (FR-012) · `400 password_rule` · `400 agreement_needed` · `400 invitation_invalid` (wrong, used up or missing code) · `429 too_many_signups` (FR-021) · `503 signin_unavailable` (Firebase down) |
| `POST /api/signin` | `{email, password}` | `200 {result:"signed_in"}` + session cookie · `401 wrong_credentials` (wrong password, unknown address, or locked, all identical, FR-020) · `503 signin_unavailable` |
| `POST /api/reset` | `{email}` | `200 {result:"sent_if_account"}` always for a well-formed address (FR-015) · `503 signin_unavailable` |

Sign-up, sign-in and reset responses are held to at least 1.2 s (research R5).

Note on `invitation_invalid`: it is checked before the address is looked at, so it reveals nothing about addresses.

## Signed-in API

| Method, path | Body | Responses |
|---|---|---|
| `GET /api/me` | – | `200 {email, roles:["learner", ("reviewer"|"owner")...], csrf}` |
| `POST /api/signout` | `{}` | `200 {result:"signed_out"}`, session deleted, cookie cleared |

Every signed-in endpoint gets the account from the session only; no endpoint takes an account ID from the client (FR-018). Later goals add learner-data endpoints under the same rule.
