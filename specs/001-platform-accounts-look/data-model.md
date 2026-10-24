# Data model: G-01

One SQLite database (`data/grove.db`), created and changed only by numbered migrations (`server/store/migrations/NNN-*.sql`, constitution 4.13). WAL mode with `synchronous = FULL`, so a save grove has confirmed survives a power cut (FR-002). Times are UTC milliseconds since 1970 (`INTEGER`). Email addresses are stored normalised (trimmed, lower-cased).

"Grove's settings on the owner's computer" (RQ-146, FR-016) are this database plus the environment files of research R11: the owner is the one account with `is_owner = 1`.

## accounts (spec: Account, Role)

| Field | Type | Rules |
|---|---|---|
| id | INTEGER PK | grove's own ID, used in every learner-data table later |
| firebase_uid | TEXT UNIQUE NOT NULL | from Firebase when the owner command creates the account |
| email | TEXT UNIQUE NOT NULL | normalised |
| is_owner | INTEGER 0/1 | at most one row with 1 (partial unique index); set only by `owner:setup` (FR-016) |
| is_reviewer | INTEGER 0/1 | at most one row with 1 (partial unique index); set only by `reviewer:setup` (FR-010) |
| created_at | INTEGER NOT NULL | |

Every account is a learner (FR-008); `is_owner` and `is_reviewer` add to that and never both on one row (CHECK). Roles are worked out per request: no session → signed-out visitor; otherwise learner, plus the reviewer or owner flag.

Lifecycle: created by an owner command → exists → deleted by `learner:delete` (row and every row that references it, and the Firebase user, FR-017).

## sessions (spec: Session)

| Field | Type | Rules |
|---|---|---|
| id_hash | TEXT PK | SHA-256 of the cookie value |
| account_id | INTEGER NOT NULL → accounts.id ON DELETE CASCADE | |
| csrf_token | TEXT NOT NULL | 32 random bytes, base64url |
| created_at | INTEGER NOT NULL | |
| expires_at | INTEGER NOT NULL | created_at + 30 days (FR-013) |
| terms_agreed_at | INTEGER NULL | set when this sign-in agrees to the terms (FR-011) |
| age_confirmed_at | INTEGER NULL | set with terms_agreed_at (13 or over) |

A session with `terms_agreed_at` NULL reaches only the terms, the agreement and sign-out (FR-011). Ended by sign-out (row deleted), expiry (removed by the hourly job), or account deletion (cascade). Not ended by a password reset.

## failed_signins (spec: Failed sign-in counter)

| Field | Type | Rules |
|---|---|---|
| email | TEXT PK | normalised address entered, account or not |
| failures | INTEGER NOT NULL | failures in a row; reset to 0 on success |
| locked_until | INTEGER NULL | set to now + 15 min on the 5th failure (FR-020) |
| updated_at | INTEGER NOT NULL | rows idle for 1 hour are removed |

## security_log (spec: Security log entry)

| Field | Type | Rules |
|---|---|---|
| id | INTEGER PK | |
| at | INTEGER NOT NULL | |
| event | TEXT NOT NULL | one of: `account_created`, `signin`, `signin_failed`, `lockout`, `terms_agreed`, `reset_requested`, `signout`, `owner_setup`, `export`, `delete`, `firebase_unreachable` |
| account_id | INTEGER NULL | when known (no foreign key, so entries outlive deletions for 30 days) |
| email | TEXT NULL | the address entered, when no account is known |
| ip | TEXT NULL | client address from `CF-Connecting-IP`, else the socket |
| detail | TEXT NULL | allow-listed fields only (`role`, `reason`, `count`); never passwords, tokens or request bodies (FR-023) |

Rows older than 30 days are deleted by the hourly job.

## availability_checks (spec: Availability check)

| Field | Type | Rules |
|---|---|---|
| at | INTEGER NOT NULL | |
| url | TEXT NOT NULL | the README link checked |
| ok | INTEGER 0/1 | grove answered with its health response within 10 s (FR-004, Q-06) |

Rows older than 30 days are deleted by the hourly job.

## settings (spec: Settings)

Key–value table: `tunnel_url` (current link), `tunnel_url_published_at`. Paths (data folder, backup folder) and secrets come from the environment, not this table.

## Not in the database

- Passwords: only in Firebase (FR-009).
- Backups: `<backup dir>/grove-YYYYMMDD-HH.db`, last 48 kept (FR-003).
- App log: `data/logs/YYYY-MM-DD.jsonl`, 30 days (research R12). The systemd units send grove's and cloudflared's output to journald with a 30-day limit (research R12).
