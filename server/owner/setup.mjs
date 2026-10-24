// The owner's commands that make accounts: the owner's own and the one shared reviewer account.
// No page or route creates accounts (FR-010, FR-016).
import { FirebaseError } from '../firebase/client.mjs';
import { normaliseEmail } from '../accounts/same-answer.mjs';

export function passwordProblem(password) {
  if (typeof password !== 'string' || password.length < 8) return 'The password needs at least 8 characters.';
  if (password.length > 128) return 'The password can have at most 128 characters.';
  if (!/\p{L}/u.test(password)) return 'The password needs at least one letter.';
  if (!/\d/.test(password)) return 'The password needs at least one digit.';
  if (!/[^\p{L}\d]/u.test(password)) return 'The password needs at least one symbol.';
  return null;
}

export async function createAccount({ db, seclog, firebase, role, email, password, now = () => Date.now() }) {
  if (role !== 'owner' && role !== 'reviewer') throw new Error('role must be owner or reviewer');
  const address = normaliseEmail(email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) throw new Error('That is not an email address.');
  const problem = passwordProblem(password);
  if (problem) throw new Error(problem);
  const flag = role === 'owner' ? 'is_owner' : 'is_reviewer';
  if (db.prepare(`SELECT 1 FROM accounts WHERE ${flag} = 1`).get()) {
    throw new Error(role === 'owner' ? 'An owner already exists.' : 'A reviewer account already exists.');
  }
  if (db.prepare('SELECT 1 FROM accounts WHERE email = ?').get(address)) throw new Error('An account with that email already exists.');

  let uid;
  try {
    ({ uid } = await firebase.signUp(address, password));
  } catch (error) {
    if (error instanceof FirebaseError && error.code === 'email_exists') throw new Error('Firebase already has an account with that email.');
    if (error instanceof FirebaseError && error.code === 'unavailable') throw new Error('Firebase can’t be reached right now.');
    throw new Error('Firebase refused the account.');
  }
  const info = db.prepare(`INSERT INTO accounts (firebase_uid, email, ${flag}, created_at) VALUES (?, ?, 1, ?)`).run(uid, address, now());
  const id = Number(info.lastInsertRowid);
  seclog.security(role === 'owner' ? 'owner_setup' : 'account_created', { accountId: id, detail: { role } });
  return { id, email: address };
}
