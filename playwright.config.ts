import { defineConfig, devices } from '@playwright/test';

const backendUrl = 'http://localhost:3001';
const frontendUrl = 'http://localhost:5173';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: frontendUrl,
    trace: 'on-first-retry',
    timezoneId: 'Europe/Moscow',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'npm --prefix backend run dev',
      url: `${backendUrl}/owner`,
      reuseExistingServer: false,
      timeout: 120_000,
    },
    {
      command: `VITE_API_BASE_URL=${backendUrl} npm --prefix frontend run dev -- --host localhost --port 5173`,
      url: frontendUrl,
      reuseExistingServer: false,
      timeout: 120_000,
    },
  ],
});
