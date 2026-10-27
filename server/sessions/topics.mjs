// The Texts page's data (G-09 FR-909; research R11): the learner's texts by topic, unread first; own
// texts under "My own texts".
const BETA = (code) => !/^DEMO-/.test(code ?? '');

export function listTopics(db, accountId) {
  const rows = db.prepare(`SELECT t.id, t.title, t.topic, t.kind, t.own, t.read_at, t.ready, e.code FROM texts t
    LEFT JOIN exchanges e ON e.id = t.exchange_id WHERE t.account_id = ? ORDER BY t.id DESC`).all(accountId);
  const topics = new Map();
  for (const r of rows) {
    const topic = r.own ? '' : r.topic;
    if (!topics.has(topic)) topics.set(topic, { topic, label: topic || 'My own texts', texts: [] });
    topics.get(topic).texts.push({ id: r.id, title: r.title, kind: r.kind, read: !!r.read_at, ready: !!r.ready, own: !!r.own, beta: !!r.own || BETA(r.code) });
  }
  const list = [...topics.values()];
  for (const t of list) t.texts.sort((a, b) => (a.read - b.read) || (b.id - a.id));
  // Own texts last; topics with something unread first.
  return list.sort((a, b) => (!a.topic - !b.topic) || (b.texts.some((x) => !x.read) - a.texts.some((x) => !x.read)) || a.label.localeCompare(b.label, 'sv'));
}
