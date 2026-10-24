-- Security log and hourly availability checks (data-model.md; FR-023, FR-004).

CREATE TABLE security_log (
  id INTEGER PRIMARY KEY,
  at INTEGER NOT NULL,
  event TEXT NOT NULL,
  account_id INTEGER,
  email TEXT,
  ip TEXT,
  detail TEXT
);
CREATE INDEX security_log_at ON security_log (at);

CREATE TABLE availability_checks (
  at INTEGER NOT NULL,
  url TEXT NOT NULL,
  ok INTEGER NOT NULL CHECK (ok IN (0, 1))
);
CREATE INDEX availability_checks_at ON availability_checks (at);
