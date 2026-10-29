-- Addendum 005 (G-01 FR-011, constitution 3.1 2.0.0): agreements per device and terms version. The
-- device value lives in an HttpOnly cookie; only its hash is kept. A sign-in on a device that agreed
-- to the current version records which agreement it relied on.
CREATE TABLE terms_agreements (
  id INTEGER PRIMARY KEY,
  account_id INTEGER NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
  device_hash TEXT NOT NULL,
  terms_version TEXT NOT NULL,
  agreed_at INTEGER NOT NULL,
  age_confirmed_at INTEGER NOT NULL
);
CREATE INDEX terms_agreements_device ON terms_agreements (account_id, device_hash, terms_version);
ALTER TABLE sessions ADD COLUMN terms_agreement_id INTEGER REFERENCES terms_agreements (id) ON DELETE SET NULL;

-- G-09 FR-921 (PD-03): whether the learner set the speech speed themselves; until then it follows the level.
ALTER TABLE learner_settings ADD COLUMN speech_rate_set INTEGER NOT NULL DEFAULT 0;
-- Existing learners who moved the slider away from 1× keep their speed.
UPDATE learner_settings SET speech_rate_set = 1 WHERE speech_rate <> 1;
