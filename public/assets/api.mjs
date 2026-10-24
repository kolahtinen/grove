// Calls grove's API (contracts/http-api.md): every change carries the CSRF token; error answers
// become plain messages, always shown as text (constitution 4.6, 4.7).

let token = null;

export async function prepare() {
  const res = await fetch('/api/csrf', { credentials: 'same-origin' });
  token = (await res.json()).csrf;
}

// The signed-in account, or null; always reads the answer body.
export async function getMe() {
  const res = await fetch('/api/me', { credentials: 'same-origin' });
  const body = await res.json().catch(() => null);
  if (res.status !== 200 || !body) return null;
  token = body.csrf;
  return body;
}

export async function post(path, body) {
  if (!token) await prepare();
  let res;
  try {
    res = await fetch(path, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'content-type': 'application/json', 'x-csrf-token': token },
      body: JSON.stringify(body),
    });
  } catch {
    return { ok: false, status: 0, data: {}, message: 'Grove can’t be reached right now. Check your connection and try again.' };
  }
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data, message: typeof data.message === 'string' ? data.message : 'Something went wrong. Please try again.' };
}

export function showMessage(element, text, kind = 'bad') {
  element.textContent = text;
  element.className = `message ${kind}`;
  element.hidden = !text;
}
