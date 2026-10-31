-- G-09 migration 022 (specs/009-home-sessions/data-model.md; RQ-465, question-pages/97): a grammar pattern's
-- CEFR level and its ID in grove's grammar ladder, set from a grove text's patterns (G-09 FR-916) and shown
-- in the word menu (G-03 FR-305). NULL for words, phrases and an AI text's pattern; no row changes.

ALTER TABLE words ADD COLUMN level TEXT CHECK (level IS NULL OR level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2'));
ALTER TABLE words ADD COLUMN ladder TEXT;
