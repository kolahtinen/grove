-- G-02 FR-207 (first-build review, finding 6): a meanings exchange stores the forms it asks about.
-- Existing meanings exchanges get them once from their prompt, whose second paragraph is the list.

ALTER TABLE exchanges ADD COLUMN asked_forms TEXT NULL;

UPDATE exchanges
SET asked_forms = '["' || replace(lower(
    substr(substr(prompt, instr(prompt, char(10) || char(10)) + 2), 1,
      instr(substr(prompt, instr(prompt, char(10) || char(10)) + 2), char(10) || char(10)) - 1)
  ), ', ', '","') || '"]'
WHERE kind = 'meanings' AND instr(prompt, char(10) || char(10)) > 0;
