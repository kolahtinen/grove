// Runs grove on localhost with the fake Firebase and fake GitHub and a temporary data folder, and
// creates the owner and reviewer accounts of dev-accounts.mjs (npm run dev; Playwright's server).
import { startTestGrove } from './harness.mjs';
import { applyDemo } from '../../server/demo/apply.mjs';
import { OWNER, REVIEWER, HTMLISH } from './dev-accounts.mjs';

const portArg = process.argv.indexOf('--port');
const port = portArg > 0 ? Number(process.argv[portArg + 1]) : 8787;

const t = await startTestGrove({ port, host: 'localhost', levels: true });
t.seedAccount({ ...OWNER, role: 'owner' });
const reviewer = t.seedAccount({ ...REVIEWER, role: 'reviewer' });
// The reviewer starts as the demo learner, as reviewer:setup does (G-07).
applyDemo({ db: t.grove.db, accountId: reviewer.id });
t.seedAccount({ ...HTMLISH });
console.log(`grove (fakes) on http://localhost:${port}`);
console.log(`  owner:    ${OWNER.email} / ${OWNER.password}`);
console.log(`  reviewer: ${REVIEWER.email} / ${REVIEWER.password}`);

const stop = async () => { await t.close(); process.exit(0); };
process.on('SIGTERM', stop);
process.on('SIGINT', stop);
