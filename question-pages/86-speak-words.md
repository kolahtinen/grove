# 86 — "Speak words" in the word menu (B-21)

Asked 2026-10-29 in Claude Code, one at a time. Note B-21: "What the hell is 'speak words' when you open a words menu in a text?"

### 1. "Speak words" means: tapping a word also says it aloud. What should happen to it? (default: keep it, clearer label, Settings only)

- Keep, rename, Settings only (Recommended)
- Keep in the menu, renamed
- Drop the setting: tapping never speaks; ▶ in the menu
- Always speak, no setting

**Answer:** Always speak, no setting.

### 2. Every tap says the word. Should the word menu also have a ▶ to hear it again? (default: yes)

- Yes, a ▶ by the word (Recommended): no ▶ and nothing said on a device without a Swedish voice
- No

**Answer:** Yes, a ▶ by the word.

### F1. The new rule says every visible screen change gets a sketch first. This change is small. Sketch it, or straight to the spec? (default: straight to the spec)

- Straight to the spec (Recommended): and the skip list gains "a single control added, removed or renamed"
- Sketch it

**Answer:** Straight to the spec.

## Applied

RQ-412 (addendum 003) withdrawn: back to RQ-18, a tap always speaks. G-03 FR-305 (no setting; ▶ next to the word in the menu), G-09 FR-910 and its scenario (Settings without Speak words). `docs/sketching.md`'s skip list. The `learner_settings.speak_words` column stays, unused.
