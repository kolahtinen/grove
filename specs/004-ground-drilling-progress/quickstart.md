# Quickstart: validating G-04

Interfaces: [http-api](contracts/http-api.md); data: [data-model](data-model.md); decisions: [research](research.md).

## 1. Automated tests

```sh
npm test          # includes tests/drill/ and the extended reading and texts tests
npm run test:e2e  # includes marking, review, master, leaves, progress
npm run check     # FR-401…FR-419 traced
```

## 2. Local run (`npm run dev`)

| Step | Expected |
|---|---|
| First visit to Home | the welcome card; dismiss it and it stays gone |
| Add a sample part, read a text, rate it | the marking step lists its new words with To read / To remember switches |
| Switch on To read for 2 words (one also To remember), Done | 2 drilled leaves; the others in the ground; the next prompt lists them as known |
| Home | Review shows 0 due today (gaps start at 1 day); Master shows 0 |
| Move the clock a day (dev: `?now=` is not available; use the unit tests) | — |
| Word menu on a ground word | To read / To remember switches, Pick up, times met |
| Let it fall on a leaf | a meaning question; right → it falls |
| Leaves | drilled leaves by mark; add "kanelbulle"; delete one |
| Progress | today's minutes after reading for a minute or two |
