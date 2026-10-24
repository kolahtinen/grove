# __APP__

This app is built with the prototype-to-spec process. Where it stands: `docs/STATUS.md`.

## How we work

- When you need decisions from me, ask multiple-choice questions in Claude Code as in `/questions` (instructions in `~/.claude/commands/questions.md`): one question per call, explanations in the option previews, answers saved in `question-pages/`. Inside Spec Kit, use only its clarify step.
- Templates: `docs/templates/`.
- Phases 1–2 use the `/pre.*` commands; phase 3 uses Spec Kit's `/speckit.*` commands; changes after the first build use `/regenerate <module>`.

## Rules

- `prototypes/` is throwaway and read-only once the middle-steps document is frozen. Never copy code from it into the build.
- In phase 1, build prototype code only when I say yes.
- Needs are never edited or deleted; a wrong one is withdrawn with a reason. When a requirement isn't feasible, reduce the requirement, never the need.
- `docs/middle-steps.md` is frozen once phase 2 ends. Risky new needs get an addendum in `docs/addenda/` (`/pre.addendum`).
- After phase 3 starts, **the spec is the source**: never edit generated code by hand, not even while debugging. Change the spec, then `/regenerate <module>`.
- Tests stay fixed; a test changes only when its spec rule changes.
- Every spec requirement names the combined requirements (RQ-…) and need IDs it comes from; tests are named after requirement IDs.
- Whenever a Spec Kit plan adds or changes modules, test commands or dependencies, update `docs/modules.md`.
