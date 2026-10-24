-- Failed sign-ins per address entered, for the 15-minute lockout (data-model.md; FR-020).

CREATE TABLE failed_signins (
  email TEXT PRIMARY KEY,
  failures INTEGER NOT NULL,
  locked_until INTEGER,
  updated_at INTEGER NOT NULL
);
