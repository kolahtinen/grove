# Contract: grove's HTTP interface (G-01)

Served on `127.0.0.1:<PORT>` only; reached by learners through the quick tunnel over HTTPS. There is no sign-up in the first build (question-pages/55).

## Rules for every response

- Headers: `Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, `Strict-Transport-Security: max-age=31536000`, `Cache-Control: no-store` on `/api/*`.
- Errors are JSON `{ "error": "<code>", "message": "<plain sentence>" }` with no internal detail (constitution 2.5).
- Request bodies over 100 KB → `413 too_large` (FR-022). JSON only, strict schemas; unknown fields → `400 bad_request`.
- Non-GET requests need a matching CSRF token in `X-CSRF-Token` and a same-origin `Origin`, else `403 csrf`.
- Signed-out requests to anything but the public pages and public API → pages redirect `303` to `/signin`; API returns `401 signed_out` (FR-019).
- Order: the CSRF check first, then the access rule; the body is read only for an allowed request. A refused request with a body is answered with `Connection: close` and its body is never read (FR-022).
- Signed-in requests from a session that hasn't agreed to the terms, to anything but `/terms`, `GET /api/me`, `POST /api/agree` and `POST /api/signout` → pages redirect `303` to `/terms`; API returns `403 terms_needed` (FR-011).

## Pages (static HTML)

| Path | Who | Notes |
|---|---|---|
| `/signin`, `/reset`, `/terms` | anyone | public (FR-019); `/terms` shows the two boxes and the Agree button to a signed-in session that hasn't agreed |
| `/` | signed in, agreed | home: header with email and Sign out, empty grove |
| `/assets/*`, `/fonts/*` | anyone | CSS, JS modules, fonts, logo; only files the public pages need are public |
| `/health` | anyone | `200 ok` text; used by the hourly availability check |

## Public API

| Method, path | Body | Responses |
|---|---|---|
| `GET /api/csrf` | – | `200 {csrf}` and sets the pre-session CSRF cookie |
| `POST /api/signin` | `{email: string ≤254, password: string ≤128}` | `200 {result:"signed_in", termsNeeded:true}` + session cookie · `401 wrong_credentials` (wrong password, unknown address, or locked, all identical, FR-020) · `503 signin_unavailable` (Firebase unreachable or its answer unusable; not counted toward the lockout, FR-020) |
| `POST /api/reset` | `{email: string ≤254}` | `200 {result:"sent_if_account"}` always for a well-formed address (FR-015) · `503 signin_unavailable` (Firebase unreachable or its answer unusable) |

Sign-in and reset responses are held to at least 1.2 s (research R5).

## Signed-in API

| Method, path | Body | Responses |
|---|---|---|
| `GET /api/me` | – | `200 {email, roles:["learner", ("reviewer"|"owner")], termsAgreed: bool, csrf}` |
| `POST /api/agree` | `{agreeTerms: true, confirmAge13: true}` | `200 {result:"agreed"}`, both times recorded on the session · `400 agreement_needed` if either is missing or false |
| `POST /api/signout` | `{}` | `200 {result:"signed_out"}`, session deleted, cookie cleared |

Every signed-in endpoint gets the account from the session only; no endpoint takes an account ID from the client (FR-018). Later goals add learner-data endpoints under the same rule.
