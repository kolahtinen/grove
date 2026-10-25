// The owner's commands that make accounts: the owner's own and the one shared reviewer account.
// No page or route creates accounts (FR-010, FR-016).
import { FirebaseError } from '../firebase/client.mjs';
import { normaliseEmail } from '../accounts/same-answer.mjs';
import { transaction } from '../store/db.mjs';
import { applyDemo } from '../demo/apply.mjs';

export function passwordProblem(password) {
  if (typeof password !== 'string' || password.length < 8) return 'The password needs at least 8 characters.';
  if (password.length > 128) return 'The password can have at most 128 characters.';
  if (!/\p{L}/u.test(password)) return 'The password needs at least one letter.';
  if (!/\d/.test(password)) return 'The password needs at least one digit.';
  if (!/[^\p{L}\d]/u.test(password)) return 'The password needs at least one symbol.';
  return null;
}

export async function createAccount({ db, seclog, firebase, role, email, password, now = () => Date.now(), demo = applyDemo }) {
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
  // All-or-nothing: the row and (G-07) the reviewer's demo are stored together; if that fails,
  // the Firebase account is deleted again so the command can be run again (FR-010, FR-704, FR-705).
  let id;
  try {
    id = transaction(db, () => {
      const info = db.prepare(`INSERT INTO accounts (firebase_uid, email, ${flag}, created_at) VALUES (?, ?, 1, ?)`).run(uid, address, now());
      const accountId = Number(info.lastInsertRowid);
      if (role === 'reviewer') demo({ db, accountId, now });
      return accountId;
    });
  } catch (error) {
    try {
      await firebase.deleteUser(uid);
    } catch {
      throw new Error(`The account couldn’t be stored in grove (${error.message}), and removing it from Firebase failed too: delete ${address} in the Firebase console.`);
    }
    throw new Error(`The account couldn’t be stored in grove (${error.message}); nothing was kept, so you can run the command again.`);
  }
  seclog.security(role === 'owner' ? 'owner_setup' : 'account_created', { accountId: id, detail: { role } });
  return { id, email: address };
}
