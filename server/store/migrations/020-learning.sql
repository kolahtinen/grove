-- G-09 migration 020 (specs/009-home-sessions/data-model.md; B-24…B-26, FR-905, FR-928…FR-931): grove's
-- learning content, belonging to no learner, imported at start-up from server/learning/learning-content.json;
-- what each learner has been shown or has met; reports on items for the owner. No row changes.
CREATE TABLE learning_items (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('pattern', 'phrase', 'word')),
  level TEXT NOT NULL CHECK (level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  position INTEGER NOT NULL,
  data TEXT NOT NULL
);
CREATE INDEX learning_items_type ON learning_items (type, level, position);

CREATE TABLE learning_seen (
  account_id INTEGER NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  first_at INTEGER NOT NULL,
  last_at INTEGER NOT NULL,
  PRIMARY KEY (account_id, item_id)
);

CREATE TABLE learning_reports (
  id INTEGER PRIMARY KEY,
  account_id INTEGER NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('wrong_meaning', 'bad_translation', 'unnatural', 'wrong_mark', 'audio', 'other')),
  note TEXT CHECK (note IS NULL OR length(note) <= 200),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_at INTEGER NOT NULL
);
CREATE INDEX learning_reports_open ON learning_reports (status, created_at);
