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
| `POST /api/start` | agreed | `{level: "A1"…"C2" \| "beginner", unknown: [string ≤80] ≤ 30}` | `200 {ground: n, leaves: n, suggestLower: bool}` · `403 forbidden` for the reviewer account |
| `GET /api/stages` | agreed | – | G-04's answer plus `needsStart: bool`, `canRestart: bool` |
