-- foreign-keys-off
-- G-03 (specs/003-reading-word-menu/data-model.md): patterns as items, own texts, package-less
-- exchanges, and the reading tables. Rebuilt tables keep their ids.

CREATE TABLE words_new (
  id INTEGER PRIMARY KEY,
  account_id INTEGER NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
  lemma TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('word', 'phrase', 'pattern')),
  en TEXT,
  explain_sv TEXT,
  state TEXT NOT NULL CHECK (state IN ('leaf', 'ground')),
  uses INTEGER NOT NULL DEFAULT 0,
  added_at INTEGER NOT NULL,
  fallen_at INTEGER,
  source_text_id INTEGER REFERENCES texts (id) ON DELETE SET NULL,
  UNIQUE (account_id, lemma, kind)
);
INSERT INTO words_new SELECT id, account_id, lemma, kind, en, explain_sv, state, uses, added_at, fallen_at, source_text_id FROM words;
DROP TABLE words;
ALTER TABLE words_new RENAME TO words;
CREATE INDEX words_state ON words (account_id, state);

CREATE TABLE exchanges_new (
  id INTEGER PRIMARY KEY,
  account_id INTEGER NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
  package_id INTEGER REFERENCES packages (id) ON DELETE CASCADE,
  part_no INTEGER CHECK (part_no BETWEEN 1 AND 3),
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
INSERT INTO exchanges_new SELECT id, account_id, package_id, part_no, kind, code, carries_summary, fixes_id, prompt, status, answer_hash, created_at, answered_at FROM exchanges;
DROP TABLE exchanges;
ALTER TABLE exchanges_new RENAME TO exchanges;
CREATE INDEX exchanges_account ON exchanges (account_id, status);

CREATE TABLE texts_new (
  id INTEGER PRIMARY KEY,
  account_id INTEGER NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
  exchange_id INTEGER REFERENCES exchanges (id) ON DELETE CASCADE,
  package_id INTEGER REFERENCES packages (id) ON DELETE CASCADE,
  part_no INTEGER,
  position INTEGER NOT NULL,
  title TEXT NOT NULL,
  topic TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  read_at INTEGER,
  own INTEGER NOT NULL DEFAULT 0 CHECK (own IN (0, 1))
);
INSERT INTO texts_new (id, account_id, exchange_id, package_id, part_no, position, title, topic, created_at, read_at)
  SELECT id, account_id, exchange_id, package_id, part_no, position, title, topic, created_at, read_at FROM texts;
DROP TABLE texts;
ALTER TABLE texts_new RENAME TO texts;
CREATE INDEX texts_account ON texts (account_id, created_at);

CREATE TABLE word_meanings (
  account_id INTEGER NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
  word_id INTEGER NOT NULL REFERENCES words (id) ON DELETE CASCADE,
  text_id INTEGER NOT NULL REFERENCES texts (id) ON DELETE CASCADE,
  en TEXT NOT NULL,
  PRIMARY KEY (word_id, text_id)
);

CREATE TABLE pattern_places (
  account_id INTEGER NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
  word_id INTEGER NOT NULL REFERENCES words (id) ON DELETE CASCADE,
  text_id INTEGER NOT NULL REFERENCES texts (id) ON DELETE CASCADE,
  line_position INTEGER NOT NULL,
  words TEXT NOT NULL
);
CREATE INDEX pattern_places_text ON pattern_places (text_id);

CREATE TABLE names (
  account_id INTEGER NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  lower TEXT NOT NULL,
  text_id INTEGER REFERENCES texts (id) ON DELETE SET NULL,
  UNIQUE (account_id, lower)
);

CREATE TABLE explain_flags (
  id INTEGER PRIMARY KEY,
  account_id INTEGER NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  form TEXT NOT NULL,
  lemma TEXT,
  text_id INTEGER NOT NULL REFERENCES texts (id) ON DELETE CASCADE,
  sentence_id INTEGER NOT NULL REFERENCES sentences (id) ON DELETE CASCADE,
  reason TEXT NOT NULL CHECK (reason IN ('why_form', 'why_here', 'other_meaning', 'reading', 'other')),
  note TEXT,
  status TEXT NOT NULL CHECK (status IN ('open', 'answered')),
  created_at INTEGER NOT NULL,
  answered_at INTEGER,
  UNIQUE (account_id, code)
);

CREATE TABLE explanations (
  id INTEGER PRIMARY KEY,
  account_id INTEGER NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
  flag_id INTEGER REFERENCES explain_flags (id) ON DELETE SET NULL,
  form TEXT NOT NULL,
  lemma TEXT,
  explain_en TEXT NOT NULL,
  at INTEGER NOT NULL
);

CREATE TABLE reports (
  id INTEGER PRIMARY KEY,
  account_id INTEGER NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  text_id INTEGER NOT NULL REFERENCES texts (id) ON DELETE CASCADE,
  question_position INTEGER,
  line_position INTEGER,
  reason TEXT NOT NULL CHECK (reason IN ('wrong_answer', 'bad_translation', 'unnatural', 'wrong_reading', 'audio', 'other')),
  note TEXT,
  status TEXT NOT NULL CHECK (status IN ('open', 'fixed')),
  created_at INTEGER NOT NULL,
  fixed_at INTEGER,
  CHECK ((question_position IS NULL) <> (line_position IS NULL)),
  UNIQUE (account_id, code)
);

ALTER TABLE learner_settings ADD COLUMN show_translations INTEGER NOT NULL DEFAULT 1;
