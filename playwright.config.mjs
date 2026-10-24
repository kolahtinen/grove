import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  testMatch: '**/*.spec.mjs',
  workers: 1,
  use: { baseURL: 'http://localhost:8788' },
  webServer: {
    command: 'node tests/fakes/dev-server.mjs --port 8788',
    url: 'http://localhost:8788/health',
    reuseExistingServer: false,
  },
  projects: [
    { name: 'phone', use: { ...devices['Desktop Chrome'], viewport: { width: 360, height: 780 } } },
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
  ],
});
