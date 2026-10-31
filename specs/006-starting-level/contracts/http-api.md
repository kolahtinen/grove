# Contract: G-06 additions to grove's HTTP interface

All G-01 rules apply.

## Pages

| Path | Access | Notes |
|---|---|---|
| `/start` | agreed | the starting check |
| `/credits` | public | every outside source with its licence |

## API

| Method, path | Access | Body | Responses |
|---|---|---|---|
| `GET /api/start/sample?level=A2` | agreed | – | `200 {level, words: [{lemma, kind}] (≤ 30)}` · `400` bad level · `503 levels_unavailable` (no Kelly data) |
| `POST /api/start` | agreed | `{level: "A1"…"C2" \| "beginner", unknown: [string ≤80] ≤ 30}` | `200 {ground: n, leaves: n, suggestLower: bool}` · `403 not_for_reviewer` for the reviewer account (its own code, so it isn't mistaken for the role guard) |
| `GET /api/stages` | agreed | – | G-04's answer plus `needsStart: bool`, `startOpen: bool`, `canRestart: bool` — FR-605 (RQ-463): `needsStart` (Home sends the learner to `/start`) only until the starting level has been offered once; `startOpen` while no choice is made (Home's Progress row then offers it); both false for the reviewer |
| `POST /api/start/offered` | agreed | `{}` | `200 {}`: the starting level was offered (the `/start` page calls it on opening), so Home no longer sends the learner there (migration 021's `learner_settings.start_offered`) |
