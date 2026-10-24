-- G-04 (specs/004-ground-drilling-progress/data-model.md): marks and schedules on items, review
-- answers, input minutes, level word lists, and the welcome setting.

ALTER TABLE words ADD COLUMN to_read INTEGER NOT NULL DEFAULT 0;
ALTER TABLE words ADD COLUMN to_remember INTEGER NOT NULL DEFAULT 0;
ALTER TABLE words ADD COLUMN drilled INTEGER NOT NULL DEFAULT 0;
ALTER TABLE words ADD COLUMN gap_days REAL;
ALTER TABLE words ADD COLUMN last_review_at INTEGER;
ALTER TABLE words ADD COLUMN reviews INTEGER NOT NULL DEFAULT 0;
ALTER TABLE words ADD COLUMN fell_marks TEXT;
CREATE INDEX words_drilled ON words (account_id, drilled);

CREATE TABLE review_answers (
  account_id INTEGER NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
  word_id INTEGER NOT NULL REFERENCES words (id) ON DELETE CASCADE,
  mode TEXT NOT NULL CHECK (mode IN ('read', 'remember', 'master', 'recall', 'fall_check')),
  right INTEGER NOT NULL CHECK (right IN (0, 1)),
  at INTEGER NOT NULL
);
CREATE INDEX review_answers_word ON review_answers (word_id);

CREATE TABLE input_days (
  account_id INTEGER NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
  day TEXT NOT NULL,
  seconds INTEGER NOT NULL DEFAULT 0 CHECK (seconds BETWEEN 0 AND 57600),
  PRIMARY KEY (account_id, day)
);

CREATE TABLE level_words (
  level TEXT NOT NULL CHECK (level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  lemma TEXT NOT NULL,
  PRIMARY KEY (level, lemma)
);

ALTER TABLE learner_settings ADD COLUMN welcome_dismissed INTEGER NOT NULL DEFAULT 0;
