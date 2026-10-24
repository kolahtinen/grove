// The fix-it and meanings prompts (FR-206, FR-207, research R5).
import { describeProblem } from './check.mjs';

export function buildFixPrompt(problems, code) {
  const lines = problems.map((p, i) => `${i + 1}. ${describeProblem(p)}`);
  const resend = problems.some((p) => ['cut_off', 'not_json', 'no_json'].includes(p.kind))
    ? 'Please send the whole JSON block again, complete, with every text.'
    : 'Please fix only these problems and keep everything else the same.';
  return [
    `Thanks! grove found some problems in your answer for part "${code}":`,
    lines.join('\n'),
    resend,
    `Reply with the whole corrected JSON block, in exactly the same format as before (with "part": "${code}"), and nothing else.`,
  ].join('\n\n');
}

export function buildMeaningsPrompt(forms) {
  return [
    "I'm learning Swedish with grove. Please give the meaning of each of these Swedish words as they were used in the texts you just wrote:",
    forms.join(', '),
    'For each word give its dictionary form, a short English meaning and a simple Swedish explanation using very common words.',
    'Reply with ONLY one ```json code block in this format, and no other text:\n```json\n{ "meanings": [ { "form": "as written", "lemma": "dictionary form", "en": "short English meaning", "explain_sv": "enkel förklaring" } ] }\n```',
  ].join('\n\n');
}
