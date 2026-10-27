import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  // One worker: the WebGL scene is heavy, and the machine is shared.
  workers: 1,
  use: {
    baseURL: 'http://localhost:1885',
    locale: 'fr-FR',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', testDir: './tests/e2e', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:1885',
    reuseExistingServer: !process.env.CI,
  },
})
