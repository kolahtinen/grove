// Runs grove's start-up loads (G-01 FR-032, research R14): one after another, in steps, with a turn of
// the event loop between steps so the server answers meanwhile, and reports how far they have got.
const tick = () => new Promise((resolve) => setImmediate(resolve));

export function createStartup({ loads, log }) {
  const total = loads.reduce((sum, load) => sum + load.size, 0);
  let done = 0;
  let ready = false;
  let stopped = false;

  return {
    // { ready, progress }: progress is the lines and rows done over the total (1 when there are none).
    state() {
      return { ready, progress: total === 0 ? 1 : Math.min(1, done / total) };
    },
    get ready() { return ready; },
    async run() {
      for (const load of loads) {
        try {
          for await (const n of load.steps()) {
            done += n;
            if (stopped) return;
            await tick();
          }
        } catch (error) {
          // A lookup finishes a load that didn't (FR-222), so grove carries on.
          log?.('error', 'start-up load failed', { load: load.name, code: error?.code || error?.name || 'Error' });
        }
      }
      done = total;
      ready = true;
    },
    stop() { stopped = true; },
  };
}
