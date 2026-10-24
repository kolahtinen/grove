-- G-06 (specs/006-starting-level/data-model.md): level words with source and licence, the sources
-- for the credits page, where a ground word came from, and the starting check's choice.

ALTER TABLE level_words ADD COLUMN kind TEXT NOT NULL DEFAULT 'word';
ALTER TABLE level_words ADD COLUMN wpm REAL;
ALTER TABLE level_words ADD COLUMN source TEXT;
ALTER TABLE level_words ADD COLUMN licence TEXT;

CREATE TABLE sources (
  name TEXT PRIMARY KEY,
  licence TEXT NOT NULL,
  url TEXT
);

ALTER TABLE words ADD COLUMN origin TEXT;

ALTER TABLE learner_settings ADD COLUMN start_level TEXT;
ALTER TABLE learner_settings ADD COLUMN start_done INTEGER NOT NULL DEFAULT 0;
ALTER TABLE learner_settings ADD COLUMN start_at INTEGER;
