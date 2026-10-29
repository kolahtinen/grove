-- G-09 FR-916 (addendum 005, RQ-438): grove texts, belonging to no learner, imported at start-up from
-- server/library/grove-texts.json; a learner's copy of one names it.
CREATE TABLE library_texts (
  id TEXT PRIMARY KEY,
  level TEXT NOT NULL CHECK (level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  topic TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('reading', 'listening')),
  form TEXT NOT NULL,
  title TEXT NOT NULL,
  data TEXT NOT NULL
);
ALTER TABLE texts ADD COLUMN library_id TEXT;
CREATE INDEX texts_library ON texts (account_id, library_id);
