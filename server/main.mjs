// Starts grove: config, store, web server, and the hourly job.
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadConfig } from './config.mjs';
import { openDb } from './store/db.mjs';
import { migrate } from './store/migrate.mjs';
import { createSeclog } from './seclog/seclog.mjs';
import { createFirebase } from './firebase/client.mjs';
import { createApp } from './web/app.mjs';
import { listen } from './web/http.mjs';
import { hourlyJob } from './jobs.mjs';
import { importKelly } from './levels/import.mjs';

const HOUR = 60 * 60 * 1000;

export function openStore(config) {
  mkdirSync(config.dataDir, { recursive: true });
  const db = openDb(join(config.dataDir, 'grove.db'));
  migrate(db);
  return db;
}

export function createGrove(config, { now = () => Date.now(), fetchImpl } = {}) {
  const db = openStore(config);
  const seclog = createSeclog({ db, logDir: join(config.dataDir, 'logs'), now });
  // Test servers skip the import unless asked (config.importLevels false); real installs always import.
  if (config.importLevels !== false) importKelly({ db, seclog });
  const firebase = createFirebase(config.firebase, { now, ...(fetchImpl ? { fetchImpl } : {}) });
  const app = createApp({ config, db, seclog, firebase, now });
  let server = null;
  let timer = null;

  return {
    config, db, seclog, firebase, app,
    async start(port = config.port, { pidFile = false } = {}) {
      server = await listen(app.handler, port);
      // Lets backup:restore see that grove is running.
      if (pidFile) writeFileSync(join(config.dataDir, 'grove.pid'), String(process.pid));
      timer = setInterval(() => hourlyJob({ config, db, seclog, sessions: app.sessions, now }), HOUR);
      timer.unref();
      return server.address().port;
    },
    async stop() {
      clearInterval(timer);
      rmSync(join(config.dataDir, 'grove.pid'), { force: true });
      if (server) await new Promise((resolve) => { server.closeAllConnections(); server.close(resolve); });
      db.close();
    },
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const grove = createGrove(loadConfig());
  const port = await grove.start(undefined, { pidFile: true });
  grove.seclog.app('info', 'grove started', { url: `http://127.0.0.1:${port}` });
  const shutdown = async () => { await grove.stop(); process.exit(0); };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}
