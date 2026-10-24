// Talks to grove's API: sends the CSRF token with every change, and turns error answers into plain
// messages (shown with textContent only, constitution 4.6).

let csrf = null;

export async function prepare() {
  const res = await fetch('/api/csrf', { credentials: 'same-origin' });
  const body = await res.json();
  csrf = body.csrf;
}

export function useToken(token) {
  csrf = token;
}

export async function getMe() {
  const res = await fetch('/api/me', { credentials: 'same-origin' });
  const me = await res.json().catch(() => null);
  if (res.status !== 200 || !me) return null;
  csrf = me.csrf;
  return me;
}

export async function post(path, body) {
  if (!csrf) await prepare();
  let res;
  try {
    res = await fetch(path, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'content-type': 'application/json', 'x-csrf-token': csrf },
      body: JSON.stringify(body),
    });
  } catch {
    return { ok: false, status: 0, message: 'Grove can’t be reached right now. Check your connection and try again.' };
  }
  let data = {};
  try { data = await res.json(); } catch { data = {}; }
  return { ok: res.ok, status: res.status, data, message: typeof data.message === 'string' ? data.message : 'Something went wrong. Please try again.' };
}

export function showMessage(element, text, kind = 'bad') {
  element.textContent = text;
  element.className = `message ${kind}`;
  element.hidden = !text;
}
