import { defineConfig } from '@playwright/test'

// Runs against the production build: the service worker exists only there
export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:4173/weatherly-app/',
    // The installed Chrome (GitHub runners have it too): no browser download
    channel: 'chrome',
    locale: 'uk-UA',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run build && npm run preview -- --port 4173 --strictPort',
    timeout: 120_000,
    url: 'http://localhost:4173/weatherly-app/',
    reuseExistingServer: !process.env.CI,
  },
})
