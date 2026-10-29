-- G-09 migration 014 (specs/009-home-sessions/data-model.md; FR-904, FR-914): practice sessions (`sessions`
-- is the sign-in sessions table of G-01), one going per
-- account (the shared reviewer account's "last started wins"); the planned exercises as JSON.
CREATE TABLE practice_sessions (
  id INTEGER PRIMARY KEY,
  account_id INTEGER NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('time', 'topic', 'skill', 'mode')),
  minutes INTEGER CHECK (minutes BETWEEN 3 AND 60),
  params TEXT NOT NULL DEFAULT '{}',
  plan TEXT NOT NULL,
  at_index INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('going', 'finished', 'replaced')),
  started_at INTEGER NOT NULL,
  finished_at INTEGER
);
CREATE UNIQUE INDEX one_going_session ON practice_sessions (account_id) WHERE status = 'going';
CREATE INDEX practice_sessions_account ON practice_sessions (account_id, started_at);
