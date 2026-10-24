// Starts grove against the fake Firebase and fake GitHub in a temporary data folder, with a small
// HTTP client that keeps cookies and sends CSRF tokens like the browser pages do.
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { startFakeFirebase } from './fake-firebase.mjs';
import { startFakeGithub } from './fake-github.mjs';
import { makeConfig } from '../../server/config.mjs';
import { createGrove } from '../../server/main.mjs';

export const PASSWORD = 'Forest-walk-42';

export async function startTestGrove({ answerMinMs = 0, now, host = '127.0.0.1', port = 0, levels = false } = {}) {
  const fb = await startFakeFirebase();
  const gh = await startFakeGithub();
  const dir = mkdtempSync(join(tmpdir(), 'grove-test-'));
  const config = makeConfig({
    port,
    dataDir: join(dir, 'data'),
    backupDir: join(dir, 'backup'),
    answerMinMs,
    importLevels: levels,
    firebase: {
      projectId: fb.projectId,
      apiKey: fb.apiKey,
      authUrl: fb.authUrl,
      tokenUrl: fb.tokenUrl,
      certsUrl: fb.certsUrl,
      serviceAccount: fb.serviceAccount,
    },
    github: { apiUrl: gh.apiUrl, repo: gh.repo, token: gh.token },
  });
  const grove = createGrove(config, now ? { now } : {});
  const boundPort = await grove.start(port);
  const base = `http://${host}:${boundPort}`;

  // Adds an account straight into Firebase and grove (the owner commands do this from US4 on).
  function seedAccount({ email, password = PASSWORD, role = 'learner' }) {
    const user = fb.addUser(email, password);
    const info = grove.db.prepare('INSERT INTO accounts (firebase_uid, email, is_owner, is_reviewer, created_at) VALUES (?, ?, ?, ?, ?)')
      .run(user.uid, email.toLowerCase(), role === 'owner' ? 1 : 0, role === 'reviewer' ? 1 : 0, Date.now());
    return { id: Number(info.lastInsertRowid), uid: user.uid, email: email.toLowerCase(), password };
  }

  function client() {
    const jar = new Map();
    let csrf = null;
    async function request(method, path, { body, raw, headers = {}, origin = base, sendCsrf = true } = {}) {
      const h = { ...headers };
      if (jar.size) h.cookie = [...jar].map(([k, v]) => `${k}=${v}`).join('; ');
      if (method !== 'GET' && method !== 'HEAD') {
        if (origin) h.origin = origin;
        if (sendCsrf && csrf) h['x-csrf-token'] = csrf;
        if (body !== undefined) h['content-type'] = 'application/json';
      }
      const response = await fetch(base + path, {
        method, headers: h, redirect: 'manual',
        body: raw !== undefined ? raw : body !== undefined ? JSON.stringify(body) : undefined,
      });
      for (const line of response.headers.getSetCookie()) {
        const [pair, ...attrs] = line.split(';');
        const i = pair.indexOf('=');
        const name = pair.slice(0, i).trim();
        const value = pair.slice(i + 1).trim();
        if (attrs.some((a) => /max-age=0/i.test(a.trim()))) jar.delete(name);
        else jar.set(name, value);
      }
      const text = await response.text();
      let json = null;
      try { json = JSON.parse(text); } catch { json = null; }
      if (json && typeof json.csrf === 'string') csrf = json.csrf;
      return { status: response.status, headers: response.headers, body: json, text, cookies: response.headers.getSetCookie() };
    }
    return {
      jar,
      get: (path, opts) => request('GET', path, opts),
      post: (path, body, opts = {}) => request('POST', path, { ...opts, body }),
      request,
      async prepare() { return request('GET', '/api/csrf'); },
      async signIn(email, password = PASSWORD) {
        await request('GET', '/api/csrf');
        const res = await request('POST', '/api/signin', { body: { email, password } });
        if (res.status === 200) await request('GET', '/api/me');
        return res;
      },
      async signInAgreed(email, password = PASSWORD) {
        const res = await this.signIn(email, password);
        if (res.status !== 200) return res;
        await request('POST', '/api/agree', { body: { agreeTerms: true, confirmAge13: true } });
        return request('GET', '/api/me');
      },
      setCsrf(value) { csrf = value; },
    };
  }

  return {
    grove, fb, gh, config, base, dir, seedAccount, client,
    async close() {
      await grove.stop();
      await fb.close();
      await gh.close();
      rmSync(dir, { recursive: true, force: true });
    },
  };
}

// Puts dictionary forms into an account's ground (G-06 and G-07 do this for real learners).
export function seedGround(db, accountId, lemmas) {
  const stmt = db.prepare(`INSERT OR IGNORE INTO words (account_id, lemma, kind, state, added_at, fallen_at)
    VALUES (?, ?, 'word', 'ground', ?, ?)`);
  for (const lemma of lemmas) stmt.run(accountId, lemma.toLowerCase(), Date.now(), Date.now());
}
