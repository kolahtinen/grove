// The owner's commands (contracts/owner-cli.md). Run on the owner's computer as user grove.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createInterface } from 'node:readline';
import { loadConfig } from '../config.mjs';
import { openStore } from '../main.mjs';
import { createSeclog } from '../seclog/seclog.mjs';
import { createFirebase } from '../firebase/client.mjs';
import { createAccount } from './setup.mjs';
import { exportAccount, deleteAccount } from './data.mjs';
import { formatLog, formatAvailability, showReports } from './log.mjs';
import { backupNow, restoreBackup } from '../store/backup.mjs';

export function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const m = argv[i].match(/^--([a-z0-9-]+)$/);
    if (!m) throw new Error(`Unexpected argument: ${argv[i]}`);
    if (argv[i + 1] !== undefined && !argv[i + 1].startsWith('--')) { args[m[1]] = argv[i + 1]; i += 1; } else args[m[1]] = true;
  }
  return args;
}

// Asks for a password without showing it.
function askHidden(question) {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    rl._writeToOutput = (text) => { if (text.includes(question)) process.stdout.write(text); };
    rl.question(question, (answer) => { rl.close(); process.stdout.write('\n'); resolve(answer); });
  });
}

async function askPasswordTwice() {
  const first = await askHidden('Password: ');
  const second = await askHidden('Password again: ');
  if (first !== second) throw new Error('The two passwords are different.');
  return first;
}

function need(args, name) {
  if (typeof args[name] !== 'string' || !args[name]) throw new Error(`Please give --${name}.`);
  return args[name];
}

export async function run(command, argv) {
  const args = parseArgs(argv);
  const config = loadConfig(process.env, { role: 'web' });
  if (command === 'backup:restore') {
    if (args.yes !== true) throw new Error('This replaces grove’s database. Add --yes to go ahead.');
    restoreBackup({ dataDir: config.dataDir, file: need(args, 'file') });
    return 'Restored. Start grove again with: systemctl start grove';
  }
  const db = openStore(config);
  const seclog = createSeclog({ db, logDir: join(config.dataDir, 'logs') });
  const firebase = createFirebase(config.firebase);
  try {
    switch (command) {
      case 'owner:setup':
      case 'reviewer:setup': {
        const role = command === 'owner:setup' ? 'owner' : 'reviewer';
        const email = need(args, 'email');
        const password = await askPasswordTwice();
        const account = await createAccount({ db, seclog, firebase, role, email, password });
        return role === 'owner'
          ? `Owner account created for ${account.email}.`
          : `Reviewer account created for ${account.email}.\nNow write its email and password into the private repo's README.`;
      }
      case 'learner:export': {
        const data = exportAccount({ db, seclog, email: need(args, 'email') });
        const json = JSON.stringify(data, null, 2);
        if (typeof args.out === 'string') { writeFileSync(args.out, json, { mode: 0o600 }); return `Written to ${args.out}.`; }
        return json;
      }
      case 'learner:delete': {
        if (args.yes !== true) throw new Error('This deletes the account and all its data. Add --yes to go ahead.');
        const gone = await deleteAccount({ db, seclog, firebase, email: need(args, 'email') });
        return `Deleted ${gone.email} from Firebase and grove.`;
      }
      case 'log:show': {
        const hours = args.since === undefined ? 24 * 30 : Number(args.since);
        return formatLog(seclog.list({ sinceMs: Date.now() - hours * 3600000, event: typeof args.event === 'string' ? args.event : undefined }));
      }
      case 'availability:show': {
        const days = args.days === undefined ? 7 : Number(args.days);
        return formatAvailability(db.prepare('SELECT * FROM availability_checks WHERE at >= ? ORDER BY at').all(Date.now() - days * 86400000));
      }
      case 'reports:show':
        return showReports(db);
      case 'backup:now': {
        const { file } = backupNow({ db, backupDir: config.backupDir });
        return `Backup written and checked: ${file}`;
      }
      default:
        throw new Error(`Unknown command: ${command}`);
    }
  } finally {
    db.close();
  }
}

if (process.argv[1] && process.argv[1].endsWith('cli.mjs')) {
  const [command, ...rest] = process.argv.slice(2);
  run(command, rest).then(
    (out) => { console.log(out); process.exit(0); },
    (error) => { console.error(`grove: ${error.message}`); process.exit(1); },
  );
}
