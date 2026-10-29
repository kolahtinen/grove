-- G-02 migration 018 (specs/002-texts-from-own-ai/data-model.md; FR-202 as amended by addendum 006,
-- B-23): a package started from G-09's short-session offer for one kind asks only for that kind.
ALTER TABLE packages ADD COLUMN only_kind TEXT CHECK (only_kind IN ('reading', 'listening'));
