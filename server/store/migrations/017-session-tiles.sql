-- G-09 migration 017 (specs/009-home-sessions/data-model.md; addendum 006: FR-903, FR-905, FR-906, FR-920,
-- FR-923): a session's Learning tile, skill, Harder questions only and the short-session offer. Columns
-- are added, not rebuilt; the rows already there are filled from their kind and params.
ALTER TABLE practice_sessions ADD COLUMN tile TEXT CHECK (tile IN ('discover', 'review', 'mix'));
ALTER TABLE practice_sessions ADD COLUMN skill TEXT CHECK (skill IN ('mix', 'reading', 'listening', 'words', 'grammar'));
ALTER TABLE practice_sessions ADD COLUMN hard_only INTEGER NOT NULL DEFAULT 0 CHECK (hard_only IN (0, 1));
ALTER TABLE practice_sessions ADD COLUMN offer TEXT;

UPDATE practice_sessions SET
  tile = CASE
    WHEN kind = 'mode' AND json_extract(params, '$.mode') = 'discover' THEN 'discover'
    WHEN kind = 'mode' THEN 'review'
    ELSE 'mix'
  END,
  skill = CASE
    WHEN kind = 'skill' AND json_extract(params, '$.skill') IN ('reading', 'listening', 'words', 'grammar')
      THEN json_extract(params, '$.skill')
    ELSE 'mix'
  END,
  hard_only = CASE WHEN kind = 'mode' AND json_extract(params, '$.mode') = 'master' THEN 1 ELSE 0 END;
