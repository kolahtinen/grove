-- Addendum 003 (G-04 FR-418; RQ-415, RQ-412, RQ-411): Swedish has one drill list, To remember. Every
-- To read mark becomes To remember with its schedule; the marks a word had when it fell are kept (FR-413).
-- A Speak words setting (on); the translations setting is withdrawn (G-03 FR-301, FR-305).
UPDATE words SET to_remember = 1, to_read = 0 WHERE to_read = 1;
ALTER TABLE learner_settings ADD COLUMN speak_words INTEGER NOT NULL DEFAULT 1 CHECK (speak_words IN (0, 1));
ALTER TABLE learner_settings DROP COLUMN show_translations;
