// The forms a prompt asks about, as stored with its exchange (G-02 FR-207, data model): trimmed,
// lower case, no repeats, in the order first asked.
export function askedForms(forms) {
  return [...new Set(forms.map((f) => String(f).trim().toLowerCase()).filter(Boolean))];
}
