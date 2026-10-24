// Runs grove on localhost with the fake Firebase and fake GitHub and a temporary data folder, and
// creates the owner and reviewer accounts of dev-accounts.mjs (npm run dev; Playwright's server).
import { startTestGrove } from './harness.mjs';
import { OWNER, REVIEWER, HTMLISH } from './dev-accounts.mjs';

const portArg = process.argv.indexOf('--port');
const port = portArg > 0 ? Number(process.argv[portArg + 1]) : 8787;

const t = await startTestGrove({ port, host: 'localhost' });
t.seedAccount({ ...OWNER, role: 'owner' });
t.seedAccount({ ...REVIEWER, role: 'reviewer' });
t.seedAccount({ ...HTMLISH });
console.log(`grove (fakes) on http://localhost:${port}`);
console.log(`  owner:    ${OWNER.email} / ${OWNER.password}`);
console.log(`  reviewer: ${REVIEWER.email} / ${REVIEWER.password}`);

const stop = async () => { await t.close(); process.exit(0); };
process.on('SIGTERM', stop);
process.on('SIGINT', stop);
