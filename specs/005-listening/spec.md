# Feature Specification: Listening (G-05)

**Feature Branch**: `main` (no feature branch; spec folder `specs/005-listening`)

**Created**: 2026-10-25

**Status**: Draft

**Input**: User description: "G-05: Listening. The feature description is the G-05 section of docs/middle-steps.md (Part 2: Feed for Spec Kit). Follow the combined requirements as written; every spec requirement names its RQ and N IDs."

**Sources**: `docs/middle-steps.md` (G-05 feed), `docs/requirements.md`, `docs/needs.md`, `docs/middle/feasibility.md` (F-13/X-02 speed where the voice allows; F-20/X-p1-02 voice check; F-357: the help text written from current documentation when the spec is written), `docs/middle/constraints.md` (C-03: the browser's built-in voices), `.specify/memory/constitution.md` v1.1.0. Builds on G-03 (speaking words, Play with highlighting) and G-04 (To remember reviews).

**Voice facts used** (checked 2026-10-25; readium.org "SpeechSynthesis in browsers and OSes", MDN): voices come from the device; Chrome loads them after the page (the `voiceschanged` event); Android may report the language as `sv_SE` with an underscore and Chrome on Android may list no voices at all; Chrome on iPhone uses Safari's voices; a voice may ignore the rate. No source confirmed a named Swedish voice per device, so the help text says where to add one, not which one ships.

**Requirement numbers**: FR-501… so test names stay unique across goals.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Listen to a text, sentence by sentence (Priority: P1)

The learner opens a text and taps **Listen**. The text is blurred; they press Play and hear the whole text with the device's Swedish voice, each sentence highlighted while it is read; any sentence can be replayed (with a play count) or looped; the text shows when they tap it or when listening ends, and then the text's questions follow.

**Why this priority**: Hearing the language is half of grove's input (N-03, N-42).

**Independent Test**: With a Swedish voice (or a test voice), Listen to a demo text: sentences are spoken in order and highlighted; replay one twice (count 2), loop one (it repeats until stopped); the text is blurred until tapped.

**Acceptance Scenarios**:

1. **Given** a device with a Swedish voice, **When** the learner plays a text, **Then** each sentence is read and highlighted while it's read. (RQ-20, RQ-21, RQ-198)
2. **Given** listening mode, **When** it starts, **Then** the text is blurred until the learner taps it or the text has been played through; the text's questions follow. (RQ-47, RQ-57, RQ-270)
3. **Given** a sentence, **When** the learner opens **Sentences** and replays it, **Then** it is read again and its play count goes up; each row starts with the sentence's number and up to its first three words; **When** they loop it, **Then** it repeats until stopped, and a Looping strip with Stop shows in the card after the sheet is closed. (RQ-14, RQ-197, RQ-467)

---

### User Story 2 - Set the speed (Priority: P1)

A slider sets the speech speed from 0.5× to 1.5× (1× at first), used everywhere grove speaks; a note under it says that how well it works depends on the device's voice.

**Why this priority**: Slower speech makes listening possible at lower levels (N-13).

**Acceptance Scenarios**:

1. **Given** the speed slider, **When** the learner sets it between 0.5× and 1.5×, **Then** the voice uses it where the device allows, it is kept for the learner, and a note says it depends on the device. (RQ-13, RQ-365; X-02)

---

### User Story 3 - No Swedish voice: say so, once, and how to get one (Priority: P1)

On a device without a Swedish voice, grove never reads Swedish with another language's voice; the first time listening is used, it says so once, with how to add a Swedish voice on the common systems.

**Why this priority**: An English voice reading Swedish teaches wrong sounds (N-03).

**Acceptance Scenarios**:

1. **Given** no Swedish voice, **When** listening is first used, **Then** grove says so once (kept for the learner), with how to add one on iPhone/iPad/Mac, Android, Windows and in Chrome or Edge on a computer, and doesn't read with another language's voice. (RQ-20, RQ-369)
2. **Given** voices that load after the page, **When** they arrive, **Then** grove uses the Swedish one without a reload. (edge case)

---

### Edge Cases

- The browser loads voices late (after page load). (feed)
- A voice ignores the rate setting: the note under the slider covers it (X-02). (feed)
- Android reports `sv_SE`: treated as Swedish.
- A long text played audio-only on a phone that locks: playback may stop; Play continues from the highlighted sentence.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-501** (RQ-20; N-03; C-03): Grove MUST speak Swedish only with a voice whose language is Swedish (`sv`, `sv-SE` or `sv_SE`), picking it when the voices arrive (also after the page has loaded); without one, it MUST NOT speak, everywhere grove speaks (word menu, Play, Review, Leaves).
- **FR-502** (RQ-20, RQ-369; N-03): Without a Swedish voice, the first time the learner uses listening grove MUST say so once (kept for the learner on the server), with how to add one: iPhone/iPad/Mac (Settings → Accessibility → Spoken Content → Voices → Swedish), Android (Settings → Text-to-speech → the speech engine's language data → Swedish), Windows (Settings → Time & language → Speech → add Swedish), and that Chrome and Edge on a computer often have Swedish voices online; the help stays reachable from the listening view.
- **FR-503** (RQ-13, RQ-365; N-37, N-03, N-13, N-02; X-02): A speed slider from 0.5× to 1.5× (step 0.1, 1× at first) MUST set the rate for all of grove's speech and be kept for the learner on the server; under it a note says that how well it works depends on the device's voice.
- **FR-504** (RQ-198, RQ-21; N-03, N-34; B-32, question-pages/90): **Listen** on a listening text MUST play the whole text audio-only, sentence by sentence, highlighting the sentence being read; Pause/Stop end it; Play continues from the highlighted sentence.
- **FR-505** (RQ-47, RQ-57; N-03, N-02): In listening mode the text MUST be blurred until the learner taps it or the whole text has been played; English is hidden until the text is shown.
- **FR-506** (RQ-14, RQ-467; N-37; B-33, question-pages/100): The listening card MUST have one **Sentences** button next to Play (`prototypes/sketches/2026-10-31-listening-sentences/`, version A), opening grove's bottom sheet (like the word menu; ✕, Esc, Back or the backdrop close it) with one row per sentence: its number, then up to its first three words and "…" when there are more ("2 · Elsa öppnar dörren…"), how many times it has been played in this listening session, **Replay** and **Loop**; the sheet stays open while replaying and lights the sentence playing. The same in a session's listening exercise (G-09 FR-933). Was: a row per sentence in the card.
- **FR-507** (RQ-197, RQ-467; N-03): Each sentence MUST be loopable (its Loop in the sheet): it repeats until the loop is turned off or another sentence is played; while it loops, the listening card shows a strip "Looping N · first words…" with **Stop**, also after the sheet is closed.
- **FR-508** (RQ-270; N-37): After listening, the text's comprehension questions MUST be offered (G-02's questions), making each text a listening passage.
- **FR-509** (RQ-393; N-37, N-42): A **listening** text (G-02 FR-202) MUST open in listening mode (FR-504, FR-505: audio first, the text blurred until tapped or played through); a reading text opens for reading, with no Listen (B-32, question-pages/90: "it's a reading session"; was: with Listen still offered). Added 2026-10-26 (addendum 002).

### Key Entities *(include if feature involves data)*

- **Learner settings** gain: speech rate (0.5–1.5), voice help shown (yes/no).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: On a device with a Swedish voice, Listen starts speaking within 1 second of Play.
- **SC-002**: On a device without one, grove never speaks Swedish with another voice, and shows the help once.
- **SC-003**: The speed set is used by every place grove speaks.

## Assumptions

- Voices are the device's built-in ones (C-03); grove can't install them.
- Regional varieties and voice choice (RQ-261) are not in the first build.
