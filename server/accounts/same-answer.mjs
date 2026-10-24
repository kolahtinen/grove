// Holds sign-in and reset answers until a fixed time has passed, so their timing doesn't reveal
// whether an address has an account (FR-012, RQ-372, research R5).

export async function holdUntil(startedAt, minMs, now = () => Date.now()) {
  const wait = startedAt + minMs - now();
  if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
}

export function normaliseEmail(email) {
  return String(email).trim().toLowerCase();
}
