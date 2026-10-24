# Quickstart: validating G-06

## 1. Automated tests

```sh
npm test          # includes tests/levels/
npm run test:e2e  # includes the starting check and credits
npm run check     # FR-601…FR-610 traced
```

## 2. Rebuilding the Kelly file (only when Språkbanken updates it)

```sh
curl -sSLO https://svn.spraakbanken.gu.se/sb-arkiv/pub/lexikon/kelly/kelly.xml
node scripts/build-kelly.mjs kelly.xml   # writes server/levels/kelly-sv.tsv
```

## 3. Local run (`npm run dev`)

| Step | Expected |
|---|---|
| Sign in as the owner (dev account), close the welcome | Starting level opens |
| Pick A2, tick 5 words, Confirm | Home shows "Level: A2"; Leaves → Unmarked lists the 5 |
| Set my starting level again → B1 | the starting words change; words learned from texts stay |
| Sign in as the reviewer | no starting check, no "Set my starting level again" |
| Open /credits signed out | the Kelly list and the font with their licences |
