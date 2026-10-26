# 69: A markdown-escaped copy of an AI answer (probe test, 2026-10-26)

Asked on 2026-10-26 in Claude Code, after the first probe-test results ([probe page](https://claude.ai/artifact/4C2BN2nSxTghozQ9ZAsEZ7); addendum 002): ChatGPT's answers to rounds B5 and B6 were good, but the copy arrived markdown-escaped (\`\`\` for the fence, a backslash at every line end, `&#x20;` for spaces), so grove couldn't read them. Undoing the escapes gave 6 passing texts.

## 1. FR-205: what should grove do with a markdown-escaped paste? (default: undo the escapes itself)

Why asked: learners will copy the rendered chat message instead of pressing the AI's copy button; it may be what broke ChatGPT on the owner's first test (O-09).

- **A:** undo the escapes (escaped characters, a backslash at a line end, HTML space codes) before reading; nothing changes for the learner
- **B:** undo them, and show a tip to use the AI's copy button
- **C:** refuse with that tip

**Answer:** A (the default). Done only when the paste can't be read as it is, and only for escapes that are never valid inside JSON, so a good paste is never changed.
