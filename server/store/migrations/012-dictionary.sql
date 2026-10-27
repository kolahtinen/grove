-- G-03 FR-316 (question-pages/72; research R9): each word's example sentence is stored, so a page of
-- the dictionary is one query. Filled when sentences are stored; words met before this get theirs
-- once, as a start-up load (settings examples_filled).
ALTER TABLE words ADD COLUMN example_sentence_id INTEGER REFERENCES sentences (id) ON DELETE SET NULL;
CREATE INDEX words_account_kind_lemma ON words (account_id, kind, lemma);
