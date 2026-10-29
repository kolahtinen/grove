-- G-09 migration 019 (specs/009-home-sessions/data-model.md; B-27, FR-924, FR-925): input minutes per kind,
-- and a leaf's picked-up time (the starting level's day is learner_settings.start_at, already kept).
-- Earlier minutes were all counted on text pages, so they count as reading.
ALTER TABLE input_days ADD COLUMN read_seconds INTEGER NOT NULL DEFAULT 0 CHECK (read_seconds BETWEEN 0 AND 57600);
ALTER TABLE input_days ADD COLUMN listen_seconds INTEGER NOT NULL DEFAULT 0 CHECK (listen_seconds BETWEEN 0 AND 57600);
UPDATE input_days SET read_seconds = seconds;
ALTER TABLE words ADD COLUMN picked_at INTEGER;
UPDATE words SET picked_at = added_at WHERE drilled = 1 OR fallen_at IS NOT NULL AND fell_marks IS NOT NULL;
