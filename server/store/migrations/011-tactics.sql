-- G-02 migration 011 (specs/002-texts-from-own-ai/data-model.md; FR-223, question-pages/70): the
-- learner's AI, its product and the tactic; a package keeps the tactic it started with.

ALTER TABLE learner_settings ADD COLUMN ai_family TEXT CHECK (ai_family IN ('chatgpt', 'gemini', 'claude', 'copilot', 'lechat', 'other'));
ALTER TABLE learner_settings ADD COLUMN ai_product TEXT;
ALTER TABLE learner_settings ADD COLUMN tactic TEXT NOT NULL DEFAULT 'steps' CHECK (tactic IN ('steps', 'long', 'whole'));
UPDATE learner_settings SET tactic = 'whole' WHERE whole_package = 1;

ALTER TABLE packages ADD COLUMN tactic TEXT CHECK (tactic IN ('steps', 'long', 'whole'));
