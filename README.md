# grove

grow from what you know

A language learning app built on comprehensible input: the learner reads and listens to texts they can almost fully understand, on things that interest them, and practises the words and grammar patterns they meet there. Texts come from a common library, from the learner's own AI chat (grove writes the prompts; the learner pastes the answers back), or from the learner's own texts. The demo has Swedish, with English as the support language.

Built for a course project on specification-driven, AI-assisted software construction.

## Try it

<!-- grove-link -->
<!-- /grove-link -->

The link above is kept up to date while grove is running. Reviewer account: given by the owner.

## Where things are

- `docs/report/report.md`: the course report (draft).
- `docs/STATUS.md`: where the project stands, with a changelog.
- `docs/requirements.md`, `docs/needs.md`: the combined requirements and the needs they serve.
- `specs/001…009/`: the Spec Kit specifications, one per user goal; the code is generated from them.
- `question-pages/`: every decision round, with the questions and the answers.
- `prototypes/`: the discovery prototypes (p0, p1) and the sketches.
- `server/`, `public/`: the app; `tests/`: unit and browser tests.

## Run it locally

Node 22 or later.

```sh
npm ci
npx playwright install chromium   # for the browser tests
npm run dev                       # http://localhost:8787 with fake sign-in
npm test                          # unit tests
npm run check                     # audit, secret scan, semgrep, requirement trace
```

Deployment: `deploy/SETUP.md`.
