# Threat model (STRIDE): grove (p0)

Draft from the short pass after the import (2026-10-20); accepted on question-pages/42. p0 has no server: the page, the learner's device and the learner's AI.

## Components and connections

learner ── browser page ── pack file on the device ⇄ learner's own AI chat (outside)

## Trust boundaries

- A pack file (from the AI, or anywhere) is untrusted input to the page.

## Threats

| ID | Component or connection | STRIDE | Threat | Handling | Mitigation | Goes to | Needs, requirements, risks |
|---|---|---|---|---|---|---|---|
| T-p0-01 | Pack file | T | A pack contains code or markup that runs when shown. | mitigate | Show all pack text as plain text (the page already builds elements safely). | constitution rule | PR-p0-02, 04 |
| T-p0-02 | Pack file | I | Anyone who gets the file can read the learner's history (the scrambling isn't protection). | accept | The file is the learner's own, kept on their device. | — | PR-p0-01, 08 |

## Accepted threats

| ID | Why accepted |
|---|---|
| T-p0-02 | The learner controls their own file. |
