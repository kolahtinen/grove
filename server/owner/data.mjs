// Export and delete one account's data, on request (FR-017, constitution 3.2, 3.3).
import { transaction } from '../store/db.mjs';
import { normaliseEmail } from '../accounts/same-answer.mjs';

// Secrets that never leave grove, even in an export.
const NOT_EXPORTED = new Set(['id_hash', 'csrf_token']);
// Security records outlive the account for 30 days (data-model.md).
const KEPT_TABLES = new Set(['security_log']);

function findAccount(db, email) {
  const account = db.prepare('SELECT * FROM accounts WHERE email = ?').get(normaliseEmail(email));
  if (!account) throw new Error('There is no account with that email.');
  return account;
}

function tablesWithAccountId(db) {
  return db.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all()
    .map((r) => r.name)
    .filter((name) => !KEPT_TABLES.has(name) && db.prepare(`PRAGMA table_info("${name}")`).all().some((c) => c.name === 'account_id'));
}

export function exportAccount({ db, seclog, email }) {
  const account = findAccount(db, email);
  const tables = {};
  for (const name of tablesWithAccountId(db)) {
    tables[name] = db.prepare(`SELECT * FROM "${name}" WHERE account_id = ?`).all(account.id)
      .map((row) => Object.fromEntries(Object.entries(row).filter(([key]) => !NOT_EXPORTED.has(key))));
  }
  seclog.security('export', { accountId: account.id });
  return { exportedAt: new Date().toISOString(), account, tables };
}

export async function deleteAccount({ db, seclog, firebase, email }) {
  const account = findAccount(db, email);
  transaction(db, () => {
    for (const name of tablesWithAccountId(db)) db.prepare(`DELETE FROM "${name}" WHERE account_id = ?`).run(account.id);
    db.prepare('DELETE FROM accounts WHERE id = ?').run(account.id);
  });
  seclog.security('delete', { accountId: account.id });
  await firebase.deleteUser(account.firebase_uid);
  return { id: account.id, email: account.email };
}
