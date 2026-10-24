-- Accounts, sessions and settings (data-model.md).

CREATE TABLE accounts (
  id INTEGER PRIMARY KEY,
  firebase_uid TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  is_owner INTEGER NOT NULL DEFAULT 0 CHECK (is_owner IN (0, 1)),
  is_reviewer INTEGER NOT NULL DEFAULT 0 CHECK (is_reviewer IN (0, 1)),
  created_at INTEGER NOT NULL,
  CHECK (NOT (is_owner = 1 AND is_reviewer = 1))
);
CREATE UNIQUE INDEX one_owner ON accounts (is_owner) WHERE is_owner = 1;
CREATE UNIQUE INDEX one_reviewer ON accounts (is_reviewer) WHERE is_reviewer = 1;

CREATE TABLE sessions (
  id_hash TEXT PRIMARY KEY,
  account_id INTEGER NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
  csrf_token TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  terms_agreed_at INTEGER,
  age_confirmed_at INTEGER
);
CREATE INDEX sessions_account ON sessions (account_id);

CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
