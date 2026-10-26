// A local stand-in for GitHub's contents API for one repository's files (research R10).
import { createServer } from 'node:http';
import { createHash } from 'node:crypto';

export async function startFakeGithub({ repo = 'owner/grove', token = 'test-github-token', readme = '# grove\n\n<!-- grove-link -->\n<!-- /grove-link -->\n' } = {}) {
  const files = new Map([['README.md', readme]]);
  // `gate`: { method, promise } holds the next request with that method until the promise settles.
  const state = { failing: 0, writes: [], requests: [], gate: null };
  const sha = (text) => createHash('sha1').update(text).digest('hex');

  const server = createServer(async (req, res) => {
    let raw = '';
    for await (const chunk of req) raw += chunk;
    state.requests.push({ method: req.method, url: req.url });
    if (state.gate && state.gate.method === req.method) { const { promise } = state.gate; state.gate = null; await promise; }
    const send = (status, body) => { res.writeHead(status, { 'content-type': 'application/json' }); res.end(JSON.stringify(body)); };
    if (state.failing > 0) { state.failing -= 1; return send(503, { message: 'unavailable' }); }
    if (req.headers.authorization !== `Bearer ${token}`) return send(401, { message: 'Bad credentials' });
    const m = req.url.match(/^\/repos\/([^/]+\/[^/]+)\/contents\/(.+)$/);
    if (!m || m[1] !== repo) return send(404, { message: 'Not Found' });
    const path = decodeURIComponent(m[2]);
    if (req.method === 'GET') {
      if (!files.has(path)) return send(404, { message: 'Not Found' });
      const text = files.get(path);
      return send(200, { path, sha: sha(text), content: Buffer.from(text).toString('base64'), encoding: 'base64' });
    }
    if (req.method === 'PUT') {
      const body = JSON.parse(raw);
      if (files.has(path) && body.sha !== sha(files.get(path))) return send(409, { message: 'sha mismatch' });
      const text = Buffer.from(body.content, 'base64').toString('utf8');
      files.set(path, text);
      state.writes.push({ path, text, at: Date.now() });
      return send(200, { content: { path, sha: sha(text) } });
    }
    return send(405, { message: 'Method Not Allowed' });
  });

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  return {
    apiUrl: `http://127.0.0.1:${server.address().port}`,
    repo,
    token,
    files,
    state,
    close: () => new Promise((resolve) => { server.closeAllConnections(); server.close(resolve); }),
  };
}
