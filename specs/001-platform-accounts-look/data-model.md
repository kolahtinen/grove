# Data model: G-01

One SQLite database (`data/grove.db`), created and changed only by numbered migrations (`server/store/migrations/NNN-*.sql`, constitution 4.13). Times are UTC milliseconds since 1970 (`INTEGER`). Email addresses are stored normalised (trimmed, lower-cased).

## accounts (spec: Account, Role)

| Field | Type | Rules |
|---|---|---|
| id | INTEGER PK | grove's own ID, used in every learner-data table later |
| firebase_uid | TEXT UNIQUE NOT NULL | from a verified ID token's `sub` |
| email | TEXT UNIQUE NOT NULL | normalised |
| is_owner | INTEGER 0/1 | at most one row with 1 (partial unique index); set only by the setup command (FR-016) |
| is_reviewer | INTEGER 0/1 | from the invitation used |
| invitation_id | INTEGER NULL → invitations.id | NULL for the owner |
| terms_agreed_at | INTEGER NOT NULL | FR-011 |
| age_confirmed_at | INTEGER NOT NULL | FR-011 (13 or over) |
| created_at | INTEGER NOT NULL | |

Every account is a learner (FR-008); `is_owner` and `is_reviewer` add to that. Roles are worked out per request: no session → signed-out visitor; otherwise learner, plus reviewer/owner flags.

Lifecycle: created by sign-up (or the setup command) → exists → deleted by the owner's delete command (row and every row that references it, and the Firebase user, FR-017).

## invitations (spec: Invitation)

| Field | Type | Rules |
|---|---|---|
| id | INTEGER PK | |
| label | TEXT UNIQUE NOT NULL | shown in the security log instead of the code |
| code_hash | TEXT UNIQUE NOT NULL | SHA-256 of the code; the code itself is only in the README and shown once to the owner |
| gives_reviewer | INTEGER 0/1 | 1 for the reviewer code |
| uses_allowed | INTEGER NOT NULL | 1–5 for a reviewer code (RQ-368) |
| uses_taken | INTEGER NOT NULL DEFAULT 0 | ≤ uses_allowed; reserved in a transaction before Firebase sign-up, released if no account is made |
| active | INTEGER 0/1 | a replaced code becomes inactive |
| created_at | INTEGER NOT NULL | |

## sessions (spec: Session)

| Field | Type | Rules |
|---|---|---|
| id_hash | TEXT PK | SHA-256 of the cookie value |
| account_id | INTEGER NOT NULL → accounts.id ON DELETE CASCADE | |
| csrf_token | TEXT NOT NULL | 32 random bytes, base64url |
| created_at | INTEGER NOT NULL | |
| expires_at | INTEGER NOT NULL | created_at + 30 days (FR-013) |

Ended by sign-out (row deleted), expiry (removed by the hourly job), or account deletion (cascade). Not ended by a password reset.

## failed_signins (spec: Failed sign-in counter)

| Field | Type | Rules |
|---|---|---|
| email | TEXT PK | normalised address entered, account or not |
| failures | INTEGER NOT NULL | failures in a row; reset to 0 on success |
| locked_until | INTEGER NULL | set to now + 15 min on the 5th failure (FR-020) |
| updated_at | INTEGER NOT NULL | rows idle for 1 hour are removed |

## signup_attempts (spec: Sign-up counter)

| Field | Type | Rules |
|---|---|---|
| ip | TEXT NOT NULL | client address (research R9) |
| at | INTEGER NOT NULL | one row per attempt; rows older than 1 hour removed; >10 in the last hour → refuse (FR-021) |

## security_log (spec: Security log entry)

| Field | Type | Rules |
|---|---|---|
| id | INTEGER PK | |
| at | INTEGER NOT NULL | |
| event | TEXT NOT NULL | one of: `signup`, `signup_refused`, `signin`, `signin_failed`, `lockout`, `reset_requested`, `signout`, `owner_setup`, `invitation_set`, `export`, `delete`, `firebase_unreachable` |
| account_id | INTEGER NULL | when known (no foreign key, so entries outlive deletions for 30 days) |
| email | TEXT NULL | the address entered, when no account is known |
| ip | TEXT NULL | |
| detail | TEXT NULL | allow-listed fields only, e.g. the invitation label; never passwords, tokens, codes or pasted text (FR-023) |

Rows older than 30 days are deleted by the hourly job.

## settings (spec: Settings)

Key–value table: `tunnel_url` (current link), `tunnel_url_published_at`. The owner is the account with `is_owner = 1`, created only by the setup command. Paths (data folder, backup folder) and secrets come from the environment, not this table.

## Not in the database

- Passwords: only in Firebase (FR-009).
- Backups: `<backup dir>/grove-YYYYMMDD-HH.db`, last 48 kept (FR-003).
- App log: `data/logs/YYYY-MM-DD.jsonl`, 30 days (research R12).
