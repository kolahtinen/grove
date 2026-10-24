-- G-02: the learner's words, packages, exchanges, texts and ratings (specs/002-texts-from-own-ai/data-model.md).
-- Every table has account_id, so the owner's export and delete commands cover it.

CREATE TABLE words (
  id INTEGER PRIMARY KEY,
  account_id INTEGER NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
  lemma TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('word', 'phrase')),
  en TEXT,
  explain_sv TEXT,
  state TEXT NOT NULL CHECK (state IN ('leaf', 'ground')),
  uses INTEGER NOT NULL DEFAULT 0,
  added_at INTEGER NOT NULL,
  fallen_at INTEGER,
  source_text_id INTEGER REFERENCES texts (id) ON DELETE SET NULL,
  UNIQUE (account_id, lemma, kind)
);
CREATE INDEX words_state ON words (account_id, state);

CREATE TABLE word_forms (
  account_id INTEGER NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
  form TEXT NOT NULL,
  word_id INTEGER NOT NULL REFERENCES words (id) ON DELETE CASCADE,
  PRIMARY KEY (account_id, form, word_id)
);

CREATE TABLE learner_settings (
  account_id INTEGER PRIMARY KEY REFERENCES accounts (id) ON DELETE CASCADE,
  topic TEXT,
  topics_used TEXT NOT NULL DEFAULT '[]',
  target_share REAL NOT NULL DEFAULT 95 CHECK (target_share BETWEEN 93 AND 98),
  firm_new INTEGER NOT NULL DEFAULT 0,
  shorter INTEGER NOT NULL DEFAULT 0,
  high_streak INTEGER NOT NULL DEFAULT 0,
  last_summary_at INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE packages (
  id INTEGER PRIMARY KEY,
  account_id INTEGER NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
  parts_total INTEGER NOT NULL DEFAULT 3,
  parts_accepted INTEGER NOT NULL DEFAULT 0 CHECK (parts_accepted <= parts_total),
  status TEXT NOT NULL CHECK (status IN ('open', 'finished', 'closed')),
  created_at INTEGER NOT NULL
);
CREATE UNIQUE INDEX one_open_package ON packages (account_id) WHERE status = 'open';

CREATE TABLE exchanges (
  id INTEGER PRIMARY KEY,
  account_id INTEGER NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
  package_id INTEGER NOT NULL REFERENCES packages (id) ON DELETE CASCADE,
  part_no INTEGER NOT NULL CHECK (part_no BETWEEN 1 AND 3),
  kind TEXT NOT NULL CHECK (kind IN ('part', 'fix', 'meanings')),
  code TEXT NOT NULL,
  carries_summary INTEGER NOT NULL DEFAULT 0,
  fixes_id INTEGER REFERENCES exchanges (id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('waiting', 'needs_fix', 'accepted', 'replaced')),
  answer_hash TEXT,
  created_at INTEGER NOT NULL,
  answered_at INTEGER
);
CREATE INDEX exchanges_account ON exchanges (account_id, status);

CREATE TABLE texts (
  id INTEGER PRIMARY KEY,
  account_id INTEGER NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
  exchange_id INTEGER NOT NULL REFERENCES exchanges (id) ON DELETE CASCADE,
  package_id INTEGER NOT NULL REFERENCES packages (id) ON DELETE CASCADE,
  part_no INTEGER NOT NULL,
  position INTEGER NOT NULL,
  title TEXT NOT NULL,
  topic TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  read_at INTEGER
);
CREATE INDEX texts_account ON texts (account_id, created_at);

CREATE TABLE text_lines (
  account_id INTEGER NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
  text_id INTEGER NOT NULL REFERENCES texts (id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  sv TEXT NOT NULL,
  en TEXT NOT NULL,
  PRIMARY KEY (text_id, position)
);

CREATE TABLE questions (
  account_id INTEGER NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
  text_id INTEGER NOT NULL REFERENCES texts (id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  q TEXT NOT NULL,
  options TEXT NOT NULL,
  answer INTEGER NOT NULL,
  PRIMARY KEY (text_id, position)
);

CREATE TABLE sentences (
  id INTEGER PRIMARY KEY,
  account_id INTEGER NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
  text_id INTEGER NOT NULL REFERENCES texts (id) ON DELETE CASCADE,
  line_position INTEGER NOT NULL,
  position INTEGER NOT NULL,
  sv TEXT NOT NULL,
  new_items TEXT NOT NULL DEFAULT '[]'
);
CREATE INDEX sentences_text ON sentences (text_id);

CREATE TABLE ratings (
  account_id INTEGER NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
  text_id INTEGER NOT NULL REFERENCES texts (id) ON DELETE CASCADE,
  value TEXT NOT NULL CHECK (value IN ('almost_nothing', 'a_little', 'about_half', 'most', 'everything')),
  at INTEGER NOT NULL,
  UNIQUE (account_id, text_id)
);

CREATE TABLE question_answers (
  account_id INTEGER NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
  text_id INTEGER NOT NULL REFERENCES texts (id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  option INTEGER NOT NULL,
  right INTEGER NOT NULL CHECK (right IN (0, 1)),
  at INTEGER NOT NULL,
  UNIQUE (account_id, text_id, position)
);
