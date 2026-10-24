-- G-05 (specs/005-listening/plan.md): the learner's speech rate and whether the voice help was shown.

ALTER TABLE learner_settings ADD COLUMN speech_rate REAL NOT NULL DEFAULT 1 CHECK (speech_rate BETWEEN 0.5 AND 1.5);
ALTER TABLE learner_settings ADD COLUMN voice_help_shown INTEGER NOT NULL DEFAULT 0;
