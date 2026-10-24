# 56: Slogan, leaves and ground, and the explainer animation (phase 3)

Asked on 2026-10-24 after G-01's build, in Claude Code from the phone (explanations in the chat message). The owner asked for a slogan suggestion, for the app to use the terms "leaves" (saved words) and "ground" (where leaves fall when they mature, the basis of language skill), and for an animation in the logo's style that explains this.

Noted while asking: RQ-309 already sets the tagline 'grow from what you know'; the G-01 build shows an invented tagline ('read, listen, grow') that is in no spec.

## 1. Which slogan (tagline under the name)? (default: A)

- **A: grow from what you know** (RQ-309 as it is)
- **B:** A, plus 'every word a leaf' as the animation's line
- **C: every word a leaf**
- **D: one leaf at a time**

**Answer:** A. RQ-309 unchanged; the G-01 header gets it (G-01 spec FR-030 updated).

## 2. What is a leaf? (default: A)

- **A:** any saved word or phrase not yet in the ground (heard, read or drilled)
- **B:** A, plus ticked grammar patterns, which can fall to the ground too
- **C:** only words being drilled

**Answer:** B. Words, phrases and grammar patterns are leaves until they fall.

## 3. When does a leaf fall to the ground? (default: A)

- **A:** automatically at the 4-day point (RQ-60) or by choice at the retire check (RQ-15, RQ-16); patterns follow the same drilling rule; a fallen leaf can be picked up again
- **B:** automatically only
- **C:** A, plus a 'let it fall' button on any leaf at any time

**Answer:** C.

## 4. How are the saved-word lists named in the app? (default: A)

- **A:** one 'Leaves' collection, each leaf marked heard / read / both; 'Ground' for learned; text colours unchanged
- **B:** two lists, 'Heard leaves' and 'Read leaves'
- **C:** old names; leaves and ground only in the animation and help

**Answer (Other):** "A, but not heard/read but the first is something about learning or remembering and the next about reading." Asked which pair:

- **A:** Learning / Reading
- **B:** To remember / To read
- **C:** Remembering / Recognising

**Answer:** B. One **Leaves** collection; each leaf is marked **To remember**, **To read**, or both (replacing p0's 'Heard words' and 'Reading list'); learned words are in the **Ground**.

## 5. Is this storyboard right? (default: A)

About 10 seconds, drawn like the logo (2px rounded strokes in the accent colour):
1. The ground line draws; one tree rises (as the logo).
2. Leaves (the progress-dot leaf shape) bud on the branches, each with a short word (hej, bok, läsa). Caption: "Every word you save is a leaf."
3. One leaf ripens (green → amber), comes loose and drifts down onto the ground line. Caption: "When you know it, it falls to the ground."
4. More leaves fall; the ground line thickens into a layer of soil; the tree grows a little taller. Caption: "Your ground feeds everything you read next."
5. The logo's three trees appear with "grove · grow from what you know".
With reduced motion: the four frames as still pictures with the captions.

- **A:** yes, as described
- **B:** no word labels
- **C:** shorter (~5 s), no captions

**Answer:** A.

## 6. Where does the animation appear? (pick any)

- After agreeing (once per new sign-in, right after the terms, with Skip)
- Help page (top of the page explaining grove's terms, RQ-370, with replay)
- Empty home (while there are no leaves yet)
- Logo tap (tapping the top-bar logo plays it)

**Answer:** after agreeing, help page, logo tap.

## 7. When do the terms and the animation get built? (default: A)

- **A:** naming in all specs from G-02 on, the G-01 header slogan fixed now through its spec; the animation and help page in G-08 (first build if time allows, otherwise right after Sunday)
- **B:** build the animation next, before G-02
- **C:** all after Sunday

**Answer:** A.

## 8. Follow-up: does 'let it fall' check that you know the word first? (default: A)

Why asked: texts are written mostly from the ground and the level is estimated from it (RQ-03, RQ-34); an unchecked fall would put unknown words there.

- **A:** a quick check first: answer its meaning once; right → it falls, wrong → it stays a leaf; grammar patterns get a plain "Are you sure?"
- **B:** no check, but it can be picked up again
- **C:** no check, but marked 'let fall' and ignored by the level estimate until confirmed

**Answer:** A.

## Where this goes

- `docs/glossary.md`: grove's own terms, used by every spec from G-02 on and by the help page (RQ-370).
- G-01: FR-030's top bar shows the tagline of RQ-309; the client module is rebuilt from the spec (`/regenerate client`).
- G-02…G-04 specs: Leaves (To remember / To read), Ground, falling (RQ-60, RQ-15, RQ-16), 'let it fall' with its check (new), grammar patterns as leaves (new), replacing 'Heard words' and 'Reading list' (RQ-294 and others).
- G-08 spec: the animation (extends RQ-311) with the storyboard above, its three placements, reduced-motion frames (RQ-308), and the help page (RQ-370).
