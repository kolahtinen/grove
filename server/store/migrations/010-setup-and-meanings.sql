-- foreign-keys-off
-- G-02 migration 010 (specs/002-texts-from-own-ai/data-model.md; addendum 002): setup prompts,
-- reading and listening texts, per-text checking, where meanings come from, own-text AI rounds.
-- exchanges is rebuilt for its new kinds and keeps its ids.

ALTER TABLE words ADD COLUMN en_source TEXT CHECK (en_source IN ('ai', 'dictionary', 'learner'));
UPDATE words SET en_source = 'ai' WHERE en IS NOT NULL;

ALTER TABLE packages ADD COLUMN code TEXT;
ALTER TABLE packages ADD COLUMN summary TEXT;
ALTER TABLE packages ADD COLUMN one_text INTEGER NOT NULL DEFAULT 0;
ALTER TABLE packages ADD COLUMN fail_streak INTEGER NOT NULL DEFAULT 0;

CREATE TABLE exchanges_new (
  id INTEGER PRIMARY KEY,
  account_id INTEGER NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
  package_id INTEGER REFERENCES packages (id) ON DELETE CASCADE,
  part_no INTEGER CHECK (part_no BETWEEN 1 AND 3),
  kind TEXT NOT NULL CHECK (kind IN ('part', 'package', 'redo', 'fix', 'meanings', 'meanings_fix', 'own')),
  code TEXT NOT NULL,
  carries_summary INTEGER NOT NULL DEFAULT 0,
  fixes_id INTEGER REFERENCES exchanges (id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('waiting', 'needs_fix', 'accepted', 'replaced')),
  answer_hash TEXT,
  created_at INTEGER NOT NULL,
  answered_at INTEGER,
  asked_forms TEXT,
  steps TEXT,
  asks TEXT,
  held TEXT,
  text_id INTEGER REFERENCES texts (id) ON DELETE CASCADE
);
INSERT INTO exchanges_new (id, account_id, package_id, part_no, kind, code, carries_summary, fixes_id, prompt, status, answer_hash, created_at, answered_at, asked_forms)
  SELECT id, account_id, package_id, part_no, kind, code, carries_summary, fixes_id, prompt, status, answer_hash, created_at, answered_at, asked_forms FROM exchanges;
DROP TABLE exchanges;
ALTER TABLE exchanges_new RENAME TO exchanges;
CREATE INDEX exchanges_account ON exchanges (account_id, status);

-- The separate meanings prompt is gone (FR-207): waiting ones are replaced.
UPDATE exchanges SET status = 'replaced' WHERE kind = 'meanings' AND status = 'waiting';

ALTER TABLE texts ADD COLUMN kind TEXT NOT NULL DEFAULT 'reading' CHECK (kind IN ('reading', 'listening'));
ALTER TABLE texts ADD COLUMN ready INTEGER NOT NULL DEFAULT 1 CHECK (ready IN (0, 1));
ALTER TABLE texts ADD COLUMN copyright_view TEXT CHECK (copyright_view IN ('free', 'unsure', 'copyrighted'));
ALTER TABLE texts ADD COLUMN copyright_note TEXT;
ALTER TABLE texts ADD COLUMN known_share REAL;

ALTER TABLE learner_settings ADD COLUMN whole_package INTEGER NOT NULL DEFAULT 0 CHECK (whole_package IN (0, 1));

-- Own texts: the AI's meaning of every word in the text, in context (G-03 FR-318).
CREATE TABLE text_meanings (
  account_id INTEGER NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
  text_id INTEGER NOT NULL REFERENCES texts (id) ON DELETE CASCADE,
  form TEXT NOT NULL,
  lemma TEXT NOT NULL,
  en TEXT NOT NULL,
  explain_sv TEXT,
  PRIMARY KEY (text_id, form)
);
