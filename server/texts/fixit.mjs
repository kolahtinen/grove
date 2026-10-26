// The fix-it, redo and meanings fix-it prompts (FR-206, FR-207, research R5, R9, R11).
import { describeProblem } from './check.mjs';

// An answer grove couldn't read: the whole corrected block again.
export function buildFixPrompt(problems, code) {
  const lines = problems.map((p, i) => `${i + 1}. ${describeProblem(p)}`);
  const resend = problems.some((p) => ['cut_off', 'not_json', 'no_json'].includes(p.kind))
    ? 'Please send the whole JSON block again, complete, with every text.'
    : 'Please fix only these problems and keep everything else the same.';
  return [
    `Thanks! grove couldn't use your answer for "${code}":`,
    lines.join('\n'),
    resend,
    `Reply with the whole corrected JSON block, in exactly the same format as before (with "part": "${code}"), and nothing else.`,
  ].join('\n\n');
}

// One failed text, asked for again on its own with its problems quoted (FR-206, RQ-395).
export function buildRedoPrompt({ code, kind, partNo, problems, textWords }) {
  return [
    `Thanks! One ${kind} text in your answer didn't keep to the rules:`,
    problems.map((p, i) => `${i + 1}. ${describeProblem(p).replace(/^Text \d+: /, '')}`).join('\n'),
    `Please write one new ${kind} text for part ${partNo} instead, about ${textWords} words, on the same topic, keeping to all the rules from the start of this chat.`,
    `Reply with only the JSON block, with exactly one text and "part": "${code}".`,
  ].join('\n\n');
}

// New words with neither the AI's meaning nor a dictionary one (FR-207, RQ-397).
export function buildMeaningsFixPrompt(forms) {
  return [
    'Thanks! Your texts used these Swedish words without giving their meaning:',
    forms.join(', '),
    'For each word give its dictionary form, a short English meaning as used in your text, and a simple Swedish explanation using very common words.',
    'Reply with ONLY one ```json code block in this format, and no other text:\n```json\n{ "meanings": [ { "form": "as written", "lemma": "dictionary form", "en": "short English meaning", "explain_sv": "enkel förklaring" } ] }\n```',
  ].join('\n\n');
}
