-- foreign-keys-off
-- G-09 migration 021 (specs/009-home-sessions/data-model.md; RQ-456, RQ-463): a sentence can be reported
-- as "not a name" from a name's word menu (G-03 FR-305, FR-315), and the starting level is offered once
-- (G-06 FR-605). reports is rebuilt for its new reason and keeps its ids and rows.

CREATE TABLE reports_new (
  id INTEGER PRIMARY KEY,
  account_id INTEGER NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  text_id INTEGER NOT NULL REFERENCES texts (id) ON DELETE CASCADE,
  question_position INTEGER,
  line_position INTEGER,
  reason TEXT NOT NULL CHECK (reason IN ('wrong_answer', 'bad_translation', 'unnatural', 'wrong_reading', 'audio', 'not_a_name', 'other')),
  note TEXT,
  status TEXT NOT NULL CHECK (status IN ('open', 'fixed')),
  created_at INTEGER NOT NULL,
  fixed_at INTEGER,
  CHECK ((question_position IS NULL) <> (line_position IS NULL)),
  UNIQUE (account_id, code)
);
INSERT INTO reports_new (id, account_id, code, text_id, question_position, line_position, reason, note, status, created_at, fixed_at)
  SELECT id, account_id, code, text_id, question_position, line_position, reason, note, status, created_at, fixed_at FROM reports;
DROP TABLE reports;
ALTER TABLE reports_new RENAME TO reports;

-- Home sends a new account to the starting level once; an account that has already seen Home (its welcome
-- closed) or made its choice counts as offered.
ALTER TABLE learner_settings ADD COLUMN start_offered INTEGER NOT NULL DEFAULT 0;
UPDATE learner_settings SET start_offered = 1 WHERE start_done = 1 OR welcome_dismissed = 1;
