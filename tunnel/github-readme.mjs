// Replaces the text between two marker comments in the private repo's README through GitHub's
// contents API. It only ever touches README.md (constitution 4.8, research R10).

const PATH = 'README.md';

export async function updateReadmeBlock({ apiUrl, repo, token, start, end, content, fetchImpl = globalThis.fetch }) {
  const url = `${apiUrl}/repos/${repo}/contents/${PATH}`;
  const headers = { authorization: `Bearer ${token}`, accept: 'application/vnd.github+json', 'user-agent': 'grove' };
  const got = await fetchImpl(url, { headers, signal: AbortSignal.timeout(15000) });
  if (got.status !== 200) throw new Error(`README read failed (${got.status})`);
  const file = await got.json();
  const text = Buffer.from(String(file.content), 'base64').toString('utf8');
  const a = text.indexOf(start);
  const b = text.indexOf(end);
  if (a < 0 || b < a) throw new Error('README markers missing');
  const updated = `${text.slice(0, a + start.length)}\n${content}\n${text.slice(b)}`;
  if (updated === text) return false;
  const put = await fetchImpl(url, {
    method: 'PUT',
    headers: { ...headers, 'content-type': 'application/json' },
    body: JSON.stringify({ message: 'Update grove link', content: Buffer.from(updated).toString('base64'), sha: file.sha }),
    signal: AbortSignal.timeout(15000),
  });
  if (put.status !== 200 && put.status !== 201) throw new Error(`README write failed (${put.status})`);
  return true;
}
