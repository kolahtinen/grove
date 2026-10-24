// The database: one SQLite file in WAL mode with synchronous=FULL, so a save grove has confirmed
// survives a power cut (FR-002, research R3).

const originalEmitWarning = process.emitWarning;
process.emitWarning = function emitWarning(warning, ...rest) {
  const text = typeof warning === 'string' ? warning : warning?.message;
  const type = typeof rest[0] === 'string' ? rest[0] : rest[0]?.type;
  if (type === 'ExperimentalWarning' && /SQLite/.test(text || '')) return;
  return originalEmitWarning.call(process, warning, ...rest);
};

const { DatabaseSync } = await import('node:sqlite');

export function openDb(path) {
  const db = new DatabaseSync(path);
  db.exec('PRAGMA journal_mode = WAL');
  db.exec('PRAGMA synchronous = FULL');
  db.exec('PRAGMA foreign_keys = ON');
  db.exec('PRAGMA busy_timeout = 5000');
  return db;
}

// Runs fn in a transaction; nested calls become savepoints inside the outer one (G-07 applies the
// demo answer through G-02's accept path, which has its own transaction).
const depth = new WeakMap();

export function transaction(db, fn) {
  const level = depth.get(db) ?? 0;
  const savepoint = `sp_${level}`;
  db.exec(level === 0 ? 'BEGIN IMMEDIATE' : `SAVEPOINT ${savepoint}`);
  depth.set(db, level + 1);
  try {
    const result = fn();
    db.exec(level === 0 ? 'COMMIT' : `RELEASE ${savepoint}`);
    return result;
  } catch (error) {
    db.exec(level === 0 ? 'ROLLBACK' : `ROLLBACK TO ${savepoint}`);
    if (level > 0) db.exec(`RELEASE ${savepoint}`);
    throw error;
  } finally {
    depth.set(db, level);
  }
}
