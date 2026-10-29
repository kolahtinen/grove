// Starts grove: config, store, web server, the start-up loads (FR-032) and the hourly job.
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadConfig } from './config.mjs';
import { openDb } from './store/db.mjs';
import { migrate } from './store/migrate.mjs';
import { importGroveTexts } from './library/library.mjs';
import { createSeclog } from './seclog/seclog.mjs';
import { createFirebase } from './firebase/client.mjs';
import { createApp } from './web/app.mjs';
import { listen } from './web/http.mjs';
import { hourlyJob } from './jobs.mjs';
import { kellyLoad } from './levels/import.mjs';
import { lexiconLoad } from './lexicon/lexicon.mjs';
import { examplesLoad } from './reading/dictionary.mjs';
import { createStartup } from './startup.mjs';

const HOUR = 60 * 60 * 1000;

export function openStore(config) {
  mkdirSync(config.dataDir, { recursive: true });
  const db = openDb(join(config.dataDir, 'grove.db'));
  migrate(db);
  return db;
}

export function createGrove(config, { now = () => Date.now(), fetchImpl, loads } = {}) {
  const db = openStore(config);
  // The common library's grove texts, when the build's file is new or changed (G-09 FR-916).
  importGroveTexts(db);
  const seclog = createSeclog({ db, logDir: join(config.dataDir, 'logs'), now });
  // The word list always; the Kelly import unless a test server skips it (config.importLevels false);
  // the examples of words met before migration 012, once (G-03 FR-316).
  const startup = createStartup({
    loads: loads ?? [lexiconLoad(), ...(config.importLevels !== false ? [kellyLoad({ db, seclog })] : []), examplesLoad({ db })],
    log: seclog.app,
  });
  const firebase = createFirebase(config.firebase, { now, ...(fetchImpl ? { fetchImpl } : {}) });
  const app = createApp({ config, db, seclog, firebase, now, startup });
  let server = null;
  let timer = null;
  let markReady;
  const ready = new Promise((resolve) => { markReady = resolve; });

  return {
    config, db, seclog, firebase, app, startup,
    // Resolves once every start-up load has finished and the hourly job has started.
    ready,
    // Listens first, then runs the start-up loads while the server answers (FR-032).
    async start(port = config.port, { pidFile = false } = {}) {
      server = await listen(app.handler, port);
      // Lets backup:restore see that grove is running.
      if (pidFile) writeFileSync(join(config.dataDir, 'grove.pid'), String(process.pid));
      startup.run().then(() => {
        if (!startup.ready) return;
        timer = setInterval(() => hourlyJob({ config, db, seclog, sessions: app.sessions, now }), HOUR);
        timer.unref();
        markReady();
      });
      return server.address().port;
    },
    async stop() {
      startup.stop();
      clearInterval(timer);
      rmSync(join(config.dataDir, 'grove.pid'), { force: true });
      if (server) await new Promise((resolve) => { server.closeAllConnections(); server.close(resolve); });
      db.close();
    },
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const grove = createGrove(loadConfig(process.env, { role: 'web' }));
  const port = await grove.start(undefined, { pidFile: true });
  grove.seclog.app('info', 'grove started', { url: `http://127.0.0.1:${port}` });
  grove.ready.then(() => grove.seclog.app('info', 'grove ready', {}));
  const shutdown = async () => { await grove.stop(); process.exit(0); };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}
